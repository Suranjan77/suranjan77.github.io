"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  advance,
  everyoneAnswered,
  hardestQuestions,
  joinPlayer,
  leavePlayer,
  newGame,
  questionSeconds,
  removePlayer,
  rerollName,
  revealAnswer,
  submitAnswer,
  syncConnected,
  topThree,
  viewFor,
  type GameState,
  type Standing,
} from "./game";
import { RelayClose, parsePlayerMessage } from "./protocol";
import { RelaySocket, relayBaseUrl, type SocketStatus } from "./relaySocket";
import { findSet, questionSets } from "./sets";
import { CHOICE_LABELS, type Question, type QuestionSet, type QuizImage } from "./types";
import { CHOICE_STYLES, ChoiceMark, QrCode, formatCode } from "./ui";

/**
 * The teacher's screen. It holds the whole game in this browser tab: the relay
 * only passes messages. The game is kept in this tab's sessionStorage so a
 * reload does not lose it; the browser discards that when the tab closes, and
 * ending the session deletes it at once.
 */

const STORAGE_KEY = "classroom-quiz-host";
/**
 * The teacher passcode. Kept for this tab only unless the teacher ticks
 * "Remember on this device", which puts it in localStorage: never on a shared
 * classroom computer.
 */
const PASSCODE_KEY = "classroom-quiz-teacher-passcode";

function loadPasscode(): { passcode: string; remembered: boolean } {
  try {
    const remembered = localStorage.getItem(PASSCODE_KEY);
    if (remembered) return { passcode: remembered, remembered: true };
    return { passcode: sessionStorage.getItem(PASSCODE_KEY) ?? "", remembered: false };
  } catch {
    return { passcode: "", remembered: false };
  }
}

function savePasscode(passcode: string | null, remember: boolean) {
  try {
    localStorage.removeItem(PASSCODE_KEY);
    sessionStorage.removeItem(PASSCODE_KEY);
    if (passcode) (remember ? localStorage : sessionStorage).setItem(PASSCODE_KEY, passcode);
  } catch {
    // Storage unavailable: the teacher types the passcode each time.
  }
}

type Room = { code: string; token: string };
type Saved = Room & { game: GameState };

function loadSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Saved) : null;
  } catch {
    return null;
  }
}

function writeSaved(saved: Saved | null) {
  try {
    if (saved) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // Storage unavailable: the game still runs, it just will not survive a reload.
  }
}

type Pushed = "all" | "none" | string[];

export default function HostApp() {
  const [base, setBase] = useState<string | null | undefined>(undefined);
  const [chosenSetId, setChosenSetId] = useState(questionSets[0].id);
  const [room, setRoom] = useState<Room | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [status, setStatus] = useState<SocketStatus>("closed");
  const [notice, setNotice] = useState<string | null>(null);
  const [now, setNow] = useState(0);
  const [passcode, setPasscode] = useState("");
  const [remember, setRemember] = useState(false);
  const [opening, setOpening] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);

  const socket = useRef<RelaySocket | null>(null);
  const live = useRef<{ room: Room | null; game: GameState | null; pendingSetId: string }>({
    room: null,
    game: null,
    pendingSetId: questionSets[0].id,
  });

  /** Apply a new game state, keep it for a reload, and update the phones that need it. */
  const commit = useCallback((next: GameState, pushTo: Pushed) => {
    live.current.game = next;
    setGame(next);
    if (live.current.room) writeSaved({ ...live.current.room, game: next });
    const set = findSet(next.setId);
    if (!set || pushTo === "none") return;
    const pids = pushTo === "all" ? Object.values(next.players).filter((p) => p.connected).map((p) => p.pid) : pushTo;
    const at = Date.now();
    const items = pids.flatMap((pid) => {
      const view = viewFor(next, set, pid, at);
      return view ? [{ to: pid, m: { t: "view", view } }] : [];
    });
    if (items.length > 0) socket.current?.send({ t: "batch", items });
  }, []);

  const forget = useCallback((message: string | null) => {
    socket.current?.stop();
    socket.current = null;
    live.current.room = null;
    live.current.game = null;
    writeSaved(null);
    setRoom(null);
    setGame(null);
    setNotice(message);
  }, []);

  const onMessage = useCallback((message: unknown) => {
    if (typeof message !== "object" || message === null) return;
    const m = message as { t?: string; code?: string; token?: string; players?: string[]; pid?: string; m?: unknown };
    const current = live.current.game;

    if (m.t === "room" && typeof m.code === "string" && typeof m.token === "string") {
      live.current.room = { code: m.code, token: m.token };
      setRoom(live.current.room);
      const start = current ?? newGame(live.current.pendingSetId);
      commit(syncConnected(start, Array.isArray(m.players) ? m.players : []), "all");
      return;
    }
    if (!current || typeof m.pid !== "string") return;
    const set = findSet(current.setId);
    if (!set) return;

    if (m.t === "joined") commit(joinPlayer(current, m.pid), [m.pid]);
    else if (m.t === "left") commit(leavePlayer(current, m.pid), "none");
    else if (m.t === "from") {
      const request = parsePlayerMessage(m.m);
      if (request?.t === "reroll") commit(rerollName(current, m.pid), [m.pid]);
      if (request?.t === "answer") {
        const next = submitAnswer(current, set, m.pid, request.index, request.choice, Date.now());
        if (next !== current) commit(next, [m.pid]);
      }
    }
  }, [commit]);

  const connect = useCallback((relay: string) => {
    socket.current?.stop();
    const s = new RelaySocket(
      () => {
        const r = live.current.room;
        return `${relay}/host?code=${r?.code ?? ""}&token=${encodeURIComponent(r?.token ?? "")}`;
      },
      {
        onMessage,
        onStatus: setStatus,
        onFinalClose: (code) => {
          if (code === RelayClose.replaced) forget("This session was opened in another tab. Carry on there, or start a new session here.");
          else forget("That session has ended and its room has been deleted.");
        },
      },
    );
    socket.current = s;
    s.start();
  }, [forget, onMessage]);

  // Find the relay and pick up a session this tab was already running.
  useEffect(() => {
    const relay = relayBaseUrl();
    setBase(relay);
    setNow(Date.now());
    const saved = loadPasscode();
    setPasscode(saved.passcode);
    setRemember(saved.remembered);
    const session = loadSaved();
    if (relay && session && findSet(session.game.setId)) {
      live.current.room = { code: session.code, token: session.token };
      live.current.game = session.game;
      setRoom(live.current.room);
      setGame(session.game);
      connect(relay);
    }
    return () => socket.current?.stop();
  }, [connect]);

  // The question clock: reveal at the deadline, or as soon as everyone has answered.
  useEffect(() => {
    if (game?.phase !== "question") return;
    const timer = setInterval(() => {
      setNow(Date.now());
      const current = live.current.game;
      const set = current && findSet(current.setId);
      if (current?.phase === "question" && set && (Date.now() >= current.deadline || everyoneAnswered(current))) {
        commit(revealAnswer(current, set), "all");
      }
    }, 250);
    return () => clearInterval(timer);
  }, [game?.phase, game?.index, commit]);

  /** Ask the relay for a room with the teacher passcode, then connect to it with the token it returns. */
  async function startSession() {
    if (!base || opening) return;
    const key = passcode.trim();
    setNotice(null);
    if (!key) {
      setProblem("Enter the teacher passcode.");
      return;
    }
    setOpening(true);
    setProblem(null);
    try {
      const response = await fetch(`${base.replace(/^ws/, "http")}/rooms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key }),
      });
      if (response.status === 401) {
        savePasscode(null, false);
        setProblem("That passcode is not right.");
        return;
      }
      if (!response.ok) {
        setProblem("The relay could not open a room. Try again in a moment.");
        return;
      }
      const { code, token } = (await response.json()) as Room;
      savePasscode(key, remember);
      live.current.pendingSetId = chosenSetId;
      live.current.game = null;
      live.current.room = { code, token };
      connect(base);
    } catch {
      setProblem("Cannot reach the relay. Check the internet connection and try again.");
    } finally {
      setOpening(false);
    }
  }

  function forgetPasscode() {
    savePasscode(null, false);
    setPasscode("");
    setRemember(false);
  }

  function endSession() {
    const s = socket.current;
    const reached = !!s && s.send({ t: "broadcast", m: { t: "ended" } }) && s.send({ t: "end" });
    forget(
      reached
        ? "Session ended. The room, the nicknames and the scores have been deleted."
        : "Session ended on this screen. The relay could not be reached, so the room will delete itself within 15 minutes.",
    );
  }

  function removeStudent(pid: string) {
    const current = live.current.game;
    if (!current) return;
    socket.current?.send({ t: "send", to: pid, m: { t: "removed" } });
    socket.current?.send({ t: "remove", to: pid });
    commit(removePlayer(current, pid), "none");
  }

  function next() {
    const current = live.current.game;
    const set = current && findSet(current.setId);
    if (current && set) commit(advance(current, set, Date.now()), "all");
  }

  function revealNow() {
    const current = live.current.game;
    const set = current && findSet(current.setId);
    if (current && set) commit(revealAnswer(current, set), "all");
  }

  if (base === undefined) return <Frame><p className="p-8 text-on-surface-variant">Loading…</p></Frame>;

  if (base === null) {
    return (
      <Frame>
        <Panel title="The quiz relay is not configured">
          <p>This build has no relay address. Set <code className="font-mono">NEXT_PUBLIC_QUIZ_RELAY_URL</code> when building the site; see <code className="font-mono">relay/README.md</code>.</p>
        </Panel>
      </Frame>
    );
  }

  const set = game ? findSet(game.setId) : undefined;

  if (!room || !game || !set) {
    const connecting = status === "connecting" || status === "reconnecting";
    return (
      <Frame>
        <Setup
          chosen={chosenSetId}
          onChoose={setChosenSetId}
          onStart={startSession}
          busy={opening || connecting}
          problem={problem ?? (status === "reconnecting" ? "Cannot reach the relay. Check the connection; this screen keeps trying." : null)}
          notice={notice}
          passcode={passcode}
          onPasscode={setPasscode}
          remember={remember}
          onRemember={setRemember}
          onForget={forgetPasscode}
        />
      </Frame>
    );
  }

  return (
    <Frame>
      <TopBar set={set} code={room.code} status={status} onEnd={endSession} />
      {game.phase === "lobby" && <Lobby code={room.code} game={game} onStart={next} onRemove={removeStudent} />}
      {game.phase === "question" && <QuestionScreen set={set} game={game} now={now} onReveal={revealNow} />}
      {game.phase === "reveal" && <RevealScreen set={set} game={game} onNext={next} />}
      {game.phase === "final" && <FinalScreen set={set} game={game} onEnd={endSession} />}
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-dvh flex-col bg-background text-on-surface">{children}</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <h1 className="font-headline text-3xl font-medium">{title}</h1>
      <div className="mt-4 space-y-3 leading-7 text-on-surface-variant">{children}</div>
    </div>
  );
}

const primaryButton =
  "inline-flex min-h-12 items-center justify-center bg-primary px-6 text-base font-medium text-on-primary transition-colors hover:bg-on-primary-container disabled:cursor-not-allowed disabled:opacity-50";
const quietButton =
  "inline-flex min-h-11 items-center justify-center border border-outline-dark bg-surface px-4 text-sm font-medium text-on-surface transition-colors hover:bg-surface-container-high";

function Setup(props: {
  chosen: string;
  onChoose: (id: string) => void;
  onStart: () => void;
  busy: boolean;
  problem: string | null;
  notice: string | null;
  passcode: string;
  onPasscode: (value: string) => void;
  remember: boolean;
  onRemember: (value: boolean) => void;
  onForget: () => void;
}) {
  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-10 sm:py-14">
      <p className="font-mono text-[10px] uppercase tracking-label text-primary">Classroom quiz · teacher</p>
      <h1 className="mt-3 font-headline text-4xl font-medium leading-tight">Start a quiz session</h1>
      <p className="mt-4 max-w-2xl leading-7 text-on-surface-variant">
        Students join on their phones with a code or QR code and get a random nickname. No accounts, no real names. When you end the session, the room, the nicknames and the scores are deleted.{" "}
        <Link href="/play/privacy" className="text-primary underline underline-offset-4">What is kept, and for how long</Link>
      </p>

      {props.notice && (
        <p role="status" className="mt-6 border-l-2 border-primary bg-primary-container px-4 py-3 text-sm text-on-primary-container">{props.notice}</p>
      )}

      <fieldset className="mt-8">
        <legend className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Question set</legend>
        <div className="mt-3 grid gap-3">
          {questionSets.map((set) => (
            <label
              key={set.id}
              className={`flex cursor-pointer items-start gap-3 border p-4 transition-colors ${props.chosen === set.id ? "border-primary bg-primary-container" : "border-outline-dark bg-surface hover:bg-surface-container-high"}`}
            >
              <input
                type="radio"
                name="set"
                value={set.id}
                checked={props.chosen === set.id}
                onChange={() => props.onChoose(set.id)}
                className="mt-1.5 h-4 w-4 accent-[#556B4A]"
              />
              <span>
                <span className="block font-medium">{set.title}</span>
                <span className="mt-1 block text-sm text-on-surface-variant">
                  {set.course} · Spec {set.spec} · {set.questions.length} questions
                </span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <form
        className="mt-8 flex flex-col gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          props.onStart();
        }}
      >
        <label htmlFor="passcode" className="font-mono text-[10px] uppercase tracking-label text-on-surface-variant">Teacher passcode</label>
        <input
          id="passcode"
          type="password"
          autoComplete="off"
          value={props.passcode}
          onChange={(e) => props.onPasscode(e.target.value)}
          className="min-h-12 max-w-md border-2 border-outline-dark bg-surface px-3 text-lg focus:border-primary focus:outline-none"
        />
        <label className="flex items-center gap-2 text-sm text-on-surface-variant">
          <input type="checkbox" checked={props.remember} onChange={(e) => props.onRemember(e.target.checked)} className="h-4 w-4 accent-[#556B4A]" />
          Remember on this device (not on a shared classroom computer)
        </label>
        {props.remember && props.passcode && (
          <button type="button" onClick={props.onForget} className="self-start text-sm text-primary underline underline-offset-4">Forget the saved passcode</button>
        )}
        <button type="submit" className={`${primaryButton} mt-3 self-start`} disabled={props.busy}>
          {props.busy ? "Opening a room…" : "Start session"}
        </button>
      </form>
      {props.problem && <p role="alert" className="mt-4 text-sm text-error">{props.problem}</p>}
    </div>
  );
}

function TopBar({ set, code, status, onEnd }: { set: QuestionSet; code: string; status: SocketStatus; onEnd: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const statusText = status === "open" ? "Connected" : status === "closed" ? "Disconnected" : "Reconnecting…";
  return (
    <header className="flex flex-wrap items-center gap-x-6 gap-y-2 border-b border-outline-dark bg-surface px-4 py-3 sm:px-6">
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-medium">{set.title}</span>
        <span className="text-on-surface-variant"> · {set.course}</span>
      </p>
      <p className="font-mono text-sm">Code <span className="font-semibold">{formatCode(code)}</span></p>
      <p className="flex items-center gap-2 text-sm text-on-surface-variant" role="status">
        <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-full ${status === "open" ? "bg-primary" : "bg-accent"}`} />
        {statusText}
      </p>
      {confirming ? (
        <span className="flex items-center gap-2">
          <button type="button" className={`${quietButton} border-error text-error`} onClick={onEnd}>End and delete</button>
          <button type="button" className={quietButton} onClick={() => setConfirming(false)}>Keep playing</button>
        </span>
      ) : (
        <button type="button" className={quietButton} onClick={() => setConfirming(true)}>End session</button>
      )}
    </header>
  );
}

function Lobby({ code, game, onStart, onRemove }: { code: string; game: GameState; onStart: () => void; onRemove: (pid: string) => void }) {
  const [origin, setOrigin] = useState("");
  useEffect(() => setOrigin(window.location.origin), []);
  const joinUrl = `${origin}/play?c=${code}`;
  const players = Object.values(game.players).sort((a, b) => a.joinOrder - b.joinOrder);
  const connected = players.filter((p) => p.connected).length;

  return (
    <div className="grid flex-1 gap-8 px-4 py-8 sm:px-8 lg:grid-cols-[auto_1fr] lg:gap-12">
      <section aria-label="How to join" className="flex flex-col items-start gap-5">
        <div>
          <p className="text-lg text-on-surface-variant">Join at <span className="font-medium text-on-surface">{origin.replace(/^https?:\/\//, "")}/play</span> with code</p>
          <p className="mt-1 font-mono text-6xl font-semibold tracking-wide sm:text-7xl" data-testid="room-code">{formatCode(code)}</p>
        </div>
        {origin && <div className="border border-outline-dark bg-white p-3"><QrCode text={joinUrl} size={240} label={`QR code to join with code ${code}`} /></div>}
      </section>

      <section aria-label="Students" className="flex min-w-0 flex-col">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-headline text-3xl font-medium" aria-live="polite">
            {connected} {connected === 1 ? "student" : "students"} joined
          </h2>
          <button type="button" className={primaryButton} onClick={onStart} disabled={connected === 0}>
            Start the quiz
          </button>
        </div>
        <ul className="mt-6 flex flex-wrap gap-2">
          {players.map((player) => (
            <li key={player.pid} className={`flex items-center gap-1 border border-outline-dark bg-surface py-1 pl-3 pr-1 text-lg ${player.connected ? "" : "opacity-60"}`}>
              <span>{player.name}</span>
              {!player.connected && <span className="text-sm text-on-surface-variant">(away)</span>}
              <button
                type="button"
                onClick={() => onRemove(player.pid)}
                className="ml-1 inline-flex h-9 w-9 items-center justify-center text-on-surface-variant hover:bg-surface-container-high hover:text-error"
                aria-label={`Remove ${player.name}`}
              >
                <span aria-hidden="true">×</span>
              </button>
            </li>
          ))}
        </ul>
        {players.length === 0 && <p className="mt-6 text-on-surface-variant">Waiting for the first student…</p>}
      </section>
    </div>
  );
}

function Picture({ image, className, sizes }: { image: QuizImage; className?: string; sizes?: string }) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className={className} sizes={sizes} unoptimized />;
}

function ChoiceTiles({ question, game, reveal, single = false }: { question: Question; game: GameState; reveal: boolean; single?: boolean }) {
  const pictures = question.choices.some((c) => c.image);
  const result = reveal ? game.results.find((r) => r.index === game.index) : undefined;
  const total = result ? result.counts.reduce((sum, n) => sum + n, 0) : 0;
  const columns = single ? "" : pictures ? (question.choices.length === 4 ? "sm:grid-cols-2 xl:grid-cols-4" : question.choices.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2") : "sm:grid-cols-2";

  return (
    <ol className={`grid gap-3 ${columns}`}>
      {question.choices.map((choice, i) => {
        const style = CHOICE_STYLES[i];
        const isAnswer = i === question.answer;
        const count = result?.counts[i] ?? 0;
        return (
          <li
            key={i}
            className={`relative flex flex-col ${single ? "gap-2 p-2.5" : "gap-3 p-3"} border-2 ${reveal && !isAnswer ? "opacity-55" : ""}`}
            style={{ borderColor: style.colour, background: style.tint, borderWidth: reveal && isAnswer ? 5 : 2 }}
          >
            <div className="flex items-center gap-3">
              <ChoiceMark index={i} />
              <span className="sr-only">{CHOICE_LABELS[i]}:</span>
              {choice.text !== undefined && <span className={`${single ? "text-xl" : "text-2xl"} leading-snug`}>{choice.text}</span>}
              {reveal && isAnswer && <span className="ml-auto shrink-0 whitespace-nowrap bg-on-surface px-2 py-1 text-sm font-semibold text-background">✓ Correct</span>}
            </div>
            {choice.image && <Picture image={choice.image} className="h-auto max-h-[38vh] w-full object-contain" sizes="(min-width: 1280px) 25vw, 50vw" />}
            {result && (
              <div className="flex items-center gap-3 text-base">
                <span className="h-3 flex-1 bg-white/70">
                  <span className="block h-3" style={{ width: `${total ? (count / total) * 100 : 0}%`, background: style.colour }} />
                </span>
                <span className="w-24 text-right tabular-nums">{count} {count === 1 ? "answer" : "answers"}</span>
              </div>
            )}
          </li>
        );
      })}
    </ol>
  );
}

function QuestionHeading({ set, game }: { set: QuestionSet; game: GameState }) {
  const question = set.questions[game.index];
  return (
    <>
      <p className="font-mono text-sm uppercase tracking-label text-on-surface-variant">Question {game.index + 1} of {set.questions.length}</p>
      <h1 className="mt-2 max-w-5xl font-headline text-3xl font-medium leading-tight sm:text-4xl">{question.prompt}</h1>
    </>
  );
}

/** The choices, with the question's own picture beside them when it has one, so both fit a projector. */
function QuestionBody({ question, game, reveal }: { question: Question; game: GameState; reveal: boolean }) {
  if (!question.image) return <ChoiceTiles question={question} game={game} reveal={reveal} />;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div className="border border-outline bg-white p-2">
        <Picture image={question.image} className="mx-auto h-auto max-h-[46vh] w-auto" sizes="50vw" />
      </div>
      <ChoiceTiles question={question} game={game} reveal={reveal} single />
    </div>
  );
}

function QuestionScreen({ set, game, now, onReveal }: { set: QuestionSet; game: GameState; now: number; onReveal: () => void }) {
  const question = set.questions[game.index];
  const limit = questionSeconds(set, game.index) * 1000;
  const left = Math.max(0, game.deadline - now);
  const connected = Object.values(game.players).filter((p) => p.connected).length;
  const answered = Object.keys(game.answers).length;

  return (
    <div className="flex flex-1 flex-col gap-6 px-4 py-6 sm:px-8">
      <div><QuestionHeading set={set} game={game} /></div>
      <QuestionBody question={question} game={game} reveal={false} />
      <div className="mt-auto flex flex-wrap items-center gap-6">
        <div className="flex min-w-60 flex-1 items-center gap-3" aria-hidden="true">
          <span className="h-2 flex-1 bg-surface-container-highest">
            <span className="block h-2 bg-primary transition-[width] duration-200" style={{ width: `${(left / limit) * 100}%` }} />
          </span>
          <span className="w-12 text-right font-mono text-2xl tabular-nums">{Math.ceil(left / 1000)}</span>
        </div>
        <p className="text-xl" aria-live="polite">{answered} of {connected} answered</p>
        <button type="button" className={quietButton} onClick={onReveal}>Show the answer</button>
      </div>
    </div>
  );
}

function TopThree({ standings }: { standings: Standing[] }) {
  if (standings.length === 0) return <p className="text-on-surface-variant">No points scored yet.</p>;
  return (
    <ol className="space-y-2">
      {standings.map((s) => (
        <li key={s.pid} className="flex items-baseline gap-3 border-b border-outline pb-2 text-xl">
          <span className="w-8 font-mono text-on-surface-variant">{s.place}.</span>
          <span className="flex-1 font-medium">{s.name}</span>
          <span className="font-mono tabular-nums">{s.score}</span>
        </li>
      ))}
    </ol>
  );
}

function RevealScreen({ set, game, onNext }: { set: QuestionSet; game: GameState; onNext: () => void }) {
  const question = set.questions[game.index];
  const last = game.index + 1 >= set.questions.length;
  return (
    <div className="grid flex-1 gap-8 px-4 py-6 sm:px-8 xl:grid-cols-[1fr_24rem]">
      <div className="flex flex-col gap-6">
        <div><QuestionHeading set={set} game={game} /></div>
        <QuestionBody question={question} game={game} reveal />
      </div>
      <aside className="flex flex-col gap-4">
        <p className="border-l-2 border-primary bg-surface px-4 py-3 text-xl leading-relaxed">
          <span className="font-semibold">Answer {CHOICE_LABELS[question.answer]}. </span>{question.explanation}
        </p>
        <h2 className="mt-2 font-headline text-2xl font-medium">Top three</h2>
        <TopThree standings={topThree(game)} />
        <button type="button" className={`${primaryButton} mt-2`} onClick={onNext}>{last ? "See the results" : "Next question"}</button>
      </aside>
    </div>
  );
}

function FinalScreen({ set, game, onEnd }: { set: QuestionSet; game: GameState; onEnd: () => void }) {
  const hardest = hardestQuestions(game);
  return (
    <div className="grid flex-1 gap-10 px-4 py-8 sm:px-8 lg:grid-cols-2">
      <section>
        <h1 className="font-headline text-4xl font-medium">Top three</h1>
        <div className="mt-6"><TopThree standings={topThree(game)} /></div>
      </section>
      <section>
        <h2 className="font-headline text-3xl font-medium">What the room found hardest</h2>
        <ol className="mt-6 space-y-4">
          {hardest.map((result) => {
            const question = set.questions[result.index];
            const percent = result.players ? Math.round((result.correct / result.players) * 100) : 0;
            return (
              <li key={result.index} className="border border-outline bg-surface p-4">
                <p className="font-mono text-xs uppercase tracking-label text-on-surface-variant">Question {result.index + 1} · {percent}% correct</p>
                <p className="mt-1 text-lg">{question.prompt}</p>
                <p className="mt-2 text-on-surface-variant">Answer {CHOICE_LABELS[question.answer]}. {question.explanation}</p>
              </li>
            );
          })}
        </ol>
        <button type="button" className={`${primaryButton} mt-8`} onClick={onEnd}>End session and delete everything</button>
      </section>
    </div>
  );
}

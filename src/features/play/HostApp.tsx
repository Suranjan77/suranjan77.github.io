"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  TOP_PLACES,
  advance,
  awaited,
  closeRound,
  currentStars,
  everyoneAnswered,
  finish,
  hardestQuestions,
  isStarRound,
  joinPlayer,
  leavePlayer,
  markSeen,
  newGame,
  removePlayer,
  rerollName,
  restoreGame,
  risers,
  shownQuestion,
  submitAnswer,
  syncConnected,
  topPlaces,
  viewFor,
  type GameState,
  type Player,
  type ShownQuestion,
  type Standing,
} from "./game";
import { Avatar, AvatarParade } from "./avatars";
import { RelayClose, parsePlayerMessage } from "./protocol";
import { RelaySocket, relayBaseUrl, type SocketStatus } from "./relaySocket";
import { SetPicker, courseName, setDetails, useCourseSections } from "./SetPicker";
import { SetPreview } from "./SetPreview";
import { courseOfSet, findCourse, findSet, loadSet } from "./sets";
import { CHOICE_LABELS, type QuestionSet, type QuizImage } from "./types";
import { CHOICE_STYLES, ChoiceMark, CountUp, FlameMark, Loading, QrCode, StarMark, TimerRing, WaitingDots, formatCode, formatPoints } from "./ui";

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

/**
 * The set this device last started, so next lesson opens on its course. A set
 * id is not personal data; nothing about the students is kept with it.
 */
const LAST_SET_KEY = "classroom-quiz-last-set";

function loadLastSet(): string | null {
  try {
    const id = localStorage.getItem(LAST_SET_KEY);
    return id && courseOfSet(id) ? id : null;
  } catch {
    return null;
  }
}

function saveLastSet(id: string) {
  try {
    localStorage.setItem(LAST_SET_KEY, id);
  } catch {
    // Storage unavailable: the teacher picks the course each time.
  }
}

type Room = { code: string; token: string };
type Saved = Room & { game: GameState };

function loadSaved(): Saved | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const saved = JSON.parse(raw) as Saved;
    return { ...saved, game: restoreGame(saved.game) };
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

/** Phones per relay message: 20 views are about 10 KB, well under the relay's limit. */
const BATCH_SIZE = 20;

export default function HostApp() {
  const [base, setBase] = useState<string | null | undefined>(undefined);
  const [chosenSetId, setChosenSetId] = useState<string | null>(null);
  const [courseId, setCourseId] = useState<string | null>(null);
  const [lastUsed, setLastUsed] = useState<string | null>(null);
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
    pendingSetId: "",
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
    // The relay closes a connection that sends one oversized message; a full room fits in a few.
    for (let i = 0; i < items.length; i += BATCH_SIZE) {
      socket.current?.send({ t: "batch", items: items.slice(i, i + BATCH_SIZE) });
    }
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
      const pending = findSet(live.current.pendingSetId);
      const start = current ?? (pending ? newGame(pending) : null);
      if (!start) return;
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
      if (request?.t === "seen") {
        const next = markSeen(current, m.pid, request.index);
        if (next !== current) commit(next, "none");
      }
      if (request?.t === "answer") {
        const next = submitAnswer(current, set, m.pid, request.index, request.choice, Date.now());
        if (next === current) return;
        // The last answer in: straight to the answer, without waiting for the clock.
        if (everyoneAnswered(next, Date.now())) commit(closeRound(next, set), "all");
        else commit(next, [m.pid]);
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
          // A throttled or refused message closes only this connection: the room and its token are still good.
          if (code === RelayClose.tooFast || code === RelayClose.badRequest) {
            setTimeout(() => {
              if (socket.current === s) s.start();
            }, 1000);
            return;
          }
          if (code === RelayClose.replaced) forget("This session was opened in another tab. Carry on there, or start a new session here.");
          else forget("That session has ended and its room has been deleted.");
        },
      },
    );
    socket.current = s;
    s.start();
  }, [forget, onMessage]);

  // Find the relay and pick up a session this tab was already running, loading its course first.
  useEffect(() => {
    let current = true;
    const relay = relayBaseUrl();
    setNow(Date.now());
    const saved = loadPasscode();
    setPasscode(saved.passcode);
    setRemember(saved.remembered);
    const last = loadLastSet();
    setLastUsed(last);
    setChosenSetId(last);
    setCourseId(last ? courseOfSet(last)!.id : null);

    const session = loadSaved();
    if (relay && session && courseOfSet(session.game.setId) && Array.isArray(session.game.plan)) {
      loadSet(session.game.setId).then(
        (set) => {
          if (!current) return;
          if (set) {
            live.current.room = { code: session.code, token: session.token };
            live.current.game = session.game;
            setRoom(live.current.room);
            setGame(session.game);
            connect(relay);
          }
          setBase(relay);
        },
        () => {
          if (!current) return;
          setNotice("The session in progress could not be picked up, because its questions did not load. Check the internet connection and reload this page.");
          setBase(relay);
        },
      );
    } else {
      setBase(relay);
    }
    return () => {
      current = false;
      socket.current?.stop();
    };
  }, [connect]);

  // The question clock: reveal at the deadline, or as soon as everyone has answered.
  useEffect(() => {
    if (game?.phase !== "question") return;
    const timer = setInterval(() => {
      setNow(Date.now());
      const current = live.current.game;
      const set = current && findSet(current.setId);
      if (current?.phase === "question" && set && (Date.now() >= current.deadline || everyoneAnswered(current, Date.now()))) {
        commit(closeRound(current, set), "all");
      }
    }, 250);
    return () => clearInterval(timer);
  }, [game?.phase, game?.index, commit]);

  /** Ask the relay for a room with the teacher passcode, then connect to it with the token it returns. */
  async function startSession() {
    if (!base || opening) return;
    const key = passcode.trim();
    setNotice(null);
    const chosen = chosenSetId ? findSet(chosenSetId) : undefined;
    if (!chosen) {
      setProblem("Choose a question set first.");
      return;
    }
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
      saveLastSet(chosen.id);
      setLastUsed(chosen.id);
      live.current.pendingSetId = chosen.id;
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

  function finishNow() {
    const current = live.current.game;
    if (current) commit(finish(current), "all");
  }

  function revealNow() {
    const current = live.current.game;
    const set = current && findSet(current.setId);
    if (current?.phase === "question" && set) commit(closeRound(current, set), "all");
  }


  if (base === undefined) return <Frame><div className="p-8"><Loading /></div></Frame>;

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
          courseId={courseId}
          onCourse={setCourseId}
          chosen={chosenSetId}
          onChoose={setChosenSetId}
          lastUsed={lastUsed}
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
      {game.phase === "reveal" && <RevealScreen set={set} game={game} onNext={next} onFinish={finishNow} />}
      {game.phase === "final" && <FinalScreen set={set} game={game} onEnd={endSession} />}
    </Frame>
  );
}

function Frame({ children }: { children: React.ReactNode }) {
  return <div className="quiz-root flex min-h-dvh flex-col">{children}</div>;
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12">
      <div className="quiz-card p-8">
        <h1 className="font-headline text-3xl font-medium">{title}</h1>
        <div className="mt-4 space-y-3 leading-7 text-on-surface-variant">{children}</div>
      </div>
    </div>
  );
}

const label = "font-mono text-[11px] uppercase tracking-label text-[color:var(--quiz-muted)]";
const textLink = "text-[color:var(--quiz-green)] underline decoration-2 underline-offset-4";

function Setup(props: {
  courseId: string | null;
  onCourse: (id: string | null) => void;
  chosen: string | null;
  onChoose: (id: string) => void;
  lastUsed: string | null;
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
  const course = props.courseId ? findCourse(props.courseId) : undefined;
  // Re-renders when the open course has loaded, so the chosen set below can be shown.
  const { sections, failed, retry } = useCourseSections(course);
  const chosen = props.chosen ? findSet(props.chosen) : undefined;
  const chosenCourse = props.chosen ? courseOfSet(props.chosen) : undefined;
  const [previewId, setPreviewId] = useState<string | null>(null);
  const preview = previewId ? findSet(previewId) : undefined;

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10 sm:py-14">
      <AvatarParade />
      <p className={`${label} mt-6`}>Classroom quiz · teacher</p>
      <h1 className="mt-2 font-headline text-4xl font-medium leading-tight sm:text-5xl">Start a quiz session</h1>
      <p className="mt-4 max-w-2xl leading-7 text-[color:var(--quiz-muted)]">
        Students join on their phones with a code or QR code and get a random animal nickname. No accounts, no real names. When you end the session, the room, the nicknames and the scores are deleted.{" "}
        <Link href="/play/privacy" className={textLink}>What is kept, and for how long</Link>
      </p>

      {props.notice && (
        <p role="status" className="mt-6 rounded-[16px] bg-[color:var(--quiz-green-soft)] px-4 py-3 text-sm text-[#1D3B29]">{props.notice}</p>
      )}

      <div className="mt-8 grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_21rem]">
        <div className="quiz-card p-5 sm:p-7">
          <SetPicker
            courseId={props.courseId}
            onCourse={props.onCourse}
            chosen={props.chosen}
            onChoose={props.onChoose}
            onPreview={setPreviewId}
            lastUsed={props.lastUsed}
            sections={sections}
            failed={failed}
            onRetry={retry}
          />
        </div>

        <form
          aria-label="Session"
          className="quiz-card flex flex-col gap-3 p-6 lg:sticky lg:top-6"
          onSubmit={(event) => {
            event.preventDefault();
            props.onStart();
          }}
        >
          <p className={label}>Chosen set</p>
          {chosen && chosenCourse ? (
            <div data-testid="chosen-set" className="rounded-[16px] bg-[#F6F1E7] p-4">
              <p className="font-semibold leading-snug">{chosen.title}</p>
              <p className="mt-1 text-sm text-[color:var(--quiz-muted)]">{courseName(chosenCourse)}</p>
              <p className="mt-1 text-sm text-[color:var(--quiz-muted)]">{setDetails(chosen)}</p>
              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1">
                <button type="button" onClick={() => setPreviewId(chosen.id)} className={`text-sm ${textLink}`}>Preview the questions</button>
                {props.courseId !== chosenCourse.id && (
                  <button type="button" onClick={() => props.onCourse(chosenCourse.id)} className={`text-sm ${textLink}`}>Show it in its course</button>
                )}
              </div>
            </div>
          ) : (
            <p className="rounded-[16px] border-2 border-dashed border-[color:var(--quiz-line)] p-4 text-sm text-[color:var(--quiz-muted)]">None yet. Choose a course, then a set.</p>
          )}

          <label htmlFor="passcode" className={`${label} mt-3`}>Teacher passcode</label>
          <input
            id="passcode"
            type="password"
            autoComplete="off"
            value={props.passcode}
            onChange={(e) => props.onPasscode(e.target.value)}
            className="quiz-input text-lg"
          />
          <label className="flex items-center gap-2 text-sm text-[color:var(--quiz-muted)]">
            <input type="checkbox" checked={props.remember} onChange={(e) => props.onRemember(e.target.checked)} className="h-4 w-4 shrink-0 accent-[#2F6B4A]" />
            Remember on this device (not on a shared classroom computer)
          </label>
          {props.remember && props.passcode && (
            <button type="button" onClick={props.onForget} className={`self-start text-sm ${textLink}`}>Forget the saved passcode</button>
          )}
          <button type="submit" className="quiz-button mt-3" disabled={props.busy || !chosen}>
            {props.busy ? "Opening a room…" : "Start session"}
          </button>
          {props.problem && <p role="alert" className="text-sm text-[color:var(--quiz-hot)]">{props.problem}</p>}
        </form>
      </div>

      {preview && (
        <SetPreview
          key={preview.id}
          set={preview}
          chosen={props.chosen === preview.id}
          onChoose={() => props.onChoose(preview.id)}
          onClose={() => setPreviewId(null)}
        />
      )}
    </div>
  );
}

function TopBar({ set, code, status, onEnd }: { set: QuestionSet; code: string; status: SocketStatus; onEnd: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const statusText = status === "open" ? "Connected" : status === "closed" ? "Disconnected" : "Reconnecting…";
  return (
    <header className="flex flex-wrap items-center gap-x-5 gap-y-2 px-4 pt-4 sm:px-6">
      <p className="min-w-0 flex-1 truncate text-sm">
        <span className="font-semibold">{set.title}</span>
        <span className="text-[color:var(--quiz-muted)]"> · {set.course}</span>
      </p>
      <p className="quiz-pill bg-[color:var(--quiz-card)] font-mono text-sm ring-1 ring-[color:var(--quiz-line)]">Code <span className="font-semibold">{formatCode(code)}</span></p>
      <p className="flex items-center gap-2 text-sm text-[color:var(--quiz-muted)]" role="status">
        <span aria-hidden="true" className={`inline-block h-2.5 w-2.5 rounded-[999px] ${status === "open" ? "bg-[#3C9A5F]" : "bg-[color:var(--quiz-hot)]"}`} />
        {statusText}
      </p>
      {confirming ? (
        <span className="flex items-center gap-2">
          <button type="button" className="quiz-button-quiet border-[color:var(--quiz-hot)] text-[color:var(--quiz-hot)]" onClick={onEnd}>End and delete</button>
          <button type="button" className="quiz-button-quiet" onClick={() => setConfirming(false)}>Keep playing</button>
        </span>
      ) : (
        <button type="button" className="quiz-button-quiet" onClick={() => setConfirming(true)}>End session</button>
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
    <div className="grid flex-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,25rem)_1fr]">
      <section aria-label="How to join" className="quiz-card flex flex-col items-center gap-5 p-7 text-center">
        <div>
          <p className="text-lg text-[color:var(--quiz-muted)]">Join at <span className="font-semibold text-[color:var(--quiz-ink)]">{origin.replace(/^https?:\/\//, "")}/play</span> with code</p>
          <p className="mt-2 font-mono text-6xl font-medium tracking-wide sm:text-7xl" data-testid="room-code">{formatCode(code)}</p>
        </div>
        {origin && (
          <div className="rounded-[18px] bg-white p-3 ring-1 ring-[color:var(--quiz-line)]">
            <QrCode text={joinUrl} size={232} label={`QR code to join with code ${code}`} />
          </div>
        )}
        <p className="text-sm text-[color:var(--quiz-muted)]">Or point a phone camera at the code.</p>
      </section>

      <section aria-label="Students" className="flex min-w-0 flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-headline text-4xl font-medium" aria-live="polite">
            {connected} {connected === 1 ? "student" : "students"} joined
          </h2>
          <button type="button" className="quiz-button text-lg" onClick={onStart} disabled={connected === 0}>
            Start the quiz
          </button>
        </div>
        {players.length === 0 ? (
          <div className="quiz-card flex flex-col items-center gap-4 px-6 py-12 text-center">
            <span className="quiz-bob"><Avatar name="Golden Owl" size={88} /></span>
            <p className="flex items-center gap-2 text-lg text-[color:var(--quiz-muted)]">Waiting for the first student <WaitingDots /></p>
          </div>
        ) : (
          <ul className="grid grid-cols-[repeat(auto-fill,minmax(9.5rem,1fr))] gap-3">
            {players.map((player) => (
              <li key={player.pid} className={`quiz-card quiz-pop relative flex flex-col items-center gap-2 px-3 pb-3 pt-4 text-center ${player.connected ? "" : "opacity-55"}`}>
                <Avatar name={player.name} size={64} />
                <span className="text-base font-semibold leading-tight">{player.name}</span>
                {!player.connected && <span className="text-xs text-[color:var(--quiz-muted)]">(away)</span>}
                <button
                  type="button"
                  onClick={() => onRemove(player.pid)}
                  className="absolute right-1.5 top-1.5 inline-flex h-8 w-8 items-center justify-center rounded-[999px] text-lg text-[color:var(--quiz-muted)] hover:bg-[#F6E3DC] hover:text-[color:var(--quiz-hot)]"
                  aria-label={`Remove ${player.name}`}
                >
                  <span aria-hidden="true">×</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Picture({ image, className, sizes }: { image: QuizImage; className?: string; sizes?: string }) {
  return <Image src={image.src} alt={image.alt} width={image.width} height={image.height} className={className} sizes={sizes} unoptimized />;
}

function ChoiceTiles({ question, game, reveal, single = false }: { question: ShownQuestion; game: GameState; reveal: boolean; single?: boolean }) {
  const pictures = question.choices.some((c) => c.image);
  const result = reveal ? game.results.find((r) => r.round === game.index) : undefined;
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
            className={`relative flex flex-col overflow-hidden rounded-[20px] bg-[color:var(--quiz-card)] transition-[opacity,transform] duration-500 ${reveal && !isAnswer ? "opacity-45" : ""} ${reveal && isAnswer ? "quiz-pop" : ""}`}
            style={{ boxShadow: reveal && isAnswer ? `0 0 0 4px ${style.colour}, 0 18px 40px -24px rgb(30 27 22 / 0.5)` : `inset 0 0 0 2px ${style.tint}, 0 10px 28px -24px rgb(30 27 22 / 0.5)` }}
          >
            <div className={`flex items-center gap-3 ${single ? "p-2.5" : choice.image ? "p-3" : "px-3 py-4"}`} style={{ background: choice.image ? style.tint : undefined }}>
              <span className="inline-flex rounded-[14px] p-1.5" style={{ background: style.colour }}>
                <ChoiceMark index={i} size={single ? 34 : 40} inverse />
              </span>
              <span className="sr-only">{CHOICE_LABELS[i]}:</span>
              {choice.text !== undefined && <span className={`${single ? "text-xl" : "text-2xl"} font-medium leading-snug`}>{choice.text}</span>}
              {reveal && isAnswer && <span className="quiz-pill ml-auto shrink-0 whitespace-nowrap bg-[color:var(--quiz-green)] text-sm text-white">✓ Correct</span>}
            </div>
            {choice.image && <div className="bg-white p-2"><Picture image={choice.image} className="h-auto max-h-[36vh] w-full object-contain" sizes="(min-width: 1280px) 25vw, 50vw" /></div>}
            {result && (
              <div className="flex items-center gap-3 px-3 pb-3 text-base">
                <span className="h-3 flex-1 overflow-hidden rounded-[999px] bg-[#F1ECE2]">
                  <span className="block h-3 rounded-[999px] transition-[width] duration-700 ease-out" style={{ width: `${total ? (count / total) * 100 : 0}%`, background: style.colour }} />
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

function QuestionHeading({ question }: { question: ShownQuestion }) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-2 text-sm">
        <span className="quiz-pill bg-[color:var(--quiz-ink)] font-mono text-[#FFFDF8]">Question {question.round + 1} of {question.total}</span>
        {question.repeat && <span className="quiz-pill bg-[#E7E2F2] text-[#3B2F63]">Seen before</span>}
        {question.double && <span className="quiz-pill bg-[color:var(--quiz-hot-soft)] text-[#7A2A18]">Final stretch · double points</span>}
      </div>
      <h1 className="mt-3 max-w-5xl font-headline text-3xl font-medium leading-tight sm:text-[2.6rem]">{question.prompt}</h1>
    </>
  );
}

/** The choices, with the question's own picture beside them when it has one, so both fit a projector. */
function QuestionBody({ question, game, reveal }: { question: ShownQuestion; game: GameState; reveal: boolean }) {
  if (!question.image) return <ChoiceTiles question={question} game={game} reveal={reveal} />;
  return (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,3fr)_minmax(0,2fr)]">
      <div className="overflow-hidden rounded-[20px] bg-white p-2 ring-1 ring-[color:var(--quiz-line)]">
        <Picture image={question.image} className="mx-auto h-auto max-h-[min(58vh,calc(100dvh-22rem))] w-full object-contain" sizes="60vw" />
      </div>
      <ChoiceTiles question={question} game={game} reveal={reveal} single />
    </div>
  );
}

/** Avatars of the students who have answered, in the order they did, overlapping. */
function AnsweredStack({ players }: { players: Player[] }) {
  const shown = players.slice(0, 18);
  return (
    <ul className="flex min-h-9 flex-wrap items-center -space-x-2" aria-hidden="true">
      {shown.map((player) => (
        <li key={player.pid} className="quiz-pop rounded-[999px] ring-[3px] ring-[color:var(--quiz-card)]">
          <Avatar name={player.name} size={34} />
        </li>
      ))}
      {players.length > shown.length && (
        <li className="relative inline-flex h-[34px] min-w-[34px] items-center justify-center rounded-[999px] bg-[#EFE9DD] px-2 text-xs font-semibold ring-[3px] ring-[color:var(--quiz-card)]">
          +{players.length - shown.length}
        </li>
      )}
    </ul>
  );
}

function QuestionScreen({ set, game, now, onReveal }: { set: QuestionSet; game: GameState; now: number; onReveal: () => void }) {
  const question = shownQuestion(game, set);
  if (!question) return null;
  const limit = question.seconds * 1000;
  const left = Math.max(0, game.deadline - now);
  const waiting = awaited(game, now).length;
  const answeredBy = Object.entries(game.answers)
    .sort(([, a], [, b]) => a.at - b.at)
    .flatMap(([pid]) => (game.players[pid] ? [game.players[pid]] : []));
  const answered = answeredBy.length;
  const silent = Object.values(game.players).filter((p) => p.connected).length - waiting;

  return (
    <div className="flex flex-1 flex-col gap-5 px-4 py-5 sm:px-6">
      <div><QuestionHeading question={question} /></div>
      <QuestionBody question={question} game={game} reveal={false} />
      <div className="quiz-card mt-auto flex flex-wrap items-center gap-x-6 gap-y-3 px-5 py-3">
        <TimerRing left={left} limit={limit} />
        <div className="flex min-w-60 flex-1 flex-col gap-1.5">
          <p className="text-xl font-semibold" aria-live="polite">{answered} of {Math.max(waiting, answered)} answered</p>
          <AnsweredStack players={answeredBy} />
          {silent > 0 && <p className="text-sm text-[color:var(--quiz-muted)]">{silent} {silent === 1 ? "phone has" : "phones have"} not shown this question, so the room is not waiting for {silent === 1 ? "it" : "them"}.</p>}
        </div>
        <button type="button" className="quiz-button-quiet" onClick={onReveal}>Show the answer</button>
      </div>
    </div>
  );
}

const ROW_HEIGHT = 52;

function Movement({ moved }: { moved: number }) {
  if (moved > 0) return <span className="text-sm font-semibold text-[#2F6B4A]" aria-label={`up ${moved}`}>▲{moved}</span>;
  if (moved < 0) return <span className="text-sm font-semibold text-[color:var(--quiz-hot)]" aria-label={`down ${-moved}`}>▼{-moved}</span>;
  return null;
}

function StandingRow({ standing, score, from }: { standing: Standing; score: number; from?: number }) {
  return (
    <>
      <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-[999px] font-mono text-sm font-medium ${standing.place === 1 ? "bg-[color:var(--quiz-star)] text-[#4A3305]" : "bg-[#EFE9DD]"}`}>{standing.place}</span>
      <Avatar name={standing.name} size={36} />
      <span className="min-w-0 flex-1 truncate text-[1.05rem] font-semibold">{standing.name}</span>
      {standing.streak >= 3 && (
        <span className="inline-flex items-center gap-0.5 text-sm font-semibold text-[#9A3B1A]" aria-label={`${standing.streak} right in a row`}>
          <FlameMark size={18} />{standing.streak}
        </span>
      )}
      <span className="text-right font-mono text-lg tabular-nums"><CountUp value={score} from={from} /></span>
    </>
  );
}

/** The top places at the end of the game, with no movement shown. */
function TopList({ standings, start = 0 }: { standings: Standing[]; start?: number }) {
  if (standings.length === 0) return <p className="text-[color:var(--quiz-muted)]">No points scored yet.</p>;
  return (
    <ol className="flex flex-col gap-2">
      {standings.slice(start).map((s) => (
        <li key={s.pid} className="flex items-center gap-3 rounded-[16px] bg-[#F8F4EC] px-3 py-2">
          <StandingRow standing={s} score={s.score} />
        </li>
      ))}
    </ol>
  );
}

/**
 * The top places at a reveal: first as they were before this round, then the
 * scores count up and the rows slide to their new places, and anyone who has
 * climbed in slides in.
 */
function Leaderboard({ game }: { game: GameState }) {
  const [stage, setStage] = useState<"before" | "after">("before");
  useLayoutEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setStage("after");
      return;
    }
    const timer = setTimeout(() => setStage("after"), 700);
    return () => clearTimeout(timer);
  }, []);

  const after = topPlaces(game);
  const before = topPlaces({
    ...game,
    players: Object.fromEntries(Object.entries(game.players).map(([pid, p]) => [pid, { ...p, score: p.score - p.lastGained, rank: p.previousRank }])),
  });
  if (after.length === 0) return <p className="text-[color:var(--quiz-muted)]">No points scored yet.</p>;
  const standings = stage === "after" ? after : before;
  const rows = [...after, ...before.filter((b) => !after.some((s) => s.pid === b.pid))];

  return (
    <ol className="relative" style={{ height: ROW_HEIGHT * Math.max(before.length, after.length) }}>
      {rows.map((row) => {
        const place = standings.findIndex((s) => s.pid === row.pid);
        const visible = place !== -1;
        const now = after.find((s) => s.pid === row.pid);
        const was = before.find((s) => s.pid === row.pid);
        const standing = stage === "after" ? now ?? row : was ?? row;
        return (
          <li
            key={row.pid}
            aria-hidden={!visible}
            className="absolute inset-x-0 top-0 flex items-center gap-3 rounded-[16px] bg-[#F8F4EC] px-3 transition-[transform,opacity] duration-700 ease-out"
            style={{ height: ROW_HEIGHT - 8, transform: `translateY(${(visible ? place : standings.length) * ROW_HEIGHT}px)`, opacity: visible ? 1 : 0 }}
          >
            <StandingRow standing={{ ...standing, place: visible ? place + 1 : standing.place }} score={stage === "after" ? now?.score ?? 0 : was?.score ?? 0} />
            {stage === "after" && now && now.moved !== 0 && <span className="-ml-1 text-right"><Movement moved={now.moved} /></span>}
          </li>
        );
      })}
    </ol>
  );
}

function RevealScreen({ set, game, onNext, onFinish }: { set: QuestionSet; game: GameState; onNext: () => void; onFinish: () => void }) {
  const question = shownQuestion(game, set);
  if (!question) return null;
  const last = game.index + 1 >= game.plan.length;
  const stars = currentStars(game);
  const rising = risers(game);
  const nextDouble = !last && shownQuestion(game, set, game.index + 1)?.double && !question.double;
  return (
    <div className="grid flex-1 gap-6 px-4 py-5 sm:px-6 xl:grid-cols-[minmax(0,1fr)_28rem]">
      <div className="flex flex-col gap-5">
        <div><QuestionHeading question={question} /></div>
        <QuestionBody question={question} game={game} reveal />
      </div>
      <aside className="flex flex-col gap-3">
        <div className="quiz-card quiz-rise flex gap-4 p-4">
          <span className="inline-flex h-fit rounded-[14px] p-1.5" style={{ background: CHOICE_STYLES[question.answer].colour }}>
            <ChoiceMark index={question.answer} size={30} inverse />
          </span>
          <p className="text-lg leading-relaxed"><span className="font-semibold">Answer {CHOICE_LABELS[question.answer]}. </span>{question.explanation}</p>
        </div>
        <section className="quiz-card px-4 pb-4 pt-3" aria-labelledby="top-heading">
          <h2 id="top-heading" className="mb-2 font-headline text-2xl font-medium">Top {TOP_PLACES}</h2>
          <Leaderboard key={game.index} game={game} />
          {rising.length > 0 && (
            <div className="mt-2 border-t border-[color:var(--quiz-line)] pt-2">
              <p className={label}>On the rise</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {rising.map((r) => (
                  <li key={r.pid} className="quiz-pop flex items-center gap-2 rounded-[999px] bg-[color:var(--quiz-green-soft)] py-1 pl-1 pr-3 text-sm font-semibold text-[#1D3B29]">
                    <Avatar name={r.name} size={28} />
                    {r.name} <span aria-label={`up ${r.climbed} places`}>▲{r.climbed}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </section>
        {stars.length > 0 && (
          <p className="quiz-rise flex items-center gap-3 rounded-[18px] bg-[color:var(--quiz-star-soft)] px-4 py-3 text-base leading-snug" role="status">
            <StarMark size={32} className="quiz-shine shrink-0" />
            <span><span className="font-semibold">{stars.length} {stars.length === 1 ? "star" : "stars"}</span> for students outside the top {TOP_PLACES}: their next right answer counts double.</span>
          </p>
        )}
        {nextDouble && (
          <p className="rounded-[18px] bg-[color:var(--quiz-hot-soft)] px-4 py-3 text-base font-semibold text-[#7A2A18]">
            Final stretch next: every right answer counts double.
          </p>
        )}
        {!stars.length && !nextDouble && isStarRound(game, game.index + 1) && !last && (
          <p className="px-1 text-sm text-[color:var(--quiz-muted)]">Stars go out after the next question.</p>
        )}
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" className="quiz-button text-lg" onClick={onNext}>{last ? "See the results" : "Next question"}</button>
          {!last && (
            <button type="button" className="quiz-button-quiet" onClick={onFinish}>
              Skip to the results
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

const CONFETTI = ["#2F6B4A", "#B4442E", "#F4B740", "#5B4A8C", "#76AEE0", "#F5937E"];

function Confetti() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      {Array.from({ length: 36 }, (_, i) => (
        <span
          key={i}
          className="quiz-confetti absolute top-0 block"
          style={{
            left: `${(i * 37) % 100}%`,
            width: 8 + (i % 3) * 3,
            height: i % 2 ? 8 : 14,
            borderRadius: i % 3 === 0 ? 999 : 2,
            background: CONFETTI[i % CONFETTI.length],
            animationDelay: `${(i % 9) * 0.18}s`,
          }}
        />
      ))}
    </div>
  );
}

function Podium({ standings }: { standings: Standing[] }) {
  const order = [standings[1], standings[0], standings[2]];
  const heights = [96, 136, 72];
  return (
    <ol className="flex items-end justify-center gap-3 sm:gap-5">
      {order.map((s, i) =>
        s ? (
          <li key={s.pid} className="quiz-rise flex w-36 flex-col items-center text-center" style={{ animationDelay: `${[400, 900, 0][i]}ms` }}>
            <Avatar name={s.name} size={s.place === 1 ? 104 : 84} className={s.place === 1 ? "quiz-bob" : undefined} />
            <span className="mt-2 text-lg font-semibold leading-tight">{s.name}</span>
            <span className="font-mono tabular-nums text-[color:var(--quiz-muted)]">{formatPoints(s.score)}</span>
            <span
              className="mt-2 flex w-full items-start justify-center rounded-t-[16px] pt-2 font-headline text-4xl font-medium"
              style={{ height: heights[i], background: s.place === 1 ? "var(--quiz-star)" : s.place === 2 ? "#D9DEE5" : "#E9C9A8" }}
            >
              {s.place}
            </span>
          </li>
        ) : (
          <li key={i} className="w-36" />
        ),
      )}
    </ol>
  );
}

function FinalScreen({ set, game, onEnd }: { set: QuestionSet; game: GameState; onEnd: () => void }) {
  const hardest = hardestQuestions(game);
  const top = topPlaces(game);
  return (
    <div className="relative grid flex-1 items-start gap-6 px-4 py-6 sm:px-6 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
      <Confetti />
      <section className="quiz-card relative p-6 sm:p-8">
        <h1 className="text-center font-headline text-4xl font-medium">Top {TOP_PLACES}</h1>
        {top.length === 0 ? (
          <p className="mt-6 text-center text-[color:var(--quiz-muted)]">No points scored yet.</p>
        ) : (
          <>
            <div className="mt-8"><Podium standings={top} /></div>
            {top.length > 3 && <div className="mt-6"><TopList standings={top} start={3} /></div>}
          </>
        )}
      </section>
      <section className="relative">
        <h2 className="font-headline text-3xl font-medium">What the room found hardest</h2>
        <ol className="mt-5 space-y-3">
          {hardest.map((summary) => {
            const question = set.questions[summary.question];
            const answer = question.choices[question.answer];
            const percent = (rate: number | null) => (rate === null ? "not asked" : `${Math.round(rate * 100)}% correct`);
            return (
              <li key={summary.question} className="quiz-card p-5">
                <p className="font-mono text-xs uppercase tracking-label text-[color:var(--quiz-muted)]">
                  First time {percent(summary.first)} · second time {percent(summary.second)}
                </p>
                <p className="mt-1 text-lg font-medium">{question.prompt}</p>
                {answer.image && <Picture image={answer.image} className="mt-3 h-auto max-h-28 w-auto rounded-[10px] ring-1 ring-[color:var(--quiz-line)]" sizes="200px" />}
                <p className="mt-2 text-[color:var(--quiz-muted)]">
                  {answer.text !== undefined && <span className="font-semibold text-[color:var(--quiz-ink)]">Answer: {answer.text}. </span>}
                  {question.explanation}
                </p>
              </li>
            );
          })}
        </ol>
        <button type="button" className="quiz-button mt-6" onClick={onEnd}>End session and delete everything</button>
      </section>
    </div>
  );
}

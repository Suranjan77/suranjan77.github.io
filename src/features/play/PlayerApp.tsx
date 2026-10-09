"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { RelayClose, parseHostMessage, type PlayerView } from "./protocol";
import { RelaySocket, relayBaseUrl, type SocketStatus } from "./relaySocket";
import { CHOICE_STYLES, ChoiceMark, formatCode } from "./ui";

/**
 * A student's phone. It holds no game state of its own: the teacher's screen
 * sends what to show. This tab keeps a random id and the room code in
 * sessionStorage so a reload or a locked screen rejoins as the same player;
 * both are removed when the session ends.
 */

const ID_KEY = "classroom-quiz-player-id";
const CODE_KEY = "classroom-quiz-player-code";

function storage(): Storage | null {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function playerId(): string {
  const store = storage();
  const existing = store?.getItem(ID_KEY);
  if (existing && /^[a-f0-9]{32}$/.test(existing)) return existing;
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  const id = [...bytes].map((b) => b.toString(16).padStart(2, "0")).join("");
  store?.setItem(ID_KEY, id);
  return id;
}

function forgetPlayer() {
  storage()?.removeItem(ID_KEY);
  storage()?.removeItem(CODE_KEY);
}

type Ending = "ended" | "removed" | "replaced" | "full" | "notFound" | "error";

const ENDINGS: Record<Ending, { title: string; body: string }> = {
  ended: { title: "Session ended", body: "Your teacher ended the session. Your nickname and score have been deleted." },
  removed: { title: "You have left the session", body: "Your teacher removed you from this session." },
  replaced: { title: "Open in another tab", body: "This quiz is open in another tab or window. Carry on there." },
  full: { title: "The room is full", body: "This session already has the maximum number of players." },
  notFound: { title: "No session with that code", body: "Check the code on your teacher's screen and try again." },
  error: { title: "Could not join", body: "Something went wrong. Check the code and try again." },
};

export default function PlayerApp() {
  const [base, setBase] = useState<string | null | undefined>(undefined);
  const [codeInput, setCodeInput] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [view, setView] = useState<PlayerView | null>(null);
  const [status, setStatus] = useState<SocketStatus>("closed");
  const [hostAway, setHostAway] = useState(false);
  const [ending, setEnding] = useState<Ending | null>(null);
  const [pending, setPending] = useState<number | null>(null);
  const [deadline, setDeadline] = useState(0);
  const [now, setNow] = useState(0);
  const socket = useRef<RelaySocket | null>(null);

  const finish = useCallback((why: Ending) => {
    socket.current?.stop();
    socket.current = null;
    if (why !== "replaced") forgetPlayer();
    setView(null);
    setCode(null);
    setCodeInput("");
    setEnding(why);
  }, []);

  const join = useCallback((relay: string, roomCode: string) => {
    socket.current?.stop();
    // A new room gets a new id, so one tab's sessions cannot be linked to each other.
    if (storage()?.getItem(CODE_KEY) !== roomCode) storage()?.removeItem(ID_KEY);
    const pid = playerId();
    storage()?.setItem(CODE_KEY, roomCode);
    setCode(roomCode);
    setEnding(null);
    const s = new RelaySocket(() => `${relay}/join?code=${roomCode}&pid=${pid}`, {
      onStatus: setStatus,
      onMessage: (raw) => {
        const message = parseHostMessage(raw);
        if (!message) return;
        if (message.t === "relay.host") setHostAway(!message.up);
        else if (message.t === "ended") finish("ended");
        else if (message.t === "removed") finish("removed");
        else if (message.t === "view") {
          setHostAway(false);
          setView(message.view);
          if (message.view.phase === "question") {
            setDeadline(Date.now() + message.view.secondsLeft * 1000);
            setNow(Date.now());
            if (message.view.answered !== null) setPending(null);
          } else {
            setPending(null);
          }
        }
      },
      onFinalClose: (closeCode) => {
        const byCode: Record<number, Ending> = {
          [RelayClose.ended]: "ended",
          [RelayClose.removed]: "removed",
          [RelayClose.replaced]: "replaced",
          [RelayClose.full]: "full",
          [RelayClose.notFound]: "notFound",
        };
        finish(byCode[closeCode] ?? "error");
      },
    });
    socket.current = s;
    s.start();
  }, [finish]);

  useEffect(() => {
    const relay = relayBaseUrl();
    setBase(relay);
    const fromLink = new URLSearchParams(window.location.search).get("c")?.replace(/\D/g, "") ?? "";
    const remembered = storage()?.getItem(CODE_KEY) ?? "";
    if (relay && /^\d{6}$/.test(remembered) && (!fromLink || fromLink === remembered)) join(relay, remembered);
    else setCodeInput(fromLink.slice(0, 6));
    return () => socket.current?.stop();
  }, [join]);

  useEffect(() => {
    if (view?.phase !== "question") return;
    const timer = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(timer);
  }, [view]);

  function submitCode(event: React.FormEvent) {
    event.preventDefault();
    const digits = codeInput.replace(/\D/g, "");
    if (base && /^\d{6}$/.test(digits)) join(base, digits);
  }

  function answer(choice: number) {
    if (view?.phase !== "question" || view.answered !== null || pending !== null) return;
    if (socket.current?.send({ t: "answer", index: view.index, choice })) setPending(choice);
  }

  if (base === undefined) return <Shell><p className="text-on-surface-variant">Loading…</p></Shell>;
  if (base === null) return <Shell><h1 className="font-headline text-3xl">The quiz is not set up on this site yet.</h1></Shell>;

  if (!code) {
    const codeOk = /^\d{6}$/.test(codeInput.replace(/\D/g, ""));
    return (
      <Shell>
        {ending && (
          <div role="status" className="mb-8 border-l-2 border-primary bg-primary-container px-4 py-3 text-on-primary-container">
            <p className="font-semibold">{ENDINGS[ending].title}</p>
            <p className="mt-1 text-sm">{ENDINGS[ending].body}</p>
          </div>
        )}
        <h1 className="font-headline text-4xl font-medium">Join the quiz</h1>
        <form onSubmit={submitCode} className="mt-6 flex flex-col gap-4">
          <label htmlFor="code" className="text-lg">Code on your teacher&apos;s screen</label>
          <input
            id="code"
            inputMode="numeric"
            autoComplete="off"
            maxLength={7}
            value={codeInput}
            onChange={(e) => setCodeInput(e.target.value.replace(/[^\d ]/g, ""))}
            className="min-h-14 border-2 border-outline-dark bg-surface px-4 font-mono text-3xl tracking-[0.3em] focus:border-primary focus:outline-none"
            placeholder="000000"
          />
          <button type="submit" disabled={!codeOk} className="min-h-14 bg-primary text-lg font-medium text-on-primary disabled:opacity-50">Join</button>
        </form>
        <p className="mt-8 text-sm leading-6 text-on-surface-variant">
          You will get a random nickname. No real names, no accounts. Everything from the game is deleted when your teacher ends the session.{" "}
          <Link href="/play/privacy" className="text-primary underline underline-offset-4">Privacy</Link>
        </p>
      </Shell>
    );
  }

  const banner =
    status === "reconnecting" ? "Reconnecting…" : hostAway ? "Your teacher's screen has disconnected. Wait here: it should come back." : null;

  return (
    <Shell>
      <div className="mb-6 flex items-center justify-between gap-3 text-sm text-on-surface-variant">
        <span>{view ? <>You are <span className="font-semibold text-on-surface" data-testid="nickname">{view.name}</span></> : "Joining…"}</span>
        <span className="font-mono">{formatCode(code)}</span>
      </div>
      {banner && <p role="status" className="mb-6 border-l-2 border-accent bg-accent-container px-4 py-3 text-sm text-on-accent-container">{banner}</p>}
      {view ? <PhoneView view={view} pending={pending} secondsLeft={Math.max(0, Math.ceil((deadline - now) / 1000))} onAnswer={answer} onReroll={() => socket.current?.send({ t: "reroll" })} /> : <p className="text-lg">Connecting to the room…</p>}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-8 text-on-surface">
      {children}
    </div>
  );
}

function PhoneView({ view, pending, secondsLeft, onAnswer, onReroll }: {
  view: PlayerView;
  pending: number | null;
  secondsLeft: number;
  onAnswer: (choice: number) => void;
  onReroll: () => void;
}) {
  switch (view.phase) {
    case "lobby":
      return (
        <div aria-live="polite">
          <h1 className="font-headline text-4xl font-medium">You&apos;re in</h1>
          <p className="mt-4 text-lg">Your nickname is <span className="font-semibold">{view.name}</span>.</p>
          {view.rerollsLeft > 0 && (
            <button type="button" onClick={onReroll} className="mt-4 min-h-11 border border-outline-dark bg-surface px-4 text-sm">
              Give me a different name ({view.rerollsLeft} left)
            </button>
          )}
          <p className="mt-8 text-on-surface-variant">Waiting for your teacher to start <span className="font-medium text-on-surface">{view.setTitle}</span>.</p>
        </div>
      );

    case "question": {
      const chosen = view.answered ?? pending;
      return (
        <div>
          <div className="flex items-baseline justify-between text-sm text-on-surface-variant">
            <span>Question {view.index + 1} of {view.total}</span>
            <span className="font-mono text-lg tabular-nums" aria-label={`${secondsLeft} seconds left`}>{secondsLeft}</span>
          </div>
          <p className="mt-3 text-xl leading-snug">{view.prompt}</p>
          {view.pictures && <p className="mt-2 text-sm text-on-surface-variant">The pictures are on your teacher&apos;s screen.</p>}
          {chosen !== null ? (
            <p className="mt-8 flex items-center gap-3 text-xl" aria-live="polite">
              <ChoiceMark index={chosen} size={44} />
              Answer {view.choices[chosen].label} sent. Wait for the others.
            </p>
          ) : (
            <div className={`mt-6 grid gap-3 ${view.choices.every((c) => !c.text) ? "grid-cols-2" : "grid-cols-1"}`}>
              {view.choices.map((choice, i) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={() => onAnswer(i)}
                  className="flex min-h-20 items-center gap-3 border-2 p-3 text-left text-lg"
                  style={{ borderColor: CHOICE_STYLES[i].colour, background: CHOICE_STYLES[i].tint }}
                  aria-label={choice.text ? `${choice.label}: ${choice.text}` : choice.label}
                >
                  <ChoiceMark index={i} size={44} />
                  {choice.text && <span className="leading-snug">{choice.text}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "reveal":
      return (
        <div aria-live="polite">
          <p className="text-sm text-on-surface-variant">Question {view.index + 1} of {view.total}</p>
          <h1 className="mt-3 font-headline text-4xl font-medium">
            {view.outcome === "correct" ? "Correct" : view.outcome === "wrong" ? "Not this time" : "No answer"}
          </h1>
          <p className="mt-3 text-lg">
            {view.outcome === "correct" ? `+${view.gained} points. ` : ""}The answer was {view.correctLabel}.
          </p>
          <p className="mt-6 text-lg">Your score: <span className="font-mono font-semibold">{view.score}</span></p>
          <p className="mt-6 text-on-surface-variant">Look at the screen for why.</p>
        </div>
      );

    case "final":
      return (
        <div aria-live="polite">
          <h1 className="font-headline text-4xl font-medium">
            {view.place ? `You came ${["", "first", "second", "third"][view.place]}` : "Quiz finished"}
          </h1>
          <p className="mt-4 text-lg">Your score: <span className="font-mono font-semibold">{view.score}</span></p>
          <p className="mt-6 text-on-surface-variant">Leave this page open until your teacher ends the session.</p>
        </div>
      );
  }
}

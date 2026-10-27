"use client";

import Link from "next/link";
import { useCallback, useEffect, useRef, useState } from "react";
import { Avatar, AvatarParade } from "./avatars";
import { RelayClose, parseHostMessage, type AwardSummary, type PlayerView } from "./protocol";
import { RelaySocket, relayBaseUrl, type SocketStatus } from "./relaySocket";
import { CHOICE_STYLES, ChoiceMark, CountUp, FlameMark, Loading, StarMark, WaitingDots, formatCode, formatPoints } from "./ui";

/**
 * A student's phone. It holds no game state of its own: the teacher's screen
 * sends what to show. This tab keeps a random id and the room code in
 * sessionStorage so a reload or a locked screen rejoins as the same player;
 * both are removed when the session ends.
 */

const ID_KEY = "classroom-quiz-player-id";
const CODE_KEY = "classroom-quiz-player-code";
/** How long a joined phone waits for the teacher's screen before joining again. */
const REJOIN_AFTER_MS = 6_000;

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
          // Tell the teacher's screen this phone is showing the question, so the room waits for it.
          if (message.view.phase === "question" && message.view.answered === null) s.send({ t: "seen", index: message.view.index });
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

  // Connected, the teacher's screen is up, and still nothing to show: its welcome went missing, so join again.
  useEffect(() => {
    if (status !== "open" || view || hostAway) return;
    const timer = setTimeout(() => socket.current?.reconnect(), REJOIN_AFTER_MS);
    return () => clearTimeout(timer);
  }, [status, view, hostAway]);

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

  if (base === undefined) return <Shell><Loading /></Shell>;
  if (base === null) return <Shell><h1 className="font-headline text-3xl">The quiz is not set up on this site yet.</h1></Shell>;

  if (!code) {
    const codeOk = /^\d{6}$/.test(codeInput.replace(/\D/g, ""));
    return (
      <Shell>
        {ending && (
          <div role="status" className="quiz-card mb-6 bg-[color:var(--quiz-green-soft)] px-5 py-4 text-[#1D3B29]">
            <p className="font-semibold">{ENDINGS[ending].title}</p>
            <p className="mt-1 text-sm">{ENDINGS[ending].body}</p>
          </div>
        )}
        <div className="flex justify-center py-4"><AvatarParade size={48} /></div>
        <div className="quiz-card mt-2 p-6">
          <h1 className="font-headline text-4xl font-medium">Join the quiz</h1>
          <form onSubmit={submitCode} className="mt-5 flex flex-col gap-4">
            <label htmlFor="code" className="text-lg">Code on your teacher&apos;s screen</label>
            <input
              id="code"
              inputMode="numeric"
              autoComplete="off"
              maxLength={7}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/[^\d ]/g, ""))}
              className="quiz-input min-h-16 text-center font-mono text-3xl tracking-[0.3em]"
              placeholder="000000"
            />
            <button type="submit" disabled={!codeOk} className="quiz-button min-h-14 text-lg">Join</button>
          </form>
        </div>
        <p className="mt-6 px-1 text-sm leading-6 text-[color:var(--quiz-muted)]">
          You will get a random animal nickname. No real names, no accounts. Everything from the game is deleted when your teacher ends the session.{" "}
          <Link href="/play/privacy" className="text-[color:var(--quiz-green)] underline decoration-2 underline-offset-4">Privacy</Link>
        </p>
      </Shell>
    );
  }

  const banner =
    status === "reconnecting" ? "Reconnecting…" : hostAway ? "Your teacher's screen has disconnected. Wait here: it should come back." : null;

  return (
    <Shell>
      <div className="mb-5 flex items-center justify-between gap-3 text-sm text-[color:var(--quiz-muted)]">
        {view ? (
          <span className="flex min-w-0 items-center gap-2">
            <Avatar name={view.name} size={36} />
            <span className="truncate">You are <span className="font-semibold text-[color:var(--quiz-ink)]" data-testid="nickname">{view.name}</span></span>
          </span>
        ) : (
          <span>Joining…</span>
        )}
        <span className="quiz-pill shrink-0 bg-[color:var(--quiz-card)] font-mono ring-1 ring-[color:var(--quiz-line)]">{formatCode(code)}</span>
      </div>
      {banner && <p role="status" className="mb-5 rounded-[16px] bg-[color:var(--quiz-star-soft)] px-4 py-3 text-sm text-[#4A3305]">{banner}</p>}
      {view ? (
        <PhoneView view={view} pending={pending} secondsLeft={Math.max(0, Math.ceil((deadline - now) / 1000))} onAnswer={answer} onReroll={() => socket.current?.send({ t: "reroll" })} />
      ) : (
        <p className="flex items-center gap-2 text-lg">Connecting to the room <WaitingDots /></p>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="quiz-root min-h-dvh">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col px-4 py-6">{children}</div>
    </div>
  );
}

const PLACES = ["", "first", "second", "third", "fourth", "fifth"];
const ORDINALS = ["", "1st", "2nd", "3rd", "4th", "5th"];

function Note({ tone, children }: { tone: "star" | "hot" | "green" | "plain"; children: React.ReactNode }) {
  const tones = {
    star: "bg-[color:var(--quiz-star-soft)] text-[#4A3305]",
    hot: "bg-[color:var(--quiz-hot-soft)] text-[#7A2A18]",
    green: "bg-[color:var(--quiz-green-soft)] text-[#1D3B29]",
    plain: "bg-[color:var(--quiz-card)] ring-1 ring-[color:var(--quiz-line)]",
  };
  return <p className={`quiz-rise flex items-center gap-3 rounded-[18px] px-4 py-3 text-base leading-snug ${tones[tone]}`}>{children}</p>;
}

/** What a right answer earned, part by part. */
function Breakdown({ award }: { award: AwardSummary }) {
  const parts = [
    { label: "Speed", value: award.base },
    { label: "Catch-up", value: award.catchUp },
    { label: "Streak", value: award.streak },
    { label: "Learned it", value: award.learned },
  ].filter((part) => part.value > 0);
  return (
    <ul className="mt-4 flex flex-wrap gap-2 text-sm">
      {parts.map((part, i) => (
        <li key={part.label} className="quiz-pop quiz-pill bg-white/20" style={{ animationDelay: `${150 + i * 120}ms` }}>
          {part.label} {i > 0 ? "+" : ""}{formatPoints(part.value)}
        </li>
      ))}
      {award.multiplier > 1 && (
        <li className="quiz-pop quiz-pill bg-[color:var(--quiz-star)] text-[#4A3305]" style={{ animationDelay: `${150 + parts.length * 120}ms` }}>
          × {award.multiplier}
        </li>
      )}
    </ul>
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
        <div aria-live="polite" className="flex flex-col items-center text-center">
          <span key={view.name} className="quiz-pop mt-4"><span className="quiz-bob inline-block"><Avatar name={view.name} size={150} /></span></span>
          <h1 className="mt-5 font-headline text-4xl font-medium">You&apos;re in</h1>
          <p className="mt-3 text-lg">Your nickname is <span className="font-semibold">{view.name}</span>.</p>
          {view.rerollsLeft > 0 && (
            <button type="button" onClick={onReroll} className="quiz-button-quiet mt-4">
              Give me a different name ({view.rerollsLeft} left)
            </button>
          )}
          <div className="quiz-card mt-8 flex w-full flex-col items-center gap-2 px-5 py-5 text-[color:var(--quiz-muted)]">
            <p>Waiting for your teacher to start</p>
            <p className="font-semibold text-[color:var(--quiz-ink)]">{view.setTitle}</p>
            <WaitingDots />
          </div>
        </div>
      );

    case "question": {
      const chosen = view.answered ?? pending;
      return (
        <div>
          <div className="flex items-center justify-between text-sm text-[color:var(--quiz-muted)]">
            <span className="font-medium">Question {view.index + 1} of {view.total}</span>
            <span className={`font-mono text-2xl font-medium tabular-nums ${secondsLeft <= 5 ? "text-[color:var(--quiz-hot)]" : "text-[color:var(--quiz-ink)]"}`} aria-label={`${secondsLeft} seconds left`}>{secondsLeft}</span>
          </div>
          {(view.star || view.double || view.streak >= 2) && (
            <div className="mt-3 flex flex-wrap gap-2 text-sm">
              {view.star && <span className="quiz-pill bg-[color:var(--quiz-star-soft)] text-[#4A3305]"><StarMark size={18} /> Your star: a right answer counts double</span>}
              {view.double && <span className="quiz-pill bg-[color:var(--quiz-hot-soft)] text-[#7A2A18]">Final stretch · double points</span>}
              {view.streak >= 2 && <span className="quiz-pill bg-white text-[#9A3B1A] ring-1 ring-[color:var(--quiz-line)]"><FlameMark size={16} /> {view.streak} in a row</span>}
            </div>
          )}
          <p className="mt-4 text-xl font-medium leading-snug">{view.prompt}</p>
          {view.pictures && <p className="mt-2 text-sm text-[color:var(--quiz-muted)]">The pictures are on your teacher&apos;s screen.</p>}
          {chosen !== null ? (
            <div className="quiz-card quiz-pop mt-8 flex flex-col items-center gap-4 px-5 py-8 text-center" aria-live="polite">
              <span className="inline-flex rounded-[20px] p-3" style={{ background: CHOICE_STYLES[chosen].colour }}>
                <ChoiceMark index={chosen} size={64} inverse />
              </span>
              <p className="text-xl">Answer {view.choices[chosen].label} sent. Wait for the others.</p>
              <span className="text-[color:var(--quiz-muted)]"><WaitingDots /></span>
            </div>
          ) : (
            <div className={`mt-6 grid gap-3 ${view.choices.every((c) => !c.text) ? "grid-cols-2" : "grid-cols-1"}`}>
              {view.choices.map((choice, i) => (
                <button
                  key={choice.label}
                  type="button"
                  onClick={() => onAnswer(i)}
                  className={`flex min-h-20 items-center gap-3 rounded-[20px] p-3 text-left text-lg font-semibold text-white shadow-[0_6px_0_-1px_rgb(30_27_22/0.25)] transition-transform active:translate-y-0.5 ${choice.text ? "" : "justify-center min-h-28"}`}
                  style={{ background: CHOICE_STYLES[i].colour }}
                  aria-label={choice.text ? `${choice.label}: ${choice.text}` : choice.label}
                >
                  <ChoiceMark index={i} size={choice.text ? 44 : 60} inverse />
                  {choice.text && <span className="leading-snug">{choice.text}</span>}
                </button>
              ))}
            </div>
          )}
        </div>
      );
    }

    case "reveal": {
      const right = view.outcome === "correct";
      return (
        <div aria-live="polite" className="flex flex-col gap-3">
          <p className="text-sm font-medium text-[color:var(--quiz-muted)]">Question {view.index + 1} of {view.total}</p>
          <div className={`quiz-pop rounded-[24px] px-5 py-6 ${right ? "bg-[color:var(--quiz-green)] text-white" : "quiz-card"}`}>
            <h1 className="font-headline text-4xl font-medium">
              {right ? "Correct" : view.outcome === "wrong" ? "Not this time" : "No answer"}
            </h1>
            {view.award && (
              <p className="mt-2 font-mono text-4xl font-medium tabular-nums">+<CountUp value={view.award.total} from={0} /></p>
            )}
            {view.award && <Breakdown award={view.award} />}
            <p className={`mt-4 text-lg ${right ? "text-white/90" : ""}`}>The answer was {view.correctLabel}.</p>
          </div>
          <p className="quiz-card flex items-center justify-between px-5 py-4 text-lg">
            Your score: <span className="font-mono text-2xl font-medium tabular-nums">{formatPoints(view.score)}</span>
          </p>
          {view.place !== null ? (
            <Note tone="green">You&apos;re {ORDINALS[view.place]} on the screen{view.climbed > 0 ? `, up ${view.climbed}` : ""}.</Note>
          ) : (
            <>
              {view.climbed > 0 && <Note tone="green">▲ You climbed {view.climbed} {view.climbed === 1 ? "place" : "places"}.</Note>}
              {view.behind === 0 ? (
                <Note tone="plain">Any right answer puts you in the top 5.</Note>
              ) : view.behind !== null && view.behind <= 2500 ? (
                <Note tone="plain">About {formatPoints(view.behind)} points from the top 5.</Note>
              ) : (
                <Note tone="plain">Right answers are worth more the further behind you are. Keep going.</Note>
              )}
            </>
          )}
          {view.newStar && (
            <Note tone="star"><StarMark size={30} className="quiz-shine shrink-0" /> You got a star! Your next right answer counts double.</Note>
          )}
          {!view.newStar && view.star && (
            <Note tone="star"><StarMark size={24} className="shrink-0" /> Your star is still on: your next right answer counts double.</Note>
          )}
          {view.streak >= 2 && <Note tone="plain"><FlameMark size={22} /> {view.streak} right in a row.</Note>}
          {view.nextDouble && <Note tone="hot">Final stretch next: double points.</Note>}
          <p className="mt-2 text-[color:var(--quiz-muted)]">Look at the screen for why.</p>
        </div>
      );
    }

    case "final":
      return (
        <div aria-live="polite" className="flex flex-col items-center text-center">
          <span className="quiz-pop mt-4"><span className={view.place ? "quiz-bob inline-block" : "inline-block"}><Avatar name={view.name} size={150} /></span></span>
          <h1 className="mt-5 font-headline text-4xl font-medium">
            {view.place ? `You came ${PLACES[view.place]}` : "Quiz finished"}
          </h1>
          <p className="quiz-card mt-6 flex w-full items-center justify-between px-5 py-4 text-lg">
            Your score: <span className="font-mono text-2xl font-medium tabular-nums">{formatPoints(view.score)}</span>
          </p>
          {view.bestStreak >= 2 && (
            <p className="quiz-card mt-3 flex w-full items-center justify-between px-5 py-4 text-lg">
              Best streak <span className="flex items-center gap-1 font-mono text-2xl font-medium"><FlameMark size={22} />{view.bestStreak}</span>
            </p>
          )}
          <p className="mt-6 text-[color:var(--quiz-muted)]">Leave this page open until your teacher ends the session.</p>
        </div>
      );
  }
}

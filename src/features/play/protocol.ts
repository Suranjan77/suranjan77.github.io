/**
 * Messages between the teacher's screen and the students' phones. The relay
 * passes them through unread; the teacher's screen holds the game.
 */

export type ChoiceSummary = { label: string; text?: string };

/** What one student's phone shows. Sent by the teacher's screen whenever it changes. */
export type PlayerView =
  | { phase: "lobby"; name: string; rerollsLeft: number; setTitle: string }
  | {
      phase: "question";
      name: string;
      index: number;
      total: number;
      prompt: string;
      choices: ChoiceSummary[];
      /** True when the choices are pictures on the teacher's screen. */
      pictures: boolean;
      secondsLeft: number;
      answered: number | null;
    }
  | {
      phase: "reveal";
      name: string;
      index: number;
      total: number;
      outcome: "correct" | "wrong" | "none";
      gained: number;
      score: number;
      correctLabel: string;
    }
  | { phase: "final"; name: string; score: number; place: 1 | 2 | 3 | null };

export type HostToPlayer =
  | { t: "view"; view: PlayerView }
  | { t: "ended" }
  | { t: "removed" };

export type PlayerToHost =
  | { t: "reroll" }
  | { t: "answer"; index: number; choice: number };

/** Relay-level message the relay itself sends to phones. */
export type RelayToPlayer = { t: "relay.host"; up: boolean };

export function parsePlayerMessage(value: unknown): PlayerToHost | null {
  if (typeof value !== "object" || value === null) return null;
  const message = value as Record<string, unknown>;
  if (message.t === "reroll") return { t: "reroll" };
  if (
    message.t === "answer" &&
    Number.isInteger(message.index) &&
    Number.isInteger(message.choice)
  ) {
    return { t: "answer", index: message.index as number, choice: message.choice as number };
  }
  return null;
}

export function parseHostMessage(value: unknown): HostToPlayer | RelayToPlayer | null {
  if (typeof value !== "object" || value === null) return null;
  const message = value as Record<string, unknown>;
  switch (message.t) {
    case "view":
      return typeof message.view === "object" && message.view !== null ? (message as HostToPlayer) : null;
    case "ended":
    case "removed":
      return { t: message.t };
    case "relay.host":
      return { t: "relay.host", up: message.up === true };
    default:
      return null;
  }
}

/** Close codes sent by the relay (see relay/src/rules.ts). */
export const RelayClose = {
  ended: 4000,
  removed: 4001,
  replaced: 4002,
  full: 4003,
  notFound: 4004,
  badRequest: 4400,
  forbidden: 4403,
  tooFast: 4429,
} as const;

export function isFinalClose(code: number): boolean {
  return code >= 4000 && code < 5000;
}

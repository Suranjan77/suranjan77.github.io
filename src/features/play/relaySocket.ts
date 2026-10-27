import { isFinalClose } from "./protocol";

/**
 * The relay's address. Set NEXT_PUBLIC_QUIZ_RELAY_URL at build time
 * (e.g. wss://classroom-quiz-relay.example.workers.dev). On localhost it falls
 * back to the relay's `npm run dev` address.
 */
export function relayBaseUrl(): string | null {
  const configured = process.env.NEXT_PUBLIC_QUIZ_RELAY_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");
  if (typeof window !== "undefined" && ["localhost", "127.0.0.1"].includes(window.location.hostname)) {
    return `ws://${window.location.hostname}:8787`;
  }
  return null;
}

export type SocketStatus = "connecting" | "open" | "reconnecting" | "closed";

type Handlers = {
  onMessage: (message: unknown) => void;
  onStatus: (status: SocketStatus) => void;
  /** The relay closed the connection for good (a 4xxx code): the session ended, was not found, and so on. */
  onFinalClose: (code: number, reason: string) => void;
};

const PING_MS = 15_000;
/** No pong this long after a ping: the connection is dead even if the browser has not noticed. */
const PONG_TIMEOUT_MS = 8_000;
/** After a phone wakes, a live connection answers a ping within this. */
const WAKE_PONG_TIMEOUT_MS = 4_000;
/** A connection that has not opened by now is given up and tried again. */
const CONNECT_TIMEOUT_MS = 10_000;
const MAX_BACKOFF_MS = 8_000;

/**
 * A WebSocket to the relay that reconnects after a network drop or a phone
 * waking from sleep, and stops for good when the relay closes it with an
 * application code.
 *
 * Browsers can keep a dead connection looking open for minutes (a locked
 * phone, a change of Wi-Fi), and a connection on a poor network can hang
 * before it opens. Both used to leave a screen waiting for ever, so the socket
 * pings the relay and starts again when no answer comes.
 */
export class RelaySocket {
  private ws: WebSocket | null = null;
  private stopped = false;
  private attempts = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;
  private deadTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(private readonly url: () => string, private readonly handlers: Handlers) {}

  start(): void {
    this.stopped = false;
    document.addEventListener("visibilitychange", this.onVisible);
    window.addEventListener("online", this.onOnline);
    this.open();
  }

  /** Drop this connection and open a fresh one now. */
  reconnect(): void {
    if (this.stopped) return;
    this.drop();
    this.open();
  }

  send(message: unknown): boolean {
    if (this.ws?.readyState !== WebSocket.OPEN) return false;
    this.ws.send(JSON.stringify(message));
    return true;
  }

  stop(): void {
    this.stopped = true;
    document.removeEventListener("visibilitychange", this.onVisible);
    window.removeEventListener("online", this.onOnline);
    this.clearTimers();
    const ws = this.ws;
    this.ws = null;
    if (ws && ws.readyState <= WebSocket.OPEN) ws.close(1000);
    this.handlers.onStatus("closed");
  }

  private open(): void {
    this.clearTimers();
    this.handlers.onStatus(this.attempts === 0 ? "connecting" : "reconnecting");
    const ws = new WebSocket(this.url());
    this.ws = ws;
    this.deadTimer = setTimeout(() => this.retryNow(), CONNECT_TIMEOUT_MS);

    ws.onopen = () => {
      if (ws !== this.ws) return;
      this.attempts = 0;
      this.clearDeadTimer();
      this.handlers.onStatus("open");
      this.pingTimer = setInterval(() => this.ping(PONG_TIMEOUT_MS), PING_MS);
    };
    ws.onmessage = (event) => {
      if (ws !== this.ws) return;
      // Anything from the relay shows the connection is alive.
      this.clearDeadTimer();
      if (event.data === "pong") return;
      try {
        this.handlers.onMessage(JSON.parse(event.data as string));
      } catch {
        // Not JSON: ignore.
      }
    };
    ws.onclose = (event) => {
      if (ws !== this.ws) return;
      this.ws = null;
      this.clearTimers();
      if (this.stopped) return;
      if (isFinalClose(event.code)) {
        this.stopped = true;
        this.handlers.onStatus("closed");
        this.handlers.onFinalClose(event.code, event.reason);
        return;
      }
      this.scheduleRetry();
    };
  }

  /** Ping, and start again if no answer comes within `timeout`. */
  private ping(timeout: number): void {
    const ws = this.ws;
    if (ws?.readyState !== WebSocket.OPEN || this.deadTimer) return;
    ws.send("ping");
    this.deadTimer = setTimeout(() => this.retryNow(), timeout);
  }

  /** Forget the current connection without waiting for the browser to report it closed. */
  private drop(): void {
    const ws = this.ws;
    this.ws = null;
    this.clearTimers();
    if (ws && ws.readyState <= WebSocket.OPEN) {
      try {
        ws.close(1000);
      } catch {
        // Already closing.
      }
    }
  }

  private retryNow(): void {
    if (this.stopped) return;
    this.drop();
    this.scheduleRetry();
  }

  private scheduleRetry(): void {
    this.attempts += 1;
    this.handlers.onStatus("reconnecting");
    const delay = Math.min(500 * 2 ** (this.attempts - 1), MAX_BACKOFF_MS);
    this.retryTimer = setTimeout(() => this.open(), delay);
  }

  /** A phone waking up: check the connection survived the sleep, rather than trusting it. */
  private readonly onVisible = () => {
    if (document.visibilityState !== "visible" || this.stopped) return;
    if (!this.ws) this.open();
    else if (this.ws.readyState === WebSocket.OPEN) {
      this.clearDeadTimer();
      this.ping(WAKE_PONG_TIMEOUT_MS);
    }
  };

  /** Back on the network: try now rather than waiting out the backoff. */
  private readonly onOnline = () => {
    if (!this.stopped && this.ws?.readyState !== WebSocket.OPEN) this.reconnect();
  };

  private clearDeadTimer(): void {
    if (this.deadTimer) clearTimeout(this.deadTimer);
    this.deadTimer = null;
  }

  private clearTimers(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.clearDeadTimer();
    this.retryTimer = null;
    this.pingTimer = null;
  }
}

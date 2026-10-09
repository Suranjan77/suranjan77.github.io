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

const PING_MS = 25_000;
const MAX_BACKOFF_MS = 8_000;

/**
 * A WebSocket to the relay that reconnects after a network drop or a phone
 * waking from sleep, and stops for good when the relay closes it with an
 * application code.
 */
export class RelaySocket {
  private ws: WebSocket | null = null;
  private stopped = false;
  private attempts = 0;
  private retryTimer: ReturnType<typeof setTimeout> | null = null;
  private pingTimer: ReturnType<typeof setInterval> | null = null;

  constructor(private readonly url: () => string, private readonly handlers: Handlers) {}

  start(): void {
    this.stopped = false;
    document.addEventListener("visibilitychange", this.onVisible);
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

    ws.onopen = () => {
      if (ws !== this.ws) return;
      this.attempts = 0;
      this.handlers.onStatus("open");
      this.pingTimer = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) ws.send("ping");
      }, PING_MS);
    };
    ws.onmessage = (event) => {
      if (ws !== this.ws || event.data === "pong") return;
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

  private scheduleRetry(): void {
    this.attempts += 1;
    this.handlers.onStatus("reconnecting");
    const delay = Math.min(500 * 2 ** (this.attempts - 1), MAX_BACKOFF_MS);
    this.retryTimer = setTimeout(() => this.open(), delay);
  }

  private readonly onVisible = () => {
    if (document.visibilityState === "visible" && !this.stopped && !this.ws) this.open();
  };

  private clearTimers(): void {
    if (this.retryTimer) clearTimeout(this.retryTimer);
    if (this.pingTimer) clearInterval(this.pingTimer);
    this.retryTimer = null;
    this.pingTimer = null;
  }
}

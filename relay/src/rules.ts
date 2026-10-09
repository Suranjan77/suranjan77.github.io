/** Limits and input checks shared by the Worker and the room. */

export const MAX_PLAYERS = 60;
export const MAX_ROOM_LIFETIME_MS = 4 * 60 * 60 * 1000;
export const PLAYER_MESSAGE_MAX_BYTES = 1024;
export const HOST_MESSAGE_MAX_BYTES = 64 * 1024;
/** Messages a socket may send per second before it is closed. */
export const PLAYER_MESSAGES_PER_SECOND = 8;
export const HOST_MESSAGES_PER_SECOND = 60;

/** Close codes the browser clients understand (4000–4999 are application codes). */
export const CloseCode = {
  ended: 4000,
  removed: 4001,
  replaced: 4002,
  full: 4003,
  notFound: 4004,
  badRequest: 4400,
  forbidden: 4403,
  tooFast: 4429,
} as const;

const ROOM_CODE = /^[1-9]\d{5}$/;
const PLAYER_ID = /^[A-Za-z0-9_-]{16,64}$/;

export function isRoomCode(value: string | null): value is string {
  return value !== null && ROOM_CODE.test(value);
}

export function isPlayerId(value: string | null): value is string {
  return value !== null && PLAYER_ID.test(value);
}

export function isAllowedOrigin(origin: string | null, allowed: string): boolean {
  if (!origin) return false;
  return allowed
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)
    .includes(origin);
}

/** A uniformly random six-digit code with no leading zero. */
export function newRoomCode(): string {
  const buffer = new Uint32Array(1);
  const limit = Math.floor(0xffffffff / 900000) * 900000;
  for (;;) {
    crypto.getRandomValues(buffer);
    if (buffer[0] < limit) return String(100000 + (buffer[0] % 900000));
  }
}

export function newHostToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

/** The teacher passcode must be at least this long, or no room can be opened. */
export const MIN_TEACHER_KEY_LENGTH = 16;

/** Compares a submitted passcode with the configured one in constant time. */
export async function teacherKeyMatches(given: unknown, configured: string | undefined): Promise<boolean> {
  if (typeof given !== "string" || !configured || configured.length < MIN_TEACHER_KEY_LENGTH) return false;
  const encode = async (text: string) => crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return crypto.subtle.timingSafeEqual(await encode(given), await encode(configured));
}

export async function sha256(text: string): Promise<string> {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text));
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

/** Fixed-window counter: true while the socket stays under its per-second allowance. */
export class RateWindow {
  private windowStart = 0;
  private count = 0;

  constructor(private readonly perSecond: number) {}

  allow(now: number): boolean {
    if (now - this.windowStart >= 1000) {
      this.windowStart = now;
      this.count = 0;
    }
    this.count += 1;
    return this.count <= this.perSecond;
  }
}

#!/usr/bin/env node
/**
 * Load test: several classrooms at once, each with a full room of phones that
 * all answer in the same instant. It drives the relay the way the teacher's
 * screen and the phones do (see src/features/play/HostApp.tsx), and fails if
 * any message is lost or any socket is closed when it should not be.
 *
 *   npm run stress                       starts the relay locally and tests it
 *   RELAY_URL=wss://… ORIGIN=https://suranjan77.github.io TEACHER_KEY=… npm run stress
 *                                        tests a deployed relay (each run opens ROOMS rooms)
 *
 * Settings (environment): ROOMS (4), PLAYERS per room (60, the relay's limit),
 * ROUNDS (5), OVERFLOW extra phones refused by a full room (10).
 */
import { spawn } from "node:child_process";
import { randomBytes } from "node:crypto";
import { setTimeout as sleep } from "node:timers/promises";

const ROOMS = Number(process.env.ROOMS ?? 4);
const PLAYERS = Number(process.env.PLAYERS ?? 60);
const ROUNDS = Number(process.env.ROUNDS ?? 5);
const OVERFLOW = Number(process.env.OVERFLOW ?? 10);
/** The teacher's screen sends views to this many phones per message, as HostApp does. */
const BATCH_SIZE = 20;
/** wrangler dev delivers some events late, so waits are generous. */
const WAIT_MS = 30_000;

const CloseCode = { ended: 4000, full: 4003 };

let relayProcess = null;
let RELAY = process.env.RELAY_URL?.replace(/\/+$/, "");
let ORIGIN = process.env.ORIGIN ?? "http://localhost:3000";
let TEACHER_KEY = process.env.TEACHER_KEY;

if (!RELAY) {
  const port = 8789;
  TEACHER_KEY = "stress-teacher-passcode";
  ORIGIN = "http://localhost:3000";
  RELAY = `ws://127.0.0.1:${port}`;
  relayProcess = spawn(
    "npx",
    [
      "wrangler", "dev", "--port", String(port), "--ip", "127.0.0.1",
      "--var", `ALLOWED_ORIGINS:${ORIGIN}`,
      "--var", "ROOM_JURISDICTION:none",
      "--var", `TEACHER_KEY:${TEACHER_KEY}`,
    ],
    { stdio: ["ignore", "pipe", "pipe"], detached: true, env: { ...process.env, WRANGLER_SEND_METRICS: "false" } },
  );
  relayProcess.stdout.resume();
  relayProcess.stderr.resume();
  let ready = false;
  for (let attempt = 0; attempt < 120 && !ready; attempt += 1) {
    try {
      ready = (await fetch(`http://127.0.0.1:${port}/health`)).ok;
    } catch {
      await sleep(500);
    }
  }
  if (!ready) fail("The local relay did not start.");
} else if (!TEACHER_KEY) {
  fail("Set TEACHER_KEY to test a deployed relay.");
}

const HTTP = RELAY.replace(/^ws/, "http");

function stopRelay() {
  if (relayProcess) {
    try { process.kill(-relayProcess.pid, "SIGTERM"); } catch { /* already stopped */ }
  }
}

function fail(message) {
  console.error(`\nFAIL: ${message}`);
  stopRelay();
  process.exit(1);
}

/** Resolves when `check()` is true, polling; rejects with `what` after WAIT_MS. */
async function until(check, what) {
  const start = Date.now();
  while (!check()) {
    if (Date.now() - start > WAIT_MS) throw new Error(`Timed out: ${what}`);
    await sleep(20);
  }
}

function percentile(values, p) {
  if (values.length === 0) return 0;
  const sorted = [...values].sort((a, b) => a - b);
  return sorted[Math.min(sorted.length - 1, Math.floor((p / 100) * sorted.length))];
}

function socket(path) {
  const ws = new WebSocket(`${RELAY}${path}`, { headers: { Origin: ORIGIN } });
  const state = { ws, open: false, closed: null, onMessage: () => {} };
  ws.onopen = () => { state.open = true; };
  ws.onmessage = (event) => {
    if (event.data !== "pong") state.onMessage(JSON.parse(event.data));
  };
  ws.onclose = (event) => { state.closed = { code: event.code, reason: event.reason }; };
  return state;
}

/** A view the size of a real question view: a long prompt and four text choices. */
function questionView(round) {
  return {
    phase: "question",
    name: "Crimson Hedgehog",
    index: round,
    total: ROUNDS,
    prompt: `Round ${round}: ${"Which of these layouts puts the most important content where the eye lands first? ".repeat(2)}`,
    choices: ["A", "B", "C", "D"].map((label) => ({ label, text: `${label}: a reasonably long answer choice written for a projector` })),
    pictures: false,
    secondsLeft: 20,
    answered: null,
  };
}

/** One classroom: the teacher's screen and its phones. */
class Classroom {
  constructor(index) {
    this.index = index;
    this.players = new Map();
    this.answersAtHost = 0;
    this.unexpected = [];
  }

  async open() {
    const response = await fetch(`${HTTP}/rooms`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Origin: ORIGIN },
      body: JSON.stringify({ key: TEACHER_KEY }),
    });
    if (!response.ok) throw new Error(`Room ${this.index}: POST /rooms answered ${response.status}`);
    ({ code: this.code, token: this.token } = await response.json());
    await this.connectHost();
  }

  async connectHost() {
    this.roomMessage = null;
    this.host = socket(`/host?code=${this.code}&token=${encodeURIComponent(this.token)}`);
    this.host.onMessage = (message) => this.fromRelay(message);
    await until(() => this.roomMessage, `room ${this.index}: teacher's screen connected`);
  }

  /** What the teacher's screen does with relay messages: welcome phones, acknowledge answers. */
  fromRelay(message) {
    if (message.t === "room") this.roomMessage = message;
    else if (message.t === "joined") this.hostSend({ t: "send", to: message.pid, m: { t: "view", view: { phase: "lobby", name: "Crimson Hedgehog", rerollsLeft: 3, setTitle: "Stress" } } });
    else if (message.t === "from" && message.m?.t === "answer") {
      this.answersAtHost += 1;
      this.hostSend({ t: "send", to: message.pid, m: { t: "view", view: { ...questionView(message.m.index), answered: message.m.choice } } });
    }
  }

  hostSend(message) {
    if (this.host.ws.readyState === WebSocket.OPEN) this.host.ws.send(JSON.stringify(message));
  }

  async join(count) {
    const phones = Array.from({ length: count }, () => {
      const pid = randomBytes(16).toString("hex");
      const phone = socket(`/join?code=${this.code}&pid=${pid}`);
      Object.assign(phone, { pid, lobby: false, views: new Map(), acks: new Map() });
      phone.onMessage = (message) => {
        if (message.t !== "view") return;
        const { view } = message;
        if (view.phase === "lobby") phone.lobby = true;
        if (view.phase !== "question") return;
        if (view.answered !== null) {
          phone.acks.set(view.index, performance.now());
          return;
        }
        phone.views.set(view.index, performance.now());
        // Answer the instant the question lands: the whole room taps at once.
        phone.answeredAt = performance.now();
        phone.ws.send(JSON.stringify({ t: "answer", index: view.index, choice: Math.floor(Math.random() * 4) }));
      };
      this.players.set(pid, phone);
      return phone;
    });
    await until(() => phones.every((p) => p.lobby), `room ${this.index}: ${count} phones welcomed`);
    return phones;
  }

  /** Sends a question view to every phone, as HostApp's commit does. */
  broadcastRound(round) {
    const items = [...this.players.keys()].map((pid) => ({ to: pid, m: { t: "view", view: questionView(round) } }));
    for (let i = 0; i < items.length; i += BATCH_SIZE) this.hostSend({ t: "batch", items: items.slice(i, i + BATCH_SIZE) });
  }

  checkSockets(when) {
    for (const phone of this.players.values()) {
      if (phone.closed) this.unexpected.push(`room ${this.index} phone closed ${when}: ${phone.closed.code} ${phone.closed.reason}`);
    }
    if (this.host.closed) this.unexpected.push(`room ${this.index} teacher closed ${when}: ${this.host.closed.code} ${this.host.closed.reason}`);
  }
}

const started = performance.now();
const classrooms = Array.from({ length: ROOMS }, (_, i) => new Classroom(i));
const totalPhones = ROOMS * PLAYERS;
console.log(`Relay ${RELAY}: ${ROOMS} rooms × ${PLAYERS} phones = ${totalPhones} phones, ${ROUNDS} rounds\n`);

try {
  // 1. Every teacher opens a room at the same moment.
  let t = performance.now();
  await Promise.all(classrooms.map((c) => c.open()));
  console.log(`✔ ${ROOMS} rooms opened at once (${Math.round(performance.now() - t)} ms)`);

  // 2. Every phone in every room joins at the same moment.
  t = performance.now();
  await Promise.all(classrooms.map((c) => c.join(PLAYERS)));
  console.log(`✔ ${totalPhones} phones joined at once and were welcomed (${Math.round(performance.now() - t)} ms)`);

  // 3. A full room turns extra phones away with a reason, and keeps everyone already in.
  if (OVERFLOW > 0) {
    const room = classrooms[0];
    const extra = Array.from({ length: OVERFLOW }, () => socket(`/join?code=${room.code}&pid=${randomBytes(16).toString("hex")}`));
    await until(() => extra.every((s) => s.closed), "extra phones refused");
    const refused = extra.filter((s) => s.closed.code === CloseCode.full).length;
    if (refused !== OVERFLOW) throw new Error(`Only ${refused} of ${OVERFLOW} extra phones were refused as "full"`);
    console.log(`✔ ${OVERFLOW} extra phones were refused by the full room with "Room is full"`);
  }

  // 4. Rounds: every phone in every room answers the instant its question arrives.
  const delivery = [];
  const roundTrip = [];
  for (let round = 0; round < ROUNDS; round += 1) {
    const sentAt = performance.now();
    for (const c of classrooms) c.broadcastRound(round);
    const phones = classrooms.flatMap((c) => [...c.players.values()]);
    await until(() => phones.every((p) => p.acks.has(round)), `round ${round + 1}: every answer acknowledged`);
    for (const p of phones) {
      delivery.push(p.views.get(round) - sentAt);
      roundTrip.push(p.acks.get(round) - p.answeredAt);
    }
    const expected = (round + 1) * PLAYERS;
    for (const c of classrooms) {
      if (c.answersAtHost !== expected) throw new Error(`Room ${c.index}: the teacher's screen got ${c.answersAtHost} answers, expected ${expected}`);
      c.checkSockets(`in round ${round + 1}`);
    }
    console.log(`✔ round ${round + 1}: ${phones.length} questions delivered, ${phones.length} simultaneous answers acknowledged (${Math.round(performance.now() - sentAt)} ms)`);
    // A phone may send 8 messages a second; a real round lasts 20 seconds.
    await sleep(1100);
  }

  // 5. One teacher's screen drops and reconnects mid-game: it gets every phone back.
  const dropped = classrooms[0];
  dropped.host.ws.close(1000);
  await until(() => dropped.host.closed, "teacher's screen closed");
  t = performance.now();
  await dropped.connectHost();
  const back = dropped.roomMessage.players.length;
  if (back !== PLAYERS) throw new Error(`After reconnecting, the teacher's screen saw ${back} phones, expected ${PLAYERS}`);
  console.log(`✔ a teacher's screen reconnected and got all ${back} phones back (${Math.round(performance.now() - t)} ms)`);

  const unexpected = classrooms.flatMap((c) => c.unexpected);
  if (unexpected.length) throw new Error(`Unexpected closes:\n  ${unexpected.join("\n  ")}`);

  // 6. Ending each session closes every phone with "ended".
  t = performance.now();
  for (const c of classrooms) c.hostSend({ t: "end" });
  const phones = classrooms.flatMap((c) => [...c.players.values()]);
  await until(() => phones.every((p) => p.closed), "every phone closed after ending");
  const ended = phones.filter((p) => p.closed.code === CloseCode.ended).length;
  if (ended !== phones.length) throw new Error(`${phones.length - ended} phones closed with something other than "ended"`);
  console.log(`✔ ending the sessions closed all ${phones.length} phones (${Math.round(performance.now() - t)} ms)`);

  const ms = (v) => `${Math.round(v)} ms`;
  console.log(`\nQuestion delivery to phones: p50 ${ms(percentile(delivery, 50))}, p95 ${ms(percentile(delivery, 95))}, max ${ms(percentile(delivery, 100))}`);
  console.log(`Answer → acknowledgement:    p50 ${ms(percentile(roundTrip, 50))}, p95 ${ms(percentile(roundTrip, 95))}, max ${ms(percentile(roundTrip, 100))}`);
  console.log(`\nPASS in ${((performance.now() - started) / 1000).toFixed(1)} s`);
  stopRelay();
  process.exit(0);
} catch (error) {
  fail(error.message);
}

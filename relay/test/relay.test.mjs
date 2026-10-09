import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { test as nodeTest } from "node:test";
import { setTimeout as sleep } from "node:timers/promises";

// wrangler dev delivers some close events about ten seconds late, so tests get room for that.
const test = (name, fn) => nodeTest(name, { timeout: 45_000 }, fn);

const RELAY = process.env.RELAY_URL ?? "ws://127.0.0.1:8788";
const ORIGIN = "http://localhost:3000";

/** A WebSocket with a queue of parsed messages and a promise for its close event. */
function connect(path, origin = ORIGIN) {
  const ws = new WebSocket(`${RELAY}${path}`, { headers: { Origin: origin } });
  const queue = [];
  const waiters = [];
  ws.onmessage = (event) => {
    const data = event.data === "pong" ? "pong" : JSON.parse(event.data);
    const index = waiters.findIndex((waiter) => waiter.match(data));
    if (index >= 0) waiters.splice(index, 1)[0].resolve(data);
    else queue.push(data);
  };
  const closed = new Promise((resolve) => {
    ws.onclose = (event) => resolve({ code: event.code, reason: event.reason });
  });
  const opened = new Promise((resolve) => {
    ws.onopen = () => resolve(true);
    ws.onerror = () => resolve(false);
  });
  return {
    ws,
    opened,
    closed,
    send: (message) => ws.send(typeof message === "string" ? message : JSON.stringify(message)),
    next(match = () => true, timeout = 5000) {
      const index = queue.findIndex(match);
      if (index >= 0) return Promise.resolve(queue.splice(index, 1)[0]);
      return new Promise((resolve, reject) => {
        const waiter = { match, resolve };
        waiters.push(waiter);
        setTimeout(() => {
          const at = waiters.indexOf(waiter);
          if (at >= 0) {
            waiters.splice(at, 1);
            reject(new Error("Timed out waiting for a message"));
          }
        }, timeout);
      });
    },
    close: () => ws.close(),
  };
}

const playerId = () => randomBytes(16).toString("hex");
const type = (t) => (message) => message.t === t;

async function openRoom() {
  const host = connect("/host");
  const room = await host.next(type("room"));
  return { host, room };
}

test("refuses a connection from another site", async () => {
  const stranger = connect("/host", "https://example.com");
  assert.equal(await stranger.opened, false);
});

test("a teacher opens a room and a student's messages reach only the teacher", async () => {
  const { host, room } = await openRoom();
  assert.match(room.code, /^[1-9]\d{5}$/);
  assert.equal(typeof room.token, "string");
  assert.deepEqual(room.players, []);

  const pid = playerId();
  const player = connect(`/join?code=${room.code}&pid=${pid}`);
  assert.deepEqual(await host.next(type("joined")), { t: "joined", pid });
  await player.opened;

  player.send({ t: "answer", index: 0, choice: 2 });
  assert.deepEqual(await host.next(type("from")), { t: "from", pid, m: { t: "answer", index: 0, choice: 2 } });

  host.send({ t: "batch", items: [{ to: pid, m: { t: "state", phase: "lobby" } }] });
  assert.deepEqual(await player.next(), { t: "state", phase: "lobby" });

  host.send({ t: "end" });
  assert.equal((await player.closed).code, 4000);
  assert.equal((await host.closed).code, 4000);
});

test("ending a session deletes the room", async () => {
  const { host, room } = await openRoom();
  host.send({ t: "end" });
  await host.closed;

  const late = connect(`/join?code=${room.code}&pid=${playerId()}`);
  assert.equal((await late.closed).code, 4004);
  const teacherAgain = connect(`/host?code=${room.code}&token=${room.token}`);
  assert.equal((await teacherAgain.closed).code, 4004);
});

test("joining a room that does not exist is refused with a reason", async () => {
  const player = connect(`/join?code=123456&pid=${playerId()}`);
  assert.equal((await player.closed).code, 4004);
});

test("the teacher can reconnect with the token, and only with the token", async () => {
  const { host, room } = await openRoom();
  const pid = playerId();
  const player = connect(`/join?code=${room.code}&pid=${pid}`);
  await host.next(type("joined"));

  host.close();
  assert.deepEqual(await player.next(type("relay.host")), { t: "relay.host", up: false });

  const impostor = connect(`/host?code=${room.code}&token=wrong`);
  assert.equal((await impostor.closed).code, 4403);

  const back = connect(`/host?code=${room.code}&token=${room.token}`);
  const again = await back.next(type("room"));
  assert.deepEqual(again.players, [pid]);
  assert.deepEqual(await player.next(type("relay.host")), { t: "relay.host", up: true });

  back.send({ t: "end" });
  await player.closed;
});

test("a room whose teacher does not return is deleted after the grace period", async () => {
  const { host, room } = await openRoom();
  const player = connect(`/join?code=${room.code}&pid=${playerId()}`);
  await host.next(type("joined"));
  host.close();

  const closed = await player.closed;
  assert.equal(closed.code, 4000);
  assert.equal(closed.reason, "Session expired");

  await sleep(200);
  const late = connect(`/join?code=${room.code}&pid=${playerId()}`);
  assert.equal((await late.closed).code, 4004);
});

test("a student's second tab replaces the first, and the teacher can remove a student", async () => {
  const { host, room } = await openRoom();
  const pid = playerId();
  const first = connect(`/join?code=${room.code}&pid=${pid}`);
  await host.next(type("joined"));
  const second = connect(`/join?code=${room.code}&pid=${pid}`);
  assert.equal((await first.closed).code, 4002);
  await host.next(type("joined"));

  host.send({ t: "remove", to: pid });
  assert.equal((await second.closed).code, 4001);

  host.send({ t: "end" });
  await host.closed;
});

test("oversized and too-frequent student messages close the connection", async () => {
  const { host, room } = await openRoom();
  const big = connect(`/join?code=${room.code}&pid=${playerId()}`);
  await big.opened;
  big.send({ t: "answer", padding: "x".repeat(2000) });
  assert.equal((await big.closed).code, 4400);

  const chatty = connect(`/join?code=${room.code}&pid=${playerId()}`);
  await chatty.opened;
  for (let i = 0; i < 20; i += 1) chatty.send({ t: "answer", i });
  assert.equal((await chatty.closed).code, 4429);

  host.send({ t: "end" });
  await host.closed;
});

test("keep-alive pings are answered", async () => {
  const { host } = await openRoom();
  host.send("ping");
  assert.equal(await host.next((message) => message === "pong"), "pong");
  host.send({ t: "end" });
  await host.closed;
});

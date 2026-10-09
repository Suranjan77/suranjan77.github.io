import { DurableObject } from "cloudflare:workers";
import type { Env } from "./index";
import {
  CloseCode,
  HOST_MESSAGES_PER_SECOND,
  HOST_MESSAGE_MAX_BYTES,
  MAX_PLAYERS,
  MAX_ROOM_LIFETIME_MS,
  PLAYER_MESSAGES_PER_SECOND,
  PLAYER_MESSAGE_MAX_BYTES,
  RateWindow,
  isPlayerId,
  newHostToken,
  sha256,
} from "./rules";

/**
 * One quiz room. It forwards messages between the teacher's screen and the
 * students' phones and keeps nothing about them: no nicknames, answers or
 * scores pass through storage. The only stored record is the room's own
 * metadata (its code, a hash of the teacher's reconnect token and its start
 * time), and ending the room deletes that too.
 *
 * Messages, all JSON text:
 *   relay → host    {t:"room", code, token, players}  {t:"joined", pid}  {t:"left", pid}  {t:"from", pid, m}
 *   host → relay    {t:"send", to, m}  {t:"batch", items:[{to, m}]}  {t:"broadcast", m}  {t:"remove", to}  {t:"end"}
 *   relay → player  the host's `m`, verbatim; {t:"relay.host", up} when the teacher's screen drops or returns
 *   player → relay  any JSON object, delivered to the host as {t:"from", pid, m}
 * The text "ping" is answered "pong" without waking the room.
 */

type Attachment = { role: "host" } | { role: "player"; pid: string };

type Meta = { code: string; tokenHash: string; createdAt: number };

type HostMessage =
  | { t: "send"; to: string; m: unknown }
  | { t: "batch"; items: { to: string; m: unknown }[] }
  | { t: "broadcast"; m: unknown }
  | { t: "remove"; to: string }
  | { t: "end" };

export class Room extends DurableObject<Env> {
  private readonly rates = new WeakMap<WebSocket, RateWindow>();

  constructor(ctx: DurableObjectState, env: Env) {
    super(ctx, env);
    ctx.setWebSocketAutoResponse(new WebSocketRequestResponsePair("ping", "pong"));
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const action = url.searchParams.get("action");
    const code = url.searchParams.get("code") ?? "";
    const meta = await this.ctx.storage.get<Meta>("meta");

    if (action === "create") {
      if (meta || this.ctx.getWebSockets().length > 0) return new Response(null, { status: 409 });
      const token = newHostToken();
      const created: Meta = { code, tokenHash: await sha256(token), createdAt: Date.now() };
      await this.ctx.storage.put("meta", created);
      await this.ctx.storage.setAlarm(created.createdAt + MAX_ROOM_LIFETIME_MS);
      return this.acceptHost(created, token);
    }

    const [client, server] = Object.values(new WebSocketPair());

    if (!meta) return this.refuse(client, server, CloseCode.notFound, "Room not found");

    if (action === "host") {
      const token = url.searchParams.get("token") ?? "";
      if ((await sha256(token)) !== meta.tokenHash) {
        return this.refuse(client, server, CloseCode.forbidden, "Not this room's teacher");
      }
      for (const old of this.sockets("host")) old.close(CloseCode.replaced, "Opened elsewhere");
      await this.ctx.storage.setAlarm(meta.createdAt + MAX_ROOM_LIFETIME_MS);
      this.broadcastToPlayers({ t: "relay.host", up: true });
      return this.acceptHost(meta, token);
    }

    if (action === "join") {
      const pid = url.searchParams.get("pid");
      if (!isPlayerId(pid)) return this.refuse(client, server, CloseCode.badRequest, "Bad player id");
      const others = new Set(this.sockets("player").map((ws) => this.attachment(ws)).flatMap((a) => (a?.role === "player" && a.pid !== pid ? [a.pid] : [])));
      if (others.size >= MAX_PLAYERS) return this.refuse(client, server, CloseCode.full, "Room is full");
      for (const old of this.socketsOf(pid)) old.close(CloseCode.replaced, "Opened elsewhere");

      this.ctx.acceptWebSocket(server, [`p:${pid}`]);
      server.serializeAttachment({ role: "player", pid } satisfies Attachment);
      const host = this.sockets("host");
      if (host.length === 0) this.deliver([server], { t: "relay.host", up: false });
      this.sendToHost({ t: "joined", pid });
      return new Response(null, { status: 101, webSocket: client });
    }

    return this.refuse(client, server, CloseCode.badRequest, "Unknown action");
  }

  async webSocketMessage(ws: WebSocket, data: string | ArrayBuffer): Promise<void> {
    const who = this.attachment(ws);
    if (!who) return;
    const isHost = who.role === "host";

    if (typeof data !== "string") return ws.close(CloseCode.badRequest, "Text only");
    const limit = isHost ? HOST_MESSAGE_MAX_BYTES : PLAYER_MESSAGE_MAX_BYTES;
    if (data.length > limit) return ws.close(CloseCode.badRequest, "Message too large");

    let rate = this.rates.get(ws);
    if (!rate) {
      rate = new RateWindow(isHost ? HOST_MESSAGES_PER_SECOND : PLAYER_MESSAGES_PER_SECOND);
      this.rates.set(ws, rate);
    }
    if (!rate.allow(Date.now())) return ws.close(CloseCode.tooFast, "Too many messages");

    let message: unknown;
    try {
      message = JSON.parse(data);
    } catch {
      return;
    }
    if (typeof message !== "object" || message === null || Array.isArray(message)) return;

    if (who.role === "player") {
      this.sendToHost({ t: "from", pid: who.pid, m: message });
      return;
    }

    const command = message as HostMessage;
    switch (command.t) {
      case "send":
        this.sendToPlayer(command.to, command.m);
        break;
      case "batch":
        if (Array.isArray(command.items)) {
          for (const item of command.items) this.sendToPlayer(item?.to, item?.m);
        }
        break;
      case "broadcast":
        this.broadcastToPlayers(command.m);
        break;
      case "remove":
        if (typeof command.to === "string") {
          for (const socket of this.socketsOf(command.to)) socket.close(CloseCode.removed, "Removed by the teacher");
        }
        break;
      case "end":
        await this.endRoom("Session ended");
        break;
    }
  }

  async webSocketClose(ws: WebSocket, code: number): Promise<void> {
    const who = this.attachment(ws);
    try {
      ws.close(code === 1005 || code === 1006 ? 1000 : code);
    } catch {
      // Already closed.
    }
    if (!who || !(await this.ctx.storage.get<Meta>("meta"))) return;

    if (who.role === "player") {
      if (this.socketsOf(who.pid).every((socket) => socket === ws)) this.sendToHost({ t: "left", pid: who.pid });
      return;
    }
    if (this.sockets("host").every((socket) => socket === ws)) {
      this.broadcastToPlayers({ t: "relay.host", up: false });
      const grace = Number(this.env.HOST_GRACE_SECONDS ?? "900") * 1000;
      await this.ctx.storage.setAlarm(Date.now() + grace);
    }
  }

  async webSocketError(ws: WebSocket): Promise<void> {
    await this.webSocketClose(ws, 1006);
  }

  /** Fires when the teacher has been gone too long, or the room reaches its maximum age. */
  async alarm(): Promise<void> {
    const meta = await this.ctx.storage.get<Meta>("meta");
    if (!meta) return;
    const tooOld = Date.now() >= meta.createdAt + MAX_ROOM_LIFETIME_MS;
    if (tooOld || this.sockets("host").length === 0) {
      await this.endRoom("Session expired");
    } else {
      await this.ctx.storage.setAlarm(meta.createdAt + MAX_ROOM_LIFETIME_MS);
    }
  }

  private async endRoom(reason: string): Promise<void> {
    await this.ctx.storage.deleteAlarm();
    await this.ctx.storage.deleteAll();
    for (const socket of this.ctx.getWebSockets()) {
      try {
        socket.close(CloseCode.ended, reason);
      } catch {
        // Already closed.
      }
    }
  }

  private acceptHost(meta: Meta, token: string): Response {
    const [client, server] = Object.values(new WebSocketPair());
    this.ctx.acceptWebSocket(server, ["host"]);
    server.serializeAttachment({ role: "host" } satisfies Attachment);
    const players = [...new Set(this.sockets("player").flatMap((ws) => {
      const who = this.attachment(ws);
      return who?.role === "player" ? [who.pid] : [];
    }))];
    server.send(JSON.stringify({ t: "room", code: meta.code, token, players }));
    return new Response(null, { status: 101, webSocket: client });
  }

  /** Accept, then close with a reason: a refused upgrade would reach the browser only as code 1006. */
  private refuse(client: WebSocket, server: WebSocket, code: number, reason: string): Response {
    server.accept();
    server.close(code, reason);
    return new Response(null, { status: 101, webSocket: client });
  }

  private attachment(ws: WebSocket): Attachment | null {
    return (ws.deserializeAttachment() as Attachment | null) ?? null;
  }

  private sockets(role: "host" | "player"): WebSocket[] {
    return this.ctx.getWebSockets().filter((ws) => this.attachment(ws)?.role === role && ws.readyState === WebSocket.OPEN);
  }

  private socketsOf(pid: string): WebSocket[] {
    return this.ctx.getWebSockets(`p:${pid}`).filter((ws) => ws.readyState === WebSocket.OPEN);
  }

  /** A phone can drop between the readyState check and the send; one dead socket must not stop the rest. */
  private deliver(sockets: WebSocket[], message: unknown): void {
    if (message === undefined) return;
    const text = JSON.stringify(message);
    for (const socket of sockets) {
      try {
        socket.send(text);
      } catch {
        // The close event will follow.
      }
    }
  }

  private sendToHost(message: unknown): void {
    this.deliver(this.sockets("host"), message);
  }

  private sendToPlayer(pid: unknown, message: unknown): void {
    if (typeof pid === "string") this.deliver(this.socketsOf(pid), message);
  }

  private broadcastToPlayers(message: unknown): void {
    this.deliver(this.sockets("player"), message);
  }
}

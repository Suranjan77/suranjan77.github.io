import { Room } from "./room";
import { isAllowedOrigin, isPlayerId, isRoomCode, newRoomCode, teacherKeyMatches } from "./rules";

export { Room };

export interface Env {
  ROOMS: DurableObjectNamespace<Room>;
  ALLOWED_ORIGINS: string;
  HOST_GRACE_SECONDS?: string;
  /** "eu" in production. Local runs set it to "none": workerd does not implement jurisdictions. */
  ROOM_JURISDICTION?: string;
  /** The teacher passcode, set with `wrangler secret put TEACHER_KEY`. Unset or short: no room can be opened. */
  TEACHER_KEY?: string;
}

/**
 * Entry point. Every route refuses requests that do not come from the quiz site.
 *   POST /rooms          {key} → {code, token}: open a room. Needs the teacher passcode.
 *   WS   /host?code&token the teacher's screen connects (and reconnects) to its room
 *   WS   /join?code&pid   a student's phone joins a room
 * The passcode travels in the POST body, never in a URL, and is only ever
 * compared with the secret: it is not stored. Rooms live in the jurisdiction
 * named by ROOM_JURISDICTION (the EU in production).
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response("ok");

    const origin = request.headers.get("Origin");
    const allowed = isAllowedOrigin(origin, env.ALLOWED_ORIGINS);
    const cors = allowed && origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : undefined;

    const jurisdiction = env.ROOM_JURISDICTION ?? "eu";
    const rooms = jurisdiction === "none" ? env.ROOMS : env.ROOMS.jurisdiction(jurisdiction as DurableObjectJurisdiction);
    const forward = (code: string, params: Record<string, string>, init: Request) => {
      const target = new URL("https://room/");
      target.search = new URLSearchParams({ code, ...params }).toString();
      return rooms.get(rooms.idFromName(code)).fetch(new Request(target, init));
    };

    if (url.pathname === "/rooms") {
      if (request.method === "OPTIONS") {
        if (!cors) return new Response(null, { status: 403 });
        return new Response(null, {
          status: 204,
          headers: { ...cors, "Access-Control-Allow-Methods": "POST", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" },
        });
      }
      if (request.method !== "POST") return new Response("Method not allowed", { status: 405 });
      if (!cors) return new Response("Forbidden", { status: 403 });

      let key: unknown;
      try {
        key = ((await request.json()) as { key?: unknown }).key;
      } catch {
        return Response.json({ error: "bad-request" }, { status: 400, headers: cors });
      }
      if (!(await teacherKeyMatches(key, env.TEACHER_KEY))) {
        return Response.json({ error: "wrong-passcode" }, { status: 401, headers: cors });
      }

      // Retry on the rare code that is already in use.
      for (let attempt = 0; attempt < 8; attempt += 1) {
        const response = await forward(newRoomCode(), { action: "create" }, new Request(request.url, { method: "POST" }));
        if (response.status !== 409) return new Response(response.body, { status: response.status, headers: { ...cors, "Content-Type": "application/json" } });
      }
      return Response.json({ error: "busy" }, { status: 503, headers: cors });
    }

    if (url.pathname !== "/host" && url.pathname !== "/join") return new Response("Not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
    if (!allowed) return new Response("Forbidden", { status: 403 });

    const code = url.searchParams.get("code");
    if (!isRoomCode(code)) return new Response("Bad request", { status: 400 });

    if (url.pathname === "/join") {
      const pid = url.searchParams.get("pid");
      if (!isPlayerId(pid)) return new Response("Bad request", { status: 400 });
      return forward(code, { action: "join", pid }, request);
    }
    return forward(code, { action: "host", token: url.searchParams.get("token") ?? "" }, request);
  },
} satisfies ExportedHandler<Env>;

import { Room } from "./room";
import { isAllowedOrigin, isPlayerId, isRoomCode, newRoomCode } from "./rules";

export { Room };

export interface Env {
  ROOMS: DurableObjectNamespace<Room>;
  ALLOWED_ORIGINS: string;
  HOST_GRACE_SECONDS?: string;
  /** "eu" in production. Local runs set it to "none": workerd does not implement jurisdictions. */
  ROOM_JURISDICTION?: string;
}

/**
 * Entry point. Three WebSocket routes, all refused unless the request comes
 * from the quiz site:
 *   /host               open a new room (the teacher's screen)
 *   /host?code&token    reconnect the teacher's screen to its room
 *   /join?code&pid      a student's phone joins a room
 * Rooms live in the jurisdiction named by ROOM_JURISDICTION (the EU in production).
 */
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    if (url.pathname === "/health") return new Response("ok");
    if (url.pathname !== "/host" && url.pathname !== "/join") return new Response("Not found", { status: 404 });
    if (request.headers.get("Upgrade") !== "websocket") return new Response("Expected a WebSocket", { status: 426 });
    if (!isAllowedOrigin(request.headers.get("Origin"), env.ALLOWED_ORIGINS)) return new Response("Forbidden", { status: 403 });

    const jurisdiction = env.ROOM_JURISDICTION ?? "eu";
    const rooms = jurisdiction === "none" ? env.ROOMS : env.ROOMS.jurisdiction(jurisdiction as DurableObjectJurisdiction);
    const forward = (code: string, params: Record<string, string>) => {
      const target = new URL("https://room/");
      target.search = new URLSearchParams({ code, ...params }).toString();
      return rooms.get(rooms.idFromName(code)).fetch(new Request(target, request));
    };

    const code = url.searchParams.get("code");

    if (url.pathname === "/join") {
      const pid = url.searchParams.get("pid");
      if (!isRoomCode(code) || !isPlayerId(pid)) return new Response("Bad request", { status: 400 });
      return forward(code, { action: "join", pid });
    }

    if (code !== null) {
      if (!isRoomCode(code)) return new Response("Bad request", { status: 400 });
      return forward(code, { action: "host", token: url.searchParams.get("token") ?? "" });
    }

    // A new room: retry on the rare code that is already in use.
    for (let attempt = 0; attempt < 8; attempt += 1) {
      const response = await forward(newRoomCode(), { action: "create" });
      if (response.status !== 409) return response;
    }
    return new Response("No free room code", { status: 503 });
  },
} satisfies ExportedHandler<Env>;

# Classroom quiz relay

A Cloudflare Worker that passes messages between the teacher's screen
(`/play/host`) and students' phones (`/play`). GitHub Pages serves only files,
so live play needs this one small server. It is built to hold as little as
possible:

- **It does not store answers, nicknames or scores.** The teacher's screen runs
  the game; the relay forwards messages between the sockets in a room.
- **The only stored record is the room itself**: its code, a SHA-256 hash of the
  teacher's reconnect token, and its start time. Ending the session deletes it
  and closes every connection.
- **Rooms expire.** If the teacher's screen is gone for 15 minutes
  (`HOST_GRACE_SECONDS`), or a room reaches four hours, it is deleted.
- **Rooms live in the EU** (`ROOM_JURISDICTION = "eu"`).
- **No logs.** Workers Logs is off (`[observability] enabled = false`) and the
  code never calls `console`.
- **Only teachers can open a room.** `POST /rooms` needs the teacher passcode
  (the `TEACHER_KEY` secret), sent in the request body and compared in constant
  time. If the secret is unset or shorter than 16 characters, no room can be
  opened at all. Students only ever join existing rooms.
- **Only the quiz site can connect** (`ALLOWED_ORIGINS`). Rooms take at most 60
  players. Students can send at most 1 KB per message and 8 messages a second.

## Deploy (one-off)

On your own machine, with your Cloudflare account:

```bash
cd relay
npm ci
npx wrangler login     # opens the browser to sign in to Cloudflare
npm run deploy
npx wrangler secret put TEACHER_KEY
```

Until the secret is set, the relay refuses to open any room. `wrangler secret put` asks for the teacher passcode. Use at least 16
characters; four or five random words work well (for example
`copper-lantern-orbit-meadow`). Give it to teachers, not students. The
passcode is stored only as a Cloudflare secret: it is not in this repository
or in the site's code. To change it, run `npx wrangler secret put TEACHER_KEY`
again; it takes effect at once, and teachers who ticked "Remember on this
device" are asked for the new one.

`npm run deploy` prints the relay's address, for example
`https://classroom-quiz-relay.<your-subdomain>.workers.dev`.

Then tell the site where the relay is:

1. On GitHub, open the repository → **Settings → Secrets and variables →
   Actions → Variables** → **New repository variable**.
2. Name: `QUIZ_RELAY_URL`. Value: the address from above with `wss://` in place
   of `https://`, e.g. `wss://classroom-quiz-relay.<your-subdomain>.workers.dev`.
   Use a repository variable, not one on the `github-pages` environment: the
   build job has no environment, so it cannot see environment variables, and
   it stops with an error when the variable is missing.
3. Push to `main` (or re-run the Pages workflow). The build reads the variable
   as `NEXT_PUBLIC_QUIZ_RELAY_URL`.

Check in the Cloudflare dashboard that the account is on the **Workers Free**
plan (Workers & Pages → Plans). On the Free plan, Cloudflare never bills:
going over a daily limit makes further requests fail until 00:00 UTC.

If the deploy is refused because of the EU jurisdiction setting, set
`ROOM_JURISDICTION = "none"` in `wrangler.toml` and deploy again; rooms then
run in the Cloudflare location nearest the teacher. Update `/play/privacy`
if you do.

## Redeploy after a change

Changes to `relay/` reach Cloudflare only when you deploy them; pushing to
`main` deploys the site, not the relay. From the repository root:

```bash
cd relay
npm ci
npm run typecheck && npm test && npm run stress
npm run deploy         # uses the wrangler login from the first deploy
```

The passcode (`TEACHER_KEY`) and the relay's address stay the same, so
nothing changes on GitHub. A deploy restarts the rooms' connections: phones
and teachers' screens reconnect by themselves, but deploy outside lesson time.
If `wrangler` says you are not logged in, run `npx wrangler login` first.
Check the result with `curl https://classroom-quiz-relay.<your-subdomain>.workers.dev/health`,
which answers `ok`.

## Cost at classroom scale

The Free plan allows 100,000 Durable Object requests a day. A class of 30
answering 20 questions uses about 70: 31 connections, plus about 700 incoming
messages counted at 20 messages per request. Messages the relay sends out are
not counted. Rooms use the hibernation API, so an idle room is not billed for
running time.

## Develop and test

```bash
npm run dev        # http://127.0.0.1:8787, accepts the site on localhost:3000; passcode local-teacher-passcode
npm test           # starts the relay in Cloudflare's local runtime and runs test/relay.test.mjs
npm run typecheck
npm run stress     # load test: 4 rooms × 60 phones answering at once, in the local runtime
```

`npm run stress` also runs against the deployed relay. Each run opens four
rooms and ends them, which uses a few hundred of the day's free requests:

```bash
RELAY_URL=wss://classroom-quiz-relay.<your-subdomain>.workers.dev \
ORIGIN=https://suranjan77.github.io TEACHER_KEY='<the passcode>' npm run stress
```

Locally, every room shares one process, so answers queue for a few seconds
when four rooms answer at once; the deployed relay runs each room on its own.

The site's browser tests for the quiz (`npm run e2e:play` in the repository
root) start this relay themselves.

`wrangler dev` does not implement jurisdictions, so local runs pass
`ROOM_JURISDICTION:none`. It also delivers some close events about ten seconds
late, which is why the integration tests allow 45 seconds each.

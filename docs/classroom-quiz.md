# Classroom quiz

Status: v1 built
Updated: 2026-10-09

A live quiz for Level 3 and below. A teacher starts a session on the projector,
students join on their phones with a code or QR code, and the room answers
together. The answer screen is where teaching starts: it shows how the room
split, the correct answer and its reason. The results screen lists the
questions the room found hardest, with how the room did the first time and
the second.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/play/host` | Teacher, on the projector | Enter the teacher passcode, pick a question set, start a session, run the questions, end the session. |
| `/play?c=123456` | Students, on phones | Join with the code, get a nickname, answer. |
| `/play/privacy` | Students and staff | What is kept, where, and for how long, written for students. |

The quiz routes are not indexed by search engines (`/play/privacy` is indexed),
and `/play` and `/play/host` render without the site's header and footer.

## Teacher passcode

Anyone can load `/play/host`, because the site is public files, but only the
relay can open a room, and it opens one only for the teacher passcode (the
`TEACHER_KEY` secret on Cloudflare; see `relay/README.md`). Without it, the
page cannot start a session. The passcode travels in the body of an HTTPS
request, never in a URL. Once a room is open, the teacher's screen uses a
per-room token for reconnects, so the passcode is not sent again.

The teacher's screen keeps the passcode for the current tab only, so a
second session can start without retyping it. "Remember on this device" puts
it in localStorage instead, and is meant for a teacher's own laptop, not a
shared classroom computer. A wrong passcode is never saved.

Known limit: the question sets, answers included, are part of the site's
public JavaScript. A determined student could find this week's answers in the
page source. Keeping them secret would mean serving sets from the relay behind
the passcode; v1 does not.

## Scope of v1

- Teacher-started sessions, behind a teacher passcode; join by six-digit code or QR code.
- Nicknames are generated from a colour and an animal. Students cannot type a
  name; they can ask for a different one up to three times in the lobby.
- One set per weekly lesson, of 8 to 12 questions. A game asks every question
  twice, in a random order: the repeat comes at least three rounds after the
  first, and its choices are reshuffled so the answer is under a different
  letter. Retrieving the same idea again after a gap is what makes it stick;
  remembering "it was B" does not. Repeats are marked "Seen before" on the
  projector. With 8 questions a game is 16 rounds, about 10–12 minutes; the
  teacher can skip to the results at any reveal.
- Multiple-choice questions with two to four choices: text choices, a picture
  as the question, or pictures as the choices. Pictures appear on the
  projector only; phones show A–D.
- Scoring: 500–1000 points for a correct answer, more for a faster one.
- The room sees only the top three. Each student sees only their own score.
- Ending the session deletes everything (see Privacy).

Not in v1: solo practice, more game modes, drag-and-drop or tap-the-spot
questions, saved results or exports, accounts.

## Privacy design

Students may be under 18. The design keeps no personal data beyond the live
session:

- No names: nicknames come from fixed word lists, chosen by the teacher's
  screen. A modified phone cannot send a name, because the teacher's screen
  accepts only two kinds of message from a phone (`reroll`, `answer`).
- The game state (nicknames, answers, scores) lives only in the teacher's
  browser tab (sessionStorage, so a reload does not lose it). The browser
  discards it when the tab closes, and **End session** deletes it immediately.
- The relay (`relay/`) forwards messages and stores only the room's code, a
  hash of the teacher's reconnect token and its start time. End deletes that
  and closes every connection. An abandoned room deletes itself after 15
  minutes; no room lasts more than four hours. Rooms are kept in the EU. The
  relay keeps no logs.
- Phones keep a random player ID and the room code in sessionStorage, so a
  locked screen or reload rejoins as the same player. Both are removed when
  the session ends.
- IP addresses unavoidably reach GitHub Pages and Cloudflare while connected;
  `/play/privacy` says so.

If the College uses this with students, its Data Protection Officer should see
this page and `/play/privacy` first.

## Question sets

Sets live in `src/features/play/sets/`, one file per course unit, registered in
`sets/index.ts`. The first sets cover BTEC AAQ IT Unit 3 (Website Development),
Topics 2, 4 and 12, written from that unit's decks in academic-materials
(`modules/l3-aaq-u3-website-development`). Each question carries an
explanation that gives the reason, not just the fact. Explanations never name
a letter, because the letters change between a question's two rounds.

Pictures are real rendered pages, authored in `scripts/play-figures/<set>.html`
in the style of the unit's lecture figures. Run `npm run play:figures`
(`CHROMIUM_PATH=…` to choose a browser) to render each `<figure data-name>` to
`public/play/<set>/<name>.png` and update `sets/figure-sizes.json`. No picture
carries a caption or pass/fail label that gives the answer away.

`sets/sets.test.ts` checks every set: 8 to 12 questions, two to four choices of one kind, a valid
answer, an explanation, alt text on every picture, and that each picture file
exists. It also measures the contrast question's button colours from the
figure source, so the question cannot drift from the picture.

## Tests

- `npm test`: game rules (`game.test.ts`) and question sets (`sets.test.ts`).
- `npm run e2e:play`: a teacher and two phones play a full session through the
  relay in Cloudflare's local runtime, including reloads, removal and ending.
  Needs `npm --prefix relay ci` and `npm run build` first.
- `npm --prefix relay test`: the relay on its own (rooms, reconnects, expiry,
  limits, origin checks).

The deploy workflow runs lint, the unit tests, the build and the JavaScript
budgets. No browser tests run there; run `npm run e2e:play` locally before
changing the quiz.

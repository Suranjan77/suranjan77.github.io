# Classroom quiz

Status: v1 built
Updated: 2026-10-26

A live quiz for Level 3 and below. A teacher starts a session on the projector,
students join on their phones with a code or QR code, and the room answers
together. The answer screen is where teaching starts: it shows how the room
split, the correct answer and its reason. The results screen shows the top five on a podium and lists the questions the
room found hardest, with how the room did the first time and the second.

## Routes

| Route | Who | What |
| --- | --- | --- |
| `/play/host` | Teacher, on the projector | Choose a course and a question set, enter the teacher passcode, start a session, run the questions, end the session. |
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

The teacher's screen also remembers, in localStorage, the id of the last set
it started (`classroom-quiz-last-set`), so next lesson it opens on that course
with that set chosen and marked "Last used". It is a set id, nothing about
the students.

Known limit: the question sets, answers included, are part of the site's
public JavaScript. A determined student could find this week's answers in the
page source. Keeping them secret would mean serving sets from the relay behind
the passcode; v1 does not.

## Scope of v1

- Teacher-started sessions, behind a teacher passcode; join by six-digit code or QR code.
- The lobby puts the join address, the code and the QR code together in one
  dark band at the top, large enough to read from the back of the room. Below
  the joined students it shows the "Mount Delulu" Dunning–Kruger poster
  (`MountDeluluPoster.tsx`), built in HTML and SVG so it stays sharp on the
  projector and can be read by a screen reader.
- Nicknames are generated from a colour and an animal. Students cannot type a
  name; they can ask for a different one up to three times in the lobby. Every
  nickname has a drawn avatar: the animal on a background of the colour
  ("Coral Otter" is an otter on coral). The 24 animals are drawn in
  `avatars.tsx`, in one style, as flat shapes; every animal in
  `nicknames.ts` must have a drawing.
- One set per weekly lesson (or per assignment task), of 12 to 16 questions.
  A game asks every question once, in a random order, and asks again only the
  questions that take working out (`askTwice` on the question: comparing
  pictures, applying a rule, reading a formula or a script), never more than
  twice. Each set marks 3 to 6 of them, usually 4 or 5. The repeat comes at
  least three rounds after the first, and its choices are reshuffled so the
  answer is under a different letter: retrieving a hard idea again after a gap
  is what makes it stick, while asking the easy ones again only made the game
  repetitive. Repeats are marked "Seen before" on the projector. A game is 18
  to 21 rounds, about 15–20 minutes; the set list shows each set's question
  count, how many are asked twice and its estimate, and the question preview
  marks the ones asked twice. The teacher can skip to the results at any
  reveal. The one exception is a taster day's opening quiz (`SET_SHAPES` in
  `sets.test.ts`): it is also the icebreaker, so it has up to 24 quick
  questions and asks none twice, because nothing has been taught yet.
- Multiple-choice questions with two to four choices: text choices, a picture
  as the question, or pictures as the choices. Pictures appear on the
  projector only; phones show A–D.
- Time per question: 20 seconds unless the set or the question says otherwise.
  Level 1 and Level 2 sets give 30. A question with a picture, beside it or as
  its choices, gets 15 seconds more, because the room has to look before it can
  answer (`questionSeconds` in `types.ts`).
- The answer is revealed the moment the last student answers. "Every student"
  means every phone that has shown the question: each phone tells the
  teacher's screen when it shows one (`seen`). A phone that locked or lost its
  connection without the relay noticing never does, so after the first five
  seconds of a round the room stops waiting for it
  (`awaited` and `SEEN_GRACE_MS` in `game.ts`). If no phone has said so at
  all, the room waits for every connected phone, as before. The projector
  shows the avatars of those who have answered as they come in.
- Scoring. A right answer earns 500–1000 points, more for a faster one. On
  top of that, no rule ever takes points away from anyone, so leading is never
  punished, but everyone has a way back to the top (`awardFor`, `awardStars`
  in `game.ts`; the constants are at the top of the file):
  - Catch-up: a right answer is worth up to 80% more, in proportion to how far
    behind the leader the student is. The leader gets the plain points.
  - Streak: each right answer in a row after the first adds 50, up to 200.
  - Learned it: a question answered right on its repeat, after being missed
    the first time, earns 300 more.
  - Stars: after every other reveal from round 3, about one in four students
    outside the top five (at most four) gets a star that doubles their next
    right answer. Lower places are likelier to get one, but every place outside
    the top five can. Only the students who get one are told who they are; the
    projector says how many went out.
  - Final stretch: the last three rounds count double (fewer in a very short
    game). A star in the final stretch makes a right answer count four times.
  The phone shows what an answer earned, part by part.

  Lightning (taking points from one of the top three at random) was removed:
  it helped second and third catch the leader, not the students at the
  bottom, and it took away from the students who were doing well. A test in
  `game.test.ts` plays 300 whole games between simulated students who get 45%
  to 85% right, and checks that the weakest two fifths of the room reach the
  top five in a fair share of games while the strongest still win most of
  them. In a longer run of a simulation like it, in a room of 25, a student in
  the weakest fifth reached the top five in almost no game on speed points
  alone; with these rules, about 1 game in 50 (1 in 8 in a room of 12), and
  the strongest fifth still won over two games in three.
- The room sees the top five, with how many places each moved, and "On the
  rise": up to three students outside the top five who climbed two or more
  places that round, with how far they climbed but not where they are. Each
  student sees only their own score, and, outside the top five, about how many
  points they are from it.
- Ending the session deletes everything (see Privacy).

Not in v1: solo practice, more game modes, drag-and-drop or tap-the-spot
questions, saved results or exports, accounts.

## Privacy design

Students may be under 18. The design keeps no personal data beyond the live
session:

- No names: nicknames come from fixed word lists, chosen by the teacher's
  screen. A modified phone cannot send a name, because the teacher's screen
  accepts only three kinds of message from a phone (`reroll`, `seen`,
  `answer`), none of which carries text.
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

## Staying connected

Phones on school Wi-Fi drop and sleep. Every screen pings the relay every 15
seconds and starts a fresh connection when no answer comes within 8 seconds, or
within 4 seconds of a phone waking up: browsers can keep a dead connection
looking open for minutes. A connection that has not opened in 10 seconds is
tried again, and coming back online retries at once. A phone that is connected
but has had nothing from the teacher's screen for 6 seconds joins again. A
phone that has gone quiet in the middle of a round does not hold the room up:
see `seen` above. If the
page's JavaScript has not started after 8 seconds, a "Reload the page" link
appears.

## The look

The quiz screens have their own look, softer than the rest of the site: a
dotted paper background, rounded cards, bold answer colours and the animal
avatars. The styles are in `globals.css` under "Classroom quiz" (`quiz-root`,
`quiz-card`, `quiz-button` and the `quiz-*` animations); the site's own radius
tokens are 2px, so the quiz uses explicit radii. The four answer colours are
dark enough for white text at 4.5:1, and each answer also has its letter and
shape. The small marks (the star, the streak flame, the answer shapes, the
countdown ring) are drawn in `ui.tsx`, not taken from an icon set. Animations
are switched off for anyone who asks for reduced motion.

## Question sets

### Courses and the teacher's set list

Sets are grouped three ways, so the list stays easy to use as it grows:

- **Level**: the teacher can filter the course list to one level.
- **Course**: one course unit, e.g. "Level 2 · Unit 9 · Spreadsheet
  development". Opening a course shows its sets.
- **Section**: inside a course, sets are grouped by learning aim or assignment
  task, in teaching order. A search box (for courses with more than six sets)
  filters by set title, spec reference or section.

The chosen set stays in a panel beside the list, with the passcode and the
Start button, while the teacher looks around other courses.

Every set can be previewed before choosing it: "Preview questions" opens all
its questions with their pictures, choices and time. The answers and their
explanations stay hidden until the teacher presses "Show answers", because
the setup screen may already be on the projector. The preview lists choices
in the order they were written; in the game they are shuffled.

The courses are listed in `src/features/play/sets/index.ts` (`courses`), lowest
level first. Each course's sets are a separate file, `sets/<course>.ts`,
exporting `sections`. A course's file is downloaded only when a teacher opens
that course, so the teacher's page does not grow as courses are added; its
JavaScript budget is back to 225 KiB. Every set id starts with its course id and
a hyphen: that is how a reloaded session finds, and loads, its course.

To add a course: write `sets/<course>.ts` with its sets and `sections`, draw its
figures in `scripts/play-figures/<course>.html`, render them, and add an entry
to `courses`. `sets.test.ts` picks it up from there.

### The courses

| Level | Course | Sets | Source |
| --- | --- | --- | --- |
| 1 | BTEC Level 1 Introductory Diploma in IT, Unit A4 Researching a topic | 5 sets of 14, Task 2 only | The "Digital Life: Staying safe online" assignment brief |
| 2 | Level 2 IT, Unit 9 Spreadsheet development | 8 sets of 15, Tasks 1–5 | The Assignment 2 guide |
| 2 | Year 11 taster day, Data analytics | 2 sets: 24 to open, 16 to close | Written for the taster day |
| 3 | BTEC AAQ IT, Unit 3 Website development | 20 sets of 16 | The unit's lecture notes and decks |

**Unit A4 (Level 1)** covers Task 2, the presentation that summarises
research findings (B.P3, B.M3, B.D3): planning for the audience of new
students and families, summarising, referencing sources, clear slide design
and building it in Google Slides, ending with File › Download › Microsoft
PowerPoint (.pptx) because the brief asks for a PowerPoint file. Its examples
are from the brief's own topics (scam texts, passwords, phone security), so the
quiz also revisits staying safe online. The questions are written for Level 1:
short sentences, everyday words, and two or three choices for most questions.

**Unit 9 (Level 2)** follows the guide's five tasks: the data model,
formulas and formatting (2C.P4); validation, navigation, conditional formatting
and charts (2C.M3); Apps Script, named ranges, pivot tables and protection
(2C.D3); testing (2C.P5); and feedback and the review (2C.M4, 2D.P6, 2D.M5,
2D.D4). Menu paths are Google Sheets' as the guide gives them. Formula
questions are worked on a small sheet on the projector.

**The data analytics taster (Year 11)** is for a one-off visit, to make data
analytics look like something worth doing next. The opening quiz, "Data is
everywhere", is the icebreaker: 24 quick questions about data in things Year
11s already care about (music stats, games, football's xG, canteen pizza,
streaming recommendations), a little history (Florence Nightingale, John
Snow's cholera map, Moneyball) and a first look at the ideas of the day, each
explanation teaching one. The closing quiz, "Think like a data analyst",
asks about the same ideas with new examples (averages, choosing a chart,
misleading axes, correlation, cleaning data, a spreadsheet formula, privacy)
and ends on the routes into data jobs after Year 11. Its data is invented,
apart from the retold cholera map. It is listed under Level 2, Year 11's level.

**Unit 3 (Level 3)** has a set for each of its 20 weekly topics, written from
that unit's lecture notes and decks in academic-materials
(`modules/l3-aaq-u3-website-development`).

### Writing questions and pictures

Show it, then ask. Level 1 and Level 2 questions assume the student may not
have met the idea or the tool yet, so each one shows what it asks about: the
brief, the research log, the slide, the Google Slides or Google Sheets menu or
panel, the data a formula works on. The answer can be worked out from the
picture, and the explanation teaches the rule. A question that names cells,
ranges or data always shows that data on the projector. Numbered parts in a
picture are offered as "Part 1", "Part 2", so a choice never reads "A: 3".

Each question carries an explanation that gives the reason, not just the
fact. Explanations never name a letter, because the letters are shuffled and
change between a repeated question's two rounds. Every set has rendered pictures: page and slide
mock-ups, Google Slides and Google Sheets screens, spreadsheets, wireframes,
planning documents, code to read and measured diagrams. At Level 1 and Level 2
almost every question has one.

A picture is shown in one question of a set only: seeing the same picture
again, for a different question, reads as a repeat. The one exception is a
worked example on purpose, the orders sheet that the Level 2 formulas set
works every formula on (`WORKED_EXAMPLES` in `sets.test.ts`). To ask two
things about one document, draw a second extract or a close-up.

Pictures are real rendered pages, authored in `scripts/play-figures/<course>.html`
in the style of the course's own materials. They are drawn large (text at 15px
or more, most at 17px) and mostly landscape, because the projector shows a
question's picture in three fifths of the width, scaled to fit under the
heading. Run `npm run play:figures`
(`CHROMIUM_PATH=…` to choose a browser) to render each `<figure data-name>` to
`public/play/<course>/<name>.png` and update `sets/figure-sizes.json`;
`npm run play:figures -- l2-u9` renders only the courses named. No picture
carries a caption or pass/fail label that gives the answer away. Figures are
drawn for low vision as well as a projector: text greys are at least 4.5:1
against their background (most 7:1 or more), and borders, lines and shapes
that carry meaning at least 3:1. The only exceptions are the deliberately
failing choices in the contrast questions (Unit 3's buttons, Unit A4's
slides) and the deliberately hard-to-read slide over a busy picture. Tools
named in questions must be free to use, no paid apps or trials, unless the
qualification requires them.

`sets/sets.test.ts` checks every course and set: each course loads, its
sections have sets, every set id names its course, 12 to 16 questions with 3
to 6 asked twice and no more than 22 rounds, no picture in two questions of a
set, two to four choices of one kind, a valid answer, an explanation, alt text on every
picture, and that each picture file exists. It also measures the contrast
questions' colours from the figure source, so a question cannot drift from
its picture.

## Tests

- `npm test`: game rules (`game.test.ts`) and question sets (`sets.test.ts`).
- `npm run e2e:play`: a teacher and two phones play a full session through the
  relay in Cloudflare's local runtime, including reloads, removal and ending,
  and the teacher finds sets by level, course and search. Another test checks
  that the answer is shown the moment the last student answers, and that a
  phone that has gone quiet does not hold the room until the clock runs out.
  Needs `npm --prefix relay ci` and `npm run build` first.
- `npm --prefix relay test`: the relay on its own (rooms, reconnects, expiry,
  limits, origin checks).

The deploy workflow runs lint, the unit tests, the build and the JavaScript
budgets. No browser tests run there; run `npm run e2e:play` locally before
changing the quiz.

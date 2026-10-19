import { expect, test, type Browser, type Page } from "@playwright/test";
import { userExperience } from "../src/features/play/sets/aaq-u3";

const phone = { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true };
/** The passcode `npm --prefix relay run dev` is started with. */
const TEACHER_PASSCODE = "local-teacher-passcode";

async function joinAsStudent(browser: Browser, code: string): Promise<Page> {
  const context = await browser.newContext(phone);
  const page = await context.newPage();
  await page.goto(`/play?c=${code}`);
  await expect(page.getByLabel("Code on your teacher's screen")).toHaveValue(code);
  await page.getByRole("button", { name: "Join" }).click();
  await expect(page.getByRole("heading", { name: "You're in" })).toBeVisible();
  return page;
}

/** Reads the projector to find which letter the correct answer is under this round, and one that is wrong. */
async function answerKey(teacher: Page) {
  const prompt = ((await teacher.getByRole("heading", { level: 1 }).textContent()) ?? "").trim();
  const question = userExperience.questions.find((q) => q.prompt === prompt);
  if (!question) throw new Error(`Not a Topic 4 question: ${prompt}`);
  const answer = question.choices[question.answer];
  const tiles = teacher.locator("ol > li");
  const tile = answer.image
    ? tiles.filter({ has: teacher.getByAltText(answer.image.alt, { exact: true }) })
    : tiles.filter({ has: teacher.getByText(answer.text, { exact: true }) });
  const right = ((await tile.locator(".sr-only").textContent()) ?? "").replace(":", "").trim();
  const wrong = ["A", "B", "C", "D"].slice(0, await tiles.count()).find((letter) => letter !== right)!;
  return { question, right, wrong };
}

/** Opens a course on the teacher's screen and picks one of its sets. */
async function chooseSet(teacher: Page, course: RegExp, set: RegExp) {
  await teacher.getByRole("button", { name: course }).click();
  await teacher.getByRole("radio", { name: set }).check();
}

const UNIT_3 = /Unit 3 · Website development/;
const TOPIC_4 = /Topic 4 · User experience/;

async function choose(phone: Page, letter: string) {
  await phone.getByRole("button", { name: new RegExp(`^${letter}(: |$)`) }).click();
}

async function nickname(page: Page): Promise<string> {
  return (await page.getByTestId("nickname").textContent()) ?? "";
}

test("a teacher runs a session, students play on phones, and ending it deletes the room", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await chooseSet(teacher, UNIT_3, TOPIC_4);
  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByRole("button", { name: "Start session" }).click();

  const codeText = (await teacher.getByTestId("room-code").textContent()) ?? "";
  const code = codeText.replace(/\D/g, "");
  expect(code).toMatch(/^[1-9]\d{5}$/);
  await expect(teacher.getByRole("img", { name: new RegExp(`QR code to join with code ${code}`) })).toBeVisible();

  // Two students join and get generated names; one asks for a different name.
  const ana = await joinAsStudent(browser, code);
  const ben = await joinAsStudent(browser, code);
  await expect(teacher.getByRole("heading", { name: "2 students joined" })).toBeVisible();

  const firstName = await nickname(ana);
  await ana.getByRole("button", { name: /Give me a different name/ }).click();
  await expect(ana.getByTestId("nickname")).not.toHaveText(firstName);
  const anaName = await nickname(ana);
  const benName = await nickname(ben);
  await expect(teacher.getByText(anaName, { exact: true })).toBeVisible();
  await expect(teacher.getByText(benName, { exact: true })).toBeVisible();

  // The game asks each of the 12 questions twice, in a random order.
  await teacher.getByRole("button", { name: "Start the quiz" }).click();
  await expect(teacher.getByText("Question 1 of 24")).toBeVisible();

  // Round 1: Ana answers correctly and Ben wrongly. Everyone has answered, so the answer is revealed.
  const first = await answerKey(teacher);
  await choose(ana, first.right);
  await expect(ana.getByText(`Answer ${first.right} sent. Wait for the others.`)).toBeVisible();
  await choose(ben, first.wrong);

  await expect(teacher.getByText("✓ Correct")).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(first.question.explanation)).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(anaName)).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(benName)).toHaveCount(0);
  await expect(ana.getByRole("heading", { name: "Correct" })).toBeVisible();
  await expect(ben.getByRole("heading", { name: "Not this time" })).toBeVisible();
  await expect(ben.getByText(`The answer was ${first.right}.`)).toBeVisible();

  // A student's page reloads: same player, same name.
  await ben.reload();
  await expect(ben.getByRole("heading", { name: "Not this time" })).toBeVisible();
  await expect(ben.getByTestId("nickname")).toHaveText(benName);

  // The teacher's page reloads: the session carries on.
  await teacher.reload();
  await expect(teacher.getByText(`Code ${code.slice(0, 3)} ${code.slice(3)}`)).toBeVisible();
  await expect(teacher.getByText("✓ Correct")).toBeVisible();

  // Rounds 2–24: Ana answers each one; Ben does not, so the teacher reveals.
  const letters = new Map<string, string[]>([[first.question.id, [first.right]]]);
  let sawPictures = false;
  for (let round = 2; round <= 24; round += 1) {
    await teacher.getByRole("button", { name: "Next question" }).click();
    await expect(teacher.getByText(`Question ${round} of 24`)).toBeVisible();
    const key = await answerKey(teacher);
    const seen = letters.get(key.question.id) ?? [];
    await expect(teacher.getByText("Seen before")).toHaveCount(seen.length);
    letters.set(key.question.id, [...seen, key.right]);

    if (key.question.choices.some((c) => c.image)) {
      sawPictures = true;
      for (const picture of await teacher.locator("ol > li img").all()) {
        await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
      }
      await expect(ana.getByText("The pictures are on your teacher's screen.")).toBeVisible();
      await expect(ana.getByRole("img")).toHaveCount(0);
    } else {
      await expect(ana.getByRole("button", { name: `${key.right}: ${key.question.choices[key.question.answer].text}` })).toBeVisible();
    }

    // A phone may send 8 messages a second (relay/src/rules.ts). No student answers faster than
    // that, but this loop would, so it keeps answers at a human pace.
    await ana.waitForTimeout(150);
    await choose(ana, key.right);
    await teacher.getByRole("button", { name: "Show the answer" }).click();
    await expect(ana.getByRole("heading", { name: "Correct" })).toBeVisible();
    await expect(ben.getByRole("heading", { name: "No answer" })).toBeVisible();
  }
  expect(sawPictures).toBe(true);
  // Every question came up twice, and the answer moved to a different letter the second time.
  expect(letters.size).toBe(12);
  for (const [id, shown] of letters) {
    expect(shown, id).toHaveLength(2);
    expect(shown[0], id).not.toBe(shown[1]);
  }

  await teacher.getByRole("button", { name: "See the results" }).click();
  await expect(teacher.getByRole("heading", { name: "What the room found hardest" })).toBeVisible();
  await expect(teacher.getByText(/^First time \d+% correct · second time \d+% correct$/).first()).toBeVisible();
  await expect(ana.getByRole("heading", { name: "You came first" })).toBeVisible();
  await expect(ben.getByRole("heading", { name: "Quiz finished" })).toBeVisible();

  // Ending the session tells every phone and deletes the room.
  await teacher.getByRole("button", { name: "End session and delete everything" }).click();
  await expect(teacher.getByText(/Session ended\. The room, the nicknames and the scores have been deleted\./)).toBeVisible();
  await expect(ana.getByText("Your teacher ended the session. Your nickname and score have been deleted.")).toBeVisible();
  await expect(ben.getByText("Your teacher ended the session. Your nickname and score have been deleted.")).toBeVisible();
  expect(await ana.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("classroom-quiz")))).toEqual([]);
  // The session is gone from the teacher's tab; only the passcode stays, for starting the next one.
  expect(await teacher.evaluate(() => Object.keys(sessionStorage).filter((k) => k.startsWith("classroom-quiz")))).toEqual(["classroom-quiz-teacher-passcode"]);

  const late = await (await browser.newContext(phone)).newPage();
  await late.goto(`/play?c=${code}`);
  await late.getByRole("button", { name: "Join" }).click();
  await expect(late.getByText("No session with that code")).toBeVisible();
});

test("the teacher can skip to the results", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await chooseSet(teacher, UNIT_3, TOPIC_4);
  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByRole("button", { name: "Start session" }).click();
  const code = ((await teacher.getByTestId("room-code").textContent()) ?? "").replace(/\D/g, "");
  const student = await joinAsStudent(browser, code);

  await teacher.getByRole("button", { name: "Start the quiz" }).click();
  await teacher.getByRole("button", { name: "Show the answer" }).click();
  await teacher.getByRole("button", { name: "Skip to the results" }).click();
  await expect(teacher.getByRole("heading", { name: "What the room found hardest" })).toBeVisible();
  await expect(teacher.getByText("First time 0% correct · second time not asked")).toBeVisible();
  await expect(student.getByRole("heading", { name: "Quiz finished" })).toBeVisible();

  await teacher.getByRole("button", { name: "End session and delete everything" }).click();
  await expect(student.getByText("Session ended")).toBeVisible();
});

test("the answer is shown as soon as everyone has answered, and a silent phone does not hold the room", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await chooseSet(teacher, UNIT_3, TOPIC_4);
  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByRole("button", { name: "Start session" }).click();
  const code = ((await teacher.getByTestId("room-code").textContent()) ?? "").replace(/\D/g, "");
  const ana = await joinAsStudent(browser, code);
  const ben = await joinAsStudent(browser, code);
  const cat = await joinAsStudent(browser, code);
  const catName = await nickname(cat);
  await expect(teacher.getByRole("heading", { name: "3 students joined" })).toBeVisible();

  // Cat's phone goes quiet without its connection closing, like a locked phone the relay has not noticed.
  await cat.evaluate(() => {
    WebSocket.prototype.send = () => {};
  });
  await teacher.getByRole("button", { name: "Start the quiz" }).click();
  await expect(teacher.getByText("Question 1 of 24")).toBeVisible();

  // Round 1: Ana and Ben answer. The room waits a few seconds for Cat's phone, then shows the answer,
  // long before the clock runs out.
  const first = await answerKey(teacher);
  const started = Date.now();
  await choose(ana, first.right);
  await choose(ben, first.wrong);
  await expect(teacher.getByText("✓ Correct")).toBeVisible({ timeout: 10_000 });
  // Long before the question's time is up: the room waited only the few seconds a slow phone is given.
  expect(Date.now() - started).toBeLessThan(10_000);
  expect(Number(await ana.getByText(/^\+[\d,]+$/).textContent().then((t) => t!.replace(/\D/g, "")))).toBeGreaterThan(0);
  await expect(ana.getByText(/^Speed [\d,]+$/)).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(catName)).toHaveCount(0);

  // Round 2, after Cat closes the page: the moment the last answer is in, the answer is shown.
  await cat.close();
  await teacher.getByRole("button", { name: "Next question" }).click();
  await expect(teacher.getByText("Question 2 of 24")).toBeVisible();
  const second = await answerKey(teacher);
  await choose(ana, second.right);
  // Ben's phone has shown the question, so the room keeps waiting for him.
  await ben.waitForTimeout(6000);
  await expect(teacher.getByText("✓ Correct")).toHaveCount(0);
  const before = Date.now();
  await choose(ben, second.right);
  await expect(teacher.getByText("✓ Correct")).toBeVisible();
  expect(Date.now() - before).toBeLessThan(3000);
  await expect(ben.getByRole("heading", { name: "Correct" })).toBeVisible();
});

test("the teacher can remove a student", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await chooseSet(teacher, UNIT_3, TOPIC_4);
  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByRole("button", { name: "Start session" }).click();
  const code = ((await teacher.getByTestId("room-code").textContent()) ?? "").replace(/\D/g, "");

  const student = await joinAsStudent(browser, code);
  const name = await nickname(student);
  await teacher.getByRole("button", { name: `Remove ${name}` }).click();
  await expect(student.getByText("Your teacher removed you from this session.")).toBeVisible();
  await expect(teacher.getByRole("heading", { name: "0 students joined" })).toBeVisible();

  await teacher.getByRole("button", { name: "End session" }).click();
  await teacher.getByRole("button", { name: "End and delete" }).click();
  await expect(teacher.getByRole("button", { name: "Start session" })).toBeVisible();
});

test("without the teacher passcode, nobody can open a room", async ({ browser }) => {
  const student = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await student.goto("/play/host");
  await chooseSet(student, UNIT_3, TOPIC_4);

  await student.getByRole("button", { name: "Start session" }).click();
  await expect(student.getByText("Enter the teacher passcode.")).toBeVisible();

  await student.getByLabel("Teacher passcode").fill("a-guess-at-the-passcode");
  await student.getByRole("button", { name: "Start session" }).click();
  await expect(student.getByText("That passcode is not right.")).toBeVisible();
  await expect(student.getByTestId("room-code")).toHaveCount(0);
  expect(await student.evaluate(() => [localStorage.length, sessionStorage.length])).toEqual([0, 0]);
});

test("a remembered passcode is filled in next time and can be forgotten", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const teacher = await context.newPage();
  await teacher.goto("/play/host");
  await chooseSet(teacher, UNIT_3, TOPIC_4);
  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByLabel(/Remember on this device/).check();
  await teacher.getByRole("button", { name: "Start session" }).click();
  await expect(teacher.getByTestId("room-code")).toBeVisible();
  await teacher.getByRole("button", { name: "End session" }).click();
  await teacher.getByRole("button", { name: "End and delete" }).click();

  const later = await context.newPage();
  await later.goto("/play/host");
  await expect(later.getByLabel("Teacher passcode")).toHaveValue(TEACHER_PASSCODE);
  await later.getByRole("button", { name: "Forget the saved passcode" }).click();
  await expect(later.getByLabel("Teacher passcode")).toHaveValue("");
  expect(await later.evaluate(() => localStorage.getItem("classroom-quiz-teacher-passcode"))).toBeNull();
});

test("sets are found by level, course and search, and the last set used opens next time", async ({ browser }) => {
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const teacher = await context.newPage();
  await teacher.goto("/play/host");
  await expect(teacher.getByRole("button", { name: "Start session" })).toBeDisabled();

  // Filtering by level hides the other levels' courses.
  await teacher.getByRole("button", { name: "Level 1", exact: true }).click();
  await expect(teacher.getByRole("button", { name: /Unit 9/ })).toHaveCount(0);
  await chooseSet(teacher, /Unit A4 · Researching a topic/, /Referencing your sources/);
  await expect(teacher.getByTestId("chosen-set")).toContainText("Referencing your sources");

  // Searching in another course; the chosen set stays chosen meanwhile.
  await teacher.getByRole("button", { name: "All courses" }).click();
  await teacher.getByRole("button", { name: UNIT_3 }).click();
  await teacher.getByLabel("Find a set in this course").fill("css layout");
  await expect(teacher.getByRole("radio")).toHaveCount(1);
  await expect(teacher.getByRole("radio", { name: /Topic 15 · CSS layout/ })).toBeVisible();
  await expect(teacher.getByTestId("chosen-set")).toContainText("Referencing your sources");

  await teacher.getByLabel("Teacher passcode").fill(TEACHER_PASSCODE);
  await teacher.getByRole("button", { name: "Start session" }).click();
  await expect(teacher.getByText("Task 2 · Referencing your sources")).toBeVisible();
  const code = ((await teacher.getByTestId("room-code").textContent()) ?? "").replace(/\D/g, "");
  const student = await joinAsStudent(browser, code);

  // A Level 1 set: 10 questions, each with 30 seconds, and 15 more for a picture.
  await teacher.getByRole("button", { name: "Start the quiz" }).click();
  await expect(teacher.getByText("Question 1 of 20")).toBeVisible();
  await expect(student.getByLabel(/^(4[0-5]) seconds left$/)).toBeVisible();

  await teacher.getByRole("button", { name: "End session" }).click();
  await teacher.getByRole("button", { name: "End and delete" }).click();

  // Next time, this device opens on the same course with that set chosen.
  const later = await context.newPage();
  await later.goto("/play/host");
  await expect(later.getByRole("radio", { name: /Referencing your sources/ })).toBeChecked();
  await expect(later.getByRole("radio", { name: /Referencing your sources/ })).toHaveAccessibleName(/Last used/);
});

test("the teacher can read a set's questions before choosing it, with the answers hidden until asked", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await teacher.getByRole("button", { name: /Unit 9 · Spreadsheet development/ }).click();
  await teacher.getByRole("button", { name: /Preview the questions in Task 1 · Formulas and functions/ }).click();

  const preview = teacher.getByRole("dialog", { name: "Task 1 · Formulas and functions" });
  await expect(preview).toBeVisible();
  await expect(preview.getByTestId("preview-question")).toHaveCount(12);
  await expect(preview.getByText("What does =COUNTIF(B2:B7,\"North\") give?")).toBeVisible();
  await expect(preview.getByText("✓ Answer")).toHaveCount(0);
  await expect(preview.getByText(/COUNTIF counts the cells in B2:B7/)).toHaveCount(0);

  await preview.getByRole("button", { name: "Show answers" }).click();
  await expect(preview.getByText("✓ Answer")).toHaveCount(12);
  await expect(preview.getByText(/COUNTIF counts the cells in B2:B7/)).toBeVisible();

  await preview.getByRole("button", { name: "Choose this set" }).click();
  await expect(preview.getByText("✓ Chosen")).toBeVisible();
  await teacher.keyboard.press("Escape");
  await expect(preview).toHaveCount(0);
  await expect(teacher.getByRole("radio", { name: /Formulas and functions/ })).toBeChecked();
  await expect(teacher.getByTestId("chosen-set")).toContainText("Formulas and functions");

  // The side panel opens the chosen set's preview too, with the answers hidden again.
  await teacher.getByRole("button", { name: "Preview the questions", exact: true }).click();
  await expect(preview.getByText("✓ Answer")).toHaveCount(0);
  await preview.getByRole("button", { name: "Close" }).click();
  await expect(preview).toHaveCount(0);
});

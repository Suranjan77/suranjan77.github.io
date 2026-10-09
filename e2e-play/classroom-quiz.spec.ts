import { expect, test, type Browser, type Page } from "@playwright/test";

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

async function nickname(page: Page): Promise<string> {
  return (await page.getByTestId("nickname").textContent()) ?? "";
}

test("a teacher runs a session, students play on phones, and ending it deletes the room", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
  await teacher.getByLabel(/Topic 4 · User experience/).check();
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

  // Question 1 has four pictures as choices: they are on the projector, not the phones.
  await teacher.getByRole("button", { name: "Start the quiz" }).click();
  await expect(teacher.getByRole("heading", { name: /Which button's label meets/ })).toBeVisible();
  const pictures = teacher.getByRole("listitem").getByRole("img");
  await expect(pictures).toHaveCount(4);
  for (const picture of await pictures.all()) {
    await expect.poll(() => picture.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth > 0)).toBe(true);
  }
  await expect(ana.getByText("The pictures are on your teacher's screen.")).toBeVisible();
  await expect(ana.getByRole("img")).toHaveCount(0);

  // Ana answers B (correct), Ben answers D. Everyone has answered, so the answer is revealed.
  await ana.getByRole("button", { name: "B", exact: true }).click();
  await expect(ana.getByText("Answer B sent. Wait for the others.")).toBeVisible();
  await ben.getByRole("button", { name: "D", exact: true }).click();

  await expect(teacher.getByText("✓ Correct")).toBeVisible();
  await expect(teacher.getByText(/B measures 7\.0:1/)).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(anaName)).toBeVisible();
  await expect(teacher.getByRole("complementary").getByText(benName)).toHaveCount(0);
  await expect(ana.getByRole("heading", { name: "Correct" })).toBeVisible();
  await expect(ben.getByRole("heading", { name: "Not this time" })).toBeVisible();
  await expect(ben.getByText("The answer was B.")).toBeVisible();

  // A student's page reloads: same player, same name.
  await ben.reload();
  await expect(ben.getByRole("heading", { name: "Not this time" })).toBeVisible();
  await expect(ben.getByTestId("nickname")).toHaveText(benName);

  // The teacher's page reloads: the session carries on.
  await teacher.reload();
  await expect(teacher.getByText(`Code ${code.slice(0, 3)} ${code.slice(3)}`)).toBeVisible();
  await expect(teacher.getByText("✓ Correct")).toBeVisible();

  // Text question: the phones show the choices' words.
  await teacher.getByRole("button", { name: "Next question" }).click();
  await expect(ana.getByRole("button", { name: "C: 4.5:1" })).toBeVisible();
  await ana.getByRole("button", { name: "C: 4.5:1" }).click();
  await teacher.getByRole("button", { name: "Show the answer" }).click();
  await expect(ana.getByRole("heading", { name: "Correct" })).toBeVisible();
  await expect(ben.getByRole("heading", { name: "No answer" })).toBeVisible();

  // Through to the end.
  for (let i = 3; i <= 8; i += 1) {
    await teacher.getByRole("button", { name: "Next question" }).click();
    await expect(teacher.getByText(`Question ${i} of 8`)).toBeVisible();
    await teacher.getByRole("button", { name: "Show the answer" }).click();
  }
  await teacher.getByRole("button", { name: "See the results" }).click();
  await expect(teacher.getByRole("heading", { name: "What the room found hardest" })).toBeVisible();
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

test("the teacher can remove a student", async ({ browser }) => {
  const teacher = await (await browser.newContext({ viewport: { width: 1280, height: 720 } })).newPage();
  await teacher.goto("/play/host");
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

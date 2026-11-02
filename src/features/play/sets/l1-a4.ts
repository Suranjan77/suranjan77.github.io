import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * BTEC Level 1 Introductory Diploma in IT, Unit A4: Researching a topic.
 * Task 2 of the "Digital Life: Staying safe online" assignment: present a
 * summary of research findings for new students and their families (B.P3
 * outline summary, B.M3 clear summary with some sources, B.D3 focused summary
 * with clear referencing). Students build it in Google Slides and download it
 * as the PowerPoint file the brief asks for. The final check covers both
 * tasks, from the Staying Safe Online project handbook (Task 1, the research
 * log: A.P1 to A.D2), as a last check before hand-in and as revision.
 *
 * Written for Level 1, and for students who may not have met an idea or a
 * tool yet: every question shows what it asks about (the brief, a log, a
 * slide, the Google Slides screen), so the answer can be worked out from the
 * picture, and the explanation teaches the rule. Short sentences, everyday
 * words, two or three choices for most questions, 30 seconds to answer.
 *
 * Pictures are rendered from scripts/play-figures/l1-a4.html. None carries a
 * caption or a pass/fail label.
 */

const figure = figuresFrom("l1-a4");
const COURSE = "BTEC L1 IT · Unit A4";
const SECONDS = 30;

const brief = () =>
  figure("s1-brief", "An extract from the assignment brief: 'The College is putting together a Digital Life Guide to help new students, and their families who are visiting the campus, stay safe online. How would you explain one way of staying safe online to the visitors? Agree your final title with your tutor before you start your research.'");
const referenceParts = () =>
  figure("s3-reference-parts", "One of Sam's references, in four numbered parts. 1: National Cyber Security Centre. 2: 'Phishing: spot and report scam emails, texts, websites and calls'. 3: www.ncsc.gov.uk/collection/phishing-scams. 4: accessed 12 October 2026.");
const editor = () =>
  figure("s5-editor", "The Google Slides screen with four numbered parts. 1: the plus button at the left of the toolbar. 2: the column of small slides down the left side. 3: the box under the slide that says 'Click to add speaker notes'. 4: the Slideshow button at the top right, next to Share.");

export const planningPresentation: QuestionSet = {
  id: "l1-a4-t2-s1-planning",
  course: COURSE,
  title: "Task 2 · Planning your presentation",
  spec: "B.P3",
  seconds: SECONDS,
  questions: [
    {
      id: "audience",
      prompt: "Read the brief. Who is your presentation for?",
      image: brief(),
      choices: [{ text: "New students and their families" }, { text: "Only your tutor" }, { text: "IT experts" }],
      answer: 0,
      explanation: "The brief says the guide is for new students and their families. Write for them: plain words and tips they can use.",
    },
    {
      id: "purpose",
      prompt: "Read the brief. What must your presentation do?",
      image: figure("s1-brief-task", "From the brief, Task 2: what you need to do. 'Create a short presentation that explains ONE way of staying safe online. Use the findings in your research log from Task 1.'"),
      choices: [
        { text: "Explain one way of staying safe online" },
        { text: "Explain everything about the internet" },
        { text: "Show off lots of effects" },
      ],
      answer: 0,
      explanation: "The brief asks for one way of staying safe online. One topic, explained well, is what Task 2 summarises.",
    },
    {
      id: "agree-title",
      prompt: "Read the brief. Who must agree your title?",
      image: figure("s1-brief-checklist", "From the brief, a checklist headed 'Before you start your research': choose one topic from the list; agree your final title with your tutor; set up your research log."),
      choices: [{ text: "Your tutor" }, { text: "Your friends" }, { text: "Nobody" }],
      answer: 0,
      explanation: "Agree the final title with your tutor before you start. Then your research and your slides stay on one topic.",
    },
    {
      id: "narrow-title",
      prompt: "Sam picked phishing from this list. Which title is narrow enough to finish?",
      image: figure("s1-topics", "The brief's list of topics to choose from: passwords and how accounts get broken into; phishing: scam texts, emails and fake delivery messages; privacy settings and what you share on social media; online shopping scams and fake sellers; keeping a phone secure."),
      choices: [{ text: "How to spot a fake delivery text" }, { text: "Everything about the internet" }, { text: "All online dangers" }],
      answer: 0,
      explanation: "A narrow title is one question you can answer well in the time you have. Fake delivery texts are one kind of phishing.",
    },
    {
      id: "title-slide",
      askTwice: true,
      prompt: "Which title slide tells the visitors most clearly what the talk is about?",
      choices: [
        { image: figure("s1-title-vague", "A title slide that says 'My presentation', with the name Sam under it.") },
        { image: figure("s1-title-good", "A title slide that says 'Spotting fake delivery texts', then 'A guide for new students and families', then the name Sam.") },
        { image: figure("s1-title-crowded", "A title slide with no title, only a paragraph of facts about fake delivery texts and the sources.") },
      ],
      answer: 1,
      explanation: "A title slide gives the topic, who it is for and your name. The facts come on the slides after it.",
    },
    {
      id: "last-slide",
      prompt: "Look at the plan. What goes on the last slide?",
      image: figure("s1-plan", "The plan for six slides. Slide 1: Title. Slide 2: What is it? Slide 3: How to spot it. Slide 4: What to do. Slide 5: Key tips. Slide 6: Sources."),
      choices: [{ text: "Sources" }, { text: "Title" }, { text: "What is it?" }],
      answer: 0,
      explanation: "A presentation ends with the sources, so anyone can check where the facts came from. The key tips come just before.",
    },
    {
      id: "slide-order",
      askTwice: true,
      prompt: "Compare Sam's slides with the plan. Which of Sam's slides is in the wrong place?",
      image: figure("s1-plan-vs-slides", "A table comparing a plan with Sam's slides. Slide 1: plan Title, Sam's 'Spotting fake delivery texts'. Slide 2: plan 'What is it?', Sam's 'Where I found my facts'. Slide 3: plan 'How to spot it', Sam's 'What is a fake delivery text?'. Slide 4: plan 'What to do', Sam's 'How to spot one'. Slide 5: plan 'Key tips', Sam's 'What to do'. Slide 6: plan 'Sources', Sam's 'Key tips'."),
      choices: [{ text: "Slide 1" }, { text: "Slide 2" }, { text: "Slide 6" }],
      answer: 1,
      explanation: "'Where I found my facts' is the sources slide, so it belongs at the end. Moving it there puts every other slide back in line with the plan.",
    },
    {
      id: "one-idea",
      prompt: "A good slide has one main idea. Which slide does that?",
      choices: [
        { image: figure("s1-one-idea", "A slide headed 'Lock your phone' with three bullets, all about locking a phone.") },
        { image: figure("s1-many-ideas", "A slide headed 'Staying safe' with five bullets about five different things: passwords, scam texts, games, public Wi-Fi and bullying.") },
      ],
      answer: 0,
      explanation: "Every bullet on 'Lock your phone' is about one idea. Five ideas on one slide is five slides squeezed together.",
    },
    {
      id: "plain-words",
      askTwice: true,
      prompt: "Some visitors are parents who are not IT experts. Which sentence should replace this one?",
      image: figure("s1-jargon", "A slide headed 'What is smishing?' with one bullet: 'Smishing uses SMS vectors for credential harvesting via spoofed sender IDs.'"),
      choices: [
        { text: "A scam text pretends to be from a company you trust, to get your details." },
        { text: "Smishing is SMS-based phishing." },
        { text: "Scams are bad." },
      ],
      answer: 0,
      explanation: "Use everyday words and say what actually happens. Jargon loses people, and 'scams are bad' teaches them nothing.",
    },
    {
      id: "facts-from",
      prompt: "Where should the facts for Sam's slide 3 come from?",
      image: figure("s1-log-and-plan", "Sam's research log: what I researched, fake delivery texts; source, Action Fraud website; useful information, they say a parcel could not be delivered and ask you to pay a small fee through a link. Below it, Sam's plan for slide 3: 'What a fake delivery text asks for'."),
      choices: [{ text: "The research log" }, { text: "Sam's memory" }, { text: "A friend's slides" }],
      answer: 0,
      explanation: "The research log already holds the facts and where they came from. Task 2 is a summary of it.",
    },
    {
      id: "sketch-first",
      prompt: "Sam sketched each slide on paper before opening Google Slides. Why is that a good idea?",
      image: figure("s1-storyboard", "Sam's paper sketches of three slides. Slide 2, What is it?: one sentence and a picture of a scam text. Slide 3, How to spot it: three bullets, fee, strange link, 'act now'. Slide 4, What to do: don't click, forward to 7726, delete."),
      choices: [
        { text: "Sam knows what goes on each slide before building it" },
        { text: "Sketches make the slides longer" },
        { text: "The tutor only marks drawings" },
      ],
      answer: 0,
      explanation: "A quick plan of each slide saves time: you build it once, with one idea per slide, instead of changing it again and again.",
    },
    {
      id: "slide-order-cards",
      askTwice: true,
      prompt: "Sam's slides are mixed up. Which order makes sense to the visitors?",
      image: figure("s1-order-cards", "Four of Sam's slides, not in order, labelled A to D. A: What to do. B: Spotting fake delivery texts. C: How to spot one. D: What is a fake delivery text?"),
      choices: [{ text: "B, D, C, A" }, { text: "A, B, C, D" }, { text: "D, A, B, C" }],
      answer: 0,
      explanation: "Start with the title, say what it is, then how to spot it, and end with what to do. Each slide builds on the one before.",
    },
    {
      id: "fact-to-slide",
      askTwice: true,
      prompt: "Which slide in the plan should this fact go on?",
      image: figure("s1-fact-to-slide", "A fact from Sam's research log. Source: NCSC website. Useful information: if you get a scam text, do not click the link; forward it to 7726 for free, then delete it. Below are three planned slides: slide 2 What is it?, slide 3 How to spot it, slide 4 What to do."),
      choices: [{ text: "Slide 2: What is it?" }, { text: "Slide 3: How to spot it" }, { text: "Slide 4: What to do" }],
      answer: 2,
      explanation: "The fact tells people what to do when a scam text arrives, so it goes on 'What to do'. Sorting facts into the plan keeps each slide on one idea.",
    },
    {
      id: "right-tone",
      prompt: "Which bullet is NOT right for families visiting the College?",
      image: figure("s1-tone", "A slide headed 'What to do' with three numbered bullets. 1: Do not click links in texts you were not expecting. 2: if u click it ur dumb lol. 3: Forward scam texts to 7726."),
      choices: [{ text: "Bullet 1" }, { text: "Bullet 2" }, { text: "Bullet 3" }],
      answer: 1,
      explanation: "The visitors are new students and their families. Bullet 2 uses text-speak and calls people names; the others are polite, clear advice.",
    },
  ],
};

export const summarisingFindings: QuestionSet = {
  id: "l1-a4-t2-s2-summarising",
  course: COURSE,
  title: "Task 2 · Summarising your findings",
  spec: "B.P3, B.M3",
  seconds: SECONDS,
  questions: [
    {
      id: "what-summary",
      prompt: "On the left is a web page. On the right is Sam's summary. What did Sam keep?",
      image: figure("s2-article-summary", "On the left, a paragraph from the Action Fraud website about fake delivery texts: they say a parcel could not be delivered, ask you to click a link to rearrange delivery, the link goes to a fake website that asks for a small fee and steals the card details. On the right, Sam's slide 'Fake delivery texts' with three bullets: say a parcel could not be delivered; ask for a small fee through a link; the link steals your card details."),
      choices: [
        { text: "Only the main points, in a few words" },
        { text: "Every sentence, word for word" },
        { text: "Sam's own opinion" },
      ],
      answer: 0,
      explanation: "That is a summary: the main points, short, with the rest left out. Visitors get the important part quickly.",
    },
    {
      id: "best-bullet",
      prompt: "Which bullet point sums up Sam's log best?",
      image: figure("s2-research-log", "Sam's research log. What I researched: fake delivery texts. Source: Action Fraud website. Useful information: scam texts often say a parcel could not be delivered. They ask you to click a link and pay a small fee to book a new delivery. The link goes to a fake website that steals your card details."),
      choices: [
        { text: "Fake delivery texts ask you to pay a small fee through a link" },
        { text: "Texts are bad" },
        { text: "Parcels are often late" },
      ],
      answer: 0,
      explanation: "A good bullet keeps the key fact: the text asks for a fee through a link. The others lose the point or change it.",
    },
    {
      id: "own-words",
      prompt: "Sam's slide is the same as the website, word for word. What should Sam do?",
      image: figure("s2-copied", "On the left, the NCSC website: 'Using three random words is a good way to create a password that is long enough and strong enough.' On the right, Sam's slide 'Passwords' with exactly the same sentence."),
      choices: [
        { text: "Write it in Sam's own words and name the source" },
        { text: "Leave it: copying is fine" },
        { text: "Make the text bigger" },
      ],
      answer: 0,
      explanation: "Own words show you understood it. If you keep the exact words, put them in quotation marks and name the source.",
    },
    {
      id: "relevant",
      askTwice: true,
      prompt: "Sam's topic is strong passwords. Which row does NOT belong on the slides?",
      image: figure("s2-log-topic", "Sam's research log, topic: strong passwords. Row 1, NCSC website: use three random words to make a strong password. Row 2, a history of computers website: the first computers filled a whole room. Row 3, Action Fraud website: use a different password for your email account."),
      choices: [{ text: "Row 1" }, { text: "Row 2" }, { text: "Row 3" }],
      answer: 1,
      explanation: "Keep only what is about your agreed topic. Row 2 is true, but it is about old computers, not strong passwords.",
    },
    {
      id: "opinion",
      askTwice: true,
      prompt: "Which bullet is an opinion, not a fact?",
      image: figure("s2-fact-opinion", "A slide headed 'Scam texts' with three numbered bullets. 1: You can forward a scam text to 7726 for free. 2: Scam texts are really annoying. 3: Fake delivery texts often ask for a small fee."),
      choices: [{ text: "Bullet 1" }, { text: "Bullet 2" }, { text: "Bullet 3" }],
      answer: 1,
      explanation: "A fact can be checked in a source. 'Really annoying' is how someone feels: an opinion.",
    },
    {
      id: "focused",
      askTwice: true,
      prompt: "Which slide is the most focused summary, with its source?",
      choices: [
        { image: figure("s2-focus-outline", "A slide headed 'Phishing': phishing is when people trick you; scams are bad.") },
        { image: figure("s2-focus-clear", "A slide headed 'Fake delivery texts': they ask you to pay a small fee; the link goes to a fake website.") },
        { image: figure("s2-focus-focused", "A slide headed 'Fake delivery texts': they ask for a small fee through a link; do not click, forward the text to 7726. Along the bottom: Source: National Cyber Security Centre, www.ncsc.gov.uk.") },
      ],
      answer: 2,
      explanation: "The first is an outline, the second is clear, and the third is focused: what happens, what to do, and where the facts came from. That is the step from Pass to Distinction.",
    },
    {
      id: "tip-today",
      prompt: "Which bullet tells the visitors what to DO?",
      image: figure("s2-tips", "A slide headed 'Keeping your email safe' with three numbered bullets. 1: Hackers are very clever. 2: Turn on two-step verification. 3: Scams have been around for years."),
      choices: [{ text: "Bullet 1" }, { text: "Bullet 2" }, { text: "Bullet 3" }],
      answer: 1,
      explanation: "The visitors came to learn how to stay safe. A tip says what to do; the other two are only about the problem.",
    },
    {
      id: "same-point",
      prompt: "Three sources say the same thing. How should it go on the slides?",
      image: figure("s2-three-sources", "Sam's research log with three sources. NCSC website: forward scam texts to 7726, for free. Action Fraud website: you can report a scam text by forwarding it to 7726. Which? website: send scam texts to 7726 so your network can block them."),
      choices: [
        { text: "Write it once, and name the sources" },
        { text: "Put it on three different slides" },
        { text: "Leave it out" },
      ],
      answer: 0,
      explanation: "Say it once. Three sources that agree make the point stronger, so naming them helps.",
    },
    {
      id: "summing-up",
      prompt: "What should Sam put on slide 5?",
      image: figure("s2-missing-slide", "Sam's six slides. 1: Spotting fake delivery texts. 2: What is a fake delivery text? 3: How to spot one. 4: What to do. 5: a blank slide with a question mark. 6: Sources."),
      choices: [
        { text: "A short list of the key tips" },
        { text: "A new topic" },
        { text: "Just the words 'The end'" },
      ],
      answer: 0,
      explanation: "Finish with the main tips, so the visitors leave remembering what to do. The sources come last.",
    },
    {
      id: "bullets",
      prompt: "You will talk while this slide is up. Which one can the visitors follow?",
      choices: [
        { image: figure("s2-paragraph", "A slide headed 'Fake delivery texts' with one long paragraph.") },
        { image: figure("s2-bullets", "A slide headed 'Fake delivery texts' with three short bullets: pretend to be a delivery company; ask for a small fee by link; the link goes to a fake website.") },
      ],
      answer: 1,
      explanation: "People cannot read a paragraph and listen at the same time. Short bullets give the points; you say the detail.",
    },
    {
      id: "shorter",
      askTwice: true,
      prompt: "This bullet is too long. Which is the best short version?",
      image: figure("s2-long-bullet", "A slide headed 'Fake delivery texts' with one long bullet: 'Fake delivery texts are messages that you get on your phone that say that your parcel could not be delivered to your house'."),
      choices: [
        { text: "They say a parcel could not be delivered" },
        { text: "You get messages on your phone" },
        { text: "Parcels go to houses" },
      ],
      answer: 0,
      explanation: "Keep the part that matters, the claim the scam makes, and cut the words around it. The other two lose the point.",
    },
    {
      id: "main-point",
      prompt: "Sam is summarising this page. What is its main point?",
      image: figure("s2-2sv-page", "A page from the National Cyber Security Centre, www.ncsc.gov.uk, headed 'Turn on 2-step verification'. It says 2-step verification asks for a second check, such as a code sent to your phone, when you log in, so even if a criminal knows your password, they cannot get into your account without that code."),
      choices: [
        { text: "2-step verification stops criminals even if they know your password" },
        { text: "Criminals are everywhere" },
        { text: "The NCSC has a website" },
      ],
      answer: 0,
      explanation: "The main point is what the page wants you to know and do. The other two are true but are not what the page is about.",
    },
    {
      id: "heading",
      prompt: "This slide has no heading yet. Which heading sums it up?",
      image: figure("s2-no-heading", "A slide whose heading box still says 'Click to add title'. Its bullets: use a PIN, a fingerprint or your face; set it to lock after 1 minute; never tell anyone your PIN."),
      choices: [{ text: "Lock your phone" }, { text: "Slide 4" }, { text: "Phones are popular" }],
      answer: 0,
      explanation: "A heading says in a few words what every bullet is about. All three bullets are about locking your phone.",
    },
    {
      id: "check-log",
      askTwice: true,
      prompt: "Sam's slide does not match the research log. What is wrong?",
      image: figure("s2-log-vs-slide", "On the left, Sam's research log: 'NCSC: forward scam texts to 7726, for free.' On the right, Sam's slide 'What to do': do not click the link; forward the text to 999; delete it."),
      choices: [
        { text: "The number should be 7726, not 999" },
        { text: "The heading is wrong" },
        { text: "Nothing is wrong" },
      ],
      answer: 0,
      explanation: "999 is for emergencies; scam texts go to 7726. Check every fact on a slide against the log, so the summary says what the source said.",
    },
  ],
};

export const referencingSources: QuestionSet = {
  id: "l1-a4-t2-s3-referencing",
  course: COURSE,
  title: "Task 2 · Referencing your sources",
  spec: "B.M3, B.D3",
  seconds: SECONDS,
  questions: [
    {
      id: "what-source",
      prompt: "Sam searched on Google and opened this page. What is the source?",
      image: figure("s3-search", "A browser showing www.ncsc.gov.uk/collection/phishing-scams. The page is by the National Cyber Security Centre, titled 'Phishing: spot and report scam emails, texts, websites and calls'."),
      choices: [{ text: "The NCSC web page" }, { text: "Google" }, { text: "Sam's laptop" }],
      answer: 0,
      explanation: "Google only helped Sam find the page. The source is the page the facts are on, here the National Cyber Security Centre's.",
    },
    {
      id: "reference-when",
      prompt: "Which part of the reference says WHEN Sam looked at the page?",
      image: referenceParts(),
      choices: [{ text: "Part 1" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 2,
      explanation: "'Accessed' means the day you looked. Web pages change, so the date says when the page said what you used.",
    },
    {
      id: "reference-who",
      prompt: "Which part of the reference says WHO wrote the page?",
      image: figure("s3-reference-parts-gso", "Another of Sam's references, in four numbered parts. 1: Get Safe Online. 2: 'Smishing'. 3: www.getsafeonline.org. 4: accessed 15 October 2026."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 4" }],
      answer: 0,
      explanation: "A reference gives who wrote it (1), the page title (2), the web address (3) and the date you looked (4).",
    },
    {
      id: "complete-reference",
      askTwice: true,
      prompt: "Which reference is complete?",
      image: figure("s3-references", "A list headed Sources. 1: google.com. 2: National Cyber Security Centre, 'Phishing: spot and report scam emails, texts, websites and calls', www.ncsc.gov.uk, accessed 12 October 2026. 3: A website about scams."),
      choices: [{ text: "Reference 1" }, { text: "Reference 2" }, { text: "Reference 3" }],
      answer: 1,
      explanation: "Reference 2 has all four parts: who, title, address and date. Nobody could find or check the other two.",
    },
    {
      id: "missing-source",
      askTwice: true,
      prompt: "Compare the research log with the Sources slide. Which source is missing?",
      image: figure("s3-log-vs-sources", "On the left, Sam's research log lists three sources: NCSC website, Action Fraud website, Which? website. On the right, Sam's Sources slide lists two: National Cyber Security Centre, www.ncsc.gov.uk; Which?, www.which.co.uk."),
      choices: [{ text: "NCSC" }, { text: "Action Fraud" }, { text: "Which?" }],
      answer: 1,
      explanation: "Every source you used goes on the Sources slide. Checking the slide against the log catches the one you forgot.",
    },
    {
      id: "source-line",
      prompt: "What does the small line at the bottom of this slide do?",
      image: figure("s3-source-line", "A slide headed 'What to do with a scam text', with three bullets: do not click the link, forward the text to 7726 for free, delete it. Along the bottom, in small text: Source: National Cyber Security Centre, www.ncsc.gov.uk."),
      choices: [
        { text: "Shows where the facts on this slide came from" },
        { text: "Decorates the slide" },
        { text: "Gives the date of the talk" },
      ],
      answer: 0,
      explanation: "Naming the source on the slide links each fact to where it came from. That is clear referencing, which Distinction asks for.",
    },
    {
      id: "reliable",
      askTwice: true,
      prompt: "Which source can you trust for advice about scams?",
      choices: [
        { image: figure("s3-trust-comment", "A comment under a video by gamerboy_2009: 'scams only happen to old people lol, just dont be stupid'.") },
        { image: figure("s3-trust-ncsc", "A page from the National Cyber Security Centre, www.ncsc.gov.uk: 'Phishing: spot and report scam emails, texts, websites and calls'.") },
        { image: figure("s3-trust-post", "A post by deals4u_99: 'FREE £500 gift card!!! Click the link and enter your bank details to claim'.") },
      ],
      answer: 1,
      explanation: "The NCSC is the UK government's cyber security body. Anyone can post a comment, true or not, and the third one is a scam itself.",
    },
    {
      id: "up-to-date",
      prompt: "Two pages give password advice. Which should Sam use?",
      choices: [
        { image: figure("s3-date-old", "A web page, 'Password advice', last updated March 2011: change your password every month and write it on a sticky note.") },
        { image: figure("s3-date-new", "A web page from www.ncsc.gov.uk, 'Password advice', last updated September 2026: use three random words, and turn on two-step verification.") },
      ],
      answer: 1,
      explanation: "Check the date and who wrote it. Advice changes: the old page's tips are out of date, and the new one is from the NCSC.",
    },
    {
      id: "picture-credit",
      prompt: "Sam used a photo from a website. Which slide does it the right way?",
      choices: [
        { image: figure("s3-credit-no", "A slide headed 'Keeping a phone secure' with two bullets and a photo, and nothing saying where the photo came from.") },
        { image: figure("s3-credit-yes", "A slide headed 'Keeping a phone secure' with two bullets and a photo. Along the bottom: Photo: Pexels, free to use.") },
      ],
      answer: 1,
      explanation: "Pictures belong to whoever made them, just like words. Use free-to-use pictures and say where they came from.",
    },
    {
      id: "quote",
      prompt: "Sam used a sentence exactly as the website wrote it. Which slide shows it correctly?",
      choices: [
        { image: figure("s3-quote-yes", "A slide headed 'Unexpected texts' with the sentence 'Never click links in unexpected texts.' in quotation marks, and under it: Action Fraud, www.actionfraud.police.uk.") },
        { image: figure("s3-quote-no", "A slide headed 'Unexpected texts' with the sentence 'Never click links in unexpected texts.', no quotation marks and no source.") },
      ],
      answer: 0,
      explanation: "Quotation marks show the words are not yours, and the source shows whose they are.",
    },
    {
      id: "web-address",
      prompt: "Which part of this page goes in the reference as the web address?",
      image: figure("s3-address-bar", "A browser showing https://www.actionfraud.police.uk/scam-texts. The page is by Action Fraud, headed 'Scam texts': what to do if you get a text you think is a scam."),
      choices: [
        { text: "www.actionfraud.police.uk/scam-texts" },
        { text: "Action Fraud" },
        { text: "Scam texts" },
      ],
      answer: 0,
      explanation: "The web address is in the bar at the top of the browser. 'Action Fraud' is who made the page and 'Scam texts' is its title: both go in the reference too.",
    },
    {
      id: "own-words-source",
      askTwice: true,
      prompt: "Sam wrote this slide in their own words. Does it still need a source?",
      image: figure("s3-own-words", "On the left, the NCSC website: 'You can report a suspicious text message for free by forwarding it to 7726.' On the right, Sam's slide 'Got a scam text?' with two bullets in different words: send it on to 7726; it costs nothing."),
      choices: [
        { text: "Yes: the fact still came from the NCSC" },
        { text: "No: own words never need a source" },
        { text: "Only if the slide has a picture" },
      ],
      answer: 0,
      explanation: "Own words show you understood it, but the fact is still the NCSC's. Name the source whenever a fact came from somewhere.",
    },
    {
      id: "real-site",
      askTwice: true,
      prompt: "Sam searched for the NCSC. Which result is the real one?",
      image: figure("s3-results", "Two search results. 1: https://www.ncsc.gov.uk, National Cyber Security Centre, advice on spotting and reporting scams. 2: https://ncsc-prize-winners.biz, 'NCSC OFFICIAL!!! Claim your prize', enter your bank details to get your £1000 reward."),
      choices: [{ text: "Result 1" }, { text: "Result 2" }],
      answer: 0,
      explanation: "UK government sites end in .gov.uk. Result 2 uses the name to look official, shouts, and asks for bank details: it is a scam.",
    },
    {
      id: "picture-allowed",
      prompt: "Which picture can Sam put on a slide?",
      choices: [
        { image: figure("s3-image-copyright", "A photo labelled 'Daily News photo' with the note: © Daily News. All rights reserved.") },
        { image: figure("s3-image-free", "A photo from Pexels with the note: free to use, no permission needed.") },
      ],
      answer: 1,
      explanation: "'All rights reserved' means you need permission. Free-to-use pictures can go on slides, with a line saying where they came from.",
    },
  ],
};

export const designingSlides: QuestionSet = {
  id: "l1-a4-t2-s4-design",
  course: COURSE,
  title: "Task 2 · Designing clear slides",
  spec: "B.P3",
  seconds: SECONDS,
  questions: [
    {
      id: "easiest-read",
      prompt: "Which slide is easiest for the visitors to read?",
      choices: [
        { image: figure("s4-read-wall", "A slide headed Passwords, filled with one long paragraph in small text.") },
        { image: figure("s4-read-clear", "A slide headed Strong passwords, with three short bullet points and a picture beside them.") },
        { image: figure("s4-read-sparse", "A slide with only a colourful striped pattern and no words.") },
      ],
      answer: 1,
      explanation: "A heading, a few short bullets and a picture that fits. A wall of text is too much, and a pattern says nothing.",
    },
    {
      id: "contrast",
      askTwice: true,
      prompt: "Which slide can people at the back of the room read?",
      choices: [
        { image: figure("s4-contrast-pale", "A slide headed 'Lock your phone' with two bullets, in pale yellow text on a white background.") },
        { image: figure("s4-contrast-dark", "A slide headed 'Lock your phone' with two bullets, in dark navy text on a white background.") },
        { image: figure("s4-contrast-clash", "A slide headed 'Lock your phone' with two bullets, in red text on a green background.") },
      ],
      answer: 1,
      explanation: "Dark text on a light background stands out. Pale yellow on white fades away, and red on green is hard for everyone, hardest for colour-blind people.",
    },
    {
      id: "text-size",
      askTwice: true,
      prompt: "Which text size can be read from the back and still fits the slide?",
      choices: [
        { image: figure("s4-size-tiny", "A slide headed 'Strong passwords' with two bullets in very small text.") },
        { image: figure("s4-size-good", "A slide headed 'Strong passwords' with two bullets in large, clear text that fits the slide.") },
        { image: figure("s4-size-huge", "A slide headed 'Strong passwords' in text so large that the bullets run off the bottom of the slide.") },
      ],
      answer: 1,
      explanation: "Big enough to read across a room, small enough to fit. In Google Slides, keep text at about 24 point or more.",
    },
    {
      id: "fonts",
      prompt: "Which slide looks more professional?",
      choices: [
        { image: figure("s4-fonts-many", "A slide headed 'Gaming safely' where the heading and each of the three bullets is in a different font.") },
        { image: figure("s4-fonts-one", "A slide headed 'Gaming safely' with three bullets, all in one font.") },
      ],
      answer: 1,
      explanation: "One or two fonts look tidy and are easy to read. A different font on every line looks messy.",
    },
    {
      id: "busy-photo",
      prompt: "What makes this slide hard to read?",
      image: figure("s4-busy-photo", "A slide headed 'Gaming safely' with three bullets in white text, laid straight on top of a busy, striped, colourful picture."),
      choices: [
        { text: "The text is on top of a busy picture" },
        { text: "The heading is too short" },
        { text: "There are not enough words" },
      ],
      answer: 0,
      explanation: "Busy pictures fight with the words on top of them. Put text on a plain background, and the picture beside it.",
    },
    {
      id: "picture-fits",
      prompt: "Why does the picture on this slide work?",
      image: figure("s4-scam-picture", "A slide headed 'Spotting a fake delivery text', with three bullets: it asks you to pay a small fee, the link looks strange, it says you must act now. Beside them is a picture of a phone showing a text: 'Your parcel could not be delivered. Pay £1.45 to book a new time', with a link."),
      choices: [
        { text: "It shows an example of what the slide is about" },
        { text: "It fills up empty space" },
        { text: "It is colourful" },
      ],
      answer: 0,
      explanation: "A good picture helps explain the point. Here the visitors can see what a fake delivery text looks like.",
    },
    {
      id: "theme",
      prompt: "Which set of slides looks like one presentation?",
      choices: [
        { image: figure("s4-theme-mixed", "Four slides, each with a different background colour, a different coloured band and a different font.") },
        { image: figure("s4-theme-same", "Four slides with the same white background, the same navy band and the same font.") },
      ],
      answer: 1,
      explanation: "The same colours, fonts and layout on every slide look professional. In Google Slides, one theme does that for all slides at once.",
    },
    {
      id: "animations",
      prompt: "This is the Motion panel for one slide. What is the problem?",
      image: figure("s4-motion", "The Google Slides Motion panel for slide 3. The slide has a Spin transition, and five animations: title spin, bullet 1 fly in from left, bullet 2 zoom in, bullet 3 spin, picture fly in from bottom, each on click."),
      choices: [
        { text: "Too many effects distract from what you say" },
        { text: "There are not enough effects" },
        { text: "Nothing: effects are always good" },
      ],
      answer: 0,
      explanation: "Six different effects on one slide pull eyes away from the message. Use one simple effect, or none.",
    },
    {
      id: "not-colour-alone",
      askTwice: true,
      prompt: "Which slide still works for a visitor who is colour-blind?",
      choices: [
        { image: figure("s4-colour-only", "A slide headed 'Safe or not?' with four lines. Safe things are in green text and unsafe things in red text, with nothing else to tell them apart.") },
        { image: figure("s4-colour-symbols", "A slide headed 'Safe or not?' with four lines, each starting with a tick and 'Safe' or a cross and 'Unsafe'.") },
      ],
      answer: 1,
      explanation: "Some people cannot tell red from green. A tick or a cross and a word show the meaning without needing the colour.",
    },
    {
      id: "short-bullet",
      prompt: "Which slide is better for a talk?",
      choices: [
        { image: figure("s4-bullet-long", "A slide headed 'Strong passwords' with two long bullets: 'It is usually said by most experts that, when you make a new password, it is a good idea to use three words that are random', and 'You should also try not to use the same one'.") },
        { image: figure("s4-bullet-short", "A slide headed 'Strong passwords' with two short bullets: use three random words; one password per account.") },
      ],
      answer: 1,
      explanation: "Short bullets are quick to read. Say the longer explanation out loud, or put it in your speaker notes.",
    },
    {
      id: "tidy",
      askTwice: true,
      prompt: "Which slide looks tidier?",
      choices: [
        { image: figure("s4-align-messy", "A slide headed 'Lock your phone' where the heading and each of the three bullets start at a different place across the slide.") },
        { image: figure("s4-align-neat", "A slide headed 'Lock your phone' with three bullets, all lined up down the left side.") },
      ],
      answer: 1,
      explanation: "Lining text up down one edge looks neat and is quicker to read. Text dotted about the slide looks careless.",
    },
    {
      id: "stretched",
      prompt: "Which slide uses its picture better?",
      choices: [
        { image: figure("s4-pic-stretched", "A slide headed 'Scam texts' with two bullets and a picture of a phone that has been stretched wide and squashed flat.") },
        { image: figure("s4-pic-good", "A slide headed 'Scam texts' with two bullets and a picture of a phone showing a scam text, the right shape.") },
      ],
      answer: 1,
      explanation: "A stretched picture looks wrong. Resize pictures from a corner, so they keep their shape.",
    },
    {
      id: "has-heading",
      prompt: "Which slide tells the visitors straight away what it is about?",
      choices: [
        { image: figure("s4-heading-none", "A slide with three bullets and no heading: use three random words; one password per account; turn on two-step verification.") },
        { image: figure("s4-heading-yes", "A slide headed 'Strong passwords' with three bullets: use three random words; one password per account; turn on two-step verification.") },
      ],
      answer: 1,
      explanation: "A heading on every slide tells people the topic before they read the bullets.",
    },
    {
      id: "capitals",
      prompt: "Which slide is easier to read?",
      choices: [
        { image: figure("s4-caps", "A slide headed 'GAMING SAFELY' with three bullets, all in capital letters.") },
        { image: figure("s4-case", "A slide headed 'Gaming safely' with three bullets in normal sentence case.") },
      ],
      answer: 1,
      explanation: "Words in capitals all look like the same block shape, so they are slower to read, and they look like shouting.",
    },
  ],
};

export const usingGoogleSlides: QuestionSet = {
  id: "l1-a4-t2-s5-google-slides",
  course: COURSE,
  title: "Task 2 · Building it in Google Slides",
  spec: "B.P3",
  seconds: SECONDS,
  questions: [
    {
      id: "new-slide",
      prompt: "This is the Google Slides toolbar. Which part adds a new slide?",
      image: figure("s5-toolbar", "The Google Slides toolbar with four numbered parts. 1: the plus button with a small arrow. 2: the undo and redo arrows. 3: Background. 4: Theme."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 0,
      explanation: "The + button adds a new slide; its little arrow lets you pick a layout. Ctrl + M does the same.",
    },
    {
      id: "move-slide",
      askTwice: true,
      prompt: "Where do you drag a slide to move it to a new place?",
      image: editor(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 1,
      explanation: "The column of small slides on the left shows the order. Drag a slide up or down there to move it.",
    },
    {
      id: "notes",
      askTwice: true,
      prompt: "Where do you type what you will say, so the visitors do not see it?",
      image: figure("s5-notes", "A slide being edited in Google Slides, with three numbered parts. 1: the slide's heading, 'How to spot one'. 2: the slide's bullet points. 3: the box under the slide that says 'Click to add speaker notes'."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }],
      answer: 2,
      explanation: "Speaker notes go in the box under the slide. They help you remember the detail and are not shown in the slideshow.",
    },
    {
      id: "slideshow",
      prompt: "Which part starts the presentation full screen?",
      image: figure("s5-topbar", "The top of the Google Slides screen with three numbered parts. 1: the comments button. 2: the Slideshow button. 3: the Share button."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }],
      answer: 1,
      explanation: "Slideshow, at the top right, shows the slides full screen. Press Esc to stop.",
    },
    {
      id: "layout",
      askTwice: true,
      prompt: "These are the slide layouts. Which one gives a heading and one box for bullet points?",
      image: figure("s5-layouts", "The Google Slides layouts, each with its name: Title slide, Section header, Title and body, Title and two columns, Title only, Main point, Big number, Blank."),
      choices: [{ text: "Title slide" }, { text: "Title and body" }, { text: "Big number" }, { text: "Blank" }],
      answer: 1,
      explanation: "Title and body has a heading box and one big box for bullets. Title slide is for the first slide. Choose a layout with Slide › Apply layout.",
    },
    {
      id: "theme",
      prompt: "You want every slide to have the same colours and fonts. Which option do you click?",
      image: figure("s5-slide-menu", "The Slide menu open in Google Slides, listing: New slide (Ctrl+M), Duplicate slide, Delete slide, Skip slide, Change background, Apply layout, Transition, Edit theme, Change theme."),
      choices: [{ text: "Change theme" }, { text: "Duplicate slide" }, { text: "Skip slide" }],
      answer: 0,
      explanation: "A theme sets the colours and fonts for every slide at once. Change theme opens a list of themes to pick from.",
    },
    {
      id: "insert-picture",
      prompt: "Your picture is saved on the computer. Which option do you click?",
      image: figure("s5-insert-image", "The Insert menu open in Google Slides with Image chosen. Its list says: Upload from computer, Search the web, Drive, Photos, By URL, Camera."),
      choices: [{ text: "Upload from computer" }, { text: "Search the web" }, { text: "Camera" }],
      answer: 0,
      explanation: "Insert › Image › Upload from computer adds a picture you have saved. Remember to say where it came from.",
    },
    {
      id: "spelling",
      prompt: "A red wavy line is under 'pasword'. Sam right-clicked it. What should Sam click?",
      image: figure("s5-spelling", "A slide with the bullet 'Never share your pasword'. 'pasword' has a red wavy line under it. A right-click menu is open, offering: password, passwords, Ignore, Add to dictionary, Cut, Copy."),
      choices: [{ text: "password" }, { text: "Ignore" }, { text: "Add to dictionary" }],
      answer: 0,
      explanation: "A red wavy line marks a spelling mistake. Right-click it and pick the right word. Tools › Spelling › Spell check checks every slide.",
    },
    {
      id: "rename",
      prompt: "Sam's file is called 'Untitled presentation'. How does Sam give it a name?",
      image: figure("s5-title-box", "The top of the Google Slides screen. At the top left, next to the yellow Slides icon, the file name says 'Untitled presentation'. Below are the menus and the toolbar; at the top right are Slideshow and Share."),
      choices: [
        { text: "Click 'Untitled presentation' and type a new name" },
        { text: "Click Slideshow" },
        { text: "Click the + button" },
      ],
      answer: 0,
      explanation: "Click the name at the top left and type, for example 'A4 Task 2 - Fake delivery texts - Sam', so you and your tutor can find it.",
    },
    {
      id: "download-pptx",
      prompt: "The brief asks for a PowerPoint file. Which option do you click?",
      image: figure("s5-download", "The File menu open in Google Slides with Download chosen. Its list says: Microsoft PowerPoint (.pptx), ODP Document (.odp), PDF Document (.pdf), Plain Text (.txt), JPEG image, PNG image."),
      choices: [{ text: "Microsoft PowerPoint (.pptx)" }, { text: "PDF Document (.pdf)" }, { text: "Plain Text (.txt)" }],
      answer: 0,
      explanation: "File › Download › Microsoft PowerPoint (.pptx) saves a copy that opens in PowerPoint, as the brief asks.",
    },
    {
      id: "undo",
      prompt: "Sam deleted a slide by mistake. Which option brings it back?",
      image: figure("s5-edit-menu", "The Edit menu open in Google Slides, listing: Undo (Ctrl+Z), Redo (Ctrl+Y), Cut, Copy, Paste, Delete."),
      choices: [{ text: "Undo" }, { text: "Redo" }, { text: "Delete" }],
      answer: 0,
      explanation: "Undo, or Ctrl + Z, takes back the last thing you did. Redo puts it back again if you undo too much.",
    },
    {
      id: "share-tutor",
      askTwice: true,
      prompt: "Sam wants the tutor to see the slides. What should Sam do here?",
      image: figure("s5-share", "The Share box for 'Spotting fake delivery texts'. At the top, a box that says 'Add people, groups and calendar events'. Under 'People with access': Sam (you), Owner. Under 'General access': Restricted, only people with access can open."),
      choices: [
        { text: "Type the tutor's email in 'Add people'" },
        { text: "Leave it as it is" },
        { text: "Close the box and click Slideshow" },
      ],
      answer: 0,
      explanation: "Restricted means only the people listed can open it, and only Sam is listed. Adding the tutor's email gives them access.",
    },
    {
      id: "duplicate",
      prompt: "Sam wants a new slide that looks just like slide 3. Which option?",
      image: figure("s5-duplicate", "The column of slides in Google Slides, with slide 3, 'How to spot one', chosen and a right-click menu open: New slide (Ctrl+M), Duplicate slide, Delete, Skip slide, Change background."),
      choices: [{ text: "Duplicate slide" }, { text: "New slide" }, { text: "Skip slide" }],
      answer: 0,
      explanation: "Duplicate slide makes a copy with the same layout and design, ready to change the words. New slide starts an empty one.",
    },
    {
      id: "saved",
      prompt: "What does 'Saved to Drive' at the top mean?",
      image: figure("s5-saved", "The top of the Google Slides screen. Next to the file name 'Spotting fake delivery texts' it says 'Saved to Drive', with a cloud symbol."),
      choices: [
        { text: "Google saved the slides for you, online" },
        { text: "Sam must press Save before closing" },
        { text: "The slides have been deleted" },
      ],
      answer: 0,
      explanation: "Google Slides saves as you work, to your Google Drive. You can open it again from any computer when you sign in.",
    },
  ],
};

/*
 * Final check: the Staying Safe Online project handbook's to-do list and
 * "Final check before you hand in", one set per task. Each question shows a
 * piece of Sam's work with one thing to spot, and each explanation gives the
 * rule and what to check in your own work, so the set works as a last check
 * before hand-in and as revision for anyone behind. The research log has the
 * handbook's four columns (Date, URL, Source details, Comments/notes), and a
 * full reference its five parts, in the handbook's order.
 */

export const researchLogCheck: QuestionSet = {
  id: "l1-a4-check-s1-research-log",
  course: COURSE,
  title: "Final check · Your research log (Task 1)",
  spec: "A.P1, A.P2, A.M1, A.M2, A.D1, A.D2",
  seconds: SECONDS,
  questions: [
    {
      id: "missing-column",
      askTwice: true,
      prompt: "Sam's log has four columns. Which one has Sam left empty?",
      image: figure("c1-missing-column", "One row of Sam's research log, topic fake delivery texts, with four columns. Date: 3 Oct 2026. URL: empty. Source details: Author: Get Safe Online, Title: Smishing, Published: no date. Comments/notes: Found by: Google search 'scam text help' (own source, O). Scam texts can pretend to be from your bank."),
      choices: [{ text: "Date" }, { text: "URL" }, { text: "Source details" }, { text: "Comments/notes" }],
      answer: 1,
      explanation: "The URL is empty, so nobody could find the page again. Check yours: every row needs all four columns filled in.",
    },
    {
      id: "date-column",
      prompt: "Sam reads this page today, 2 October 2026. What goes in the Date column?",
      image: figure("c1-date", "A web page at www.actionfraud.police.uk/scam-texts by Action Fraud, titled 'Scam texts', last updated 5 March 2025. It says criminals send texts that pretend to be from banks and delivery firms, and never to click a link in a text you did not expect."),
      choices: [{ text: "2 October 2026" }, { text: "5 March 2025" }],
      answer: 0,
      explanation: "The Date column is the day you looked at the page. The date it was published or updated goes in Source details.",
    },
    {
      id: "url",
      prompt: "What should Sam write in the URL column for this page?",
      image: figure("c1-address", "A web page by the National Cyber Security Centre titled 'Phishing: spot and report scam emails, texts, websites and calls'. The address bar says https://www.ncsc.gov.uk/collection/phishing-scams."),
      choices: [{ text: "https://www.ncsc.gov.uk/collection/phishing-scams" }, { text: "ncsc" }, { text: "Google" }],
      answer: 0,
      explanation: "Write the full web address. Copy it from the address bar, so it is exactly right and anyone can open the same page.",
    },
    {
      id: "source-details",
      askTwice: true,
      prompt: "Which source details are complete for this page?",
      image: figure("c1-page-details", "A web page at www.getsafeonline.org/smishing. At the top: Get Safe Online. Title: Smishing. Published: 14 May 2025. It says smishing is phishing by text message, and the text tries to get you to tap a link or call a number."),
      choices: [
        { text: "Author: Get Safe Online · Title: Smishing · Published: 14 May 2025" },
        { text: "Author: Get Safe Online" },
        { text: "A page about scam texts" },
      ],
      answer: 0,
      explanation: "Source details need three things: who made it, the title of the page, and when it was published. Look at the top and bottom of the page.",
    },
    {
      id: "no-date",
      prompt: "This page has no author's name and no date. What goes in Source details?",
      image: figure("c1-no-date", "A web page at www.which.co.uk by Which?, titled 'How to spot a scam text'. It says to look out for links you were not expecting, spelling mistakes and messages that rush you. At the bottom: © Which?, About us, Contact us. There is no author's name and no date."),
      choices: [
        { text: "Which?, the title, and \"no date\"" },
        { text: "Nothing: leave this source out" },
        { text: "Make up a date" },
      ],
      answer: 0,
      explanation: "No author? Write the organisation's name. No date? Write \"no date\". That is fine, as long as you have looked.",
    },
    {
      id: "how-found",
      prompt: "Sam's notes are missing something the handbook asks for. What?",
      image: figure("c1-how-found", "One row of Sam's research log. Date: 2 Oct 2026. URL: https://www.ncsc.gov.uk/collection/phishing-scams. Source details: National Cyber Security Centre, 'Phishing: spot and report scam emails, texts, websites and calls', published no date. Comments/notes: Scam texts often say you missed a parcel. Real companies don't ask for card details by text. Forward scam texts to 7726."),
      choices: [
        { text: "How Sam found it, and G or O" },
        { text: "Sam's favourite website" },
        { text: "A picture of the page" },
      ],
      answer: 0,
      explanation: "Your notes say how you found each source (what you searched for, or that your tutor gave it) and mark it G or O. Check every row of yours.",
    },
    {
      id: "given-source",
      prompt: "Sam's tutor gave out two sources. Which of these is one of them?",
      image: figure("c1-given", "Three sources. OWASP, owasp.org: OWASP Top Ten, the most common security risks for web applications. Get Safe Online, getsafeonline.org: Smishing, what it is and how to protect yourself. National Cyber Security Centre, ncsc.gov.uk: Phishing: spot and report scam emails, texts, websites and calls."),
      choices: [{ text: "OWASP" }, { text: "Get Safe Online" }, { text: "National Cyber Security Centre" }],
      answer: 0,
      explanation: "The given sources are NIST and OWASP. Anything else you found, like Get Safe Online or the NCSC, is your own source.",
    },
    {
      id: "g-or-o",
      askTwice: true,
      prompt: "Which letter should Sam write where the ( ? ) is?",
      image: figure("c1-g-or-o", "Sam's comments/notes for one source: 'Found by: I searched \"how to report a scam text\" on Google. ( ? ) You can forward a scam text to 7726 for free. Then delete it.'"),
      choices: [{ text: "G" }, { text: "O" }],
      answer: 1,
      explanation: "Sam searched and found it, so it is an own source: O. G is only for the sources your tutor gave you. The letter lets the assessor see it.",
    },
    {
      id: "merit",
      prompt: "Every source in Sam's log is a G. What does Sam need to reach Merit?",
      image: figure("c1-only-given", "Sam's research log, four rows, with a G or O column. 1: NIST, Digital Identity Guidelines, G. 2: OWASP, Top Ten, G. 3: NIST, Phishing, G. 4: OWASP, Authentication Cheat Sheet, G."),
      choices: [
        { text: "Some sources Sam found (O)" },
        { text: "More rows from NIST" },
        { text: "Longer notes" },
      ],
      answer: 0,
      explanation: "Merit needs your tutor's sources and some you found yourself. Check yours: is there at least one O?",
    },
    {
      id: "off-topic",
      askTwice: true,
      prompt: "Sam's topic is fake delivery texts. Which row should Sam cross out?",
      image: figure("c1-off-topic", "Sam's research log, topic fake delivery texts. Row 1: Action Fraud, Scam texts: fake delivery texts ask you to pay a small fee through a link. Row 2: Tech Today, Best gaming laptops: a good gaming laptop needs a fast graphics card. Row 3: NCSC, Phishing: forward scam texts to 7726, then delete them."),
      choices: [{ text: "Row 1" }, { text: "Row 2" }, { text: "Row 3" }],
      answer: 1,
      explanation: "Gaming laptops are not about fake delivery texts. Cross out off-topic rows: Distinction needs everything to link to your topic.",
    },
    {
      id: "own-words",
      prompt: "Which notes are written the way the handbook asks?",
      choices: [
        { image: figure("c1-notes-copied", "Notes that copy a whole paragraph from a web page: 'Criminals are sending texts that look like they come from delivery companies. The message says a parcel could not be delivered, and asks the person to click a link to rearrange delivery. The link goes to a fake website that asks for a small fee. The website then steals the card details that are typed in, and criminals use them to take money from the account.'") },
        { image: figure("c1-notes-own", "Short notes: 'Fake delivery texts ask you to pay a small fee through a link. The link is a fake website that steals your card details.'") },
      ],
      answer: 1,
      explanation: "Good notes pick out the useful facts, in your own words. Copying the whole page is not picking anything out.",
    },
    {
      id: "simple-words",
      askTwice: true,
      prompt: "OWASP is written for IT experts. Which note says this in simple words?",
      image: figure("c1-owasp", "From OWASP Top Ten, a given source: 'Where possible, implement multi-factor authentication to prevent automated credential stuffing, brute force, and stolen credential reuse attacks.'"),
      choices: [
        { text: "Turn on two-step login, so a stolen password is not enough to get in" },
        { text: "Implement multi-factor authentication against credential stuffing" },
        { text: "Skip it: it is too hard to read" },
      ],
      answer: 0,
      explanation: "Pick out one key idea and write it so a new student's family would understand. Copying the expert words does not explain them.",
    },
    {
      id: "who-made",
      prompt: "Which page can Sam trust more?",
      choices: [
        { image: figure("c1-who-clear", "A page at www.actionfraud.police.uk by Action Fraud, the UK's national reporting centre for fraud, titled 'Report a scam text': forward scam texts to 7726 and report fraud to Action Fraud.") },
        { image: figure("c1-who-unclear", "A page at best-tips-4u.blogspot.example with no name on it, titled 'top 10 scam tips!!!': 'scams r everywhere, just never answer ur phone and u will be fine'.") },
      ],
      answer: 0,
      explanation: "You can tell who made the first page, and it is the UK's fraud reporting centre. Government, charity, bank or big company sites are usually trustworthy.",
    },
    {
      id: "distinction",
      prompt: "All four columns filled, G and O sources, every row on topic. Which grade is Sam's log aiming for?",
      image: figure("c1-full-log", "Two rows of Sam's research log, topic fake delivery texts. Row 1: 1 Oct 2026, https://owasp.org/Top10, OWASP, OWASP Top Ten, no date; notes: given by my tutor (G), turning on two-step login stops criminals using stolen passwords. Row 2: 2 Oct 2026, https://www.ncsc.gov.uk/collection/phishing-scams, National Cyber Security Centre, Phishing: spot and report scam emails, texts, websites and calls, no date; notes: found by Google search 'fake parcel text UK' (O), real companies don't ask for card details by text, forward scam texts to 7726."),
      choices: [{ text: "Pass" }, { text: "Merit" }, { text: "Distinction" }],
      answer: 2,
      explanation: "Given and own sources, a focused search, and nothing off-topic is Distinction. Check yours against the same three things.",
    },
  ],
};

export const presentationCheck: QuestionSet = {
  id: "l1-a4-check-s2-presentation",
  course: COURSE,
  title: "Final check · Your PowerPoint and handing in (Task 2)",
  spec: "B.P3, B.M3, B.D3",
  seconds: SECONDS,
  questions: [
    {
      id: "slide-count",
      askTwice: true,
      prompt: "Which plan is a good length for Sam's PowerPoint?",
      choices: [
        { image: figure("c2-plan-short", "A plan of 3 slides, numbered 1 to 3.") },
        { image: figure("c2-plan-right", "A plan of 7 slides, numbered 1 to 7.") },
        { image: figure("c2-plan-long", "A plan of 15 slides, numbered 1 to 15.") },
      ],
      answer: 1,
      explanation: "Aim for 6 to 8 slides: enough to cover your topic without losing your audience. Plan them on paper first.",
    },
    {
      id: "agreed-title",
      prompt: "Sam agreed the title 'Spotting fake delivery texts'. Which title slide is right?",
      choices: [
        { image: figure("c2-title-wrong", "A title slide: 'Fake texts', Sam Jones, and a picture of a phone with a scam text.") },
        { image: figure("c2-title-right", "A title slide: 'Spotting fake delivery texts', Sam Jones, and a picture of a phone with a scam text.") },
      ],
      answer: 1,
      explanation: "Use the exact title you agreed with your tutor, with your name and a picture. Every other slide links back to it.",
    },
    {
      id: "missing-slide",
      askTwice: true,
      prompt: "This is the handbook's plan. Which slide goes at number 7?",
      image: figure("c2-missing-slide", "Eight slides in order. 1: Spotting fake delivery texts. 2: What is it? 3: Why it matters. 4: How it happens. 5: Warning signs. 6: How to stay safe. 7: a blank slide with a question mark. 8: Sources."),
      choices: [{ text: "What to do if it happens" }, { text: "About me" }, { text: "A second title slide" }],
      answer: 0,
      explanation: "After the tips comes what to do if it happens: who to tell and real places to report it, like forwarding scam texts to 7726.",
    },
    {
      id: "doing-word",
      askTwice: true,
      prompt: "Which tip is written the way the handbook asks?",
      image: figure("c2-doing-word", "A slide headed 'How to stay safe' with three numbered bullets. 1: Passwords are really important. 2: Check who sent a text before you tap a link. 3: Hackers are everywhere."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }],
      answer: 1,
      explanation: "Start each tip with a doing word, like Check, Use or Turn on, so people know what to do today. The others tell them nothing to do.",
    },
    {
      id: "too-many",
      prompt: "How many bullet points should this slide have?",
      image: figure("c2-too-many", "A slide headed 'Scam texts' crammed with nine small bullet points: they pretend to be a delivery company, or your bank, or the tax office, they say you missed a parcel, they ask for a small fee, the link looks strange, they rush you, they have spelling mistakes, forward them to 7726."),
      choices: [{ text: "About 3 to 5" }, { text: "About 9 to 12" }, { text: "As many as fit" }],
      answer: 0,
      explanation: "A good slide can be read in about 10 seconds. Keep 3 to 5 short bullets and move the rest to another slide.",
    },
    {
      id: "text-size",
      prompt: "Sam's bullet points are size 12. What size should they be?",
      image: figure("c2-font-size", "The Google Slides toolbar with the font size box showing 12. Below, a slide headed 'Warning signs' with two small bullet points selected: a link you did not expect, it rushes you to pay."),
      choices: [{ text: "24 or bigger" }, { text: "12 is fine" }, { text: "10, to fit more in" }],
      answer: 0,
      explanation: "Use size 24 or bigger for bullets and 36 or bigger for titles, so the back of the room can read them.",
    },
    {
      id: "red-green",
      prompt: "What is wrong with these colours?",
      image: figure("c2-red-green", "A slide headed 'Warning signs' in red text on a green background, with three bullets: a link you did not expect, it rushes you to pay, spelling mistakes."),
      choices: [
        { text: "Red on green is hard to read for lots of people" },
        { text: "Nothing" },
        { text: "It needs more colours" },
      ],
      answer: 0,
      explanation: "Red and green look alike to many colour-blind people. Use dark text on a light background, and stick to one or two colours.",
    },
    {
      id: "jargon",
      prompt: "A student's grandad reads this slide. What should Sam add?",
      image: figure("c2-jargon", "A slide headed 'Watch out for phishing' with three bullets: phishing is very common; smishing is phishing on your phone; never fall for phishing."),
      choices: [
        { text: "What 'phishing' means, in simple words" },
        { text: "Some animations" },
        { text: "A longer heading" },
      ],
      answer: 0,
      explanation: "If you must use a word like phishing, explain it: fake messages that try to trick you into giving away passwords or bank details.",
    },
    {
      id: "source-on-slide",
      prompt: "What does this slide need to reach Distinction?",
      image: figure("c2-no-source", "A slide headed 'What to do with a scam text' with three bullets: do not tap the link; forward the text to 7726, for free; then delete it. There is nothing at the bottom of the slide."),
      choices: [
        { text: "A source under the facts" },
        { text: "A brighter background" },
        { text: "More bullet points" },
      ],
      answer: 0,
      explanation: "Every fact needs a source on the slide, in small text at the bottom, like: Source: National Cyber Security Centre.",
    },
    {
      id: "not-google",
      prompt: "What is wrong with Sam's Sources slide?",
      image: figure("c2-google-sources", "A slide headed 'Sources' with three bullets: Google; Google; YouTube."),
      choices: [
        { text: "Google is how Sam found them, not where they came from" },
        { text: "It needs more colours" },
        { text: "Nothing: it is fine" },
      ],
      answer: 0,
      explanation: "Name the page the facts came from, copied from your research log. Nobody can check \"Google\".",
    },
    {
      id: "reference-missing",
      askTwice: true,
      prompt: "A full reference has five things. Which is missing from Sam's?",
      image: figure("c2-ref-missing", "Sam's Sources slide: 'National Cyber Security Centre (no date) https://www.ncsc.gov.uk/collection/phishing-scams (Accessed: 2 October 2026).'"),
      choices: [{ text: "The title of the page" }, { text: "Who made it" }, { text: "The date Sam looked at it" }],
      answer: 0,
      explanation: "The five, in order: author, date published (or no date), title, URL, and the date you looked. All five are in your research log.",
    },
    {
      id: "picture-source",
      prompt: "Sam copied this scam text picture from the Which? website. What must Sam do?",
      image: figure("c2-screenshot", "A slide headed 'What a scam text looks like' with two bullets, it says you missed a parcel and it asks for a fee, beside a picture of a phone showing a scam text asking for £1.99. Nothing on the slide says where the picture came from."),
      choices: [
        { text: "Reference the picture too" },
        { text: "Nothing: pictures do not need a source" },
        { text: "Stretch it to fill the slide" },
      ],
      answer: 0,
      explanation: "If you used a picture from a website, reference it, the same as a fact. Put the source under it and on your Sources slide.",
    },
    {
      id: "fact-not-in-log",
      askTwice: true,
      prompt: "Which fact on the slide is not in Sam's research log?",
      image: figure("c2-fact-not-in-log", "On the left, Sam's research log notes: real companies don't ask for card details by text; forward scam texts to 7726. On the right, a slide headed 'What to do' with three numbered bullets. 1: Forward scam texts to 7726. 2: Real companies don't ask for card details by text. 3: Turn your phone off at night to stop scams."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }],
      answer: 2,
      explanation: "Every fact on your slides comes from a row in your log. If it is not in your log, research it or leave it out.",
    },
    {
      id: "file-name",
      prompt: "Sam's file is called 'Untitled presentation'. Which name does the handbook ask for?",
      image: figure("c2-file-name", "A Downloads list with one PowerPoint file: Untitled presentation.pptx."),
      choices: [
        { text: "Sam_Jones_StayingSafeOnline.pptx" },
        { text: "Untitled presentation.pptx" },
        { text: "my work.pptx" },
      ],
      answer: 0,
      explanation: "Put your name in the file name, like Alex_Smith_StayingSafeOnline.pptx, so your tutor knows whose work it is.",
    },
    {
      id: "hand-in",
      prompt: "Sam is about to click Hand in. What is missing?",
      image: figure("c2-hand-in", "A hand-in page for 'Unit A4: Staying safe online', which says: hand in your research log and your PowerPoint. Under 'Your work' is one file, Sam_Jones_StayingSafeOnline.pptx, then the buttons Add and Hand in."),
      choices: [{ text: "The research log" }, { text: "Nothing: it is ready" }, { text: "A copy of the brief" }],
      answer: 0,
      explanation: "Hand in both: your research log for Task 1 and your PowerPoint for Task 2. Check both are attached before you click.",
    },
    {
      id: "grade-up",
      prompt: "What would move Sam up a grade?",
      image: figure("c2-grade-up", "A tutor's comment: 'Pass. Your slides give a basic outline of what you found. All your sources are the two I gave you, and there are no sources on your slides.'"),
      choices: [
        { text: "Find own sources, stay on topic, reference everything" },
        { text: "Add animations and more fonts" },
        { text: "Write longer paragraphs" },
      ],
      answer: 0,
      explanation: "The handbook's short version: to move up a grade, find some sources yourself, stay on topic, and reference everything.",
    },
  ],
};

/** In teaching order: Task 2 week by week, then the final check of both tasks before hand-in. */
export const sections: CourseSection[] = [
  {
    title: "Task 2 · Presenting your research findings",
    sets: [planningPresentation, summarisingFindings, referencingSources, designingSlides, usingGoogleSlides],
  },
  {
    title: "Final check · Before you hand in",
    sets: [researchLogCheck, presentationCheck],
  },
];

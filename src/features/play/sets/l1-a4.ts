import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * BTEC Level 1 Introductory Diploma in IT, Unit A4: Researching a topic.
 * Task 2 of the "Digital Life: Staying safe online" assignment: present a
 * summary of research findings for new students and their families (B.P3
 * outline summary, B.M3 clear summary with some sources, B.D3 focused summary
 * with clear referencing). Students build it in Google Slides and download it
 * as the PowerPoint file the brief asks for.
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

/** In teaching order. Only Task 2 is covered: Task 1, the research log, is not quizzed. */
export const sections: CourseSection[] = [
  {
    title: "Task 2 · Presenting your research findings",
    sets: [planningPresentation, summarisingFindings, referencingSources, designingSlides, usingGoogleSlides],
  },
];

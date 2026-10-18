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
const planVsSlides = () =>
  figure("s1-plan-vs-slides", "A table comparing a plan with Sam's slides. Slide 1: plan Title, Sam's 'Spotting fake delivery texts'. Slide 2: plan 'What is it?', Sam's 'Where I found my facts'. Slide 3: plan 'How to spot it', Sam's 'What is a fake delivery text?'. Slide 4: plan 'What to do', Sam's 'How to spot one'. Slide 5: plan 'Key tips', Sam's 'What to do'. Slide 6: plan 'Sources', Sam's 'Key tips'.");
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
      image: brief(),
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
      image: brief(),
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
      image: planVsSlides(),
      choices: [{ text: "Sources" }, { text: "Title" }, { text: "What is it?" }],
      answer: 0,
      explanation: "A presentation ends with the sources, so anyone can check where the facts came from. The key tips come just before.",
    },
    {
      id: "slide-order",
      prompt: "Compare Sam's slides with the plan. Which of Sam's slides is in the wrong place?",
      image: planVsSlides(),
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
      prompt: "Sam's topic is strong passwords. Which row does NOT belong on the slides?",
      image: figure("s2-log-topic", "Sam's research log, topic: strong passwords. Row 1, NCSC website: use three random words to make a strong password. Row 2, a history of computers website: the first computers filled a whole room. Row 3, Action Fraud website: use a different password for your email account."),
      choices: [{ text: "Row 1" }, { text: "Row 2" }, { text: "Row 3" }],
      answer: 1,
      explanation: "Keep only what is about your agreed topic. Row 2 is true, but it is about old computers, not strong passwords.",
    },
    {
      id: "opinion",
      prompt: "Which bullet is an opinion, not a fact?",
      image: figure("s2-fact-opinion", "A slide headed 'Scam texts' with three numbered bullets. 1: You can forward a scam text to 7726 for free. 2: Scam texts are really annoying. 3: Fake delivery texts often ask for a small fee."),
      choices: [{ text: "Bullet 1" }, { text: "Bullet 2" }, { text: "Bullet 3" }],
      answer: 1,
      explanation: "A fact can be checked in a source. 'Really annoying' is how someone feels: an opinion.",
    },
    {
      id: "focused",
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
      image: referenceParts(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 4" }],
      answer: 0,
      explanation: "A reference gives who wrote it (1), the page title (2), the web address (3) and the date you looked (4).",
    },
    {
      id: "complete-reference",
      prompt: "Which reference is complete?",
      image: figure("s3-references", "A list headed Sources. 1: google.com. 2: National Cyber Security Centre, 'Phishing: spot and report scam emails, texts, websites and calls', www.ncsc.gov.uk, accessed 12 October 2026. 3: A website about scams."),
      choices: [{ text: "Reference 1" }, { text: "Reference 2" }, { text: "Reference 3" }],
      answer: 1,
      explanation: "Reference 2 has all four parts: who, title, address and date. Nobody could find or check the other two.",
    },
    {
      id: "missing-source",
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
      prompt: "This is Google Slides. Which part adds a new slide?",
      image: editor(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 0,
      explanation: "The + button adds a new slide; its little arrow lets you pick a layout. Ctrl + M does the same.",
    },
    {
      id: "move-slide",
      prompt: "Where do you drag a slide to move it to a new place?",
      image: editor(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 1,
      explanation: "The column of small slides on the left shows the order. Drag a slide up or down there to move it.",
    },
    {
      id: "notes",
      prompt: "Where do you type what you will say, so the visitors do not see it?",
      image: editor(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 2,
      explanation: "Speaker notes go in the box under the slide. They help you remember the detail and are not shown in the slideshow.",
    },
    {
      id: "slideshow",
      prompt: "Which part starts the presentation full screen?",
      image: editor(),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 3,
      explanation: "Slideshow, at the top right, shows the slides full screen. Press Esc to stop.",
    },
    {
      id: "layout",
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
  ],
};

/** In teaching order. Only Task 2 is covered: Task 1, the research log, is not quizzed. */
export const sections: CourseSection[] = [
  {
    title: "Task 2 · Presenting your research findings",
    sets: [planningPresentation, summarisingFindings, referencingSources, designingSlides, usingGoogleSlides],
  },
];

import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * BTEC Level 1 Introductory Diploma in IT, Unit A4: Researching a topic.
 * Task 2 of the "Digital Life: Staying safe online" assignment: present a
 * summary of research findings as a PowerPoint presentation, for new students
 * and their families (B.P3 outline summary, B.M3 clear summary with some
 * sources, B.D3 focused summary with clear referencing).
 *
 * Written for Level 1: short sentences, everyday words, two or three choices
 * for most questions and 30 seconds to answer. The examples come from the
 * brief's own topics, so the quiz also revisits staying safe online.
 *
 * Pictures are rendered from scripts/play-figures/l1-a4.html. None carries a
 * caption or a pass/fail label.
 */

const figure = figuresFrom("l1-a4");
const COURSE = "BTEC L1 IT · Unit A4";
const SECONDS = 30;

export const planningPresentation: QuestionSet = {
  id: "l1-a4-t2-s1-planning",
  course: COURSE,
  title: "Task 2 · Planning your presentation",
  spec: "B.P3",
  seconds: SECONDS,
  questions: [
    {
      id: "audience",
      prompt: "Who will watch your presentation?",
      choices: [{ text: "New students and their families" }, { text: "Only your tutor" }, { text: "IT experts" }],
      answer: 0,
      explanation: "The brief says the visitors are new students and their families. Write for them: plain words and tips they can use.",
    },
    {
      id: "purpose",
      prompt: "What is your presentation for?",
      choices: [
        { text: "To share what you found out about one way to stay safe online" },
        { text: "To show every website you visited" },
        { text: "To show off PowerPoint effects" },
      ],
      answer: 0,
      explanation: "Task 2 asks for a summary of your research findings on your agreed topic. Every slide should help the visitors stay safe.",
    },
    {
      id: "narrow-title",
      prompt: "Which title is narrow enough to finish in the time you have?",
      choices: [{ text: "How to spot a fake delivery text" }, { text: "Everything about the internet" }, { text: "Computers" }],
      answer: 0,
      explanation: "A narrow title is one question you can answer well. 'Everything about the internet' would never be finished.",
    },
    {
      id: "title-slide",
      prompt: "What should change on this title slide?",
      image: figure("s1-title-slide", "A title slide. The big heading says 'My PowerPoint'. Under it, smaller, is the name Sam."),
      choices: [
        { text: "Use the agreed title, like 'Spotting fake delivery texts'" },
        { text: "Take Sam's name off" },
        { text: "Add all the facts to this slide" },
      ],
      answer: 0,
      explanation: "The title slide tells the visitors what the talk is about. 'My PowerPoint' tells them nothing. Keep your name on it.",
    },
    {
      id: "slide-order",
      prompt: "Which slide is in the wrong place?",
      image: figure("s1-slide-order", "Five slides in order. 1: Spotting fake delivery texts. 2: Where I found my facts. 3: What is a fake delivery text? 4: How to spot one. 5: What to do."),
      choices: [{ text: "Slide 1" }, { text: "Slide 2" }, { text: "Slide 5" }],
      answer: 1,
      explanation: "The list of sources goes at the end. Start with the title, then the main points, then the tips.",
    },
    {
      id: "last-slide",
      prompt: "Which slide comes last?",
      choices: [{ text: "The title slide" }, { text: "Your sources" }, { text: "Your first main point" }],
      answer: 1,
      explanation: "After the summary of tips comes a Sources slide, so anyone can check where your facts came from.",
    },
    {
      id: "one-idea",
      prompt: "How many main ideas should one slide have?",
      choices: [{ text: "One" }, { text: "Five" }, { text: "As many as fit" }],
      answer: 0,
      explanation: "One idea per slide keeps each slide short, and the visitors can follow you one step at a time.",
    },
    {
      id: "plain-words",
      prompt: "Some visitors are parents. Which sentence suits them best?",
      choices: [
        { text: "A scam text pretends to be from a company you trust, to get your details." },
        { text: "Smishing uses SMS vectors for credential harvesting." },
        { text: "Scams are bad." },
      ],
      answer: 0,
      explanation: "Use everyday words and say what actually happens. Jargon loses people, and 'scams are bad' teaches them nothing.",
    },
    {
      id: "plan-first",
      prompt: "Before you open PowerPoint, what should you do first?",
      choices: [
        { text: "Plan what each slide will say, using your research log" },
        { text: "Pick the animations" },
        { text: "Choose a background picture" },
      ],
      answer: 0,
      explanation: "Plan the content first. Design and effects come later, once you know what each slide has to say.",
    },
    {
      id: "facts-from",
      prompt: "Where should the facts on your slides come from?",
      choices: [{ text: "Your research log" }, { text: "Your memory" }, { text: "A friend's slides" }],
      answer: 0,
      explanation: "Task 1's research log holds the useful information and where you found it, so Task 2 is a summary of it.",
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
      prompt: "What is a summary?",
      choices: [
        { text: "The main points, written short" },
        { text: "Everything you found, word for word" },
        { text: "Only your own opinion" },
      ],
      answer: 0,
      explanation: "A summary keeps the main points and leaves out the rest, so the visitors get the important part quickly.",
    },
    {
      id: "best-bullet",
      prompt: "Which bullet point sums up Sam's log entry best?",
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
      prompt: "Why write the summary in your own words?",
      choices: [
        { text: "It shows you understood what you read" },
        { text: "It makes the slides longer" },
        { text: "PowerPoint will not let you paste" },
      ],
      answer: 0,
      explanation: "Copying shows you can paste. Putting it in your own words shows you understood it, and it is easier for visitors to follow.",
    },
    {
      id: "relevant",
      prompt: "Your topic is strong passwords. Which finding belongs on your slides?",
      choices: [
        { text: "Use three random words to make a strong password" },
        { text: "The first computers filled a whole room" },
        { text: "Online games can have chat with strangers" },
      ],
      answer: 0,
      explanation: "Keep only what is about your agreed topic. The others may be true, but they are about something else.",
    },
    {
      id: "fact",
      prompt: "Which one is a fact you could check?",
      choices: [
        { text: "You can forward a scam text to 7726 for free" },
        { text: "Passwords are boring" },
        { text: "Everybody hates scams" },
      ],
      answer: 0,
      explanation: "A fact can be checked in a source. 'Boring' and 'everybody hates' are opinions.",
    },
    {
      id: "focused",
      prompt: "Which bullet point is the most focused summary?",
      choices: [
        { text: "Phishing is when people trick you." },
        { text: "Fake delivery texts ask for a small fee through a link: do not click it, forward the text to 7726 (Source: NCSC)." },
        { text: "There are lots of scams on the internet these days." },
      ],
      answer: 1,
      explanation: "A focused summary says exactly what happens, what to do about it, and where the fact came from.",
    },
    {
      id: "tip-today",
      prompt: "Which tip can a visitor use straight away?",
      choices: [
        { text: "Turn on two-step verification for your email" },
        { text: "Hackers are very clever" },
        { text: "Scams have been around for years" },
      ],
      answer: 0,
      explanation: "The visitors came to learn how to stay safe. A tip says what to do; the others are only about the problem.",
    },
    {
      id: "same-point",
      prompt: "Three websites say the same thing. What do you do?",
      choices: [
        { text: "Write the point once, and you can name all three sources" },
        { text: "Put it on three different slides" },
        { text: "Leave it out" },
      ],
      answer: 0,
      explanation: "Say it once. Three sources that agree make the point stronger, so naming them helps.",
    },
    {
      id: "summing-up",
      prompt: "What should the slide before your sources do?",
      choices: [
        { text: "Sum up the key tips for the visitors" },
        { text: "Start a new topic" },
        { text: "Just say 'The end'" },
      ],
      answer: 0,
      explanation: "Finish with a short list of the main tips, so the visitors leave remembering what to do.",
    },
    {
      id: "bullets",
      prompt: "Which is better on a slide?",
      choices: [
        { text: "Short bullet points" },
        { text: "Long paragraphs" },
      ],
      answer: 0,
      explanation: "Visitors read the slide while you talk. Short bullets give them the points; you say the detail.",
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
      prompt: "What is a source?",
      choices: [
        { text: "Where you found the information" },
        { text: "The font you used" },
        { text: "The number on a slide" },
      ],
      answer: 0,
      explanation: "A source is the website, leaflet, video or person your information came from.",
    },
    {
      id: "why-reference",
      prompt: "Why do you reference your sources?",
      choices: [
        { text: "So people can check where your facts came from" },
        { text: "To make the slides look longer" },
        { text: "Because PowerPoint asks for it" },
      ],
      answer: 0,
      explanation: "A reference lets anyone check a fact, and it gives credit to whoever wrote it. Clear referencing is what moves the work up to Merit and Distinction.",
    },
    {
      id: "complete-reference",
      prompt: "Which reference is complete?",
      image: figure("s3-references", "A list headed Sources. 1: google.com. 2: National Cyber Security Centre, 'Phishing: spot and report scam emails, texts, websites and calls', www.ncsc.gov.uk, accessed 12 October 2026. 3: A website about scams."),
      choices: [{ text: "Reference 1" }, { text: "Reference 2" }, { text: "Reference 3" }],
      answer: 1,
      explanation: "A complete reference gives who wrote it, the page title, the web address and the date you looked at it. The others cannot be checked.",
    },
    {
      id: "google",
      prompt: "Is Google a source?",
      choices: [
        { text: "No: it finds sources. The source is the website you read." },
        { text: "Yes: everything came from Google" },
      ],
      answer: 0,
      explanation: "A search engine only points you to websites. Reference the website the fact is on.",
    },
    {
      id: "sources-slide",
      prompt: "Where do you list all your sources?",
      choices: [{ text: "On a Sources slide at the end" }, { text: "Nowhere" }, { text: "In the file name" }],
      answer: 0,
      explanation: "The last slide lists every source you used, so the whole presentation can be checked.",
    },
    {
      id: "source-line",
      prompt: "What does the small line at the bottom of this slide do?",
      image: figure("s3-source-line", "A slide headed 'What to do with a scam text', with three bullets: do not click the link, forward the text to 7726 for free, delete it. Along the bottom, in small text: Source: National Cyber Security Centre, www.ncsc.gov.uk."),
      choices: [
        { text: "Shows where the facts on this slide came from" },
        { text: "Decorates the slide" },
        { text: "Gives the date of your talk" },
      ],
      answer: 0,
      explanation: "Naming the source on the slide links each fact to where it came from. That is clear referencing, which Distinction asks for.",
    },
    {
      id: "reliable",
      prompt: "Which source can you trust most for advice about scams?",
      choices: [
        { text: "The National Cyber Security Centre website" },
        { text: "A comment under a video" },
        { text: "A post by someone you do not know" },
      ],
      answer: 0,
      explanation: "The NCSC is the UK government's cyber security body. Anyone can write a comment or a post, true or not.",
    },
    {
      id: "accessed",
      prompt: "In a reference, what does 'accessed 12 October' mean?",
      choices: [
        { text: "The day you looked at the web page" },
        { text: "The day the website was made" },
        { text: "The day of your presentation" },
      ],
      answer: 0,
      explanation: "Web pages change. The date tells people when the page said what you used.",
    },
    {
      id: "picture-credit",
      prompt: "You used a picture from a website. What should you do?",
      choices: [
        { text: "Say where it came from, or use a picture that is free to use" },
        { text: "Nothing: pictures do not count" },
      ],
      answer: 0,
      explanation: "Pictures belong to whoever made them, just like words. Credit them, or use free-to-use pictures.",
    },
    {
      id: "quote",
      prompt: "You want to use a sentence exactly as a website wrote it. What do you do?",
      choices: [
        { text: "Put it in quotation marks and name the source" },
        { text: "Change one word so it is yours" },
        { text: "Use it and say nothing" },
      ],
      answer: 0,
      explanation: "Quotation marks show the words are not yours, and the source shows whose they are. Changing one word is still copying.",
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
      prompt: "What is a good smallest size for text on a slide?",
      choices: [{ text: "24 point" }, { text: "10 point" }, { text: "12 point" }],
      answer: 0,
      explanation: "Slides are read from across a room. 10 or 12 point suits a printed page, not a screen at the front.",
    },
    {
      id: "fonts",
      prompt: "How many fonts should your presentation use?",
      choices: [{ text: "One or two" }, { text: "A different one on every slide" }, { text: "As many as you like" }],
      answer: 0,
      explanation: "One or two fonts look tidy and are easy to read. Lots of fonts look messy.",
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
      prompt: "Why use the same design on every slide?",
      choices: [
        { text: "It looks tidy, like one presentation" },
        { text: "PowerPoint will not work without it" },
        { text: "It makes the file smaller" },
      ],
      answer: 0,
      explanation: "The same colours, fonts and layout on every slide look professional and let the visitors focus on what you say.",
    },
    {
      id: "animations",
      prompt: "Every bullet spins in with a sound. What is the problem?",
      choices: [
        { text: "It distracts people from what you are saying" },
        { text: "Nothing: it is fun" },
        { text: "It makes the text bigger" },
      ],
      answer: 0,
      explanation: "Effects should help, not distract. A simple appear, or no animation at all, keeps attention on the message.",
    },
    {
      id: "not-colour-alone",
      prompt: "Safe tips are in green, unsafe ones in red. Why add a ✓ or ✗ as well?",
      choices: [
        { text: "Some people cannot tell red from green" },
        { text: "It makes the slide busier" },
      ],
      answer: 0,
      explanation: "Some visitors are colour-blind. A tick or cross shows the meaning without needing the colour.",
    },
    {
      id: "short-bullet",
      prompt: "Which bullet point is better on a slide?",
      choices: [
        { text: "Use three random words" },
        { text: "It is usually said by most experts that, when you make a new password, it is a good idea to use three words that are random" },
      ],
      answer: 0,
      explanation: "Short bullets are quick to read. Say the longer explanation out loud, or put it in your speaker notes.",
    },
  ],
};

export const usingPowerPoint: QuestionSet = {
  id: "l1-a4-t2-s5-powerpoint",
  course: COURSE,
  title: "Task 2 · Building it in PowerPoint",
  spec: "B.P3",
  seconds: SECONDS,
  questions: [
    {
      id: "new-slide",
      prompt: "Which tab has the New Slide button?",
      choices: [{ text: "Home" }, { text: "Review" }, { text: "View" }],
      answer: 0,
      explanation: "New Slide is on the Home tab (and on Insert). Its arrow lets you pick the layout as you add the slide.",
    },
    {
      id: "layout",
      prompt: "Which layout suits a slide with a heading and bullet points?",
      choices: [
        { image: figure("s5-layout-title", "A layout with one large box in the middle and a smaller box under it.") },
        { image: figure("s5-layout-content", "A layout with a heading box across the top and one large box for bullet points below it.") },
        { image: figure("s5-layout-two", "A layout with a heading box across the top and two boxes side by side below it.") },
        { image: figure("s5-layout-blank", "An empty layout with no boxes.") },
      ],
      answer: 1,
      explanation: "Title and Content has a heading box and one box for bullet points. The first is the Title Slide layout, for the start.",
    },
    {
      id: "insert-picture",
      prompt: "How do you add a picture saved on your computer?",
      choices: [{ text: "Insert › Pictures" }, { text: "Design › Themes" }, { text: "Review › Spelling" }],
      answer: 0,
      explanation: "Insert › Pictures, then choose This Device to pick a file you have saved.",
    },
    {
      id: "themes",
      prompt: "Which tab changes the look of every slide at once?",
      choices: [{ text: "Design" }, { text: "Transitions" }, { text: "Slide Show" }],
      answer: 0,
      explanation: "A theme on the Design tab sets the colours and fonts for all the slides together.",
    },
    {
      id: "notes",
      prompt: "Where can you write what you will say, without the visitors seeing it?",
      choices: [
        { text: "In the Notes under the slide" },
        { text: "On the slide in tiny text" },
        { text: "In the slide's title" },
      ],
      answer: 0,
      explanation: "Speaker notes show on your screen, not on the projector. They keep the slides short and help you remember the detail.",
    },
    {
      id: "spelling",
      prompt: "What does the red wavy line mean?",
      image: figure("s5-spelling", "A slide headed Strong passwords with three bullets. In the second bullet, 'Never share your pasword', the word 'pasword' has a red wavy line under it."),
      choices: [
        { text: "PowerPoint thinks the word is spelt wrong" },
        { text: "The word is a link" },
        { text: "The word will move in the slide show" },
      ],
      answer: 0,
      explanation: "A red wavy line marks a spelling PowerPoint does not know. Right-click it for suggestions, or use Review › Spelling to check every slide.",
    },
    {
      id: "spell-check",
      prompt: "Which tab checks the spelling on every slide?",
      choices: [{ text: "Review" }, { text: "Insert" }, { text: "Design" }],
      answer: 0,
      explanation: "Review › Spelling goes through the whole presentation. Check before you hand in: mistakes make the facts look less trustworthy.",
    },
    {
      id: "start-show",
      prompt: "Which key starts the slide show from the first slide?",
      choices: [{ text: "F5" }, { text: "F1" }, { text: "Esc" }],
      answer: 0,
      explanation: "F5 starts from the beginning. Esc ends the show, and F1 opens help.",
    },
    {
      id: "move-slide",
      prompt: "How do you move a slide to a new place?",
      choices: [
        { text: "Drag it in the list of slides on the left" },
        { text: "Delete it and type it again" },
        { text: "Make it smaller" },
      ],
      answer: 0,
      explanation: "Drag the slide in the thumbnails on the left, or use View › Slide Sorter to see them all at once.",
    },
    {
      id: "file-name",
      prompt: "Which file name is best for your presentation?",
      choices: [
        { text: "A4 Task 2 - Fake delivery texts - Sam.pptx" },
        { text: "Presentation1.pptx" },
        { text: "asdfgh.pptx" },
      ],
      answer: 0,
      explanation: "A clear name says what the file is and whose it is, so you and your tutor can find it.",
    },
  ],
};

/** In teaching order. Only Task 2 is covered: Task 1, the research log, is not quizzed. */
export const sections: CourseSection[] = [
  {
    title: "Task 2 · Presenting your research findings",
    sets: [planningPresentation, summarisingFindings, referencingSources, designingSlides, usingPowerPoint],
  },
];

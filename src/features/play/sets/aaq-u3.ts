import type { QuestionSet, QuizImage } from "../types";
import sizes from "./figure-sizes.json";

/**
 * BTEC AAQ IT (Extended Certificate), Unit 3: Website Development.
 * Each set checks one topic as the unit's decks teach it (academic-materials,
 * modules/l3-aaq-u3-website-development), for use as a Do Now retrieval the
 * session after, or as the exit ticket.
 *
 * Pictures are rendered from scripts/play-figures/aaq-u3.html. None carries a
 * caption or a pass/fail label: the picture is the evidence, not the answer.
 */

function figure(name: string, alt: string): QuizImage {
  const key = `aaq-u3/${name}`;
  const size = (sizes as Record<string, number[]>)[key];
  if (!size) throw new Error(`No rendered figure "${key}". Run node scripts/render-play-figures.mjs.`);
  return { src: `/play/${key}.png`, alt, width: size[0], height: size[1] };
}

const COURSE = "BTEC AAQ IT · Unit 3";

export const pageLayout: QuestionSet = {
  id: "aaq-u3-t02-page-layout",
  course: COURSE,
  title: "Topic 2 · Page layout",
  spec: "A1",
  questions: [
    {
      id: "news-scan",
      prompt: "A news site's home page is mostly text. Which scan pattern will most visitors follow?",
      choices: [{ text: "F-shaped" }, { text: "Z-shaped" }, { text: "Grid" }, { text: "Bottom to top" }],
      answer: 0,
      explanation: "Text-heavy pages are scanned in an F: a wide sweep across the top, a shorter one lower down, then down the left edge. People scan; they do not read.",
    },
    {
      id: "least-seen",
      prompt: "On this text-heavy page, which part will most visitors look at least?",
      image: figure("t02-text-page", "A law firm's page: a heading, three paragraphs of text, and a 'Get in touch' box floated on the right."),
      choices: [
        { text: "The heading" },
        { text: "The first line of the first paragraph" },
        { text: "The first words of each line, down the left" },
        { text: "The 'Get in touch' box on the right" },
      ],
      answer: 3,
      explanation: "The F covers the top and runs down the left edge. The right-hand box sits off the path, so it is the least-seen part of the page.",
    },
    {
      id: "mugs-layout",
      prompt: "A shop wants to show twelve mugs so visitors can compare them. Which layout fits best?",
      choices: [
        { image: figure("t02-layout-single", "A single column: one wide picture band and lines of text beneath it.") },
        { image: figure("t02-layout-sidebar", "Main content with a narrow sidebar on the right.") },
        { image: figure("t02-layout-grid", "A grid of six equal cards, three to a row, each with a picture and two lines of text.") },
      ],
      answer: 2,
      explanation: "A card grid suits many things of the same kind. Each card holds one mug's details, rows read left to right, and the grid re-flows to one column on a phone.",
    },
    {
      id: "z-action",
      prompt: "This landing page follows a Z pattern. Where should the 'Book a place' button go?",
      choices: [
        { image: figure("t02-z-top-left", "Landing page with the 'Book a place' button just under the logo, top left.") },
        { image: figure("t02-z-middle", "Landing page with the button in the middle, below the text.") },
        { image: figure("t02-z-bottom-left", "Landing page with the button at the bottom left.") },
        { image: figure("t02-z-bottom-right", "Landing page with the button at the bottom right.") },
      ],
      answer: 3,
      explanation: "The eye runs top-left → top-right → diagonally down → bottom-right. The Z ends at the bottom right, so the action goes there, on the path the eye already takes.",
    },
    {
      id: "grouping",
      prompt: "Each class's name, time, price and button sit inside one box. Which layout technique is this?",
      image: figure("t02-class-cards", "Three class cards side by side. Each bordered card holds a class name, a day and time, a price, and a Book button."),
      choices: [
        { text: "Grouping elements" },
        { text: "Visual hierarchy" },
        { text: "Separating content" },
        { text: "Unconventional layout" },
      ],
      answer: 0,
      explanation: "Items close together, or inside one box, are read as belonging together. A visitor compares classes card by card and never has to match a price to the wrong class.",
    },
    {
      id: "hierarchy",
      prompt: "Which version has the clearest visual hierarchy?",
      choices: [
        { image: figure("t02-hierarchy-flat", "Heading, description, price and an underlined link all in the same small grey text.") },
        { image: figure("t02-hierarchy-clear", "A large dark heading, smaller description text, and one bold 'Book a place' button.") },
        { image: figure("t02-hierarchy-shout", "Heading in red capitals, price in large blue capitals, and four buttons of equal weight.") },
      ],
      answer: 1,
      explanation: "Hierarchy uses size, weight, colour and position to show what matters most, in order: one large headline, one bold button, smaller body text. When everything is the same, or everything shouts, nothing leads.",
    },
    {
      id: "separation",
      prompt: "A pale band behind the 'Upcoming classes' section shows where it starts and ends. Which technique is this?",
      choices: [
        { text: "Separating content" },
        { text: "Grouping elements" },
        { text: "Visual hierarchy" },
        { text: "Z-shaped pattern" },
      ],
      answer: 0,
      explanation: "Whitespace, dividers and background bands separate content: they mark where one topic ends and the next begins.",
    },
    {
      id: "unconventional",
      prompt: "Which website could suit an unconventional layout best?",
      choices: [
        { text: "A council's bin-collection page" },
        { text: "An online shop's checkout" },
        { text: "An art exhibition's campaign site" },
        { text: "A bank's login page" },
      ],
      answer: 2,
      explanation: "Break the pattern when the experience is the purpose and visitors expect to explore. Visitors doing a task quickly need a conventional layout.",
    },
  ],
};

export const userExperience: QuestionSet = {
  id: "aaq-u3-t04-user-experience",
  course: COURSE,
  title: "Topic 4 · User experience",
  spec: "A1",
  questions: [
    {
      id: "contrast-button",
      prompt: "Which button's label meets the WCAG 2.2 AA contrast ratio for normal text?",
      choices: [
        { image: figure("t04-button-pale", "White label on a pale blue button.") },
        { image: figure("t04-button-dark", "White label on a dark blue button.") },
        { image: figure("t04-button-ghost", "Off-white label on a very pale grey-blue button.") },
        { image: figure("t04-button-mid", "White label on a mid blue button.") },
      ],
      answer: 1,
      explanation: "Normal-size text needs at least 4.5:1. B measures 7.0:1. A is 2.2:1, C is 1.4:1, and D, at 3.9:1, looks fine to many people but still fails.",
    },
    {
      id: "contrast-minimum",
      prompt: "What contrast ratio does WCAG 2.2 AA ask for body text?",
      choices: [{ text: "2:1" }, { text: "3:1" }, { text: "4.5:1" }, { text: "7:1" }],
      answer: 2,
      explanation: "4.5:1 for body text. Large text needs 3:1. Measure it with a contrast checker rather than judging by eye.",
    },
    {
      id: "focus",
      prompt: "Both visitors pressed Tab three times. On which page can a keyboard user see where they are?",
      choices: [
        { image: figure("t04-focus-none", "Site menu after three Tab presses. No link looks any different.") },
        { image: figure("t04-focus-visible", "Site menu after three Tab presses. The 'Book' link has a thick orange outline.") },
      ],
      answer: 1,
      explanation: "The focus outline is the keyboard user's cursor. Both pages have focus on 'Book'; only B shows it. 'outline: none' leaves the user navigating blind.",
    },
    {
      id: "colour-only",
      prompt: "A form shows an error only by turning the field's border red. Which accessibility feature does this break?",
      choices: [
        { text: "Captions and transcripts" },
        { text: "Breadcrumbs" },
        { text: "Colour combinations" },
        { text: "Customisable features" },
      ],
      answer: 2,
      explanation: "Red and green look alike to many colour-blind people. Never use colour as the only signal: add text or an icon.",
    },
    {
      id: "keyboard-check",
      prompt: "How do you check a site for keyboard-only navigation?",
      choices: [
        { text: "Zoom the page to 200 %" },
        { text: "Turn the sound off" },
        { text: "Measure the text colours" },
        { text: "Put the mouse away and complete a task" },
      ],
      answer: 3,
      explanation: "Every link, button and field must be reachable with Tab and usable with Enter, with visible focus. The only real test is to do a task without the mouse.",
    },
    {
      id: "captions",
      prompt: "A video on the site has no captions. Which WCAG principle does it fail?",
      choices: [{ text: "Perceivable" }, { text: "Operable" }, { text: "Understandable" }, { text: "Robust" }],
      answer: 0,
      explanation: "A visitor who cannot hear the sound cannot perceive what is said. Captions make the audio perceivable as text.",
    },
    {
      id: "branding",
      prompt: "The home page and contact page of one site. Which kind of consistency is broken?",
      image: figure("t04-two-pages", "Two pages of one site. The home page header is blue and reads 'Riverside Studio'; the contact page header is purple and reads 'The Riverside Pottery Studio'. Menus, layout and buttons match."),
      choices: [{ text: "Branding" }, { text: "Page layout" }, { text: "UI elements" }, { text: "Design" }],
      answer: 0,
      explanation: "Branding means the same logo, name and colours on every page. Here the name and colour change, so a visitor may think they have left the site.",
    },
    {
      id: "intuitive",
      prompt: "'It works the way visitors expect, with no instructions.' Which user-friendly quality is this?",
      choices: [{ text: "Simple" }, { text: "Intuitive" }, { text: "Engaging" }, { text: "Responsive" }],
      answer: 1,
      explanation: "Intuitive means no explaining is needed. Test it by watching someone else use the site: if you have to explain, it is not intuitive.",
    },
  ],
};

export const htmlStructure: QuestionSet = {
  id: "aaq-u3-t12-html-structure",
  course: COURSE,
  title: "Topic 12 · HTML structure and navigation",
  spec: "C1",
  questions: [
    {
      id: "index",
      prompt: "What must the home page file be called so a web server shows it by default?",
      choices: [{ text: "home.html" }, { text: "main.html" }, { text: "index.html" }, { text: "start.html" }],
      answer: 2,
      explanation: "A server looks for index.html when a visitor asks for a folder, so the home page must use that name.",
    },
    {
      id: "main-region",
      prompt: "Which numbered region belongs inside <main>?",
      image: figure("t12-regions", "A page with three outlined regions: 1 is the header with the site name and menu, 2 is the page's heading and text, 3 is the footer with address and phone."),
      choices: [{ text: "Region 1" }, { text: "Region 2" }, { text: "Region 3" }, { text: "None of them" }],
      answer: 1,
      explanation: "<main> holds the content unique to this page, and a page has exactly one. Region 1 is the <header> and region 3 the <footer>; both repeat on every page.",
    },
    {
      id: "semantic",
      prompt: "Two pages look identical in the browser. Which markup lets a screen reader announce 'Banner. Navigation, 3 links'?",
      choices: [
        { text: '<div class="bar"> … <div class="menu"> … <div class="title">' },
        { text: "<header> … <nav> … <h1>" },
      ],
      answer: 1,
      explanation: "Semantic elements tell assistive technology what each part is, so a user can jump to the navigation or the content. Divs say only 'group'. Looking at a page says nothing about its markup.",
    },
    {
      id: "nav",
      prompt: "Which element should wrap the site's menu of links?",
      choices: [{ text: "<main>" }, { text: "<section>" }, { text: "<footer>" }, { text: "<nav>" }],
      answer: 3,
      explanation: "A menu is a list of links inside <nav>, which sits in the <header>. Screen readers announce it as navigation and let the user jump to it.",
    },
    {
      id: "up-a-folder",
      prompt: "You are editing classes/wheel-throwing.html. Which link reaches index.html, one folder up?",
      choices: [{ text: "index.html" }, { text: "../index.html" }, { text: "classes/index.html" }, { text: "./index.html" }],
      answer: 1,
      explanation: "../ means 'up one folder'. index.html and ./index.html both look inside classes/, where there is no home page.",
    },
    {
      id: "anchor",
      prompt: 'Which href jumps to <h2 id="prices"> on the same page?',
      choices: [{ text: "#prices" }, { text: "prices.html" }, { text: ".prices" }, { text: "id=prices" }],
      answer: 0,
      explanation: "# followed by an id jumps to that element. To reach it from another page, put the file first: classes.html#prices.",
    },
    {
      id: "aria-current",
      prompt: 'What does aria-current="page" on a menu link tell a screen reader?',
      choices: [
        { text: "This link opens in a new tab" },
        { text: "This link has been visited" },
        { text: "This link is the page you are on" },
        { text: "This page is still loading" },
      ],
      answer: 2,
      explanation: "A sighted visitor sees the current page highlighted in the menu; aria-current gives a screen-reader user the same information.",
    },
    {
      id: "skip-link",
      prompt: "Where does a skip link take a keyboard user?",
      choices: [
        { text: "To the footer" },
        { text: "Straight to the main content" },
        { text: "Back to the home page" },
        { text: "To the next website" },
      ],
      answer: 1,
      explanation: "The skip link appears on the first Tab and jumps to <main id=\"main\">, so a keyboard user does not have to tab through the whole menu on every page.",
    },
  ],
};

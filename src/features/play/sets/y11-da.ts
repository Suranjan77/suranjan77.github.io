import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * Year 11 taster day: data analytics. Two quizzes for one visit: one to open
 * the session and one to close it. The aim is to show Year 11s that data
 * analysis is about things they already care about (music, games, football,
 * pizza) and that it is something they could do next.
 *
 * The opening quiz is also the icebreaker. It assumes nothing has been taught
 * yet, so it is quick and mostly guessable, every explanation teaches one
 * idea, and nothing is asked twice: there is nothing to retrieve yet. The
 * closing quiz asks about the same ideas with new examples (averages, the
 * right chart, misleading axes, correlation, cleaning data, a spreadsheet
 * formula, privacy, next steps), so the room can see how far it has come, and
 * asks the ones that take working out twice.
 *
 * Pictures are rendered from scripts/play-figures/y11-da.html. All their data
 * is invented, except the map, a simplified retelling of John Snow's 1854 map.
 */

const figure = figuresFrom("y11-da");
const COURSE = "Year 11 taster · Data analytics";
const SECONDS = 20;

export const tasterStart: QuestionSet = {
  id: "y11-da-start",
  course: COURSE,
  title: "Start · Data is everywhere",
  spec: "Taster day",
  seconds: SECONDS,
  questions: [
    {
      id: "what-is-data",
      prompt: "Which of these is data?",
      choices: [{ text: "All of them" }, { text: "Your step count today" }, { text: "Last night's football scores" }, { text: "How long each song on your playlist is" }],
      answer: 0,
      explanation: "Data is any fact that is recorded: numbers, words, times, places, clicks. You make thousands of pieces of it every day without noticing.",
    },
    {
      id: "wrapped",
      prompt: "Your music app tells you your top artist of the year. How does it know?",
      choices: [{ text: "It records every song you play" }, { text: "You filled in a survey" }, { text: "It copies your friends' playlists" }, { text: "It guesses" }],
      answer: 0,
      explanation: "Every play is saved: the song, the time, how long you listened. Counting those records up for millions of listeners at once is data analysis.",
    },
    {
      id: "minutes-to-hours",
      prompt: "How many hours of music is this?",
      image: figure("s-wrapped", "A music app's end-of-year card: Your year in music, 41,280 minutes listened. Top genre: Pop. Top song: played 312 times. Busiest day: Saturday."),
      choices: [{ text: "About 690 hours" }, { text: "About 69 hours" }, { text: "About 6,900 hours" }, { text: "About 4,100 hours" }],
      answer: 0,
      explanation: "There are 60 minutes in an hour, so 41,280 ÷ 60 = 688 hours. That is almost 29 whole days of non-stop music.",
    },
    {
      id: "loyalty-card",
      prompt: "Why do supermarkets give out loyalty cards with money-off deals?",
      choices: [
        { text: "To learn what people buy, and when" },
        { text: "Because the law says they must" },
        { text: "To check customers' ages" },
        { text: "To time how fast you walk round" },
      ],
      answer: 0,
      explanation: "Each swipe records what was bought, where and when. Analysts use it to decide what to stock, which offers to send and where to put things on the shelves.",
    },
    {
      id: "canteen-pizza",
      prompt: "The canteen keeps running out of pizza. On which day should it make more?",
      image: figure("s-canteen", "A bar chart titled 'Pizza slices sold in the canteen'. Monday 42, Tuesday 38, Wednesday 55, Thursday 47, Friday 96."),
      choices: [{ text: "Friday" }, { text: "Wednesday" }, { text: "Monday" }, { text: "Thursday" }],
      answer: 0,
      explanation: "Friday sells 96 slices, about twice as many as any other day. Reading a chart to make a decision is the most everyday thing an analyst does.",
    },
    {
      id: "ice-cream-season",
      prompt: "When should this kiosk take on extra staff?",
      image: figure("s-ice-cream-year", "A line chart titled 'Ice creams sold at a seaside kiosk', January to December. Sales are low, about 120 to 150, in winter, rise from March, peak at about 1,480 in July and 1,420 in August, and fall back by November."),
      choices: [{ text: "June to August" }, { text: "December to February" }, { text: "March and April" }, { text: "The same all year" }],
      answer: 0,
      explanation: "The line peaks in the summer months. Spotting a pattern that repeats every year, a seasonal trend, lets a business plan ahead.",
    },
    {
      id: "biggest-unit",
      prompt: "Which holds the most data?",
      choices: [{ text: "1 terabyte" }, { text: "1 gigabyte" }, { text: "1 megabyte" }, { text: "1 kilobyte" }],
      answer: 0,
      explanation: "Each step up is about a thousand times bigger: kilo, mega, giga, tera. A terabyte holds about 1,000 gigabytes: hundreds of thousands of phone photos.",
    },
    {
      id: "chance-of-rain",
      prompt: "The forecast says 70% chance of rain on Saturday. What does that mean?",
      choices: [
        { text: "Rain is likely, but not certain" },
        { text: "It will rain for 70% of the day" },
        { text: "70% of the town will get wet" },
        { text: "It will definitely rain" },
      ],
      answer: 0,
      explanation: "Forecasts are built from millions of readings run through computer models. 70% means that in ten days like this one, expect rain on about seven.",
    },
    {
      id: "xg",
      prompt: "Football pundits talk about xG, expected goals. What is it?",
      choices: [
        { text: "How likely a shot was to score, based on thousands of past shots" },
        { text: "The goals a player is paid to score" },
        { text: "Goals scored in extra time" },
        { text: "How fast a player runs with the ball" },
      ],
      answer: 0,
      explanation: "A shot with an xG of 0.1 goes in about 1 time in 10. Clubs employ data analysts to find players who make good chances, not just lucky ones.",
    },
    {
      id: "game-balance",
      prompt: "Most players pick the same character. What are the game's makers most likely to do?",
      image: figure("s-game-picks", "A bar chart titled 'Characters picked in the first week of a new game'. Blaze 64%, Frost 14%, Echo 12%, Volt 10%."),
      choices: [
        { text: "Check whether Blaze is too powerful" },
        { text: "Delete the other three characters" },
        { text: "Put the price of the game up" },
        { text: "Nothing: the data can't help" },
      ],
      answer: 0,
      explanation: "Game studios watch play data closely. When one choice wins this often, it is usually too strong, so an update balances it: the famous 'nerf'.",
    },
    {
      id: "prom-axis",
      prompt: "Its bar is twice as tall. Did 'Under the sea' get twice as many votes?",
      image: figure("s-prom-vote", "A bar chart titled 'Prom theme vote'. The vertical axis starts at 500, not 0, and goes up to 540. Hollywood has 520 votes and Under the sea has 540 votes, so its bar looks twice as tall."),
      choices: [
        { text: "No: only 20 more, because the axis starts at 500" },
        { text: "Yes: its bar is twice the height" },
        { text: "Yes: it got 1,040 votes" },
      ],
      answer: 0,
      explanation: "The scale starts at 500, so a small gap looks huge. It is a favourite trick in adverts and headlines: always check where the axis starts.",
    },
    {
      id: "outlier",
      prompt: "One of these step counts is almost certainly an error. Which day?",
      image: figure("s-steps", "A sheet of steps walked each day. Monday 8,214; Tuesday 9,030; Wednesday 7,655; Thursday 284,100; Friday 10,442; Saturday 12,906; Sunday 6,980."),
      choices: [{ text: "Thursday" }, { text: "Saturday" }, { text: "Sunday" }, { text: "Friday" }],
      answer: 0,
      explanation: "284,100 steps is over 200 km of walking in a day. A value far away from the rest is an outlier: check it before you use it, or it will wreck your average.",
    },
    {
      id: "messy-data",
      prompt: "Why does this survey need tidying before a computer counts it?",
      image: figure("s-sport-survey", "A survey sheet of favourite sports. Student 1: Football. 2: football. 3: Netball. 4: FOOTBALL. 5: Footy. 6: Basketball."),
      choices: [
        { text: "The same answer is written in different ways" },
        { text: "There are too few students" },
        { text: "Sports can't be counted" },
        { text: "Basketball is spelt wrongly" },
      ],
      answer: 0,
      explanation: "To a computer, 'Football', 'FOOTBALL' and 'Footy' can be three different answers. Cleaning data, making the same thing look the same, is a big part of an analyst's day.",
    },
    {
      id: "ice-cream-sunburn",
      prompt: "These two lines rise and fall together. Does eating ice cream cause sunburn?",
      image: figure("s-ice-cream-sunburn", "Two line charts, January to December, one above the other. Ice creams sold, in hundreds, and sunburn cases at the town's clinic both stay low in winter, rise through spring, peak in July and fall back by November."),
      choices: [
        { text: "No: hot, sunny weather causes both" },
        { text: "Yes: the lines match" },
        { text: "Yes, but only in summer" },
      ],
      answer: 0,
      explanation: "Two things rising together is a correlation, not proof that one causes the other. Here a third thing, sunshine, drives both. Spotting that is a superpower.",
    },
    {
      id: "nightingale",
      prompt: "Florence Nightingale was a nurse and a data pioneer. In 1858 her charts showed that most soldiers in the Crimean War died from…",
      choices: [{ text: "Diseases that could be prevented" }, { text: "Battle wounds" }, { text: "The cold" }, { text: "Old age" }],
      answer: 0,
      explanation: "Her diagrams showed far more soldiers dying of preventable disease than of wounds. They persuaded the government to clean up army hospitals: a chart that saved lives.",
    },
    {
      id: "john-snow",
      prompt: "London, 1854: cholera is killing hundreds. John Snow marks every death on a map. Which water pump is to blame?",
      image: figure("s-snow-map", "A simplified street map of Soho with four numbered water pumps and a short black bar for each death. The bars are packed along the streets around pump 2, on Broad Street, and become rare further away. Pumps 1, 3 and 4 have few deaths near them."),
      choices: [{ text: "Pump 2" }, { text: "Pump 1" }, { text: "Pump 3" }, { text: "Pump 4" }],
      answer: 0,
      explanation: "The deaths cluster round the Broad Street pump. Snow persuaded the local officials to take its handle off, and his map helped prove that cholera spreads through dirty water.",
    },
    {
      id: "moneyball",
      prompt: "In 2002 a baseball team with little money, the Oakland A's, picked players using statistics instead of hunches. What happened?",
      choices: [
        { text: "They won 20 games in a row, and it became a film" },
        { text: "They were thrown out of the league" },
        { text: "They lost every game" },
        { text: "They ran out of players" },
      ],
      answer: 0,
      explanation: "They found good players that richer teams overlooked, won a record-breaking 20 games in a row, and inspired the film Moneyball. Now every top sports team has analysts.",
    },
    {
      id: "screen-time-mean",
      prompt: "Five friends' screen time yesterday: 2, 3, 3, 4 and 8 hours. What is the mean?",
      seconds: 30,
      choices: [{ text: "4 hours" }, { text: "3 hours" }, { text: "5 hours" }, { text: "8 hours" }],
      answer: 0,
      explanation: "Add them up, 20 hours, and divide by how many there are, 5: a mean of 4. The middle value, the median, is 3: the one big 8 pulls the mean up.",
    },
    {
      id: "biased-sample",
      prompt: "To find the school's favourite sport, Ava asks only the football team. What is wrong?",
      choices: [
        { text: "Her sample is unfair: it is bound to say football" },
        { text: "She asked too many people" },
        { text: "You can't survey people about sport" },
        { text: "Nothing: it is fine" },
      ],
      answer: 0,
      explanation: "Who you ask changes the answer. A fair sample is a mix of the people you want to know about, chosen without picking the ones who agree with you.",
    },
    {
      id: "personal-data",
      prompt: "Which of these is personal data that the law protects?",
      choices: [
        { text: "Your name and home address" },
        { text: "The average height of 16-year-olds" },
        { text: "Today's temperature in Leeds" },
        { text: "The score in a match" },
      ],
      answer: 0,
      explanation: "Data that can identify a person must be kept safe and used fairly, under UK data protection law. Analysts often remove names before they start.",
    },
    {
      id: "recommendations",
      prompt: "A streaming app suggests a series and you love it. How did it guess?",
      choices: [
        { text: "It matched you with viewers who watch what you watch" },
        { text: "Someone at the company checked your account" },
        { text: "It picked one at random" },
        { text: "It read your messages" },
      ],
      answer: 0,
      explanation: "Recommendation systems look for people whose viewing looks like yours, then suggest what they enjoyed next. Data in, prediction out.",
    },
    {
      id: "keepy-ups",
      prompt: "Mia practises 6 hours a week. Going by this chart, about how many keepy-ups could she do?",
      image: figure("s-keepy-ups", "A scatter chart titled 'Practice and keepy-ups: ten players'. The horizontal axis is hours of practice a week, 0 to 7, and the vertical axis is best keepy-ups, 0 to 80. The points rise steadily, from 9 keepy-ups at 1 hour to 55 at 5 and a half hours. There are no players at 6 hours."),
      choices: [{ text: "About 60" }, { text: "About 10" }, { text: "About 200" }, { text: "About 30" }],
      answer: 0,
      explanation: "The points climb by about 10 keepy-ups for every extra hour, so 6 hours gives about 60. Following a trend to predict what comes next is how forecasts work.",
    },
    {
      id: "who-hires",
      prompt: "Which of these hire data analysts?",
      choices: [{ text: "All of them" }, { text: "NHS hospitals" }, { text: "Premier League clubs" }, { text: "Video game studios" }],
      answer: 0,
      explanation: "Anywhere that collects data needs people to make sense of it: health, sport, games, music, fashion, banks, charities, the police. Data skills travel with you.",
    },
    {
      id: "analyst-job",
      prompt: "So what does a data analyst actually do?",
      choices: [
        { text: "Turns data into answers that help people decide" },
        { text: "Fixes broken laptops" },
        { text: "Types numbers in all day" },
        { text: "Builds robots" },
      ],
      answer: 0,
      explanation: "Ask a question, collect the data, clean it, analyse it, show it in a chart and tell the story. That is exactly what you are about to try.",
    },
  ],
};

export const tasterEnd: QuestionSet = {
  id: "y11-da-end",
  course: COURSE,
  title: "End · Think like a data analyst",
  spec: "Taster day",
  seconds: SECONDS,
  questions: [
    {
      id: "first-step",
      prompt: "What does an analyst do first?",
      choices: [{ text: "Ask a clear question" }, { text: "Draw the chart" }, { text: "Clean the data" }, { text: "Share the results" }],
      answer: 0,
      explanation: "Without a clear question you don't know what data to collect or what to look for. Question, collect, clean, analyse, show, tell: in that order.",
    },
    {
      id: "qualitative",
      prompt: "Which of these is qualitative data: described in words, not measured?",
      choices: [{ text: "Favourite film genre" }, { text: "Height in cm" }, { text: "Goals scored" }, { text: "Minutes on the bus" }],
      answer: 0,
      explanation: "Qualitative data is categories or descriptions. Quantitative data is numbers you count or measure, which you can add up and average.",
    },
    {
      id: "mean-or-median",
      askTwice: true,
      seconds: 30,
      prompt: "Five friends' weekly pocket money: £5, £6, £6, £7 and £51. Which average best shows what is typical?",
      choices: [{ text: "The median, £6" }, { text: "The mean, £15" }, { text: "The biggest, £51" }],
      answer: 0,
      explanation: "The mean is £75 ÷ 5 = £15, more than four of the five get. One big value drags the mean; the median, the middle value, isn't fooled by it.",
    },
    {
      id: "mode",
      seconds: 30,
      prompt: "Shoe sizes in a group: 5, 6, 6, 7, 6, 8, 9. What is the mode?",
      choices: [{ text: "6" }, { text: "7" }, { text: "9" }, { text: "5" }],
      answer: 0,
      explanation: "The mode is the value that comes up most often: size 6, three times. A shoe shop would stock most of that size.",
    },
    {
      id: "chart-for-time",
      prompt: "Which chart best shows how a channel's subscribers grew over the year?",
      choices: [
        { image: figure("e-choice-line", "A line chart titled 'Subscribers', January to December, rising steadily from about 1,200 to 10,000.") },
        { image: figure("e-choice-pie", "A pie chart titled 'Subscribers' with twelve slices of different sizes, one for each month, January to December.") },
      ],
      answer: 0,
      explanation: "Change over time is a line chart's job: your eye follows it left to right. A pie shows parts of one whole, and twelve slices are almost impossible to compare.",
    },
    {
      id: "axis-drop",
      askTwice: true,
      prompt: "The line plunges. Has the channel lost most of its subscribers?",
      image: figure("e-axis-drop", "A line chart titled 'Subscribers this week'. The vertical axis runs only from about 97,800 to 100,000. The line falls steeply from 100,000 on Monday to 98,000 on Friday."),
      choices: [
        { text: "No: it lost 2,000 of 100,000, just 2%" },
        { text: "Yes: it lost nearly all of them" },
        { text: "Yes: it lost half" },
      ],
      answer: 0,
      explanation: "The axis starts near 98,000, not 0, so a small dip looks like a crash. Read the numbers on the axis before you believe the shape.",
    },
    {
      id: "small-sample",
      prompt: "An advert says '80% of people prefer FizzUp!' The small print says: 'Survey of 5 people'. Why not trust it?",
      choices: [
        { text: "5 people is far too few" },
        { text: "80% is too high to be real" },
        { text: "Adverts can't use percentages" },
        { text: "It should say 4 out of 5" },
      ],
      answer: 0,
      explanation: "80% of 5 is just 4 people. With so few, a different 5 could give a completely different answer. Bigger, fairer samples give results you can trust.",
    },
    {
      id: "fire-engines",
      prompt: "The more fire engines sent to a fire, the more damage is done. Should we send fewer fire engines?",
      choices: [
        { text: "No: big fires cause more damage and need more engines" },
        { text: "Yes: the fire engines cause the damage" },
        { text: "Yes: one engine is always enough" },
      ],
      answer: 0,
      explanation: "Correlation again: a third thing, the size of the fire, causes both. Before saying A causes B, always ask what else could be behind them.",
    },
    {
      id: "duplicates",
      prompt: "Before adding up the seats sold, what needs cleaning?",
      image: figure("e-duplicates", "A sheet of ticket sales with columns Ticket, Show, Seats. 1041 Friday 2; 1042 Friday 4; 1043 Saturday 3; 1043 Saturday 3; 1044 Saturday 1; 1045 Sunday 2."),
      choices: [
        { text: "Ticket 1043 is in twice" },
        { text: "The shows should be in A to Z order" },
        { text: "The seats should be words" },
        { text: "Sunday has too few tickets" },
      ],
      answer: 0,
      explanation: "A duplicate row counts the same sale twice, so the total would be 3 seats too high. Removing duplicates is one of the first cleaning checks.",
    },
    {
      id: "average-formula",
      askTwice: true,
      seconds: 30,
      prompt: "What will this formula show in B6?",
      image: figure("e-average-sheet", "A spreadsheet with Match in column A and Goals in column B. Week 1: 4, Week 2: 6, Week 3: 8, Week 4: 10. Cell B6, next to 'Average', is selected, and the formula bar shows =AVERAGE(B2:B5)."),
      choices: [{ text: "7" }, { text: "28" }, { text: "10" }, { text: "4" }],
      answer: 0,
      explanation: "B2:B5 means the cells from B2 to B5. AVERAGE adds them, 4 + 6 + 8 + 10 = 28, and divides by 4. SUM would give the 28.",
    },
    {
      id: "filter",
      prompt: "A spreadsheet lists every student in the school. You only want to see Year 11. Which tool?",
      choices: [{ text: "Filter" }, { text: "Bold" }, { text: "Merge cells" }, { text: "Sort A to Z" }],
      answer: 0,
      explanation: "A filter hides the rows you don't need without deleting them. Sorting only changes the order: every year group would still be there.",
    },
    {
      id: "pie-bus",
      askTwice: true,
      seconds: 30,
      prompt: "How many of these 120 students come by bus?",
      image: figure("e-pie-travel", "A pie chart titled 'How 120 students get to school'. Walk 50%, Bus 25%, Car 15%, Bike 10%."),
      choices: [{ text: "30" }, { text: "25" }, { text: "60" }, { text: "45" }],
      answer: 0,
      explanation: "25% is a quarter, and a quarter of 120 is 30. Turning percentages back into real numbers tells you, for example, how many bus passes to plan for.",
    },
    {
      id: "battery",
      prompt: "If the battery keeps falling at the same rate, when will it reach 0%?",
      image: figure("e-battery", "A line chart titled 'Phone battery'. The horizontal axis runs from 8am to 6pm and the vertical axis from 0% to 100%. The battery is 100% at 8am, 85% at 9, 70% at 10 and 55% at 11. The rest of the day is empty."),
      choices: [{ text: "Between 2pm and 3pm" }, { text: "Around noon" }, { text: "Around 6pm" }, { text: "Around 9am tomorrow" }],
      answer: 0,
      explanation: "It drops 15% an hour. The 55% left at 11am lasts about 3 hours 40 minutes more: 0% at about 2:40pm. Extending a trend is how analysts forecast.",
    },
    {
      id: "headline",
      prompt: "Which headline does this chart support?",
      image: figure("e-sleep", "A bar chart titled 'Average sleep on a school night'. Year 7: 9.1 hours, Year 9: 8.3 hours, Year 11: 7.4 hours."),
      choices: [
        { text: "Older students sleep less on school nights" },
        { text: "Year 11 sleep the most" },
        { text: "Sleeping less makes you older" },
        { text: "Everyone sleeps exactly 8 hours" },
      ],
      answer: 0,
      explanation: "Each year group sleeps less than the one before. A good headline says what the data shows and no more: it does not claim a cause it cannot prove.",
    },
    {
      id: "remove-names",
      prompt: "Before sharing your survey results, what should you do with people's names?",
      choices: [{ text: "Take them out" }, { text: "Put them in bold" }, { text: "Sort them A to Z" }, { text: "Post them online" }],
      answer: 0,
      explanation: "Removing names, anonymising, means no one can be picked out. Analysts are trusted with people's data, and keeping it safe is part of the job.",
    },
    {
      id: "next-step",
      prompt: "You enjoyed today. Which of these could lead to a job in data after Year 11?",
      choices: [
        { text: "All of them" },
        { text: "A levels such as maths or computing" },
        { text: "A college course in IT or data" },
        { text: "A data apprenticeship" },
      ],
      answer: 0,
      explanation: "There is more than one way in: college courses, A levels and apprenticeships all lead to data jobs, and to university if you want it. Today was your first step.",
    },
  ],
};

export const sections: CourseSection[] = [
  { title: "Start of the session", sets: [tasterStart] },
  { title: "End of the session", sets: [tasterEnd] },
];

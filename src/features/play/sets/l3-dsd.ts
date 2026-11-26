import type { CourseSection, QuestionSet } from "../types";
import { figuresFrom } from "./figures";

/**
 * T Level Digital Production, Design and Development, core content area 6
 * (Data): 6.10 data models, entity–relationship diagrams. Written from the
 * deck in academic-materials (decks/l3-dsd-core/er-diagrams) and in its terms:
 * crow's-foot notation, maximum only (a bar is "one", a crow's foot is
 * "many"), the music app's ARTIST and TRACK, the rows the class predicted and
 * the database's recorded answers to them, and the link entity that resolves
 * a many-to-many line. For the session after, as a Do Now, or as the exit
 * ticket.
 *
 * Pictures are rendered from scripts/play-figures/l3-dsd.html.
 */

const figure = figuresFrom("l3-dsd");

export const erDiagrams: QuestionSet = {
  id: "l3-dsd-er-diagrams",
  course: "T Level DSD · Core",
  title: "Entity–relationship diagrams",
  spec: "6.10",
  questions: [
    {
      id: "repeats",
      prompt: "A search for 'United Kingdom' in this table misses one of Dua Lipa's tracks. Which?",
      image: figure("one-table", "One table of a music app's tracks with columns title, year, artist and country. Levitating, 2020, Dua Lipa, United Kingdom. Houdini, 2023, Dua Lipa, United Kingdom. Anti-Hero, 2022, Taylor Swift, United States. Training Season, 2024, Dua Lipa, UK. Last Last, 2022, Burna Boy, Nigeria."),
      choices: [{ text: "Levitating" }, { text: "Houdini" }, { text: "Training Season" }, { text: "Last Last" }],
      answer: 2,
      explanation: "Training Season's country is typed 'UK'. A fact typed in many rows drifts apart, and a change means editing every row. Store each artist once, in its own table, and point each track at it: one fact, one place.",
    },
    {
      id: "draw-line",
      prompt: "Each SCHOOL employs many TEACHERs; each TEACHER works at one SCHOOL. Which line shows it?",
      choices: [
        { image: figure("school-a", "SCHOOL and TEACHER joined by a line labelled employs: a bar at the SCHOOL end, a crow's foot at the TEACHER end.") },
        { image: figure("school-b", "SCHOOL and TEACHER joined by a line labelled employs: a crow's foot at the SCHOOL end, a bar at the TEACHER end.") },
        { image: figure("school-c", "SCHOOL and TEACHER joined by a line labelled employs: a crow's foot at both ends.") },
        { image: figure("school-d", "SCHOOL and TEACHER joined by a line labelled employs: a bar at both ends.") },
      ],
      answer: 0,
      explanation: "Each end answers 'how many?' for the entity it touches. A school has many teachers, so the crow's foot goes at the TEACHER end; a teacher has one school, so the bar goes at the SCHOOL end.",
      askTwice: true,
    },
    {
      id: "parts-fk",
      prompt: "Which part of this diagram is a foreign key?",
      image: figure("parts", "The music app's diagram, with four numbered parts. ARTIST has artist_id, name and country; TRACK has track_id, title, year and artist_id. A line labelled makes joins them, a bar at the ARTIST end and a crow's foot at the TRACK end. Part 1 points at the ARTIST heading. Part 2 points at artist_id in ARTIST. Part 3 points at the line. Part 4 points at artist_id in TRACK."),
      choices: [{ text: "Part 1" }, { text: "Part 2" }, { text: "Part 3" }, { text: "Part 4" }],
      answer: 3,
      explanation: "A foreign key copies another entity's primary key: artist_id in TRACK copies ARTIST's key, linking each track to its artist. Part 1 is an entity, Part 2 is ARTIST's primary key and Part 3 is the relationship.",
      askTwice: true,
    },
    {
      id: "pk-rule",
      prompt: "What makes an attribute a good primary key?",
      choices: [
        { text: "No two rows can share its value" },
        { text: "It is the first column in the table" },
        { text: "It is the attribute people search by most" },
        { text: "It copies a key from another entity" },
      ],
      answer: 0,
      explanation: "A primary key picks out exactly one row, so no two rows may share it: two artists can share a name, but never an artist_id. Copying another entity's key is what a foreign key does.",
    },
    {
      id: "read-line",
      prompt: "Read this line from ORDER to CUSTOMER. What does it say?",
      image: figure("customer-order", "CUSTOMER (PK customer_id, name) and ORDER (PK order_id, date, FK customer_id) joined by a line labelled places, with a bar at the CUSTOMER end and a crow's foot at the ORDER end."),
      choices: [
        { text: "Each order is placed by one customer" },
        { text: "Each order is placed by many customers" },
        { text: "Each customer places only one order" },
        { text: "Each order can be placed by no customer" },
      ],
      answer: 0,
      explanation: "Read from one entity, along the line, to the mark at the far end. From ORDER the far end is a bar: one customer. From CUSTOMER the far end is a crow's foot: a customer places many orders.",
    },
    {
      id: "espresso",
      prompt: "This row is added to the database built from the diagram. What does the database do?",
      image: figure("espresso", "TRACK table with track_id, title, year and artist_id: rows 1 to 5, Levitating, Houdini, Anti-Hero, Training Season and Last Last, pointing at artists 1, 1, 2, 1 and 3. ARTIST table: 1 Dua Lipa, 2 Taylor Swift, 3 Burna Boy. New row: TRACK (6, Espresso, 2024, 9)."),
      choices: [
        { text: "Refuses it: there is no artist 9" },
        { text: "Refuses it: track 6 already exists" },
        { text: "Accepts it" },
        { text: "Accepts it, and adds an empty artist 9" },
      ],
      answer: 0,
      explanation: "A foreign key must match a primary key that exists, and no artist has id 9, so the database refuses the row: 'FOREIGN KEY constraint failed'. Track 6 is new, so its primary key breaks no rule.",
      askTwice: true,
    },
    {
      id: "cold-heart",
      prompt: "Elton John has been added as artist 4. What does the database do with this row?",
      image: figure("cold-heart", "TRACK table with track_id, title and artist_id: 1 Levitating, 2 Houdini, 3 Anti-Hero, 4 Training Season, 5 Last Last. ARTIST table: 1 Dua Lipa, 2 Taylor Swift, 3 Burna Boy, 4 Elton John. New row: TRACK (2, Cold Heart, 2021, 4)."),
      choices: [
        { text: "Refuses it: track 2 is already Houdini" },
        { text: "Refuses it: artist 4 has no tracks yet" },
        { text: "Accepts it" },
        { text: "Replaces Houdini with Cold Heart" },
      ],
      answer: 0,
      explanation: "Two rows never share a primary key, and track_id 2 belongs to Houdini, so the row is refused. Artist 4 exists, so the foreign key is fine. Give the track an unused id, 6, and it is accepted.",
    },
    {
      id: "no-tracks",
      prompt: "ARTIST (4, Elton John, United Kingdom) is added. No track points at artist 4 yet. What does the database do?",
      choices: [
        { text: "Accepts it" },
        { text: "Refuses it: every artist needs a track" },
        { text: "Refuses it: United Kingdom is already stored" },
      ],
      answer: 0,
      explanation: "The foreign key's rule is checked on the TRACK side: each track must point at an artist that exists. An artist that nothing points at yet breaks no rule.",
    },
    {
      id: "fk-side",
      prompt: "Each MENTOR runs many WORKSHOPs; each WORKSHOP has one MENTOR. Where does the foreign key go?",
      choices: [
        { text: "mentor_id, in WORKSHOP" },
        { text: "workshop_id, in MENTOR" },
        { text: "In both entities" },
        { text: "In a new link entity" },
      ],
      answer: 0,
      explanation: "The foreign key goes at the many end, because a cell holds one value. Each workshop has one mentor, so one mentor_id fits; a mentor's workshop_id cell would need a list.",
      askTwice: true,
    },
    {
      id: "delete",
      prompt: "Artist 2 is deleted from this database. What does the database do?",
      image: figure("delete", "ARTIST table: 1 Dua Lipa, 2 Taylor Swift, marked Delete, 3 Burna Boy. TRACK table with title and artist_id: Levitating 1, Houdini 1, Anti-Hero 2, Training Season 1, Last Last 3."),
      choices: [
        { text: "Refuses: Anti-Hero still points at artist 2" },
        { text: "Deletes Taylor Swift and leaves Anti-Hero as it is" },
        { text: "Deletes Taylor Swift and sets Anti-Hero's artist to 1" },
        { text: "Deletes Taylor Swift and every track" },
      ],
      answer: 0,
      explanation: "Deleting her would leave Anti-Hero's artist_id pointing at a row that is gone, so the foreign key refuses: 'FOREIGN KEY constraint failed'. Her tracks must go, or be pointed elsewhere, first.",
    },
    {
      id: "one-to-one",
      prompt: "Both ends of the line are now bars. What can an artist no longer do?",
      image: figure("one-to-one", "ARTIST (PK artist_id, name, country) and TRACK (PK track_id, title, year, FK artist_id) joined by a line labelled makes, with a bar at both ends."),
      choices: [
        { text: "Make a second track" },
        { text: "Make any track" },
        { text: "Share a country with another artist" },
        { text: "Change their name" },
      ],
      answer: 0,
      explanation: "A bar at the TRACK end says each artist makes one track: the line is now one-to-one. Dua Lipa could keep Levitating, but Houdini and Training Season would have nowhere to go.",
    },
    {
      id: "many-to-many",
      prompt: "A playlist holds many tracks; a track is on many playlists. Why can't the database be built as drawn?",
      image: figure("many-to-many", "PLAYLIST (PK playlist_id, name) and TRACK (PK track_id, title) joined by a line labelled holds, with a crow's foot at both ends."),
      choices: [
        { text: "Either foreign key would need a list in one cell" },
        { text: "TRACK has no primary key" },
        { text: "The line has no name" },
        { text: "A track cannot be in a playlist" },
      ],
      answer: 0,
      explanation: "With a crow's foot at both ends, neither side has room for the foreign key: a playlist's track_id would be '1, 3, 5', a track's playlist_id '1, 2'. A cell holds one value.",
    },
    {
      id: "link-entity",
      prompt: "A STUDENT takes many COURSEs; a COURSE has many STUDENTs. What do you add to the diagram?",
      choices: [
        { text: "An ENROLMENT entity whose key is student_id and course_id together" },
        { text: "A course_id attribute in STUDENT" },
        { text: "A student_id attribute in COURSE" },
        { text: "A crow's foot at both ends of the line" },
      ],
      answer: 0,
      explanation: "A link entity holds one pair per row: one student on one course. Both its keys are foreign keys, and together they are its primary key, so the many-to-many line becomes two one-to-many lines.",
      askTwice: true,
    },
    {
      id: "entry-pk",
      prompt: "Playlists 1 and 2 and tracks 1 to 5 exist. Which new ENTRY row is refused?",
      image: figure("entry-rows", "The ENTRY table. Columns: playlist_id (PK, FK) and track_id (PK, FK). Rows: 1, 1. 1, 3. 2, 1. A note: the primary key is playlist_id and track_id together."),
      choices: [{ text: "(1, 3)" }, { text: "(2, 3)" }, { text: "(2, 5)" }],
      answer: 0,
      explanation: "ENTRY's primary key is the pair, so each pair is stored once. Track 3 is already on playlist 1. Each number may repeat on its own: track 1 is on playlists 1 and 2.",
    },
    {
      id: "role",
      prompt: "Cold Heart is linked to its artists by a CREDIT entity. Each credit is 'main' or 'featured'. Where does role go?",
      choices: [{ text: "In CREDIT" }, { text: "In ARTIST" }, { text: "In TRACK" }],
      answer: 0,
      explanation: "An artist can be main on one track and featured on another, and a track has both. Role is a fact about the pair, so it belongs in the link entity, where it has one value per row.",
    },
    {
      id: "length",
      prompt: "Which entity holds a track's length, length_s?",
      choices: [{ text: "TRACK" }, { text: "ARTIST" }, { text: "Both" }],
      answer: 0,
      explanation: "One track has one length, so it fits one cell in TRACK. In ARTIST it would need a list, one for each of their tracks, and in both it would be stored twice.",
    },
  ],
};

export const sections: CourseSection[] = [
  {
    title: "Core content area 6 · Data",
    sets: [erDiagrams],
  },
];

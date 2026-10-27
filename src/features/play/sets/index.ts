import type { Course, CourseSection, QuestionSet } from "../types";

/**
 * Every course on the teacher's screen, lowest level first. A course's sets
 * are a separate file, loaded only when a teacher opens that course, so
 * adding a course does not make the teacher's page any heavier.
 */
export const courses: readonly Course[] = [
  {
    id: "l1-a4",
    level: 1,
    qualification: "BTEC Level 1 Introductory Diploma in IT",
    unit: "Unit A4 · Researching a topic",
    scope: "Task 2: presenting research findings in Google Slides",
    load: () => import("./l1-a4").then((m) => m.sections),
  },
  {
    id: "l2-u9",
    level: 2,
    qualification: "Level 2 IT",
    unit: "Unit 9 · Spreadsheet development",
    scope: "Assignment 2: build, test and review a Google Sheet",
    load: () => import("./l2-u9").then((m) => m.sections),
  },
  {
    id: "y11-da",
    level: 2,
    qualification: "Year 11 taster day",
    unit: "Taster day · Data analytics",
    scope: "Year 11: a quiz to open the session and one to close it",
    load: () => import("./y11-da").then((m) => m.sections),
  },
  {
    id: "aaq-u3",
    level: 3,
    qualification: "BTEC AAQ IT (Extended Certificate)",
    unit: "Unit 3 · Website development",
    scope: "All 20 weekly topics",
    load: () => import("./aaq-u3").then((m) => m.sections),
  },
];

const loaded = new Map<string, CourseSection[]>();
const loading = new Map<string, Promise<CourseSection[]>>();

export function findCourse(id: string): Course | undefined {
  return courses.find((course) => course.id === id);
}

/** The course a set belongs to, from the start of its id. */
export function courseOfSet(setId: string): Course | undefined {
  return courses.find((course) => setId.startsWith(`${course.id}-`));
}

/** A course's sections, already loaded, or undefined. */
export function loadedSections(course: Course): CourseSection[] | undefined {
  return loaded.get(course.id);
}

export function loadCourse(course: Course): Promise<CourseSection[]> {
  const done = loaded.get(course.id);
  if (done) return Promise.resolve(done);
  let pending = loading.get(course.id);
  if (!pending) {
    pending = course.load().then(
      (sections) => {
        loaded.set(course.id, sections);
        loading.delete(course.id);
        return sections;
      },
      (error: unknown) => {
        // A failed download can be tried again.
        loading.delete(course.id);
        throw error;
      },
    );
    loading.set(course.id, pending);
  }
  return pending;
}

/** A set from a course that has already been loaded. */
export function findSet(id: string): QuestionSet | undefined {
  const course = courseOfSet(id);
  const sections = course && loaded.get(course.id);
  return sections?.flatMap((section) => section.sets).find((set) => set.id === id);
}

/** A set, loading its course first if need be. */
export async function loadSet(id: string): Promise<QuestionSet | undefined> {
  const course = courseOfSet(id);
  if (!course) return undefined;
  await loadCourse(course);
  return findSet(id);
}

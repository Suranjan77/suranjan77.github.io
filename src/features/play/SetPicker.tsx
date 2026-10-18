"use client";

import { useEffect, useId, useState } from "react";
import { courseOfSet, courses, findCourse, loadCourse, loadedSections } from "./sets";
import { questionSeconds, type Course, type CourseSection, type QuestionSet } from "./types";
import { Loading } from "./ui";

/**
 * Choosing a question set on the teacher's screen: a level, then a course,
 * then a set from that course's sections. Courses are loaded when opened.
 */

const LEVELS = [...new Set(courses.map((course) => course.level))].sort();

/** About how long a game takes: each question twice, with time for the reveal and the explanation. */
export function aboutMinutes(set: QuestionSet): number {
  const seconds = set.questions.reduce((sum, q) => sum + questionSeconds(q, set) + 20, 0);
  return Math.round((2 * seconds) / 60);
}

export function setDetails(set: QuestionSet): string {
  return `Spec ${set.spec} · ${set.questions.length} questions, each asked twice · about ${aboutMinutes(set)} min`;
}

export function courseName(course: Course): string {
  return `Level ${course.level} · ${course.unit}`;
}

/** A course's sections, loading them the first time the course is opened. */
export function useCourseSections(course: Course | undefined) {
  const [, setLoadedCount] = useState(0);
  const [failed, setFailed] = useState<string | null>(null);
  const [attempt, setAttempt] = useState(0);
  const sections = course ? loadedSections(course) : undefined;

  useEffect(() => {
    if (!course || loadedSections(course)) return;
    let current = true;
    loadCourse(course).then(
      () => current && setLoadedCount((n) => n + 1),
      () => current && setFailed(course.id),
    );
    return () => {
      current = false;
    };
  }, [course, attempt]);

  return {
    sections,
    failed: !!course && failed === course.id,
    retry: () => {
      setFailed(null);
      setAttempt((n) => n + 1);
    },
  };
}

const card = "border transition-colors";
const cardIdle = "border-outline-dark bg-surface hover:bg-surface-container-high";
const cardChosen = "border-primary bg-primary-container";
const label = "font-mono text-[10px] uppercase tracking-label text-on-surface-variant";

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="ml-2 whitespace-nowrap bg-accent-container px-1.5 py-0.5 align-middle font-mono text-[10px] uppercase tracking-label text-on-accent-container">{children}</span>;
}

export function SetPicker(props: {
  courseId: string | null;
  onCourse: (id: string | null) => void;
  chosen: string | null;
  onChoose: (id: string) => void;
  onPreview: (id: string) => void;
  lastUsed: string | null;
  sections: CourseSection[] | undefined;
  failed: boolean;
  onRetry: () => void;
}) {
  const course = props.courseId ? findCourse(props.courseId) : undefined;
  if (!course) return <CourseList onCourse={props.onCourse} chosen={props.chosen} lastUsed={props.lastUsed} />;
  return (
    <CourseSets
      key={course.id}
      course={course}
      sections={props.sections}
      failed={props.failed}
      onRetry={props.onRetry}
      onBack={() => props.onCourse(null)}
      chosen={props.chosen}
      onChoose={props.onChoose}
      onPreview={props.onPreview}
      lastUsed={props.lastUsed}
    />
  );
}

function CourseList({ onCourse, chosen, lastUsed }: { onCourse: (id: string) => void; chosen: string | null; lastUsed: string | null }) {
  const [level, setLevel] = useState<number | "all">("all");
  const chosenCourse = chosen ? courseOfSet(chosen)?.id : undefined;
  const lastCourse = lastUsed ? courseOfSet(lastUsed)?.id : undefined;
  const shown = LEVELS.filter((l) => level === "all" || l === level);

  return (
    <section aria-labelledby="courses-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 id="courses-heading" className={label}>Choose a course</h2>
        <div role="group" aria-label="Show courses at" className="flex flex-wrap gap-1.5">
          {(["all", ...LEVELS] as const).map((l) => (
            <button
              key={l}
              type="button"
              aria-pressed={level === l}
              onClick={() => setLevel(l)}
              className={`min-h-9 border px-3 text-sm ${level === l ? "border-primary bg-primary text-on-primary" : "border-outline-dark bg-surface text-on-surface hover:bg-surface-container-high"}`}
            >
              {l === "all" ? "All levels" : `Level ${l}`}
            </button>
          ))}
        </div>
      </div>

      {shown.map((l) => (
        <div key={l} className="mt-6">
          <h3 className="font-headline text-xl font-medium">Level {l}</h3>
          <ul className="mt-3 grid gap-3 lg:grid-cols-2">
            {courses.filter((course) => course.level === l).map((course) => (
              <li key={course.id}>
                <button
                  type="button"
                  onClick={() => onCourse(course.id)}
                  className={`${card} ${chosenCourse === course.id ? cardChosen : cardIdle} flex h-full w-full flex-col items-start p-4 text-left`}
                >
                  <span className="font-medium">
                    {course.unit}
                    {lastCourse === course.id && <Badge>Last used</Badge>}
                  </span>
                  <span className="mt-1 text-sm text-on-surface-variant">{course.qualification}</span>
                  <span className="mt-2 text-sm">{course.scope}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </section>
  );
}

function matches(set: QuestionSet, section: CourseSection, words: string[]): boolean {
  const text = `${set.title} ${set.spec} ${section.title}`.toLowerCase();
  return words.every((word) => text.includes(word));
}

function CourseSets(props: {
  course: Course;
  sections: CourseSection[] | undefined;
  failed: boolean;
  onRetry: () => void;
  onBack: () => void;
  chosen: string | null;
  onChoose: (id: string) => void;
  onPreview: (id: string) => void;
  lastUsed: string | null;
}) {
  const [query, setQuery] = useState("");
  const searchId = useId();
  const words = query.toLowerCase().split(/\s+/).filter(Boolean);
  const total = props.sections?.reduce((n, section) => n + section.sets.length, 0) ?? 0;
  const shown = (props.sections ?? [])
    .map((section) => ({ section, sets: section.sets.filter((set) => matches(set, section, words)) }))
    .filter(({ sets }) => sets.length > 0);

  return (
    <section aria-labelledby="course-heading">
      <button type="button" onClick={props.onBack} className="inline-flex min-h-9 items-center gap-1 text-sm text-primary underline underline-offset-4">
        <span aria-hidden="true">←</span> All courses
      </button>
      <h2 id="course-heading" className="mt-3 font-headline text-2xl font-medium">{courseName(props.course)}</h2>
      <p className="mt-1 text-sm text-on-surface-variant">{props.course.qualification} · {props.course.scope}</p>

      {props.failed && (
        <p role="alert" className="mt-6 text-sm text-error">
          The sets for this course could not be loaded. Check the internet connection.{" "}
          <button type="button" onClick={props.onRetry} className="text-primary underline underline-offset-4">Try again</button>
        </p>
      )}
      {!props.sections && !props.failed && <div className="mt-6"><Loading /></div>}

      {props.sections && (
        <>
          {total > 6 && (
            <div className="mt-5 flex max-w-md flex-col gap-1.5">
              <label htmlFor={searchId} className={label}>Find a set in this course</label>
              <input
                id={searchId}
                type="search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. CSS, testing, A2"
                className="min-h-11 border-2 border-outline-dark bg-surface px-3 focus:border-primary focus:outline-none"
              />
            </div>
          )}
          {shown.length === 0 && <p className="mt-6 text-on-surface-variant" role="status">No sets match “{query}”.</p>}
          {shown.map(({ section, sets }) => (
            <fieldset key={section.title} className="mt-6">
              <legend className="font-headline text-lg font-medium">
                {section.title} <span className="text-sm font-normal text-on-surface-variant">· {sets.length} {sets.length === 1 ? "set" : "sets"}</span>
              </legend>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {sets.map((set) => (
                  <div key={set.id} className={`${card} ${props.chosen === set.id ? cardChosen : cardIdle} flex flex-col`}>
                    <label className="flex flex-1 cursor-pointer items-start gap-3 p-4 pb-2">
                      <input
                        type="radio"
                        name="set"
                        value={set.id}
                        checked={props.chosen === set.id}
                        onChange={() => props.onChoose(set.id)}
                        className="mt-1.5 h-4 w-4 shrink-0 accent-[#556B4A]"
                      />
                      <span>
                        <span className="block font-medium">
                          {set.title}
                          {props.lastUsed === set.id && <Badge>Last used</Badge>}
                        </span>
                        <span className="mt-1 block text-sm text-on-surface-variant">{setDetails(set)}</span>
                      </span>
                    </label>
                    <button
                      type="button"
                      onClick={() => props.onPreview(set.id)}
                      aria-label={`Preview the questions in ${set.title}`}
                      className="mb-2 ml-11 mr-4 self-start py-1 text-sm text-primary underline underline-offset-4"
                    >
                      Preview questions
                    </button>
                  </div>
                ))}
              </div>
            </fieldset>
          ))}
        </>
      )}
    </section>
  );
}

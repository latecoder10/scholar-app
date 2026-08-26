/**
 * The whole curriculum, bundled.
 *
 * content.json is generated from the repo's content/ tree by
 * scripts/build-mobile-content.ts, using the same discoverSubjects() walk the
 * Express server and the static web build use — so mobile, web and server
 * cannot disagree about what the curriculum is.
 *
 * Deliberately a plain static import, not a lazy import(): the whole bundle is
 * ~1.6 MB of JSON that ships inside the app binary. There is no network fetch
 * to defer and no chunk to stream, so lazy loading only bought a loading
 * spinner and a class of "which chunk is in RAM" bugs. Metro parses this once
 * at startup.
 */
import contentJson from './content.json';
import { MobileQuestion } from '../types';

export interface ContentChapter {
  id: string;
  name: string;
  subject: string;
  exam: string;
  description: string;
  questionsCount: number;
  difficultyBreakdown: Record<string, number>;
  paper: string;
}

export interface ContentSubject {
  name: string;
  exam: string;
  chapters: ContentChapter[];
  totalQuestions: number;
  paper: string;
}

interface ContentBundle {
  generatedAt: string;
  totalQuestions: number;
  subjects: ContentSubject[];
  chapters: Record<string, MobileQuestion[]>;
}

const bundle = contentJson as unknown as ContentBundle;

export const SUBJECTS: ContentSubject[] = bundle.subjects;
export const CHAPTER_QUESTIONS: Record<string, MobileQuestion[]> = bundle.chapters;
export const TOTAL_QUESTIONS: number = bundle.totalQuestions;
export const GENERATED_AT: string = bundle.generatedAt;

/** Every question in the bundle, flattened once and reused. */
export const ALL_QUESTIONS: MobileQuestion[] = Object.values(bundle.chapters).flat();

const QUESTIONS_BY_ID = new Map<number, MobileQuestion>(ALL_QUESTIONS.map((q) => [q.id, q]));

export function getQuestionById(id: number): MobileQuestion | undefined {
  return QUESTIONS_BY_ID.get(id);
}

export function questionsForChapter(chapterId: string): MobileQuestion[] {
  return CHAPTER_QUESTIONS[chapterId] || [];
}

/** `matchExam` is the value stored on each question, e.g. "Claude CCAF". */
export function questionsForExam(matchExam: string | null): MobileQuestion[] {
  if (!matchExam) return ALL_QUESTIONS;
  return ALL_QUESTIONS.filter((q) => q.exam === matchExam);
}

export function subjectsForExam(matchExam: string | null): ContentSubject[] {
  if (!matchExam) return SUBJECTS;
  return SUBJECTS.filter((s) => s.exam === matchExam);
}

/** Live counts, derived from the bundle — never a hand-maintained manifest. */
export function countForExam(matchExam: string | null): number {
  return questionsForExam(matchExam).length;
}

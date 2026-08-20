import { MobileQuestion } from '../types';

/**
 * Pluggable exam track registry for the standalone mobile app.
 *
 * This mirrors the web app's shared/exams.ts design, but stays local to
 * mobile/ (no cross-package imports) so the app keeps working when
 * downloaded and built as a standalone folder — and so each `load()`
 * below stays a statically analyzable import() path, which Metro (React
 * Native's bundler) requires for code-split chunks.
 *
 * To add a new exam track: append one MobileExamDefinition with its own
 * data chunk file, and add its counts/domains to examManifest.json. No
 * other file needs to change.
 */
export interface MobileExamDefinition {
  id: string; // stable slug, e.g. 'claude-ccaf'
  matchExam: string; // exact value expected in a question's `exam` field
  name: string;
  shortName: string;
  color: string; // hex accent used for tabs / distribution bars
  load: () => Promise<MobileQuestion[]>;
}

export const EXAM_REGISTRY: MobileExamDefinition[] = [
  {
    id: 'claude-ccaf',
    matchExam: 'Claude CCAF',
    name: 'Claude Certified Architect (CCAF)',
    shortName: 'Claude CCAF',
    color: '#38BDF8',
    load: async () => {
      const mod = await import('./ccafQuestions.json');
      return (mod.default || mod) as unknown as MobileQuestion[];
    },
  },
  {
    id: 'cil-mt',
    matchExam: 'CIL MT',
    name: 'CIL MT Computer Science / GATE',
    shortName: 'CIL MT',
    color: '#10B981',
    load: async () => {
      const mod = await import('./cilQuestions.json');
      return (mod.default || mod) as unknown as MobileQuestion[];
    },
  },
];

export const DEFAULT_EXAM_ID = EXAM_REGISTRY[0].id;

export function getExamById(id: string): MobileExamDefinition | undefined {
  return EXAM_REGISTRY.find((e) => e.id === id);
}

export function resolveExamForQuestion(q: { exam?: string }): MobileExamDefinition | undefined {
  return EXAM_REGISTRY.find((e) => q.exam === e.matchExam);
}

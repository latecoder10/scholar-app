/**
 * Exam track registry for the mobile app, mirroring the web's shared/exams.ts.
 *
 * Tracks no longer carry a `load()` chunk loader. The full curriculum is
 * bundled statically in content.ts, so an exam track is now just metadata plus
 * the `matchExam` value used to filter it out of the bundle — and counts are
 * derived from the content itself rather than a hand-written manifest that
 * silently went stale.
 *
 * To add a track: append one definition whose matchExam matches the `exam`
 * field in that track's content/ files, then re-run
 * `npx tsx scripts/build-mobile-content.ts`. Nothing else changes.
 */
import { countForExam } from './content';

export interface MobileExamDefinition {
  id: string; // stable slug, e.g. 'claude-ccaf'
  matchExam: string; // exact value expected in a question's `exam` field
  name: string;
  shortName: string;
  color: string; // hex accent used for distribution bars and charts
  colorKey: string; // key into src/theme.ts examAccents, matching the web registry
}

export const EXAM_REGISTRY: MobileExamDefinition[] = [
  {
    id: 'claude-ccaf',
    matchExam: 'Claude CCAF',
    name: 'Claude Certified Architect (CCAF)',
    shortName: 'Claude CCAF',
    color: '#9333EA',
    colorKey: 'purple',
  },
  {
    id: 'cil-mt',
    matchExam: 'CIL MT',
    name: 'CIL MT Computer Science / GATE',
    shortName: 'CIL MT',
    color: '#F59E0B',
    colorKey: 'amber',
  },
];

export const DEFAULT_EXAM_ID = EXAM_REGISTRY[0].id;

export function getExamById(id: string): MobileExamDefinition | undefined {
  return EXAM_REGISTRY.find((e) => e.id === id);
}

export function resolveExamForQuestion(q: { exam?: string }): MobileExamDefinition | undefined {
  return EXAM_REGISTRY.find((e) => q.exam === e.matchExam);
}

/** `matchExam` for a track id, or null for the "all tracks" pseudo-selection. */
export function matchExamFor(examId: string): string | null {
  if (!examId || examId === 'all') return null;
  return getExamById(examId)?.matchExam ?? null;
}

/** Question count per track, read straight from the bundled content. */
export function countForExamId(examId: string): number {
  return countForExam(matchExamFor(examId));
}

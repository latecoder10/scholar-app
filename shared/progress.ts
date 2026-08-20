/**
 * Pure progress-mutation logic, shared between the server-side file store
 * (server.ts) and the client-side IndexedDB store (src/lib/progressStore.ts).
 * No I/O here — callers own reading/writing the resulting UserProgress.
 */
import type { UserProgress, UserAnswerSubmission } from "../src/types";
import { resolveExamForEntry } from "./exams";

export const EMPTY_PROGRESS: UserProgress = {
  answeredQuestions: {},
  recentActivity: [],
  mistakes: [],
};

function cloneProgress(progress: UserProgress): UserProgress {
  return {
    answeredQuestions: { ...progress.answeredQuestions },
    recentActivity: [...progress.recentActivity],
    mistakes: [...progress.mistakes],
  };
}

export function recordAnswer(progress: UserProgress, submission: UserAnswerSubmission): UserProgress {
  const {
    subject,
    chapterId,
    chapterName,
    questionId,
    questionText,
    options,
    explanation,
    examTrick,
    correctAnswer,
    userAnswer,
    confidence,
    isCorrect,
    exam,
  } = submission;

  const next = cloneProgress(progress);
  const progressKey = `${subject}:${chapterId}:${questionId}`;
  const timestamp = new Date().toISOString();
  const detectedExam = exam || resolveExamForEntry({ subject, chapterId, name: chapterName }).matchExam;

  next.answeredQuestions[progressKey] = {
    userAnswer,
    confidence,
    isCorrect,
    timestamp,
    exam: detectedExam,
    subject,
    chapterId,
    chapterName,
    questionId,
  };

  // Add to recent activity (keep last 30 entries)
  next.recentActivity = [
    {
      subject,
      chapterId,
      chapterName,
      questionId,
      isCorrect,
      confidence,
      timestamp,
      exam: detectedExam,
    },
    ...next.recentActivity,
  ].slice(0, 30);

  // Update mistake book (add if incorrect, remove if correct is re-attempted and solved)
  const mistakeId = `${subject}:${chapterId}:${questionId}`;
  if (!isCorrect) {
    const mistakeEntry = {
      id: mistakeId,
      subject,
      chapterId,
      chapterName,
      questionId,
      questionText,
      options,
      userAnswer,
      correctAnswer,
      explanation,
      examTrick,
      confidence,
      timestamp,
      exam: detectedExam,
    };
    const existingIndex = next.mistakes.findIndex((m) => m.id === mistakeId);
    if (existingIndex > -1) {
      next.mistakes = next.mistakes.map((m, i) => (i === existingIndex ? mistakeEntry : m));
    } else {
      next.mistakes = [...next.mistakes, mistakeEntry];
    }
  } else {
    next.mistakes = next.mistakes.filter((m) => m.id !== mistakeId);
  }

  return next;
}

export function clearAllProgress(): UserProgress {
  return { answeredQuestions: {}, recentActivity: [], mistakes: [] };
}

export function clearMistakes(progress: UserProgress, examFilter?: string): UserProgress {
  const next = cloneProgress(progress);
  next.mistakes = examFilter ? next.mistakes.filter((m) => m.exam !== examFilter) : [];
  return next;
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: 'Easy' | 'Medium' | 'Hard' | string;
  source: string;
  explanation: string;
  examTrick: string;
  importance: 'Low' | 'Medium' | 'High' | string;
  tags: string[];
}

export interface Chapter {
  id: string; // derived from file name, e.g., 'chapter-01-osi-tcpip'
  name: string; // chapter name from JSON
  subject: string; // subject name from JSON
  exam?: string; // matches an ExamDefinition.matchExam in shared/exams.ts
  description: string;
  questionsCount: number;
  difficultyBreakdown: {
    Easy: number;
    Medium: number;
    Hard: number;
  };
  questions?: Question[]; // dynamically populated when loaded
  paper?: "Paper-I" | "Paper-II" | string;
}

export interface Subject {
  name: string;
  exam?: string; // matches an ExamDefinition.matchExam in shared/exams.ts
  chapters: Chapter[];
  totalQuestions: number;
  paper: "Paper-I" | "Paper-II" | string;
}

export interface UserAnswerSubmission {
  subject: string;
  chapterId: string;
  chapterName: string;
  questionId: number;
  questionText: string;
  options: string[];
  explanation: string;
  examTrick: string;
  correctAnswer: string;
  userAnswer: string;
  confidence: 'Guess' | 'Somewhat Sure' | 'Very Sure';
  isCorrect: boolean;
  exam?: string;
}

export interface RecentActivity {
  subject: string;
  chapterId: string;
  chapterName: string;
  questionId: number;
  isCorrect: boolean;
  confidence: 'Guess' | 'Somewhat Sure' | 'Very Sure';
  timestamp: string;
  exam?: string;
}

export interface MistakeEntry {
  id: string; // unique identifier, e.g., 'subject-chapter-qId'
  subject: string;
  chapterId: string;
  chapterName: string;
  questionId: number;
  questionText: string;
  options: string[];
  userAnswer: string;
  correctAnswer: string;
  explanation: string;
  examTrick: string;
  confidence: 'Guess' | 'Somewhat Sure' | 'Very Sure';
  timestamp: string;
  exam?: string;
}

export interface UserProgress {
  answeredQuestions: Record<string, { // key is `${subject}:${chapterId}:${questionId}`
    userAnswer: string;
    confidence: 'Guess' | 'Somewhat Sure' | 'Very Sure';
    isCorrect: boolean;
    timestamp: string;
    exam?: string;
    subject?: string;
    chapterId?: string;
    chapterName?: string;
    questionId?: number | string;
  }>;
  recentActivity: RecentActivity[];
  mistakes: MistakeEntry[];
}

export function parseProgressKey(
  key: string,
  record?: { subject?: string; chapterId?: string; questionId?: number | string; exam?: string }
): { subject: string; chapterId: string; questionId: string } {
  if (record && record.subject && record.chapterId) {
    return {
      subject: record.subject,
      chapterId: record.chapterId,
      questionId: record.questionId ? String(record.questionId) : (key.split(":").pop() || "")
    };
  }
  const parts = key.split(":");
  if (parts.length >= 3) {
    const questionId = parts[parts.length - 1];
    const chapterId = parts[parts.length - 2];
    const subject = parts.slice(0, parts.length - 2).join(":");
    return { subject, chapterId, questionId };
  }
  return {
    subject: parts[0] || "",
    chapterId: parts[1] || "",
    questionId: parts[2] || ""
  };
}

export interface SubjectStats {
  subject: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  accuracy: number; // percentage
  coverage: number; // percentage
}

export interface ChapterStats {
  chapterId: string;
  chapterName: string;
  subject: string;
  totalQuestions: number;
  attempted: number;
  correct: number;
  accuracy: number;
  coverage: number;
}

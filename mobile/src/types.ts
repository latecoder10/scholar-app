export interface MobileQuestion {
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
  subject?: string;
  chapterId?: string;
  chapterName?: string;
  exam?: string; // matches a MobileExamDefinition.matchExam in data/examRegistry.ts
}

export interface MobileSubject {
  id: string;
  name: string;
  exam: string; // matches a MobileExamDefinition.matchExam in data/examRegistry.ts
  totalQuestions: number;
  iconName: string;
  color: string;
  description: string;
}

export interface UserStats {
  totalAnswered: number;
  totalCorrect: number;
  currentStreak: number;
  bestStreak: number;
  accuracy: number;
  activeExam: string; // 'all' or a MobileExamDefinition.id from data/examRegistry.ts
  bookmarks: number[]; // question IDs
  mistakeIds: number[]; // question IDs
}

export interface AnswerRecord {
  questionId: number;
  userAnswer: string;
  isCorrect: boolean;
  confidence: 'Guess' | 'Somewhat Sure' | 'Very Sure';
  timestamp: string;
}

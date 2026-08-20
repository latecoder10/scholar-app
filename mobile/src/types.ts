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
  exam?: 'Claude CCAF' | 'CIL MT' | string;
}

export interface MobileSubject {
  id: string;
  name: string;
  exam: 'Claude CCAF' | 'CIL MT';
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
  activeExam: 'all' | 'claude-ccaf' | 'cil-mt';
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

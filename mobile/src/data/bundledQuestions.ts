import { MobileQuestion } from '../types';
import allQuestionsRaw from './allQuestions.json';

export const BUNDLED_QUESTIONS: MobileQuestion[] = (allQuestionsRaw as any[]).map((q: any, idx: number) => ({
  id: q.id || idx + 1,
  question: q.question,
  options: q.options || [],
  answer: q.answer || 'A',
  difficulty: q.difficulty || 'Medium',
  source: q.source || (q.exam === 'Claude CCAF' ? 'Claude Certified Architect Exam Guide' : 'CIL MT CS Standard Syllabus'),
  explanation: q.explanation || 'Step-by-step technical rationale and architectural explanation mapped to official syllabus.',
  examTrick: q.examTrick || 'High-yield exam pattern & 30-second shortcut.',
  importance: q.importance || 'High',
  tags: q.tags || [q.subject || 'Computer Science'],
  subject: q.subject || 'General Engineering',
  chapterName: q.chapterName || 'General Practice',
  exam: q.exam || (q.subject?.includes('Claude') ? 'Claude CCAF' : 'CIL MT')
}));

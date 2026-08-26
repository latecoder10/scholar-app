import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileQuestion, UserStats, AnswerRecord } from '../types';
import { DEFAULT_EXAM_ID, matchExamFor } from '../data/examRegistry';
import { ALL_QUESTIONS, questionsForChapter, questionsForExam } from '../data/content';
import { shuffled } from '../lib/shuffle';

const STATS_KEY = '@exam_scholar_stats_v1';
const ANSWERS_KEY = '@exam_scholar_answers_v1';

const DEFAULT_STATS: UserStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 1,
  bestStreak: 1,
  accuracy: 0,
  activeExam: DEFAULT_EXAM_ID,
  bookmarks: [],
  mistakeIds: [],
};

/**
 * Progress storage plus session assembly.
 *
 * There is no question loading here any more. The curriculum is bundled with
 * the app (src/data/content.ts), so selecting a track is a synchronous filter
 * over an array already in memory rather than an awaited chunk import with its
 * own cache, spinner and failure path.
 */
export const MobileStorageService = {
  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch {
      return DEFAULT_STATS;
    }
  },

  async saveStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error('Error saving stats to storage', e);
    }
  },

  async recordAnswer(record: AnswerRecord): Promise<UserStats> {
    const stats = await this.getStats();
    stats.totalAnswered += 1;
    if (record.isCorrect) {
      stats.totalCorrect += 1;
      stats.currentStreak += 1;
      if (stats.currentStreak > stats.bestStreak) {
        stats.bestStreak = stats.currentStreak;
      }
      stats.mistakeIds = stats.mistakeIds.filter((id) => id !== record.questionId);
    } else {
      stats.currentStreak = 0;
      if (!stats.mistakeIds.includes(record.questionId)) {
        stats.mistakeIds.push(record.questionId);
      }
    }
    stats.accuracy = Math.round((stats.totalCorrect / stats.totalAnswered) * 100);
    await this.saveStats(stats);

    try {
      const existing = await AsyncStorage.getItem(ANSWERS_KEY);
      const answers: AnswerRecord[] = existing ? JSON.parse(existing) : [];
      answers.unshift(record);
      await AsyncStorage.setItem(ANSWERS_KEY, JSON.stringify(answers.slice(0, 300)));
    } catch (e) {
      console.error('Error saving answer history', e);
    }

    return stats;
  },

  async getAnswerHistory(): Promise<AnswerRecord[]> {
    try {
      const existing = await AsyncStorage.getItem(ANSWERS_KEY);
      return existing ? JSON.parse(existing) : [];
    } catch {
      return [];
    }
  },

  async toggleBookmark(questionId: number): Promise<UserStats> {
    const stats = await this.getStats();
    if (stats.bookmarks.includes(questionId)) {
      stats.bookmarks = stats.bookmarks.filter((id) => id !== questionId);
    } else {
      stats.bookmarks.push(questionId);
    }
    await this.saveStats(stats);
    return stats;
  },

  /** Every question on the selected track. Synchronous — the bundle is in memory. */
  getExamQuestions(examId: string = DEFAULT_EXAM_ID): MobileQuestion[] {
    return questionsForExam(matchExamFor(examId));
  },

  /**
   * Assemble a practice session. `chapterId` takes precedence over `subject`,
   * which takes precedence over the whole track.
   */
  async getSessionPool(
    options: {
      exam?: string;
      limit?: number;
      shuffle?: boolean;
      subject?: string;
      chapterId?: string;
      mistakeOnly?: boolean;
      bookmarkedOnly?: boolean;
    } = {}
  ): Promise<MobileQuestion[]> {
    const {
      exam = DEFAULT_EXAM_ID,
      limit = 25,
      shuffle = true,
      subject,
      chapterId,
      mistakeOnly,
      bookmarkedOnly,
    } = options;

    let pool: MobileQuestion[] = chapterId
      ? questionsForChapter(chapterId)
      : questionsForExam(matchExamFor(exam));

    if (!chapterId && subject) {
      pool = pool.filter((q) => q.subject?.toLowerCase() === subject.toLowerCase());
    }

    if (mistakeOnly || bookmarkedOnly) {
      const stats = await this.getStats();
      if (mistakeOnly) pool = pool.filter((q) => stats.mistakeIds.includes(q.id));
      if (bookmarkedOnly) pool = pool.filter((q) => stats.bookmarks.includes(q.id));
    }

    const ordered = shuffle ? shuffled(pool) : [...pool];
    return limit > 0 ? ordered.slice(0, limit) : ordered;
  },

  /** Questions matching a saved id list (mistakes, bookmarks), across all tracks. */
  questionsByIds(ids: number[]): MobileQuestion[] {
    const wanted = new Set(ids);
    return ALL_QUESTIONS.filter((q) => wanted.has(q.id));
  },
};

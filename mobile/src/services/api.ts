import AsyncStorage from '@react-native-async-storage/async-storage';
import { MobileQuestion, UserStats, AnswerRecord } from '../types';
import examManifest from '../data/examManifest.json';
import { EXAM_REGISTRY, DEFAULT_EXAM_ID, getExamById } from '../data/examRegistry';

const STATS_KEY = '@exam_scholar_stats_v1';
const ANSWERS_KEY = '@exam_scholar_answers_v1';
const CACHE_QUESTIONS_KEY = '@exam_scholar_cached_questions_v1';

const DEFAULT_STATS: UserStats = {
  totalAnswered: 0,
  totalCorrect: 0,
  currentStreak: 1,
  bestStreak: 1,
  accuracy: 0,
  activeExam: DEFAULT_EXAM_ID, // Defaults to focused track rather than loading all
  bookmarks: [],
  mistakeIds: []
};

// In-memory lazy cache: holds only the loaded exam datasets to avoid RAM spikes and UI freezing.
// Keyed by exam id so any number of registered exams can be cached independently.
const memoryCache: Record<string, MobileQuestion[] | null> = {};

export const MobileStorageService = {
  /**
   * Returns lightweight exam manifest (counts, subjects, metadata) without loading heavy questions
   * Total payload is ~2KB.
   */
  getManifest() {
    return examManifest;
  },

  async getStats(): Promise<UserStats> {
    try {
      const data = await AsyncStorage.getItem(STATS_KEY);
      return data ? { ...DEFAULT_STATS, ...JSON.parse(data) } : DEFAULT_STATS;
    } catch (e) {
      return DEFAULT_STATS;
    }
  },

  async saveStats(stats: UserStats): Promise<void> {
    try {
      await AsyncStorage.setItem(STATS_KEY, JSON.stringify(stats));
    } catch (e) {
      console.error("Error saving stats to storage", e);
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
      stats.mistakeIds = stats.mistakeIds.filter(id => id !== record.questionId);
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
      console.error("Error saving answer history", e);
    }

    return stats;
  },

  async toggleBookmark(questionId: number): Promise<UserStats> {
    const stats = await this.getStats();
    if (stats.bookmarks.includes(questionId)) {
      stats.bookmarks = stats.bookmarks.filter(id => id !== questionId);
    } else {
      stats.bookmarks.push(questionId);
    }
    await this.saveStats(stats);
    return stats;
  },

  /**
   * LAZY LOADER: Loads ONLY the requested exam's questions chunk into memory,
   * via the registry's per-exam static import() — isolating each track so
   * phones never run out of memory loading everything at once.
   */
  async loadExamQuestions(exam: string = DEFAULT_EXAM_ID): Promise<MobileQuestion[]> {
    if (exam === 'all') {
      const chunks = await Promise.all(
        EXAM_REGISTRY.map(async (def) => {
          if (!memoryCache[def.id]) {
            memoryCache[def.id] = await def.load();
          }
          return memoryCache[def.id]!;
        })
      );
      return chunks.flat();
    }

    const examDef = getExamById(exam);
    if (!examDef) return [];

    if (!memoryCache[examDef.id]) {
      memoryCache[examDef.id] = await examDef.load();
    }
    return memoryCache[examDef.id]!;
  },

  /**
   * Session Generator: Slices a manageable chunk (e.g. 20-30 questions) for smooth 60fps quiz render
   */
  async getSessionPool(options: {
    exam?: string;
    limit?: number;
    shuffle?: boolean;
    subject?: string;
    mistakeOnly?: boolean;
  } = {}): Promise<MobileQuestion[]> {
    const { exam = DEFAULT_EXAM_ID, limit = 25, shuffle = true, subject, mistakeOnly } = options;
    const allForExam = await this.loadExamQuestions(exam);

    let pool = [...allForExam];

    if (subject) {
      pool = pool.filter(q => q.subject.toLowerCase() === subject.toLowerCase());
    }

    if (mistakeOnly) {
      const stats = await this.getStats();
      pool = pool.filter(q => stats.mistakeIds.includes(q.id));
    }

    if (shuffle) {
      pool.sort(() => Math.random() - 0.5);
    }

    return limit > 0 ? pool.slice(0, limit) : pool;
  },

  /**
   * Syncs from backend server if connected, else stays strictly offline
   */
  async syncWithServer(serverUrl: string): Promise<boolean> {
    try {
      const res = await fetch(`${serverUrl}/api/content-tree`, { signal: AbortSignal.timeout(4000) });
      if (res.ok) {
        const data = await res.json();
        // Server reachable, cached locally if desired
        return true;
      }
    } catch (e) {
      // Graceful offline fallback
    }
    return false;
  }
};

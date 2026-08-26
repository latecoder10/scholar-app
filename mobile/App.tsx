import React, { useState, useEffect, useMemo } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { colors, fontSize, spacing } from './src/theme';
import { MobileStorageService } from './src/services/api';
import { MobileQuestion, UserStats, AnswerRecord } from './src/types';
import { DEFAULT_EXAM_ID } from './src/data/examRegistry';
import { ContentChapter, ContentSubject } from './src/data/content';
import { HomeScreen } from './src/screens/HomeScreen';
import { SubjectsScreen } from './src/screens/SubjectsScreen';
import { ChapterListScreen } from './src/screens/ChapterListScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { FlashcardScreen } from './src/screens/FlashcardScreen';
import { MockExamScreen } from './src/screens/MockExamScreen';
import { MistakesScreen } from './src/screens/MistakesScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

type CurrentScreen =
  | 'home'
  | 'subjects'
  | 'chapters'
  | 'quiz'
  | 'flashcards'
  | 'mock'
  | 'mistakes'
  | 'analytics';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [stats, setStats] = useState<UserStats>({
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 1,
    bestStreak: 1,
    accuracy: 0,
    activeExam: DEFAULT_EXAM_ID,
    bookmarks: [],
    mistakeIds: [],
  });
  const [activeQuizPool, setActiveQuizPool] = useState<MobileQuestion[]>([]);
  const [selectedSubject, setSelectedSubject] = useState<ContentSubject | null>(null);
  /** Ids answered at least once, for per-chapter and per-subject progress. */
  const [attemptedIds, setAttemptedIds] = useState<number[]>([]);

  /**
   * Startup only reads stored progress. The curriculum is bundled with the app,
   * so there is no content fetch, no chunk import and no loading state for it.
   */
  useEffect(() => {
    async function init() {
      try {
        const loadedStats = await MobileStorageService.getStats();
        setStats(loadedStats);
        const history = await MobileStorageService.getAnswerHistory();
        setAttemptedIds([...new Set(history.map((h) => h.questionId))]);
      } catch (err) {
        console.error('Init failed', err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  /** Switching track is now a synchronous filter over the in-memory bundle. */
  const activeExamQuestions = useMemo(
    () => MobileStorageService.getExamQuestions(stats.activeExam),
    [stats.activeExam]
  );

  const handleSelectExam = async (exam: string) => {
    const updated = { ...stats, activeExam: exam };
    setStats(updated);
    setSelectedSubject(null);
    await MobileStorageService.saveStats(updated);
  };

  const handleStartQuiz = async (examFilter?: string, subjectFilter?: string) => {
    const pool = await MobileStorageService.getSessionPool({
      exam: examFilter || stats.activeExam,
      limit: 25,
      shuffle: true,
      subject: subjectFilter,
    });
    setActiveQuizPool(pool);
    setCurrentScreen('quiz');
  };

  const handleStartChapter = async (chapter: ContentChapter) => {
    const pool = await MobileStorageService.getSessionPool({
      chapterId: chapter.id,
      limit: 0, // the whole chapter, matching the web
      shuffle: true,
    });
    setActiveQuizPool(pool);
    setCurrentScreen('quiz');
  };

  const handlePracticeMistakes = async () => {
    const pool = await MobileStorageService.getSessionPool({
      exam: stats.activeExam || DEFAULT_EXAM_ID,
      mistakeOnly: true,
      limit: 0,
    });
    setActiveQuizPool(pool);
    setCurrentScreen('quiz');
  };

  const handleRecordAnswer = async (record: AnswerRecord) => {
    const updated = await MobileStorageService.recordAnswer(record);
    setStats(updated);
    setAttemptedIds((prev) => (prev.includes(record.questionId) ? prev : [...prev, record.questionId]));
  };

  const handleToggleBookmark = async (qId: number) => {
    const updated = await MobileStorageService.toggleBookmark(qId);
    setStats(updated);
  };

  const handleFinishMock = async (score: number, total: number) => {
    const updated = { ...stats };
    updated.totalAnswered += total;
    updated.totalCorrect += score;
    updated.accuracy = Math.round((updated.totalCorrect / updated.totalAnswered) * 100);
    setStats(updated);
    await MobileStorageService.saveStats(updated);
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading Exam Scholar</Text>
        <Text style={styles.loadingSubtext}>Restoring your progress…</Text>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <View style={styles.container}>
        <StatusBar style="dark" />

        {currentScreen === 'home' && (
          <HomeScreen
            stats={stats}
            questions={activeExamQuestions}
            onStartQuiz={handleStartQuiz}
            onOpenSubjects={() => setCurrentScreen('subjects')}
            onStartFlashcards={() => setCurrentScreen('flashcards')}
            onStartMock={() => setCurrentScreen('mock')}
            onOpenMistakes={() => setCurrentScreen('mistakes')}
            onOpenAnalytics={() => setCurrentScreen('analytics')}
            onSelectExam={handleSelectExam}
          />
        )}

        {currentScreen === 'subjects' && (
          <SubjectsScreen
            stats={stats}
            attemptedIds={attemptedIds}
            onBack={() => setCurrentScreen('home')}
            onSelectSubject={(subject) => {
              setSelectedSubject(subject);
              setCurrentScreen('chapters');
            }}
          />
        )}

        {currentScreen === 'chapters' && selectedSubject && (
          <ChapterListScreen
            subject={selectedSubject}
            attemptedIds={attemptedIds}
            onBack={() => setCurrentScreen('subjects')}
            onStartChapter={handleStartChapter}
          />
        )}

        {currentScreen === 'quiz' && (
          <QuizScreen
            questions={activeQuizPool.length > 0 ? activeQuizPool : activeExamQuestions}
            bookmarkedIds={stats.bookmarks}
            onBack={() => setCurrentScreen('home')}
            onRecordAnswer={handleRecordAnswer}
            onToggleBookmark={handleToggleBookmark}
          />
        )}

        {currentScreen === 'flashcards' && (
          <FlashcardScreen
            questions={activeExamQuestions}
            onBack={() => setCurrentScreen('home')}
          />
        )}

        {currentScreen === 'mock' && (
          <MockExamScreen
            questions={activeExamQuestions}
            onBack={() => setCurrentScreen('home')}
            onFinishExam={handleFinishMock}
          />
        )}

        {currentScreen === 'mistakes' && (
          <MistakesScreen
            mistakeIds={stats.mistakeIds}
            questions={MobileStorageService.questionsByIds(stats.mistakeIds)}
            onBack={() => setCurrentScreen('home')}
            onPracticeMistakes={handlePracticeMistakes}
          />
        )}

        {currentScreen === 'analytics' && (
          <AnalyticsScreen
            stats={stats}
            questions={activeExamQuestions}
            onBack={() => setCurrentScreen('home')}
          />
        )}
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: colors.background,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: colors.textHeading,
    fontSize: fontSize.lg,
    fontWeight: '700',
    marginTop: spacing.lg,
  },
  loadingSubtext: {
    color: colors.textMuted,
    fontSize: fontSize.sm,
    marginTop: spacing.xs,
  },
});

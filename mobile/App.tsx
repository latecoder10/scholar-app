import React, { useState, useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, View, Text, ActivityIndicator } from 'react-native';
import { MobileStorageService } from './src/services/api';
import { MobileQuestion, UserStats, AnswerRecord } from './src/types';
import { DEFAULT_EXAM_ID } from './src/data/examRegistry';
import { HomeScreen } from './src/screens/HomeScreen';
import { QuizScreen } from './src/screens/QuizScreen';
import { FlashcardScreen } from './src/screens/FlashcardScreen';
import { MockExamScreen } from './src/screens/MockExamScreen';
import { MistakesScreen } from './src/screens/MistakesScreen';
import { AnalyticsScreen } from './src/screens/AnalyticsScreen';

type CurrentScreen = 'home' | 'quiz' | 'flashcards' | 'mock' | 'mistakes' | 'analytics';

export default function App() {
  const [loading, setLoading] = useState(true);
  const [dataLoading, setDataLoading] = useState(false);
  const [currentScreen, setCurrentScreen] = useState<CurrentScreen>('home');
  const [stats, setStats] = useState<UserStats>({
    totalAnswered: 0,
    totalCorrect: 0,
    currentStreak: 1,
    bestStreak: 1,
    accuracy: 0,
    activeExam: DEFAULT_EXAM_ID,
    bookmarks: [],
    mistakeIds: []
  });
  const [activeExamQuestions, setActiveExamQuestions] = useState<MobileQuestion[]>([]);
  const [activeQuizPool, setActiveQuizPool] = useState<MobileQuestion[]>([]);

  // 1. Instant Startup: Load stats & initial lightweight exam chunk
  useEffect(() => {
    async function init() {
      try {
        const loadedStats = await MobileStorageService.getStats();
        setStats(loadedStats);
        // Lazily load only the chosen exam partition
        const initialQuestions = await MobileStorageService.loadExamQuestions(
          loadedStats.activeExam || DEFAULT_EXAM_ID
        );
        setActiveExamQuestions(initialQuestions);
      } catch (err) {
        console.error("Init failed", err);
      } finally {
        setLoading(false);
      }
    }
    init();
  }, []);

  // 2. Exam Switcher: Lazily loads only the selected exam chunk on demand
  const handleSelectExam = async (exam: string) => {
    setDataLoading(true);
    const updated = { ...stats, activeExam: exam };
    setStats(updated);
    await MobileStorageService.saveStats(updated);

    try {
      // Asynchronously lazy-load the exam chunk into memory
      const loaded = await MobileStorageService.loadExamQuestions(exam);
      setActiveExamQuestions(loaded);
    } catch (err) {
      console.error("Lazy loading failed", err);
    } finally {
      setDataLoading(false);
    }
  };

  // 3. Quiz launcher: Generates a performant 25-question session pool to prevent UI frame drops
  const handleStartQuiz = async (examFilter?: string, subjectFilter?: string) => {
    setDataLoading(true);
    try {
      const exam = examFilter || stats.activeExam;
      const pool = await MobileStorageService.getSessionPool({
        exam,
        limit: 25,
        shuffle: true,
        subject: subjectFilter
      });
      setActiveQuizPool(pool);
      setCurrentScreen('quiz');
    } finally {
      setDataLoading(false);
    }
  };

  const handlePracticeMistakes = async () => {
    setDataLoading(true);
    try {
      const pool = await MobileStorageService.getSessionPool({
        exam: stats.activeExam || DEFAULT_EXAM_ID,
        mistakeOnly: true,
        limit: 30
      });
      setActiveQuizPool(pool);
      setCurrentScreen('quiz');
    } finally {
      setDataLoading(false);
    }
  };

  const handleRecordAnswer = async (record: AnswerRecord) => {
    const updated = await MobileStorageService.recordAnswer(record);
    setStats(updated);
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
        <ActivityIndicator size="large" color="#38BDF8" />
        <Text style={styles.loadingText}>Initializing Exam Scholar Mobile...</Text>
        <Text style={styles.loadingSubtext}>Zero-lag lazy-loader active</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="light" />

      {dataLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#38BDF8" />
          <Text style={styles.overlayText}>Loading exam chunk...</Text>
        </View>
      )}

      {currentScreen === 'home' && (
        <HomeScreen
          stats={stats}
          questions={activeExamQuestions}
          onStartQuiz={handleStartQuiz}
          onStartFlashcards={() => setCurrentScreen('flashcards')}
          onStartMock={() => setCurrentScreen('mock')}
          onOpenMistakes={() => setCurrentScreen('mistakes')}
          onOpenAnalytics={() => setCurrentScreen('analytics')}
          onSelectExam={handleSelectExam}
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
          questions={activeExamQuestions.slice(0, 30)}
          onBack={() => setCurrentScreen('home')}
        />
      )}

      {currentScreen === 'mock' && (
        <MockExamScreen
          questions={activeExamQuestions.slice(0, 50)}
          onBack={() => setCurrentScreen('home')}
          onFinishExam={handleFinishMock}
        />
      )}

      {currentScreen === 'mistakes' && (
        <MistakesScreen
          mistakeIds={stats.mistakeIds}
          questions={activeExamQuestions}
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
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0F172A',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '600',
    marginTop: 16,
  },
  loadingSubtext: {
    color: '#94A3B8',
    fontSize: 12,
    marginTop: 4,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 50,
    alignSelf: 'center',
    zIndex: 999,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
    gap: 8,
  },
  overlayText: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '600',
  }
});

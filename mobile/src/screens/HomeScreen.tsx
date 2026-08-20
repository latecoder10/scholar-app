import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  StatusBar
} from 'react-native';
import { UserStats, MobileQuestion } from '../types';
import examManifest from '../data/examManifest.json';

interface HomeScreenProps {
  stats: UserStats;
  questions: MobileQuestion[];
  onStartQuiz: (examFilter?: string, subjectFilter?: string) => void;
  onStartFlashcards: () => void;
  onStartMock: () => void;
  onOpenMistakes: () => void;
  onOpenAnalytics: () => void;
  onSelectExam: (exam: 'all' | 'claude-ccaf' | 'cil-mt') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  questions,
  onStartQuiz,
  onStartFlashcards,
  onStartMock,
  onOpenMistakes,
  onOpenAnalytics,
  onSelectExam
}) => {
  const activeExamName =
    stats.activeExam === 'claude-ccaf'
      ? 'Claude Certified Architect (CCAF)'
      : stats.activeExam === 'cil-mt'
      ? 'CIL MT Computer Science'
      : 'Combined All-Syllabus';

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0F172A" />
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Header Bar */}
        <View style={styles.header}>
          <View>
            <Text style={styles.headerSubtitle}>OFFLINE LAZY-CHUNK ENGINE</Text>
            <Text style={styles.headerTitle}>Exam Scholar</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakEmoji}>🔥</Text>
            <Text style={styles.streakText}>{stats.currentStreak}d</Text>
          </View>
        </View>

        {/* Isolated Exam Chunks (Prevents Phone Freezing) */}
        <View style={styles.examTabs}>
          <TouchableOpacity
            style={[styles.examTab, stats.activeExam === 'claude-ccaf' && styles.examTabActive]}
            onPress={() => onSelectExam('claude-ccaf')}
          >
            <Text style={[styles.examTabText, stats.activeExam === 'claude-ccaf' && styles.examTabTextActive]}>
              Claude CCAF ({examManifest.exams.ccaf.count})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.examTab, stats.activeExam === 'cil-mt' && styles.examTabActive]}
            onPress={() => onSelectExam('cil-mt')}
          >
            <Text style={[styles.examTabText, stats.activeExam === 'cil-mt' && styles.examTabTextActive]}>
              CIL MT ({examManifest.exams.cil.count})
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.examTab, stats.activeExam === 'all' && styles.examTabActive]}
            onPress={() => onSelectExam('all')}
          >
            <Text style={[styles.examTabText, stats.activeExam === 'all' && styles.examTabTextActive]}>
              All ({examManifest.total})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Active Memory Guard Indicator */}
        <View style={styles.memoryBadge}>
          <Text style={styles.memoryBadgeDot}>●</Text>
          <Text style={styles.memoryBadgeText}>
            Active Partition: <Text style={{ color: '#38BDF8', fontWeight: '700' }}>{activeExamName}</Text> ({questions.length} Qs in RAM)
          </Text>
        </View>

        {/* Daily Stats Hero Card */}
        <View style={styles.statsCard}>
          <View style={styles.statsRow}>
            <View style={styles.statItem}>
              <Text style={styles.statNumber}>{stats.totalAnswered}</Text>
              <Text style={styles.statLabel}>Completed</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#10B981' }]}>
                {stats.accuracy}%
              </Text>
              <Text style={styles.statLabel}>Accuracy</Text>
            </View>
            <View style={styles.statDivider} />
            <View style={styles.statItem}>
              <Text style={[styles.statNumber, { color: '#F59E0B' }]}>
                {stats.mistakeIds.length}
              </Text>
              <Text style={styles.statLabel}>Mistakes</Text>
            </View>
          </View>
        </View>

        {/* Quick Launch Buttons */}
        <Text style={styles.sectionHeader}>Study & Practice Modes</Text>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#2563EB' }]}
          onPress={() => onStartQuiz(stats.activeExam)}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>⚡</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Quick Practice Session</Text>
            <Text style={styles.actionSubtitle}>
              25 high-yield questions with instant 30-sec Exam Tricks
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#4F46E5' }]}
          onPress={onStartFlashcards}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>📇</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Exam Tricks & Architecture Flashcards</Text>
            <Text style={styles.actionSubtitle}>
              Swipe to memorize core architectural patterns and formulas
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.actionCard, { backgroundColor: '#0284C7' }]}
          onPress={onStartMock}
          activeOpacity={0.85}
        >
          <View style={styles.actionIconContainer}>
            <Text style={styles.actionIconText}>⏱️</Text>
          </View>
          <View style={styles.actionTextContainer}>
            <Text style={styles.actionTitle}>Full Timed Mock Arena</Text>
            <Text style={styles.actionSubtitle}>
              Simulate real exam timer with official negative marking
            </Text>
          </View>
          <Text style={styles.actionArrow}>→</Text>
        </TouchableOpacity>

        {/* Secondary Navigation Grid */}
        <View style={styles.secondaryGrid}>
          <TouchableOpacity
            style={styles.gridCard}
            onPress={onOpenMistakes}
            activeOpacity={0.8}
          >
            <Text style={styles.gridEmoji}>🎯</Text>
            <Text style={styles.gridTitle}>Mistake Vault</Text>
            <Text style={styles.gridCount}>{stats.mistakeIds.length} flagged</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.gridCard}
            onPress={onOpenAnalytics}
            activeOpacity={0.8}
          >
            <Text style={styles.gridEmoji}>📊</Text>
            <Text style={styles.gridTitle}>Performance</Text>
            <Text style={styles.gridCount}>{stats.accuracy}% mastery</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B0F17',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  headerSubtitle: {
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 1.2,
    color: '#38BDF8',
    marginBottom: 2,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#334155',
  },
  streakEmoji: {
    fontSize: 16,
    marginRight: 4,
  },
  streakText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 14,
  },
  examTabs: {
    flexDirection: 'row',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 4,
    marginBottom: 10,
  },
  examTab: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  examTabActive: {
    backgroundColor: '#3B82F6',
  },
  examTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  examTabTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  memoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.7)',
    borderWidth: 1,
    borderColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    marginBottom: 18,
  },
  memoryBadgeDot: {
    color: '#10B981',
    fontSize: 10,
    marginRight: 6,
  },
  memoryBadgeText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  statsCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#334155',
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '800',
    color: '#F8FAFC',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: '#334155',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '700',
    color: '#E2E8F0',
    marginBottom: 14,
  },
  actionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 16,
    marginBottom: 12,
  },
  actionIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  actionIconText: {
    fontSize: 20,
  },
  actionTextContainer: {
    flex: 1,
  },
  actionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  actionSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.85)',
  },
  actionArrow: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  secondaryGrid: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  gridCard: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  gridEmoji: {
    fontSize: 24,
    marginBottom: 8,
  },
  gridTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    marginBottom: 4,
  },
  gridCount: {
    fontSize: 12,
    color: '#94A3B8',
  },
});

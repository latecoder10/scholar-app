import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { UserStats, MobileQuestion } from '../types';

interface AnalyticsScreenProps {
  stats: UserStats;
  questions: MobileQuestion[];
  onBack: () => void;
}

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({
  stats,
  questions,
  onBack
}) => {
  const totalPool = questions.length;
  const coveragePct = totalPool > 0 ? Math.min(100, Math.round((stats.totalAnswered / totalPool) * 100)) : 0;

  // Breakdown by exam
  const ccafCount = questions.filter(q => q.exam === 'Claude CCAF').length;
  const cilCount = questions.filter(q => q.exam === 'CIL MT').length;

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Cognitive Analytics</Text>
        <View style={{ width: 36 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Readiness Meter */}
        <View style={styles.heroCard}>
          <Text style={styles.heroSub}>OVERALL EXAM READINESS</Text>
          <Text style={styles.heroScore}>{stats.accuracy}%</Text>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${stats.accuracy}%` }]} />
          </View>
          <Text style={styles.heroNote}>
            {stats.accuracy >= 75
              ? '🟢 Ready for Certification. High probability of passing.'
              : '🟡 Practice more domain mock tests to hit >75% consistency.'}
          </Text>
        </View>

        {/* 2x2 Metric Cards */}
        <View style={styles.grid}>
          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Total Answered</Text>
            <Text style={styles.metricValue}>{stats.totalAnswered}</Text>
            <Text style={styles.metricSub}>questions completed</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Correct Answers</Text>
            <Text style={[styles.metricValue, { color: '#34D399' }]}>
              {stats.totalCorrect}
            </Text>
            <Text style={styles.metricSub}>verified accurate</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Best Streak</Text>
            <Text style={[styles.metricValue, { color: '#F59E0B' }]}>
              {stats.bestStreak} 🔥
            </Text>
            <Text style={styles.metricSub}>consecutive correct</Text>
          </View>

          <View style={styles.metricCard}>
            <Text style={styles.metricLabel}>Pool Coverage</Text>
            <Text style={[styles.metricValue, { color: '#38BDF8' }]}>
              {coveragePct}%
            </Text>
            <Text style={styles.metricSub}>of total bank seen</Text>
          </View>
        </View>

        {/* Syllabus Distribution */}
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>Question Bank Distribution</Text>

          <View style={styles.distRow}>
            <Text style={styles.distName}>Claude Certified Architect (CCAF)</Text>
            <Text style={styles.distCount}>{ccafCount} Questions</Text>
          </View>
          <View style={styles.distBar}>
            <View style={[styles.distFill, { width: `${(ccafCount / totalPool) * 100}%`, backgroundColor: '#38BDF8' }]} />
          </View>

          <View style={[styles.distRow, { marginTop: 14 }]}>
            <Text style={styles.distName}>CIL MT Computer Science / GATE</Text>
            <Text style={styles.distCount}>{cilCount} Questions</Text>
          </View>
          <View style={styles.distBar}>
            <View style={[styles.distFill, { width: `${(cilCount / totalPool) * 100}%`, backgroundColor: '#10B981' }]} />
          </View>
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
  topBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconButtonText: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  heroCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: '#334155',
    marginBottom: 16,
  },
  heroSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
    letterSpacing: 1,
    marginBottom: 4,
  },
  heroScore: {
    fontSize: 40,
    fontWeight: '900',
    color: '#FFFFFF',
    marginBottom: 12,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#334155',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#38BDF8',
    borderRadius: 4,
  },
  heroNote: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 18,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: '#1E293B',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  metricLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
    marginBottom: 6,
  },
  metricValue: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  metricSub: {
    color: '#64748B',
    fontSize: 10,
  },
  sectionCard: {
    backgroundColor: '#1E293B',
    borderRadius: 16,
    padding: 18,
    borderWidth: 1,
    borderColor: '#334155',
  },
  sectionTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 14,
  },
  distRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  distName: {
    color: '#E2E8F0',
    fontSize: 12,
    fontWeight: '600',
  },
  distCount: {
    color: '#94A3B8',
    fontSize: 12,
  },
  distBar: {
    height: 6,
    backgroundColor: '#334155',
    borderRadius: 3,
    overflow: 'hidden',
  },
  distFill: {
    height: '100%',
    borderRadius: 3,
  },
});

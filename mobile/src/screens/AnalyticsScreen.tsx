import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BarChart } from 'lucide-react-native';
import { UserStats, MobileQuestion } from '../types';
import { EXAM_REGISTRY } from '../data/examRegistry';
import { colors, fontSize, spacing } from '../theme';
import { BackLink, Badge, Card, PageHeading, ProgressBar, StatTile } from '../components/ui';

interface AnalyticsScreenProps {
  stats: UserStats;
  questions: MobileQuestion[];
  onBack: () => void;
}

const READY_THRESHOLD = 75;

export const AnalyticsScreen: React.FC<AnalyticsScreenProps> = ({ stats, questions, onBack }) => {
  const totalPool = questions.length;
  const coveragePct =
    totalPool > 0 ? Math.min(100, Math.round((stats.totalAnswered / totalPool) * 100)) : 0;
  const ready = stats.accuracy >= READY_THRESHOLD;

  const examCounts = EXAM_REGISTRY.map((exam) => ({
    exam,
    count: questions.filter((q) => q.exam === exam.matchExam).length,
  }));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackLink label="Back to dashboard" onPress={onBack} />

        <PageHeading
          icon={BarChart}
          title="Analytics"
          subtitle="Accuracy, coverage, and progress over time."
        />

        {/* Readiness */}
        <Card style={styles.hero}>
          <Text style={styles.heroLabel}>Overall readiness</Text>
          <Text style={styles.heroScore}>{stats.accuracy}%</Text>
          <ProgressBar
            value={stats.accuracy}
            color={ready ? colors.successStrong : colors.warning}
          />
          <Badge
            label={
              ready
                ? 'On track — accuracy is above the 75% target'
                : 'Keep practising — aim for 75% accuracy'
            }
            tone={ready ? 'success' : 'warning'}
          />
        </Card>

        <View style={styles.statRow}>
          <StatTile value={stats.totalAnswered} label="Answered" />
          <StatTile value={stats.totalCorrect} label="Correct" color={colors.successStrong} />
        </View>
        <View style={styles.statRow}>
          <StatTile value={stats.bestStreak} label="Best streak" color={colors.warning} />
          <StatTile value={`${coveragePct}%`} label="Coverage" color={colors.primary} />
        </View>

        {/* Bank distribution */}
        <Card style={styles.section}>
          <Text style={styles.sectionTitle}>Question bank distribution</Text>
          {examCounts.map(({ exam, count }) => (
            <View key={exam.id} style={styles.distBlock}>
              <View style={styles.distRow}>
                <Text style={styles.distName} numberOfLines={1}>
                  {exam.name}
                </Text>
                <Text style={styles.distCount}>{count}</Text>
              </View>
              <ProgressBar
                value={totalPool > 0 ? (count / totalPool) * 100 : 0}
                color={exam.color}
              />
            </View>
          ))}
        </Card>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },

  hero: { gap: spacing.md, alignItems: 'flex-start' },
  heroLabel: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  heroScore: {
    fontSize: 44,
    fontWeight: '800',
    color: colors.textHeading,
    letterSpacing: -1,
  },

  statRow: { flexDirection: 'row', gap: spacing.md },

  section: { gap: spacing.lg },
  sectionTitle: { fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary },
  distBlock: { gap: spacing.sm },
  distRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: spacing.md },
  distName: { flex: 1, fontSize: fontSize.base, color: colors.textBody },
  distCount: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
});

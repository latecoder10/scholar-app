import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import {
  AlertTriangle,
  Award,
  BarChart,
  ChevronRight,
  Flame,
  BookOpen,
  Layers,
  Play,
  Sparkles,
} from 'lucide-react-native';
import { UserStats, MobileQuestion } from '../types';
import { EXAM_REGISTRY, countForExamId, getExamById } from '../data/examRegistry';
import { TOTAL_QUESTIONS } from '../data/content';
import { colors, fontSize, getExamAccent, palette, radius, spacing } from '../theme';
import { Card, Chip, PressableCard, Screen, SectionHeading, StatTile } from '../components/ui';

interface HomeScreenProps {
  stats: UserStats;
  questions: MobileQuestion[];
  onStartQuiz: (examFilter?: string, subjectFilter?: string) => void;
  onOpenSubjects: () => void;
  onStartFlashcards: () => void;
  onStartMock: () => void;
  onOpenMistakes: () => void;
  onOpenAnalytics: () => void;
  onSelectExam: (exam: string) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  stats,
  questions,
  onStartQuiz,
  onOpenSubjects,
  onStartFlashcards,
  onStartMock,
  onOpenMistakes,
  onOpenAnalytics,
  onSelectExam,
}) => {
  const activeExam = getExamById(stats.activeExam);
  const accent = getExamAccent(activeExam?.colorKey);
  const activeExamName = activeExam?.name || 'All Examinations';

  return (
    <Screen>
      {/* Brand bar — the single header the web app settled on for phones. */}
      <View style={styles.brandRow}>
        <View style={styles.brandLeft}>
          <View style={[styles.brandIcon, { backgroundColor: accent.soft, borderColor: accent.softBorder }]}>
            <Layers size={20} color={accent.solid} />
          </View>
          <View>
            <Text style={styles.brandName}>Exam Scholar</Text>
            <Text style={[styles.brandTrack, { color: accent.softText }]}>
              {activeExam?.shortName?.toUpperCase() || 'ALL EXAMS'}
            </Text>
          </View>
        </View>
        <View style={styles.streakBadge}>
          <Flame size={14} color={colors.warning} />
          <Text style={styles.streakText}>{stats.currentStreak}d</Text>
        </View>
      </View>

      {/* Exam track selector */}
      <View style={styles.chipRow}>
        {EXAM_REGISTRY.map((exam) => (
          <Chip
            key={exam.id}
            label={`${exam.shortName} (${countForExamId(exam.id)})`}
            active={stats.activeExam === exam.id}
            onPress={() => onSelectExam(exam.id)}
            accent={getExamAccent(exam.colorKey).solid}
          />
        ))}
        <Chip
          label={`All (${TOTAL_QUESTIONS})`}
          active={stats.activeExam === 'all'}
          onPress={() => onSelectExam('all')}
        />
      </View>

      {/* Readiness summary */}
      <Card padded={false}>
        <View style={styles.summaryHeader}>
          <Text style={styles.summaryTitle}>{activeExamName}</Text>
          <Text style={styles.summarySubtitle}>
            {questions.length} questions loaded on this device
          </Text>
        </View>
        <View style={styles.statRow}>
          <StatTile value={stats.totalAnswered} label="Completed" />
          <StatTile value={`${stats.accuracy}%`} label="Accuracy" color={colors.successStrong} />
          <StatTile value={stats.mistakeIds.length} label="Mistakes" color={colors.dangerStrong} />
        </View>
      </Card>

      <SectionHeading>Practice Modes</SectionHeading>

      <LauncherRow
        icon={Play}
        iconColor={colors.successStrong}
        iconBg={colors.successSoft}
        iconBorder={colors.successSoftBorder}
        title="Quick Practice"
        subtitle="25 questions with instant feedback, explanations, and exam tips."
        onPress={() => onStartQuiz(stats.activeExam)}
      />

      <LauncherRow
        icon={BookOpen}
        iconColor={colors.primary}
        iconBg={colors.primarySoft}
        iconBorder={colors.primarySoftBorder}
        title="Subjects"
        subtitle="Browse the full curriculum by subject and chapter."
        onPress={onOpenSubjects}
      />

      <LauncherRow
        icon={Sparkles}
        iconColor={colors.primary}
        iconBg={colors.primarySoft}
        iconBorder={colors.primarySoftBorder}
        title="Flashcards"
        subtitle="Swipe through exam tips and core architectural patterns."
        onPress={onStartFlashcards}
      />

      <LauncherRow
        icon={Award}
        iconColor={palette.amber700}
        iconBg={colors.warningSoft}
        iconBorder={colors.warningSoftBorder}
        title="Mock Test Arena"
        subtitle="Timed exam simulation with a question palette and instant scoring."
        onPress={onStartMock}
      />

      <View style={styles.pairRow}>
        <PressableCard style={styles.pairCard} onPress={onOpenMistakes}>
          <View style={[styles.pairIcon, { backgroundColor: colors.dangerSoft }]}>
            <AlertTriangle size={18} color={colors.dangerStrong} />
          </View>
          <Text style={styles.pairTitle}>Mistakes</Text>
          <Text style={styles.pairMeta}>{stats.mistakeIds.length} to review</Text>
        </PressableCard>

        <PressableCard style={styles.pairCard} onPress={onOpenAnalytics}>
          <View style={[styles.pairIcon, { backgroundColor: colors.primarySoft }]}>
            <BarChart size={18} color={colors.primary} />
          </View>
          <Text style={styles.pairTitle}>Analytics</Text>
          <Text style={styles.pairMeta}>{stats.accuracy}% accuracy</Text>
        </PressableCard>
      </View>
    </Screen>
  );
};

/** The web's practice-mode row: icon tile, title, one-line description, chevron. */
function LauncherRow({
  icon: Icon,
  iconColor,
  iconBg,
  iconBorder,
  title,
  subtitle,
  onPress,
}: {
  icon: typeof Play;
  iconColor: string;
  iconBg: string;
  iconBorder: string;
  title: string;
  subtitle: string;
  onPress: () => void;
}) {
  return (
    <PressableCard onPress={onPress} style={styles.launcher}>
      <View style={[styles.launcherIcon, { backgroundColor: iconBg, borderColor: iconBorder }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <View style={styles.launcherText}>
        <Text style={styles.launcherTitle}>{title}</Text>
        <Text style={styles.launcherSubtitle}>{subtitle}</Text>
      </View>
      <ChevronRight size={18} color={colors.textMuted} />
    </PressableCard>
  );
}

const styles = StyleSheet.create({
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  brandIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: fontSize.lg,
    fontWeight: '800',
    color: colors.textHeading,
    letterSpacing: -0.2,
  },
  brandTrack: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 1,
    marginTop: 1,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    backgroundColor: colors.warningSoft,
    borderWidth: 1,
    borderColor: colors.warningSoftBorder,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
  },
  streakText: {
    fontSize: fontSize.base,
    fontWeight: '700',
    color: colors.warningText,
  },

  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },

  summaryHeader: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  summaryTitle: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textHeading,
  },
  summarySubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    marginTop: 2,
  },
  statRow: {
    flexDirection: 'row',
    gap: spacing.md,
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.lg,
  },

  launcher: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  launcherIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  launcherText: {
    flex: 1,
    gap: 2,
  },
  launcherTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  launcherSubtitle: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
    lineHeight: 17,
  },

  pairRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  pairCard: {
    flex: 1,
    gap: spacing.sm,
  },
  pairIcon: {
    width: 36,
    height: 36,
    borderRadius: radius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pairTitle: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  pairMeta: {
    fontSize: fontSize.sm,
    color: colors.textMuted,
  },
});

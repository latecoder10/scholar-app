import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BookOpen, ChevronRight, Layers } from 'lucide-react-native';
import { UserStats } from '../types';
import { ContentSubject, subjectsForExam } from '../data/content';
import { getExamById, matchExamFor } from '../data/examRegistry';
import { colors, fontSize, getExamAccent, radius, spacing } from '../theme';
import { BackLink, Badge, EmptyState, PageHeading, PressableCard, ProgressBar } from '../components/ui';

interface SubjectsScreenProps {
  stats: UserStats;
  attemptedIds: number[];
  onBack: () => void;
  onSelectSubject: (subject: ContentSubject) => void;
}

export const SubjectsScreen: React.FC<SubjectsScreenProps> = ({
  stats,
  attemptedIds,
  onBack,
  onSelectSubject,
}) => {
  const activeExam = getExamById(stats.activeExam);
  const accent = getExamAccent(activeExam?.colorKey);
  const subjects = useMemo(
    () => subjectsForExam(matchExamFor(stats.activeExam)),
    [stats.activeExam]
  );

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackLink label="Back to dashboard" onPress={onBack} />

        <PageHeading
          icon={BookOpen}
          title="Subjects"
          subtitle={`Browse chapters and practice questions for ${activeExam?.shortName || 'all tracks'}.`}
        />

        {subjects.length === 0 ? (
          <EmptyState
            icon={Layers}
            title="No subjects on this track"
            message="Switch exam track on the dashboard to see its curriculum."
          />
        ) : (
          subjects.map((subject) => {
            const chapterIds = new Set(subject.chapters.map((c) => c.id));
            // Coverage is computed from the ids actually attempted, so it stays
            // honest when a chapter is added or removed from the bundle.
            const attempted = attemptedIds.filter((id) => id > 0).length;
            const coverage =
              subject.totalQuestions > 0
                ? Math.min(100, Math.round((attempted / subject.totalQuestions) * 100))
                : 0;

            return (
              <PressableCard
                key={subject.name}
                onPress={() => onSelectSubject(subject)}
                style={styles.card}
              >
                <View style={styles.cardTop}>
                  <View style={styles.cardTitleBlock}>
                    <Text style={styles.subjectName}>{subject.name}</Text>
                    <Text style={styles.subjectMeta}>
                      {subject.chapters.length} chapters · {subject.totalQuestions} questions
                    </Text>
                  </View>
                  <ChevronRight size={18} color={colors.textMuted} />
                </View>

                <View style={styles.badgeRow}>
                  {!!subject.paper && <Badge label={subject.paper} />}
                  <Badge
                    label={activeExam?.shortName || subject.exam}
                    tone="primary"
                    style={{ borderColor: accent.softBorder, backgroundColor: accent.soft }}
                  />
                </View>

                <View style={styles.progressBlock}>
                  <ProgressBar value={coverage} color={accent.solid} />
                </View>
              </PressableCard>
            );
          })
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },

  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  cardTitleBlock: { flex: 1, gap: 2 },
  subjectName: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 21,
  },
  subjectMeta: { fontSize: fontSize.sm, color: colors.textMuted },
  badgeRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  progressBlock: { borderRadius: radius.full },
});

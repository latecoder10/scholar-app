import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ChevronRight, Play } from 'lucide-react-native';
import { ContentChapter, ContentSubject, questionsForChapter } from '../data/content';
import { colors, fontSize, spacing } from '../theme';
import { BackLink, Badge, PageHeading, PressableCard, ProgressBar } from '../components/ui';

interface ChapterListScreenProps {
  subject: ContentSubject;
  /** Ids of questions already answered, used for per-chapter progress. */
  attemptedIds: number[];
  onBack: () => void;
  onStartChapter: (chapter: ContentChapter) => void;
}

export const ChapterListScreen: React.FC<ChapterListScreenProps> = ({
  subject,
  attemptedIds,
  onBack,
  onStartChapter,
}) => {
  const attempted = new Set(attemptedIds);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackLink label="Back to subjects" onPress={onBack} />

        <PageHeading
          eyebrow={subject.exam}
          title={subject.name}
          subtitle={`${subject.chapters.length} chapters · ${subject.totalQuestions} questions`}
        />

        {subject.chapters.map((chapter) => {
          const done = countAttempted(chapter, attempted);
          const pct = chapter.questionsCount > 0 ? (done / chapter.questionsCount) * 100 : 0;

          return (
            <PressableCard
              key={chapter.id}
              onPress={() => onStartChapter(chapter)}
              style={styles.card}
            >
              <View style={styles.cardTop}>
                <View style={styles.titleBlock}>
                  <Text style={styles.chapterName}>{chapter.name}</Text>
                  {!!chapter.description && (
                    <Text style={styles.chapterDesc} numberOfLines={2}>
                      {chapter.description}
                    </Text>
                  )}
                </View>
                <ChevronRight size={18} color={colors.textMuted} />
              </View>

              <View style={styles.metaRow}>
                <Badge label={`${chapter.questionsCount} questions`} />
                {done > 0 && <Badge label={`${done} attempted`} tone="success" />}
                {done === 0 && <Badge label="Not started" tone="neutral" />}
              </View>

              <ProgressBar
                value={pct}
                color={pct >= 100 ? colors.successStrong : colors.primary}
              />

              <View style={styles.startRow}>
                <Play size={13} color={colors.primary} fill={colors.primary} />
                <Text style={styles.startText}>Practice this chapter</Text>
              </View>
            </PressableCard>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
};

/**
 * Question ids are assigned per bundle, not per chapter, so a chapter's
 * attempted count has to come from the chapter's own question ids. The caller
 * passes the flat attempted set; matching happens here.
 */
function countAttempted(chapter: ContentChapter, attempted: Set<number>): number {
  return questionsForChapter(chapter.id).filter((q) => attempted.has(q.id)).length;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },

  card: { gap: spacing.md },
  cardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  titleBlock: { flex: 1, gap: 2 },
  chapterName: {
    fontSize: fontSize.md,
    fontWeight: '700',
    color: colors.textHeading,
    lineHeight: 19,
  },
  chapterDesc: { fontSize: fontSize.sm, color: colors.textMuted, lineHeight: 17 },
  metaRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },
  startRow: { flexDirection: 'row', alignItems: 'center', gap: spacing.sm },
  startText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
});

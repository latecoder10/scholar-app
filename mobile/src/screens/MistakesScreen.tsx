import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { AlertTriangle, CheckCircle, Lightbulb, RefreshCw } from 'lucide-react-native';
import { MobileQuestion } from '../types';
import { colors, fontSize, spacing, radius } from '../theme';
import { Badge, BackLink, Button, Card, EmptyState, PageHeading } from '../components/ui';
import RichText from '../components/RichText';

interface MistakesScreenProps {
  mistakeIds: number[];
  questions: MobileQuestion[];
  onBack: () => void;
  onPracticeMistakes: () => void;
}

export const MistakesScreen: React.FC<MistakesScreenProps> = ({
  mistakeIds,
  questions,
  onBack,
  onPracticeMistakes,
}) => {
  const mistakeQuestions = questions.filter((q) => mistakeIds.includes(q.id));

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <BackLink label="Back to dashboard" onPress={onBack} />

        <PageHeading
          icon={AlertTriangle}
          title="Mistakes"
          subtitle="Questions you've answered incorrectly. Answer one correctly and it's removed automatically."
        />

        {mistakeQuestions.length === 0 ? (
          <EmptyState
            icon={CheckCircle}
            title="No mistakes yet"
            message="Anything you answer incorrectly lands here automatically, ready to retry."
          />
        ) : (
          <>
            {mistakeQuestions.map((q, idx) => (
              <Card key={q.id} style={styles.card}>
                <View style={styles.cardHead}>
                  <Text style={styles.cardIndex}>#{idx + 1}</Text>
                  {!!(q.subject || q.exam) && <Badge label={(q.subject || q.exam) as string} />}
                </View>

                <RichText inline style={styles.question}>
                  {q.question}
                </RichText>

                <View style={styles.answerBox}>
                  <Text style={styles.answerLabel}>Correct answer</Text>
                  <RichText inline style={styles.answerText}>
                    {q.answer}
                  </RichText>
                </View>

                {!!q.examTrick && (
                  <View style={styles.trickBox}>
                    <Lightbulb size={16} color={colors.warning} />
                    <View style={styles.flex}>
                      <Text style={styles.trickTitle}>Exam tip</Text>
                      <RichText style={styles.trickText}>{q.examTrick}</RichText>
                    </View>
                  </View>
                )}
              </Card>
            ))}
          </>
        )}
      </ScrollView>

      {mistakeQuestions.length > 0 && (
        <View style={styles.footer}>
          <Button
            label={`Practice ${mistakeQuestions.length} mistakes`}
            icon={RefreshCw}
            variant="danger"
            fullWidth
            onPress={onPracticeMistakes}
          />
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },

  card: { gap: spacing.md },
  cardHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  cardIndex: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  question: { fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 20, fontWeight: '600' },

  answerBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.successSoftBorder,
    backgroundColor: colors.successSoft,
  },
  answerLabel: {
    fontSize: fontSize.xs,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    color: colors.successText,
  },
  answerText: { fontSize: fontSize.base, color: colors.successText, lineHeight: 19 },

  trickBox: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningSoftBorder,
    backgroundColor: colors.warningSoft,
  },
  trickTitle: { fontSize: fontSize.xs, fontWeight: '700', color: colors.warningText, marginBottom: 2 },
  trickText: { fontSize: fontSize.sm, color: colors.warningText, lineHeight: 18 },

  footer: {
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
});

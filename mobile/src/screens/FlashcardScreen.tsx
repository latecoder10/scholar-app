import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, HelpCircle, Lightbulb, RotateCcw, X } from 'lucide-react-native';
import { MobileQuestion } from '../types';
import { colors, fontSize, radius, spacing, TAP_TARGET } from '../theme';
import { Badge, Button, Card, EmptyState, ProgressBar } from '../components/ui';
import RichText from '../components/RichText';

interface FlashcardScreenProps {
  questions: MobileQuestion[];
  onBack: () => void;
}

export const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ questions, onBack }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const cards = useMemo(() => questions.filter((q) => !!q.examTrick), [questions]);

  if (cards.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={HelpCircle}
            title="No flashcards here"
            message="Flashcards are built from questions that carry an exam tip. Try another exam track."
          />
          <Button label="Back to dashboard" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  const current = cards[index];

  const step = (delta: number) => {
    setIsFlipped(false);
    setIndex((i) => (i + delta + cards.length) % cards.length);
  };

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.iconButton}>
          <X size={18} color={colors.textFaint} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.counter}>
            Card <Text style={styles.counterStrong}>{index + 1}</Text> of {cards.length}
          </Text>
        </View>
        <View style={styles.iconButton} />
      </View>
      <View style={styles.progressWrap}>
        <ProgressBar value={((index + 1) / cards.length) * 100} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Pressable onPress={() => setIsFlipped((f) => !f)}>
          <Card tone={isFlipped ? 'warning' : 'default'} style={styles.card}>
            <View style={styles.cardHead}>
              <Badge
                label={isFlipped ? 'Exam tip' : 'Question'}
                tone={isFlipped ? 'warning' : 'primary'}
                icon={isFlipped ? Lightbulb : HelpCircle}
              />
              {!!(current.subject || current.exam) && (
                <Text style={styles.cardMeta} numberOfLines={1}>
                  {current.subject || current.exam}
                </Text>
              )}
            </View>

            {!isFlipped ? (
              <RichText inline style={styles.prompt}>
                {current.question}
              </RichText>
            ) : (
              <View style={styles.backFace}>
                <View style={styles.tipBox}>
                  <RichText style={styles.tipText}>{current.examTrick}</RichText>
                </View>
                <View style={styles.section}>
                  <Text style={styles.fieldLabel}>Explanation</Text>
                  <RichText>{current.explanation}</RichText>
                </View>
              </View>
            )}

            <View style={styles.tapHint}>
              <RotateCcw size={13} color={colors.textMuted} />
              <Text style={styles.tapHintText}>
                Tap to {isFlipped ? 'see the question' : 'reveal the tip'}
              </Text>
            </View>
          </Card>
        </Pressable>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Previous"
          icon={ArrowLeft}
          variant="secondary"
          onPress={() => step(-1)}
          style={styles.footerButton}
        />
        <Button label="Next" icon={ArrowRight} onPress={() => step(1)} style={styles.footerButton} />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  topBarCenter: { alignItems: 'center' },
  iconButton: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  counter: { fontSize: fontSize.base, color: colors.textFaint },
  counterStrong: { color: colors.textPrimary, fontWeight: '700' },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'] },
  card: { gap: spacing.lg, minHeight: 320 },
  cardHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: spacing.md,
  },
  cardMeta: { flex: 1, textAlign: 'right', fontSize: fontSize.xs, color: colors.textMuted },

  prompt: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 26,
  },

  backFace: { gap: spacing.lg },
  tipBox: {
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningSoftBorder,
    backgroundColor: colors.surface,
  },
  tipText: { fontSize: fontSize.md, color: colors.warningText, lineHeight: 21, fontWeight: '600' },
  section: { gap: spacing.sm },
  fieldLabel: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },

  tapHint: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    marginTop: 'auto',
    paddingTop: spacing.md,
  },
  tapHintText: { fontSize: fontSize.sm, color: colors.textMuted },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },
});

import React, { useMemo, useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  type StyleProp,
  type TextStyle,
  type ViewStyle,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  Bookmark,
  CheckCircle,
  HelpCircle,
  Lightbulb,
  Tag,
  X,
  XCircle,
} from 'lucide-react-native';
import { MobileQuestion, AnswerRecord } from '../types';
import { colors, fontSize, palette, radius, spacing, TAP_TARGET } from '../theme';
import { Badge, Button, Card, EmptyState, ProgressBar } from '../components/ui';
import RichText from '../components/RichText';

type Confidence = 'Guess' | 'Somewhat Sure' | 'Very Sure';

/**
 * Per-question state, mirroring the web's PracticeSession. Keeping a record
 * rather than a single "current answer" is what lets you move back through the
 * set and still see what you picked and why it was right.
 */
interface QuestionState {
  selected: string | null;
  confidence: Confidence;
  answered: boolean;
}

const DEFAULT_STATE: QuestionState = {
  selected: null,
  confidence: 'Very Sure',
  answered: false,
};

const CONFIDENCE_LEVELS: { level: Confidence; tint: string; border: string; text: string }[] = [
  { level: 'Guess', tint: colors.warningSoft, border: colors.warningSoftBorder, text: colors.warningText },
  { level: 'Somewhat Sure', tint: palette.blue50, border: palette.blue200, text: palette.blue700 },
  { level: 'Very Sure', tint: colors.successSoft, border: colors.successSoftBorder, text: colors.successText },
];

interface QuizScreenProps {
  questions: MobileQuestion[];
  bookmarkedIds: number[];
  onBack: () => void;
  onRecordAnswer: (record: AnswerRecord) => void;
  onToggleBookmark: (questionId: number) => void;
}

export const QuizScreen: React.FC<QuizScreenProps> = ({
  questions,
  bookmarkedIds,
  onBack,
  onRecordAnswer,
  onToggleBookmark,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [states, setStates] = useState<Record<number, QuestionState>>({});

  const answeredCount = useMemo(
    () => questions.reduce((n, _q, i) => (states[i]?.answered ? n + 1 : n), 0),
    [questions, states]
  );

  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.emptyWrap}>
          <EmptyState
            icon={HelpCircle}
            title="No questions found"
            message="This session has no questions. Pick another exam track and try again."
          />
          <Button label="Back to dashboard" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  const question = questions[currentIndex];
  const state = states[currentIndex] || DEFAULT_STATE;
  const isBookmarked = bookmarkedIds.includes(question.id);
  // The banks store `answer` as the full option text, so correctness is a text
  // comparison — matching the web. Comparing letters silently marked every
  // answer wrong.
  const isCorrect = state.selected === question.answer;

  const patch = (next: Partial<QuestionState>) =>
    setStates((prev) => ({
      ...prev,
      [currentIndex]: { ...(prev[currentIndex] || DEFAULT_STATE), ...next },
    }));

  const goTo = (index: number) => {
    if (index < 0 || index > questions.length - 1) return;
    setCurrentIndex(index);
  };

  const handleSubmit = () => {
    if (!state.selected || state.answered) return;
    patch({ answered: true });
    onRecordAnswer({
      questionId: question.id,
      userAnswer: state.selected,
      isCorrect: state.selected === question.answer,
      confidence: state.confidence,
      timestamp: new Date().toISOString(),
    });
  };

  const progress = Math.round((answeredCount / questions.length) * 100);

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      {/* Session bar */}
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.iconButton}>
          <X size={18} color={colors.textFaint} />
        </Pressable>
        <View style={styles.topBarCenter}>
          <Text style={styles.counter}>
            Question <Text style={styles.counterStrong}>{currentIndex + 1}</Text> of{' '}
            <Text style={styles.counterStrong}>{questions.length}</Text>
          </Text>
          <Text style={styles.counterMeta}>{answeredCount} answered</Text>
        </View>
        <Pressable onPress={() => onToggleBookmark(question.id)} hitSlop={8} style={styles.iconButton}>
          <Bookmark
            size={18}
            color={isBookmarked ? colors.primary : colors.textMuted}
            fill={isBookmarked ? colors.primary : 'transparent'}
          />
        </Pressable>
      </View>
      <View style={styles.progressWrap}>
        <ProgressBar value={progress} />
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          {/* Difficulty, source, importance — the web's badge row */}
          <View style={styles.badgeRow}>
            <Badge
              label={question.difficulty || 'Medium'}
              tone={
                question.difficulty === 'Easy'
                  ? 'success'
                  : question.difficulty === 'Hard'
                    ? 'danger'
                    : 'primary'
              }
            />
            {!!question.source && <Badge label={question.source} />}
            {question.importance === 'High' && <Badge label="High priority" tone="warning" />}
          </View>

          <RichText inline style={styles.questionText}>
            {question.question}
          </RichText>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const selected = state.selected === option;
              const correctOption = option === question.answer;

              // Style arrays rather than object spreads: spreading narrows each
              // hex to a literal type and RN rejects the merge.
              const cardStyle: StyleProp<ViewStyle>[] = [styles.option];
              const chipStyle: StyleProp<ViewStyle>[] = [styles.optionChip];
              const chipTextStyle: StyleProp<TextStyle>[] = [styles.optionChipText];

              if (state.answered) {
                if (correctOption) {
                  cardStyle.push(styles.optionCorrect);
                  chipStyle.push(styles.chipCorrect);
                  chipTextStyle.push(styles.chipTextOn);
                } else if (selected) {
                  cardStyle.push(styles.optionWrong);
                  chipStyle.push(styles.chipWrong);
                  chipTextStyle.push(styles.chipTextOn);
                } else {
                  cardStyle.push(styles.optionMuted);
                }
              } else if (selected) {
                cardStyle.push(styles.optionSelected);
                chipStyle.push(styles.chipSelected);
                chipTextStyle.push(styles.chipTextOn);
              }

              return (
                <Pressable
                  key={`${letter}-${index}`}
                  onPress={() => !state.answered && patch({ selected: option })}
                  disabled={state.answered}
                  style={({ pressed }) => [...cardStyle, pressed && !state.answered && styles.pressed]}
                >
                  <View style={chipStyle}>
                    <Text style={chipTextStyle}>{letter}</Text>
                  </View>
                  <RichText inline style={styles.optionText}>
                    {option}
                  </RichText>
                </Pressable>
              );
            })}
          </View>

          {!state.answered && (
            <View style={styles.confidenceBlock}>
              <Text style={styles.fieldLabel}>How confident are you?</Text>
              <View style={styles.confidenceRow}>
                {CONFIDENCE_LEVELS.map((item) => {
                  const active = state.confidence === item.level;
                  return (
                    <Pressable
                      key={item.level}
                      onPress={() => patch({ confidence: item.level })}
                      style={[
                        styles.confidenceButton,
                        active && { backgroundColor: item.tint, borderColor: item.border },
                      ]}
                    >
                      <Text
                        style={[
                          styles.confidenceText,
                          active && { color: item.text, fontWeight: '700' },
                        ]}
                      >
                        {item.level}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Button
                label="Submit answer"
                onPress={handleSubmit}
                disabled={!state.selected}
                fullWidth
              />
            </View>
          )}
        </Card>

        {state.answered && (
          <Card tone="muted" style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <View style={[styles.reviewIcon, isCorrect ? styles.iconOk : styles.iconBad]}>
                {isCorrect ? (
                  <CheckCircle size={22} color={palette.white} />
                ) : (
                  <XCircle size={22} color={palette.white} />
                )}
              </View>
              <View style={styles.flex}>
                <Text style={[styles.reviewTitle, isCorrect ? styles.okText : styles.badText]}>
                  {isCorrect ? 'Correct!' : 'Incorrect'}
                </Text>
                <Text style={styles.reviewMeta}>
                  Answered with {state.confidence.toLowerCase()} confidence.
                </Text>
              </View>
            </View>

            {!isCorrect && (
              <View style={styles.correctAnswerBox}>
                <Text style={styles.fieldLabel}>Correct answer</Text>
                <RichText inline style={styles.correctAnswerText}>
                  {question.answer}
                </RichText>
              </View>
            )}

            <View style={styles.section}>
              <Text style={styles.fieldLabel}>Explanation</Text>
              <View style={styles.explanationBox}>
                <RichText>{question.explanation}</RichText>
              </View>
            </View>

            {!!question.examTrick && (
              <View style={styles.trickBox}>
                <Lightbulb size={18} color={colors.warning} />
                <View style={styles.flex}>
                  <Text style={styles.trickTitle}>Exam tip</Text>
                  <RichText style={styles.trickText}>{question.examTrick}</RichText>
                </View>
              </View>
            )}

            {question.tags?.length > 0 && (
              <View style={styles.section}>
                <Text style={styles.fieldLabel}>Topics</Text>
                <View style={styles.tagRow}>
                  {question.tags.slice(0, 6).map((tag) => (
                    <Badge key={tag} label={tag} tone="primary" icon={Tag} />
                  ))}
                </View>
              </View>
            )}
          </Card>
        )}
      </ScrollView>

      {/* Footer nav — always reachable, matching the web's sticky action row. */}
      <View style={styles.footer}>
        <Button
          label="Previous"
          icon={ArrowLeft}
          variant="secondary"
          onPress={() => goTo(currentIndex - 1)}
          disabled={currentIndex === 0}
          style={styles.footerButton}
        />
        <Button
          label={currentIndex === questions.length - 1 ? 'Finish' : 'Next'}
          icon={ArrowRight}
          onPress={() => (currentIndex === questions.length - 1 ? onBack() : goTo(currentIndex + 1))}
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  flex: { flex: 1 },
  pressed: { opacity: 0.85 },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
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
  counterMeta: { fontSize: fontSize.xs, color: colors.textMuted, marginTop: 1 },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },

  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  questionText: {
    fontSize: fontSize.xl,
    fontWeight: '700',
    color: colors.textPrimary,
    lineHeight: 25,
  },

  options: { gap: spacing.md, marginTop: spacing.xl },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  optionSelected: { borderColor: colors.primary, backgroundColor: colors.primarySoft },
  optionCorrect: { borderColor: colors.success, backgroundColor: colors.successSoft },
  optionWrong: { borderColor: colors.danger, backgroundColor: colors.dangerSoft },
  optionMuted: { opacity: 0.55 },
  optionChip: {
    width: 30,
    height: 30,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surfaceMuted,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  chipCorrect: { backgroundColor: colors.success, borderColor: colors.success },
  chipWrong: { backgroundColor: colors.danger, borderColor: colors.danger },
  optionChipText: { fontSize: fontSize.base, fontWeight: '700', color: colors.textFaint },
  chipTextOn: { color: palette.white },
  optionText: {
    flex: 1,
    fontSize: fontSize.md,
    color: colors.textBody,
    lineHeight: 20,
  },

  confidenceBlock: {
    marginTop: spacing.xl,
    paddingTop: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    gap: spacing.md,
  },
  fieldLabel: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
  },
  confidenceRow: { flexDirection: 'row', gap: spacing.sm },
  confidenceButton: {
    flex: 1,
    minHeight: TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  confidenceText: {
    fontSize: fontSize.sm,
    fontWeight: '600',
    color: colors.textMuted,
    textAlign: 'center',
  },

  reviewCard: { gap: spacing.lg },
  reviewHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.md },
  reviewIcon: {
    width: 42,
    height: 42,
    borderRadius: radius.lg,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconOk: { backgroundColor: colors.success },
  iconBad: { backgroundColor: colors.danger },
  reviewTitle: { fontSize: fontSize.xl, fontWeight: '700' },
  okText: { color: colors.successText },
  badText: { color: colors.dangerText },
  reviewMeta: { fontSize: fontSize.sm, color: colors.textMuted, marginTop: 1 },

  correctAnswerBox: {
    gap: spacing.xs,
    padding: spacing.md,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.successSoftBorder,
    backgroundColor: colors.successSoft,
  },
  correctAnswerText: {
    fontSize: fontSize.md,
    fontWeight: '600',
    color: colors.successText,
    lineHeight: 20,
  },

  section: { gap: spacing.sm },
  explanationBox: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.lg,
    padding: spacing.lg,
  },

  trickBox: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningSoftBorder,
    backgroundColor: colors.warningSoft,
  },
  trickTitle: {
    fontSize: fontSize.sm,
    fontWeight: '700',
    color: colors.warningText,
    marginBottom: 2,
  },
  trickText: { fontSize: fontSize.sm, color: colors.warningText, lineHeight: 18 },

  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.sm },

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

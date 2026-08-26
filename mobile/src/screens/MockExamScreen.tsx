import React, { useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  Clock,
  Flag,
  X,
  XCircle,
} from 'lucide-react-native';
import { MobileQuestion } from '../types';
import { colors, fontSize, palette, radius, spacing, TAP_TARGET } from '../theme';
import { Badge, Button, Card, ProgressBar, StatTile } from '../components/ui';
import RichText from '../components/RichText';

const EXAM_SIZE = 30;
const EXAM_SECONDS = 30 * 60;
const PASS_MARK = 70;

interface MockExamScreenProps {
  questions: MobileQuestion[];
  onBack: () => void;
  onFinishExam: (score: number, total: number) => void;
}

export const MockExamScreen: React.FC<MockExamScreenProps> = ({
  questions,
  onBack,
  onFinishExam,
}) => {
  const examPool = useMemo(() => questions.slice(0, EXAM_SIZE), [questions]);
  const [currentIndex, setCurrentIndex] = useState(0);
  /** Index -> chosen option text. Text, not letter: the banks key answers by text. */
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(EXAM_SECONDS);
  const [isCompleted, setIsCompleted] = useState(false);
  const [showPalette, setShowPalette] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setIsCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const score = useMemo(
    () => examPool.reduce((n, q, idx) => (answers[idx] === q.answer ? n + 1 : n), 0),
    [examPool, answers]
  );

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // -------------------------------------------------------------- results
  if (isCompleted) {
    const pct = examPool.length ? Math.round((score / examPool.length) * 100) : 0;
    const passed = pct >= PASS_MARK;

    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Card style={styles.resultHero}>
            <Text style={styles.resultEyebrow}>Mock exam complete</Text>
            <Text style={[styles.resultPct, passed ? styles.okText : styles.badText]}>{pct}%</Text>
            <Text style={styles.resultFraction}>
              {score} of {examPool.length} correct
            </Text>
            <Badge
              label={passed ? `Passed — ${PASS_MARK}% needed` : `Below the ${PASS_MARK}% pass mark`}
              tone={passed ? 'success' : 'danger'}
              style={styles.resultBadge}
            />
          </Card>

          <View style={styles.statRow}>
            <StatTile value={score} label="Correct" color={colors.successStrong} />
            <StatTile
              value={Object.keys(answers).length - score}
              label="Incorrect"
              color={colors.dangerStrong}
            />
            <StatTile value={examPool.length - Object.keys(answers).length} label="Skipped" />
          </View>

          <Text style={styles.sectionHeading}>Question review</Text>

          {examPool.map((q, idx) => {
            const userAnswer = answers[idx];
            const correct = userAnswer === q.answer;
            return (
              <Card key={`${q.id}-${idx}`} style={styles.reviewItem}>
                <View style={styles.reviewTop}>
                  <Text style={styles.reviewIndex}>Q{idx + 1}</Text>
                  <Badge
                    label={correct ? 'Correct' : userAnswer ? 'Incorrect' : 'Skipped'}
                    tone={correct ? 'success' : userAnswer ? 'danger' : 'neutral'}
                  />
                </View>
                <RichText inline style={styles.reviewQuestion}>
                  {q.question}
                </RichText>
                {!correct && (
                  <View style={styles.reviewAnswers}>
                    {!!userAnswer && (
                      <Text style={styles.reviewWrong} numberOfLines={2}>
                        Your answer: {userAnswer}
                      </Text>
                    )}
                    <Text style={styles.reviewCorrect} numberOfLines={3}>
                      Correct: {q.answer}
                    </Text>
                  </View>
                )}
              </Card>
            );
          })}

          <Button
            label="Return to dashboard"
            fullWidth
            onPress={() => {
              onFinishExam(score, examPool.length);
              onBack();
            }}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ------------------------------------------------------------ simulator
  const question = examPool[currentIndex];
  const answeredCount = Object.keys(answers).length;
  const lowTime = secondsRemaining <= 60;

  if (!question) {
    return (
      <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
        <View style={styles.emptyWrap}>
          <Text style={styles.emptyText}>No questions available for this mock.</Text>
          <Button label="Back to dashboard" onPress={onBack} />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.screen} edges={['top', 'left', 'right']}>
      <View style={styles.topBar}>
        <Pressable onPress={onBack} hitSlop={8} style={styles.iconButton}>
          <X size={18} color={colors.textFaint} />
        </Pressable>

        <View style={[styles.timer, lowTime && styles.timerLow]}>
          <Clock size={14} color={lowTime ? colors.dangerText : colors.textPrimary} />
          <Text style={[styles.timerText, lowTime && styles.timerTextLow]}>
            {formatTime(secondsRemaining)}
          </Text>
        </View>

        <Pressable onPress={() => setIsCompleted(true)} hitSlop={8} style={styles.finishButton}>
          <Text style={styles.finishText}>Submit</Text>
        </Pressable>
      </View>

      <View style={styles.metaBar}>
        <Text style={styles.metaText}>
          Question <Text style={styles.metaStrong}>{currentIndex + 1}</Text> of {examPool.length}
          {'  ·  '}
          {answeredCount} answered
        </Text>
        <Pressable onPress={() => setShowPalette((p) => !p)} hitSlop={8}>
          <Text style={styles.paletteToggle}>{showPalette ? 'Hide palette' : 'Palette'}</Text>
        </Pressable>
      </View>
      <View style={styles.progressWrap}>
        <ProgressBar value={(answeredCount / examPool.length) * 100} />
      </View>

      {showPalette && (
        <View style={styles.palette}>
          {examPool.map((_q, idx) => {
            const answered = answers[idx] !== undefined;
            const isFlagged = flagged[idx];
            return (
              <Pressable
                key={idx}
                onPress={() => {
                  setCurrentIndex(idx);
                  setShowPalette(false);
                }}
                style={[
                  styles.paletteCell,
                  answered && styles.paletteAnswered,
                  isFlagged && styles.paletteFlagged,
                  idx === currentIndex && styles.paletteCurrent,
                ]}
              >
                <Text style={[styles.paletteText, answered && styles.paletteTextOn]}>{idx + 1}</Text>
              </Pressable>
            );
          })}
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <Card>
          <View style={styles.questionHead}>
            <Badge label={question.difficulty || 'Medium'} tone="primary" />
            <Pressable
              onPress={() => setFlagged((f) => ({ ...f, [currentIndex]: !f[currentIndex] }))}
              hitSlop={8}
              style={styles.flagButton}
            >
              <Flag
                size={15}
                color={flagged[currentIndex] ? colors.warning : colors.textMuted}
                fill={flagged[currentIndex] ? colors.warning : 'transparent'}
              />
              <Text style={styles.flagText}>
                {flagged[currentIndex] ? 'Flagged' : 'Flag for review'}
              </Text>
            </Pressable>
          </View>

          <RichText inline style={styles.questionText}>
            {question.question}
          </RichText>

          <View style={styles.options}>
            {question.options.map((option, index) => {
              const letter = String.fromCharCode(65 + index);
              const selected = answers[currentIndex] === option;
              return (
                <Pressable
                  key={`${letter}-${index}`}
                  onPress={() => setAnswers((prev) => ({ ...prev, [currentIndex]: option }))}
                  style={({ pressed }) => [
                    styles.option,
                    selected && styles.optionSelected,
                    pressed && styles.pressed,
                  ]}
                >
                  <View style={[styles.optionChip, selected && styles.optionChipSelected]}>
                    <Text style={[styles.optionChipText, selected && styles.optionChipTextOn]}>
                      {letter}
                    </Text>
                  </View>
                  <RichText inline style={styles.optionText}>
                    {option}
                  </RichText>
                </Pressable>
              );
            })}
          </View>

          {/* Answers stay hidden until submission — this is an exam, not practice. */}
          <Text style={styles.examNote}>
            Explanations stay hidden until you submit the exam.
          </Text>
        </Card>
      </ScrollView>

      <View style={styles.footer}>
        <Button
          label="Previous"
          icon={ArrowLeft}
          variant="secondary"
          onPress={() => setCurrentIndex((i) => Math.max(0, i - 1))}
          disabled={currentIndex === 0}
          style={styles.footerButton}
        />
        <Button
          label={currentIndex === examPool.length - 1 ? 'Submit exam' : 'Next'}
          icon={currentIndex === examPool.length - 1 ? CheckCircle : ArrowRight}
          onPress={() =>
            currentIndex === examPool.length - 1
              ? setIsCompleted(true)
              : setCurrentIndex((i) => Math.min(examPool.length - 1, i + 1))
          }
          style={styles.footerButton}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.background },
  pressed: { opacity: 0.85 },
  scroll: { padding: spacing.lg, paddingBottom: spacing['3xl'], gap: spacing.lg },
  emptyWrap: { flex: 1, justifyContent: 'center', padding: spacing.lg, gap: spacing.lg },
  emptyText: { fontSize: fontSize.md, color: colors.textMuted, textAlign: 'center' },

  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    backgroundColor: colors.surface,
  },
  iconButton: {
    width: TAP_TARGET,
    height: TAP_TARGET,
    alignItems: 'center',
    justifyContent: 'center',
  },
  timer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surfaceMuted,
  },
  timerLow: { borderColor: colors.dangerSoftBorder, backgroundColor: colors.dangerSoft },
  timerText: {
    fontSize: fontSize.lg,
    fontWeight: '700',
    color: colors.textPrimary,
    fontVariant: ['tabular-nums'],
  },
  timerTextLow: { color: colors.dangerText },
  finishButton: {
    minHeight: TAP_TARGET,
    justifyContent: 'center',
    paddingHorizontal: spacing.sm,
  },
  finishText: { fontSize: fontSize.base, fontWeight: '700', color: colors.primary },

  metaBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.sm,
    backgroundColor: colors.surface,
  },
  metaText: { fontSize: fontSize.sm, color: colors.textMuted },
  metaStrong: { color: colors.textPrimary, fontWeight: '700' },
  paletteToggle: { fontSize: fontSize.sm, fontWeight: '700', color: colors.primary },
  progressWrap: {
    paddingHorizontal: spacing.lg,
    paddingBottom: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },

  palette: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  paletteCell: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.borderStrong,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  paletteAnswered: { backgroundColor: colors.primary, borderColor: colors.primary },
  paletteFlagged: { borderColor: colors.warning, borderWidth: 2 },
  paletteCurrent: { borderColor: colors.textPrimary, borderWidth: 2 },
  paletteText: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textFaint },
  paletteTextOn: { color: palette.white },

  questionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.lg,
  },
  flagButton: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs },
  flagText: { fontSize: fontSize.sm, fontWeight: '600', color: colors.textMuted },
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
  optionChipSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  optionChipText: { fontSize: fontSize.base, fontWeight: '700', color: colors.textFaint },
  optionChipTextOn: { color: palette.white },
  optionText: { flex: 1, fontSize: fontSize.md, color: colors.textBody, lineHeight: 20 },

  examNote: {
    marginTop: spacing.lg,
    fontSize: fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },

  footer: {
    flexDirection: 'row',
    gap: spacing.md,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.surface,
  },
  footerButton: { flex: 1 },

  resultHero: { alignItems: 'center', gap: spacing.xs, paddingVertical: spacing['2xl'] },
  resultEyebrow: {
    fontSize: fontSize['2xs'],
    fontWeight: '700',
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    color: colors.textMuted,
  },
  resultPct: { fontSize: 52, fontWeight: '800', letterSpacing: -1 },
  okText: { color: colors.successStrong },
  badText: { color: colors.dangerStrong },
  resultFraction: { fontSize: fontSize.md, color: colors.textMuted },
  resultBadge: { marginTop: spacing.sm },

  statRow: { flexDirection: 'row', gap: spacing.md },
  sectionHeading: { fontSize: fontSize.base, fontWeight: '700', color: colors.textPrimary },

  reviewItem: { gap: spacing.sm },
  reviewTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  reviewIndex: { fontSize: fontSize.sm, fontWeight: '700', color: colors.textMuted },
  reviewQuestion: { fontSize: fontSize.md, color: colors.textPrimary, lineHeight: 20 },
  reviewAnswers: { gap: spacing.xs },
  reviewWrong: { fontSize: fontSize.sm, color: colors.dangerText },
  reviewCorrect: { fontSize: fontSize.sm, color: colors.successText, fontWeight: '600' },
});

import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Alert
} from 'react-native';
import { MobileQuestion, AnswerRecord } from '../types';

interface MockExamScreenProps {
  questions: MobileQuestion[];
  onBack: () => void;
  onFinishExam: (score: number, total: number) => void;
}

export const MockExamScreen: React.FC<MockExamScreenProps> = ({
  questions,
  onBack,
  onFinishExam
}) => {
  const examPool = questions.slice(0, 30); // 30 questions timed mock
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [secondsRemaining, setSecondsRemaining] = useState(30 * 60); // 30 mins
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleAutoSubmit = () => {
    setIsCompleted(true);
  };

  const handleSelectOption = (letter: string) => {
    if (isCompleted) return;
    setAnswers(prev => ({
      ...prev,
      [currentIndex]: letter
    }));
  };

  const currentQ = examPool[currentIndex];

  const calculateScore = () => {
    let score = 0;
    examPool.forEach((q, idx) => {
      if (answers[idx]?.toUpperCase() === q.answer.toUpperCase()) {
        score += 1;
      }
    });
    return score;
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (isCompleted) {
    const score = calculateScore();
    const pct = Math.round((score / examPool.length) * 100);

    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.resultContainer}>
          <Text style={styles.resultTitle}>Mock Exam Complete</Text>
          <View style={styles.scoreCircle}>
            <Text style={styles.scorePct}>{pct}%</Text>
            <Text style={styles.scoreFraction}>{score} / {examPool.length}</Text>
          </View>

          <View style={styles.statusBadge}>
            <Text style={styles.statusText}>
              {pct >= 70 ? '🎉 PASSED CERTIFICATION' : '📚 NEEDS REVISION (Passing is 70%)'}
            </Text>
          </View>

          <ScrollView style={styles.resultBreakdown} showsVerticalScrollIndicator={false}>
            {examPool.map((q, idx) => {
              const userAns = answers[idx];
              const isCorrect = userAns?.toUpperCase() === q.answer.toUpperCase();
              return (
                <View key={q.id} style={styles.resultItem}>
                  <Text style={styles.resultItemQ}>
                    Q{idx + 1}: {q.question.slice(0, 75)}...
                  </Text>
                  <Text style={[styles.resultItemAns, { color: isCorrect ? '#34D399' : '#F87171' }]}>
                    Your: {userAns || 'Skipped'} | Key: {q.answer}
                  </Text>
                </View>
              );
            })}
          </ScrollView>

          <TouchableOpacity
            style={styles.doneBtn}
            onPress={() => {
              onFinishExam(score, examPool.length);
              onBack();
            }}
          >
            <Text style={styles.doneBtnText}>Return to Main Menu</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header with Timer */}
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>

        <View style={styles.timerBadge}>
          <Text style={styles.timerText}>⏳ {formatTime(secondsRemaining)}</Text>
        </View>

        <TouchableOpacity
          onPress={() => setIsCompleted(true)}
          style={styles.submitBtn}
        >
          <Text style={styles.submitBtnText}>Finish</Text>
        </TouchableOpacity>
      </View>

      {/* Question Selector Palette Bar */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.paletteBar}>
        {examPool.map((_, idx) => {
          const isAnswered = answers[idx] !== undefined;
          const isCurrent = idx === currentIndex;
          return (
            <TouchableOpacity
              key={idx}
              style={[
                styles.palettePill,
                isAnswered && styles.palettePillAnswered,
                isCurrent && styles.palettePillCurrent
              ]}
              onPress={() => setCurrentIndex(idx)}
            >
              <Text
                style={[
                  styles.palettePillText,
                  (isAnswered || isCurrent) && styles.palettePillTextActive
                ]}
              >
                {idx + 1}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Main Question View */}
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.qNum}>Question {currentIndex + 1} of {examPool.length}</Text>
        <Text style={styles.qText}>{currentQ.question}</Text>

        <View style={styles.optionsList}>
          {currentQ.options.map((opt, oIdx) => {
            const letter = String.fromCharCode(65 + oIdx);
            const isSelected = answers[currentIndex] === letter;
            return (
              <TouchableOpacity
                key={letter}
                style={[styles.optCard, isSelected && styles.optCardSelected]}
                onPress={() => handleSelectOption(letter)}
                activeOpacity={0.8}
              >
                <View style={[styles.optLetter, isSelected && styles.optLetterSelected]}>
                  <Text style={styles.optLetterText}>{letter}</Text>
                </View>
                <Text style={[styles.optText, isSelected && styles.optTextSelected]}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.navBtn, currentIndex === 0 && styles.navBtnDisabled]}
          onPress={() => currentIndex > 0 && setCurrentIndex(currentIndex - 1)}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navBtnText}>← Previous</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navBtn, styles.navBtnPrimary]}
          onPress={() => {
            if (currentIndex < examPool.length - 1) {
              setCurrentIndex(currentIndex + 1);
            } else {
              setIsCompleted(true);
            }
          }}
        >
          <Text style={[styles.navBtnText, styles.navBtnPrimaryText]}>
            {currentIndex === examPool.length - 1 ? 'Submit Exam' : 'Next →'}
          </Text>
        </TouchableOpacity>
      </View>
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
  timerBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },
  timerText: {
    color: '#38BDF8',
    fontWeight: '800',
    fontSize: 14,
  },
  submitBtn: {
    backgroundColor: '#10B981',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  paletteBar: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    maxHeight: 50,
  },
  palettePill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  palettePillAnswered: {
    backgroundColor: '#0284C7',
  },
  palettePillCurrent: {
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  palettePillText: {
    color: '#94A3B8',
    fontSize: 12,
    fontWeight: '600',
  },
  palettePillTextActive: {
    color: '#FFFFFF',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  qNum: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  qText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsList: {
    gap: 12,
  },
  optCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optCardSelected: {
    borderColor: '#38BDF8',
    backgroundColor: '#0C4A6E',
  },
  optLetter: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  optLetterSelected: {
    backgroundColor: '#38BDF8',
  },
  optLetterText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  optText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 14,
  },
  optTextSelected: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  footerBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  navBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  navBtnDisabled: {
    opacity: 0.4,
  },
  navBtnPrimary: {
    backgroundColor: '#0284C7',
  },
  navBtnText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 14,
  },
  navBtnPrimaryText: {
    color: '#FFFFFF',
  },
  resultContainer: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  resultTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 20,
  },
  scoreCircle: {
    width: 130,
    height: 130,
    borderRadius: 65,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#38BDF8',
    marginBottom: 16,
  },
  scorePct: {
    fontSize: 32,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  scoreFraction: {
    fontSize: 13,
    color: '#94A3B8',
  },
  statusBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 20,
  },
  statusText: {
    color: '#38BDF8',
    fontWeight: '700',
    fontSize: 13,
  },
  resultBreakdown: {
    flex: 1,
    width: '100%',
    marginBottom: 20,
  },
  resultItem: {
    backgroundColor: '#1E293B',
    padding: 12,
    borderRadius: 8,
    marginBottom: 8,
  },
  resultItemQ: {
    color: '#E2E8F0',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 4,
  },
  resultItemAns: {
    fontSize: 12,
    fontWeight: '700',
  },
  doneBtn: {
    width: '100%',
    backgroundColor: '#38BDF8',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  doneBtnText: {
    color: '#0F172A',
    fontWeight: '800',
    fontSize: 15,
  },
});

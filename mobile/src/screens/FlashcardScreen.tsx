import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView
} from 'react-native';
import { MobileQuestion } from '../types';

interface FlashcardScreenProps {
  questions: MobileQuestion[];
  onBack: () => void;
}

export const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ questions, onBack }) => {
  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const trickQuestions = questions.filter(q => !!q.examTrick);

  if (trickQuestions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No flashcards found in this question set.</Text>
          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>Return Home</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const current = trickQuestions[index];

  const handleNext = () => {
    setIsFlipped(false);
    if (index < trickQuestions.length - 1) {
      setIndex(index + 1);
    } else {
      setIndex(0);
    }
  };

  const handlePrev = () => {
    setIsFlipped(false);
    if (index > 0) {
      setIndex(index - 1);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counterText}>
          Flashcard {index + 1} of {trickQuestions.length}
        </Text>
        <View style={{ width: 36 }} />
      </View>

      <View style={styles.cardWrapper}>
        <TouchableOpacity
          style={[styles.card, isFlipped ? styles.cardBack : styles.cardFront]}
          onPress={() => setIsFlipped(!isFlipped)}
          activeOpacity={0.9}
        >
          <View style={styles.cardHeader}>
            <Text style={styles.cardBadge}>
              {isFlipped ? '💡 EXAM TRICK & SOLUTION' : '❓ CONCEPT & QUESTION'}
            </Text>
            <Text style={styles.cardSubject}>{current.subject || current.exam}</Text>
          </View>

          <View style={styles.cardBody}>
            {!isFlipped ? (
              <Text style={styles.questionPrompt}>{current.question}</Text>
            ) : (
              <View>
                <View style={styles.trickHighlight}>
                  <Text style={styles.trickHighlightLabel}>⚡ 30-Second Shortcut</Text>
                  <Text style={styles.trickHighlightText}>{current.examTrick}</Text>
                </View>
                <Text style={styles.solutionText}>{current.explanation}</Text>
              </View>
            )}
          </View>

          <View style={styles.cardFooter}>
            <Text style={styles.tapPrompt}>
              Tap card to {isFlipped ? 'flip back to question' : 'reveal 30-sec trick'} ↻
            </Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* Control Buttons */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.actionBtn, index === 0 && styles.actionBtnDisabled]}
          onPress={handlePrev}
          disabled={index === 0}
        >
          <Text style={styles.actionBtnText}>← Previous</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, styles.actionBtnPrimary]}
          onPress={handleNext}
        >
          <Text style={[styles.actionBtnText, styles.actionBtnPrimaryText]}>
            Next Card →
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
  counterText: {
    color: '#94A3B8',
    fontSize: 14,
    fontWeight: '600',
  },
  cardWrapper: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    minHeight: 380,
    borderRadius: 20,
    padding: 24,
    justifyContent: 'space-between',
    borderWidth: 1,
  },
  cardFront: {
    backgroundColor: '#1E293B',
    borderColor: '#334155',
  },
  cardBack: {
    backgroundColor: '#172554',
    borderColor: '#3B82F6',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 12,
  },
  cardBadge: {
    fontSize: 11,
    fontWeight: '800',
    color: '#38BDF8',
    letterSpacing: 0.8,
  },
  cardSubject: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  cardBody: {
    flex: 1,
    justifyContent: 'center',
    marginVertical: 16,
  },
  questionPrompt: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    lineHeight: 26,
  },
  trickHighlight: {
    backgroundColor: 'rgba(245, 158, 11, 0.15)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 14,
    borderRadius: 8,
    marginBottom: 14,
  },
  trickHighlightLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FBBF24',
    marginBottom: 4,
  },
  trickHighlightText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FEF3C7',
    lineHeight: 20,
  },
  solutionText: {
    fontSize: 13,
    color: '#E2E8F0',
    lineHeight: 20,
  },
  cardFooter: {
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 12,
  },
  tapPrompt: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  footerBar: {
    flexDirection: 'row',
    padding: 16,
    gap: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  actionBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 12,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  actionBtnDisabled: {
    opacity: 0.4,
  },
  actionBtnPrimary: {
    backgroundColor: '#6366F1',
  },
  actionBtnText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 14,
  },
  actionBtnPrimaryText: {
    color: '#FFFFFF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyText: {
    color: '#94A3B8',
    fontSize: 16,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

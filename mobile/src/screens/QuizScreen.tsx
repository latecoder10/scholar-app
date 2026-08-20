import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { MobileQuestion, AnswerRecord } from '../types';

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
  onToggleBookmark
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [confidence, setConfidence] = useState<'Guess' | 'Somewhat Sure' | 'Very Sure'>('Very Sure');
  const [showTrick, setShowTrick] = useState(false);

  if (!questions || questions.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>No questions available in this pool.</Text>
          <TouchableOpacity style={styles.buttonPrimary} onPress={onBack}>
            <Text style={styles.buttonPrimaryText}>Return to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const currentQ = questions[currentIndex];
  const isBookmarked = bookmarkedIds.includes(currentQ.id);

  const handleSubmit = (optionLetter: string) => {
    if (isSubmitted) return;
    setSelectedOption(optionLetter);
    setIsSubmitted(true);
    const isCorrect = optionLetter.toUpperCase() === currentQ.answer.toUpperCase();
    onRecordAnswer({
      questionId: currentQ.id,
      userAnswer: optionLetter,
      isCorrect,
      confidence,
      timestamp: new Date().toISOString()
    });
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowTrick(false);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedOption(null);
      setIsSubmitted(false);
      setShowTrick(false);
    }
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.counterText}>
          {currentIndex + 1} / {questions.length}
        </Text>
        <TouchableOpacity
          onPress={() => onToggleBookmark(currentQ.id)}
          style={styles.iconButton}
        >
          <Text style={styles.iconButtonText}>{isBookmarked ? '★' : '☆'}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Badges */}
        <View style={styles.tagsRow}>
          <View style={[styles.badge, { backgroundColor: '#1E293B' }]}>
            <Text style={styles.badgeText}>{currentQ.difficulty || 'Medium'}</Text>
          </View>
          {currentQ.exam && (
            <View style={[styles.badge, { backgroundColor: '#0284C7' }]}>
              <Text style={styles.badgeText}>{currentQ.exam}</Text>
            </View>
          )}
        </View>

        {/* Question Text */}
        <Text style={styles.questionText}>{currentQ.question}</Text>

        {/* Options */}
        <View style={styles.optionsContainer}>
          {currentQ.options.map((opt, index) => {
            const letter = optionLetters[index] || String.fromCharCode(65 + index);
            const isSelected = selectedOption === letter;
            const isCorrectOption = letter.toUpperCase() === currentQ.answer.toUpperCase();

            let optionStyle = styles.optionCard;
            let textStyle = styles.optionText;

            if (isSubmitted) {
              if (isCorrectOption) {
                optionStyle = { ...styles.optionCard, ...styles.optionCorrect };
                textStyle = { ...styles.optionText, ...styles.optionCorrectText };
              } else if (isSelected && !isCorrectOption) {
                optionStyle = { ...styles.optionCard, ...styles.optionWrong };
                textStyle = { ...styles.optionText, ...styles.optionWrongText };
              }
            } else if (isSelected) {
              optionStyle = { ...styles.optionCard, ...styles.optionSelected };
            }

            return (
              <TouchableOpacity
                key={letter}
                style={optionStyle}
                onPress={() => handleSubmit(letter)}
                activeOpacity={0.8}
                disabled={isSubmitted}
              >
                <View style={styles.letterCircle}>
                  <Text style={styles.letterText}>{letter}</Text>
                </View>
                <Text style={textStyle}>{opt}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Post-submission Review Details */}
        {isSubmitted && (
          <View style={styles.reviewCard}>
            <View style={styles.reviewHeader}>
              <Text style={styles.reviewTitle}>
                {selectedOption?.toUpperCase() === currentQ.answer.toUpperCase()
                  ? '✅ Correct'
                  : '❌ Incorrect (Correct: Option ' + currentQ.answer + ')'}
              </Text>
            </View>

            <Text style={styles.explanationText}>{currentQ.explanation}</Text>

            {currentQ.examTrick && (
              <TouchableOpacity
                style={styles.trickBox}
                onPress={() => setShowTrick(!showTrick)}
                activeOpacity={0.8}
              >
                <Text style={styles.trickHeader}>💡 30-Second Exam Trick (Tap to {showTrick ? 'Hide' : 'View'})</Text>
                {showTrick && <Text style={styles.trickContent}>{currentQ.examTrick}</Text>}
              </TouchableOpacity>
            )}
          </View>
        )}
      </ScrollView>

      {/* Footer Navigation */}
      <View style={styles.footerBar}>
        <TouchableOpacity
          style={[styles.navButton, currentIndex === 0 && styles.navButtonDisabled]}
          onPress={handlePrev}
          disabled={currentIndex === 0}
        >
          <Text style={styles.navButtonText}>← Prev</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.navButton, styles.navButtonPrimary, currentIndex === questions.length - 1 && styles.navButtonDisabled]}
          onPress={handleNext}
          disabled={currentIndex === questions.length - 1}
        >
          <Text style={[styles.navButtonText, styles.navButtonPrimaryText]}>
            {currentIndex === questions.length - 1 ? 'End of Pool' : 'Next →'}
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  tagsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  questionText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 24,
    marginBottom: 20,
  },
  optionsContainer: {
    gap: 12,
    marginBottom: 20,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#334155',
  },
  optionSelected: {
    borderColor: '#3B82F6',
    backgroundColor: '#1E3A8A',
  },
  optionCorrect: {
    borderColor: '#10B981',
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
  },
  optionWrong: {
    borderColor: '#EF4444',
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
  },
  letterCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#334155',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  letterText: {
    color: '#F8FAFC',
    fontWeight: '700',
    fontSize: 13,
  },
  optionText: {
    flex: 1,
    color: '#E2E8F0',
    fontSize: 14,
    lineHeight: 20,
  },
  optionCorrectText: {
    color: '#34D399',
    fontWeight: '600',
  },
  optionWrongText: {
    color: '#F87171',
  },
  reviewCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#334155',
    marginTop: 10,
  },
  reviewHeader: {
    marginBottom: 10,
  },
  reviewTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#F8FAFC',
  },
  explanationText: {
    color: '#CBD5E1',
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  trickBox: {
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#F59E0B',
    padding: 12,
    borderRadius: 8,
  },
  trickHeader: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FBBF24',
    marginBottom: 4,
  },
  trickContent: {
    fontSize: 13,
    color: '#FEF3C7',
    lineHeight: 18,
  },
  footerBar: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
    backgroundColor: '#0F172A',
    gap: 12,
  },
  navButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    alignItems: 'center',
  },
  navButtonDisabled: {
    opacity: 0.4,
  },
  navButtonPrimary: {
    backgroundColor: '#3B82F6',
  },
  navButtonText: {
    color: '#E2E8F0',
    fontWeight: '700',
    fontSize: 14,
  },
  navButtonPrimaryText: {
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
    textAlign: 'center',
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 10,
  },
  buttonPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

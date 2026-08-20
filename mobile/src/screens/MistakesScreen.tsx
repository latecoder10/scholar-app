import React from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ScrollView,
  SafeAreaView
} from 'react-native';
import { MobileQuestion } from '../types';

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
  onPracticeMistakes
}) => {
  const mistakeQuestions = questions.filter(q => mistakeIds.includes(q.id));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.topBar}>
        <TouchableOpacity onPress={onBack} style={styles.iconButton}>
          <Text style={styles.iconButtonText}>✕</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Mistake Vault ({mistakeQuestions.length})</Text>
        <View style={{ width: 36 }} />
      </View>

      {mistakeQuestions.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyEmoji}>🎯</Text>
          <Text style={styles.emptyTitle}>No Active Mistakes!</Text>
          <Text style={styles.emptySubtitle}>
            Every question you answer incorrectly will automatically land here for high-yield re-testing.
          </Text>
          <TouchableOpacity style={styles.button} onPress={onBack}>
            <Text style={styles.buttonText}>Return to Practice</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <View style={{ flex: 1 }}>
          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.banner}>
              <Text style={styles.bannerText}>
                Review your weak spots. Retesting mistakes until 100% mastery increases final exam retention by 3.4x.
              </Text>
            </View>

            {mistakeQuestions.map((q, idx) => (
              <View key={q.id} style={styles.mistakeCard}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardIndex}>Flagged Item #{idx + 1}</Text>
                  <Text style={styles.cardTag}>{q.subject || q.exam}</Text>
                </View>

                <Text style={styles.cardQuestion}>{q.question}</Text>

                <View style={styles.keyRow}>
                  <Text style={styles.keyText}>Correct Key: Option {q.answer}</Text>
                </View>

                {q.examTrick && (
                  <View style={styles.trickRow}>
                    <Text style={styles.trickLabel}>⚡ Exam Shortcut:</Text>
                    <Text style={styles.trickText}>{q.examTrick}</Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>

          <View style={styles.footerBar}>
            <TouchableOpacity
              style={styles.retestButton}
              onPress={onPracticeMistakes}
              activeOpacity={0.85}
            >
              <Text style={styles.retestButtonText}>
                ⚡ Re-Test All {mistakeQuestions.length} Mistakes Now
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
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
  title: {
    color: '#F8FAFC',
    fontSize: 16,
    fontWeight: '700',
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 20,
  },
  banner: {
    backgroundColor: 'rgba(239, 68, 68, 0.12)',
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  bannerText: {
    color: '#FCA5A5',
    fontSize: 12,
    lineHeight: 18,
  },
  mistakeCard: {
    backgroundColor: '#1E293B',
    borderRadius: 12,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#334155',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  cardIndex: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F87171',
  },
  cardTag: {
    fontSize: 11,
    color: '#94A3B8',
  },
  cardQuestion: {
    fontSize: 14,
    fontWeight: '700',
    color: '#F8FAFC',
    lineHeight: 20,
    marginBottom: 10,
  },
  keyRow: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  keyText: {
    color: '#34D399',
    fontWeight: '700',
    fontSize: 12,
  },
  trickRow: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 8,
    borderRadius: 6,
  },
  trickLabel: {
    color: '#FBBF24',
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2,
  },
  trickText: {
    color: '#FEF3C7',
    fontSize: 12,
    lineHeight: 16,
  },
  footerBar: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  retestButton: {
    backgroundColor: '#EF4444',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  retestButtonText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 15,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  emptyEmoji: {
    fontSize: 48,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  emptySubtitle: {
    color: '#94A3B8',
    fontSize: 14,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
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

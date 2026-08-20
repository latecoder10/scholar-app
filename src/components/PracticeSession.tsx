/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  CheckCircle, 
  XCircle, 
  HelpCircle, 
  ArrowRight, 
  Lightbulb, 
  Tag, 
  ChevronRight, 
  Award,
  AlertTriangle,
  Flame,
  CornerDownRight
} from "lucide-react";
import { Question, UserAnswerSubmission } from "../types";
import { resolveExamForEntry } from "../../shared/exams";
import RichText from "./RichText";

interface PracticeSessionProps {
  questions: Question[];
  mode: 'practice' | 'revision' | 'mistakes';
  chapterId: string;
  chapterName: string;
  subject: string;
  onFinish: () => void;
  onSubmitAnswer: (submission: UserAnswerSubmission) => Promise<any>;
}

export default function PracticeSession({ 
  questions, 
  mode, 
  chapterId, 
  chapterName, 
  subject, 
  onFinish, 
  onSubmitAnswer 
}: PracticeSessionProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [confidence, setConfidence] = useState<'Guess' | 'Somewhat Sure' | 'Very Sure'>('Very Sure');
  const [isAnswered, setIsAnswered] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-scroll to top on question index change
  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex]);

  if (questions.length === 0) {
    return (
      <div className="py-16 text-center space-y-4 bg-white border border-slate-100 rounded-2xl max-w-md mx-auto">
        <HelpCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
        <div>
          <h3 className="font-display text-base font-bold text-slate-800">No Questions Found</h3>
          <p className="text-slate-400 text-xs mt-1 px-4">This session has no questions. Make sure the content pack contains valid questions.</p>
        </div>
        <button 
          onClick={onFinish}
          className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-100"
        >
          Exit Session
        </button>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const isCorrect = selectedOption === currentQuestion.answer;

  const handleOptionSelect = (option: string) => {
    if (isAnswered) return;
    setSelectedOption(option);
  };

  const handleSubmit = async () => {
    if (!selectedOption || isAnswered || isSubmitting) return;

    try {
      setIsSubmitting(true);
      const resolvedExam = resolveExamForEntry({ subject, chapterId, name: chapterName });

      const submission: UserAnswerSubmission = {
        subject,
        chapterId,
        chapterName,
        questionId: currentQuestion.id,
        questionText: currentQuestion.question,
        options: currentQuestion.options,
        explanation: currentQuestion.explanation,
        examTrick: currentQuestion.examTrick,
        correctAnswer: currentQuestion.answer,
        userAnswer: selectedOption,
        confidence,
        isCorrect,
        exam: resolvedExam.matchExam,
      };

      await onSubmitAnswer(submission);
      setIsAnswered(true);
    } catch (e) {
      console.error("Error submitting answer:", e);
      // Proceed locally even if network has issue
      setIsAnswered(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      setSelectedOption(null);
      setConfidence('Very Sure');
      setIsAnswered(false);
    } else {
      onFinish();
    }
  };

  const progressPercentage = Math.round(((currentIndex + 1) / questions.length) * 100);

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in pb-12">
      {/* Session Status Bar */}
      <div className="bg-white border border-slate-150 p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
        <div className="space-y-0.5 min-w-0">
          <div className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide">
            {mode.charAt(0).toUpperCase() + mode.slice(1)} session
          </div>
          <div className="text-sm font-bold font-display leading-tight truncate max-w-full md:max-w-md text-slate-800">
            {chapterName}
          </div>
        </div>
        <div className="text-left sm:text-right shrink-0">
          <div className="text-xs text-slate-500">
            Question <strong className="text-slate-800">{currentIndex + 1}</strong> of <strong className="text-slate-800">{questions.length}</strong>
          </div>
          <div className="w-full sm:w-24 bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 md:p-8 shadow-xs">
        
        {/* Difficulty, Source and Importance */}
        <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-5 text-[11px]">
          <span className={`px-2 py-0.5 border rounded-md font-semibold ${
            currentQuestion.difficulty === 'Easy'
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700'
              : currentQuestion.difficulty === 'Medium'
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700'
              : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {currentQuestion.difficulty || 'Medium'}
          </span>
          <span className="text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md truncate max-w-full">
            {currentQuestion.source || "Practice question"}
          </span>
          {currentQuestion.importance && (
            <span className={`px-2 py-0.5 rounded-md font-semibold ${
              currentQuestion.importance === 'High'
                ? 'bg-amber-50 text-amber-700 border border-amber-100'
                : 'bg-slate-50 text-slate-500'
            }`}>
              {currentQuestion.importance} priority
            </span>
          )}
        </div>

        {/* Question Statement */}
        <div>
          <h2 className="text-lg md:text-xl font-bold font-display text-slate-800 leading-snug">
            <RichText inline>{currentQuestion.question}</RichText>
          </h2>
        </div>

        {/* Options Selection */}
        <div className="mt-8 space-y-3">
          {currentQuestion.options.map((option, index) => {
            const letter = String.fromCharCode(65 + index); // A, B, C, D
            const isSelected = selectedOption === option;

            let optionStyle = "border-slate-100 hover:bg-slate-50/50 hover:border-slate-200";
            let letterStyle = "bg-slate-50 text-slate-500 border-slate-100";

            if (isSelected) {
              optionStyle = "border-indigo-600 bg-indigo-50/30 ring-1 ring-indigo-600";
              letterStyle = "bg-indigo-600 text-white border-indigo-600";
            }

            if (isAnswered) {
              // Highlight correctness after submission
              const isCorrectOption = option === currentQuestion.answer;
              const isUserSelection = option === selectedOption;

              if (isCorrectOption) {
                optionStyle = "border-emerald-500 bg-emerald-50/40 ring-1 ring-emerald-500";
                letterStyle = "bg-emerald-500 text-white border-emerald-500";
              } else if (isUserSelection && !isCorrectOption) {
                optionStyle = "border-rose-500 bg-rose-50/30 ring-1 ring-rose-500";
                letterStyle = "bg-rose-500 text-white border-rose-500";
              } else {
                optionStyle = "border-slate-100 opacity-60";
                letterStyle = "bg-slate-50 text-slate-400";
              }
            }

            return (
              <button
                key={index}
                onClick={() => handleOptionSelect(option)}
                disabled={isAnswered}
                className={`w-full text-left p-4 rounded-xl border flex items-center gap-4 transition-all duration-150 cursor-pointer ${optionStyle}`}
              >
                <span className={`w-7 h-7 flex items-center justify-center rounded-lg border font-mono font-bold text-sm shrink-0 ${letterStyle}`}>
                  {letter}
                </span>
                <span className="text-sm font-medium text-slate-700 leading-relaxed">
                  <RichText inline>{option}</RichText>
                </span>
              </button>
            );
          })}
        </div>

        {/* Confidence Selector (Hidden when already answered) */}
        {!isAnswered && (
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
            <label className="text-xs font-semibold text-slate-400 block">
              How confident are you?
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: "Guess", color: "border-amber-200 text-amber-700 bg-amber-50/30 ring-amber-500" },
                { level: "Somewhat Sure", color: "border-blue-200 text-blue-700 bg-blue-50/30 ring-blue-500" },
                { level: "Very Sure", color: "border-emerald-200 text-emerald-700 bg-emerald-50/30 ring-emerald-500" }
              ].map((item) => {
                const isActive = confidence === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setConfidence(item.level as any)}
                    className={`p-3 rounded-xl border text-center text-xs font-semibold flex items-center justify-center cursor-pointer transition-all ${
                      isActive
                        ? `${item.color} ring-1 font-bold border-transparent`
                        : "border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                    }`}
                  >
                    {item.level}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Submit Section (Hidden when already answered) */}
        {!isAnswered && (
          <div className="mt-6 flex justify-between items-center gap-4">
            <button
              onClick={onFinish}
              className="px-5 py-3 text-xs font-semibold text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              End session
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Submitting…" : "Submit Answer"}
            </button>
          </div>
        )}

      </div>

      {/* Answer Screen / Explanations Panel (Appears after answer submitted) */}
      {isAnswered && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-4 sm:p-6 md:p-8 space-y-6 animate-slide-up">
          
          {/* Correction Banner */}
          <div className="flex items-start gap-4">
            {isCorrect ? (
              <div className="p-2.5 bg-emerald-500 text-white rounded-2xl">
                <CheckCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
            ) : (
              <div className="p-2.5 bg-rose-500 text-white rounded-2xl">
                <XCircle className="w-6 h-6 stroke-[2.5]" />
              </div>
            )}

            <div>
              <h3 className={`font-display text-lg font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCorrect
                  ? "Correct!"
                  : `Incorrect — the correct answer is: ${currentQuestion.answer}`
                }
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Submitted with <strong className="text-slate-600">{confidence}</strong> confidence.
              </p>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-2 border-t border-slate-200/60 pt-5">
            <span className="text-xs font-semibold text-slate-400 block">Explanation</span>
            <div className="text-slate-600 text-sm leading-relaxed bg-white p-4 rounded-xl border border-slate-100">
              <RichText>{currentQuestion.explanation}</RichText>
            </div>
          </div>

          {/* Exam Trick Section */}
          {currentQuestion.examTrick && (
            <div className="space-y-2">
              <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 font-display">
                    {resolveExamForEntry({ subject, chapterId, name: chapterName }).questionTipLabel || "Tip"}
                  </h4>
                  <div className="text-xs text-amber-700 leading-relaxed mt-0.5 font-medium">
                    <RichText>{currentQuestion.examTrick}</RichText>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {currentQuestion.tags && currentQuestion.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-semibold text-slate-400 block">Topics</span>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[11px] font-medium bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">
                    <Tag className="w-3 h-3" /> {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Nav to Next Question */}
          <div className="pt-4 border-t border-slate-200/60 flex justify-end">
            <button
              onClick={handleNext}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-100"
            >
              {currentIndex < questions.length - 1 ? (
                <>Next Question <ArrowRight className="w-4 h-4" /></>
              ) : (
                <>Complete Session <ChevronRight className="w-4 h-4" /></>
              )}
            </button>
          </div>

        </div>
      )}
    </div>
  );
}

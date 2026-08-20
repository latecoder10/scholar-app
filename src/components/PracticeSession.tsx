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
      const isClaudeTrack = (subject && (subject.includes("Claude") || subject.includes("CCAF") || subject.includes("MCP") || subject.includes("Agentic"))) ||
        (chapterId && chapterId.includes("claude")) ||
        (chapterName && chapterName.toLowerCase().includes("claude"));

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
        exam: isClaudeTrack ? "Claude CCAF" : "CIL MT",
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
      {/* Flight HUD / Status Bar */}
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-2xl flex items-center justify-between text-white shadow-xs">
        <div className="space-y-0.5">
          <div className="text-[9px] font-bold font-mono text-slate-500 tracking-wider uppercase">
            FLIGHT MISSION: {mode.toUpperCase()} MODE
          </div>
          <div className="text-sm font-bold font-display leading-tight truncate max-w-xs md:max-w-md">
            {chapterName}
          </div>
        </div>
        <div className="text-right shrink-0">
          <div className="text-[10px] font-mono text-slate-400">
            QUESTION <strong className="text-white">{currentIndex + 1}</strong> OF <strong className="text-white">{questions.length}</strong>
          </div>
          <div className="w-24 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${progressPercentage}%` }} />
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs">
        
        {/* Difficulty, Source and Importance */}
        <div className="flex flex-wrap items-center gap-3 mb-5 text-[10px] font-mono">
          <span className={`px-2 py-0.5 border rounded-md font-semibold uppercase tracking-wider ${
            currentQuestion.difficulty === 'Easy' 
              ? 'bg-emerald-50 border-emerald-100 text-emerald-700' 
              : currentQuestion.difficulty === 'Medium' 
              ? 'bg-indigo-50 border-indigo-100 text-indigo-700' 
              : 'bg-rose-50 border-rose-100 text-rose-700'
          }`}>
            {currentQuestion.difficulty || 'Medium'}
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-slate-500 bg-slate-50 border border-slate-100 px-2 py-0.5 rounded-md">
            SOURCE: {currentQuestion.source || "CIL MT Mock"}
          </span>
          {currentQuestion.importance && (
            <>
              <span className="text-slate-400">•</span>
              <span className={`px-2 py-0.5 rounded-md font-semibold ${
                currentQuestion.importance === 'High' 
                  ? 'bg-amber-50 text-amber-700 border border-amber-100' 
                  : 'bg-slate-50 text-slate-500'
              }`}>
                IMPORTANCE: {currentQuestion.importance}
              </span>
            </>
          )}
        </div>

        {/* Question Statement */}
        <div className="space-y-1">
          <span className="text-xs font-bold font-mono text-indigo-600 block">QUESTION PROMPT</span>
          <h2 className="text-lg md:text-xl font-bold font-display text-slate-800 leading-snug">
            {currentQuestion.question}
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
                  {option}
                </span>
              </button>
            );
          })}
        </div>

        {/* Confidence Selector (Hidden when already answered) */}
        {!isAnswered && (
          <div className="mt-8 pt-6 border-t border-slate-50 space-y-3">
            <label className="text-xs font-bold font-mono text-slate-400 block uppercase tracking-wider">
              Calibrate Confidence Level
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { level: "Guess", color: "border-amber-200 text-amber-700 bg-amber-50/30 ring-amber-500", icon: "🎲" },
                { level: "Somewhat Sure", color: "border-blue-200 text-blue-700 bg-blue-50/30 ring-blue-500", icon: "⚖️" },
                { level: "Very Sure", color: "border-emerald-200 text-emerald-700 bg-emerald-50/30 ring-emerald-500", icon: "🛡️" }
              ].map((item) => {
                const isActive = confidence === item.level;
                return (
                  <button
                    key={item.level}
                    type="button"
                    onClick={() => setConfidence(item.level as any)}
                    className={`p-3 rounded-xl border text-center font-mono text-xs font-semibold flex flex-col sm:flex-row items-center justify-center gap-1.5 cursor-pointer transition-all ${
                      isActive 
                        ? `${item.color} ring-1 font-bold border-transparent` 
                        : "border-slate-100 text-slate-400 hover:bg-slate-50 hover:text-slate-500"
                    }`}
                  >
                    <span>{item.icon}</span>
                    <span>{item.level}</span>
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
              className="px-5 py-3 text-xs font-bold font-mono text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
            >
              Abort Mission
            </button>
            <button
              onClick={handleSubmit}
              disabled={!selectedOption || isSubmitting}
              className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 active:bg-slate-950 disabled:bg-slate-100 disabled:text-slate-400 text-white font-semibold text-sm px-6 py-3 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              {isSubmitting ? "Locking Answer..." : "Submit Answer"}
            </button>
          </div>
        )}

      </div>

      {/* Answer Screen / Explanations Panel (Appears after answer submitted) */}
      {isAnswered && (
        <div className="bg-slate-50 border border-slate-100 rounded-2xl p-6 md:p-8 space-y-6 animate-slide-up">
          
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
              <div className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Verdict</div>
              <h3 className={`font-display text-lg font-bold ${isCorrect ? 'text-emerald-700' : 'text-rose-700'}`}>
                {isCorrect 
                  ? "Correct Answer! Target secured." 
                  : `Incorrect. Correct answer is Option: ${currentQuestion.answer}`
                }
              </h3>
              <p className="text-slate-400 text-xs mt-0.5">
                Submitted with <strong className="text-slate-600">{confidence}</strong> confidence.
              </p>
            </div>
          </div>

          {/* Explanation Section */}
          <div className="space-y-2 border-t border-slate-200/60 pt-5">
            <span className="text-xs font-bold font-mono text-slate-400 block uppercase tracking-wider">Solution Explanation</span>
            <div className="text-slate-600 text-sm leading-relaxed whitespace-pre-line bg-white p-4 rounded-xl border border-slate-100">
              {currentQuestion.explanation}
            </div>
          </div>

          {/* Exam Trick Section */}
          {currentQuestion.examTrick && (
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-slate-400 block uppercase tracking-wider">Exam Tactic / Trick</span>
              <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
                <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-bold text-amber-800 font-display uppercase tracking-wider">
                    {subject.includes("Claude") || chapterId.includes("claude") ? "Claude CCAF Architecture Tip" : "Exam Strategy & Shortcut"}
                  </h4>
                  <p className="text-xs text-amber-700 leading-relaxed mt-0.5 font-medium">
                    {currentQuestion.examTrick}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Tags */}
          {currentQuestion.tags && currentQuestion.tags.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-bold font-mono text-slate-400 block uppercase tracking-wider">Tags & Taxonomy</span>
              <div className="flex flex-wrap gap-2">
                {currentQuestion.tags.map((tag) => (
                  <span key={tag} className="inline-flex items-center gap-1 text-[10px] font-mono font-semibold bg-indigo-50 border border-indigo-100 text-indigo-700 px-2.5 py-1 rounded-md">
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

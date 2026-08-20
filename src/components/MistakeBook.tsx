/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  AlertTriangle, 
  BookOpen, 
  Trash2, 
  Play, 
  HelpCircle, 
  CheckCircle,
  XCircle,
  Tag,
  Lightbulb,
  ArrowRight,
  Filter
} from "lucide-react";
import { MistakeEntry, UserProgress, Question } from "../types";
import { resolveExamForEntry } from "../../shared/exams";
import RichText from "./RichText";

interface MistakeBookProps {
  progress: UserProgress;
  selectedExam?: string;
  onClearMistakes: () => Promise<any>;
  onStartSession: (questions: Question[], mode: 'practice' | 'revision' | 'mistakes', chapterId: string, chapterName: string, subject: string) => void;
}

export default function MistakeBook({ progress, selectedExam = "all", onClearMistakes, onStartSession }: MistakeBookProps) {
  const [selectedSubject, setSelectedSubject] = useState<string>("All");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedExam, selectedSubject]);

  const rawMistakes = progress.mistakes || [];

  // Filter mistakes by selectedExam track first
  const mistakes = rawMistakes.filter((m) => {
    if (selectedExam === "all") return true;
    return resolveExamForEntry(m).id === selectedExam;
  });

  // Get list of unique subjects represented in filtered mistakes
  const uniqueSubjects = ["All", ...Array.from(new Set(mistakes.map((m) => m.subject)))];

  // Filter mistakes by selected subject
  const filteredMistakes = selectedSubject === "All" 
    ? mistakes 
    : mistakes.filter((m) => m.subject === selectedSubject);

  const [showClearConfirm, setShowClearConfirm] = useState(false);

  const handleClearAll = () => {
    setShowClearConfirm(true);
  };

  const executeClearAll = async () => {
    setShowClearConfirm(false);
    await onClearMistakes();
  };

  const handlePracticeMistakes = () => {
    if (filteredMistakes.length === 0) return;

    // Convert MistakeEntry array to Question array
    const questionsToPractice: Question[] = filteredMistakes.map((m): Question => ({
      id: m.questionId,
      question: m.questionText,
      options: m.options,
      answer: m.correctAnswer,
      difficulty: 'Medium', // default fallback
      source: 'Mistake Book',
      explanation: m.explanation,
      examTrick: m.examTrick,
      importance: 'High',
      tags: []
    }));

    // Start practice session using the mistakes
    onStartSession(
      questionsToPractice, 
      'mistakes', 
      'mistake-book-revision', 
      `Mistake Book: ${selectedSubject} Revision`, 
      selectedSubject === "All" ? "Multiple Subjects" : selectedSubject
    );
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-150 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display text-xl md:text-2xl font-bold text-slate-900 tracking-tight">Mistakes</h1>
            <p className="text-slate-500 text-xs mt-1 max-w-xl">
              Questions you've answered incorrectly show up here. Answer one correctly and it's removed automatically.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
          {mistakes.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center justify-center gap-1.5 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold text-xs px-4 py-2.5 min-h-11 sm:min-h-0 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear all
              </button>
              <button
                onClick={handlePracticeMistakes}
                className="inline-flex items-center justify-center gap-1.5 bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs px-4 py-2.5 min-h-11 sm:min-h-0 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <Play className="w-4 h-4 fill-white text-white" /> Practice mistakes ({filteredMistakes.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Content Controls */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Subject</span>
        </div>
        <div className="flex flex-wrap gap-1.5 w-full sm:w-auto">
          {uniqueSubjects.map((sub) => (
            <button
              key={sub}
              onClick={() => {
                setSelectedSubject(sub);
                setExpandedId(null);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer border ${
                selectedSubject === sub
                  ? "bg-slate-900 border-slate-900 text-white font-bold"
                  : "bg-slate-50 border-slate-100 text-slate-500 hover:bg-slate-100 hover:text-slate-700"
              }`}
            >
              {sub} ({sub === "All" ? mistakes.length : mistakes.filter((m) => m.subject === sub).length})
            </button>
          ))}
        </div>
      </div>

      {/* Mistakes Inventory List */}
      {filteredMistakes.length > 0 ? (
        <div className="space-y-4">
          {filteredMistakes.map((entry) => {
            const isExpanded = expandedId === entry.id;
            return (
              <div 
                key={entry.id}
                className="bg-white border border-slate-100 rounded-2xl overflow-hidden shadow-xs hover:border-slate-200 transition-all"
              >
                {/* Header Summary Row */}
                <div 
                  onClick={() => setExpandedId(isExpanded ? null : entry.id)}
                  className="p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 cursor-pointer hover:bg-slate-50/40 select-none"
                >
                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[10px] font-bold uppercase tracking-wide rounded">
                        {entry.subject}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-400 font-semibold">{entry.chapterName}</span>
                    </div>
                    <h3 className="font-display text-sm md:text-base font-bold text-slate-800 line-clamp-1 pr-4">
                      <RichText inline>{entry.questionText}</RichText>
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <span className="text-[10px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold border border-amber-100">
                      Confidence: {entry.confidence}
                    </span>
                    <button className="text-indigo-600 text-xs font-bold hover:underline shrink-0">
                      {isExpanded ? "Collapse" : "View solution"}
                    </button>
                  </div>
                </div>

                {/* Expanded Solution Detail Section */}
                {isExpanded && (
                  <div className="px-5 pb-5 border-t border-slate-50 pt-5 bg-slate-50/50 space-y-5 animate-slide-down">
                    
                    {/* Comparative Answers */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="bg-white border border-rose-100 p-4 rounded-xl space-y-1 flex items-start gap-3">
                        <XCircle className="w-5 h-5 text-rose-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Your Answer</div>
                          <p className="text-sm font-semibold text-rose-700 mt-0.5 leading-snug">
                            {entry.userAnswer ? <RichText inline>{entry.userAnswer}</RichText> : "[No answer submitted]"}
                          </p>
                        </div>
                      </div>

                      <div className="bg-white border border-emerald-100 p-4 rounded-xl space-y-1 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Correct Answer</div>
                          <p className="text-sm font-semibold text-emerald-700 mt-0.5 leading-snug">
                            <RichText inline>{entry.correctAnswer}</RichText>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide block">Explanation</span>
                      <div className="bg-white border border-slate-100 p-4 rounded-xl text-xs text-slate-600 leading-relaxed">
                        <RichText>{entry.explanation}</RichText>
                      </div>
                    </div>

                    {/* Exam Trick */}
                    {entry.examTrick && (
                      <div className="bg-amber-50 border border-amber-100 p-4 rounded-xl flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-amber-800 font-display uppercase tracking-wide">
                            {entry.exam ? `${entry.exam} Tip` : `${resolveExamForEntry(entry).shortName} Tip`}
                          </h4>
                          <div className="text-xs text-amber-700 leading-relaxed mt-0.5 font-semibold">
                            <RichText>{entry.examTrick}</RichText>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Quick practice single button */}
                    <div className="flex justify-end pt-2">
                      <button 
                        onClick={() => {
                          const singleQ: Question = {
                            id: entry.questionId,
                            question: entry.questionText,
                            options: entry.options,
                            answer: entry.correctAnswer,
                            difficulty: 'Medium',
                            source: entry.subject,
                            explanation: entry.explanation,
                            examTrick: entry.examTrick,
                            importance: 'High',
                            tags: []
                          };
                          onStartSession([singleQ], 'mistakes', entry.chapterId, entry.chapterName, entry.subject);
                        }}
                        className="inline-flex items-center gap-1.5 text-xs font-bold text-indigo-600 hover:text-indigo-800"
                      >
                        Practice this item <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="text-center py-20 bg-white border border-slate-100 rounded-2xl max-w-xl mx-auto space-y-4">
          <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto" />
          <div className="space-y-1.5 max-w-sm mx-auto">
            <h3 className="font-display text-base font-bold text-slate-800">No mistakes</h3>
            <p className="text-slate-400 text-xs">
              Nice work — you haven't gotten anything wrong yet, or you've corrected everything.
            </p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-4 sm:p-6 space-y-4 border border-slate-150 shadow-xl animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900">Clear all mistakes?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This permanently deletes everything in your Mistakes list. This can't be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold transition-colors cursor-pointer"
              >
                Clear All
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

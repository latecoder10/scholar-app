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
    const isClaude = m.exam === "Claude CCAF" || 
      (m.subject && (m.subject.includes("Claude") || m.subject.includes("CCAF") || m.subject.includes("MCP") || m.subject.includes("Agentic") || m.subject.includes("Prompt") || m.subject.includes("Context") || m.subject.includes("Enterprise"))) ||
      (m.chapterId && m.chapterId.includes("claude"));

    if (selectedExam === "claude-ccaf") {
      return isClaude;
    }
    if (selectedExam === "cil-mt") {
      return !isClaude;
    }
    return true;
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
    const questionsToPractice: Question[] = filteredMistakes.map((m) => ({
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
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-linear-to-r from-rose-950 to-rose-900 border border-rose-800 p-6 rounded-2xl shadow-sm text-white">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <AlertTriangle className="w-7 h-7 text-rose-300 animate-pulse" /> Mistake Book
          </h1>
          <p className="text-rose-200 text-xs mt-1 max-w-xl">
            Unresolved incorrect answers are captured here automatically. Retrain on these items; solving them correctly purges them from the book.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 shrink-0 w-full md:w-auto">
          {mistakes.length > 0 && (
            <>
              <button
                onClick={handleClearAll}
                className="inline-flex items-center justify-center gap-1.5 border border-rose-700 hover:bg-rose-900 text-rose-100 font-semibold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
              >
                <Trash2 className="w-4 h-4" /> Clear All
              </button>
              <button
                onClick={handlePracticeMistakes}
                className="inline-flex items-center justify-center gap-1.5 bg-white text-rose-950 hover:bg-rose-50 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-md"
              >
                <Play className="w-4 h-4 fill-rose-950 text-rose-950" /> Start Mistakes Practice ({filteredMistakes.length})
              </button>
            </>
          )}
        </div>
      </div>

      {/* Filter and Content Controls */}
      <div className="bg-white border border-slate-100 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 self-start sm:self-center">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-bold font-mono text-slate-400 uppercase tracking-wider">Filter Subject:</span>
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
                      <span className="px-2 py-0.5 bg-rose-50 border border-rose-100 text-rose-700 text-[9px] font-bold font-mono uppercase tracking-wider rounded">
                        {entry.subject}
                      </span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs font-mono text-slate-400 font-semibold">{entry.chapterName}</span>
                    </div>
                    <h3 className="font-display text-sm md:text-base font-bold text-slate-800 line-clamp-1 pr-4">
                      {entry.questionText}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 self-end md:self-center shrink-0">
                    <span className="text-[10px] font-mono bg-amber-50 text-amber-700 px-2 py-0.5 rounded-md font-semibold border border-amber-100">
                      FAILED WITH: {entry.confidence}
                    </span>
                    <button className="text-indigo-600 font-mono text-xs font-bold hover:underline shrink-0">
                      {isExpanded ? "Collapse" : "Examine Solution"}
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
                          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Your Answer</div>
                          <p className="text-sm font-semibold text-rose-700 mt-0.5 leading-snug">{entry.userAnswer || "[No answer submitted]"}</p>
                        </div>
                      </div>

                      <div className="bg-white border border-emerald-100 p-4 rounded-xl space-y-1 flex items-start gap-3">
                        <CheckCircle className="w-5 h-5 text-emerald-500 mt-0.5 shrink-0" />
                        <div>
                          <div className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider">Correct Answer</div>
                          <p className="text-sm font-semibold text-emerald-700 mt-0.5 leading-snug">{entry.correctAnswer}</p>
                        </div>
                      </div>
                    </div>

                    {/* Explanations */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wider block">Detailed Solution Explanation</span>
                      <p className="bg-white border border-slate-100 p-4 rounded-xl text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                        {entry.explanation}
                      </p>
                    </div>

                    {/* Exam Tactic */}
                    {entry.examTrick && (
                      <div className="bg-linear-to-r from-amber-50 to-orange-50 border-l-4 border-amber-500 p-4 rounded-xl flex items-start gap-3">
                        <Lightbulb className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
                        <div>
                          <h4 className="text-[10px] font-bold text-amber-800 font-display uppercase tracking-wider">
                            {entry.exam ? `${entry.exam} Strategy Tip` : entry.subject.includes("Claude") ? "Claude CCAF Strategy Tip" : "Exam Strategy Tip"}
                          </h4>
                          <p className="text-xs text-amber-700 leading-relaxed mt-0.5 font-semibold">
                            {entry.examTrick}
                          </p>
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
                        className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-600 hover:text-indigo-800"
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
            <h3 className="font-display text-base font-bold text-slate-800">No Active Mistakes</h3>
            <p className="text-slate-400 text-xs">
              Excellent! Your Mistake Book is completely empty. That means all attempted exam items are currently verified as correct.
            </p>
          </div>
        </div>
      )}

      {/* Custom Confirmation Modal */}
      {showClearConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-150 shadow-xl animate-scale-up">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900">Clear Mistake Book?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Are you sure you want to clear your entire Mistake Book? This action will erase all logged errors permanently and cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowClearConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={executeClearAll}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
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

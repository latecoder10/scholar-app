/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  ChevronLeft, 
  Layers, 
  Play, 
  RefreshCw, 
  AlertTriangle, 
  CheckCircle,
  Clock,
  HelpCircle,
  FileCode,
  Gauge,
  Sparkles,
  GraduationCap,
  BookOpen
} from "lucide-react";
import { Chapter, UserProgress, Question, parseProgressKey } from "../types";

interface ChapterViewProps {
  subjectName: string;
  chapter: Chapter;
  progress: UserProgress;
  onBack: () => void;
  onStartSession: (questions: Question[], mode: 'practice' | 'revision' | 'mistakes', chapterId: string, chapterName: string, subject: string) => void;
}

export default function ChapterView({ subjectName, chapter, progress, onBack, onStartSession }: ChapterViewProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [expanding, setExpanding] = useState(false);
  const [expansionStatus, setExpansionStatus] = useState<string | null>(null);

  async function handleExpandChapter(targetCount: number = 15) {
    try {
      setExpanding(true);
      setExpansionStatus("Virtually lecturing... Reviewing syllabi and exam blueprints...");
      const res = await fetch(`/api/chapter/${encodeURIComponent(subjectName.replace(/\s+/g, "-"))}/${encodeURIComponent(chapter.id)}/expand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: targetCount })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to expand chapter.");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      // Update chapter counts in the user's view
      chapter.questionsCount = data.totalCount;
      setExpansionStatus(`Virtual Teacher: Successfully curated and verified ${data.addedCount} exam questions! Total in chapter is now ${data.totalCount}.`);
      setTimeout(() => setExpansionStatus(null), 8000);
    } catch (err: any) {
      console.error(err);
      setExpansionStatus(`Virtual Teacher Error: ${err.message}`);
    } finally {
      setExpanding(false);
    }
  }

  useEffect(() => {
    async function loadChapterQuestions() {
      try {
        setLoading(true);
        setError(null);
        // We URI encode the parameters to ensure path safeness
        const res = await fetch(`/api/chapter/${encodeURIComponent(subjectName.replace(/\s+/g, "-"))}/${encodeURIComponent(chapter.id)}`);
        if (!res.ok) {
          throw new Error(`Failed to load chapter questions: ${res.statusText}`);
        }
        const data = await res.json();
        setQuestions(data.questions || []);
      } catch (err: any) {
        console.error(err);
        setError(err.message || "Could not load questions. Check file integrity.");
      } finally {
        setLoading(false);
      }
    }

    loadChapterQuestions();
  }, [subjectName, chapter.id]);

  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [chapter.id]);

  // Determine mistakes and revision questions for this chapter
  const chapterKeys = Object.keys(progress.answeredQuestions).filter((key) => {
    const entry = progress.answeredQuestions[key];
    const parsed = parseProgressKey(key, entry);
    return parsed.subject === subjectName && parsed.chapterId === chapter.id;
  });

  const answeredQuestionsCount = chapterKeys.length;

  const mistakesListForChapter = progress.mistakes.filter(
    (m) => (m.subject === subjectName || !m.subject) && m.chapterId === chapter.id
  );

  const mistakesQuestions = questions.filter((q) => 
    mistakesListForChapter.some((m) => m.questionId === q.id)
  );

  // Revision set: either incorrect ones or ones solved with low confidence ('Guess')
  const lowConfidenceOrWrongQIds = chapterKeys
    .filter((key) => {
      const entry = progress.answeredQuestions[key];
      return !entry.isCorrect || entry.confidence === "Guess";
    })
    .map((key) => {
      const entry = progress.answeredQuestions[key];
      return parseProgressKey(key, entry).questionId;
    });

  const revisionQuestions = questions.filter((q) => 
    lowConfidenceOrWrongQIds.includes(String(q.id))
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Navigation */}
      <div className="space-y-4">
        <button 
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold font-mono text-slate-500 hover:text-slate-800 transition-colors gap-1 hover:-translate-x-0.5 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" /> BACK TO SUBJECT
        </button>

        <div className="bg-white border border-slate-100 p-6 rounded-2xl">
          <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 text-slate-500 text-[10px] font-bold font-mono uppercase tracking-wider rounded-md">
            {subjectName}
          </span>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mt-3">
            {chapter.name}
          </h1>
          <p className="text-slate-400 text-xs mt-1 leading-relaxed max-w-2xl">
            {chapter.description || "Interactive exam workspace. Practice concepts with immediate feedback, key tactics, and detailed solutions."}
          </p>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-3">
          <RefreshCw className="w-8 h-8 text-indigo-600 animate-spin mx-auto" />
          <p className="text-sm font-mono text-slate-400">Booting chapter file, discovering questions...</p>
        </div>
      ) : error ? (
        <div className="p-6 border border-rose-100 bg-rose-50/50 rounded-2xl max-w-xl mx-auto text-center space-y-4">
          <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-slate-800 font-display">Auto-discovery Read Failure</h4>
            <p className="text-xs text-rose-600 leading-relaxed">{error}</p>
          </div>
          <button 
            onClick={() => window.location.reload()}
            className="text-xs font-bold font-mono text-indigo-600 bg-white border border-slate-100 px-4 py-2 rounded-xl shadow-xs hover:shadow-md transition-all"
          >
            Retry Reading File
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Block (5 cols): Flight Metrics */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs space-y-6">
              <h3 className="font-display text-sm font-bold text-slate-800 pb-3 border-b border-slate-50 uppercase tracking-wider font-mono">
                Chapter Inventory & Metrics
              </h3>

              {/* Dynamic Counts */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">Total Questions</span>
                  <span className="text-3xl font-bold font-display text-slate-800 mt-1 block">{questions.length}</span>
                </div>
                <div className="bg-slate-50 p-4 rounded-2xl text-center">
                  <span className="text-[10px] font-bold font-mono text-slate-400 uppercase tracking-wide">Completed</span>
                  <span className="text-3xl font-bold font-display text-slate-800 mt-1 block">{answeredQuestionsCount}</span>
                </div>
              </div>

              {/* Difficulty Breakdown */}
              <div className="space-y-3 pt-2">
                <span className="text-xs font-semibold text-slate-400 font-mono flex items-center gap-1.5">
                  <Gauge className="w-3.5 h-3.5 text-slate-400" /> Difficulty Balance
                </span>
                <div className="space-y-2">
                  {Object.entries(chapter.difficultyBreakdown).map(([level, count]) => {
                    const pct = questions.length > 0 ? Math.round((count / questions.length) * 100) : 0;
                    const barColor = level === 'Easy' ? 'bg-emerald-500' : level === 'Medium' ? 'bg-indigo-600' : 'bg-rose-500';
                    const textColor = level === 'Easy' ? 'text-emerald-600' : level === 'Medium' ? 'text-indigo-600' : 'text-rose-600';
                    return (
                      <div key={level} className="flex items-center justify-between text-xs font-mono">
                        <span className={`w-16 font-semibold ${textColor}`}>{level}</span>
                        <div className="flex-1 mx-3 bg-slate-100 h-2 rounded-full overflow-hidden">
                          <div className={`${barColor} h-full rounded-full`} style={{ width: `${pct}%` }} />
                        </div>
                        <span className="text-slate-500 w-12 text-right">{count} ({pct}%)</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Source verification code */}
              <div className="pt-4 border-t border-slate-50 flex items-center justify-between text-[10px] font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <FileCode className="w-3.5 h-3.5 text-slate-300" /> FILE SOURCE:
                </span>
                <span className="bg-slate-50 border border-slate-100 px-1.5 py-0.5 rounded text-[9px] uppercase tracking-wider max-w-[200px] truncate">
                  content/.../{chapter.id}.json
                </span>
              </div>
            </div>
          </div>

          {/* Right Block (7 cols): Mode Launchers */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* AI Virtual Teacher Exam Prep Hub */}
            <div className="bg-gradient-to-br from-indigo-50/70 to-slate-50 border border-indigo-100 p-5 rounded-2xl shadow-xs space-y-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-100/30 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-3.5 relative">
                <div className="p-2.5 bg-indigo-600 rounded-xl text-white shadow-md shadow-indigo-100 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-display text-base font-bold text-slate-800">
                      AI Virtual Teacher Hub
                    </h4>
                    <span className="px-1.5 py-0.5 bg-indigo-100 text-indigo-700 text-[9px] font-bold font-mono tracking-wider uppercase rounded">
                      BLUEPRINT GENERATOR
                    </span>
                  </div>
                  <p className="text-slate-500 text-xs leading-relaxed">
                    This chapter currently has <strong className="text-slate-800">{questions.length} questions</strong>. Activating your virtual teacher will dynamically research standard exam blueprints {subjectName.includes("Claude") || chapter.id.includes("claude") ? "(Anthropic Claude CCAF, MCP Tool Architecture, Prompt Engineering)" : "(CIL MT, GATE, ISRO)"} to curate and verify up to <strong className="text-slate-800">100+ highly rigorous questions</strong> with detailed step-by-step explanations and strategy shortcuts.
                  </p>
                </div>
              </div>

              {expansionStatus && (
                <div className={`p-3.5 rounded-xl text-xs font-mono border leading-relaxed ${
                  expansionStatus.startsWith("Virtual Teacher Error") 
                    ? "bg-rose-50 border-rose-100 text-rose-700" 
                    : expansionStatus.startsWith("Virtual Teacher:") 
                      ? "bg-emerald-50 border-emerald-100 text-emerald-700"
                      : "bg-indigo-50/50 border-indigo-100/50 text-indigo-700 animate-pulse"
                }`}>
                  {expansionStatus}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  onClick={() => handleExpandChapter(15)}
                  disabled={expanding}
                  className="inline-flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:cursor-not-allowed text-white font-semibold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-xs cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {expanding ? "Curating Questions..." : "Add 15 Premium Questions"}
                </button>
                <button
                  onClick={() => handleExpandChapter(30)}
                  disabled={expanding}
                  className="inline-flex items-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 active:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed text-slate-700 font-semibold text-xs px-4.5 py-2.5 rounded-xl transition-all shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-indigo-500" />
                  {expanding ? "Conducting Research..." : "Add 30 Premium Questions"}
                </button>
              </div>
            </div>

            <h3 className="font-display text-sm font-bold text-slate-800 uppercase tracking-wider font-mono pt-2">
              Launch Flight Practice Modes
            </h3>

            {/* Standard Practice Mode */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-6 hover:shadow-md hover:border-slate-200/80 transition-all">
              <div className="space-y-1.5">
                <h4 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                  <Play className="w-4 h-4 text-emerald-500 fill-emerald-500" /> Standard Exam Practice
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  Practice all {questions.length} questions in sequence. Ideal for initial chapter coverage, complete reviews, and deep learning.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Target: Complete {questions.length - answeredQuestionsCount} unattempted questions
                </div>
              </div>
              <button 
                onClick={() => onStartSession(questions, 'practice', chapter.id, chapter.name, subjectName)}
                disabled={questions.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 disabled:opacity-50 text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-emerald-50 shrink-0 self-stretch sm:self-center"
              >
                Launch Practice
              </button>
            </div>

            {/* Revision Mode */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-6 hover:shadow-md hover:border-slate-200/80 transition-all">
              <div className="space-y-1.5">
                <h4 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 text-indigo-600" /> Chapter Smart Revision
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  Targeted set consisting of answered questions that were either solved incorrectly or solved with low confidence levels ('Guess').
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Target: <strong>{revisionQuestions.length}</strong> focus questions identified
                </div>
              </div>
              <button 
                onClick={() => onStartSession(revisionQuestions, 'revision', chapter.id, chapter.name, subjectName)}
                disabled={revisionQuestions.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-indigo-50 shrink-0 self-stretch sm:self-center"
              >
                Launch Revision
              </button>
            </div>

            {/* Mistakes Only Mode */}
            <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row items-start justify-between gap-6 hover:shadow-md hover:border-slate-200/80 transition-all">
              <div className="space-y-1.5">
                <h4 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-500" /> Mistakes-Only Clearance
                </h4>
                <p className="text-slate-400 text-xs leading-relaxed max-w-md">
                  Isolate and practice ONLY the questions from this chapter that are currently incorrect inside your Mistake Book. Getting them right removes them.
                </p>
                <div className="text-[10px] font-mono text-slate-400 pt-1">
                  Target: <strong>{mistakesQuestions.length}</strong> active unresolved mistakes
                </div>
              </div>
              <button 
                onClick={() => onStartSession(mistakesQuestions, 'mistakes', chapter.id, chapter.name, subjectName)}
                disabled={mistakesQuestions.length === 0}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rose-600 hover:bg-rose-700 active:bg-rose-800 disabled:opacity-50 disabled:bg-slate-100 disabled:text-slate-400 disabled:shadow-none text-white font-semibold text-xs px-5 py-3 rounded-xl transition-all cursor-pointer shadow-sm shadow-rose-50 shrink-0 self-stretch sm:self-center"
              >
                Clear Mistakes
              </button>
            </div>

          </div>

        </div>
      )}
    </div>
  );
}

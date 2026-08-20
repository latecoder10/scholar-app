/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { 
  BookOpen, 
  ChevronLeft, 
  Layers, 
  HelpCircle, 
  Award, 
  BarChart,
  CheckCircle2, 
  Play, 
  ShieldCheck,
  Zap
} from "lucide-react";
import { Subject, Chapter, UserProgress, parseProgressKey } from "../types";

interface SubjectViewProps {
  subject: Subject;
  progress: UserProgress;
  onBack: () => void;
  onSelectChapter: (subjectName: string, chapter: Chapter) => void;
  onQuickPractice: (subjectName: string, chapter: Chapter) => void;
}

export default function SubjectView({ subject, progress, onBack, onSelectChapter, onQuickPractice }: SubjectViewProps) {
  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [subject.name]);

  const attemptedKeys = Object.keys(progress.answeredQuestions);

  // Calculate subject-specific stats
  let totalQuestions = 0;
  let totalAttempted = 0;
  let correctCount = 0;

  const chaptersWithStats = subject.chapters.map((chap) => {
    let chapAttempted = 0;
    let chapCorrect = 0;

    attemptedKeys.forEach((key) => {
      const entry = progress.answeredQuestions[key];
      const parsed = parseProgressKey(key, entry);
      if (parsed.subject === subject.name && parsed.chapterId === chap.id) {
        chapAttempted++;
        if (entry.isCorrect) {
          chapCorrect++;
        }
      }
    });

    totalQuestions += chap.questionsCount;
    totalAttempted += chapAttempted;
    correctCount += chapCorrect;

    const accuracy = chapAttempted > 0 ? Math.round((chapCorrect / chapAttempted) * 100) : 0;
    const coverage = chap.questionsCount > 0 ? Math.round((chapAttempted / chap.questionsCount) * 100) : 0;

    let status: "Not Started" | "In Progress" | "Completed" = "Not Started";
    if (chapAttempted === chap.questionsCount && chap.questionsCount > 0) {
      status = "Completed";
    } else if (chapAttempted > 0) {
      status = "In Progress";
    }

    return {
      ...chap,
      attempted: chapAttempted,
      correct: chapCorrect,
      accuracy,
      coverage,
      status,
    };
  });

  const subjectAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const subjectCoverage = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Subject Header */}
      <div className="space-y-4">
        <button
          onClick={onBack}
          className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors gap-1 hover:-translate-x-0.5 transition-transform"
        >
          <ChevronLeft className="w-4 h-4" /> Back to subjects
        </button>

        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-slate-50 border border-slate-100 p-4 sm:p-6 rounded-2xl">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-indigo-50 border border-indigo-100 text-indigo-700 text-[10px] font-bold tracking-wide uppercase rounded">
              Subject
            </div>
            <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 tracking-tight mt-1.5">
              {subject.name}
            </h1>
            <p className="text-slate-400 text-xs mt-1">
              Discovered {subject.chapters.length} chapters containing {subject.totalQuestions} potential exam questions.
            </p>
          </div>

          <div className="flex items-center gap-6 divide-x divide-slate-100 shrink-0 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-slate-100">
            <div className="text-left pr-6">
              <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase block">Coverage</span>
              <span className="text-2xl font-bold font-display text-slate-800 leading-none block mt-1">{subjectCoverage}%</span>
            </div>
            <div className="text-left pl-6">
              <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase block">Accuracy</span>
              <span className="text-2xl font-bold font-display text-slate-800 leading-none block mt-1">{subjectAccuracy}%</span>
            </div>
            <div className="text-left pl-6">
              <span className="text-[10px] font-bold text-slate-400 tracking-wide uppercase block">Solved</span>
              <span className="text-2xl font-bold font-display text-slate-800 leading-none block mt-1">{correctCount}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Chapters Grid */}
      <div className="space-y-4">
        <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
          <Layers className="w-4 h-4 text-indigo-600" /> Discovered Chapters
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {chaptersWithStats.map((chapter) => (
            <div 
              key={chapter.id} 
              className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md hover:border-slate-200 transition-all flex flex-col justify-between"
            >
              <div className="space-y-2">
                <div className="flex justify-between items-start gap-4">
                  <h4 className="font-display text-base font-bold text-slate-800 leading-snug line-clamp-1">
                    {chapter.name}
                  </h4>
                  {chapter.status === "Completed" ? (
                    <span className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[9px] font-bold uppercase tracking-wide rounded">
                      Completed
                    </span>
                  ) : chapter.status === "In Progress" ? (
                    <span className="px-2 py-0.5 bg-amber-50 border border-amber-100 text-amber-700 text-[9px] font-bold uppercase tracking-wide rounded">
                      In Progress
                    </span>
                  ) : (
                    <span className="px-2 py-0.5 bg-slate-50 border border-slate-100 text-slate-400 text-[9px] font-bold uppercase tracking-wide rounded">
                      Not Started
                    </span>
                  )}
                </div>

                <p className="text-slate-400 text-xs line-clamp-2 leading-relaxed">
                  {chapter.description || "No custom description available for this content pack. Double-click the file to add one."}
                </p>
              </div>

              {/* Progress and Action Section */}
              <div className="mt-5 pt-4 border-t border-slate-50 space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wide uppercase">Questions</span>
                    <span className="text-sm font-bold text-slate-700 block mt-0.5">{chapter.questionsCount}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wide uppercase">Attempted</span>
                    <span className="text-sm font-bold text-slate-700 block mt-0.5">{chapter.attempted}</span>
                  </div>
                  <div className="bg-slate-50/50 p-2 rounded-xl text-center">
                    <span className="text-[9px] font-bold text-slate-400 block tracking-wide uppercase">Accuracy</span>
                    <span className={`text-sm font-bold block mt-0.5 ${
                      chapter.attempted === 0 
                        ? "text-slate-400" 
                        : chapter.accuracy >= 80 
                        ? "text-emerald-600" 
                        : chapter.accuracy >= 60 
                        ? "text-indigo-600" 
                        : "text-rose-500"
                    }`}>
                      {chapter.attempted > 0 ? `${chapter.accuracy}%` : "—"}
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                {chapter.attempted > 0 && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] font-mono text-slate-400">
                      <span>Chapter Coverage</span>
                      <span>{chapter.coverage}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className={`h-full rounded-full transition-all ${
                          chapter.coverage === 100 ? "bg-emerald-500" : "bg-indigo-600"
                        }`} 
                        style={{ width: `${chapter.coverage}%` }} 
                      />
                    </div>
                  </div>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => onQuickPractice(subject.name, chapter)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs py-2.5 min-h-11 sm:min-h-0 rounded-xl transition-colors cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-white" /> Practice
                  </button>
                  <button
                    onClick={() => onSelectChapter(subject.name, chapter)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-semibold text-xs py-2.5 min-h-11 sm:min-h-0 rounded-xl transition-colors cursor-pointer"
                  >
                    Open chapter
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

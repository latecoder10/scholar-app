/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { 
  Play, 
  Award, 
  BookOpen, 
  AlertTriangle, 
  Clock, 
  ChevronRight, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Flame,
  BrainCircuit,
  GraduationCap,
  Sparkles,
  Layers,
  ShieldCheck,
  Zap
} from "lucide-react";
import { Subject, UserProgress, Chapter, parseProgressKey } from "../types";
import { AVAILABLE_EXAMS } from "./ExamSelectorModal";

interface DashboardProps {
  subjects: Subject[];
  progress: UserProgress;
  selectedExam: string; // 'all' | 'claude-ccaf' | 'cil-mt'
  onOpenExamSelector: () => void;
  onSelectChapter: (subject: string, chapter: Chapter) => void;
  onNavigate: (tab: string) => void;
}

export default function Dashboard({ 
  subjects, 
  progress, 
  selectedExam, 
  onOpenExamSelector, 
  onSelectChapter, 
  onNavigate 
}: DashboardProps) {
  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [selectedExam]);

  // Filter subjects according to selectedExam
  const filteredSubjects = subjects.filter((s) => {
    if (selectedExam === "all") return true;
    if (selectedExam === "claude-ccaf") {
      return s.exam === "Claude CCAF" || s.name.toLowerCase().includes("ccaf");
    }
    if (selectedExam === "cil-mt") {
      return s.exam !== "Claude CCAF" && !s.name.toLowerCase().includes("ccaf");
    }
    return true;
  });

  const currentExamConfig = AVAILABLE_EXAMS.find(e => e.id === selectedExam) || AVAILABLE_EXAMS[0];

  // 1. Calculate overall stats for active view
  const totalQuestions = filteredSubjects.reduce((sum, s) => sum + s.totalQuestions, 0);
  const attemptedKeys = Object.keys(progress.answeredQuestions);
  
  // Filter attempted keys to active subjects
  const activeAttemptedKeys = attemptedKeys.filter(key => {
    const entry = progress.answeredQuestions[key];
    const parsed = parseProgressKey(key, entry);
    return filteredSubjects.some(s => s.name === parsed.subject);
  });

  const totalAttempted = activeAttemptedKeys.length;
  
  const correctCount = activeAttemptedKeys.filter(
    (key) => progress.answeredQuestions[key].isCorrect
  ).length;

  const overallAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const overallCoverage = totalQuestions > 0 ? Math.round((totalAttempted / totalQuestions) * 100) : 0;

  // Track specific subsets
  const isClaudeActive = selectedExam === "claude-ccaf";
  const isCilActive = selectedExam === "cil-mt";
  const isAllActive = selectedExam === "all";

  // Filter mistakes count by selected exam track
  const filteredMistakes = (progress.mistakes || []).filter(m => {
    if (selectedExam === "all") return true;
    const isClaude = m.exam === "Claude CCAF" || 
      (m.subject && (m.subject.includes("Claude") || m.subject.includes("CCAF") || m.subject.includes("MCP") || m.subject.includes("Agentic") || m.subject.includes("Prompt") || m.subject.includes("Context") || m.subject.includes("Enterprise"))) ||
      (m.chapterId && m.chapterId.includes("claude"));
    if (selectedExam === "claude-ccaf") return isClaude;
    if (selectedExam === "cil-mt") return !isClaude;
    return true;
  });

  // Calculate very sure percentage
  const verySureCount = activeAttemptedKeys.filter(
    (key) => progress.answeredQuestions[key].confidence === "Very Sure"
  ).length;
  const verySureRatio = totalAttempted > 0 ? verySureCount / totalAttempted : 0;

  // Readiness Score: Weighted combination of coverage (40%), accuracy (40%), and high confidence ratio (20%)
  const readinessScore = Math.round(
    (overallCoverage * 0.4) + (overallAccuracy * 0.4) + (verySureRatio * 100 * 0.2)
  );

  // 2. Identify weak chapters (< 60% accuracy or heavily missed)
  const chaptersWithAttempts: { chapter: Chapter; attempted: number; correct: number; accuracy: number }[] = [];
  
  filteredSubjects.forEach((subj) => {
    subj.chapters.forEach((chap) => {
      let chapAttempted = 0;
      let chapCorrect = 0;
      
      activeAttemptedKeys.forEach((key) => {
        const entry = progress.answeredQuestions[key];
        const parsed = parseProgressKey(key, entry);
        if (parsed.subject === subj.name && parsed.chapterId === chap.id) {
          chapAttempted++;
          if (entry.isCorrect) {
            chapCorrect++;
          }
        }
      });

      if (chapAttempted > 0) {
        chaptersWithAttempts.push({
          chapter: chap,
          attempted: chapAttempted,
          correct: chapCorrect,
          accuracy: Math.round((chapCorrect / chapAttempted) * 100)
        });
      }
    });
  });

  // Sort by accuracy (lowest first) to find weak chapters
  const weakChapters = chaptersWithAttempts
    .filter((c) => c.accuracy < 60 || (c.attempted - c.correct) > 2)
    .sort((a, b) => a.accuracy - b.accuracy)
    .slice(0, 3);

  // 3. Continue Learning: Find chapter with recent activity in filtered subjects OR first unattempted
  let continueChapter: { subjectName: string; chapter: Chapter } | null = null;
  
  if (progress.recentActivity.length > 0) {
    for (const recent of progress.recentActivity) {
      const matchSubject = filteredSubjects.find((s) => s.name === recent.subject);
      if (matchSubject) {
        const matchChapter = matchSubject.chapters.find((c) => c.id === recent.chapterId);
        if (matchChapter) {
          continueChapter = { subjectName: matchSubject.name, chapter: matchChapter };
          break;
        }
      }
    }
  }

  // Fallback: If no activity, suggest first unattempted chapter in filtered list
  if (!continueChapter && filteredSubjects.length > 0) {
    for (const subj of filteredSubjects) {
      for (const chap of subj.chapters) {
        const chapKeys = activeAttemptedKeys.filter(k => k.startsWith(`${subj.name}:${chap.id}:`));
        if (chapKeys.length < chap.questionsCount) {
          continueChapter = { subjectName: subj.name, chapter: chap };
          break;
        }
      }
      if (continueChapter) break;
    }
  }

  // Fallback 2: Grab the first chapter
  if (!continueChapter && filteredSubjects.length > 0 && filteredSubjects[0].chapters.length > 0) {
    continueChapter = { subjectName: filteredSubjects[0].name, chapter: filteredSubjects[0].chapters[0] };
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 1. Exam Target Track Header / Switcher Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 border border-slate-700/60 p-6 sm:p-7 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-5">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2.5">
              <span className={`px-2.5 py-1 rounded-lg text-xs font-mono font-bold uppercase tracking-wider inline-flex items-center gap-1.5 ${
                isClaudeActive
                  ? "bg-purple-500/20 text-purple-300 border border-purple-400/30"
                  : isCilActive
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/30"
                  : "bg-indigo-500/20 text-indigo-300 border border-indigo-400/30"
              }`}>
                {isClaudeActive ? (
                  <BrainCircuit className="w-3.5 h-3.5" />
                ) : isCilActive ? (
                  <GraduationCap className="w-3.5 h-3.5" />
                ) : (
                  <Layers className="w-3.5 h-3.5" />
                )}
                {currentExamConfig.shortName} Track
              </span>

              <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-md flex items-center gap-1">
                <Flame className="w-3 h-3 text-emerald-400 animate-pulse" />
                AUTO-DISCOVERY READY
              </span>
            </div>

            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              {isClaudeActive 
                ? "Claude CCAF Mission Control" 
                : isCilActive 
                ? "CIL MT Mission Control" 
                : "Unified Exam Mission Control"}
            </h1>
            
            <p className="text-slate-300 text-xs sm:text-sm max-w-2xl leading-relaxed">
              {currentExamConfig.description}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            <button
              onClick={onOpenExamSelector}
              className="inline-flex items-center gap-2 bg-white/10 hover:bg-white/20 active:bg-white/25 border border-white/20 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs backdrop-blur-xs"
            >
              <Sparkles className="w-4 h-4 text-indigo-300" />
              Switch Target Track
            </button>
            <button
              onClick={() => onNavigate("mock-tests")}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white font-mono text-xs font-bold px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-xs"
            >
              <Award className="w-4 h-4" />
              Mock Tests
            </button>
          </div>
        </div>
      </div>

      {/* 2. Top Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Coverage Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Syllabus Coverage</span>
            <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-slate-800">{overallCoverage}%</span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">({totalAttempted} / {totalQuestions} qns)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-blue-600 h-full rounded-full transition-all duration-500" style={{ width: `${overallCoverage}%` }} />
          </div>
        </div>

        {/* Accuracy Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Test Accuracy</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-slate-800">{overallAccuracy}%</span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">({correctCount} solved)</span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${overallAccuracy}%` }} />
          </div>
        </div>

        {/* Readiness Score Widget */}
        <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all">
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Readiness Index</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-slate-800">{readinessScore}%</span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">
              {isClaudeActive ? "CCAF Target" : isCilActive ? "GATE/PSU Target" : "Mastery Level"}
            </span>
          </div>
          <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
            <div className="bg-indigo-600 h-full rounded-full transition-all duration-500" style={{ width: `${readinessScore}%` }} />
          </div>
        </div>

        {/* Mistakes Widget */}
        <div 
          onClick={() => onNavigate("mistakes")}
          className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group"
        >
          <div className="flex justify-between items-start">
            <span className="text-xs font-semibold text-slate-400 font-mono tracking-wider uppercase">Mistake Book</span>
            <div className="p-2 bg-rose-50 text-rose-600 rounded-lg group-hover:bg-rose-100 transition-colors">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-4">
            <span className="text-3xl font-bold font-display text-slate-800">{filteredMistakes.length}</span>
            <span className="text-xs text-slate-400 ml-1.5 font-mono">unresolved items</span>
          </div>
          <div className="mt-3 flex items-center text-xs text-rose-600 font-semibold font-mono gap-1 group-hover:translate-x-1 transition-transform">
            Go to Mistake Book <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* 3. Track-Specific Domain / Paper Overview */}
      {isClaudeActive ? (
        <div className="bg-white border border-slate-100 p-6 rounded-3xl shadow-xs">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-4 border-b border-slate-100">
            <div>
              <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 border border-purple-100 px-2 py-0.5 rounded-md uppercase">
                ANTHROPIC CLAUDE CERTIFICATION DOMAINS
              </span>
              <h3 className="font-display font-extrabold text-slate-900 text-lg mt-1">
                Claude Certified Architect - Foundations (CCAF) Syllabus
              </h3>
            </div>
            <span className="text-xs font-mono text-slate-500 font-bold bg-slate-50 border border-slate-200 px-3 py-1 rounded-lg">
              {filteredSubjects.length} Specialized Domains • {totalQuestions} Questions
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-5">
            {filteredSubjects.map((sub, idx) => {
              const subQuestions = sub.totalQuestions;
              const subAttempted = activeAttemptedKeys.filter(k => k.startsWith(`${sub.name}:`)).length;
              const subCoverage = subQuestions > 0 ? Math.round((subAttempted / subQuestions) * 100) : 0;

              return (
                <div 
                  key={sub.name}
                  onClick={() => onNavigate("subjects")}
                  className="p-4 rounded-2xl border border-slate-150 hover:border-purple-300 hover:bg-purple-50/20 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md">
                      Domain {idx + 1}
                    </span>
                    <span className="text-xs font-mono text-slate-400 font-semibold">{sub.chapters.length} Modules</span>
                  </div>
                  <h4 className="font-display font-bold text-slate-800 text-sm mt-2 group-hover:text-purple-700 transition-colors">
                    {sub.name}
                  </h4>
                  <div className="mt-3 flex items-center justify-between text-xs font-mono text-slate-500">
                    <span>{subAttempted}/{subQuestions} solved</span>
                    <span className="font-bold text-slate-700">{subCoverage}%</span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                    <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${subCoverage}%` }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : isCilActive ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Paper I Block */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full blur-xl -z-10" />
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md uppercase">STAGE I - NON-TECH</span>
                <h3 className="font-display font-extrabold text-slate-800 text-sm mt-1">Paper I: General Aptitude & Reasoning</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">General Aptitude</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold font-mono block tracking-wider">COVERAGE</span>
                <span className="text-xl font-bold text-slate-800 font-display">{overallCoverage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold font-mono block tracking-wider">ACCURACY</span>
                <span className="text-xl font-bold text-slate-800 font-display">{overallAccuracy}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-indigo-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallCoverage}%` }} />
            </div>
          </div>

          {/* Paper II Block */}
          <div className="bg-white border border-slate-100 p-5 rounded-2xl shadow-xs relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-xl -z-10" />
            <div className="flex justify-between items-center pb-3 border-b border-slate-100">
              <div>
                <span className="text-[9px] font-mono font-bold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded-md uppercase">STAGE II - TECHNICAL</span>
                <h3 className="font-display font-extrabold text-slate-800 text-sm mt-1">Paper II: Computer Science & Systems</h3>
              </div>
              <span className="text-xs font-mono text-slate-400 font-bold bg-slate-50 px-2 py-1 rounded-md">Technical CS</span>
            </div>
            <div className="grid grid-cols-2 gap-4 mt-4">
              <div>
                <span className="text-[10px] text-slate-400 font-semibold font-mono block tracking-wider">COVERAGE</span>
                <span className="text-xl font-bold text-slate-800 font-display">{overallCoverage}%</span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 font-semibold font-mono block tracking-wider">ACCURACY</span>
                <span className="text-xl font-bold text-slate-800 font-display">{overallAccuracy}%</span>
              </div>
            </div>
            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-4 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-300" style={{ width: `${overallCoverage}%` }} />
            </div>
          </div>
        </div>
      ) : (
        /* All Examinations View */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div 
            onClick={() => onNavigate("subjects")}
            className="bg-white border-2 border-purple-200/80 p-6 rounded-3xl shadow-3xs hover:border-purple-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-purple-100 text-purple-700 rounded-xl">
                <BrainCircuit className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md uppercase">Track 1</span>
                <h4 className="font-display font-extrabold text-slate-900 text-base">Claude CCAF Architect</h4>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              Agentic loops, MCP tool design, Claude Code workflows, and prompt caching.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-mono font-bold text-purple-700">
              <span>View 6 Domains & Mock Sets</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          <div 
            onClick={() => onNavigate("subjects")}
            className="bg-white border-2 border-amber-200/80 p-6 rounded-3xl shadow-3xs hover:border-amber-400 hover:shadow-md transition-all cursor-pointer relative overflow-hidden group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className="p-2.5 bg-amber-100 text-amber-800 rounded-xl">
                <GraduationCap className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-mono font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-md uppercase">Track 2</span>
                <h4 className="font-display font-extrabold text-slate-900 text-base">Coal India MT (Systems)</h4>
              </div>
            </div>
            <p className="text-xs text-slate-500 line-clamp-2">
              General Aptitude, Reasoning, CS Systems, DBMS, OS, Networks, Algorithms, and Mock Tests.
            </p>
            <div className="mt-4 flex items-center justify-between text-xs font-mono font-bold text-amber-800">
              <span>View Technical Syllabus</span>
              <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      )}

      {/* 4. Action and Info Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column (8 cols): Continue Learning & Weak Areas */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* Continue Learning */}
          {continueChapter && (
            <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50 rounded-full blur-3xl -z-10 opacity-70" />
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-1 bg-indigo-50 border border-indigo-100 text-indigo-700 rounded-md text-[10px] font-bold font-mono tracking-wider uppercase">
                      {continueChapter.subjectName}
                    </span>
                    {continueChapter.chapter.exam && (
                      <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-[9px] font-mono font-semibold">
                        {continueChapter.chapter.exam}
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-bold text-slate-800 font-display">
                    {continueChapter.chapter.name}
                  </h3>
                  <p className="text-slate-400 text-xs line-clamp-1">
                    {continueChapter.chapter.description || "Pick up where you left off to accelerate your exam readiness."}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-mono text-slate-400 pt-1.5">
                    <span>Questions: <strong>{continueChapter.chapter.questionsCount}</strong></span>
                    <span>•</span>
                    <span>Attempted: <strong>{
                      activeAttemptedKeys.filter(k => k.startsWith(`${continueChapter!.subjectName}:${continueChapter!.chapter.id}:`)).length
                    }</strong></span>
                  </div>
                </div>
                <button 
                  onClick={() => onSelectChapter(continueChapter!.subjectName, continueChapter!.chapter)}
                  className="inline-flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-sm px-5 py-3 rounded-xl transition-all shadow-sm hover:shadow-indigo-100 shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-white text-white" /> Continue Practice
                </button>
              </div>
            </div>
          )}

          {/* Weak Chapters (If any exist) */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500" /> Focus Target Areas
              </h3>
              <span className="text-xs text-slate-400 font-mono">Accuracy &lt; 60%</span>
            </div>

            {weakChapters.length > 0 ? (
              <div className="divide-y divide-slate-50">
                {weakChapters.map(({ chapter, attempted, correct, accuracy }) => (
                  <div key={chapter.id} className="py-4 first:pt-0 last:pb-0 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-slate-800 font-display">{chapter.name}</span>
                        <span className="text-xs text-slate-400 font-mono">({chapter.subject})</span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
                        <span>Attempted: <strong>{attempted}</strong></span>
                        <span>•</span>
                        <span>Correct: <strong className="text-emerald-500">{correct}</strong></span>
                        <span>•</span>
                        <span>Accuracy: <strong className="text-rose-500">{accuracy}%</strong></span>
                      </div>
                    </div>
                    <button 
                      onClick={() => onSelectChapter(chapter.subject, chapter)}
                      className="inline-flex items-center justify-center gap-1.5 text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-3 py-1.5 rounded-lg hover:bg-indigo-100 hover:border-indigo-200 transition-all shrink-0 self-start sm:self-center cursor-pointer"
                    >
                      Re-train <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-100 rounded-xl bg-slate-50/50">
                <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto opacity-70" />
                <p className="text-sm text-slate-500 mt-2 font-medium">No critical weak chapters detected yet!</p>
                <p className="text-xs text-slate-400 mt-0.5">Complete more question practices to populate focus points.</p>
              </div>
            )}
          </div>

          {/* Quick Help / Exam Guide Info */}
          <div className="bg-slate-50 border border-slate-200/80 p-6 rounded-2xl flex items-start gap-4">
            <span className="text-2xl mt-0.5">💡</span>
            <div>
              <h4 className="text-sm font-bold text-slate-800 font-display">
                {isClaudeActive 
                  ? "Claude CCAF Certification Strategy" 
                  : "Exam Preparation Strategy"}
              </h4>
              <p className="text-xs text-slate-600 leading-relaxed mt-1">
                {isClaudeActive 
                  ? "The Claude Certified Architect - Foundations (CCAF) exam tests practical tool schema design, error boundaries, subagent context hygiene, and prompt caching. Practice with the Mock Test Arena to master real-world diagnostic patterns."
                  : "Exam Scholar Hub covers both technical disciplines and AI architecture certifications. Use the Revision Engine to build custom multi-topic packs and the Mistake Book to eliminate recurring errors."}
              </p>
            </div>
          </div>

        </div>

        {/* Right Column (4 cols): Recent Activity Feed */}
        <div className="lg:col-span-4">
          <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-xs h-full flex flex-col">
            <div className="flex items-center justify-between pb-4 border-b border-slate-50 mb-4">
              <h3 className="font-display text-base font-bold text-slate-800 flex items-center gap-2">
                <Clock className="w-4 h-4 text-slate-500" /> Recent Activity
              </h3>
              <span className="text-[10px] font-mono bg-slate-100 text-slate-500 px-2 py-0.5 rounded-md">LIVE LOG</span>
            </div>

            {progress.recentActivity.length > 0 ? (
              <div className="space-y-4 overflow-y-auto max-h-[420px] pr-1 flex-1">
                {progress.recentActivity.slice(0, 10).map((activity, idx) => (
                  <div key={idx} className="flex gap-3 group">
                    <div className="flex flex-col items-center">
                      <div className="z-10">
                        {activity.isCorrect ? (
                          <CheckCircle className="w-5 h-5 text-emerald-500 bg-white rounded-full" />
                        ) : (
                          <XCircle className="w-5 h-5 text-rose-500 bg-white rounded-full" />
                        )}
                      </div>
                      {idx !== progress.recentActivity.slice(0, 10).length - 1 && (
                        <div className="w-0.5 bg-slate-100 flex-1 my-1" />
                      )}
                    </div>
                    <div className="pb-4 last:pb-0 space-y-1">
                      <div className="text-xs font-semibold text-slate-800 leading-none">
                        QID #{activity.questionId} in {activity.chapterName}
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">
                        {activity.subject} • {new Date(activity.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                      <div className="flex gap-1.5 pt-0.5">
                        <span className={`text-[9px] px-1.5 py-0.5 rounded font-mono font-medium ${
                          activity.confidence === "Very Sure" 
                            ? "bg-indigo-50 text-indigo-700" 
                            : activity.confidence === "Somewhat Sure"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                        }`}>
                          {activity.confidence}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center border border-dashed border-slate-100 rounded-xl bg-slate-50/30 flex-1">
                <Clock className="w-8 h-8 text-slate-300 stroke-1" />
                <p className="text-sm text-slate-500 mt-2 font-medium">Log empty</p>
                <p className="text-xs text-slate-400 mt-0.5">Activity results appear in real-time as you practice questions.</p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

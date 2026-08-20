/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect } from "react";
import { 
  BarChart, 
  Award, 
  TrendingUp, 
  CheckCircle, 
  AlertTriangle, 
  Compass, 
  ShieldCheck, 
  Target, 
  Sliders 
} from "lucide-react";
import { Subject, UserProgress, parseProgressKey } from "../types";
import { getExamById, resolveExamForSubject } from "../../shared/exams";

interface AnalyticsViewProps {
  subjects: Subject[];
  progress: UserProgress;
  selectedExam?: string;
}

export default function AnalyticsView({ subjects, progress, selectedExam = "all" }: AnalyticsViewProps) {
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
    return resolveExamForSubject(s).id === selectedExam;
  });

  const attemptedKeys = Object.keys(progress.answeredQuestions);
  
  // Filter attempted keys to active subjects
  const activeAttemptedKeys = attemptedKeys.filter(key => {
    if (selectedExam === "all") return true;
    const entry = progress.answeredQuestions[key];
    const parsed = parseProgressKey(key, entry);
    return filteredSubjects.some(s => s.name === parsed.subject);
  });

  const totalQuestionsCount = filteredSubjects.reduce((sum, s) => sum + s.totalQuestions, 0);
  const totalAttempted = activeAttemptedKeys.length;
  
  const correctCount = activeAttemptedKeys.filter(
    (key) => progress.answeredQuestions[key].isCorrect
  ).length;

  const overallAccuracy = totalAttempted > 0 ? Math.round((correctCount / totalAttempted) * 100) : 0;
  const overallCoverage = totalQuestionsCount > 0 ? Math.round((totalAttempted / totalQuestionsCount) * 100) : 0;

  // Calculate very sure ratio
  const verySureCount = activeAttemptedKeys.filter(
    (key) => progress.answeredQuestions[key].confidence === "Very Sure"
  ).length;
  const verySureRatio = totalAttempted > 0 ? verySureCount / totalAttempted : 0;

  // Readiness score
  const readinessScore = Math.round(
    (overallCoverage * 0.4) + (overallAccuracy * 0.4) + (verySureRatio * 100 * 0.2)
  );

  // Readiness tier
  let readinessTier = "Getting Started";
  let rankDesc = "Work through more chapters to start building your readiness score.";
  let rankColor = "text-slate-500 border-slate-200 bg-slate-50";

  const examTargetName = selectedExam === "all" ? "Competitive Exam" : (getExamById(selectedExam)?.analyticsTargetName || getExamById(selectedExam)?.shortName || "Competitive Exam");

  if (readinessScore >= 80) {
    readinessTier = "Exam Ready";
    rankDesc = `Strong coverage, accuracy, and confidence. You're in good shape for the ${examTargetName}.`;
    rankColor = "text-emerald-700 border-emerald-200 bg-emerald-50/50";
  } else if (readinessScore >= 60) {
    readinessTier = "On Track";
    rankDesc = "Solid progress. Review your Mistakes list to turn guesses into sure knowledge.";
    rankColor = "text-indigo-700 border-indigo-200 bg-indigo-50/40";
  } else if (readinessScore >= 30) {
    readinessTier = "Building Momentum";
    rankDesc = "Good foundation. Keep increasing chapter coverage to move up.";
    rankColor = "text-amber-700 border-amber-200 bg-amber-50/40";
  }

  // Calculate Subject Level Analytics
  const subjectStats = filteredSubjects.map((subj) => {
    let attempted = 0;
    let correct = 0;
    
    activeAttemptedKeys.forEach((key) => {
      const entry = progress.answeredQuestions[key];
      const parsed = parseProgressKey(key, entry);
      if (parsed.subject === subj.name) {
        attempted++;
        if (entry.isCorrect) {
          correct++;
        }
      }
    });

    const accuracy = attempted > 0 ? Math.round((correct / attempted) * 100) : 0;
    const coverage = subj.totalQuestions > 0 ? Math.round((attempted / subj.totalQuestions) * 100) : 0;

    return {
      name: subj.name,
      paper: subj.paper,
      total: subj.totalQuestions,
      attempted,
      correct,
      accuracy,
      coverage
    };
  });

  // Calculate Metacognitive Calibration (Accuracy by Confidence Level)
  const confidenceStats = ["Guess", "Somewhat Sure", "Very Sure"].map((level) => {
    const keys = activeAttemptedKeys.filter((k) => progress.answeredQuestions[k].confidence === level);
    const count = keys.length;
    const correct = keys.filter((k) => progress.answeredQuestions[k].isCorrect).length;
    const accuracy = count > 0 ? Math.round((correct / count) * 100) : 0;

    return {
      level,
      count,
      correct,
      accuracy
    };
  });

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Banner */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-slate-100 p-4 sm:p-6 rounded-2xl shadow-xs">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold text-slate-800 tracking-tight flex items-center gap-2">
            <BarChart className="w-7 h-7 text-indigo-600" /> Analytics
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl">
            Track your coverage, accuracy, and confidence, and see where your strengths and weak spots are.
          </p>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Readiness gauge & tier (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-xs text-center space-y-6">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide block">Overall Readiness</span>
            
            {/* Circle progress bar */}
            <div className="relative w-40 h-40 mx-auto flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="stroke-slate-100 fill-transparent stroke-[8]" 
                />
                <circle 
                  cx="80" 
                  cy="80" 
                  r="70" 
                  className="stroke-indigo-600 fill-transparent stroke-[8] transition-all duration-1000"
                  strokeDasharray={439.8}
                  strokeDashoffset={439.8 - (439.8 * readinessScore) / 100}
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-4xl font-extrabold font-display text-slate-800">{readinessScore}%</span>
                <span className="text-[10px] text-slate-400 block mt-0.5 uppercase tracking-wide">Readiness</span>
              </div>
            </div>

            {/* Status Class Block */}
            <div className={`p-4 rounded-xl border text-left ${rankColor}`}>
              <div className="flex items-center gap-2">
                <Award className="w-4 h-4 shrink-0" />
                <h4 className="text-sm font-bold font-display">{readinessTier}</h4>
              </div>
              <p className="text-xs leading-relaxed mt-1 opacity-90 font-medium">
                {rankDesc}
              </p>
            </div>

            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3 text-left pt-2">
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Attempted</span>
                <strong className="text-lg font-bold text-slate-700">{totalAttempted} qns</strong>
              </div>
              <div className="bg-slate-50 p-3 rounded-xl">
                <span className="text-[10px] text-slate-400 block uppercase tracking-wide">Accuracy</span>
                <strong className="text-lg font-bold text-slate-700">{overallAccuracy}%</strong>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Subject details & Calibration (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Subject Stats */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold text-slate-800 pb-3 border-b border-slate-50 flex items-center gap-2">
              <Target className="w-4 h-4 text-indigo-600" /> By Subject
            </h3>

            <div className="space-y-4">
              {subjectStats.map((sub) => (
                <div key={sub.name} className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-sm font-bold text-slate-700 font-display">{sub.name}</h4>
                        <span className={`text-[8px] font-mono font-bold px-1.5 py-0.25 rounded border uppercase shrink-0 ${
                          sub.paper === "Paper-I" 
                            ? "bg-indigo-50 border-indigo-100 text-indigo-600" 
                            : "bg-emerald-50 border-emerald-100 text-emerald-600"
                        }`}>
                          {sub.paper === "Paper-I" ? "P-I" : "P-II"}
                        </span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-400">Attempted {sub.attempted} of {sub.total} questions</span>
                    </div>
                    <div className="text-right font-mono text-xs">
                      <span className="text-slate-400 mr-2">Accuracy: <strong>{sub.attempted > 0 ? `${sub.accuracy}%` : "—"}</strong></span>
                      <span className="text-slate-600">Coverage: <strong>{sub.coverage}%</strong></span>
                    </div>
                  </div>

                  <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden flex">
                    <div 
                      className="bg-indigo-600 h-full rounded-l-full transition-all" 
                      style={{ width: `${sub.coverage}%` }} 
                    />
                    <div 
                      className="bg-emerald-500 h-full opacity-60 transition-all" 
                      style={{ width: `${sub.attempted > 0 ? (sub.coverage * (sub.accuracy / 100)) : 0}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confidence Metacognitive Calibration */}
          <div className="bg-white border border-slate-100 rounded-2xl p-4 sm:p-6 shadow-xs space-y-5">
            <h3 className="font-display text-sm font-bold text-slate-800 pb-3 border-b border-slate-50 flex items-center gap-2">
              <Compass className="w-4 h-4 text-indigo-600" /> Confidence vs. Accuracy
            </h3>

            <p className="text-slate-400 text-xs leading-relaxed">
              How well your confidence matches your actual performance. Ideally, "Very Sure" answers should have the highest accuracy and "Guess" the lowest.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {confidenceStats.map((item) => {
                const colorMap = item.level === "Very Sure" 
                  ? { border: "border-emerald-100", text: "text-emerald-700", bg: "bg-emerald-50/50" }
                  : item.level === "Somewhat Sure"
                  ? { border: "border-blue-100", text: "text-blue-700", bg: "bg-blue-50/50" }
                  : { border: "border-amber-100", text: "text-amber-700", bg: "bg-amber-50/50" };

                return (
                  <div key={item.level} className={`p-4 border rounded-xl space-y-1 ${colorMap.bg} ${colorMap.border}`}>
                    <span className="text-[10px] font-bold text-slate-400 block uppercase tracking-wide">{item.level}</span>
                    <strong className={`text-2xl font-bold font-display block ${colorMap.text}`}>
                      {item.count > 0 ? `${item.accuracy}%` : "—"}
                    </strong>
                    <span className="text-[9px] font-mono text-slate-500 block">
                      Accuracy across {item.count} responses
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}

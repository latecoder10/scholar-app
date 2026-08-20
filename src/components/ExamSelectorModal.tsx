/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Sparkles, BrainCircuit, GraduationCap, ChevronRight, CheckCircle2, Layers, BookOpen, Award, ShieldCheck } from "lucide-react";
import { ExamOption } from "../types";

export const AVAILABLE_EXAMS: ExamOption[] = [
  {
    id: "claude-ccaf",
    name: "Claude Certified Architect - Foundations (CCAF)",
    shortName: "Claude CCAF",
    tagline: "Official Anthropic AI Systems Certification",
    category: "AI & Cloud Architecture",
    badge: "New • High Demand",
    icon: "BrainCircuit",
    description: "Deep technical preparation covering Agentic Orchestration, Model Context Protocol (MCP), Claude Code CLI, Prompt Engineering, and Context Window Reliability.",
    totalQuestionsCount: 120,
    totalChaptersCount: 16
  },
  {
    id: "cil-mt",
    name: "Coal India Limited - Management Trainee (CIL MT)",
    shortName: "CIL MT (Systems)",
    tagline: "PSU & GATE Grade Engineering Examination",
    category: "PSU / Engineering Services",
    badge: "Comprehensive",
    icon: "GraduationCap",
    description: "Two-stage syllabus covering Paper-I (General Aptitude, Reasoning, General Awareness, English) and Paper-II (Technical Computer Science & Software Engineering).",
    totalQuestionsCount: 450,
    totalChaptersCount: 22
  },
  {
    id: "all",
    name: "All Examination Tracks",
    shortName: "All Examinations",
    tagline: "Unified Multi-Track Scholar Hub",
    category: "Full Curriculum",
    badge: "Cross-Disciplinary",
    icon: "Layers",
    description: "Explore the full spectrum of competitive examinations, AI architecture certifications, and technical engineering content packs in one centralized deck.",
    totalQuestionsCount: 570,
    totalChaptersCount: 38
  }
];

interface ExamSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedExamId: string;
  onSelectExam: (examId: string) => void;
}

export default function ExamSelectorModal({
  isOpen,
  onClose,
  selectedExamId,
  onSelectExam
}: ExamSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="bg-white border border-slate-200 rounded-3xl max-w-2xl w-full shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Modal Header */}
        <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 sm:p-8 relative">
          <div className="flex items-center gap-2.5 mb-2">
            <span className="p-1.5 bg-indigo-500/20 border border-indigo-400/30 rounded-lg text-indigo-300 inline-flex">
              <Sparkles className="w-4 h-4" />
            </span>
            <span className="text-xs font-mono font-bold tracking-widest text-indigo-300 uppercase">
              Curriculum Selection Hub
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-display font-extrabold tracking-tight">
            Which exam are you preparing for?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-1.5 max-w-xl">
            Select your target examination track. You can seamlessly switch or view all tracks anytime from the top navigation bar.
          </p>
        </div>

        {/* Exam Cards Grid */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4 flex-1">
          {AVAILABLE_EXAMS.map((exam) => {
            const isSelected = selectedExamId === exam.id;
            const isClaude = exam.id === "claude-ccaf";
            const isCil = exam.id === "cil-mt";

            return (
              <div
                key={exam.id}
                onClick={() => {
                  onSelectExam(exam.id);
                  onClose();
                }}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative group flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  isSelected
                    ? "border-indigo-600 bg-indigo-50/40 shadow-md ring-2 ring-indigo-600/10"
                    : "border-slate-200/80 bg-white hover:border-indigo-300 hover:bg-slate-50/60 shadow-3xs"
                }`}
              >
                <div className="flex items-start gap-4">
                  <div className={`p-3 rounded-xl shrink-0 mt-0.5 ${
                    isClaude
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : isCil
                      ? "bg-amber-100 text-amber-800 border border-amber-200"
                      : "bg-slate-100 text-slate-700 border border-slate-200"
                  }`}>
                    {isClaude ? (
                      <BrainCircuit className="w-6 h-6" />
                    ) : isCil ? (
                      <GraduationCap className="w-6 h-6" />
                    ) : (
                      <Layers className="w-6 h-6" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-display font-bold text-slate-900 text-base group-hover:text-indigo-600 transition-colors">
                        {exam.name}
                      </span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md uppercase ${
                        isClaude 
                          ? "bg-purple-50 text-purple-700 border border-purple-100"
                          : isCil
                          ? "bg-amber-50 text-amber-800 border border-amber-100"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {exam.badge}
                      </span>
                    </div>

                    <p className="text-xs text-slate-500 line-clamp-2">
                      {exam.description}
                    </p>

                    <div className="flex items-center gap-3 pt-1 text-[11px] font-mono text-slate-400">
                      <span className="flex items-center gap-1">
                        <BookOpen className="w-3 h-3 text-slate-400" />
                        {exam.category}
                      </span>
                      <span>•</span>
                      <span className="text-indigo-600 font-semibold">
                        {exam.shortName}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                  {isSelected ? (
                    <div className="flex items-center gap-1.5 text-xs font-bold font-mono text-indigo-600 bg-indigo-100/70 px-3 py-1.5 rounded-lg border border-indigo-200">
                      <CheckCircle2 className="w-4 h-4 text-indigo-600" />
                      Active Track
                    </div>
                  ) : (
                    <button className="flex items-center gap-1 text-xs font-bold font-mono text-slate-600 group-hover:text-indigo-600 transition-colors px-3 py-1.5 rounded-lg border border-slate-200 group-hover:border-indigo-200 bg-white">
                      Select Track <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Modal Footer */}
        <div className="p-4 sm:p-5 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
          <span className="text-xs text-slate-400 font-mono">
            Tracks can be changed at any time
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-200/70 transition-colors cursor-pointer border border-slate-300/80"
          >
            Continue with Selection
          </button>
        </div>
      </div>
    </div>
  );
}

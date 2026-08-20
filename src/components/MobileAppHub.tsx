/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Smartphone, 
  Download, 
  Terminal, 
  CheckCircle2, 
  Copy, 
  Play, 
  Zap, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Clock, 
  Award,
  ChevronRight,
  Flame,
  Star,
  RefreshCw,
  Cpu,
  Database,
  Package,
  ArrowDownToLine,
  Share2,
  QrCode,
  Sparkles
} from "lucide-react";
import { Question } from "../types";
import RichText from "./RichText";

interface MobileAppHubProps {
  questions?: Question[];
}

export default function MobileAppHub({ questions = [] }: MobileAppHubProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [simulatorScreen, setSimulatorScreen] = useState<"home" | "quiz" | "flashcard" | "mock" | "analytics">("home");
  const [selectedExamTrack, setSelectedExamTrack] = useState<"ccaf" | "cil">("ccaf");
  const [selectedTab, setSelectedTab] = useState<"download" | "eas-apk" | "expo-go" | "pwa">("download");
  const [quizIdx, setQuizIdx] = useState(0);
  const [selectedOpt, setSelectedOpt] = useState<string | null>(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showTrick, setShowTrick] = useState(false);
  const [flashcardFlipped, setFlashcardFlipped] = useState(false);

  const ccafSampleQuestions = [
    {
      id: 101,
      question: "When designing an agentic tool in Anthropic Claude architecture, which constraint strictly guarantees deterministic runtime parsing?",
      options: [
        "Specifying strict JSON Schema with explicit types, required properties, and enums",
        "Using natural language markdown instructions inside system prompt",
        "Relying on temperature = 0.0 without schema validation",
        "Passing arbitrary raw string payloads and parsing with regex"
      ],
      answer: "A",
      explanation: "Explicit JSON Schema validation with typed enum definitions guarantees that the LLM parameters conform deterministically to the execution contract.",
      examTrick: "Always choose strict JSON Schema / enum constraints over prompt text guidance for input safety."
    },
    {
      id: 102,
      question: "What is the minimum token threshold required for Prompt Caching to activate on Anthropic Claude 3.5 Sonnet?",
      options: ["1,024 tokens", "256 tokens", "512 tokens", "4,096 tokens"],
      answer: "A",
      explanation: "Anthropic Prompt Caching requires a minimum prefix length of 1,024 tokens for Claude 3.5 Sonnet and Opus (2,048 for Haiku).",
      examTrick: "Sonnet/Opus = 1024 tokens; Haiku = 2048 tokens. Caching gives 90% cost reduction on cached reads."
    }
  ];

  const cilSampleQuestions = [
    {
      id: 201,
      question: "In relational database normalization, a table with no partial functional dependencies on any candidate key is in:",
      options: ["2nd Normal Form (2NF)", "1st Normal Form (1NF)", "3rd Normal Form (3NF)", "Boyce-Codd Normal Form (BCNF)"],
      answer: "A",
      explanation: "2NF eliminates partial dependency (where a non-prime attribute depends on a proper subset of a candidate key).",
      examTrick: "1NF = Atomic values; 2NF = No Partial Dependency; 3NF = No Transitive Dependency; BCNF = Determinants must be superkeys."
    },
    {
      id: 202,
      question: "What is the worst-case time complexity of QuickSort when the pivot is always chosen as the smallest element in a sorted array?",
      options: ["O(n²)", "O(n log n)", "O(n)", "O(log n)"],
      answer: "A",
      explanation: "Choosing an extreme element on an already sorted list yields unbalanced partitions of size 0 and n-1, leading to quadratic O(n²) complexity.",
      examTrick: "Unbalanced partition recurrence T(n) = T(n-1) + O(n) = O(n²). Randomized pivot guarantees O(n log n) average."
    }
  ];

  const activeQuestions = selectedExamTrack === "ccaf" ? ccafSampleQuestions : cilSampleQuestions;
  const currentQ = activeQuestions[quizIdx % activeQuestions.length];

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Top Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold uppercase tracking-wider mb-3">
              <Package className="w-3.5 h-3.5" />
              Download &amp; Installation Hub
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Exam Scholar Mobile App
            </h1>
            <p className="text-slate-400 text-sm md:text-base mt-2 max-w-2xl leading-relaxed">
              Standalone React Native &amp; Expo app ready for install. Includes all <strong>1,128+ questions</strong> with 100% offline persistence, anti-lag lazy loading (<code className="text-sky-300 font-mono">ccafQuestions.json</code> + <code className="text-indigo-300 font-mono">cilQuestions.json</code>), and 30-sec Exam Tricks.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="px-5 py-3.5 bg-slate-800/60 border border-slate-700 text-slate-200 rounded-xl font-semibold text-sm flex items-center gap-2.5">
              <ArrowDownToLine className="w-4 h-4 text-blue-400 shrink-0" />
              Source lives in <code className="font-mono text-sky-300">/mobile</code>
            </div>
          </div>
        </div>
      </div>

      {/* Main 2-Column: Live Mobile Simulator vs Packaging / Installation Options */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Interactive Mobile Phone Simulator */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div className="w-full flex items-center justify-between mb-3 px-2">
            <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-blue-400" />
              Live Interactive Mobile Simulator
            </h3>
            <span className="text-xs text-emerald-400 font-mono flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Lazy Chunk Loaded
            </span>
          </div>

          {/* Phone Frame */}
          <div className="w-full max-w-[360px] bg-slate-950 rounded-[40px] p-3 shadow-2xl border-4 border-slate-700 relative">
            {/* Speaker & Camera Notch */}
            <div className="w-28 h-4 bg-slate-800 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-2.5 h-2.5 bg-slate-900 rounded-full mr-2" />
              <div className="w-10 h-1.5 bg-slate-900 rounded-full" />
            </div>

            {/* Inner Mobile Screen Container */}
            <div className="bg-[#0B0F17] rounded-[30px] overflow-hidden min-h-[580px] flex flex-col text-slate-100 border border-slate-800/60 select-none">
              
              {/* Top Mobile Status Header */}
              <div className="px-5 pt-3 pb-2 flex items-center justify-between border-b border-slate-800/80 bg-[#0F172A]">
                <div>
                  <div className="text-[9px] font-bold text-sky-400 tracking-wider">OFFLINE LAZY CHUNK</div>
                  <div className="text-xs font-extrabold text-white">Exam Scholar Mobile</div>
                </div>
                <div className="flex items-center gap-1.5 bg-slate-800 px-2 py-0.5 rounded-full border border-slate-700">
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span className="text-[11px] font-bold text-slate-200">3d streak</span>
                </div>
              </div>

              {/* Mobile Simulator View Content */}
              <div className="flex-1 p-4 overflow-y-auto max-h-[460px]">
                {simulatorScreen === "home" && (
                  <div className="space-y-3.5">
                    {/* Exam Switcher Tabs */}
                    <div className="flex bg-slate-900 p-1 rounded-xl border border-slate-800 text-[11px]">
                      <button 
                        onClick={() => {
                          setSelectedExamTrack("ccaf");
                          setQuizIdx(0);
                          setIsAnswered(false);
                          setSelectedOpt(null);
                        }}
                        className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                          selectedExamTrack === "ccaf" 
                            ? "bg-blue-600 text-white shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Claude CCAF (425)
                      </button>
                      <button 
                        onClick={() => {
                          setSelectedExamTrack("cil");
                          setQuizIdx(0);
                          setIsAnswered(false);
                          setSelectedOpt(null);
                        }}
                        className={`flex-1 py-1 rounded-lg font-semibold transition-all ${
                          selectedExamTrack === "cil" 
                            ? "bg-blue-600 text-white shadow" 
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        CIL MT CS (703)
                      </button>
                    </div>

                    {/* Active Partition Badge */}
                    <div className="px-2.5 py-1.5 rounded-lg bg-slate-900/60 border border-slate-800/80 flex items-center gap-2 text-[10px] text-slate-400">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      <span>Loaded Partition: <strong className="text-slate-200">{selectedExamTrack === "ccaf" ? "ccafQuestions.json" : "cilQuestions.json"}</strong></span>
                    </div>

                    {/* Stats Summary Card */}
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl flex items-center justify-around text-center">
                      <div>
                        <div className="text-base font-bold text-white">
                          {selectedExamTrack === "ccaf" ? "425" : "703"}
                        </div>
                        <div className="text-[10px] text-slate-400">Target Qs</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-base font-bold text-emerald-400">92%</div>
                        <div className="text-[10px] text-slate-400">Accuracy</div>
                      </div>
                      <div className="w-px h-6 bg-slate-800" />
                      <div>
                        <div className="text-base font-bold text-amber-400">0</div>
                        <div className="text-[10px] text-slate-400">Mistakes</div>
                      </div>
                    </div>

                    {/* Action Cards */}
                    <button 
                      onClick={() => {
                        setSimulatorScreen("quiz");
                        setIsAnswered(false);
                        setSelectedOpt(null);
                        setShowTrick(false);
                      }}
                      className="w-full text-left p-3.5 rounded-xl bg-blue-600 hover:bg-blue-500 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">⚡</div>
                        <div>
                          <div className="text-xs font-bold text-white">Quick Practice Session</div>
                          <div className="text-[10px] text-blue-100">25 Qs slice with Exam Tricks</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>

                    <button 
                      onClick={() => {
                        setSimulatorScreen("flashcard");
                        setFlashcardFlipped(false);
                      }}
                      className="w-full text-left p-3.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">📇</div>
                        <div>
                          <div className="text-xs font-bold text-white">Exam Tricks Flashcards</div>
                          <div className="text-[10px] text-indigo-100">30-second formula cards</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>

                    <button 
                      onClick={() => setSimulatorScreen("mock")}
                      className="w-full text-left p-3.5 rounded-xl bg-sky-600 hover:bg-sky-500 transition-colors flex items-center justify-between"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center text-sm">⏱️</div>
                        <div>
                          <div className="text-xs font-bold text-white">Timed Mock Arena</div>
                          <div className="text-[10px] text-sky-100">50 Qs timed simulation</div>
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 text-white" />
                    </button>
                  </div>
                )}

                {simulatorScreen === "quiz" && (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <button onClick={() => setSimulatorScreen("home")} className="text-slate-300 font-bold hover:text-white">✕ Exit</button>
                      <span>Q{quizIdx + 1} of {activeQuestions.length}</span>
                      <span className="text-amber-400 font-bold">★ Saved</span>
                    </div>

                    <div className="text-xs font-bold text-slate-100 leading-relaxed">
                      <RichText tone="dark">{currentQ.question}</RichText>
                    </div>

                    <div className="space-y-2 pt-1">
                      {currentQ.options.map((opt, oIdx) => {
                        const letter = String.fromCharCode(65 + oIdx);
                        const isChosen = selectedOpt === letter;
                        const isCorrect = letter === currentQ.answer;

                        let style = "bg-slate-900 border-slate-800 text-slate-300";
                        if (isAnswered) {
                          if (isCorrect) style = "bg-emerald-950/60 border-emerald-500 text-emerald-200";
                          else if (isChosen && !isCorrect) style = "bg-rose-950/60 border-rose-500 text-rose-200";
                        } else if (isChosen) {
                          style = "bg-blue-950 border-blue-500 text-white";
                        }

                        return (
                          <button
                            key={letter}
                            disabled={isAnswered}
                            onClick={() => {
                              setSelectedOpt(letter);
                              setIsAnswered(true);
                            }}
                            className={`w-full text-left p-2.5 rounded-xl border text-[11px] flex items-start gap-2.5 transition-all ${style}`}
                          >
                            <span className="w-5 h-5 rounded-full bg-slate-800 flex items-center justify-center font-bold text-[10px] shrink-0">
                              {letter}
                            </span>
                            <span className="flex-1"><RichText inline tone="dark">{opt}</RichText></span>
                          </button>
                        );
                      })}
                    </div>

                    {isAnswered && (
                      <div className="p-3 bg-slate-900 border border-slate-800 rounded-xl space-y-2">
                        <div className="text-[11px] font-bold text-emerald-400">
                          {selectedOpt === currentQ.answer ? "✅ Correct" : "❌ Incorrect (Answer: " + currentQ.answer + ")"}
                        </div>
                        <div className="text-[10px] text-slate-300 leading-relaxed">
                          <RichText tone="dark">{currentQ.explanation}</RichText>
                        </div>
                        <button
                          onClick={() => setShowTrick(!showTrick)}
                          className="w-full text-left p-2 bg-amber-950/40 border border-amber-500/30 rounded-lg text-[10px] text-amber-300 font-semibold"
                        >
                          💡 30-Sec Exam Trick (Tap to {showTrick ? "Hide" : "Reveal"})
                          {showTrick && (
                            <div className="mt-1 text-amber-200 font-normal">
                              <RichText tone="dark">{currentQ.examTrick}</RichText>
                            </div>
                          )}
                        </button>
                        <button
                          onClick={() => {
                            setQuizIdx((quizIdx + 1) % activeQuestions.length);
                            setSelectedOpt(null);
                            setIsAnswered(false);
                            setShowTrick(false);
                          }}
                          className="w-full py-1.5 bg-blue-600 rounded-lg text-xs font-bold text-white text-center"
                        >
                          Next Question →
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {simulatorScreen === "flashcard" && (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between text-[11px] text-slate-400">
                      <button onClick={() => setSimulatorScreen("home")} className="text-slate-300 font-bold hover:text-white">✕ Exit</button>
                      <span>Card {quizIdx + 1} of {activeQuestions.length}</span>
                    </div>

                    <div 
                      onClick={() => setFlashcardFlipped(!flashcardFlipped)}
                      className={`min-h-[220px] p-5 rounded-2xl border cursor-pointer transition-all duration-300 flex flex-col justify-between ${
                        flashcardFlipped 
                          ? "bg-indigo-950/70 border-indigo-500 text-indigo-100" 
                          : "bg-slate-900 border-slate-800 text-slate-200"
                      }`}
                    >
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 block mb-2">
                          {flashcardFlipped ? "💡 30-Sec Exam Trick & Core Principle" : "❓ Question / Concept Target"}
                        </span>
                        <div className="text-xs font-medium leading-relaxed">
                          <RichText tone="dark">{flashcardFlipped ? currentQ.examTrick : currentQ.question}</RichText>
                        </div>
                      </div>
                      <div className="text-center text-[10px] text-slate-500 pt-3">
                        (Tap to flip card)
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button 
                        onClick={() => {
                          setQuizIdx((quizIdx - 1 + activeQuestions.length) % activeQuestions.length);
                          setFlashcardFlipped(false);
                        }}
                        className="flex-1 py-2 bg-slate-900 border border-slate-800 rounded-xl text-xs font-bold text-slate-300"
                      >
                        ← Prev
                      </button>
                      <button 
                        onClick={() => {
                          setQuizIdx((quizIdx + 1) % activeQuestions.length);
                          setFlashcardFlipped(false);
                        }}
                        className="flex-1 py-2 bg-indigo-600 rounded-xl text-xs font-bold text-white"
                      >
                        Next →
                      </button>
                    </div>
                  </div>
                )}

                {simulatorScreen === "mock" && (
                  <div className="space-y-4 text-center py-6">
                    <Clock className="w-10 h-10 text-sky-400 mx-auto" />
                    <div>
                      <h4 className="text-sm font-bold text-white">Full-Length Mock Arena</h4>
                      <p className="text-xs text-slate-400 mt-1">50 Questions • 60 Minutes • Negative Marking</p>
                    </div>
                    <div className="p-3 bg-slate-900 rounded-xl border border-slate-800 text-left text-[11px] text-slate-300 space-y-1.5">
                      <div>✓ Real-time countdown clock</div>
                      <div>✓ Question grid palette (Visited, Flagged)</div>
                      <div>✓ Automated percentile &amp; score report</div>
                    </div>
                    <button 
                      onClick={() => {
                        setSimulatorScreen("quiz");
                        setIsAnswered(false);
                        setSelectedOpt(null);
                      }}
                      className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 rounded-xl font-bold text-xs text-white"
                    >
                      Start Mock Exam
                    </button>
                    <button 
                      onClick={() => setSimulatorScreen("home")}
                      className="text-xs text-slate-500 underline"
                    >
                      Back to Menu
                    </button>
                  </div>
                )}
              </div>

              {/* Bottom Mobile Tab Bar */}
              <div className="px-6 py-2.5 border-t border-slate-800/80 bg-[#0F172A] flex items-center justify-around text-slate-400">
                <button onClick={() => setSimulatorScreen("home")} className={`flex flex-col items-center gap-0.5 ${simulatorScreen === "home" ? "text-blue-400" : ""}`}>
                  <Smartphone className="w-4 h-4" />
                  <span className="text-[9px]">Home</span>
                </button>
                <button onClick={() => setSimulatorScreen("quiz")} className={`flex flex-col items-center gap-0.5 ${simulatorScreen === "quiz" ? "text-blue-400" : ""}`}>
                  <Zap className="w-4 h-4" />
                  <span className="text-[9px]">Quiz</span>
                </button>
                <button onClick={() => setSimulatorScreen("flashcard")} className={`flex flex-col items-center gap-0.5 ${simulatorScreen === "flashcard" ? "text-blue-400" : ""}`}>
                  <Layers className="w-4 h-4" />
                  <span className="text-[9px]">Cards</span>
                </button>
                <button onClick={() => setSimulatorScreen("mock")} className={`flex flex-col items-center gap-0.5 ${simulatorScreen === "mock" ? "text-blue-400" : ""}`}>
                  <Clock className="w-4 h-4" />
                  <span className="text-[9px]">Mock</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Download & Installation Options */}
        <div className="lg:col-span-7 space-y-6">
          {/* Installation Method Selector */}
          <div className="flex bg-slate-900 p-1.5 rounded-2xl border border-slate-800 gap-1.5">
            <button
              onClick={() => setSelectedTab("download")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "download" 
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Download className="w-3.5 h-3.5" />
              1. Download ZIP
            </button>
            <button
              onClick={() => setSelectedTab("eas-apk")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "eas-apk" 
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <Package className="w-3.5 h-3.5" />
              2. Android APK (.apk)
            </button>
            <button
              onClick={() => setSelectedTab("expo-go")}
              className={`flex-1 py-2.5 px-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                selectedTab === "expo-go" 
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-600/20" 
                  : "text-slate-400 hover:text-slate-200"
              }`}
            >
              <QrCode className="w-3.5 h-3.5" />
              3. Expo Go (Instant)
            </button>
          </div>

          {/* TAB 1: Standalone Download ZIP */}
          {selectedTab === "download" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fadeIn">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ArrowDownToLine className="w-5 h-5 text-blue-400" />
                    Standalone App Package
                  </h3>
                  <p className="text-xs text-slate-400 mt-1">
                    The complete standalone mobile codebase — all assets, configs, and pre-bundled 1,128+ questions — lives in the <code className="font-mono text-sky-300">mobile/</code> folder of this repository.
                  </p>
                </div>
              </div>

              <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2.5 text-xs text-slate-300">
                <div className="font-bold text-white flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  What is included in the package:
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span><code className="text-slate-200">/mobile/App.tsx</code> - Full Navigation</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span><code className="text-slate-200">/mobile/eas.json</code> - APK Build Profile</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span><code className="text-slate-200">/mobile/content/</code> - All 24 folders</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                    <span><code className="text-slate-200">/mobile/src/data/</code> - Lazy chunks</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-300">Run on your machine in 2 steps:</div>
                <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 font-mono text-xs text-emerald-400 flex items-center justify-between">
                  <span>unzip exam-scholar-mobile-app.zip &amp;&amp; cd mobile &amp;&amp; npm install</span>
                  <button
                    onClick={() => copyToClipboard("unzip exam-scholar-mobile-app.zip && cd mobile && npm install", 99)}
                    className="text-slate-400 hover:text-white"
                  >
                    {copiedIndex === 99 ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: Build Standalone Android APK (.apk) */}
          {selectedTab === "eas-apk" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Package className="w-5 h-5 text-indigo-400" />
                  Generate Standalone Android APK File (`.apk`)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Build a direct installable APK file for any Android device without needing Google Play Store or Developer accounts.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Install EAS Build CLI (if not already installed)",
                    cmd: "npm install -g eas-cli"
                  },
                  {
                    step: "2",
                    title: "Trigger Standalone APK Build via Expo Cloud",
                    cmd: "cd mobile && npx eas build -p android --profile preview"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                        {item.step}
                      </span>
                      {item.title}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <code className="text-xs text-indigo-300 font-mono font-bold">{item.cmd}</code>
                      <button
                        onClick={() => copyToClipboard(item.cmd, 100 + idx)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy command"
                      >
                        {copiedIndex === 100 + idx ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3.5 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-xs text-indigo-200">
                <strong>How it installs:</strong> EAS outputs a QR code and download link in your terminal. Open the link on your Android phone, tap <em>Download .apk</em>, and tap <em>Install</em>.
              </div>
            </div>
          )}

          {/* TAB 3: Instant Expo Go (Scan & Play) */}
          {selectedTab === "expo-go" && (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5 animate-fadeIn">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <QrCode className="w-5 h-5 text-emerald-400" />
                  Instant Live Run via Expo Go (30 Seconds)
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Test the native app on your physical iPhone or Android device instantly without compiling.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    step: "1",
                    title: "Install 'Expo Go' app from Play Store or iOS App Store on your phone",
                    cmd: "Free on App Store & Google Play"
                  },
                  {
                    step: "2",
                    title: "Start Expo in the /mobile directory",
                    cmd: "cd mobile && npx expo start"
                  },
                  {
                    step: "3",
                    title: "Scan the terminal QR code with your phone camera",
                    cmd: "Instant live reload on device"
                  }
                ].map((item, idx) => (
                  <div key={idx} className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center gap-2 text-xs font-bold text-white">
                      <span className="w-5 h-5 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px]">
                        {item.step}
                      </span>
                      {item.title}
                    </div>
                    <div className="flex items-center justify-between bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                      <code className="text-xs text-emerald-300 font-mono font-bold">{item.cmd}</code>
                      <button
                        onClick={() => copyToClipboard(item.cmd, 200 + idx)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Copy command"
                      >
                        {copiedIndex === 200 + idx ? <CheckCircle2 className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Architecture Highlights */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5 text-sky-400" />
              Anti-Freeze Lazy Loading Architecture
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-sky-400" />
                  <span className="text-sky-300 font-mono">ccafQuestions.json</span>
                </div>
                <div className="text-slate-400">425 CCAF questions isolated in dedicated chunk. Loaded into RAM only when CCAF track is active.</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5 text-indigo-400" />
                  <span className="text-indigo-300 font-mono">cilQuestions.json</span>
                </div>
                <div className="text-slate-400">703 CIL MT CS questions isolated in separate partition. Prevents DOM clutter and garbage collection spikes.</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-amber-300 font-mono">examManifest.json</span>
                </div>
                <div className="text-slate-400">Ultra-lightweight ~2KB manifest. Instant startup (&lt;10ms) on low-end Android &amp; iOS devices.</div>
              </div>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
                <div className="font-bold text-white mb-1 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300 font-mono">25 Qs Slicing</span>
                </div>
                <div className="text-slate-400">Sessions are generated in randomized 25-question windows for consistent 60fps smooth animations.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

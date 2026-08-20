/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  Award, 
  Clock, 
  ChevronLeft, 
  ChevronRight, 
  Check, 
  X, 
  AlertTriangle, 
  Play, 
  Flame, 
  BookOpen, 
  HelpCircle, 
  RefreshCw, 
  FileText, 
  CheckCircle, 
  XCircle,
  BarChart,
  Bookmark,
  ArrowRight,
  ArrowLeft,
  Sparkles
} from "lucide-react";
import { Subject, Chapter, Question, UserProgress, UserAnswerSubmission } from "../types";

interface MockTestArenaProps {
  subjects: Subject[];
  progress: UserProgress;
  selectedExam?: string;
  onSubmitAnswer: (submission: UserAnswerSubmission) => Promise<any>;
  onRefreshContent: () => Promise<void>;
  onNavigate: (tab: string) => void;
}

interface MockExam {
  id: string;
  name: string;
  subject: string;
  chapterId: string;
  exam: string;
  description: string;
  questionsCount: number;
  durationMinutes: number;
  paper: string;
  syllabus: string[];
}

export default function MockTestArena({ 
  subjects, 
  progress, 
  selectedExam = "all",
  onSubmitAnswer, 
  onRefreshContent, 
  onNavigate 
}: MockTestArenaProps) {
  // Simulator Navigation State
  const [activeView, setActiveView] = useState<"selection" | "instructions" | "simulator" | "results">("selection");
  const [selectedMock, setSelectedMock] = useState<MockExam | null>(null);
  const [selectedPaperFilter, setSelectedPaperFilter] = useState<string>("All");
  
  // Active Exam States
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  
  // Track student's selected answers during exam: questionId -> selectedOption
  const [answers, setAnswers] = useState<Record<number, string>>({});
  // Track flagged questions: questionId -> boolean
  const [flagged, setFlagged] = useState<Record<number, boolean>>({});
  // Track visited questions: questionId -> boolean (to see if visited/not answered)
  const [visited, setVisited] = useState<Record<number, boolean>>({});
  
  // Timer States
  const [timeRemaining, setTimeRemaining] = useState(0); // in seconds
  const [examDuration, setExamDuration] = useState(0); // initial duration in seconds
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  
  // Modal State
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Toast notification state
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };
  
  // Results / History State
  const [savedExamResult, setSavedExamResult] = useState<{
    score: number;
    total: number;
    accuracy: number;
    timeSpentSeconds: number;
    subjectStats: Record<string, { total: number; correct: number }>;
    questionReviews: {
      question: Question;
      userAnswer: string;
      isCorrect: boolean;
      savedToMistakes: boolean;
    }[];
  } | null>(null);

  const [visibleReviewsCount, setVisibleReviewsCount] = useState(15);

  // Auto-scroll to top on view or question index change
  useEffect(() => {
    const scrollContainer = document.getElementById("main-workspace-scroll");
    if (scrollContainer) {
      scrollContainer.scrollTo({ top: 0, behavior: "smooth" });
    }
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [currentIndex, activeView]);

  // Content Expansion State & Functionality
  const [expanding, setExpanding] = useState(false);
  const [expansionStatus, setExpansionStatus] = useState<string | null>(null);

  const handleExpandMock = async (targetCount: number = 20) => {
    if (!selectedMock) return;
    try {
      setExpanding(true);
      setExpansionStatus("Virtually tutoring... Curating premium syllabus-mapped questions...");
      const res = await fetch(`/api/chapter/mock-tests/${selectedMock.chapterId}/expand`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ count: targetCount })
      });
      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to expand mock exam.");
      }
      const data = await res.json();
      setQuestions(data.questions || []);
      
      // Update selectedMock question count in-place
      selectedMock.questionsCount = data.totalCount;
      selectedMock.durationMinutes = Math.max(15, Math.ceil(data.totalCount * 1.5));
      
      setExpansionStatus(`Virtual Teacher: Curated ${data.addedCount} high-yield questions successfully! Total questions is now ${data.totalCount}.`);
      setTimeout(() => setExpansionStatus(null), 8000);
      
      // Refresh global subjects list so Dashboard metrics are accurate
      await onRefreshContent();
    } catch (err: any) {
      console.error(err);
      setExpansionStatus(`Expansion Error: ${err.message}`);
    } finally {
      setExpanding(false);
    }
  };

  // Discover available mock tests from fetched subjects
  const [mockExams, setMockExams] = useState<MockExam[]>([]);

  useEffect(() => {
    const exams: MockExam[] = [];
    
    // Find all mock subjects (e.g., "Mock Tests" under CIL MT, or "Mock Tests" under Claude CCAF)
    const mockSubjects = subjects.filter(s => s.name === "Mock Tests" || s.name.toLowerCase().includes("mock"));
    
    mockSubjects.forEach(mockSubject => {
      const isClaude = mockSubject.exam === "Claude CCAF" || mockSubject.name.toLowerCase().includes("claude") || mockSubject.name.toLowerCase().includes("ccaf");
      
      mockSubject.chapters.forEach(chap => {
        const isClaudeChap = isClaude || chap.name.toLowerCase().includes("claude") || chap.name.toLowerCase().includes("ccaf");
        exams.push({
          id: chap.id,
          name: chap.name,
          subject: mockSubject.name,
          chapterId: chap.id,
          exam: isClaudeChap ? "Claude CCAF" : "CIL MT",
          description: chap.description || (isClaudeChap 
            ? "Comprehensive simulated certification exam for Claude Certified Architect - Foundations."
            : "Simulate a real-time CIL MT standard Technical exam."),
          questionsCount: chap.questionsCount,
          durationMinutes: Math.max(15, Math.ceil(chap.questionsCount * 1.5)), // 1.5 minutes per question
          paper: chap.paper || (isClaudeChap ? "CCAF-Simulation" : "Paper-II"),
          syllabus: isClaudeChap 
            ? ["Agentic Loops", "Subagent Spawning", "MCP Tools & Schemas", "Claude Code Workflows", "Prompt Caching", "Context Reliability"]
            : ["Digital Logic", "COA", "Programming & DS", "Algorithms", "TOC", "Compiler", "OS", "DBMS", "Networks"]
        });
      });
    });
    
    // If no dynamically discovered mock exams are present, add pre-built baseline cards
    if (exams.length === 0) {
      exams.push({
        id: "claude-ccaf-mock-exam-1",
        name: "Claude CCAF Full Mock Exam 1 (Foundations & Architecture)",
        subject: "Mock Tests",
        chapterId: "claude-ccaf-mock-exam-1",
        exam: "Claude CCAF",
        description: "Comprehensive 60-question simulated practice exam covering Agentic Orchestration, MCP Tool Design, Claude Code Workflows, Prompt Engineering, and Context Reliability.",
        questionsCount: 60,
        durationMinutes: 90,
        paper: "CCAF-Simulation",
        syllabus: ["Agentic Loops", "Subagent Spawning", "MCP Tools & Schemas", "Claude Code Workflows", "Prompt Caching", "Context Reliability"]
      });
      exams.push({
        id: "mock-sheet-1",
        name: "CIL MT Mock Sheet-1 (Domain Systems)",
        subject: "Mock Tests",
        chapterId: "mock-sheet-1",
        exam: "CIL MT",
        description: "Comprehensive 20-question Mock Sheet covering technical Computer Science syllabus, modeled exactly after CIL MT exam series.",
        questionsCount: 20,
        durationMinutes: 20,
        paper: "Paper-II",
        syllabus: ["Digital Logic", "COA", "Algorithms", "Programming & DS", "TOC", "Compiler", "OS", "DBMS", "Networks"]
      });
    }
    
    setMockExams(exams);
  }, [subjects]);

  // Load questions for selected mock test
  const handleSelectMock = async (exam: MockExam) => {
    setSelectedMock(exam);
    setLoadingQuestions(true);
    setActiveView("instructions");
    
    try {
      const res = await fetch(`/api/chapter/mock-tests/${exam.chapterId}`);
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions || []);
      } else {
        console.error("Failed to load mock questions. Retrying with local discovery.");
      }
    } catch (e) {
      console.error("Error loading mock questions:", e);
    } finally {
      setLoadingQuestions(false);
    }
  };

  // Start exam simulator
  const handleStartExam = () => {
    if (!selectedMock || questions.length === 0) return;
    
    // Reset test taker states
    setAnswers({});
    setFlagged({});
    const initialVisited: Record<number, boolean> = {};
    initialVisited[questions[0].id] = true;
    setVisited(initialVisited);
    setCurrentIndex(0);
    
    // Initialize timer (minutes to seconds)
    const durationSeconds = selectedMock.durationMinutes * 60;
    setExamDuration(durationSeconds);
    setTimeRemaining(durationSeconds);
    setActiveView("simulator");
  };

  // Timer interval hook
  useEffect(() => {
    if (activeView === "simulator") {
      timerRef.current = setInterval(() => {
        setTimeRemaining((prev) => {
          if (prev <= 1) {
            clearInterval(timerRef.current!);
            handleAutoSubmit();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [activeView]);

  // Auto submit when timer runs out
  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current);
    showToast("TIME IS UP! Your flight session was automatically completed and submitted.");
    processSubmission();
  };

  // Process the final calculation of scores
  const processSubmission = () => {
    if (!selectedMock || questions.length === 0) return;
    
    let correctCount = 0;
    const timeSpent = examDuration - timeRemaining;
    const subjStats: Record<string, { total: number; correct: number }> = {};
    
    const reviews = questions.map((q) => {
      const userAnswer = answers[q.id] || "";
      const isCorrect = userAnswer === q.answer;
      
      if (isCorrect) correctCount++;
      
      // Classify subject from question tags or default to "CS Systems"
      const subjectTag = q.tags && q.tags.length > 0 ? q.tags[0] : "General Core";
      if (!subjStats[subjectTag]) {
        subjStats[subjectTag] = { total: 0, correct: 0 };
      }
      subjStats[subjectTag].total++;
      if (isCorrect) {
        subjStats[subjectTag].correct++;
      }

      // Automatically submit results server-side to save in student progress & analytics history!
      // This maps mock test performance directly to the system's global dashboard metrics!
      const submission: UserAnswerSubmission = {
        subject: "Mock Tests",
        chapterId: selectedMock.chapterId,
        chapterName: selectedMock.name,
        questionId: q.id,
        questionText: q.question,
        options: q.options,
        explanation: q.explanation,
        examTrick: q.examTrick,
        correctAnswer: q.answer,
        userAnswer: userAnswer,
        confidence: "Very Sure",
        isCorrect: isCorrect
      };
      
      // Asynchronously record to flight log (ignore if empty response)
      onSubmitAnswer(submission).catch(err => console.error("Error submitting mock answer:", err));

      return {
        question: q,
        userAnswer,
        isCorrect,
        savedToMistakes: false
      };
    });

    setSavedExamResult({
      score: correctCount,
      total: questions.length,
      accuracy: Math.round((correctCount / questions.length) * 100) || 0,
      timeSpentSeconds: timeSpent,
      subjectStats: subjStats,
      questionReviews: reviews
    });
    
    setVisibleReviewsCount(15);
    setActiveView("results");
  };

  // Manual Submit button click
  const handleManualSubmit = () => {
    setShowSubmitConfirm(true);
  };

  const confirmSubmit = () => {
    setShowSubmitConfirm(false);
    if (timerRef.current) clearInterval(timerRef.current);
    processSubmission();
  };

  // Question navigation helpers
  const handleSelectQuestion = (index: number) => {
    setCurrentIndex(index);
    const q = questions[index];
    setVisited((prev) => ({ ...prev, [q.id]: true }));
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      handleSelectQuestion(currentIndex + 1);
    }
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      handleSelectQuestion(currentIndex - 1);
    }
  };

  const handleSelectOption = (option: string) => {
    const q = questions[currentIndex];
    setAnswers((prev) => ({ ...prev, [q.id]: option }));
  };

  const handleClearOption = () => {
    const q = questions[currentIndex];
    setAnswers((prev) => {
      const copy = { ...prev };
      delete copy[q.id];
      return copy;
    });
  };

  const handleToggleFlag = () => {
    const q = questions[currentIndex];
    setFlagged((prev) => ({ ...prev, [q.id]: !prev[q.id] }));
  };

  // Save specific missed mock question directly to standard Mistake Book
  const handleSaveToMistakes = async (reviewIndex: number) => {
    if (!savedExamResult) return;
    const review = savedExamResult.questionReviews[reviewIndex];
    if (review.savedToMistakes) return;

    try {
      // Send answer as incorrect to force it into the Mistake Book system-wide
      const submission: UserAnswerSubmission = {
        subject: "Mock Tests",
        chapterId: selectedMock?.chapterId || "mock",
        chapterName: selectedMock?.name || "Mock Test",
        questionId: review.question.id,
        questionText: review.question.question,
        options: review.question.options,
        explanation: review.question.explanation,
        examTrick: review.question.examTrick,
        correctAnswer: review.question.answer,
        userAnswer: review.userAnswer || "Skipped",
        confidence: "Guess",
        isCorrect: false // Forcing false forces inclusion into progress.mistakes
      };

      await onSubmitAnswer(submission);
      
      // Update state to show saved
      setSavedExamResult(prev => {
        if (!prev) return prev;
        const copyReviews = [...prev.questionReviews];
        copyReviews[reviewIndex] = { ...copyReviews[reviewIndex], savedToMistakes: true };
        return { ...prev, questionReviews: copyReviews };
      });
      showToast("Question successfully logged into your Mistake Book!");
    } catch (e) {
      console.error("Failed to sync mistake", e);
    }
  };

  // Formatting helpers
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Count states for grid display
  const totalAnswered = Object.keys(answers).length;
  const totalFlaged = Object.keys(flagged).filter(k => flagged[Number(k)]).length;
  const totalUnvisited = questions.length - Object.keys(visited).length;

  return (
    <div className="space-y-6">
      
      {/* 1. MOCK TEST SELECTION TAB SCREEN */}
      {activeView === "selection" && (() => {
        const filteredExams = mockExams.filter((exam) => {
          if (selectedPaperFilter === "All") {
            if (selectedExam === "claude-ccaf") return exam.exam === "Claude CCAF";
            if (selectedExam === "cil-mt") return exam.exam === "CIL MT";
            return true;
          }
          if (selectedPaperFilter === "Claude CCAF") return exam.exam === "Claude CCAF";
          if (selectedPaperFilter === "Paper-I") return exam.paper === "Paper-I";
          if (selectedPaperFilter === "Paper-II") return exam.paper === "Paper-II";
          return true;
        });

        return (
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-100 uppercase">
                    Certification & Exam Simulations
                  </span>
                </div>
                <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight flex items-center gap-2 mt-1">
                  <Award className="w-6 h-6 text-indigo-600" />
                  Mock Test & Exam Simulator Arena
                </h1>
                <p className="text-slate-500 text-xs">
                  Simulate high-stakes, time-boxed technical examinations tailored for Claude CCAF and CIL MT success.
                </p>
              </div>
              <button
                onClick={onRefreshContent}
                className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-slate-600 hover:text-slate-900 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-xs"
              >
                <RefreshCw className="w-3.5 h-3.5" /> Synchronize Exams
              </button>
            </div>

            {/* Syllabus Banner */}
            <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 rounded-2xl text-white shadow-md relative overflow-hidden border border-slate-800">
              <div className="relative z-10 space-y-3 max-w-xl">
                <span className="text-[9px] font-mono font-bold bg-indigo-500/30 text-indigo-300 border border-indigo-400/20 px-2 py-0.5 rounded uppercase tracking-wider">
                  Real-time Blueprint Simulator
                </span>
                <h2 className="font-display text-lg font-bold">Standard Simulation & Diagnostic Engine</h2>
                <p className="text-slate-300 text-xs leading-relaxed">
                  Every mock exam features timed sessions, live question palette navigation, instant score calculation, and direct export of missed problems to your Mistake Book.
                </p>
                <div className="flex flex-wrap gap-1.5 pt-2">
                  {["Claude CCAF Full Mocks", "Agentic Systems", "MCP Protocols", "CIL MT Paper-I", "CIL MT Paper-II", "GATE CSE Level"].map((topic) => (
                    <span key={topic} className="text-[9px] font-mono font-semibold bg-white/10 text-white/90 px-2 py-0.5 rounded">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>
              <div className="absolute right-0 bottom-0 top-0 w-1/3 opacity-15 hidden md:block">
                <Flame className="w-full h-full text-indigo-500" />
              </div>
            </div>

            {/* Sub-Sidebar Grid Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
              {/* Left Sidebar Sections */}
              <div className="lg:col-span-1 space-y-4">
                <div className="bg-white border border-slate-150 p-4 rounded-2xl space-y-3 shadow-xs">
                  <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider block border-b border-slate-100 pb-2">
                    Exam Filter
                  </h3>
                  <nav className="flex flex-row lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-2 lg:pb-0">
                    <button
                      onClick={() => setSelectedPaperFilter("All")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between gap-2 shrink-0 cursor-pointer ${
                        selectedPaperFilter === "All"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>All Mock Series</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        selectedPaperFilter === "All" ? "bg-white/20 text-white" : "bg-slate-150 text-slate-500"
                      }`}>
                        {mockExams.length}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPaperFilter("Claude CCAF")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between gap-2 shrink-0 cursor-pointer ${
                        selectedPaperFilter === "Claude CCAF"
                          ? "bg-purple-700 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>Claude CCAF Mocks</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        selectedPaperFilter === "Claude CCAF" ? "bg-white/20 text-white" : "bg-slate-150 text-slate-500"
                      }`}>
                        {mockExams.filter(e => e.exam === "Claude CCAF").length}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPaperFilter("Paper-I")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between gap-2 shrink-0 cursor-pointer ${
                        selectedPaperFilter === "Paper-I"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>CIL Paper-I (Aptitude)</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        selectedPaperFilter === "Paper-I" ? "bg-white/20 text-white" : "bg-slate-150 text-slate-500"
                      }`}>
                        {mockExams.filter(e => e.paper === "Paper-I").length}
                      </span>
                    </button>

                    <button
                      onClick={() => setSelectedPaperFilter("Paper-II")}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold font-mono transition-all flex items-center justify-between gap-2 shrink-0 cursor-pointer ${
                        selectedPaperFilter === "Paper-II"
                          ? "bg-indigo-600 text-white shadow-xs"
                          : "text-slate-600 hover:bg-slate-50"
                      }`}
                    >
                      <span>CIL Paper-II (Technical)</span>
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full ${
                        selectedPaperFilter === "Paper-II" ? "bg-white/20 text-white" : "bg-slate-150 text-slate-500"
                      }`}>
                        {mockExams.filter(e => e.paper === "Paper-II").length}
                      </span>
                    </button>
                  </nav>
                </div>

                {/* Strategy Insight Card */}
                <div className="bg-indigo-50/50 border border-indigo-100 p-4 rounded-2xl hidden lg:block space-y-2">
                  <span className="text-[10px] font-mono font-bold text-indigo-800 uppercase tracking-wider block">
                    Simulation Tip
                  </span>
                  <p className="text-[11px] text-indigo-950/80 leading-relaxed font-semibold">
                    Simulations mirror the real countdown timers and navigation palettes. Mark doubtful questions for review to maximize scoring under time pressure.
                  </p>
                </div>
              </div>

              {/* Right Mock Sheet Grid */}
              <div className="lg:col-span-3 space-y-4">
                <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                  Available Exam Sheets ({selectedPaperFilter === "All" ? "All Tracks" : selectedPaperFilter})
                </h3>

                {filteredExams.length === 0 ? (
                  <div className="bg-white border border-slate-100 rounded-2xl p-8 text-center text-slate-400">
                    No mock sheets found for the selected filter.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredExams.map((exam) => {
                      const isClaudeExam = exam.exam === "Claude CCAF";
                      return (
                        <div 
                          key={exam.id}
                          className="bg-white border border-slate-150 hover:border-indigo-300 rounded-2xl p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-6 group"
                        >
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className={`inline-flex items-center gap-1 border text-[9px] font-mono font-bold px-2.5 py-0.5 rounded ${
                                isClaudeExam
                                  ? "bg-purple-50 border-purple-200 text-purple-800"
                                  : exam.paper === "Paper-I"
                                  ? "bg-blue-50 border-blue-100 text-blue-800"
                                  : "bg-amber-50 border-amber-100 text-amber-800"
                              }`}>
                                {isClaudeExam 
                                  ? "CLAUDE CCAF CERTIFICATION" 
                                  : exam.paper === "Paper-I" 
                                  ? "CIL MT: PAPER-I APTITUDE" 
                                  : "CIL MT: PAPER-II TECHNICAL"}
                              </span>
                              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1 font-semibold">
                                <Clock className="w-3.5 h-3.5 text-slate-400" />
                                {exam.durationMinutes} Mins
                              </span>
                            </div>

                            <h4 className="font-display text-base font-extrabold text-slate-800 group-hover:text-indigo-600 transition-colors">
                              {exam.name}
                            </h4>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {exam.description}
                            </p>

                            <div className="flex flex-wrap gap-1 pt-1">
                              {exam.syllabus.slice(0, 4).map(s => (
                                <span key={s} className="text-[9px] font-mono bg-slate-50 text-slate-600 border border-slate-100 px-1.5 py-0.5 rounded">
                                  {s}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-4">
                            <div className="text-[10px] font-mono text-slate-500">
                              Total Items: <strong className="text-slate-800 font-bold">{exam.questionsCount} MCQs</strong>
                            </div>
                            <button
                              onClick={() => handleSelectMock(exam)}
                              className={`inline-flex items-center gap-2 text-xs font-extrabold text-white px-4 py-2.5 rounded-xl shadow-xs transition-all cursor-pointer ${
                                isClaudeExam 
                                  ? "bg-purple-700 hover:bg-purple-800" 
                                  : "bg-indigo-600 hover:bg-indigo-700"
                              }`}
                            >
                              Launch Simulation <Play className="w-3 h-3 text-white fill-white" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </div>
        );
      })()}

      {/* 2. PRE-EXAM INSTRUCTIONS SCREEN */}
      {activeView === "instructions" && selectedMock && (
        <div className="max-w-2xl mx-auto bg-white border border-slate-100 rounded-2xl p-8 shadow-sm space-y-6 animate-fade-in">
          
          {/* Header */}
          <div className="border-b border-slate-100 pb-5 text-center space-y-2">
            <div className="p-3 bg-indigo-50 border border-indigo-100 text-indigo-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto shadow-xs">
              <FileText className="w-6 h-6" />
            </div>
            <h2 className="font-display text-xl font-bold text-slate-800">
              Exam Instructions & Flight Briefing
            </h2>
            <p className="text-xs text-slate-400 font-mono">
              PRE-FLIGHT AUDIT • {selectedMock.name.toUpperCase()}
            </p>
          </div>

          {/* Exam Specs Grid */}
          <div className="grid grid-cols-3 gap-4 bg-slate-50 p-4 rounded-xl border border-slate-100 text-center">
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold block">DURATION</span>
              <span className="text-base font-display font-extrabold text-slate-800">{selectedMock.durationMinutes} Minutes</span>
            </div>
            <div className="space-y-1 border-x border-slate-200">
              <span className="text-[10px] font-mono text-slate-400 font-semibold block">TOTAL ITEMS</span>
              <span className="text-base font-display font-extrabold text-slate-800">{loadingQuestions ? "Loading..." : questions.length} MCQs</span>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] font-mono text-slate-400 font-semibold block">MARKING SCHEME</span>
              <span className="text-base font-display font-extrabold text-emerald-600">+1.00 / 0.00</span>
            </div>
          </div>

          {/* Instructions List */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono font-bold text-slate-500 uppercase tracking-wider">Important Guidelines:</h3>
            <ul className="text-xs text-slate-600 space-y-2.5 list-disc pl-5 leading-relaxed">
              <li>This is a **strictly timed simulator**. Once started, the countdown timer cannot be paused.</li>
              <li>There is **no negative marking** (following standard PSU Coal India MT guidelines). Unanswered questions receive 0 marks.</li>
              <li>The **Question Palette** on the right allows you to quickly jump between questions, check visited status, and view flagged elements.</li>
              <li>Click **"Mark for Review & Next"** to flag questions you want to reconsider. These will display as purple on your console grid.</li>
              <li>Explanations, solution keys, and the Professor's **Exam Tricks** are hidden until you click **Submit Exam** to maintain cognitive rigor.</li>
              <li>When the timer hits zero, the simulator will auto-submit all saved answers immediately.</li>
            </ul>
          </div>

          {/* AI Virtual Teacher Expansion Hub */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-150 p-5 rounded-2xl space-y-4 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-indigo-100 text-indigo-700 rounded-xl shrink-0">
                <Sparkles className="w-5 h-5 text-indigo-700" />
              </div>
              <div className="space-y-1">
                <h4 className="font-display font-extrabold text-indigo-950 text-sm flex items-center gap-2">
                  AI Virtual Teacher • Content Expander
                </h4>
                <p className="text-slate-500 text-[11px] leading-relaxed">
                  CIL MT Domain Knowledge Series Mock Test Sheets contain {questions.length} premium questions by default to load quickly. Use the **Virtual Teacher** to expand this sheet to the full **100-question master series** on-demand!
                </p>
              </div>
            </div>

            {expansionStatus && (
              <div className="p-3 bg-white border border-indigo-100 rounded-xl text-xs font-mono text-indigo-700 font-semibold animate-pulse">
                {expansionStatus}
              </div>
            )}

            <div className="flex flex-wrap gap-2.5">
              <button
                onClick={() => handleExpandMock(20)}
                disabled={expanding || questions.length >= 100}
                className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-white border border-indigo-200 text-indigo-700 hover:bg-indigo-50 disabled:opacity-40 px-3.5 py-2.5 rounded-xl transition-all cursor-pointer shadow-2xs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${expanding ? "animate-spin" : ""}`} />
                Add 20 MCQs
              </button>
              <button
                onClick={() => handleExpandMock(40)}
                disabled={expanding || questions.length >= 100}
                className="inline-flex items-center gap-1.5 text-xs font-bold font-mono bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-40 px-4 py-2.5 rounded-xl transition-all cursor-pointer shadow-sm"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Add 40 MCQs
              </button>
              {questions.length >= 100 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-emerald-800 bg-emerald-50 border border-emerald-100 px-3.5 py-2.5 rounded-xl">
                  <CheckCircle className="w-4 h-4 text-emerald-600" /> Fully Expanded Master (100 MCQ Series)
                </span>
              ) : (
                <span className="text-[10px] font-mono text-slate-400 self-center">
                  Target: {questions.length} / 100 Questions
                </span>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-6 border-t border-slate-100 flex items-center justify-between gap-4">
            <button
              onClick={() => setActiveView("selection")}
              className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-slate-400 hover:text-slate-700 bg-white border border-slate-200 px-4 py-3 rounded-xl transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Return to Selection
            </button>
            <button
              onClick={handleStartExam}
              disabled={loadingQuestions}
              className="inline-flex items-center gap-2 text-xs font-extrabold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer"
            >
              {loadingQuestions ? "Preparing Engine..." : "Initialize Simulation"}
              <ArrowRight className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* 3. ACTIVE SIMULATOR CONSOLE */}
      {activeView === "simulator" && questions.length > 0 && (
        <div className="space-y-6">
          
          {/* Main Dark Simulator HUD */}
          <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl flex flex-col md:flex-row items-center justify-between text-white gap-4 shadow-lg">
            <div className="space-y-1 text-center md:text-left">
              <div className="text-[10px] font-bold font-mono text-indigo-400 tracking-wider uppercase flex items-center justify-center md:justify-start gap-1.5">
                <Flame className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
                CIL MT CONSOLE LIVE SCREEN
              </div>
              <h2 className="text-base font-bold font-display leading-tight truncate max-w-sm md:max-w-xl">
                {selectedMock?.name}
              </h2>
            </div>
            
            {/* Ticking Clock with low-time warning alerts */}
            <div className={`flex items-center gap-3 px-4 py-2 border rounded-xl font-mono shrink-0 ${
              timeRemaining < 300 
                ? "bg-rose-500/15 border-rose-500/30 text-rose-400 animate-pulse font-bold" 
                : "bg-slate-800/50 border-slate-800 text-slate-200"
            }`}>
              <Clock className={`w-4 h-4 ${timeRemaining < 300 ? "text-rose-400" : "text-indigo-400"}`} />
              <div className="text-right">
                <span className="text-[10px] block font-semibold leading-none text-slate-500 mb-0.5">TIME REMAINING</span>
                <span className="text-base leading-none tracking-wider">{formatTime(timeRemaining)}</span>
              </div>
            </div>
          </div>

          {/* Double Column Grid: Left is Question Card, Right is Question Palette */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            
            {/* Left Column (Main Question panel - Span 3) */}
            <div className="lg:col-span-3 bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs flex flex-col justify-between min-h-[500px]">
              
              {/* Question Header Status */}
              <div className="space-y-6">
                <div className="flex items-center justify-between text-[10px] font-mono border-b border-slate-100 pb-4">
                  <span className="text-slate-400 uppercase font-bold">
                    ITEM {currentIndex + 1} OF {questions.length}
                  </span>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 border rounded-md font-bold uppercase tracking-wider ${
                      questions[currentIndex].difficulty === "Easy" 
                        ? "bg-emerald-50 border-emerald-100 text-emerald-700" 
                        : questions[currentIndex].difficulty === "Medium" 
                        ? "bg-indigo-50 border-indigo-100 text-indigo-700" 
                        : "bg-rose-50 border-rose-100 text-rose-700"
                    }`}>
                      {questions[currentIndex].difficulty}
                    </span>
                    <span className="text-slate-400">
                      Syllabus: <strong className="text-slate-600">{questions[currentIndex].tags?.[0] || "General CS"}</strong>
                    </span>
                  </div>
                </div>

                {/* Question Body */}
                <div className="space-y-6">
                  <h3 className="font-display font-bold text-slate-800 text-base leading-relaxed whitespace-pre-line">
                    {questions[currentIndex].question}
                  </h3>

                  {/* Options Stack */}
                  <div className="grid grid-cols-1 gap-3.5">
                    {questions[currentIndex].options.map((option, idx) => {
                      const letters = ["A", "B", "C", "D", "E"];
                      const isSelected = answers[questions[currentIndex].id] === option;
                      return (
                        <button
                          key={option}
                          onClick={() => handleSelectOption(option)}
                          className={`w-full text-left px-5 py-4 rounded-xl text-xs font-semibold border transition-all cursor-pointer flex items-center justify-between gap-4 group ${
                            isSelected
                              ? "bg-indigo-600 border-indigo-600 text-white shadow-sm shadow-indigo-600/10 font-bold"
                              : "bg-slate-50/50 border-slate-150 text-slate-600 hover:bg-slate-100 hover:border-slate-300"
                          }`}
                        >
                          <div className="flex items-center gap-3.5">
                            <span className={`w-6 h-6 rounded-lg text-[10px] font-bold font-mono flex items-center justify-center border transition-all ${
                              isSelected
                                ? "bg-white/20 text-white border-white/20"
                                : "bg-white text-slate-400 border-slate-200 group-hover:border-slate-300"
                            }`}>
                              {letters[idx]}
                            </span>
                            <span>{option}</span>
                          </div>
                          {isSelected && (
                            <div className="p-1 bg-white/20 rounded-full">
                              <Check className="w-3 h-3 text-white" />
                            </div>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Bottom Card Controls */}
              <div className="mt-8 pt-6 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                <div className="flex items-center gap-2">
                  <button
                    onClick={handlePrev}
                    disabled={currentIndex === 0}
                    className="inline-flex items-center gap-1 text-xs font-bold font-mono text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> PREV
                  </button>
                  <button
                    onClick={handleNext}
                    disabled={currentIndex === questions.length - 1}
                    className="inline-flex items-center gap-1 text-xs font-bold font-mono text-slate-500 bg-slate-100 hover:bg-slate-200 disabled:opacity-40 px-3 py-2 rounded-xl transition-all cursor-pointer"
                  >
                    NEXT <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleClearOption}
                    disabled={!answers[questions[currentIndex].id]}
                    className="text-xs font-bold font-mono text-slate-400 hover:text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-xl transition-all disabled:opacity-40 cursor-pointer"
                  >
                    CLEAR ANSWER
                  </button>
                  <button
                    onClick={handleToggleFlag}
                    className={`inline-flex items-center gap-1.5 text-xs font-bold font-mono px-3 py-2 rounded-xl transition-all border cursor-pointer ${
                      flagged[questions[currentIndex].id]
                        ? "bg-purple-50 border-purple-200 text-purple-700"
                        : "bg-white border-slate-200 text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${flagged[questions[currentIndex].id] ? "fill-purple-600" : ""}`} />
                    {flagged[questions[currentIndex].id] ? "FLAGGED" : "MARK REVIEW"}
                  </button>
                </div>
              </div>

            </div>

            {/* Right Column (Question Palette Console - Span 1) */}
            <div className="bg-slate-900 border border-slate-800 text-white rounded-2xl p-5 shadow-xs space-y-6">
              
              {/* Stats HUD */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider">Exam Console Status</h3>
                <div className="grid grid-cols-2 gap-2 text-center text-xs">
                  <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block mb-0.5 uppercase">Answered</span>
                    <strong className="text-sm font-display font-bold text-emerald-400">{totalAnswered}</strong>
                  </div>
                  <div className="bg-slate-800/40 p-2.5 rounded-xl border border-slate-800/60">
                    <span className="text-[9px] font-mono text-slate-500 block mb-0.5 uppercase">Flagged</span>
                    <strong className="text-sm font-display font-bold text-purple-400">{totalFlaged}</strong>
                  </div>
                </div>
              </div>

              {/* Grid Palette */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-[10px] font-mono font-bold text-slate-400 uppercase">
                  <span>Questions Palette</span>
                  <span className="text-[9px] text-slate-500">{questions.length} Items</span>
                </div>
                
                <div className="grid grid-cols-5 gap-2 max-h-[220px] overflow-y-auto pr-1">
                  {questions.map((q, idx) => {
                    const isCurrent = currentIndex === idx;
                    const isAnswered = !!answers[q.id];
                    const isFlagged = flagged[q.id];
                    
                    let bgStyle = "bg-slate-800 text-slate-400 border border-slate-800/60 hover:border-slate-700";
                    if (isAnswered) {
                      bgStyle = "bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 hover:bg-emerald-500/20";
                    }
                    if (isFlagged) {
                      bgStyle = "bg-purple-500/20 border border-purple-500/30 text-purple-400 hover:bg-purple-500/30";
                    }
                    if (isCurrent) {
                      bgStyle = "bg-indigo-600 border border-indigo-600 text-white font-bold ring-2 ring-indigo-400/20";
                    }

                    return (
                      <button
                        key={q.id}
                        onClick={() => handleSelectQuestion(idx)}
                        className={`w-full aspect-square flex items-center justify-center text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${bgStyle}`}
                      >
                        {idx + 1}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Submit Console */}
              <div className="pt-4 border-t border-slate-800 space-y-3">
                <button
                  onClick={handleManualSubmit}
                  className="w-full text-center py-3 bg-rose-600 hover:bg-rose-700 rounded-xl text-xs font-bold font-mono tracking-wider transition-all cursor-pointer shadow-sm text-white"
                >
                  SUBMIT FLIGHT RECORD
                </button>
                <p className="text-[9px] font-mono text-slate-500 text-center leading-normal">
                  Completing submission stops the flight clock and archives answers.
                </p>
              </div>

            </div>

          </div>

        </div>
      )}

      {/* 4. POST-EXAM RESULTS HUB */}
      {activeView === "results" && savedExamResult && selectedMock && (
        <div className="space-y-6 animate-fade-in">
          
          {/* Main Results Board */}
          <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-sm space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 gap-4">
              <div className="space-y-1">
                <div className="text-[9px] font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded uppercase tracking-wider inline-block">
                  Simulation Finished
                </div>
                <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
                  Performance Diagnostics Hub
                </h1>
                <p className="text-slate-400 text-xs">
                  Reviewing diagnostics for: <strong>{selectedMock.name}</strong>
                </p>
              </div>
              <button
                onClick={() => {
                  setActiveView("selection");
                  setSelectedMock(null);
                  setSavedExamResult(null);
                  setVisibleReviewsCount(15);
                }}
                className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2.5 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                Return to Arena Dashboard
              </button>
            </div>

            {/* Results Grid Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase block">FINAL SCORE</span>
                <span className="text-3xl font-display font-extrabold text-slate-800">
                  {savedExamResult.score} <span className="text-sm font-normal text-slate-400">/ {savedExamResult.total} Marks</span>
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase block">ACCURACY</span>
                <span className="text-3xl font-display font-extrabold text-emerald-600">
                  {savedExamResult.accuracy}%
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase block">TIME SPENT</span>
                <span className="text-3xl font-display font-extrabold text-indigo-600">
                  {formatTime(savedExamResult.timeSpentSeconds)}
                </span>
              </div>
              <div className="bg-slate-50 border border-slate-100 p-5 rounded-2xl text-center space-y-1.5">
                <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase block">PERFORMANCE GRADE</span>
                <span className={`text-sm font-display font-extrabold block pt-2 uppercase ${
                  savedExamResult.accuracy >= 80 
                    ? "text-emerald-600" 
                    : savedExamResult.accuracy >= 60 
                    ? "text-indigo-600" 
                    : "text-rose-600"
                }`}>
                  {savedExamResult.accuracy >= 85 
                    ? "Flight Commander (Excellent)" 
                    : savedExamResult.accuracy >= 70 
                    ? "Management Trainee (Qualified)" 
                    : "Cadet (Requires Revision)"}
                </span>
              </div>
            </div>

            {/* Subject wise Diagnostics breakdown */}
            <div className="space-y-3.5">
              <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Subject-Wise Analytics Breakdown</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {Object.entries(savedExamResult.subjectStats).map(([subj, statValue]) => {
                  const stat = statValue as { total: number; correct: number };
                  const pct = Math.round((stat.correct / stat.total) * 100) || 0;
                  return (
                    <div key={subj} className="border border-slate-100 p-4 rounded-xl space-y-2 text-xs bg-slate-50/50">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-slate-700 truncate max-w-[150px]">{subj}</span>
                        <span className="font-mono font-bold text-slate-500">{stat.correct} / {stat.total} Correct ({pct}%)</span>
                      </div>
                      <div className="w-full bg-slate-200 h-1.5 rounded-full overflow-hidden">
                        <div className="bg-indigo-600 h-full rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Question-by-Question Solution walkthrough panel */}
          <div className="space-y-4">
            <h3 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">Academic Solutions & Expert Tricks Walkthrough</h3>
            
            <div className="space-y-4">
              {savedExamResult.questionReviews.slice(0, visibleReviewsCount).map((review, idx) => {
                const letters = ["A", "B", "C", "D", "E"];
                return (
                  <div 
                    key={review.question.id}
                    className={`bg-white border rounded-2xl p-6 md:p-8 shadow-xs space-y-6 ${
                      review.isCorrect 
                        ? "border-emerald-100/80 bg-emerald-50/5" 
                        : review.userAnswer === "" 
                        ? "border-slate-100" 
                        : "border-rose-100/80 bg-rose-50/5"
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between border-b border-slate-100 pb-4 text-xs font-mono">
                      <div className="flex items-center gap-2">
                        <span className="bg-slate-100 text-slate-700 font-bold px-2 py-0.5 rounded">
                          ITEM {idx + 1}
                        </span>
                        {review.isCorrect ? (
                          <span className="text-emerald-600 font-bold flex items-center gap-1 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded uppercase text-[10px]">
                            <CheckCircle className="w-3.5 h-3.5" /> Correct
                          </span>
                        ) : review.userAnswer === "" ? (
                          <span className="text-slate-500 font-bold flex items-center gap-1 bg-slate-50 border border-slate-150 px-2 py-0.5 rounded uppercase text-[10px]">
                            Skipped
                          </span>
                        ) : (
                          <span className="text-rose-600 font-bold flex items-center gap-1 bg-rose-50 border border-rose-100 px-2 py-0.5 rounded uppercase text-[10px]">
                            <XCircle className="w-3.5 h-3.5" /> Missed
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <span className="text-slate-400">
                          Syllabus: <strong className="text-slate-600">{review.question.tags?.[0] || "General CS"}</strong>
                        </span>
                        {!review.isCorrect && (
                          <button
                            onClick={() => handleSaveToMistakes(idx)}
                            disabled={review.savedToMistakes}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 text-[10px] font-bold font-mono rounded-lg border transition-all cursor-pointer ${
                              review.savedToMistakes
                                ? "bg-slate-100 border-slate-200 text-slate-400 cursor-not-allowed"
                                : "bg-indigo-50 border-indigo-100 text-indigo-700 hover:bg-indigo-100"
                            }`}
                          >
                            <Bookmark className="w-3 h-3" />
                            {review.savedToMistakes ? "LOGGED IN MISTAKES" : "LOG IN MISTAKE BOOK"}
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Question Statement */}
                    <h4 className="font-display font-bold text-slate-800 text-sm md:text-base leading-relaxed whitespace-pre-line">
                      {review.question.question}
                    </h4>

                    {/* Options Stack */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
                      {review.question.options.map((option, oIdx) => {
                        const isCorrectOption = option === review.question.answer;
                        const isUserOption = option === review.userAnswer;
                        
                        let optionStyle = "border-slate-150 bg-slate-50/50 text-slate-600";
                        if (isCorrectOption) {
                          optionStyle = "bg-emerald-50 border-emerald-300 text-emerald-800 font-bold shadow-xs";
                        } else if (isUserOption) {
                          optionStyle = "bg-rose-50 border-rose-300 text-rose-800 font-bold shadow-xs";
                        }

                        return (
                          <div
                            key={option}
                            className={`px-4 py-3 border rounded-xl flex items-center justify-between gap-3 ${optionStyle}`}
                          >
                            <div className="flex items-center gap-3">
                              <span className={`w-5 h-5 text-[9px] font-bold font-mono flex items-center justify-center border rounded ${
                                isCorrectOption
                                  ? "bg-emerald-500 text-white border-emerald-500"
                                  : isUserOption
                                  ? "bg-rose-500 text-white border-rose-500"
                                  : "bg-white text-slate-400 border-slate-200"
                              }`}>
                                {letters[oIdx]}
                              </span>
                              <span>{option}</span>
                            </div>
                            
                            {isCorrectOption && (
                              <span className="text-[10px] bg-emerald-100/60 text-emerald-800 font-bold px-2 py-0.5 rounded font-mono">
                                CORRECT
                              </span>
                            )}
                            {isUserOption && !isCorrectOption && (
                              <span className="text-[10px] bg-rose-100/60 text-rose-800 font-bold px-2 py-0.5 rounded font-mono">
                                YOUR CHOICE
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Expandable Explanation block */}
                    <div className="bg-slate-50 border border-slate-150/60 rounded-2xl p-5 md:p-6 space-y-4">
                      
                      {/* Detailed Solution */}
                      <div className="space-y-1 text-xs">
                        <h5 className="font-mono font-bold text-slate-500 uppercase tracking-wide flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> Academic Explanation & Formulae:
                        </h5>
                        <p className="text-slate-600 leading-relaxed whitespace-pre-line pt-1">
                          {review.question.explanation}
                        </p>
                      </div>

                      {/* Prof Flight Trick */}
                      <div className="border-t border-slate-200/50 pt-4 space-y-1.5 text-xs">
                        <h5 className="font-mono font-bold text-amber-600 uppercase tracking-wide flex items-center gap-1">
                          <Flame className="w-3.5 h-3.5 text-amber-500 fill-amber-400" /> Exam Shortcut / flight Trick:
                        </h5>
                        <div className="bg-amber-50/60 border border-amber-100 p-3.5 rounded-xl text-amber-900 leading-relaxed italic">
                          "{review.question.examTrick}"
                        </div>
                      </div>
                    </div>

                  </div>
                );
              })}

              {/* Lazy Loading pagination button control */}
              {visibleReviewsCount < savedExamResult.questionReviews.length && (
                <div className="pt-4 pb-8 text-center">
                  <button
                    onClick={() => setVisibleReviewsCount((prev) => Math.min(prev + 15, savedExamResult.questionReviews.length))}
                    className="inline-flex items-center gap-2 text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-6 py-3.5 rounded-xl hover:bg-indigo-100 transition-all cursor-pointer shadow-2xs"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
                    Load More Solutions (+15 of {savedExamResult.questionReviews.length - visibleReviewsCount} remaining)
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      )}

      {/* 5. SUBMIT CONFIRM MODAL OVERLAY */}
      {showSubmitConfirm && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white border border-slate-150 rounded-2xl p-6 md:p-8 max-w-md w-full shadow-2xl space-y-5 animate-scale-up">
            <div className="text-center space-y-3">
              <div className="p-3 bg-rose-50 border border-rose-100 text-rose-600 rounded-full w-14 h-14 flex items-center justify-center mx-auto">
                <AlertTriangle className="w-6 h-6 animate-bounce" />
              </div>
              <h3 className="font-display text-lg font-bold text-slate-800">
                Submit Your Flight Record?
              </h3>
              <p className="text-slate-400 text-xs">
                You are about to complete and lock this mock exam session. Make sure you audit your actions before continuing.
              </p>
            </div>

            {/* Exam action Audit stats */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-center text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-400">Total Questions:</span>
                <strong className="text-slate-700 font-bold">{questions.length}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Answered Questions:</span>
                <strong className="text-emerald-600 font-bold">{totalAnswered}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Marked for Review:</span>
                <strong className="text-purple-600 font-bold">{totalFlaged}</strong>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-bold">Unanswered / Skipped:</span>
                <strong className="text-rose-500 font-extrabold">{questions.length - totalAnswered}</strong>
              </div>
            </div>

            <div className="flex items-center justify-between gap-4">
              <button
                onClick={() => setShowSubmitConfirm(false)}
                className="w-1/2 py-2.5 bg-white border border-slate-200 text-slate-500 hover:bg-slate-50 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                CANCEL & RESUME
              </button>
              <button
                onClick={confirmSubmit}
                className="w-1/2 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer shadow-sm shadow-rose-600/10"
              >
                YES, SUBMIT EXAM
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Local Toast Banner Overlay */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 max-w-sm animate-slide-up text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

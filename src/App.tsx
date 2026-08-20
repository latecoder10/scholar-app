/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { 
  LayoutDashboard, 
  BookOpen, 
  AlertTriangle, 
  RefreshCw, 
  BarChart, 
  Upload, 
  Cpu, 
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  Flame,
  Award,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Trash2,
  BrainCircuit,
  Layers,
  Sparkles,
  Smartphone
} from "lucide-react";

import { Subject, Chapter, Question, UserProgress, UserAnswerSubmission } from "./types";
import Dashboard from "./components/Dashboard";
import SubjectView from "./components/SubjectView";
import ChapterView from "./components/ChapterView";
import PracticeSession from "./components/PracticeSession";
import MistakeBook from "./components/MistakeBook";
import RevisionEngine from "./components/RevisionEngine";
import AnalyticsView from "./components/AnalyticsView";
import ContentPackManager from "./components/ContentPackManager";
import TechArchitecture from "./components/TechArchitecture";
import MockTestArena from "./components/MockTestArena";
import MobileAppHub from "./components/MobileAppHub";
import ExamSelectorModal, { AVAILABLE_EXAMS } from "./components/ExamSelectorModal";

export default function App() {
  // Exam Selection State
  const [selectedExam, setSelectedExam] = useState<string>(() => {
    try {
      const saved = localStorage.getItem("exam_scholar_active_track");
      return saved || "claude-ccaf";
    } catch {
      return "claude-ccaf";
    }
  });

  const [showExamModal, setShowExamModal] = useState(false);

  // Check if first-time visitor to pop open selector modal gently
  useEffect(() => {
    try {
      const hasChosen = localStorage.getItem("exam_scholar_has_chosen");
      if (!hasChosen) {
        setShowExamModal(true);
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const handleSelectExamTrack = (examId: string) => {
    setSelectedExam(examId);
    try {
      localStorage.setItem("exam_scholar_active_track", examId);
      localStorage.setItem("exam_scholar_has_chosen", "true");
    } catch (e) {
      console.error(e);
    }
  };

  // Navigation State
  const [currentTab, setCurrentTab] = useState<string>("dashboard");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedPaperTab, setSelectedPaperTab] = useState<string>("all");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem("cil_sidebar_collapsed");
      return saved ? JSON.parse(saved) : false;
    } catch {
      return false;
    }
  });

  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem("cil_sidebar_collapsed", JSON.stringify(sidebarCollapsed));
    } catch (e) {
      console.error(e);
    }
  }, [sidebarCollapsed]);

  // Reset progress custom states
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToastNotification = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(prev => prev === msg ? null : prev);
    }, 4000);
  };

  // Content & Progress State
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [progress, setProgress] = useState<UserProgress>({
    answeredQuestions: {},
    recentActivity: [],
    mistakes: [],
  });

  // Flow State
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);
  const [selectedChapter, setSelectedChapter] = useState<Chapter | null>(null);
  const [activeSession, setActiveSession] = useState<{
    questions: Question[];
    mode: "practice" | "revision" | "mistakes";
    chapterId: string;
    chapterName: string;
    subject: string;
  } | null>(null);

  // Main workspace scroll container ref
  const workspaceScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on every navigation/view change
  useEffect(() => {
    if (workspaceScrollRef.current) {
      workspaceScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [currentTab, selectedSubject?.name, selectedChapter?.id, activeSession?.chapterId, selectedExam, selectedPaperTab]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch all curriculum subjects & chapters (Auto Discovery API)
  const fetchCurriculum = async () => {
    try {
      const res = await fetch("/api/content");
      if (res.ok) {
        const data = await res.json();
        setSubjects(data.subjects || []);

        // Sync currently viewed subject and chapter references to prevent stale render states
        if (selectedSubject) {
          const freshSub = data.subjects.find((s: Subject) => s.name === selectedSubject.name);
          if (freshSub) {
            setSelectedSubject(freshSub);
            if (selectedChapter) {
              const freshChap = freshSub.chapters.find((c: Chapter) => c.id === selectedChapter.id);
              if (freshChap) {
                setSelectedChapter(freshChap);
              }
            }
          }
        }
      }
    } catch (e) {
      console.error("Error fetching discovered content packs", e);
    }
  };

  // Fetch active user stats & mistake books
  const fetchProgress = async () => {
    try {
      const res = await fetch("/api/progress");
      if (res.ok) {
        const data = await res.json();
        setProgress(data);
      }
    } catch (e) {
      console.error("Error fetching student progress", e);
    }
  };

  // Initial Boot loader
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCurriculum(), fetchProgress()]);
      setLoading(false);
    };
    init();
  }, []);

  // Synchronize on demand
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([fetchCurriculum(), fetchProgress()]);
    setRefreshing(false);
    showToastNotification("All examination content & student flight logs refreshed.");
  };

  // Handle question submission from Practice/Exam session
  const handleSubmitAnswer = async (submission: UserAnswerSubmission) => {
    try {
      const res = await fetch("/api/answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
      });
      if (res.ok) {
        const updatedProgress = await res.json();
        setProgress(updatedProgress);
        return updatedProgress;
      }
    } catch (e) {
      console.error("Failed to persist answer record", e);
    }
  };

  // Handle clearing mistake book
  const handleClearMistakes = async () => {
    try {
      const res = await fetch("/api/mistakes/clear", { method: "POST" });
      if (res.ok) {
        const updatedProgress = await res.json();
        setProgress(updatedProgress);
        showToastNotification("Mistake Book cleared successfully.");
      }
    } catch (e) {
      console.error("Failed to clear mistake logs", e);
    }
  };

  // Reset entire flight progress
  const handleClearProgress = () => {
    setShowResetConfirm(true);
  };

  const confirmClearProgress = async () => {
    setShowResetConfirm(false);
    try {
      const res = await fetch("/api/progress/clear", { method: "POST" });
      if (res.ok) {
        const updatedProgress = await res.json();
        setProgress(updatedProgress);
        showToastNotification("All flight metrics and test records have been reset.");
      }
    } catch (e) {
      console.error("Failed to reset flight logs", e);
    }
  };

  // Handlers for subject & chapter selection
  const handleSelectSubject = (subjectName: string) => {
    const subj = subjects.find((s) => s.name === subjectName);
    if (subj) {
      setSelectedSubject(subj);
      setSelectedChapter(null);
      setActiveSession(null);
      setCurrentTab("subjects");
    }
  };

  const handleSelectChapter = (subjectName: string, chapter: Chapter) => {
    const subj = subjects.find((s) => s.name === subjectName);
    if (subj) {
      setSelectedSubject(subj);
      setSelectedChapter(chapter);
      setActiveSession(null);
      setCurrentTab("chapter-detail");
    }
  };

  const handleStartSession = (
    questions: Question[],
    mode: "practice" | "revision" | "mistakes",
    chapterId: string,
    chapterName: string,
    subject: string
  ) => {
    setActiveSession({
      questions,
      mode,
      chapterId,
      chapterName,
      subject,
    });
    setCurrentTab("active-session");
  };

  const handleFinishSession = () => {
    setActiveSession(null);
    handleRefreshAll();
    if (selectedChapter) {
      setCurrentTab("chapter-detail");
    } else {
      setCurrentTab("dashboard");
    }
  };

  // Filter Curriculum Subjects (excluding raw mock test folders from regular curriculum list)
  const curriculumSubjects = subjects.filter(s => s.name !== "Mock Tests" && !s.name.toLowerCase().includes("mock"));

  const filteredCurriculumSubjects = curriculumSubjects.filter((s) => {
    if (selectedExam === "all") return true;
    if (selectedExam === "claude-ccaf") {
      return s.exam === "Claude CCAF" || s.name.toLowerCase().includes("ccaf");
    }
    if (selectedExam === "cil-mt") {
      return s.exam !== "Claude CCAF" && !s.name.toLowerCase().includes("ccaf");
    }
    return true;
  });

  const activeExamConfig = AVAILABLE_EXAMS.find(e => e.id === selectedExam) || AVAILABLE_EXAMS[0];

  // Helper to obtain rich header titles, subtitles, and icons for the topbar
  const getHeaderInfo = () => {
    if (currentTab === "active-session" && activeSession) {
      return {
        title: activeSession.chapterName,
        subtitle: `Active Practice Session • ${activeSession.mode.toUpperCase()} MODE`,
        icon: GraduationCap,
        tag: "In Progress"
      };
    }
    if (selectedSubject && currentTab === "subjects") {
      return {
        title: selectedSubject.name,
        subtitle: `Curriculum Pack • ${selectedSubject.chapters.length} academic chapters available`,
        icon: BookOpen,
        tag: "Subject Index"
      };
    }
    if (selectedChapter && currentTab === "chapter-detail") {
      return {
        title: selectedChapter.name,
        subtitle: `Comprehensive chapter study deck and custom MCQ testing engines`,
        icon: GraduationCap,
        tag: "Chapter Deck"
      };
    }
    
    const activeItem = navItems.find(item => item.id === currentTab);
    if (activeItem) {
      let subtitle = "";
      switch (activeItem.id) {
        case "dashboard":
          subtitle = `${activeExamConfig.name} • Live coverage and readiness diagnostics`;
          break;
        case "subjects":
          subtitle = "Explore discovered study notes, key curriculum formulas, and concept questions";
          break;
        case "mock-tests":
          subtitle = "Simulated high-rigor exams structured to replicate actual certification standard guidelines";
          break;
        case "mistakes":
          subtitle = "Retake and master questions you previously answered incorrectly";
          break;
        case "revision":
          subtitle = "Compile personalized revision packs and practice sets from selected disciplines";
          break;
        case "analytics":
          subtitle = "Deep analytics overview measuring accuracy, coverage, and time velocity";
          break;
        case "content-manager":
          subtitle = "On-demand subject content-expansion, custom JSON loading, and offline packaging";
          break;
        case "mobile-app":
          subtitle = "Standalone offline React Native & Expo mobile app codebase (/mobile)";
          break;
        case "tech-spec":
          subtitle = "REST architectural blueprints and controller mappings for backend endpoints";
          break;
        default:
          subtitle = "Exam Scholar Hub preparation suite";
      }
      return {
        title: activeItem.name,
        subtitle,
        icon: activeItem.icon,
        tag: activeItem.name
      };
    }
    
    return {
      title: "Exam Scholar Hub",
      subtitle: "Multi-Exam Cognitive Preparation Suite",
      icon: GraduationCap,
      tag: "Academic"
    };
  };

  // Active mistakes for selected exam track
  const activeMistakes = (progress.mistakes || []).filter(m => {
    if (selectedExam === "all") return true;
    const isClaude = m.exam === "Claude CCAF" || 
      (m.subject && (m.subject.includes("Claude") || m.subject.includes("CCAF") || m.subject.includes("MCP") || m.subject.includes("Agentic") || m.subject.includes("Prompt") || m.subject.includes("Context") || m.subject.includes("Enterprise"))) ||
      (m.chapterId && m.chapterId.includes("claude"));
    if (selectedExam === "claude-ccaf") return isClaude;
    if (selectedExam === "cil-mt") return !isClaude;
    return true;
  });

  // Nav Item List
  const navItems = [
    { id: "dashboard", name: "Mission Control", icon: LayoutDashboard },
    { id: "subjects", name: "Curriculum Packs", icon: BookOpen },
    { id: "mock-tests", name: "Mock Test Arena", icon: Award },
    { id: "mistakes", name: "Mistake Book", icon: AlertTriangle, badge: activeMistakes.length },
    { id: "revision", name: "Revision Engine", icon: RefreshCw },
    { id: "analytics", name: "Performance Stats", icon: BarChart },
    { id: "mobile-app", name: "Mobile App (Expo)", icon: Smartphone },
    { id: "content-manager", name: "Plug-and-Play Hub", icon: Upload },
    { id: "tech-spec", name: "System Spec Console", icon: Cpu },
  ];

  const isCollapsed = sidebarCollapsed && !isMobile;
  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="h-screen overflow-hidden bg-slate-50/50 flex flex-col md:flex-row font-sans text-slate-700 antialiased">
      
      {/* 1. Mobile Top Navigation Bar */}
      <div className="md:hidden bg-slate-50 border-b border-slate-200 sticky top-0 z-30 shrink-0 shadow-3xs p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-3xs">
            {selectedExam === "claude-ccaf" ? (
              <BrainCircuit className="w-5 h-5 text-purple-600" />
            ) : selectedExam === "cil-mt" ? (
              <GraduationCap className="w-5 h-5 text-indigo-600" />
            ) : (
              <Layers className="w-5 h-5 text-indigo-600" />
            )}
          </div>
          <div>
            <span className="font-display font-extrabold tracking-tight text-sm text-slate-900 block leading-none">
              Exam Scholar Hub
            </span>
            <button
              onClick={() => setShowExamModal(true)}
              className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block mt-0.5 hover:underline text-left cursor-pointer"
            >
              {activeExamConfig.shortName} ▾
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowExamModal(true)}
            className="p-2 bg-white border border-slate-200 rounded-xl text-indigo-600 text-xs font-mono font-bold"
            title="Switch Exam Track"
          >
            <Sparkles className="w-4 h-4" />
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2.5 hover:bg-slate-100 border border-slate-200 active:bg-slate-200 rounded-xl text-slate-600 transition-all cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Sidebar Backdrop Overlay */}
      {mobileMenuOpen && (
        <div 
          onClick={() => setMobileMenuOpen(false)}
          className="md:hidden fixed inset-0 bg-slate-900/40 backdrop-blur-xs z-35 transition-opacity duration-300"
        />
      )}

      {/* 2. Responsive Left Sidebar Navigation */}
      <div className={`
        fixed inset-y-0 left-0 z-40 bg-slate-50 text-slate-700 flex flex-col justify-between border-r border-slate-200
        transition-all duration-300 ease-in-out transform md:translate-x-0 md:static md:inset-auto md:h-full shrink-0
        ${mobileMenuOpen ? "translate-x-0" : "-translate-x-full"}
        ${isCollapsed ? "w-64 md:w-20" : "w-64"}
      `}>
        <div className="flex flex-col flex-1 min-h-0">
          {/* Sidebar Brand Header */}
          <div className={`h-[74px] border-b border-slate-200 flex items-center shrink-0 transition-all ${
            isCollapsed ? "justify-center px-4" : "justify-between px-6"
          }`}>
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="p-2 bg-indigo-50 border border-indigo-100/60 rounded-xl shadow-xs text-indigo-600 shrink-0">
                {selectedExam === "claude-ccaf" ? (
                  <BrainCircuit className="w-6 h-6 text-purple-600" />
                ) : selectedExam === "cil-mt" ? (
                  <GraduationCap className="w-6 h-6 text-indigo-600" />
                ) : (
                  <Layers className="w-6 h-6 text-indigo-600" />
                )}
              </div>
              {!isCollapsed && (
                <div className="min-w-0 animate-fade-in">
                  <h2 className="font-display font-bold text-base tracking-tight leading-none text-slate-900 truncate">
                    Exam Scholar
                  </h2>
                  <button
                    onClick={() => setShowExamModal(true)}
                    className="text-[9px] font-mono text-indigo-600 hover:text-indigo-700 font-bold block mt-1 tracking-wider uppercase truncate text-left cursor-pointer"
                    title="Click to Switch Exam Track"
                  >
                    {activeExamConfig.shortName} ▾
                  </button>
                </div>
              )}
            </div>

            {/* Collapse toggle button on desktop */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden md:flex p-1.5 hover:bg-slate-150 border border-slate-200/80 rounded-lg text-slate-400 hover:text-slate-700 transition-all cursor-pointer shadow-3xs shrink-0"
              title={sidebarCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {sidebarCollapsed ? (
                <ChevronRight className="w-4 h-4" />
              ) : (
                <ChevronLeft className="w-4 h-4" />
              )}
            </button>

            {/* Close button on mobile */}
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 active:bg-slate-200 transition-all cursor-pointer shrink-0"
              title="Close Menu"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Track Switcher Pill */}
          {!isCollapsed && (
            <div className="px-4 pt-3">
              <button
                onClick={() => setShowExamModal(true)}
                className="w-full flex items-center justify-between p-2.5 bg-indigo-50/70 hover:bg-indigo-100/70 border border-indigo-100 rounded-xl transition-all cursor-pointer text-left group"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <Sparkles className="w-3.5 h-3.5 text-indigo-600 shrink-0" />
                  <span className="text-[11px] font-mono font-bold text-indigo-900 truncate">
                    {activeExamConfig.shortName}
                  </span>
                </div>
                <span className="text-[10px] font-mono font-semibold text-indigo-600 bg-white/80 border border-indigo-200/60 px-1.5 py-0.5 rounded shadow-3xs group-hover:bg-white">
                  Switch
                </span>
              </button>
            </div>
          )}

          {/* Navigation Links */}
          <nav className={`p-4 flex-1 overflow-y-auto ${isCollapsed ? "space-y-3" : "space-y-1.5"}`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentTab === item.id || (item.id === "subjects" && currentTab === "chapter-detail");
              return (
                <button
                  key={item.id}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => {
                    setCurrentTab(item.id);
                    if (item.id === "subjects") {
                      setSelectedSubject(null);
                      setSelectedChapter(null);
                    }
                    setMobileMenuOpen(false);
                    setActiveSession(null);
                  }}
                  className={`w-full flex items-center transition-all cursor-pointer ${
                    isCollapsed 
                      ? "justify-center p-3 rounded-xl" 
                      : "justify-between px-4 py-3 rounded-xl"
                  } text-xs font-semibold ${
                    isActive
                      ? "bg-indigo-600 text-white font-bold shadow-xs shadow-indigo-600/15 hover:bg-indigo-700"
                      : "text-slate-600 hover:text-indigo-600 hover:bg-slate-150"
                  }`}
                >
                  <div className={`flex items-center ${isCollapsed ? "justify-center relative" : "gap-3"} min-w-0`}>
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? "text-white" : "text-slate-500"}`} />
                    {!isCollapsed && <span className="truncate">{item.name}</span>}
                    
                    {/* Corner badge overlay for collapsed mode */}
                    {isCollapsed && item.badge !== undefined && item.badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[8px] font-bold font-mono rounded-full flex items-center justify-center border border-white">
                        {item.badge}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600 border border-slate-300/40"
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Sidebar Footer Operations */}
        <div className={`border-t border-slate-200 shrink-0 bg-slate-100/50 transition-all ${
          isCollapsed ? "p-3 space-y-3 text-center" : "p-4 space-y-3"
        }`}>
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`} title="Engine Live">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            {!isCollapsed && (
              <span className="text-[10px] font-mono font-semibold text-slate-500 uppercase tracking-wider truncate">
                Engine Auto-Discovery Live
              </span>
            )}
          </div>
          <button
            onClick={handleClearProgress}
            title={isCollapsed ? "Reset Flight Records" : undefined}
            className={`w-full text-rose-600 hover:text-rose-700 transition-all cursor-pointer flex items-center justify-center ${
              isCollapsed
                ? "p-2.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl"
                : "px-4 py-2 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl text-left text-[10px] font-mono font-semibold"
            }`}
          >
            {isCollapsed ? (
              <Trash2 className="w-4 h-4 text-rose-500" />
            ) : (
              <span className="truncate">Reset Flight Records</span>
            )}
          </button>
        </div>
      </div>

      {/* 3. Main Workspace Area */}
      <div 
        ref={workspaceScrollRef} 
        id="main-workspace-scroll" 
        className="flex-1 flex flex-col min-w-0 overflow-y-auto scroll-smooth"
      >
        
        {/* Dynamic Topbar */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex justify-between items-center shrink-0 shadow-2xs">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="p-2 bg-indigo-50/80 border border-indigo-100/60 text-indigo-600 rounded-xl hidden sm:flex items-center justify-center shrink-0 shadow-3xs">
              <HeaderIcon className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
                <h1 className="font-display font-bold text-sm md:text-base text-slate-900 tracking-tight leading-tight truncate">
                  {headerInfo.title}
                </h1>
                {headerInfo.tag && (
                  <span className="inline-flex items-center text-[10px] font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md shrink-0">
                    {headerInfo.tag}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] font-medium leading-normal mt-0.5 hidden md:block max-w-xl truncate">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setShowExamModal(true)}
              className="inline-flex items-center gap-1.5 text-xs font-bold font-mono text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-500" />
              <span className="hidden sm:inline">Track: <strong>{activeExamConfig.shortName}</strong></span>
              <span className="sm:hidden">{activeExamConfig.shortName}</span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              className="inline-flex items-center gap-2 text-xs font-bold font-mono text-indigo-600 bg-indigo-50/80 hover:bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-3xs hover:shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-3.5 h-3.5 text-indigo-500 ${refreshing ? "animate-spin" : ""}`} /> 
              <span className="hidden sm:inline">{refreshing ? "Syncing..." : "Sync Discovery"}</span>
              <span className="sm:hidden">{refreshing ? "Sync" : "Sync"}</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body router */}
        <main className="p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-32 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-800">Booting Exam Scholar Hub</h3>
                <p className="text-xs font-mono text-slate-400">Discovering JSON curriculum packs recursively...</p>
              </div>
            </div>
          ) : (
            <>
              {/* Active exam taking HUD */}
              {currentTab === "active-session" && activeSession && (
                <PracticeSession
                  questions={activeSession.questions}
                  mode={activeSession.mode}
                  chapterId={activeSession.chapterId}
                  chapterName={activeSession.chapterName}
                  subject={activeSession.subject}
                  onFinish={handleFinishSession}
                  onSubmitAnswer={handleSubmitAnswer}
                />
              )}

              {/* Standard routed views */}
              {currentTab === "dashboard" && (
                <Dashboard
                  subjects={subjects}
                  progress={progress}
                  selectedExam={selectedExam}
                  onOpenExamSelector={() => setShowExamModal(true)}
                  onSelectChapter={handleSelectChapter}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === "subjects" && (
                <>
                  {selectedSubject ? (
                    <SubjectView
                      subject={selectedSubject}
                      progress={progress}
                      onBack={() => setSelectedSubject(null)}
                      onSelectChapter={handleSelectChapter}
                    />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="space-y-1">
                          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
                            Curriculum & Domain Packs
                          </h1>
                          <p className="text-slate-400 text-xs">
                            Explore discovered chapter decks, study notes, and scenario-based questions for {activeExamConfig.name}.
                          </p>
                        </div>

                        <button
                          onClick={() => setShowExamModal(true)}
                          className="inline-flex items-center gap-1.5 text-xs font-mono font-bold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
                        >
                          <Sparkles className="w-3.5 h-3.5" /> Filter Track: {activeExamConfig.shortName}
                        </button>
                      </div>

                      {/* Tab Selection Filter */}
                      {selectedExam === "claude-ccaf" ? (
                        <div className="flex border-b border-slate-200 gap-6">
                          <button
                            className="pb-3 text-sm font-semibold border-b-2 border-purple-600 text-purple-700 font-bold"
                          >
                            All CCAF Domains ({filteredCurriculumSubjects.length})
                          </button>
                        </div>
                      ) : selectedExam === "cil-mt" ? (
                        <div className="flex border-b border-slate-200 gap-6">
                          <button
                            onClick={() => setSelectedPaperTab("all")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "all"
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            All Papers ({filteredCurriculumSubjects.length})
                          </button>
                          <button
                            onClick={() => setSelectedPaperTab("Paper-I")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "Paper-I"
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Paper I: General Aptitude ({filteredCurriculumSubjects.filter(s => s.paper === "Paper-I").length})
                          </button>
                          <button
                            onClick={() => setSelectedPaperTab("Paper-II")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "Paper-II"
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Paper II: Technical Core ({filteredCurriculumSubjects.filter(s => s.paper === "Paper-II").length})
                          </button>
                        </div>
                      ) : (
                        <div className="flex border-b border-slate-200 gap-6">
                          <button
                            onClick={() => setSelectedPaperTab("all")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "all"
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            All Examination Tracks ({filteredCurriculumSubjects.length})
                          </button>
                          <button
                            onClick={() => setSelectedPaperTab("Claude CCAF")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "Claude CCAF"
                                ? "border-purple-600 text-purple-700 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            Claude CCAF ({filteredCurriculumSubjects.filter(s => s.exam === "Claude CCAF").length})
                          </button>
                          <button
                            onClick={() => setSelectedPaperTab("CIL MT")}
                            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer ${
                              selectedPaperTab === "CIL MT"
                                ? "border-indigo-600 text-indigo-600 font-bold"
                                : "border-transparent text-slate-400 hover:text-slate-600"
                            }`}
                          >
                            CIL MT ({filteredCurriculumSubjects.filter(s => s.exam !== "Claude CCAF").length})
                          </button>
                        </div>
                      )}

                      {filteredCurriculumSubjects.length > 0 ? (
                        <>
                          {(() => {
                            const activeShownSubjects = filteredCurriculumSubjects.filter(sub => {
                              if (selectedExam === "cil-mt") {
                                return selectedPaperTab === "all" || sub.paper === selectedPaperTab;
                              }
                              if (selectedExam === "all") {
                                if (selectedPaperTab === "Claude CCAF") return sub.exam === "Claude CCAF";
                                if (selectedPaperTab === "CIL MT") return sub.exam !== "Claude CCAF";
                                return true;
                              }
                              return true;
                            });

                            return activeShownSubjects.length > 0 ? (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {activeShownSubjects.map((sub) => {
                                  const attemptedKeys = Object.keys(progress.answeredQuestions);
                                  let subAttempted = 0;
                                  attemptedKeys.forEach((k) => {
                                    if (k.startsWith(`${sub.name}:`)) subAttempted++;
                                  });
                                  const coveragePct = sub.totalQuestions > 0 ? Math.round((subAttempted / sub.totalQuestions) * 100) : 0;
                                  const isClaudeSubject = sub.exam === "Claude CCAF" || sub.name.toLowerCase().includes("ccaf");

                                  return (
                                    <div
                                      key={sub.name}
                                      onClick={() => handleSelectSubject(sub.name)}
                                      className="bg-white border border-slate-150 hover:border-indigo-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                                    >
                                      <div className="space-y-2">
                                        <div className="flex items-center justify-between">
                                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold font-mono uppercase tracking-wider border ${
                                            isClaudeSubject
                                              ? "bg-purple-50 border-purple-200 text-purple-700"
                                              : sub.paper === "Paper-I"
                                              ? "bg-indigo-50 border-indigo-100 text-indigo-700"
                                              : "bg-emerald-50 border-emerald-100 text-emerald-700"
                                          }`}>
                                            {isClaudeSubject 
                                              ? "Claude CCAF Domain" 
                                              : sub.paper === "Paper-I" 
                                              ? "CIL: Paper I General" 
                                              : "CIL: Paper II Technical"}
                                          </div>
                                          <span className="text-xs font-mono text-slate-400 font-semibold">
                                            {sub.chapters.length} Chapters
                                          </span>
                                        </div>
                                        <h3 className="font-display text-lg font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                                          {sub.name}
                                        </h3>
                                        <p className="text-xs text-slate-500 line-clamp-2">
                                          Auto-discovered <strong>{sub.chapters.length}</strong> active content chapters containing <strong>{sub.totalQuestions}</strong> questions total.
                                        </p>
                                      </div>

                                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-2">
                                        <div className="flex justify-between text-xs font-mono">
                                          <span className="text-slate-400">Total Coverage</span>
                                          <span className="font-semibold text-slate-700">{coveragePct}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                                          <div className={`h-full rounded-full ${
                                            isClaudeSubject ? "bg-purple-600" : sub.paper === "Paper-I" ? "bg-indigo-600" : "bg-emerald-500"
                                          }`} style={{ width: `${coveragePct}%` }} />
                                        </div>
                                      </div>
                                    </div>
                                  );
                                })}
                              </div>
                            ) : (
                              <div className="text-center py-16 bg-white border border-dashed border-slate-100 rounded-2xl max-w-xl mx-auto space-y-4">
                                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                                <div className="space-y-1.5">
                                  <h3 className="font-display text-base font-bold text-slate-800">No Content in Selected Filter</h3>
                                  <p className="text-slate-400 text-xs px-6">
                                    No active content packs matched this tab filter. Switch tabs to see all available packs.
                                  </p>
                                </div>
                              </div>
                            );
                          })()}
                        </>
                      ) : (
                        <div className="text-center py-20 bg-white border border-dashed border-slate-100 rounded-2xl max-w-xl mx-auto space-y-4">
                          <HelpCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                          <div className="space-y-1.5">
                            <h3 className="font-display text-base font-bold text-slate-800">No Content Discovered</h3>
                            <p className="text-slate-400 text-xs px-6">
                              The `./content/` folder is currently empty. Drop some exam chapter JSON files in the content folder or use the <strong>Plug-and-Play Hub</strong> upload panel to place them!
                            </p>
                          </div>
                          <button
                            onClick={() => setCurrentTab("content-manager")}
                            className="text-xs font-bold font-mono text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-100 cursor-pointer"
                          >
                            Go to Upload Hub
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </>
              )}

              {currentTab === "chapter-detail" && selectedSubject && selectedChapter && (
                <ChapterView
                  subjectName={selectedSubject.name}
                  chapter={selectedChapter}
                  progress={progress}
                  onBack={() => setCurrentTab("subjects")}
                  onStartSession={handleStartSession}
                />
              )}

              {currentTab === "mock-tests" && (
                <MockTestArena
                  subjects={subjects}
                  progress={progress}
                  selectedExam={selectedExam}
                  onSubmitAnswer={handleSubmitAnswer}
                  onRefreshContent={handleRefreshAll}
                  onNavigate={setCurrentTab}
                />
              )}

              {currentTab === "mistakes" && (
                <MistakeBook
                  progress={progress}
                  selectedExam={selectedExam}
                  onClearMistakes={handleClearMistakes}
                  onStartSession={handleStartSession}
                />
              )}

              {currentTab === "revision" && (
                <RevisionEngine
                  subjects={subjects}
                  progress={progress}
                  selectedExam={selectedExam}
                  onStartSession={handleStartSession}
                />
              )}

              {currentTab === "analytics" && (
                <AnalyticsView
                  subjects={subjects}
                  progress={progress}
                  selectedExam={selectedExam}
                />
              )}

              {currentTab === "mobile-app" && (
                <MobileAppHub />
              )}

              {currentTab === "content-manager" && (
                <ContentPackManager
                  subjects={subjects}
                  onRefreshContent={handleRefreshAll}
                />
              )}

              {currentTab === "tech-spec" && (
                <TechArchitecture />
              )}
            </>
          )}
        </main>
      </div>

      {/* Exam Selection Modal Popup */}
      <ExamSelectorModal
        isOpen={showExamModal}
        onClose={() => setShowExamModal(false)}
        selectedExamId={selectedExam}
        onSelectExam={handleSelectExamTrack}
      />

      {/* Reset Progress Confirmation Dialog Modal */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 border border-slate-150 shadow-xl animate-scale-up text-left">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-rose-50 border border-rose-100 rounded-xl shrink-0 text-rose-600">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-900">Reset Flight Records?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  CRITICAL WARNING: This will permanently wipe all your progress history, coverage metrics, mistake logs, and solved status. This action cannot be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearProgress}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold font-mono transition-colors cursor-pointer"
              >
                Confirm Reset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Toast notification banner */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white border border-slate-800 px-5 py-3.5 rounded-xl shadow-lg flex items-center gap-2.5 max-w-sm animate-slide-up text-xs font-semibold">
          <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

    </div>
  );
}

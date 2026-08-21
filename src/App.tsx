/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useMemo, useRef } from "react";
import { Routes, Route, Navigate, useNavigate, useLocation, useParams } from "react-router-dom";
import {
  LayoutDashboard,
  BookOpen,
  AlertTriangle,
  RefreshCw,
  BarChart,
  Upload,
  CheckCircle,
  HelpCircle,
  Menu,
  X,
  Play,
  Award,
  GraduationCap,
  ChevronLeft,
  ChevronRight,
  Trash2,
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
import MockTestArena from "./components/MockTestArena";
import MobileAppHub from "./components/MobileAppHub";
import ExamSelectorModal from "./components/ExamSelectorModal";
import { EXAM_REGISTRY, ExamDefinition, getExamById, resolveExamForSubject, resolveExamForEntry } from "../shared/exams";
import { getExamIcon, getExamColorClasses, ExamColorClasses } from "./lib/examTheme";
import { getProgressStore } from "./lib/progressStore";
import { getCapabilities } from "./lib/capabilityStore";
import { fetchSubjects, fetchChapter } from "./lib/contentStore";
import { shuffled } from "./lib/shuffle";
import { NO_CAPABILITIES, type AppCapabilities } from "../shared/capabilities";

// Nav items double as the route map — each id's path is the single source of truth
// for both the sidebar links and the <Routes> below.
const navItems = [
  { id: "dashboard", name: "Dashboard", icon: LayoutDashboard, path: "/" },
  { id: "subjects", name: "Subjects", icon: BookOpen, path: "/subjects" },
  { id: "mock-tests", name: "Mock Tests", icon: Award, path: "/mock-tests" },
  { id: "mistakes", name: "Mistakes", icon: AlertTriangle, path: "/mistakes" },
  { id: "revision", name: "Revision", icon: RefreshCw, path: "/revision" },
  { id: "analytics", name: "Analytics", icon: BarChart, path: "/analytics" },
  { id: "mobile-app", name: "Mobile App", icon: Smartphone, path: "/mobile-app" },
  { id: "content-manager", name: "Content Manager", icon: Upload, path: "/content-manager" },
];

// ---------------------------------------------------------------------------
// Route pages that need URL params — kept in this file since they're small
// and only used here, but declared at module scope (not nested closures)
// so they don't remount on every App() render.
// ---------------------------------------------------------------------------

interface SubjectsPageProps {
  subjects: Subject[];
  progress: UserProgress;
  selectedExam: string;
  activeExamConfig: ExamDefinition;
  activeExamColors: ExamColorClasses;
  onOpenExamSelector: () => void;
  onQuickPractice: (subjectName: string, chapter: Chapter) => void;
  pickChapterForSubject: (sub: Subject) => Chapter | null;
}

function SubjectsPage({
  subjects,
  progress,
  selectedExam,
  activeExamConfig,
  activeExamColors,
  onOpenExamSelector,
  onQuickPractice,
  pickChapterForSubject,
}: SubjectsPageProps) {
  const navigate = useNavigate();
  const [selectedPaperTab, setSelectedPaperTab] = useState<string>("all");

  // Filter Curriculum Subjects (excluding raw mock test folders from regular curriculum list)
  const curriculumSubjects = useMemo(
    () => subjects.filter(s => s.name !== "Mock Tests" && !s.name.toLowerCase().includes("mock")),
    [subjects]
  );

  const filteredCurriculumSubjects = useMemo(
    () =>
      curriculumSubjects.filter((s) => {
        if (selectedExam === "all") return true;
        return resolveExamForSubject(s).id === selectedExam;
      }),
    [curriculumSubjects, selectedExam]
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="space-y-1">
          <h1 className="font-display text-2xl font-bold text-slate-800 tracking-tight">
            Subjects
          </h1>
          <p className="text-slate-400 text-xs">
            Chapters and practice questions for {activeExamConfig.name}.
          </p>
        </div>

        <button
          onClick={onOpenExamSelector}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-200 px-3 py-1.5 rounded-xl hover:bg-indigo-100 transition-colors"
        >
          <Sparkles className="w-3.5 h-3.5" /> {activeExamConfig.shortName}
        </button>
      </div>

      {/* Tab Selection Filter — generic over the exam registry, so a new exam's
          own paper/domain groupings (or lack thereof) "just work" here. */}
      {selectedExam === "all" ? (
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          <button
            onClick={() => setSelectedPaperTab("all")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedPaperTab === "all"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            All Examination Tracks ({filteredCurriculumSubjects.length})
          </button>
          {EXAM_REGISTRY.map((exam) => {
            const colors = getExamColorClasses(exam);
            return (
              <button
                key={exam.id}
                onClick={() => setSelectedPaperTab(exam.id)}
                className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                  selectedPaperTab === exam.id
                    ? `${colors.tabActiveBorder} ${colors.tabActiveText} font-bold`
                    : "border-transparent text-slate-400 hover:text-slate-600"
                }`}
              >
                {exam.shortName} ({filteredCurriculumSubjects.filter(s => resolveExamForSubject(s).id === exam.id).length})
              </button>
            );
          })}
        </div>
      ) : activeExamConfig.papers && activeExamConfig.papers.length > 0 ? (
        <div className="flex border-b border-slate-200 gap-6 overflow-x-auto">
          <button
            onClick={() => setSelectedPaperTab("all")}
            className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              selectedPaperTab === "all"
                ? "border-indigo-600 text-indigo-600 font-bold"
                : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            All Papers ({filteredCurriculumSubjects.length})
          </button>
          {activeExamConfig.papers.map((paper) => (
            <button
              key={paper.id}
              onClick={() => setSelectedPaperTab(paper.id)}
              className={`pb-3 text-sm font-semibold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                selectedPaperTab === paper.id
                  ? "border-indigo-600 text-indigo-600 font-bold"
                  : "border-transparent text-slate-400 hover:text-slate-600"
              }`}
            >
              {paper.label} ({filteredCurriculumSubjects.filter(s => s.paper === paper.id).length})
            </button>
          ))}
        </div>
      ) : (
        <div className="flex border-b border-slate-200 gap-6">
          <button className={`pb-3 text-sm font-semibold border-b-2 ${activeExamColors.tabActiveBorder} ${activeExamColors.tabActiveText} font-bold`}>
            All {activeExamConfig.shortName} Domains ({filteredCurriculumSubjects.length})
          </button>
        </div>
      )}

      {filteredCurriculumSubjects.length > 0 ? (
        <>
          {(() => {
            const activeShownSubjects = filteredCurriculumSubjects.filter(sub => {
              if (selectedExam === "all") {
                return selectedPaperTab === "all" || resolveExamForSubject(sub).id === selectedPaperTab;
              }
              if (activeExamConfig.papers && activeExamConfig.papers.length > 0) {
                return selectedPaperTab === "all" || sub.paper === selectedPaperTab;
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
                  const subExam = resolveExamForSubject(sub);
                  const subColors = getExamColorClasses(subExam);
                  const subBadgeLabel = sub.paper
                    ? `${subExam.shortName}: ${subExam.papers?.find(p => p.id === sub.paper)?.label || sub.paper}`
                    : `${subExam.shortName} Domain`;

                  return (
                    <div
                      key={sub.name}
                      onClick={() => navigate(`/subjects/${encodeURIComponent(sub.name)}`)}
                      className="bg-white border border-slate-150 hover:border-indigo-300 p-6 rounded-2xl shadow-xs hover:shadow-md transition-all cursor-pointer group flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wide border ${subColors.badgeBg} ${subColors.badgeBorder} ${subColors.badgeText}`}>
                            {subBadgeLabel}
                          </div>
                          <span className="text-xs text-slate-400 font-semibold">
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

                      <div className="mt-6 pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Total Coverage</span>
                          <span className="font-semibold text-slate-700">{coveragePct}%</span>
                        </div>
                        <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                          <div className={`h-full rounded-full ${subColors.solidBg}`} style={{ width: `${coveragePct}%` }} />
                        </div>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const chap = pickChapterForSubject(sub);
                            if (chap) onQuickPractice(sub.name, chap);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 min-h-11 sm:min-h-0 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white font-semibold text-xs py-2.5 rounded-xl transition-colors cursor-pointer"
                        >
                          <Play className="w-3.5 h-3.5 fill-white text-white" /> Practice
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16 bg-white border border-dashed border-slate-100 rounded-2xl max-w-xl mx-auto space-y-4">
                <HelpCircle className="w-12 h-12 text-slate-300 mx-auto stroke-1" />
                <div className="space-y-1.5">
                  <h3 className="font-display text-base font-bold text-slate-800">Nothing here yet</h3>
                  <p className="text-slate-400 text-xs px-6">
                    No subjects match this filter. Try a different tab.
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
            <h3 className="font-display text-base font-bold text-slate-800">No content yet</h3>
            <p className="text-slate-400 text-xs px-6">
              Add a content pack to get started, or use the <strong>Content Manager</strong> to upload one.
            </p>
          </div>
          <button
            onClick={() => navigate("/content-manager")}
            className="text-xs font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100 px-4 py-2 rounded-xl hover:bg-indigo-100 cursor-pointer"
          >
            Go to Content Manager
          </button>
        </div>
      )}
    </div>
  );
}

interface SubjectDetailPageProps {
  subjects: Subject[];
  progress: UserProgress;
  onQuickPractice: (subjectName: string, chapter: Chapter) => void;
}

function SubjectDetailPage({ subjects, progress, onQuickPractice }: SubjectDetailPageProps) {
  const navigate = useNavigate();
  const { subjectSlug } = useParams();
  const subject = subjects.find((s) => s.name === decodeURIComponent(subjectSlug || ""));

  if (!subject) {
    // Content may still be loading, or the slug is stale — send back to the list rather than erroring.
    return <Navigate to="/subjects" replace />;
  }

  return (
    <SubjectView
      subject={subject}
      progress={progress}
      onBack={() => navigate("/subjects")}
      onSelectChapter={(subjectName, chapter) =>
        navigate(`/subjects/${encodeURIComponent(subjectName)}/${encodeURIComponent(chapter.id)}`)
      }
      onQuickPractice={onQuickPractice}
    />
  );
}

interface ChapterDetailPageProps {
  subjects: Subject[];
  progress: UserProgress;
  onStartSession: (
    questions: Question[],
    mode: "practice" | "revision" | "mistakes",
    chapterId: string,
    chapterName: string,
    subject: string,
    startIndex?: number
  ) => void;
}

function ChapterDetailPage({ subjects, progress, onStartSession }: ChapterDetailPageProps) {
  const navigate = useNavigate();
  const { subjectSlug, chapterId } = useParams();
  const subject = subjects.find((s) => s.name === decodeURIComponent(subjectSlug || ""));
  const chapter = subject?.chapters.find((c) => c.id === chapterId);

  if (!subject || !chapter) {
    return <Navigate to="/subjects" replace />;
  }

  return (
    <ChapterView
      subjectName={subject.name}
      chapter={chapter}
      progress={progress}
      onBack={() => navigate(`/subjects/${encodeURIComponent(subject.name)}`)}
      onStartSession={onStartSession}
    />
  );
}

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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

  // The only piece of "flow" state that can't live in the URL — an assembled,
  // ephemeral question set (custom revision/mistakes sets aren't reconstructable
  // from a route param). Entering it still pushes a real history entry.
  const [activeSession, setActiveSession] = useState<{
    questions: Question[];
    mode: "practice" | "revision" | "mistakes";
    chapterId: string;
    chapterName: string;
    subject: string;
    startIndex: number;
  } | null>(null);

  // Main workspace scroll container ref
  const workspaceScrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to top on every navigation/view change
  useEffect(() => {
    if (workspaceScrollRef.current) {
      workspaceScrollRef.current.scrollTo({ top: 0, behavior: "instant" });
    }
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location.pathname, activeSession?.chapterId, selectedExam]);

  // Loading States
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [capabilities, setCapabilities] = useState<AppCapabilities>(NO_CAPABILITIES);

  // Fetch all curriculum subjects & chapters (Auto Discovery API)
  const fetchCurriculum = async () => {
    try {
      setSubjects(await fetchSubjects());
    } catch (e) {
      console.error("Error fetching discovered content packs", e);
    }
  };

  // Fetch active user stats & mistake books
  const fetchProgress = async () => {
    try {
      const data = await getProgressStore().getProgress();
      setProgress(data);
    } catch (e) {
      console.error("Error fetching student progress", e);
    }
  };

  // Which authoring features this deployment offers. Never rejects — a static
  // deploy with no server resolves to NO_CAPABILITIES.
  const fetchCapabilities = async () => {
    setCapabilities(await getCapabilities());
  };

  // Initial Boot loader
  useEffect(() => {
    const init = async () => {
      setLoading(true);
      await Promise.all([fetchCurriculum(), fetchProgress(), fetchCapabilities()]);
      setLoading(false);
    };
    init();
  }, []);

  // Synchronize on demand
  const handleRefreshAll = async () => {
    setRefreshing(true);
    await Promise.all([fetchCurriculum(), fetchProgress()]);
    setRefreshing(false);
    showToastNotification("Content and progress refreshed.");
  };

  // Handle question submission from Practice/Exam session
  const handleSubmitAnswer = async (submission: UserAnswerSubmission) => {
    try {
      const updatedProgress = await getProgressStore().submitAnswer(submission);
      setProgress(updatedProgress);
      return updatedProgress;
    } catch (e) {
      console.error("Failed to persist answer record", e);
    }
  };

  // Handle clearing mistake book
  const handleClearMistakes = async () => {
    try {
      const updatedProgress = await getProgressStore().clearMistakes();
      setProgress(updatedProgress);
      showToastNotification("Mistakes cleared.");
    } catch (e) {
      console.error("Failed to clear mistake logs", e);
    }
  };

  // Reset all saved progress
  const handleClearProgress = () => {
    setShowResetConfirm(true);
  };

  const confirmClearProgress = async () => {
    setShowResetConfirm(false);
    try {
      const updatedProgress = await getProgressStore().clearProgress();
      setProgress(updatedProgress);
      showToastNotification("Progress reset.");
    } catch (e) {
      console.error("Failed to reset progress", e);
    }
  };

  // Handlers for subject & chapter selection — these keep the exact same
  // signatures the child components already expect; only the internals
  // changed from setState(tab) to navigate(path).
  const handleSelectChapter = (subjectName: string, chapter: Chapter) => {
    navigate(`/subjects/${encodeURIComponent(subjectName)}/${encodeURIComponent(chapter.id)}`);
  };

  const handleStartSession = (
    questions: Question[],
    mode: "practice" | "revision" | "mistakes",
    chapterId: string,
    chapterName: string,
    subject: string,
    startIndex: number = 0
  ) => {
    setActiveSession({
      questions,
      mode,
      chapterId,
      chapterName,
      subject,
      startIndex,
    });
    navigate("/practice-session");
  };

  const handleFinishSession = () => {
    setActiveSession(null);
    handleRefreshAll();
    // Return to whatever screen launched the session (a chapter, mistakes, revision, etc.)
    // instead of hardcoding a single fallback — this is what real history makes possible.
    navigate(-1);
  };

  // Pick which chapter to jump into for a subject-level "Practice" shortcut:
  // prefer one with recent activity, else the first with unanswered questions, else the first chapter.
  const pickChapterForSubject = (sub: Subject): Chapter | null => {
    if (sub.chapters.length === 0) return null;
    for (const recent of progress.recentActivity) {
      if (recent.subject === sub.name) {
        const match = sub.chapters.find((c) => c.id === recent.chapterId);
        if (match) return match;
      }
    }
    const attemptedKeys = Object.keys(progress.answeredQuestions);
    for (const chap of sub.chapters) {
      const attempted = attemptedKeys.filter((k) => k.startsWith(`${sub.name}:${chap.id}:`)).length;
      if (attempted < chap.questionsCount) return chap;
    }
    return sub.chapters[0];
  };

  // Skip the chapter-detail screen and jump straight into a practice session,
  // resuming at the first question this chapter hasn't been answered yet.
  const handleQuickPractice = async (subjectName: string, chapter: Chapter) => {
    try {
      const data = await fetchChapter(subjectName, chapter.id);
      const chapterQuestions = shuffled((data.questions || []) as Question[]);
      const firstUnanswered = chapterQuestions.findIndex(
        (q) => !progress.answeredQuestions[`${subjectName}:${chapter.id}:${q.id}`]
      );
      handleStartSession(
        chapterQuestions,
        "practice",
        chapter.id,
        chapter.name,
        subjectName,
        firstUnanswered < 0 ? 0 : firstUnanswered
      );
    } catch (e) {
      console.error("Quick practice failed", e);
      showToastNotification("Couldn't start practice — please try again.");
    }
  };

  const activeExamConfig = getExamById(selectedExam) || EXAM_REGISTRY[0];
  const ActiveExamIcon = getExamIcon(activeExamConfig);
  const activeExamColors = getExamColorClasses(activeExamConfig);

  // Translates the old tab-id vocabulary child components still use for onNavigate
  // props (Dashboard, MockTestArena) into a real route change.
  const navigateToTab = (tabId: string) => {
    const item = navItems.find((i) => i.id === tabId);
    navigate(item ? item.path : "/");
  };

  // Resolve the subject/chapter behind the current URL, purely for the topbar title —
  // the actual routed pages look these up themselves via useParams().
  const pathSegments = location.pathname.split("/").filter(Boolean);
  const headerSubject = pathSegments[0] === "subjects" && pathSegments[1]
    ? subjects.find((s) => s.name === decodeURIComponent(pathSegments[1]))
    : undefined;
  const headerChapter = headerSubject && pathSegments[2]
    ? headerSubject.chapters.find((c) => c.id === decodeURIComponent(pathSegments[2]))
    : undefined;

  // Helper to obtain rich header titles, subtitles, and icons for the topbar
  const getHeaderInfo = () => {
    if (location.pathname === "/practice-session" && activeSession) {
      return {
        title: activeSession.chapterName,
        subtitle: `${activeSession.mode.charAt(0).toUpperCase()}${activeSession.mode.slice(1)} session in progress`,
        icon: GraduationCap,
        tag: "In progress"
      };
    }
    if (headerChapter && headerSubject) {
      return {
        title: headerChapter.name,
        subtitle: "Study notes and practice questions for this chapter",
        icon: GraduationCap,
        tag: "Chapter"
      };
    }
    if (headerSubject) {
      return {
        title: headerSubject.name,
        subtitle: `${headerSubject.chapters.length} chapters available`,
        icon: BookOpen,
        tag: "Subject"
      };
    }

    const activeItem = navItems.find(item =>
      item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path)
    );
    if (activeItem) {
      let subtitle = "";
      switch (activeItem.id) {
        case "dashboard":
          subtitle = `${activeExamConfig.name} — your progress and readiness at a glance`;
          break;
        case "subjects":
          subtitle = "Browse subjects, chapters, and practice questions";
          break;
        case "mock-tests":
          subtitle = "Timed practice exams that mirror the real test format";
          break;
        case "mistakes":
          subtitle = "Review and retry questions you've gotten wrong";
          break;
        case "revision":
          subtitle = "Build a custom practice set from any subject or topic";
          break;
        case "analytics":
          subtitle = "Accuracy, coverage, and progress over time";
          break;
        case "content-manager":
          subtitle = "Add or manage content packs";
          break;
        case "mobile-app":
          subtitle = "The companion offline mobile app (Expo / React Native)";
          break;
        default:
          subtitle = "Exam Scholar";
      }
      return {
        title: activeItem.name,
        subtitle,
        icon: activeItem.icon,
        tag: activeItem.name
      };
    }

    return {
      title: "Exam Scholar",
      subtitle: "Multi-exam preparation platform",
      icon: GraduationCap,
      tag: "Home"
    };
  };

  // Active mistakes for selected exam track
  const activeMistakes = useMemo(
    () =>
      (progress.mistakes || []).filter(m => {
        if (selectedExam === "all") return true;
        return resolveExamForEntry(m).id === selectedExam;
      }),
    [progress.mistakes, selectedExam]
  );

  const isCollapsed = sidebarCollapsed && !isMobile;
  const headerInfo = getHeaderInfo();
  const HeaderIcon = headerInfo.icon;

  return (
    <div className="h-dvh overflow-hidden bg-slate-50/50 flex flex-col md:flex-row font-sans text-slate-700 antialiased">

      {/* 1. Mobile Top Navigation Bar */}
      <div className="md:hidden bg-slate-50 border-b border-slate-200 sticky top-0 z-30 shrink-0 shadow-3xs p-4 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-indigo-50 border border-indigo-100 rounded-xl text-indigo-600 shadow-3xs">
            <ActiveExamIcon className={`w-5 h-5 ${activeExamColors.iconText}`} />
          </div>
          <div>
            <span className="font-display font-extrabold tracking-tight text-sm text-slate-900 block leading-none">
              Exam Scholar
            </span>
            <button
              onClick={() => setShowExamModal(true)}
              className="text-[10px] font-mono font-bold text-indigo-600 uppercase tracking-wider block py-2 -my-1 hover:underline text-left cursor-pointer"
            >
              {activeExamConfig.shortName} ▾
            </button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {/* Refresh lives here on phones — the desktop topbar below is hidden
              at this width, so this is the only copy of each control. */}
          <button
            onClick={handleRefreshAll}
            disabled={refreshing}
            className="inline-flex items-center justify-center min-h-11 min-w-11 bg-white border border-slate-200 rounded-xl text-indigo-600 disabled:opacity-50 active:bg-slate-100 transition-all cursor-pointer"
            title={refreshing ? "Refreshing…" : "Refresh"}
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? "animate-spin" : ""}`} />
          </button>
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center min-h-11 min-w-11 hover:bg-slate-100 border border-slate-200 active:bg-slate-200 rounded-xl text-slate-600 transition-all cursor-pointer"
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
                <ActiveExamIcon className={`w-6 h-6 ${activeExamColors.iconText}`} />
              </div>
              {!isCollapsed && (
                <div className="min-w-0 animate-fade-in">
                  <h2 className="font-display font-bold text-base tracking-tight leading-none text-slate-900 truncate">
                    Exam Scholar
                  </h2>
                  <button
                    onClick={() => setShowExamModal(true)}
                    className="text-[9px] font-mono text-indigo-600 hover:text-indigo-700 font-bold block py-1.5 -my-0.5 tracking-wider uppercase truncate text-left cursor-pointer"
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
              className="md:hidden inline-flex items-center justify-center min-h-11 min-w-11 hover:bg-slate-100 border border-slate-200 rounded-lg text-slate-500 active:bg-slate-200 transition-all cursor-pointer shrink-0"
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
              const isActive = item.path === "/" ? location.pathname === "/" : location.pathname.startsWith(item.path);
              const badge = item.id === "mistakes" ? activeMistakes.length : undefined;
              return (
                <button
                  key={item.id}
                  title={isCollapsed ? item.name : undefined}
                  onClick={() => {
                    navigate(item.path);
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
                    {isCollapsed && badge !== undefined && badge > 0 && (
                      <span className="absolute -top-1.5 -right-1.5 min-w-4 h-4 px-1 bg-rose-500 text-white text-[8px] font-bold font-mono rounded-full flex items-center justify-center border border-white">
                        {badge}
                      </span>
                    )}
                  </div>

                  {!isCollapsed && badge !== undefined && badge > 0 && (
                    <span className={`px-1.5 py-0.5 text-[9px] font-mono font-bold rounded shrink-0 ${
                      isActive ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600 border border-slate-300/40"
                    }`}>
                      {badge}
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
          <div className={`flex items-center ${isCollapsed ? "justify-center" : "gap-2"}`} title="Content up to date">
            <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
            {!isCollapsed && (
              <span className="text-[11px] font-medium text-slate-500 truncate">
                Content up to date
              </span>
            )}
          </div>
          <button
            onClick={handleClearProgress}
            title={isCollapsed ? "Reset progress" : undefined}
            className={`w-full text-rose-600 hover:text-rose-700 transition-all cursor-pointer flex items-center justify-center ${
              isCollapsed
                ? "p-2.5 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl"
                : "px-4 py-2 min-h-11 md:min-h-0 hover:bg-rose-50 border border-transparent hover:border-rose-100 rounded-xl text-left text-xs font-semibold"
            }`}
          >
            {isCollapsed ? (
              <Trash2 className="w-4 h-4 text-rose-500" />
            ) : (
              <span className="truncate">Reset progress</span>
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

        {/* Dynamic Topbar — desktop only. On phones the mobile bar above is the
            single header; every page already renders its own title, so showing
            both stacked just repeated the same words twice. */}
        <header className="bg-white border-b border-slate-200/80 px-4 sm:px-6 py-3 sm:py-4 hidden md:flex justify-between items-center gap-3 shrink-0 shadow-2xs">
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
                  /* Usually just repeats the title beside it, so it only earns
                     its place once the row is wide enough to spare. */
                  <span className="hidden lg:inline-flex items-center text-[11px] font-semibold text-indigo-600 bg-indigo-50 border border-indigo-100/60 px-2 py-0.5 rounded-md shrink-0">
                    {headerInfo.tag}
                  </span>
                )}
              </div>
              <p className="text-slate-400 text-[11px] font-medium leading-normal mt-0.5 hidden md:block max-w-xl truncate">
                {headerInfo.subtitle}
              </p>
            </div>
          </div>

          {/* On phones these collapse to icon-only squares so the title keeps the row. */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setShowExamModal(true)}
              title={`Track: ${activeExamConfig.shortName}`}
              className="inline-flex items-center justify-center gap-1.5 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-xs font-semibold text-slate-700 hover:text-indigo-600 bg-white hover:bg-slate-50 border border-slate-200 px-2.5 sm:px-3 sm:py-2 rounded-xl transition-all cursor-pointer shadow-3xs"
            >
              <Sparkles className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-500 shrink-0" />
              <span className="hidden sm:inline">Track: <strong>{activeExamConfig.shortName}</strong></span>
            </button>

            <button
              onClick={handleRefreshAll}
              disabled={refreshing}
              title={refreshing ? "Refreshing…" : "Refresh"}
              className="inline-flex items-center justify-center gap-2 min-h-11 min-w-11 sm:min-h-0 sm:min-w-0 text-xs font-semibold text-indigo-600 bg-indigo-50/80 hover:bg-indigo-50 border border-indigo-100 px-2.5 sm:px-4 sm:py-2 rounded-xl disabled:opacity-50 transition-all cursor-pointer shadow-3xs hover:shadow-2xs active:scale-95"
            >
              <RefreshCw className={`w-4 h-4 sm:w-3.5 sm:h-3.5 text-indigo-500 shrink-0 ${refreshing ? "animate-spin" : ""}`} />
              <span className="hidden sm:inline">{refreshing ? "Refreshing…" : "Refresh"}</span>
            </button>
          </div>
        </header>

        {/* Dynamic View Body router */}
        <main className="p-4 sm:p-6 md:p-8 flex-1 max-w-7xl w-full mx-auto">
          {loading ? (
            <div className="py-32 text-center space-y-4">
              <RefreshCw className="w-10 h-10 text-indigo-600 animate-spin mx-auto" />
              <div className="space-y-1">
                <h3 className="font-display text-base font-bold text-slate-800">Loading Exam Scholar</h3>
                <p className="text-xs text-slate-400">Fetching your subjects and progress…</p>
              </div>
            </div>
          ) : (
            <Routes>
              <Route
                path="/practice-session"
                element={
                  activeSession ? (
                    <PracticeSession
                      questions={activeSession.questions}
                      mode={activeSession.mode}
                      chapterId={activeSession.chapterId}
                      chapterName={activeSession.chapterName}
                      subject={activeSession.subject}
                      startIndex={activeSession.startIndex}
                      progress={progress}
                      onFinish={handleFinishSession}
                      onSubmitAnswer={handleSubmitAnswer}
                    />
                  ) : (
                    <Navigate to="/" replace />
                  )
                }
              />

              <Route
                path="/"
                element={
                  <Dashboard
                    subjects={subjects}
                    progress={progress}
                    selectedExam={selectedExam}
                    onOpenExamSelector={() => setShowExamModal(true)}
                    onSelectChapter={handleSelectChapter}
                    onNavigate={navigateToTab}
                  />
                }
              />

              <Route
                path="/subjects"
                element={
                  <SubjectsPage
                    subjects={subjects}
                    progress={progress}
                    selectedExam={selectedExam}
                    activeExamConfig={activeExamConfig}
                    activeExamColors={activeExamColors}
                    onOpenExamSelector={() => setShowExamModal(true)}
                    onQuickPractice={handleQuickPractice}
                    pickChapterForSubject={pickChapterForSubject}
                  />
                }
              />

              <Route
                path="/subjects/:subjectSlug"
                element={
                  <SubjectDetailPage
                    subjects={subjects}
                    progress={progress}
                    onQuickPractice={handleQuickPractice}
                  />
                }
              />

              <Route
                path="/subjects/:subjectSlug/:chapterId"
                element={
                  <ChapterDetailPage
                    subjects={subjects}
                    progress={progress}
                    onStartSession={handleStartSession}
                  />
                }
              />

              <Route
                path="/mock-tests"
                element={
                  <MockTestArena
                    subjects={subjects}
                    progress={progress}
                    selectedExam={selectedExam}
                    onSubmitAnswer={handleSubmitAnswer}
                    onRefreshContent={handleRefreshAll}
                    onNavigate={navigateToTab}
                    canExpandWithAi={capabilities.aiExpand}
                  />
                }
              />

              <Route
                path="/mistakes"
                element={
                  <MistakeBook
                    progress={progress}
                    selectedExam={selectedExam}
                    onClearMistakes={handleClearMistakes}
                    onStartSession={handleStartSession}
                  />
                }
              />

              <Route
                path="/revision"
                element={
                  <RevisionEngine
                    subjects={subjects}
                    progress={progress}
                    selectedExam={selectedExam}
                    onStartSession={handleStartSession}
                  />
                }
              />

              <Route
                path="/analytics"
                element={
                  <AnalyticsView
                    subjects={subjects}
                    progress={progress}
                    selectedExam={selectedExam}
                  />
                }
              />

              <Route path="/mobile-app" element={<MobileAppHub />} />

              <Route
                path="/content-manager"
                element={
                  <ContentPackManager
                    subjects={subjects}
                    onRefreshContent={handleRefreshAll}
                    canUpload={capabilities.contentUpload}
                  />
                }
              />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
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
                <h3 className="font-display text-base font-bold text-slate-900">Reset all progress?</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This permanently deletes your answer history, accuracy stats, and mistake list. This can't be undone.
                </p>
              </div>
            </div>
            <div className="flex gap-2 justify-end pt-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="px-4 py-2 border border-slate-200 hover:bg-slate-50 text-slate-600 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={confirmClearProgress}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-semibold transition-colors cursor-pointer"
              >
                Reset progress
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

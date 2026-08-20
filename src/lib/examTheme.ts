/**
 * Client-only presentation layer for the shared exam registry.
 * Tailwind needs literal class names, so this file is the one place a new
 * *color key* (not a new exam) requires a code edit — adding an exam that
 * reuses an existing color key needs no changes here at all.
 */
import {
  BrainCircuit,
  GraduationCap,
  Layers,
  Award,
  ShieldCheck,
  BookOpen,
  type LucideIcon,
} from "lucide-react";
import { ExamDefinition } from "../../shared/exams";

const ICON_MAP: Record<string, LucideIcon> = {
  BrainCircuit,
  GraduationCap,
  Layers,
  Award,
  ShieldCheck,
  BookOpen,
};

export function getExamIcon(exam: ExamDefinition): LucideIcon {
  return ICON_MAP[exam.icon] || Layers;
}

export interface ExamColorClasses {
  badgeBg: string;
  badgeText: string;
  badgeBorder: string;
  darkBadgeBg: string;
  darkBadgeText: string;
  darkBadgeBorder: string;
  solidBg: string;
  solidHoverBg: string;
  ring: string;
  iconBg: string;
  iconText: string;
  iconBorder: string;
  /** Literal classes for an active/selected tab underline + label (Tailwind needs literal strings, not runtime-built ones). */
  tabActiveBorder: string;
  tabActiveText: string;
}

const COLOR_PALETTE: Record<string, ExamColorClasses> = {
  purple: {
    badgeBg: "bg-purple-50",
    badgeText: "text-purple-700",
    badgeBorder: "border-purple-200",
    darkBadgeBg: "bg-purple-500/20",
    darkBadgeText: "text-purple-300",
    darkBadgeBorder: "border-purple-400/30",
    solidBg: "bg-purple-600",
    solidHoverBg: "hover:bg-purple-700",
    ring: "ring-purple-600/10",
    iconBg: "bg-purple-100",
    iconText: "text-purple-700",
    iconBorder: "border-purple-200",
    tabActiveBorder: "border-purple-600",
    tabActiveText: "text-purple-700",
  },
  amber: {
    badgeBg: "bg-amber-50",
    badgeText: "text-amber-800",
    badgeBorder: "border-amber-100",
    darkBadgeBg: "bg-amber-500/20",
    darkBadgeText: "text-amber-300",
    darkBadgeBorder: "border-amber-400/30",
    solidBg: "bg-amber-600",
    solidHoverBg: "hover:bg-amber-700",
    ring: "ring-amber-600/10",
    iconBg: "bg-amber-100",
    iconText: "text-amber-800",
    iconBorder: "border-amber-200",
    tabActiveBorder: "border-amber-600",
    tabActiveText: "text-amber-700",
  },
  indigo: {
    badgeBg: "bg-indigo-50",
    badgeText: "text-indigo-700",
    badgeBorder: "border-indigo-100",
    darkBadgeBg: "bg-indigo-500/20",
    darkBadgeText: "text-indigo-300",
    darkBadgeBorder: "border-indigo-400/30",
    solidBg: "bg-indigo-600",
    solidHoverBg: "hover:bg-indigo-700",
    ring: "ring-indigo-600/10",
    iconBg: "bg-indigo-100",
    iconText: "text-indigo-700",
    iconBorder: "border-indigo-200",
    tabActiveBorder: "border-indigo-600",
    tabActiveText: "text-indigo-600",
  },
  emerald: {
    badgeBg: "bg-emerald-50",
    badgeText: "text-emerald-700",
    badgeBorder: "border-emerald-100",
    darkBadgeBg: "bg-emerald-500/20",
    darkBadgeText: "text-emerald-300",
    darkBadgeBorder: "border-emerald-400/30",
    solidBg: "bg-emerald-600",
    solidHoverBg: "hover:bg-emerald-700",
    ring: "ring-emerald-600/10",
    iconBg: "bg-emerald-100",
    iconText: "text-emerald-700",
    iconBorder: "border-emerald-200",
    tabActiveBorder: "border-emerald-600",
    tabActiveText: "text-emerald-700",
  },
  rose: {
    badgeBg: "bg-rose-50",
    badgeText: "text-rose-700",
    badgeBorder: "border-rose-100",
    darkBadgeBg: "bg-rose-500/20",
    darkBadgeText: "text-rose-300",
    darkBadgeBorder: "border-rose-400/30",
    solidBg: "bg-rose-600",
    solidHoverBg: "hover:bg-rose-700",
    ring: "ring-rose-600/10",
    iconBg: "bg-rose-100",
    iconText: "text-rose-700",
    iconBorder: "border-rose-200",
    tabActiveBorder: "border-rose-600",
    tabActiveText: "text-rose-700",
  },
  sky: {
    badgeBg: "bg-sky-50",
    badgeText: "text-sky-700",
    badgeBorder: "border-sky-100",
    darkBadgeBg: "bg-sky-500/20",
    darkBadgeText: "text-sky-300",
    darkBadgeBorder: "border-sky-400/30",
    solidBg: "bg-sky-600",
    solidHoverBg: "hover:bg-sky-700",
    ring: "ring-sky-600/10",
    iconBg: "bg-sky-100",
    iconText: "text-sky-700",
    iconBorder: "border-sky-200",
    tabActiveBorder: "border-sky-600",
    tabActiveText: "text-sky-700",
  },
  teal: {
    badgeBg: "bg-teal-50",
    badgeText: "text-teal-700",
    badgeBorder: "border-teal-100",
    darkBadgeBg: "bg-teal-500/20",
    darkBadgeText: "text-teal-300",
    darkBadgeBorder: "border-teal-400/30",
    solidBg: "bg-teal-600",
    solidHoverBg: "hover:bg-teal-700",
    ring: "ring-teal-600/10",
    iconBg: "bg-teal-100",
    iconText: "text-teal-700",
    iconBorder: "border-teal-200",
    tabActiveBorder: "border-teal-600",
    tabActiveText: "text-teal-700",
  },
  slate: {
    badgeBg: "bg-slate-100",
    badgeText: "text-slate-700",
    badgeBorder: "border-slate-200",
    darkBadgeBg: "bg-slate-500/20",
    darkBadgeText: "text-slate-300",
    darkBadgeBorder: "border-slate-400/30",
    solidBg: "bg-slate-600",
    solidHoverBg: "hover:bg-slate-700",
    ring: "ring-slate-600/10",
    iconBg: "bg-slate-100",
    iconText: "text-slate-700",
    iconBorder: "border-slate-200",
    tabActiveBorder: "border-slate-600",
    tabActiveText: "text-slate-700",
  },
};

export function getColorClasses(colorKey: string | undefined): ExamColorClasses {
  return (colorKey && COLOR_PALETTE[colorKey]) || COLOR_PALETTE.slate;
}

export function getExamColorClasses(exam: ExamDefinition): ExamColorClasses {
  return getColorClasses(exam.color);
}

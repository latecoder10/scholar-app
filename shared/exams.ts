/**
 * Pluggable exam track registry.
 *
 * This is the single source of truth for every exam prep track the app
 * offers. It has zero framework dependencies (no React, no DOM, no Node
 * built-ins) so it can be imported unmodified by both the Vite-bundled
 * browser client (src/) and the esbuild-bundled Express server (server.ts).
 *
 * To add a new exam track: append one ExamDefinition below and drop its
 * content JSON files under content/<id>/modules/<module>/ — the folder
 * name must equal the ExamDefinition `id`. No other file needs to change
 * for the track to appear in the exam selector, navigation tabs, mistake
 * book, analytics, and mock test arena, and to get working AI Teacher
 * question expansion.
 */

export interface ExamPaper {
  id: string;
  label: string; // short label used in tab bars / filter pills
  fullLabel?: string; // longer heading used on the Dashboard's paper block; defaults to `label`
  tag?: string; // short right-aligned tag on the Dashboard paper block, e.g. "General Aptitude"
  stageLabel?: string; // small kicker shown above the paper block on the Dashboard, e.g. "STAGE I - NON-TECH"
  color?: string; // color-token override for this paper's block; falls back to the exam's own color
}

export interface ExamDefinition {
  id: string; // stable slug used in the UI, e.g. "claude-ccaf"
  matchExam: string; // exact value expected in content JSON's `exam` field
  matchKeywords: string[]; // lowercase fallback substrings for legacy/untagged content
  isFallback?: boolean; // absorbs anything that matches no other exam (at most one true)
  name: string;
  shortName: string;
  tagline: string;
  category: string;
  badge: string;
  description: string;
  icon: string; // key into src/lib/examTheme.ts's icon map
  color: string; // key into src/lib/examTheme.ts's color-token map
  papers?: ExamPaper[]; // optional sub-groups (e.g. Paper-I/Paper-II); omit for a flat domain list
  mockSyllabusTags: string[]; // topic chips shown in the Mock Test Arena banner
  defaultMockDescription: string; // fallback description for auto-discovered mock chapters
  totalQuestionsCount?: number;
  totalChaptersCount?: number;
  readinessTargetLabel?: string; // Dashboard readiness-widget caption, e.g. "CCAF Target"
  strategyTip?: { title: string; body: string }; // Dashboard "Quick Help" box; omit for a generic tip
  domainsLabel?: string; // Dashboard domain-grid kicker for exams with no `papers`; defaults to "{category} Domains"
  trackCardCta?: string; // Dashboard "All Tracks" card footer link text; defaults to "Explore {shortName} Curriculum"
  questionTipLabel?: string; // PracticeSession exam-trick heading; defaults to "Exam Strategy & Shortcut"
  analyticsTargetName?: string; // AnalyticsView readiness-rank copy; defaults to the exam's shortName
  aiBlueprintHint?: string; // ChapterView "AI Virtual Teacher" hint, e.g. "(GATE CSE, ISRO)"; defaults to the exam's category
  defaultMockPaper?: string; // fallback `paper` tag for auto-discovered mock chapters lacking one; defaults to the exam's id
  mockBannerTags?: string[]; // Mock Test Arena hero-banner topic chips; defaults to mockSyllabusTags
  /**
   * AI Teacher prompt template for on-demand question expansion.
   * Placeholders: {{count}} {{subject}} {{chapter}} {{existingTitles}} {{paperType}}
   */
  aiPromptPersona: string;
}

const QUESTION_SCHEMA_BLOCK = `Return the response as a JSON array matching this schema:
{
  "questions": [
    {
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "answer": "string (MUST exactly match one of the options)",
      "difficulty": "Easy" | "Medium" | "Hard",
      "source": "string",
      "explanation": "string",
      "examTrick": "string",
      "importance": "High" | "Medium" | "Low",
      "tags": ["string", "string"]
    }
  ]
}`;

export const EXAM_REGISTRY: ExamDefinition[] = [
  {
    id: "claude-ccaf",
    matchExam: "Claude CCAF",
    matchKeywords: ["claude", "ccaf", "mcp", "agentic", "prompt", "context", "enterprise"],
    name: "Claude Certified Architect - Foundations (CCAF)",
    shortName: "Claude CCAF",
    tagline: "Official Anthropic AI Systems Certification",
    category: "AI & Cloud Architecture",
    badge: "New • High Demand",
    icon: "BrainCircuit",
    color: "purple",
    description:
      "Deep technical preparation covering Agentic Orchestration, Model Context Protocol (MCP), Claude Code CLI, Prompt Engineering, and Context Window Reliability.",
    mockSyllabusTags: [
      "Agentic Loops",
      "Subagent Spawning",
      "MCP Tools & Schemas",
      "Claude Code Workflows",
      "Prompt Caching",
      "Context Reliability",
    ],
    defaultMockDescription:
      "Comprehensive simulated certification exam for Claude Certified Architect - Foundations.",
    totalQuestionsCount: 120,
    totalChaptersCount: 16,
    readinessTargetLabel: "CCAF Target",
    strategyTip: {
      title: "Claude CCAF Certification Strategy",
      body: "The Claude Certified Architect - Foundations (CCAF) exam tests practical tool schema design, error boundaries, subagent context hygiene, and prompt caching. Practice with the Mock Test Arena to master real-world diagnostic patterns.",
    },
    domainsLabel: "Certification Domains",
    trackCardCta: "Explore CCAF curriculum",
    questionTipLabel: "Claude CCAF Architecture Tip",
    analyticsTargetName: "Claude Certified Architect",
    aiBlueprintHint: "(Anthropic Claude CCAF, MCP Tool Architecture, Prompt Engineering)",
    defaultMockPaper: "CCAF-Simulation",
    mockBannerTags: ["Claude CCAF Full Mocks", "Agentic Systems", "MCP Protocols"],
    aiPromptPersona: `You are a Principal AI Systems Architect and Lead Instructor for the Claude Certified Architect - Foundations (CCAF) Certification Examination.
Your task is to generate exactly {{count}} new, highly realistic, scenario-based, architecturally rigorous multiple-choice questions for:
Exam: Claude Certified Architect - Foundations (CCAF)
Subject / Domain: {{subject}}
Chapter: {{chapter}}

Do NOT repeat or duplicate the following existing questions:
{{existingTitles}}

Requirements:
1. Academic & Industry Rigor: Address real-world Anthropic Claude API patterns, Model Context Protocol (MCP tools, resources, error categories, concurrency), Claude Code CLI (hooks, subagents, CLAUDE.md hierarchy, skills), Prompt Caching, Message Batches API, Multi-agent Orchestration, and Token Optimization.
2. Plausible Distractors: Avoid obvious fake options. Distractors must represent common architectural anti-patterns or misconfigurations.
3. Every single question MUST include a deep technical 'explanation' and a practical 'examTrick' (such as an architectural rule-of-thumb, CLI mnemonic, or diagnostic shortcut).
4. Assign realistic difficulty ('Easy', 'Medium', 'Hard') and realistic source tags (e.g., "Anthropic Architect Reference Exam", "CCAF Foundations Scenario Pack").

${QUESTION_SCHEMA_BLOCK}`,
  },
  {
    id: "cil-mt",
    matchExam: "CIL MT",
    matchKeywords: ["cil", "gate", "psu"],
    isFallback: true,
    name: "Coal India Limited - Management Trainee (CIL MT)",
    shortName: "CIL MT (Systems)",
    tagline: "PSU & GATE Grade Engineering Examination",
    category: "PSU / Engineering Services",
    badge: "Comprehensive",
    icon: "GraduationCap",
    color: "amber",
    description:
      "Two-stage syllabus covering Paper-I (General Aptitude, Reasoning, General Awareness, English) and Paper-II (Technical Computer Science & Software Engineering).",
    papers: [
      {
        id: "Paper-I",
        label: "Paper I: General Aptitude",
        fullLabel: "Paper I: General Aptitude & Reasoning",
        tag: "General Aptitude",
        stageLabel: "STAGE I - NON-TECH",
        color: "indigo",
      },
      {
        id: "Paper-II",
        label: "Paper II: Technical Core",
        fullLabel: "Paper II: Computer Science & Systems",
        tag: "Technical CS",
        stageLabel: "STAGE II - TECHNICAL",
        color: "emerald",
      },
    ],
    mockSyllabusTags: [
      "Digital Logic",
      "COA",
      "Programming & DS",
      "Algorithms",
      "TOC",
      "Compiler",
      "OS",
      "DBMS",
      "Networks",
    ],
    defaultMockDescription: "Simulate a real-time CIL MT standard Technical exam.",
    totalQuestionsCount: 450,
    totalChaptersCount: 22,
    readinessTargetLabel: "GATE/PSU Target",
    analyticsTargetName: "CIL MT / GATE",
    aiBlueprintHint: "(CIL MT, GATE, ISRO)",
    defaultMockPaper: "Paper-II",
    mockBannerTags: ["CIL MT Paper-I", "CIL MT Paper-II", "GATE CSE Level"],
    aiPromptPersona: `You are an elite Senior Professor and Exam Coach for PSU (Public Sector Undertaking) recruitment tests, specifically Coal India Limited Management Trainee (CIL MT) Exam.
Your task is to generate exactly {{count}} new, highly professional, conceptually deep, and mathematically/technically accurate multiple-choice questions for:
Subject: {{subject}}
Chapter: {{chapter}}
Paper Category: {{paperType}} (Paper-I: General Non-Technical Aptitude/Reasoning, Paper-II: Technical Computer Science and Systems)

Do NOT repeat or duplicate the following existing questions:
{{existingTitles}}

Requirements:
1. Ensure absolute technical accuracy in questions, options, and explanations. Double-check all mathematical and logical equations.
2. Options must be highly realistic, with plausible distractors. No lazy choices.
3. Every single question must include a step-by-step 'explanation' and a unique 'examTrick' (such as an exam shortcut, quick formula, elimination strategy, or visual logic tip to solve the question in under 30 seconds).
4. Assign appropriate difficulty levels ('Easy', 'Medium', 'Hard') distributed realistically.
5. The 'source' should be realistic (e.g., "GATE CSE 2023", "CIL MT CS 2021", "ISRO Scientist Exam", "Standard Aptitude Model", etc.).

${QUESTION_SCHEMA_BLOCK}`,
  },
];

/** Generic persona used for any exam plugged in without a bespoke aiPromptPersona. */
export const GENERIC_AI_PROMPT_PERSONA = `You are an elite, highly experienced exam coach and subject-matter expert.
Your task is to generate exactly {{count}} new, rigorous, and highly realistic multiple-choice questions for:
Subject: {{subject}}
Chapter: {{chapter}}

Do NOT repeat or duplicate the following existing questions:
{{existingTitles}}

Requirements:
1. Ensure absolute technical accuracy in questions, options, and explanations.
2. Options must be realistic with plausible distractors — no lazy or obviously wrong choices.
3. Every question must include a step-by-step 'explanation' and a practical 'examTrick' (a shortcut, mnemonic, or elimination strategy).
4. Assign realistic difficulty levels ('Easy', 'Medium', 'Hard') distributed sensibly, and a realistic 'source' tag.

${QUESTION_SCHEMA_BLOCK}`;

export const ALL_TRACKS_OPTION: ExamDefinition = {
  id: "all",
  matchExam: "",
  matchKeywords: [],
  name: "All Examination Tracks",
  shortName: "All Examinations",
  tagline: "Unified Multi-Track Scholar Hub",
  category: "Full Curriculum",
  badge: "Cross-Disciplinary",
  icon: "Layers",
  color: "indigo",
  description:
    "Explore the full spectrum of competitive examinations, AI architecture certifications, and technical engineering content packs in one centralized deck.",
  mockSyllabusTags: [],
  defaultMockDescription: "",
  totalQuestionsCount: EXAM_REGISTRY.reduce((sum, e) => sum + (e.totalQuestionsCount || 0), 0),
  totalChaptersCount: EXAM_REGISTRY.reduce((sum, e) => sum + (e.totalChaptersCount || 0), 0),
  aiPromptPersona: GENERIC_AI_PROMPT_PERSONA,
};

function findFallback(): ExamDefinition {
  return EXAM_REGISTRY.find((e) => e.isFallback) || EXAM_REGISTRY[0];
}

function keywordHit(exam: ExamDefinition, ...haystack: (string | undefined)[]): boolean {
  const text = haystack.filter(Boolean).join(" ").toLowerCase();
  if (!text) return false;
  return exam.matchKeywords.some((k) => text.includes(k));
}

/** Resolve which registered exam a curriculum Subject belongs to. */
export function resolveExamForSubject(s: { exam?: string; name: string }): ExamDefinition {
  const exact = EXAM_REGISTRY.find((e) => s.exam && s.exam === e.matchExam);
  if (exact) return exact;
  const byKeyword = EXAM_REGISTRY.find((e) => !e.isFallback && keywordHit(e, s.exam, s.name));
  if (byKeyword) return byKeyword;
  return findFallback();
}

/**
 * Resolve which registered exam a flatter record (mistake entry, recent
 * activity, progress record, practice session context) belongs to.
 */
export function resolveExamForEntry(e: {
  exam?: string;
  subject?: string;
  chapterId?: string;
  name?: string;
}): ExamDefinition {
  const exact = EXAM_REGISTRY.find((def) => e.exam && e.exam === def.matchExam);
  if (exact) return exact;
  const byKeyword = EXAM_REGISTRY.find(
    (def) => !def.isFallback && keywordHit(def, e.exam, e.subject, e.chapterId, e.name)
  );
  if (byKeyword) return byKeyword;
  return findFallback();
}

/**
 * Strict exact-match lookup by the content JSON's `exam` field — no keyword
 * guessing, no fallback. Used for opt-in bespoke behavior (like AI Teacher
 * prompt personas) where an unrecognized exam should get the generic
 * default rather than silently inheriting the fallback exam's persona.
 */
export function findExamByExactMatch(examField?: string): ExamDefinition | undefined {
  if (!examField) return undefined;
  return EXAM_REGISTRY.find((e) => e.matchExam === examField);
}

export function getExamById(id: string): ExamDefinition | undefined {
  if (id === ALL_TRACKS_OPTION.id) return ALL_TRACKS_OPTION;
  return EXAM_REGISTRY.find((e) => e.id === id);
}

/** Fill an AI prompt persona template's {{placeholder}} tokens. */
export function buildAiPrompt(
  template: string,
  vars: { count: number; subject: string; chapter: string; existingTitles: unknown; paperType?: string }
): string {
  return template
    .replace(/\{\{count\}\}/g, String(vars.count))
    .replace(/\{\{subject\}\}/g, vars.subject)
    .replace(/\{\{chapter\}\}/g, vars.chapter)
    .replace(/\{\{existingTitles\}\}/g, JSON.stringify(vars.existingTitles))
    .replace(/\{\{paperType\}\}/g, vars.paperType || "Paper-II");
}

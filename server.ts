/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { findExamByExactMatch, getExamById, buildAiPrompt, GENERIC_AI_PROMPT_PERSONA } from "./shared/exams";
import { recordAnswer, clearAllProgress, clearMistakes } from "./shared/progress";
import {
  resolveCapabilities,
  capabilityDisabledMessage,
  type AppCapabilities,
} from "./shared/capabilities";

// Without this, GEMINI_API_KEY in a .env file never reaches the AI route —
// it only worked if the key happened to be exported in the shell.
dotenv.config({ quiet: true });

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: string;
  source: string;
  explanation: string;
  examTrick: string;
  importance: string;
  tags: string[];
}

interface ChapterJSON {
  subject: string;
  chapter: string;
  description: string;
  questions: Question[];
}

async function startServer() {
  const app = express();
  // Hosts (Render, Fly, Railway, Cloud Run…) inject the port to bind on and
  // fail their health check if it is ignored. Falls back to 3000 locally.
  const PORT = Number(process.env.PORT) || 3000;

  // Resolved once at boot; the client reads the same answer via /api/capabilities.
  const CAPABILITIES = resolveCapabilities(process.env);

  /**
   * Refuse a gated route with 503 rather than letting it write to a disk that
   * will not keep the file. 503 (not 403) because this is about where the app
   * is running, not who is calling.
   */
  const requireCapability =
    (capability: keyof AppCapabilities): express.RequestHandler =>
    (req, res, next) => {
      if (!CAPABILITIES[capability]) {
        return res.status(503).json({
          error: capabilityDisabledMessage(capability),
          capability,
          disabled: true,
        });
      }
      next();
    };

  // Middleware
  app.use(express.json({ limit: "10mb" }));

  // Paths
  const CONTENT_DIR = path.join(process.cwd(), "content");
  const DATA_DIR = path.join(process.cwd(), "data");
  const PROGRESS_FILE = path.join(DATA_DIR, "progress.json");

  // Ensure directories exist
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  if (!fs.existsSync(PROGRESS_FILE)) {
    fs.writeFileSync(
      PROGRESS_FILE,
      JSON.stringify({ answeredQuestions: {}, recentActivity: [], mistakes: [] }, null, 2),
      "utf8"
    );
  }

  // Helpers
  function slugify(text: string): string {
    return text
      .toString()
      .toLowerCase()
      .replace(/\s+/g, "-") // Replace spaces with -
      .replace(/[^\w\-]+/g, "") // Remove all non-word chars
      .replace(/\-\-+/g, "-") // Replace multiple - with single -
      .replace(/^-+/, "") // Trim - from start
      .replace(/-+$/, ""); // Trim - from end
  }

  // Walks content/<examId>/modules/<moduleSlug>/<chapterId>.json looking for a matching
  // file. `subjectSlug` in the calling routes' URLs has always been decorative (derived
  // client-side from a human-readable subject name, not the physical module folder) — the
  // chapter id alone is the real lookup key, exactly as before this content/ restructure.
  function findChapterFile(chapterId: string): string | null {
    if (!fs.existsSync(CONTENT_DIR)) return null;
    const examFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((f) => f.isDirectory());
    for (const examFolder of examFolders) {
      const modulesDir = path.join(CONTENT_DIR, examFolder.name, "modules");
      if (!fs.existsSync(modulesDir)) continue;
      const moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true }).filter((f) => f.isDirectory());
      for (const moduleFolder of moduleFolders) {
        const filePath = path.join(modulesDir, moduleFolder.name, `${chapterId}.json`);
        if (fs.existsSync(filePath)) return filePath;
      }
    }
    return null;
  }

  function getPaperForSubject(subjectName: string): "Paper-I" | "Paper-II" {
    const normalized = subjectName.toLowerCase().replace(/[^a-z0-9]/g, "");
    if (
      normalized.includes("aptitude") ||
      normalized.includes("quantitative") ||
      normalized.includes("numerical") ||
      normalized.includes("reasoning") ||
      normalized.includes("english") ||
      normalized.includes("awareness") ||
      normalized.includes("knowledge") ||
      normalized.includes("gk") ||
      normalized.includes("verbal") ||
      normalized.includes("nontech") ||
      normalized.includes("paper1") ||
      normalized.includes("paperi")
    ) {
      return "Paper-I";
    }
    return "Paper-II";
  }

  function getProgress() {
    try {
      if (fs.existsSync(PROGRESS_FILE)) {
        const content = fs.readFileSync(PROGRESS_FILE, "utf8");
        const data = JSON.parse(content);
        if (data && data.answeredQuestions) {
          Object.keys(data.answeredQuestions).forEach((k) => {
            const item = data.answeredQuestions[k];
            if (!item.subject || !item.chapterId) {
              const parts = k.split(":");
              if (parts.length >= 3) {
                const questionId = parts[parts.length - 1];
                const chapterId = parts[parts.length - 2];
                const subject = parts.slice(0, parts.length - 2).join(":");
                item.subject = subject;
                item.chapterId = chapterId;
                item.questionId = Number(questionId) || questionId;
              }
            }
          });
        }
        return data;
      }
    } catch (e) {
      console.error("Error reading progress file, resetting to empty", e);
    }
    return { answeredQuestions: {}, recentActivity: [], mistakes: [] };
  }

  function saveProgress(data: any) {
    try {
      fs.writeFileSync(PROGRESS_FILE, JSON.stringify(data, null, 2), "utf8");
    } catch (e) {
      console.error("Error writing progress file", e);
    }
  }

  // ==========================================
  // API ENDPOINTS
  // ==========================================

  // 0. Which authoring features this deployment supports. The client mirrors
  // this to decide what to render; a static deploy has no server to ask and
  // falls back to NO_CAPABILITIES on the client side.
  app.get("/api/capabilities", (req, res) => {
    res.json(CAPABILITIES);
  });

  // 1. Get Discovered Subjects and Chapters metadata (Auto-discovery)
  // Content lives at content/<examId>/modules/<moduleSlug>/<chapter>.json — the top-level
  // folder name IS the exam id (matches ExamDefinition.id in shared/exams.ts), so which
  // exams exist is a direct filesystem fact, not something inferred from keywords. A brand
  // new exam folder is discovered immediately, even before it has a registry entry.
  app.get("/api/content", (req, res) => {
    try {
      const subjectsMap: Record<string, any> = {};

      if (!fs.existsSync(CONTENT_DIR)) {
        return res.json({ subjects: [] });
      }

      const examFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true }).filter((f) => f.isDirectory());

      for (const examFolder of examFolders) {
        const examId = examFolder.name; // e.g. "claude-ccaf"
        const registeredExam = getExamById(examId);
        const examDisplayName =
          registeredExam?.matchExam || examId.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
        const examPapers = registeredExam?.papers;

        const modulesDir = path.join(CONTENT_DIR, examId, "modules");
        if (!fs.existsSync(modulesDir)) continue;

        const moduleFolders = fs.readdirSync(modulesDir, { withFileTypes: true }).filter((f) => f.isDirectory());

        moduleFolders.forEach((moduleFolder, moduleIndex) => {
          const moduleName = moduleFolder.name; // e.g. "computer-networks"
          const modulePath = path.join(modulesDir, moduleName);
          const files = fs.readdirSync(modulePath);

          for (const file of files) {
            if (!file.endsWith(".json")) continue;
            const filePath = path.join(modulePath, file);
            try {
              const fileContent = fs.readFileSync(filePath, "utf8");
              const chapterData = JSON.parse(fileContent) as any;

              // Determine Exam
              const exam = chapterData.exam || examDisplayName;

              // Extract subject name directly from JSON or module folder name if not defined
              let jsonSubject = chapterData.subject || moduleName.replace(/-/g, " ");
              const examPrefix = `${examDisplayName} - `;
              if (jsonSubject.startsWith(examPrefix)) {
                jsonSubject = jsonSubject.slice(examPrefix.length);
              }
              const chapterName = chapterData.chapter || file.replace(".json", "").replace(/-/g, " ");

              let paper = chapterData.paper;
              if (!paper) {
                if (examPapers && examPapers.length > 0) {
                  paper = getPaperForSubject(jsonSubject);
                } else {
                  paper = "Domain-" + (moduleIndex + 1);
                }
              }

              // Clean Paper format
              if (typeof paper === "string") {
                const cleanedPaper = paper.toLowerCase().replace(/[^a-z0-9]/g, "");
                if (
                  cleanedPaper === "paperi" ||
                  cleanedPaper === "paper1" ||
                  cleanedPaper === "stagei" ||
                  cleanedPaper === "stage1"
                ) {
                  paper = "Paper-I";
                } else if (
                  cleanedPaper === "paperii" ||
                  cleanedPaper === "paper2" ||
                  cleanedPaper === "stageii" ||
                  cleanedPaper === "stage2"
                ) {
                  paper = "Paper-II";
                }
              }

              const mapKey = `${exam}:::${jsonSubject}`;

              if (!subjectsMap[mapKey]) {
                subjectsMap[mapKey] = {
                  name: jsonSubject,
                  exam: exam,
                  chapters: [],
                  totalQuestions: 0,
                  paper: paper,
                };
              }

              const questions = chapterData.questions || [];
              const difficultyCount = { Easy: 0, Medium: 0, Hard: 0 } as Record<string, number>;
              questions.forEach((q: any) => {
                const diff = q.difficulty || "Medium";
                if (diff === "Easy" || diff === "Medium" || diff === "Hard") {
                  difficultyCount[diff]++;
                } else {
                  difficultyCount["Medium"]++;
                }
              });

              // Chapter ID is derived from file path slug
              const chapterId = file.replace(".json", "");

              subjectsMap[mapKey].chapters.push({
                id: chapterId,
                name: chapterName,
                subject: jsonSubject,
                exam: exam,
                description: chapterData.description || "",
                questionsCount: questions.length,
                difficultyBreakdown: difficultyCount,
                paper: paper,
              });

              subjectsMap[mapKey].totalQuestions += questions.length;
            } catch (err) {
              console.error(`Error parsing JSON file: ${filePath}`, err);
            }
          }
        });
      }

      const subjectsList = Object.values(subjectsMap);
      res.json({ subjects: subjectsList });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2. Get questions for a specific chapter
  app.get("/api/chapter/:subjectSlug/:chapterId", (req, res) => {
    try {
      const { chapterId } = req.params;
      const foundFile = findChapterFile(chapterId);

      if (!foundFile) {
        return res.status(404).json({ error: `Chapter ${chapterId} not found.` });
      }

      const fileContent = fs.readFileSync(foundFile, "utf8");
      const chapterData = JSON.parse(fileContent);

      // Return the full chapter questions
      res.json(chapterData);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 2.1 Expand chapter with AI Teacher generated questions
  app.post("/api/chapter/:subjectSlug/:chapterId/expand", requireCapability("aiExpand"), async (req, res) => {
    try {
      const { chapterId } = req.params;
      const { count = 15 } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is not configured. Please set your Gemini API key in the AI Studio Settings menu to use the Virtual Teacher feature.",
        });
      }

      const foundFile = findChapterFile(chapterId);

      if (!foundFile) {
        return res.status(404).json({ error: `Chapter ${chapterId} not found.` });
      }

      const fileContent = fs.readFileSync(foundFile, "utf8");
      const chapterData = JSON.parse(fileContent);

      const existingQuestions = chapterData.questions || [];
      const existingTitles = existingQuestions.map((q: any) => q.question).slice(-40);

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      // Strict exact match on the content's own `exam` field — an unrecognized
      // exam gets the generic persona rather than silently inheriting whichever
      // registered exam happens to be the classification fallback.
      const matchedExam = findExamByExactMatch(chapterData.exam);

      const prompt = buildAiPrompt(matchedExam?.aiPromptPersona || GENERIC_AI_PROMPT_PERSONA, {
        count,
        subject: chapterData.subject,
        chapter: chapterData.chapter,
        existingTitles,
        paperType: chapterData.paper,
      });

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
        },
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error("Empty response received from Gemini API.");
      }

      const generatedData = JSON.parse(responseText);
      const newQuestions = generatedData.questions || [];

      if (!Array.isArray(newQuestions) || newQuestions.length === 0) {
        throw new Error("No questions could be parsed from the AI output.");
      }

      let startId = existingQuestions.length > 0 
        ? Math.max(...existingQuestions.map((q: any) => q.id || 0)) + 1 
        : 1;

      const processedNewQuestions = newQuestions.map((q: any, index: number) => ({
        id: startId + index,
        question: q.question,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty || "Medium",
        source: q.source || "AI Generated Exam Standard",
        explanation: q.explanation,
        examTrick: q.examTrick || "Focus on fundamental concepts and eliminate incorrect options first.",
        importance: q.importance || "Medium",
        tags: q.tags || [chapterData.chapter],
      }));

      chapterData.questions = [...existingQuestions, ...processedNewQuestions];

      fs.writeFileSync(foundFile, JSON.stringify(chapterData, null, 2), "utf8");

      res.json({
        success: true,
        addedCount: processedNewQuestions.length,
        totalCount: chapterData.questions.length,
        questions: chapterData.questions,
      });
    } catch (e: any) {
      console.error("AI Expansion Error:", e);
      res.status(500).json({ error: e.message || "Failed to generate questions via AI Teacher." });
    }
  });

  // 3. Get user progress
  app.get("/api/progress", (req, res) => {
    try {
      res.json(getProgress());
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 4. Submit answered question (Supports both /api/progress/submit and /api/answer)
  const handleAnswerSubmit = (req: express.Request, res: express.Response) => {
    try {
      const updated = recordAnswer(getProgress(), req.body);
      saveProgress(updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  app.post("/api/progress/submit", handleAnswerSubmit);
  app.post("/api/answer", handleAnswerSubmit);

  // 5. Clear all progress
  app.post("/api/progress/clear", (req, res) => {
    try {
      const emptyProgress = clearAllProgress();
      saveProgress(emptyProgress);
      res.json(emptyProgress);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // 6. Clear only mistake book (Supports both /api/progress/clear-mistakes and /api/mistakes/clear)
  const handleClearMistakes = (req: express.Request, res: express.Response) => {
    try {
      const { exam } = req.body || {};
      const updated = clearMistakes(getProgress(), exam);
      saveProgress(updated);
      res.json(updated);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  app.post("/api/progress/clear-mistakes", handleClearMistakes);
  app.post("/api/mistakes/clear", handleClearMistakes);

  // 7. Upload new content pack (Auto-discovery validation)
  app.post("/api/content/upload", requireCapability("contentUpload"), (req, res) => {
    try {
      const fileData = req.body;
      const { filename, content } = fileData;

      if (!content || !content.subject || !content.chapter || !Array.isArray(content.questions)) {
        return res.status(400).json({
          error: "Invalid content pack format. Must be a JSON with 'subject', 'chapter', and 'questions' array.",
        });
      }

      // The exam name decides the top-level folder; unregistered exams still get one.
      const examId = findExamByExactMatch(content.exam)?.id || slugify(content.exam || "unsorted");
      const moduleFolderName = slugify(content.subject);
      const modulePath = path.join(CONTENT_DIR, examId, "modules", moduleFolderName);

      if (!fs.existsSync(modulePath)) {
        fs.mkdirSync(modulePath, { recursive: true });
      }

      // Create chapter filename (e.g. "Normalization" -> "chapter-normalization.json")
      const chapterFileName = filename ? filename.toLowerCase() : `${slugify(content.chapter)}.json`;
      const filePath = path.join(modulePath, chapterFileName);
      const discoveredPath = `${examId}/modules/${moduleFolderName}/${chapterFileName}`;

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");

      res.json({
        success: true,
        message: `Content Pack '${content.chapter}' successfully placed in '${discoveredPath}' and auto-discovered!`,
        discoveredPath,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // VITE MIDDLEWARE & STATIC ASSETS
  // ==========================================

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CIL MT Server running on port ${PORT}`);
    console.log(
      `Authoring capabilities — content upload: ${CAPABILITIES.contentUpload ? "on" : "off"}, ` +
        `AI expand: ${CAPABILITIES.aiExpand ? "on" : "off"}` +
        (CAPABILITIES.contentUpload ? "" : "  (set ENABLE_AUTHORING=true to enable)"),
    );
  });
}

startServer();

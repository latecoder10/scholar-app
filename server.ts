/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs";
import { createRequire } from "module";
import { createServer as createViteServer } from "vite";

const require = createRequire(import.meta.url);
const archiver = require("archiver");

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
  const PORT = 3000;

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

  // 1. Get Discovered Subjects and Chapters metadata (Auto-discovery)
  app.get("/api/content", (req, res) => {
    try {
      const subjectsMap: Record<string, any> = {};

      if (!fs.existsSync(CONTENT_DIR)) {
        return res.json({ subjects: [] });
      }

      // Read subject folders
      const subjectFolders = fs.readdirSync(CONTENT_DIR, { withFileTypes: true });

      for (const folder of subjectFolders) {
        if (folder.isDirectory()) {
          const folderName = folder.name; // E.g., "Computer-Networks" or "Claude-CCAF-Agentic-Architecture"
          const isClaudeExam = folderName.startsWith("Claude-CCAF-") || folderName.toLowerCase().includes("ccaf");
          const folderPath = path.join(CONTENT_DIR, folderName);
          const files = fs.readdirSync(folderPath);

          for (const file of files) {
            if (file.endsWith(".json")) {
              const filePath = path.join(folderPath, file);
              try {
                const fileContent = fs.readFileSync(filePath, "utf8");
                const chapterData = JSON.parse(fileContent) as any;

                // Determine Exam
                const exam = chapterData.exam || (isClaudeExam ? "Claude CCAF" : "CIL MT");

                // Extract subject name directly from JSON or folder name if not defined
                let jsonSubject = chapterData.subject || folderName.replace(/-/g, " ");
                if (isClaudeExam && jsonSubject.startsWith("Claude CCAF - ")) {
                  jsonSubject = jsonSubject.replace("Claude CCAF - ", "");
                }
                const chapterName = chapterData.chapter || file.replace(".json", "").replace(/-/g, " ");

                let paper = chapterData.paper;
                if (!paper) {
                  if (exam === "Claude CCAF") {
                    paper = "Domain-" + (folderName.split("-")[2] || "1");
                  } else {
                    paper = getPaperForSubject(jsonSubject);
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
          }
        }
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
      const { subjectSlug, chapterId } = req.params;
      
      // We look for the file within the corresponding directory. 
      // Because we may have subjects with varying casing and spaces, let's scan directories.
      if (!fs.existsSync(CONTENT_DIR)) {
        return res.status(404).json({ error: "Content folder not found" });
      }

      const folders = fs.readdirSync(CONTENT_DIR);
      let foundFile: string | null = null;

      for (const folder of folders) {
        const folderPath = path.join(CONTENT_DIR, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const filePath = path.join(folderPath, `${chapterId}.json`);
          if (fs.existsSync(filePath)) {
            foundFile = filePath;
            break;
          }
        }
      }

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
  app.post("/api/chapter/:subjectSlug/:chapterId/expand", async (req, res) => {
    try {
      const { subjectSlug, chapterId } = req.params;
      const { count = 15 } = req.body;

      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(400).json({
          error: "GEMINI_API_KEY environment variable is not configured. Please set your Gemini API key in the AI Studio Settings menu to use the Virtual Teacher feature.",
        });
      }

      if (!fs.existsSync(CONTENT_DIR)) {
        return res.status(404).json({ error: "Content folder not found" });
      }

      const folders = fs.readdirSync(CONTENT_DIR);
      let foundFile: string | null = null;

      for (const folder of folders) {
        const folderPath = path.join(CONTENT_DIR, folder);
        if (fs.statSync(folderPath).isDirectory()) {
          const filePath = path.join(folderPath, `${chapterId}.json`);
          if (fs.existsSync(filePath)) {
            foundFile = filePath;
            break;
          }
        }
      }

      if (!foundFile) {
        return res.status(404).json({ error: `Chapter ${chapterId} not found.` });
      }

      const fileContent = fs.readFileSync(foundFile, "utf8");
      const chapterData = JSON.parse(fileContent);

      const existingQuestions = chapterData.questions || [];
      const existingTitles = existingQuestions.map((q: any) => q.question).slice(-40);

      const { GoogleGenAI } = await import("@google/genai");
      const ai = new GoogleGenAI({ apiKey });

      const isClaude = chapterData.exam === "Claude CCAF" || 
        (chapterData.subject && chapterData.subject.toLowerCase().includes("ccaf")) ||
        (chapterData.chapter && chapterData.chapter.toLowerCase().includes("claude"));

      let prompt = "";
      if (isClaude) {
        prompt = `You are a Principal AI Systems Architect and Lead Instructor for the Claude Certified Architect - Foundations (CCAF) Certification Examination.
Your task is to generate exactly ${count} new, highly realistic, scenario-based, architecturally rigorous multiple-choice questions for:
Exam: Claude Certified Architect - Foundations (CCAF)
Subject / Domain: ${chapterData.subject}
Chapter: ${chapterData.chapter}

Do NOT repeat or duplicate the following existing questions:
${JSON.stringify(existingTitles)}

Requirements:
1. Academic & Industry Rigor: Address real-world Anthropic Claude API patterns, Model Context Protocol (MCP tools, resources, error categories, concurrency), Claude Code CLI (hooks, subagents, CLAUDE.md hierarchy, skills), Prompt Caching, Message Batches API, Multi-agent Orchestration, and Token Optimization.
2. Plausible Distractors: Avoid obvious fake options. Distractors must represent common architectural anti-patterns or misconfigurations.
3. Every single question MUST include a deep technical 'explanation' and a practical 'examTrick' (such as an architectural rule-of-thumb, CLI mnemonic, or diagnostic shortcut).
4. Assign realistic difficulty ('Easy', 'Medium', 'Hard') and realistic source tags (e.g., "Anthropic Architect Reference Exam", "CCAF Foundations Scenario Pack").

Return the response as a JSON array matching this schema:
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
      } else {
        const paperType = chapterData.paper || "Paper-II";
        prompt = `You are an elite Senior Professor and Exam Coach for PSU (Public Sector Undertaking) recruitment tests, specifically Coal India Limited Management Trainee (CIL MT) Exam.
Your task is to generate exactly ${count} new, highly professional, conceptually deep, and mathematically/technically accurate multiple-choice questions for:
Subject: ${chapterData.subject}
Chapter: ${chapterData.chapter}
Paper Category: ${paperType} (Paper-I: General Non-Technical Aptitude/Reasoning, Paper-II: Technical Computer Science and Systems)

Do NOT repeat or duplicate the following existing questions:
${JSON.stringify(existingTitles)}

Requirements:
1. Ensure absolute technical accuracy in questions, options, and explanations. Double-check all mathematical and logical equations.
2. Options must be highly realistic, with plausible distractors. No lazy choices.
3. Every single question must include a step-by-step 'explanation' and a unique 'examTrick' (such as an exam shortcut, quick formula, elimination strategy, or visual logic tip to solve the question in under 30 seconds).
4. Assign appropriate difficulty levels ('Easy', 'Medium', 'Hard') distributed realistically.
5. The 'source' should be realistic (e.g., "GATE CSE 2023", "CIL MT CS 2021", "ISRO Scientist Exam", "Standard Aptitude Model", etc.).

Return the response as a JSON array of questions matching this schema:
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
      }

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
      const submission = req.body;
      const {
        subject,
        chapterId,
        chapterName,
        questionId,
        questionText,
        options,
        explanation,
        examTrick,
        correctAnswer,
        userAnswer,
        confidence,
        isCorrect,
        exam,
      } = submission;

      const progress = getProgress();
      const progressKey = `${subject}:${chapterId}:${questionId}`;
      const timestamp = new Date().toISOString();

      // Determine Exam classification
      const detectedExam = exam || (
        (subject && (subject.includes("Claude") || subject.includes("CCAF") || subject.includes("MCP") || subject.includes("Agentic"))) ||
        (chapterId && chapterId.includes("claude")) ||
        (chapterName && chapterName.toLowerCase().includes("claude"))
          ? "Claude CCAF" 
          : "CIL MT"
      );

      // Update answered questions
      progress.answeredQuestions[progressKey] = {
        userAnswer,
        confidence,
        isCorrect,
        timestamp,
        exam: detectedExam,
        subject,
        chapterId,
        chapterName,
        questionId,
      };

      // Add to recent activity (keep last 30 entries)
      const recentEntry = {
        subject,
        chapterId,
        chapterName,
        questionId,
        isCorrect,
        confidence,
        timestamp,
        exam: detectedExam,
      };
      progress.recentActivity.unshift(recentEntry);
      if (progress.recentActivity.length > 30) {
        progress.recentActivity.pop();
      }

      // Update mistake book (add if incorrect, remove if correct is re-attempted and solved)
      const mistakeId = `${subject}:${chapterId}:${questionId}`;
      if (!isCorrect) {
        const existingIndex = progress.mistakes.findIndex((m: any) => m.id === mistakeId);
        const mistakeEntry = {
          id: mistakeId,
          subject,
          chapterId,
          chapterName,
          questionId,
          questionText,
          options,
          userAnswer,
          correctAnswer,
          explanation,
          examTrick,
          confidence,
          timestamp,
          exam: detectedExam,
        };

        if (existingIndex > -1) {
          progress.mistakes[existingIndex] = mistakeEntry; // Update existing
        } else {
          progress.mistakes.push(mistakeEntry); // Add new
        }
      } else {
        // If correct, remove from mistake book (signifies they revised and got it right)
        progress.mistakes = progress.mistakes.filter((m: any) => m.id !== mistakeId);
      }

      saveProgress(progress);
      res.json(progress);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  app.post("/api/progress/submit", handleAnswerSubmit);
  app.post("/api/answer", handleAnswerSubmit);

  // 5. Clear all progress
  app.post("/api/progress/clear", (req, res) => {
    try {
      const emptyProgress = { answeredQuestions: {}, recentActivity: [], mistakes: [] };
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
      const progress = getProgress();
      if (exam) {
        progress.mistakes = progress.mistakes.filter((m: any) => m.exam !== exam);
      } else {
        progress.mistakes = [];
      }
      saveProgress(progress);
      res.json(progress);
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  };

  app.post("/api/progress/clear-mistakes", handleClearMistakes);
  app.post("/api/mistakes/clear", handleClearMistakes);

  // 7. Upload new content pack (Auto-discovery validation)
  app.post("/api/content/upload", (req, res) => {
    try {
      const fileData = req.body;
      const { filename, content } = fileData;

      if (!content || !content.subject || !content.chapter || !Array.isArray(content.questions)) {
        return res.status(400).json({
          error: "Invalid content pack format. Must be a JSON with 'subject', 'chapter', and 'questions' array.",
        });
      }

      // Create subject folder name (e.g. "Computer Networks" -> "Computer-Networks")
      const subjectFolderName = content.subject.trim().replace(/\s+/g, "-");
      const subjectPath = path.join(CONTENT_DIR, subjectFolderName);

      if (!fs.existsSync(subjectPath)) {
        fs.mkdirSync(subjectPath, { recursive: true });
      }

      // Create chapter filename (e.g. "Normalization" -> "chapter-normalization.json")
      const chapterFileName = filename ? filename.toLowerCase() : `${slugify(content.chapter)}.json`;
      const filePath = path.join(subjectPath, chapterFileName);

      fs.writeFileSync(filePath, JSON.stringify(content, null, 2), "utf8");

      res.json({
        success: true,
        message: `Content Pack '${content.chapter}' successfully placed in '${subjectFolderName}/' folder and auto-discovered!`,
        discoveredPath: `${subjectFolderName}/${chapterFileName}`,
      });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // ==========================================
  // ONE-CLICK DOWNLOAD PACKAGES (.ZIP)
  // ==========================================

  // Download entire /mobile React Native & Expo app ready for install/build
  app.get("/api/download/mobile-app-zip", (req, res) => {
    try {
      const mobileDir = path.join(process.cwd(), "mobile");
      if (!fs.existsSync(mobileDir)) {
        return res.status(404).json({ error: "Mobile directory not found" });
      }

      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="exam-scholar-mobile-app.zip"');

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (err) => {
        res.status(500).send({ error: err.message });
      });

      archive.pipe(res);

      // Append mobile folder ignoring heavy node_modules or .expo caches
      archive.directory(mobileDir, "mobile", (entry) => {
        if (entry.name.includes("node_modules") || entry.name.includes(".expo") || entry.name.includes(".git")) {
          return false;
        }
        return entry;
      });

      archive.finalize();
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Download entire content/ directory
  app.get("/api/download/content-zip", (req, res) => {
    try {
      res.setHeader("Content-Type", "application/zip");
      res.setHeader("Content-Disposition", 'attachment; filename="exam-scholar-content-packs.zip"');

      const archive = archiver("zip", { zlib: { level: 9 } });
      archive.on("error", (err) => {
        res.status(500).send({ error: err.message });
      });

      archive.pipe(res);
      archive.directory(CONTENT_DIR, "content");
      archive.finalize();
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
  });
}

startServer();

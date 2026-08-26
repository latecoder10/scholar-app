/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Bake content/ into the mobile app as one bundled dataset.
 *
 * The mobile app used to carry its own hand-maintained copies of the question
 * bank (ccafQuestions.json, cilQuestions.json) plus a hand-written
 * examManifest.json of counts. That is a drift machine: after the mock packs
 * were rebuilt, the manifest still advertised 1128 questions and 425 CCAF ones
 * against a real 1126 and 423, so the dashboard chips were simply wrong. The
 * two banks were also flat — they carried chapterName but no chapterId, so the
 * app could not present the subject -> chapter structure the web has.
 *
 * This script emits a single file from the same discoverSubjects() walk the
 * Express server and the static-site build use, so all three clients see one
 * content tree by construction.
 *
 *   npx tsx scripts/build-mobile-content.ts
 *
 * Writes mobile/src/data/content.json:
 *   { generatedAt, totalQuestions, subjects: [...], chapters: { <id>: [...] } }
 *
 * Everything is in one file on purpose: the mobile app bundles it statically,
 * with no lazy chunk loading.
 */
import fs from "node:fs";
import path from "node:path";
import { discoverSubjects, collectChapterFiles } from "../server/contentDiscovery";
import { EXAM_REGISTRY } from "../shared/exams";

const ROOT = path.resolve(import.meta.dirname, "..");
const CONTENT_DIR = path.join(ROOT, "content");
const OUT_FILE = path.join(ROOT, "mobile", "src", "data", "content.json");

interface MobileQuestion {
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
  subject: string;
  chapterId: string;
  chapterName: string;
  exam: string;
}

function main(): void {
  const subjects = discoverSubjects(CONTENT_DIR);
  const chapterFiles = collectChapterFiles(CONTENT_DIR);

  const chapters: Record<string, MobileQuestion[]> = {};
  let totalQuestions = 0;
  let nextId = 1;

  for (const subject of subjects) {
    for (const chapter of subject.chapters) {
      const file = chapterFiles.get(chapter.id);
      if (!file) {
        console.warn(`  ! no file for chapter ${chapter.id}, skipping`);
        continue;
      }
      const pack = JSON.parse(fs.readFileSync(file, "utf8"));
      const questions: MobileQuestion[] = (pack.questions || []).map((q: any) => ({
        // Ids are unique across the whole bundle: progress, bookmarks and the
        // mistake list are all keyed by question id, and the per-chapter ids in
        // content/ restart at 1 in every file.
        id: nextId++,
        question: q.question,
        options: q.options,
        answer: q.answer,
        difficulty: q.difficulty || "Medium",
        source: q.source || "",
        explanation: q.explanation || "",
        examTrick: q.examTrick || "",
        importance: q.importance || "Medium",
        tags: q.tags || [],
        subject: subject.name,
        chapterId: chapter.id,
        chapterName: chapter.name,
        exam: chapter.exam || subject.exam,
      }));

      chapters[chapter.id] = questions;
      totalQuestions += questions.length;
    }
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    totalQuestions,
    // The subject index, identical in shape to what /api/content returns.
    subjects,
    chapters,
  };

  fs.mkdirSync(path.dirname(OUT_FILE), { recursive: true });
  fs.writeFileSync(OUT_FILE, JSON.stringify(payload), "utf8");

  const bytes = fs.statSync(OUT_FILE).size;
  const perExam = EXAM_REGISTRY.map((e) => {
    const count = Object.values(chapters)
      .flat()
      .filter((q) => q.exam === e.matchExam).length;
    return `${e.shortName} ${count}`;
  }).join(", ");

  console.log(
    `mobile content: ${subjects.length} subjects, ${Object.keys(chapters).length} chapters, ` +
      `${totalQuestions} questions (${(bytes / 1024 / 1024).toFixed(2)} MB) -> mobile/src/data/content.json`
  );
  console.log(`  per exam: ${perExam}`);
}

main();

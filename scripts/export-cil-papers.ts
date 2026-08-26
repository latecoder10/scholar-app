/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Export the CIL MT question bank to two print-ready PDFs, one per paper —
 * questions and answers only, no explanations.
 *
 *   npx tsx scripts/export-cil-papers.ts
 *
 * Writes exports/CIL-MT-Paper-I-Questions-and-Answers.pdf and the Paper-II
 * equivalent.
 *
 * Papers are grouped by each CHAPTER's `paper` field, not its subject's: the
 * "Mock Tests" subject holds one Paper-I sheet and one Paper-II sheet, so
 * grouping at subject level would file both under whichever the subject
 * happened to claim.
 *
 * pdfkit is not a project dependency — install it for a run with
 * `npm i pdfkit --no-save`.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { toAscii, writeRich } from "./pdf-rich-text";

// pdfkit ships CommonJS only; this file runs as ESM under tsx.
const PDFDocument = createRequire(import.meta.url)("pdfkit");

const ROOT = path.resolve(import.meta.dirname, "..");
const BUNDLE = path.join(ROOT, "mobile", "src", "data", "content.json");
const OUT_DIR = path.join(ROOT, "exports");

interface Q {
  id: number;
  question: string;
  options: string[];
  answer: string;
  subject: string;
  chapterId: string;
  chapterName: string;
}

function buildPdf(paper: string, rows: { subject: string; chapterName: string; questions: Q[] }[]) {
  const total = rows.reduce((n, r) => n + r.questions.length, 0);
  const file = path.join(OUT_DIR, `CIL-MT-${paper}-Questions-and-Answers.pdf`);
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  doc.pipe(fs.createWriteStream(file));

  // Cover
  doc.font("Helvetica-Bold").fontSize(24).fillColor("#0F172A");
  doc.text(toAscii(`CIL MT - ${paper}`), { align: "left" });
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(12).fillColor("#475569");
  doc.text(toAscii("Questions and answers only. No explanations."));
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor("#94A3B8");
  doc.text(`${total} questions across ${rows.length} chapters`);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1);

  let n = 0;
  for (const row of rows) {
    // Keep a chapter heading with at least the first question below it.
    if (doc.y > doc.page.height - 160) doc.addPage();

    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#4F46E5");
    doc.text(toAscii(row.chapterName));
    doc.font("Helvetica").fontSize(9).fillColor("#94A3B8");
    doc.text(toAscii(`${row.subject} - ${row.questions.length} questions`));
    doc.moveDown(0.5);

    for (const q of row.questions) {
      n += 1;
      if (doc.y > doc.page.height - 140) doc.addPage();

      const breakSoon = () => {
        if (doc.y > doc.page.height - 70) doc.addPage();
      };

      doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#0F172A");
      doc.text(`${n}.`, doc.page.margins.left, doc.y);
      doc.moveUp();
      writeRich(doc, q.question, {
        size: 10.5,
        color: "#0F172A",
        indent: 18,
        beforeLine: breakSoon,
      });
      doc.moveDown(0.2);

      q.options.forEach((opt, i) => {
        breakSoon();
        writeRich(doc, `(${String.fromCharCode(65 + i)}) ${opt}`, {
          size: 9.5,
          color: "#334155",
          indent: 18,
          beforeLine: breakSoon,
        });
      });

      const letterIndex = q.options.indexOf(q.answer);
      const letter = letterIndex >= 0 ? String.fromCharCode(65 + letterIndex) : "?";
      doc.moveDown(0.15);
      breakSoon();
      writeRich(doc, `**Answer: (${letter})** ${q.answer}`, {
        size: 9.5,
        color: "#047857",
        indent: 18,
        beforeLine: breakSoon,
      });
      doc.moveDown(0.55);
    }
  }

  // Page numbers
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.font("Helvetica").fontSize(8).fillColor("#94A3B8");
    doc.text(
      `CIL MT ${paper}  ·  page ${i + 1} of ${range.count}`.replace(/·/g, "-"),
      48,
      doc.page.height - 32,
      { align: "center", width: doc.page.width - 96, lineBreak: false }
    );
  }

  doc.end();
  return { file, total };
}

function main(): void {
  const bundle = JSON.parse(fs.readFileSync(BUNDLE, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const papers: Record<string, { subject: string; chapterName: string; questions: Q[] }[]> = {};

  for (const subject of bundle.subjects) {
    if (subject.exam !== "CIL MT") continue;
    for (const chapter of subject.chapters) {
      const paper = chapter.paper || subject.paper;
      const questions: Q[] = bundle.chapters[chapter.id] || [];
      if (!questions.length) continue;
      (papers[paper] = papers[paper] || []).push({
        subject: subject.name,
        chapterName: chapter.name,
        questions,
      });
    }
  }

  for (const [paper, rows] of Object.entries(papers)) {
    // Paper-I's mock sheet pads itself by repeating a handful of questions
    // ~24 times each. Duplicates are noise in a revision document, so keep the
    // first occurrence of each distinct question stem.
    const seen = new Set<string>();
    let dropped = 0;
    const deduped = rows
      .map((r) => ({
        ...r,
        questions: r.questions.filter((q) => {
          if (seen.has(q.question)) {
            dropped += 1;
            return false;
          }
          seen.add(q.question);
          return true;
        }),
      }))
      .filter((r) => r.questions.length > 0);

    const { file, total } = buildPdf(paper, deduped);
    console.log(
      `${paper}: ${total} questions -> ${path.relative(ROOT, file)}` +
        (dropped ? `  (removed ${dropped} duplicate stems)` : "")
    );
  }
}

main();

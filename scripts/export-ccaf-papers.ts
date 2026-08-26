/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Export the Claude CCAF question bank to two PDFs — full fidelity, including
 * every explanation and exam tip exactly as stored.
 *
 *   npx tsx scripts/export-ccaf-papers.ts
 *
 * Writes:
 *   exports/Claude-CCAF-Practice-Full.pdf   (the 31 curriculum chapters)
 *   exports/Claude-CCAF-Mock-Exams-Full.pdf (the 3 mock papers)
 *
 * Unlike the CIL export, this one renders the markdown the explanations are
 * authored in: the rebuilt mock packs end every explanation with a
 * "Why the other options are wrong" block of bullets, and flattening that to
 * plain text would lose the structure the reader needs.
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
  explanation: string;
  examTrick: string;
  subject: string;
  chapterId: string;
  chapterName: string;
}

interface Group {
  subject: string;
  chapterName: string;
  questions: Q[];
}

function buildPdf(title: string, subtitle: string, fileName: string, groups: Group[]) {
  const total = groups.reduce((n, g) => n + g.questions.length, 0);
  const file = path.join(OUT_DIR, fileName);
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  doc.pipe(fs.createWriteStream(file));

  const breakIfNeeded = (headroom = 80) => {
    if (doc.y > doc.page.height - headroom) doc.addPage();
  };

  // Cover
  doc.font("Helvetica-Bold").fontSize(24).fillColor("#0F172A");
  doc.text(toAscii(title));
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(12).fillColor("#475569");
  doc.text(toAscii(subtitle));
  doc.moveDown(0.2);
  doc.fontSize(10).fillColor("#94A3B8");
  doc.text(`${total} questions across ${groups.length} chapters`);
  doc.text(`Generated ${new Date().toISOString().slice(0, 10)}`);
  doc.moveDown(1);

  let n = 0;
  for (const group of groups) {
    breakIfNeeded(170);

    doc.moveDown(0.6);
    doc.font("Helvetica-Bold").fontSize(13).fillColor("#4F46E5");
    doc.text(toAscii(group.chapterName), doc.page.margins.left, doc.y);
    doc.font("Helvetica").fontSize(9).fillColor("#94A3B8");
    doc.text(`${toAscii(group.subject)} - ${group.questions.length} questions`);
    doc.moveDown(0.5);

    for (const q of group.questions) {
      n += 1;
      breakIfNeeded(170);

      // Question — through the rich renderer so code spans and emphasis in the
      // stem render properly instead of leaking backticks onto the page.
      doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#0F172A");
      doc.text(`${n}.`, doc.page.margins.left, doc.y, { continued: false });
      doc.moveUp();
      writeRich(doc, q.question, {
        size: 10.5,
        color: "#0F172A",
        indent: 18,
        beforeLine: () => breakIfNeeded(70),
      });
      doc.moveDown(0.25);

      // Options
      q.options.forEach((opt, i) => {
        breakIfNeeded(70);
        writeRich(doc, `(${String.fromCharCode(65 + i)}) ${opt}`, {
          size: 9.5,
          color: "#334155",
          indent: 18,
          beforeLine: () => breakIfNeeded(70),
        });
      });

      // Answer
      const idx = q.options.indexOf(q.answer);
      const letter = idx >= 0 ? String.fromCharCode(65 + idx) : "?";
      doc.moveDown(0.25);
      breakIfNeeded(70);
      writeRich(doc, `**Answer: (${letter})** ${q.answer}`, {
        size: 9.5,
        color: "#047857",
        indent: 18,
        beforeLine: () => breakIfNeeded(70),
      });

      // Explanation, markdown intact
      if (q.explanation) {
        doc.moveDown(0.35);
        breakIfNeeded(70);
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#64748B");
        doc.text("EXPLANATION", doc.page.margins.left + 18, doc.y);
        doc.moveDown(0.2);
        writeRich(doc, q.explanation, {
          size: 9,
          color: "#334155",
          indent: 18,
          beforeLine: () => breakIfNeeded(70),
        });
      }

      // Exam tip
      if (q.examTrick) {
        doc.moveDown(0.3);
        breakIfNeeded(70);
        doc.font("Helvetica-Bold").fontSize(8).fillColor("#B45309");
        doc.text("EXAM TIP", doc.page.margins.left + 18, doc.y);
        doc.moveDown(0.2);
        writeRich(doc, q.examTrick, {
          size: 9,
          color: "#92400E",
          indent: 18,
          beforeLine: () => breakIfNeeded(70),
        });
      }

      doc.moveDown(0.9);
    }
  }

  // Footer page numbers
  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.font("Helvetica").fontSize(8).fillColor("#94A3B8");
    doc.text(
      `${toAscii(title)} - page ${i + 1} of ${range.count}`,
      48,
      doc.page.height - 32,
      { align: "center", width: doc.page.width - 96, lineBreak: false }
    );
  }

  doc.end();
  return { file, total, pages: range.count };
}

function main(): void {
  const bundle = JSON.parse(fs.readFileSync(BUNDLE, "utf8"));
  fs.mkdirSync(OUT_DIR, { recursive: true });

  const practice: Group[] = [];
  const mocks: Group[] = [];

  for (const subject of bundle.subjects) {
    if (subject.exam !== "Claude CCAF") continue;
    for (const chapter of subject.chapters) {
      const questions: Q[] = bundle.chapters[chapter.id] || [];
      if (!questions.length) continue;
      const group: Group = { subject: subject.name, chapterName: chapter.name, questions };
      const isMock = /mock/i.test(chapter.id) || /mock/i.test(subject.name);
      (isMock ? mocks : practice).push(group);
    }
  }

  const a = buildPdf(
    "Claude CCAF - Practice",
    "Every practice question with its answer, full explanation and exam tip.",
    "Claude-CCAF-Practice-Full.pdf",
    practice
  );
  console.log(`Practice: ${a.total} questions, ${a.pages} pages -> ${path.relative(ROOT, a.file)}`);

  const b = buildPdf(
    "Claude CCAF - Mock Exams",
    "All three mock papers with answers, full explanations and exam tips.",
    "Claude-CCAF-Mock-Exams-Full.pdf",
    mocks
  );
  console.log(`Mocks:    ${b.total} questions, ${b.pages} pages -> ${path.relative(ROOT, b.file)}`);
}

main();

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Export "CCAF - Actual Exam Questions" to a PDF with researched answers and
 * explanations.
 *
 *   npx tsx scripts/export-ccaf-actual-exam.ts
 *
 * Writes exports/Claude-CCAF-Actual-Exam-Answered.pdf
 *
 * Unlike the other exporters, the source PDF for this set ships NO answer key
 * and NO explanations. Questions come from ccaf-actual-exam-questions.json
 * (verbatim transcription) and the key from ccaf-actual-exam-answers.json
 * (authored: source-keyed where an identical question exists in a keyed source
 * document, otherwise documentation or reasoned). Each question prints the
 * basis and a confidence marker so the reader can see how firm the answer is.
 *
 * pdfkit is not a project dependency — install it for a run with
 * `npm i pdfkit --no-save`.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { toAscii, writeRich } from "./pdf-rich-text";

const PDFDocument = createRequire(import.meta.url)("pdfkit");

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIR = path.join(ROOT, "docs", "raw-sources");
const OUT_DIR = path.join(ROOT, "exports");
const OUT_FILE = path.join(OUT_DIR, "Claude-CCAF-Actual-Exam-Answered.pdf");

interface SourceQuestion {
  n: string;
  question: string;
  options: string[];
}

interface Answer {
  letter: string;
  confidence: string;
  basis: string;
  explanation: string;
}

function main(): void {
  const src = JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "ccaf-actual-exam-questions.json"), "utf8")
  ) as { title: string; questions: SourceQuestion[] };
  const key = JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "ccaf-actual-exam-answers.json"), "utf8")
  ) as { answers: Record<string, Answer> };

  // Validate before drawing anything: every question needs an answer, and every
  // answer letter must address an option that actually exists.
  const problems: string[] = [];
  for (const q of src.questions) {
    const a = key.answers[q.n];
    if (!a) {
      problems.push(`Q${q.n}: no answer entry`);
      continue;
    }
    const idx = a.letter.charCodeAt(0) - 65;
    if (idx < 0 || idx >= q.options.length) {
      problems.push(`Q${q.n}: answer letter ${a.letter} is out of range (${q.options.length} options)`);
    }
    if (!a.explanation || a.explanation.length < 80) problems.push(`Q${q.n}: explanation too thin`);
    if (!a.basis) problems.push(`Q${q.n}: no basis recorded`);
  }
  for (const n of Object.keys(key.answers)) {
    if (!src.questions.some((q) => q.n === n)) problems.push(`answer ${n} has no question`);
  }
  if (problems.length) {
    console.error("Validation failed:\n  " + problems.join("\n  "));
    process.exit(1);
  }

  fs.mkdirSync(OUT_DIR, { recursive: true });
  const doc = new PDFDocument({ size: "A4", margin: 48, bufferPages: true });
  doc.pipe(fs.createWriteStream(OUT_FILE));

  const breakIfNeeded = (headroom = 80) => {
    if (doc.y > doc.page.height - headroom) doc.addPage();
  };

  const counts = { high: 0, medium: 0 } as Record<string, number>;
  for (const q of src.questions) counts[key.answers[q.n].confidence] = (counts[key.answers[q.n].confidence] || 0) + 1;

  // Cover
  doc.font("Helvetica-Bold").fontSize(23).fillColor("#0F172A");
  doc.text("Claude CCAF - Actual Exam Questions");
  doc.moveDown(0.3);
  doc.font("Helvetica").fontSize(12).fillColor("#475569");
  doc.text("With researched answers and full explanations.");
  doc.moveDown(0.5);
  doc.fontSize(9.5).fillColor("#475569");
  writeRich(
    doc,
    "**How to read this document.** The source PDF contains questions only — it ships no answer key and no explanations. " +
      "Every answer here was determined by research and is labelled with its basis:\n" +
      "- **source-key** — the same question appears in a source document that carries its own answer key, so the answer is taken from that key.\n" +
      "- **docs** — settled against Anthropic / Claude Code documentation.\n" +
      "- **principle** — transferred from a source-keyed question that tests the same rule.\n" +
      "- **reasoned** — argued from the options, with no direct citation.\n\n" +
      `Each answer also carries a confidence marker. ${counts.high} of ${src.questions.length} are high confidence; ` +
      `${counts.medium || 0} are marked medium and are worth double-checking against your own materials before relying on them.`,
    { size: 9.5, color: "#475569", beforeLine: () => breakIfNeeded(70) }
  );
  doc.moveDown(0.5);
  doc.fontSize(9).fillColor("#94A3B8");
  doc.text(`${src.questions.length} questions - generated ${new Date().toISOString().slice(0, 10)}`);

  doc.addPage();

  let n = 0;
  for (const q of src.questions) {
    const a = key.answers[q.n];
    n += 1;
    breakIfNeeded(180);

    // Question header
    doc.font("Helvetica-Bold").fontSize(11).fillColor("#4F46E5");
    doc.text(`Question ${toAscii(q.n)}`, doc.page.margins.left, doc.y);
    doc.moveDown(0.25);

    doc.font("Helvetica-Bold").fontSize(10.5).fillColor("#0F172A");
    writeRich(doc, q.question, {
      size: 10.5,
      color: "#0F172A",
      beforeLine: () => breakIfNeeded(70),
    });
    doc.moveDown(0.3);

    // Options
    q.options.forEach((opt, i) => {
      breakIfNeeded(70);
      writeRich(doc, `(${String.fromCharCode(65 + i)}) ${opt}`, {
        size: 9.5,
        color: "#334155",
        indent: 14,
        beforeLine: () => breakIfNeeded(70),
      });
    });

    // Answer
    const idx = a.letter.charCodeAt(0) - 65;
    doc.moveDown(0.3);
    breakIfNeeded(70);
    writeRich(doc, `**Answer: (${a.letter})** ${q.options[idx]}`, {
      size: 9.5,
      color: "#047857",
      indent: 14,
      beforeLine: () => breakIfNeeded(70),
    });

    // Basis + confidence
    doc.moveDown(0.2);
    breakIfNeeded(70);
    // Plain text, not italics: the inline renderer supports **bold** and `code`,
    // not single-asterisk italics, so markers would print literally.
    writeRich(doc, `Confidence: ${a.confidence}  |  basis: ${a.basis}`, {
      size: 8,
      color: "#94A3B8",
      indent: 14,
      beforeLine: () => breakIfNeeded(70),
    });

    // Explanation
    doc.moveDown(0.3);
    breakIfNeeded(70);
    doc.font("Helvetica-Bold").fontSize(8).fillColor("#64748B");
    doc.text("EXPLANATION", doc.page.margins.left + 14, doc.y);
    doc.moveDown(0.2);
    writeRich(doc, a.explanation, {
      size: 9,
      color: "#334155",
      indent: 14,
      beforeLine: () => breakIfNeeded(70),
    });

    doc.moveDown(1);
  }

  const range = doc.bufferedPageRange();
  for (let i = 0; i < range.count; i++) {
    doc.switchToPage(range.start + i);
    doc.font("Helvetica").fontSize(8).fillColor("#94A3B8");
    doc.text(
      `Claude CCAF - Actual Exam Questions (answered) - page ${i + 1} of ${range.count}`,
      48,
      doc.page.height - 32,
      { align: "center", width: doc.page.width - 96, lineBreak: false }
    );
  }

  doc.end();

  const byLetter: Record<string, number> = {};
  for (const q of src.questions) {
    const l = key.answers[q.n].letter;
    byLetter[l] = (byLetter[l] || 0) + 1;
  }
  console.log(
    `${src.questions.length} questions -> ${path.relative(ROOT, OUT_FILE)} (${range.count} pages)`
  );
  console.log(`  confidence: ${counts.high} high, ${counts.medium || 0} medium`);
  console.log(`  answer spread: ${Object.entries(byLetter).sort().map(([l, c]) => `${l}=${c}`).join(", ")}`);
}

main();

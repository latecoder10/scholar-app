/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Build the "Actual Exam" content pack (CCAF Mock 4) from the transcribed
 * questions and the researched answer key.
 *
 *   npx tsx scripts/build-actual-exam-mock.ts
 *
 * Writes content/claude-ccaf/modules/mock-tests/claude-ccaf-mock-exam-4.json.
 * Afterwards run `npx tsx scripts/build-mobile-content.ts` to propagate it into
 * the mobile bundle, and `npm run build:static` before deploying the web app.
 *
 * Two things this script does that matter:
 *
 *  - It de-duplicates. The source PDF's "Set B" block re-asks six questions
 *    from earlier in the paper with the options reordered and a shared
 *    preamble dropped. Serving the same question twice inside one mock is a
 *    defect, so only the first occurrence is kept.
 *  - It carries provenance into the pack. Since this key was researched rather
 *    than supplied by the source, each question's exam tip records the
 *    confidence and the basis, so the app shows how firm the answer is.
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIR = path.join(ROOT, "docs", "raw-sources");
const OUT_FILE = path.join(
  ROOT,
  "content",
  "claude-ccaf",
  "modules",
  "mock-tests",
  "claude-ccaf-mock-exam-4.json"
);

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

const tokens = (t: string) => new Set(t.toLowerCase().match(/[a-z0-9]+/g) || []);
function similarity(a: string, b: string): number {
  const A = tokens(a);
  const B = tokens(b);
  if (!A.size || !B.size) return 0;
  let hits = 0;
  A.forEach((t) => B.has(t) && hits++);
  return hits / Math.max(A.size, B.size);
}

function main(): void {
  const src = JSON.parse(
    fs.readFileSync(path.join(RAW_DIR, "ccaf-actual-exam-questions.json"), "utf8")
  ) as { questions: SourceQuestion[] };
  const key = (
    JSON.parse(fs.readFileSync(path.join(RAW_DIR, "ccaf-actual-exam-answers.json"), "utf8")) as {
      answers: Record<string, Answer>;
    }
  ).answers;

  const kept: SourceQuestion[] = [];
  const dropped: string[] = [];

  for (const q of src.questions) {
    const twin = kept.find((k) => similarity(k.question, q.question) > 0.8);
    if (twin) {
      dropped.push(`${q.n} (duplicate of ${twin.n})`);
      continue;
    }
    kept.push(q);
  }

  const questions = kept.map((q, i) => {
    const a = key[q.n];
    if (!a) throw new Error(`no answer for question ${q.n}`);
    const idx = a.letter.charCodeAt(0) - 65;
    const answer = q.options[idx];
    if (!answer) throw new Error(`answer letter ${a.letter} out of range for question ${q.n}`);

    return {
      id: i + 1,
      question: q.question,
      options: q.options,
      answer,
      difficulty: "Medium",
      source: `CCAF Actual Exam Q${q.n}`,
      explanation: a.explanation,
      // The source PDF ships no key, so the tip carries how the answer was
      // established rather than a syllabus pointer.
      examTrick: `Answer basis: ${a.basis}. Confidence: ${a.confidence}.`,
      importance: "High",
      tags: [
        "Claude CCAF",
        "Actual Exam",
        "Mock 4",
        a.confidence === "high" ? "verified-high-confidence" : "review-before-relying",
      ],
    };
  });

  const pack = {
    subject: "Mock Tests",
    chapter: `Claude CCAF Actual Exam Questions (${questions.length}Q)`,
    exam: "Claude CCAF",
    paper: "Mock-4",
    description:
      `Questions transcribed from the circulated "CCAF Actual Exam Questions" paper. ` +
      `That source ships no answer key, so every answer here was researched: taken from a keyed source ` +
      `document where the same question appears in one, otherwise settled against Anthropic documentation ` +
      `or argued from the options. Each question's exam tip records its basis and confidence.`,
    questions,
  };

  fs.writeFileSync(OUT_FILE, JSON.stringify(pack, null, 2) + "\n", "utf8");

  const byLetter: Record<string, number> = {};
  questions.forEach((q) => {
    const l = String.fromCharCode(65 + q.options.indexOf(q.answer));
    byLetter[l] = (byLetter[l] || 0) + 1;
  });
  const lowConf = questions.filter((q) => q.tags.includes("review-before-relying")).length;

  console.log(
    `Mock 4: ${questions.length} questions -> ${path.relative(ROOT, OUT_FILE)}` +
      (dropped.length ? `\n  dropped ${dropped.length} duplicates: ${dropped.join("; ")}` : "")
  );
  console.log(`  answer spread: ${Object.entries(byLetter).sort().map(([l, c]) => `${l}=${c}`).join(", ")}`);
  console.log(`  ${questions.length - lowConf} high confidence, ${lowConf} flagged for review`);
  console.log("\nNext: npx tsx scripts/build-mobile-content.ts, then npm run build:static");
}

main();

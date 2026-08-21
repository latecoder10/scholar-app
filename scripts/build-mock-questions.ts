/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Builds the CCAF mock-test content packs from the raw transcriptions in
 * docs/raw-sources/.
 *
 * The three mock packs previously shipped as templated placeholders
 * ("[RAW-CG1-001] Question scenario on ...", options "Option A ...", answer
 * always B). The real questions live in the transcribed source files; this
 * script is the one-way door between them and the JSON the app reads, so the
 * markdown stays the source of truth and the JSON is never hand-edited.
 *
 *   npx tsx scripts/build-mock-questions.ts
 *
 * Writes:
 *   content/claude-ccaf/modules/mock-tests/claude-ccaf-mock-exam-{1,2,3}.json
 *   mobile/src/data/ccafQuestions.json   (same questions, mobile bank shape)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = path.resolve(import.meta.dirname, "..");
const RAW_DIR = path.join(ROOT, "docs", "raw-sources");
const MOCK_DIR = path.join(ROOT, "content", "claude-ccaf", "modules", "mock-tests");
const MOBILE_BANK = path.join(ROOT, "mobile", "src", "data", "ccafQuestions.json");

interface ParsedQuestion {
  ref: string; // e.g. RAW-CG1-001
  sourceLine: string;
  stem: string;
  options: { letter: string; text: string }[];
  correctLetters: string[];
  perOption: Record<string, string>;
  singleExplanation: string;
  whereFrom: string;
  multiSelect: boolean;
  quality: string;
}

// ---------------------------------------------------------------------------
// Parsing
// ---------------------------------------------------------------------------

const OPTION_RE = /^([A-E])\.\s+(.*)$/;
const PER_OPTION_RE = /^-\s+([A-E]):\s*(.*)$/;

function parseSource(file: string): ParsedQuestion[] {
  const text = fs
    .readFileSync(file, "utf8")
    .replace(/<!--[\s\S]*?-->/g, ""); // provenance comments are for humans

  const blocks = text.split(/^### (?=RAW-)/m).slice(1);

  return blocks.map((block) => {
    const lines = block.split("\n");
    const ref = lines[0].trim();

    const q: ParsedQuestion = {
      ref,
      sourceLine: "",
      stem: "",
      options: [],
      correctLetters: [],
      perOption: {},
      singleExplanation: "",
      whereFrom: "",
      multiSelect: false,
      quality: "",
    };

    const stemLines: string[] = [];
    let mode: "meta" | "stem" | "options" | "perOption" = "meta";

    for (const raw of lines.slice(1)) {
      const line = raw.trim();

      if (line.startsWith("**Source:**")) {
        q.sourceLine = line.replace("**Source:**", "").trim();
        continue;
      }
      if (line.startsWith("**Repaired-from:**")) continue;
      if (line.startsWith("**Quality:**")) {
        q.quality = line.replace("**Quality:**", "").trim();
        continue;
      }
      if (line.startsWith("**Format:**")) {
        q.multiSelect = /MULTI-SELECT/i.test(line);
        continue;
      }

      if (line.startsWith("**Correct (per source")) {
        const answers = line.split("**")[2]?.replace(/^:?\s*/, "") ?? "";
        q.correctLetters = answers
          .split(/[,\s]+/)
          .map((s) => s.trim().toUpperCase())
          .filter((s) => /^[A-E]$/.test(s));
        mode = "meta";
        continue;
      }

      if (line.startsWith("**Explanations (per source")) {
        mode = "perOption";
        continue;
      }

      if (line.startsWith("**Explanation (per source")) {
        // Single-explanation form: the text follows on the same line.
        q.singleExplanation = line.replace(/^\*\*Explanation \(per source[^*]*\*\*/, "").trim();
        mode = "meta";
        continue;
      }

      if (line.startsWith("**Where this comes from")) {
        q.whereFrom = line.replace(/^\*\*Where this comes from[^*]*\*\*/, "").trim();
        mode = "meta";
        continue;
      }

      if (mode === "perOption") {
        const m = raw.match(PER_OPTION_RE);
        if (m) q.perOption[m[1]] = m[2].trim();
        continue;
      }

      const opt = raw.match(OPTION_RE);
      if (opt) {
        q.options.push({ letter: opt[1], text: opt[2].trim() });
        mode = "options";
        continue;
      }

      if (mode === "options") continue; // wrapped option text is rare; ignore stray lines
      if (line) {
        stemLines.push(line);
        mode = "stem";
      } else if (mode === "stem") {
        stemLines.push("");
      }
    }

    q.stem = stemLines.join("\n").trim();
    return q;
  });
}

// ---------------------------------------------------------------------------
// Shaping into the app's Question type
// ---------------------------------------------------------------------------

interface AppQuestion {
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

/**
 * The correct option's own rationale, followed by why each distractor fails.
 * Both halves come verbatim from the source; nothing is invented here.
 */
function buildExplanation(q: ParsedQuestion): string {
  if (q.singleExplanation) return q.singleExplanation;

  const correct = q.correctLetters[0];
  const head = q.perOption[correct] || "";
  const others = q.options
    .filter((o) => o.letter !== correct && q.perOption[o.letter])
    .map((o) => `- **${o.letter}.** ${q.perOption[o.letter]}`);

  if (others.length === 0) return head;
  return `${head}\n\n**Why the other options are wrong**\n\n${others.join("\n")}`;
}

function buildTags(q: ParsedQuestion, extra: string[]): string[] {
  const tags = [...extra];
  const domain = q.sourceLine.match(/task-statement ref:\s*([A-Z0-9.]+)/);
  if (domain) tags.push(domain[1]);
  const title = q.sourceLine.match(/title:\s*"([^"]+)"/);
  if (title) tags.push(title[1]);
  if (q.quality) tags.push("source-ocr-damaged");
  return Array.from(new Set(tags));
}

interface BuildSpec {
  rawFile: string;
  jsonFile: string;
  sourceLabel: string;
  baseTags: string[];
}

const SPECS: BuildSpec[] = [
  {
    rawFile: "claudecertificationguide-mock-01.md",
    jsonFile: "claude-ccaf-mock-exam-1.json",
    sourceLabel: "Claude Certification Guide",
    baseTags: ["Claude CCAF", "Certification Guide", "Mock 1"],
  },
  {
    rawFile: "google-practice-exam-01.md",
    jsonFile: "claude-ccaf-mock-exam-2.json",
    sourceLabel: "Google Official Practice Exam",
    baseTags: ["Claude CCAF", "Google Practice Exam", "Mock 2"],
  },
  {
    rawFile: "exam-heist-sample-paper-01.md",
    jsonFile: "claude-ccaf-mock-exam-3.json",
    sourceLabel: "Exam Heist Sample Paper 01",
    baseTags: ["Claude CCAF", "Exam Heist", "Mock 3"],
  },
];

function build(spec: BuildSpec) {
  const parsed = parseSource(path.join(RAW_DIR, spec.rawFile));
  const skipped: string[] = [];
  const questions: AppQuestion[] = [];

  for (const q of parsed) {
    // The app scores one option per question, so "Select 3" items have no
    // representable answer. They stay in the markdown for study; they are not
    // shipped as scored mock questions.
    if (q.multiSelect || q.correctLetters.length !== 1) {
      skipped.push(`${q.ref} (multi-select)`);
      continue;
    }
    const correct = q.options.find((o) => o.letter === q.correctLetters[0]);
    if (!correct) {
      skipped.push(`${q.ref} (correct letter ${q.correctLetters[0]} not among options)`);
      continue;
    }
    if (q.options.length < 2 || !q.stem) {
      skipped.push(`${q.ref} (incomplete)`);
      continue;
    }

    questions.push({
      id: questions.length + 1,
      question: q.stem,
      options: q.options.map((o) => o.text),
      answer: correct.text,
      difficulty: "Medium",
      source: `${q.ref} / ${spec.sourceLabel}`,
      explanation: buildExplanation(q),
      examTrick: q.whereFrom,
      importance: "High",
      tags: buildTags(q, spec.baseTags),
    });
  }

  const jsonPath = path.join(MOCK_DIR, spec.jsonFile);
  const pack = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
  pack.questions = questions;
  fs.writeFileSync(jsonPath, JSON.stringify(pack, null, 2) + "\n", "utf8");

  console.log(
    `${spec.jsonFile}: parsed ${parsed.length}, wrote ${questions.length}` +
      (skipped.length ? `, skipped ${skipped.length} -> ${skipped.join("; ")}` : "")
  );

  return { pack, questions };
}

// ---------------------------------------------------------------------------

const built = SPECS.map(build);

// Mirror the same questions into the mobile bank, replacing its placeholder
// entries (same templated text, same RAW- refs) and leaving its other
// questions untouched.
const bank: any[] = JSON.parse(fs.readFileSync(MOBILE_BANK, "utf8"));
const isPlaceholder = (q: any) =>
  Array.isArray(q.options) && q.options.some((o: string) => /^Option [A-D] /.test(o));

const kept = bank.filter((q) => !isPlaceholder(q));
const mobileAdditions = built.flatMap(({ pack, questions }) =>
  questions.map((q) => ({
    ...q,
    subject: pack.subject,
    chapterName: pack.chapter,
    exam: pack.exam,
  }))
);

const mobileBank = [...kept, ...mobileAdditions].map((q, i) => ({ ...q, id: i + 1 }));
fs.writeFileSync(MOBILE_BANK, JSON.stringify(mobileBank, null, 2) + "\n", "utf8");

console.log(
  `ccafQuestions.json: dropped ${bank.length - kept.length} placeholders, ` +
    `added ${mobileAdditions.length} real questions, total ${mobileBank.length}`
);

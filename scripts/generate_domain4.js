import fs from 'fs';
import path from 'path';

console.log("Generating complete Claude CCAF Domain 4 question banks...");

const contentRoot = path.join(process.cwd(), 'content');

function writeChapter(domainFolder, filename, chapterData) {
  const targetDir = path.join(contentRoot, domainFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2), 'utf8');
  console.log(`Saved: ${domainFolder}/${filename} (${chapterData.questions.length} questions)`);
}

const d4Folder = 'Claude-CCAF-Prompt-Engineering';

// Domain 4 - Chapter 1: Explicit Criteria & False Positives
const d4_c1 = {
  subject: "Claude CCAF: Prompt Engineering & Structured Output",
  chapter: "4.1 Explicit Criteria, Formatting & False Positive Reduction",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "Transactional data preservation, XML section structuring, prompt specificity, and reducing false positives in evaluation.",
  questions: [
    {
      id: 1,
      question: "A prompt extracts invoice data (amount $1,247.83, date 2024-03-15, vendor Acme Corp) but the agent summarizes as \"approximately $1,200 mid-March from vendor\". What principle prevents lossy summarization?",
      options: [
        "Validation checking extracted data matches source document exactly.",
        "Schema constraints enforcing specific formats for amounts and dates.",
        "Never summarize transactional facts: preserve exact amounts, dates, IDs, names.",
        "More explicit instructions emphasizing precise extraction without summarization."
      ],
      answer: "Never summarize transactional facts: preserve exact amounts, dates, IDs, names.",
      difficulty: "Easy",
      source: "UD4-003 | Prompt engineering — be clear and direct · Structured outputs",
      explanation: "Transactional facts (currency amounts, ISO dates, order numbers, entity names) must be preserved verbatim. Approximations lose essential precision.",
      examTrick: "Core extraction rule: Never summarize transactional facts (IDs, dates, numbers, amounts).",
      importance: "High",
      tags: ["Extraction Principles", "Transactional Facts", "Precision"]
    },
    {
      id: 2,
      question: "Automated code review in CI/CD has a high false-positive rate; detailed criteria in the prompt doesn't reduce them. Which technique reduces false positives?",
      options: [
        "More explicit criteria defining exactly what constitutes a legitimate issue.",
        "Multiple review passes with a voting mechanism.",
        "Increase confidence threshold, requiring high-confidence findings only.",
        "Few-shot examples showing borderline cases with reasoning about accept vs reject."
      ],
      answer: "Few-shot examples showing borderline cases with reasoning about accept vs reject.",
      difficulty: "Hard",
      source: "UD4-006 | Multishot prompting · Prompt engineering overview",
      explanation: "When written criteria plateau, few-shot examples with annotated reasoning on borderline cases teach the exact discrimination boundary between true issues and acceptable code.",
      examTrick: "False positive plateau on detailed criteria = Few-shot borderline examples with reasoning.",
      importance: "High",
      tags: ["False Positives", "Borderline Examples", "Multishot"]
    },
    {
      id: 3,
      question: "A system prompt has 8 imperative instructions, with new rules appended at the bottom over time. Which change BEST improves long-term maintainability?",
      options: [
        "Convert the imperatives to declaratives so they read more naturally.",
        "Number the rules so each can be referenced by a stable index.",
        "Group related rules under XML-tagged sections.",
        "Lower temperature so the rules are applied more consistently."
      ],
      answer: "Group related rules under XML-tagged sections.",
      difficulty: "Easy",
      source: "BU4-005 | Use XML tags · System prompts",
      explanation: "XML tags (<rules>, <style>, <safety>) structure prompt sections cleanly, improving attention mechanisms and making additions modular.",
      examTrick: "Prompt organization & maintainability = Group rules under clear XML tags (<instructions>, <rules>).",
      importance: "High",
      tags: ["XML Tags", "System Prompts", "Prompt Hygiene"]
    },
    {
      id: 4,
      question: "A field the schema expects is simply not present in the source document. The extractor should:",
      options: [
        "Fill the field with a plausible value inferred from the rest of the document.",
        "Return null for that field and mark it as not found, leaving the rest of the extraction intact.",
        "Fail the entire extraction because one field is missing.",
        "Repeat the previous record value for that field."
      ],
      answer: "Return null for that field and mark it as not found, leaving the rest of the extraction intact.",
      difficulty: "Easy",
      source: "CS4-001 (§4.1) | Structured outputs · Be clear and direct",
      explanation: "Missing data should be reported faithfully as null/not found. Never hallucinate or infer absent fields.",
      examTrick: "Missing source data = Return null / mark as not found; never hallucinate or fail whole record.",
      importance: "High",
      tags: ["Missing Fields", "Null Handling", "Preventing Hallucinations"]
    }
  ]
};
writeChapter(d4Folder, 'chapter-01-explicit-criteria-and-false-positives.json', d4_c1);

// Domain 4 - Chapter 2: Few-Shot Prompting
const d4_c2 = {
  subject: "Claude CCAF: Prompt Engineering & Structured Output",
  chapter: "4.2 Few-Shot Prompting & Exemplar Engineering",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "Exemplar curation, multi-label classifications, handling compound skills, and prompt caching economics.",
  questions: [
    {
      id: 1,
      question: "\"Extract key information from document\" produces inconsistent extraction; different documents yield different field selection, and detailed instructions don't improve consistency. Which technique provides consistent extraction?",
      options: [
        "More detailed explicit criteria defining exactly which fields constitute \"key information\".",
        "Few-shot examples showing concrete input documents and expected extracted output.",
        "Multiple extraction passes voting on field selection.",
        "A validation loop rejecting inconsistent extractions until consistency is achieved."
      ],
      answer: "Few-shot examples showing concrete input documents and expected extracted output.",
      difficulty: "Easy",
      source: "UD4-001 | Multishot prompting",
      explanation: "Few-shot input-output examples ground abstract terms like 'key information' in concrete demonstrations, establishing consistent field selection.",
      examTrick: "Subjective/ambiguous task consistency = Few-shot input-output examples.",
      importance: "High",
      tags: ["Few-Shot Prompting", "Exemplars", "Consistent Extraction"]
    },
    {
      id: 2,
      question: "Commit messages in a strict team format — zero-shot with a precise spec, or few-shot with several examples? The task is common and well-defined, and it runs on every commit in a token-billed CI pipeline. BEST choice and why?",
      options: [
        "Few-shot, because it always outperforms zero-shot for structured output formatting.",
        "Zero-shot with a precise format specification, since well-defined common tasks can match few-shot performance while avoiding per-commit token bloat.",
        "One-shot as a middle ground.",
        "Few-shot but cache the example block to amortize the token cost."
      ],
      answer: "Zero-shot with a precise format specification, since well-defined common tasks can match few-shot performance while avoiding per-commit token bloat.",
      difficulty: "Medium",
      source: "BU4-001 (§4.2) | Multishot prompting · Prompt caching",
      explanation: "For well-defined, common standardized tasks (conventional commits), a precise zero-shot specification matches few-shot accuracy without incurring recurring token overhead per commit.",
      examTrick: "Common well-defined tasks in high-frequency CI = Zero-shot with precise specification.",
      importance: "High",
      tags: ["Zero-Shot vs Few-Shot", "Token Economics", "CI Cost"]
    },
    {
      id: 3,
      question: "A skills: string[] field shows three issues: compound phrases like \"Python and SQL\" sometimes kept as one entry; implied-but-unstated skills appearing; array lengths ranging 5–10 vs 40+ on similar documents. The prompt says \"Extract all skills mentioned.\" Most effective improvement?",
      options: [
        "Add few-shot examples demonstrating compound phrase handling, explicit mention criteria, and appropriate entry granularity.",
        "Add constraints: \"Extract 10–20 skills maximum, one skill per entry, only explicitly named skills.\"",
        "Post-extraction normalization mapping skills to a canonical taxonomy and deduplicating.",
        "Enrich the schema to {skill, confidence, source_quote}[] to capture extraction metadata."
      ],
      answer: "Add few-shot examples demonstrating compound phrase handling, explicit mention criteria, and appropriate entry granularity.",
      difficulty: "Hard",
      source: "CS4-002 (§4.2) | Multishot prompting · Structured outputs",
      explanation: "Granularity, compound phrase splitting, and explicit mention standards are best demonstrated through curated few-shot exemplars rather than arbitrary numeric caps.",
      examTrick: "List granularity / compound phrase splitting = Curated few-shot exemplars showing correct splitting.",
      importance: "High",
      tags: ["Array Extraction", "Granularity", "Few-Shot"]
    }
  ]
};
writeChapter(d4Folder, 'chapter-02-few-shot-prompting.json', d4_c2);

// Domain 4 - Chapter 3: Structured Output & JSON
const d4_c3 = {
  subject: "Claude CCAF: Prompt Engineering & Structured Output",
  chapter: "4.3 Structured Output, JSON Schemas & Strict Mode",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "JSON Schema compilation, output_config, strict mode, enums with 'other' escape hatches, and nullable fields.",
  questions: [
    {
      id: 1,
      question: "Output must strictly conform to a complex nested JSON schema with required and optional fields. Which approach guarantees schema-compliant output?",
      options: [
        "System prompt with explicit instructions to follow the schema exactly.",
        "Detailed schema description in the prompt with examples of valid JSON.",
        "Validation loop checking output against the schema, retrying until valid.",
        "Use tool_use function calling with a schema parameter enforcing valid structure."
      ],
      answer: "Use tool_use function calling with a schema parameter enforcing valid structure.",
      difficulty: "Easy",
      source: "UD4-002 | Structured outputs and strict tool use · Tool use",
      explanation: "tool_use with JSON schema (or output_config.format with strict: true) enforces schema constraints at token generation time, guaranteeing valid structural output.",
      examTrick: "Guaranteed JSON schema output = tool_use schema or output_config.format (strict: true).",
      importance: "High",
      tags: ["Structured Output", "tool_use", "strict: true"]
    },
    {
      id: 2,
      question: "payment_status enum is ['paid', 'pending', 'overdue'], but documents sometimes use \"processing\" or \"on_hold\" and extraction fails. How do you handle enumeration edge cases?",
      options: [
        "Expand the enum to include all possible payment status values comprehensively.",
        "Add an \"other\" enum value capturing statuses not in the predefined set.",
        "Remove the enum constraint, using a free-text string field.",
        "A validation loop retrying extraction until the status matches the enum."
      ],
      answer: "Add an \"other\" enum value capturing statuses not in the predefined set.",
      difficulty: "Medium",
      source: "UD4-008 | Structured outputs",
      explanation: "Open-ended real-world domains need an 'other' escape hatch in the enum (often paired with an other_detail string field) to prevent validation failures on unlisted values.",
      examTrick: "Open-ended enum domains = Add 'other' value + details string to avoid validation failures.",
      importance: "High",
      tags: ["Enums", "Escape Hatches", "Schema Design"]
    },
    {
      id: 3,
      question: "A required date field causes fabricated dates when the invoice date is unclear. How do you prevent data fabrication?",
      options: [
        "Use an optional or nullable date field in the schema, with an \"unclear\" enum for ambiguous cases.",
        "Add validation checking extracted dates against invoice content before acceptance.",
        "Stronger instructions emphasizing \"never fabricate information, only extract what exists\".",
        "Few-shot examples showing correct handling of missing dates."
      ],
      answer: "Use an optional or nullable date field in the schema, with an \"unclear\" enum for ambiguous cases.",
      difficulty: "Hard",
      source: "UD4-009 | Structured outputs · Tool use — input schemas",
      explanation: "Forcing required fields on data that may be missing creates structural pressure to fabricate. Making the field nullable or optional eliminates the fabrication incentive.",
      examTrick: "Prevent fabrication on missing data = Make field nullable/optional in schema.",
      importance: "High",
      tags: ["Fabrication Prevention", "Nullable Fields", "Schema Engineering"]
    },
    {
      id: 4,
      question: "A response must always be {\"status\": \"success\"|\"error\", \"data\": object, \"metadata\": object}, guaranteed on every response with no exceptions. Which approach provides the absolute strongest guarantee?",
      options: [
        "output_config with json_schema type, strict: true, and the specified schema.",
        "Few-shot examples showing 5 different correct JSON responses.",
        "System prompt with an explicit JSON template and instructions to follow it exactly.",
        "Tool definition with the schema and tool_choice forced to that tool."
      ],
      answer: "output_config with json_schema type, strict: true, and the specified schema.",
      difficulty: "Hard",
      source: "UD4-043 | Structured outputs · Messages API",
      explanation: "output_config.format with strict: true constrains the assistant's primary text response directly into the specified JSON grammar, providing the absolute strongest guarantee.",
      examTrick: "Absolute strongest response format guarantee = output_config with strict: true JSON schema.",
      importance: "High",
      tags: ["output_config", "strict: true", "Response Schemas"]
    }
  ]
};
writeChapter(d4Folder, 'chapter-03-structured-output-and-tool-use.json', d4_c3);

// Domain 4 - Chapter 4: Validation & Retry Loops
const d4_c4 = {
  subject: "Claude CCAF: Prompt Engineering & Structured Output",
  chapter: "4.4 Validation & Feedback Retry Loops",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "Evaluator-Optimizer patterns, structured failure feedback, bounded retry loops, and golden evaluation datasets.",
  questions: [
    {
      id: 1,
      question: "Claude generates a response, a separate validation step checks it against business rules, failures are fed back for correction, and this repeats until validation passes or a maximum attempt count is reached. What is this pattern called?",
      options: [
        "The convergence pattern",
        "The feedback pattern",
        "The validation-retry loop",
        "The retry pattern"
      ],
      answer: "The validation-retry loop",
      difficulty: "Easy",
      source: "UD4-033 | Building effective agents — evaluator-optimizer · Structured outputs",
      explanation: "The validation-retry loop combines deterministic verification against business rules with structured error feedback fed back to the generator over a bounded attempt budget.",
      examTrick: "Generate -> Validate -> Feed error back -> Retry = Validation-Retry Loop.",
      importance: "High",
      tags: ["Validation-Retry Loop", "Evaluator-Optimizer"]
    },
    {
      id: 2,
      question: "A validation-retry loop still fails on the same documents after three attempts each. In which situations will further retries not help?",
      options: [
        "The model placed a correct value in the wrong field on the last attempt.",
        "The required information is simply absent from the source document (or exists only in an external unprovided document).",
        "The validation service timed out on the last attempt.",
        "The prompt format had minor whitespace variations."
      ],
      answer: "The required information is simply absent from the source document (or exists only in an external unprovided document).",
      difficulty: "Medium",
      source: "UD4-049 | Building effective agents · Structured outputs",
      explanation: "Retries cannot recover information that does not exist in context. Retrying missing data causes loops to hit max attempts or hallucinate values.",
      examTrick: "Retries fail when required data is absent from input context.",
      importance: "High",
      tags: ["Retry Limits", "Missing Data"]
    }
  ]
};
writeChapter(d4Folder, 'chapter-04-validation-and-retry-loops.json', d4_c4);

// Domain 4 - Chapter 5: Batch Processing & Multi-Pass
const d4_c5 = {
  subject: "Claude CCAF: Prompt Engineering & Structured Output",
  chapter: "4.5 Batch Processing Strategy & Multi-Pass Pipelines",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "Message Batches API (50% discount, 24h SLA), custom_id correlation, latency vs cost tradeoffs, and multi-pass chunking.",
  questions: [
    {
      id: 1,
      question: "Documents arrive continuously through business hours; you want the Batch API (50% discount, up-to-24-hour window). The SLA requires results within 30 hours of document arrival at 99.9% reliability. Which batching strategy is most appropriate?",
      options: [
        "Submit batches every 6 hours containing documents from that window.",
        "Submit a single batch at end of day containing all documents from that day.",
        "Submit batches every 4 hours containing documents from that window.",
        "Use the real-time API for all documents instead of batch processing."
      ],
      answer: "Submit batches every 4 hours containing documents from that window.",
      difficulty: "Hard",
      source: "CS4-001 (§4.5) | Batch processing · Message Batches API",
      explanation: "Worst case latency = Max Queue Wait + 24h processing window. 4h wait + 24h processing = 28h worst-case (providing 2h safety margin against the 30h SLA). A 6h wait leaves zero margin (30h exact).",
      examTrick: "Batch SLA math: Worst-case latency = Batch interval + 24h processing window.",
      importance: "High",
      tags: ["Batch API", "SLA Calculations", "Cost Optimization"]
    },
    {
      id: 2,
      question: "Two document types share a schema: standard monthly reports (archived after processing) and urgent exception reports (must trigger alerts within 30 minutes). Minimise API cost while meeting latency. How should the pipeline be architected?",
      options: [
        "Submit all documents to the real-time Messages API for consistent latency.",
        "Submit all to the Batch API with custom_ids; when results arrive, immediately process urgent documents and trigger delayed alerts.",
        "Queue all documents and submit hourly batches, flagging urgent documents for expedited handling when results return.",
        "Route standard reports to the Batch API for 50% cost savings, and route urgent exception reports to the real-time Messages API."
      ],
      answer: "Route standard reports to the Batch API for 50% cost savings, and route urgent exception reports to the real-time Messages API.",
      difficulty: "Medium",
      source: "CS4-002 (§4.5) | Batch processing · Messages API",
      explanation: "Split routing by latency SLA: standard reports capture the 50% Batch API discount over 24h, while urgent sub-30-minute alerts use the real-time Messages API.",
      examTrick: "Hybrid batch routing: Real-time API for low-latency alerts (<1h); Batch API for bulk tolerant work (24h).",
      importance: "High",
      tags: ["Hybrid Batch Routing", "Cost vs Latency"]
    }
  ]
};
writeChapter(d4Folder, 'chapter-05-batch-processing-and-multi-pass.json', d4_c5);

console.log("Domain 4 completed successfully!");

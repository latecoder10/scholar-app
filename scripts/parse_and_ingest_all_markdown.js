import fs from 'fs';
import path from 'path';

const contentRoot = path.join(process.cwd(), 'content');
const rawPoolsDir = path.join(process.cwd(), 'raw_pools');

// Map domain prefixes to folders and Subject metadata
const domainMeta = {
  1: {
    folder: 'Claude-CCAF-Agentic-Architecture',
    subject: 'Claude CCAF: Agentic Architecture & Orchestration',
    paper: 'Domain-1',
    chapters: {
      '1.1': { title: '1.1 Agentic Loops, stop_reason & Loop Termination', file: 'chapter-01-agentic-loops-and-orchestration.json', desc: 'Control loops, stop_reason (tool_use vs end_turn), spinning detection, and streaming block routing.' },
      '1.2': { title: '1.2 Coordinator / Subagent Orchestration & Topologies', file: 'chapter-02-coordinator-subagent-orchestration.json', desc: 'Hub-and-spoke vs pipeline topologies, centralized error propagation, fan-in synthesis, and failure isolation.' },
      '1.3': { title: '1.3 Subagent Invocation & Context Passing', file: 'chapter-03-subagent-invocation-and-context-passing.json', desc: 'Context isolation, Task tool dispatch, least-privilege tool scoping, and indirect injection blast-radius containment.' },
      '1.4': { title: '1.4 Workflow Enforcement & Handoff Protocols', file: 'chapter-04-workflow-enforcement-and-handoffs.json', desc: 'Programmatic prerequisite gating, server-side PreToolUse hooks, numerical threshold enforcement, and self-contained human handoff summaries.' },
      '1.5': { title: '1.5 Agent SDK Hooks & Security Lifecycles', file: 'chapter-05-agent-sdk-hooks-and-security.json', desc: 'Lifecycle matchers, output normalization, exit codes (code 2 deny), and fail-closed security defaults.' },
      '1.6': { title: '1.6 Task Decomposition Strategies & DAG Scheduling', file: 'chapter-06-task-decomposition-and-planning.json', desc: 'DAG dependency graphs, adaptive vs prompt-chaining workflows, over-decomposition hazards, and goal drift prevention.' },
      '1.7': { title: '1.7 Session State, Resumption & Forking', file: 'chapter-07-session-state-resumption-and-forking.json', desc: 'Session persistence, --resume vs --continue, fork_session, and checkpoint recovery.' },
      'duplicates': { title: '1.8 Supplementary Exam Practice', file: 'chapter-08-supplementary-exam-practice.json', desc: 'Supplementary multi-agent reliability and voting fan-in questions.' }
    }
  },
  2: {
    folder: 'Claude-CCAF-MCP-Tool-Design',
    subject: 'Claude CCAF: Tool Design & MCP Integration',
    paper: 'Domain-2',
    chapters: {
      '2.1': { title: '2.1 Tool Interface & JSON Schema Design', file: 'chapter-01-tool-interface-design.json', desc: '3-part descriptions, JSON schema types, strict: true grammar compilation, enums, additionalProperties: false, and disable_parallel_tool_use.' },
      '2.2': { title: '2.2 Structured Error Handling & Idempotency', file: 'chapter-02-structured-error-handling.json', desc: 'isError protocol flags, empty result sets vs execution failures, 4-field error schemas, and circuit breakers.' },
      '2.3': { title: '2.3 Tool Distribution & tool_choice Modes', file: 'chapter-03-tool-distribution-and-selection.json', desc: 'tool_choice modes (auto, any, tool, none), role-scoped catalogs, and defer_loading with tool search.' },
      '2.4': { title: '2.4 MCP Server Integration & Protocols', file: 'chapter-04-mcp-server-integration.json', desc: 'Prompts vs Tools vs Resources primitives, STDIO vs StreamableHTTP transports, Roots, Sampling, and plugin distribution via SCIM RBAC.' },
      '2.5': { title: '2.5 Built-in Tools vs Custom Client Tools', file: 'chapter-05-builtin-and-client-tools.json', desc: 'Server tools (web_search, code_execution) vs Client tools (bash, text_editor, computer_use), Glob vs Grep, and Read-Modify-Write fallbacks.' }
    }
  },
  3: {
    folder: 'Claude-CCAF-Claude-Code-Workflows',
    subject: 'Claude CCAF: Claude Code Configuration & Workflows',
    paper: 'Domain-3',
    chapters: {
      '3.1': { title: '3.1 CLAUDE.md Hierarchy & Memory Management', file: 'chapter-01-claude-hierarchy-and-memory.json', desc: 'Root vs subdirectory inheritance, managed settings precedence, and permission deny rule union.' },
      '3.2': { title: '3.2 Slash Commands & Custom Skills', file: 'chapter-02-slash-commands-and-skills.json', desc: 'Custom commands in .claude/commands/, $ARGUMENTS and positional substitutions, SKILL.md, and context: fork.' },
      '3.3': { title: '3.3 Path-Specific Rules & Glob Scoping', file: 'chapter-03-path-specific-rules.json', desc: 'Glob-scoped rules in .claude/rules/ for multi-language repositories (Prettier vs rustfmt).' },
      '3.4': { title: '3.4 Plan Mode & Model Selection Matrix', file: 'chapter-04-plan-mode-and-model-selection.json', desc: 'Explicit plan mode toggles, interactive gates, and model tier allocation (Sonnet default + Opus for deep architecture).' },
      '3.5': { title: '3.5 Iterative Refinement & Code Review Techniques', file: 'chapter-05-iterative-refinement-techniques.json', desc: 'Multi-pass review architecture (per-file local analysis + cross-file integration pass) and independent evaluator instances.' },
      '3.6': { title: '3.6 CI/CD & Enterprise Deployment Standards', file: 'chapter-06-ci-cd-and-enterprise-deployment.json', desc: 'Headless non-interactive execution (-p), hermetic CI execution (--bare), and audit logging.' }
    }
  },
  4: {
    folder: 'Claude-CCAF-Prompt-Engineering',
    subject: 'Claude CCAF: Prompt Engineering & Structured Output',
    paper: 'Domain-4',
    chapters: {
      '4.1': { title: '4.1 Explicit Criteria & False-Positive Reduction', file: 'chapter-01-explicit-criteria-and-false-positives.json', desc: 'Transactional data preservation, XML tag sectioning, and borderline few-shot curation.' },
      '4.2': { title: '4.2 Few-Shot Prompting & Edge Case Calibration', file: 'chapter-02-few-shot-prompting.json', desc: 'Complex array extraction, compound skill splitting, and zero-shot vs few-shot token economics.' },
      '4.3': { title: '4.3 Structured Output & JSON Schemas', file: 'chapter-03-structured-output-and-tool-use.json', desc: 'Strict tool use grammar enforcement, output formatting, open-ended enum other escape hatches, and nullable fields.' },
      '4.4': { title: '4.4 Validation & Retry Loops', file: 'chapter-04-validation-and-retry-loops.json', desc: 'Evaluator-Optimizer feedback loops, bounded attempts, and missing data detection.' },
      '4.5': { title: '4.5 Batch Processing Strategy & Economics', file: 'chapter-05-batch-processing-and-multi-pass.json', desc: 'Message Batches API (50% discount, 24h SLA), custom_id correlation, and latency-based routing.' },
      '4.6': { title: '4.6 Multi-Instance & Multi-Pass Evaluation', file: 'chapter-06-multi-instance-and-multi-pass.json', desc: 'Multi-instance evaluation and complex multi-issue decomposition workflows.' }
    }
  },
  5: {
    folder: 'Claude-CCAF-Context-Reliability',
    subject: 'Claude CCAF: Context Management & Reliability',
    paper: 'Domain-5',
    chapters: {
      '5.1': { title: '5.1 Context Dynamics, Compaction & Prompt Caching', file: 'chapter-01-context-preservation-and-compaction.json', desc: 'Sliding windows, compaction, persistent structured fact blocks, lost-in-the-middle mitigations, and prompt caching breakpoints.' },
      '5.2': { title: '5.2 Escalation Triggers & Ambiguity Resolution', file: 'chapter-02-escalation-and-ambiguity-resolution.json', desc: 'Explicit escalation triggers, human-in-the-loop gates, ambiguity vs irreversibility, and policy gap handling.' },
      '5.3': { title: '5.3 Multi-Agent Error Propagation & Resilience', file: 'chapter-03-error-propagation-and-recovery.json', desc: 'Token bucket rate limiting, graceful degradation on partial outages, and non-retryable error classification.' },
      '5.4': { title: '5.4 Large Codebase Context Management & Chunking', file: 'chapter-04-large-codebase-context-management.json', desc: 'Explore subagents, selective payload projection, multi-file investigation partitioning, and scratchpads.' },
      '5.5': { title: '5.5 Human Review & Confidence Calibration', file: 'chapter-05-human-review-and-confidence-calibration.json', desc: 'Confidence score calibration on labeled datasets, out-of-distribution format detection, and stratified review sampling.' },
      '5.6': { title: '5.6 Provenance, Attribution & Multi-Source Uncertainty', file: 'chapter-06-provenance-and-uncertainty.json', desc: 'Claim-to-source mappings, custom_id batch correlation, temporal trend reconciliation, and amendment handling.' }
    }
  }
};

function cleanMarkdown(text) {
  if (!text) return "";
  return text.trim();
}

function parseMarkdownFile(filePath, domainNum) {
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.split('\n');

  let currentSection = null;
  const sections = {}; // sectionKey -> Array of questions

  let currentQuestion = null;
  let inOptions = false;
  let inWhyCorrect = false;
  let inWhyOthersFail = false;
  let inSource = false;
  let whyCorrectText = [];
  let whyOthersFailText = [];
  let sourceText = [];

  function commitCurrentQuestion() {
    if (!currentQuestion || !currentSection) return;
    
    // Assemble explanation
    let fullExplanation = "";
    if (whyCorrectText.length > 0) {
      fullExplanation += whyCorrectText.join('\n').trim();
    }
    if (whyOthersFailText.length > 0) {
      if (fullExplanation) fullExplanation += "\n\n";
      fullExplanation += "Why distractors fail:\n" + whyOthersFailText.join('\n').trim();
    }

    currentQuestion.explanation = fullExplanation || "Refer to Anthropic Claude documentation.";
    currentQuestion.source = sourceText.join(' ').replace(/\[([^\]]+)\]\([^)]+\)/g, '$1').trim() || `${currentQuestion.source || 'Anthropic CCAF Standard'}`;
    
    // Generate an exam trick based on the answer and explanation if not present
    if (!currentQuestion.examTrick) {
      const summaryReason = whyCorrectText.join(' ').replace(/\*\*/g, '').slice(0, 140);
      currentQuestion.examTrick = `Exam Rule: ${currentQuestion.answer.slice(0, 70)} — ${summaryReason || 'Focus on protocol signals and deterministic constraints.'}`;
    }

    // Ensure options is array of 4 clean strings
    if (!Array.isArray(currentQuestion.options) || currentQuestion.options.length === 0) {
      currentQuestion.options = ["Option A", "Option B", "Option C", "Option D"];
    }

    // Resolve exact answer string matching one of the options
    const rawAns = currentQuestion.rawAnswerKey || "";
    let matchedOption = null;

    // Check if rawAns starts with A, B, C, D
    const letterMatch = rawAns.match(/^([A-D])\b/i);
    if (letterMatch) {
      const letterIndex = letterMatch[1].toUpperCase().charCodeAt(0) - 65;
      if (currentQuestion.options[letterIndex]) {
        matchedOption = currentQuestion.options[letterIndex];
      }
    }

    if (!matchedOption) {
      // Try to find matching option by text
      for (const opt of currentQuestion.options) {
        if (rawAns.toLowerCase().includes(opt.toLowerCase()) || opt.toLowerCase().includes(rawAns.toLowerCase())) {
          matchedOption = opt;
          break;
        }
      }
    }

    currentQuestion.answer = matchedOption || currentQuestion.options[0];
    delete currentQuestion.rawAnswerKey;

    if (!sections[currentSection]) {
      sections[currentSection] = [];
    }
    currentQuestion.id = sections[currentSection].length + 1;
    sections[currentSection].push(currentQuestion);

    // Reset accumulators
    currentQuestion = null;
    inOptions = false;
    inWhyCorrect = false;
    inWhyOthersFail = false;
    inSource = false;
    whyCorrectText = [];
    whyOthersFailText = [];
    sourceText = [];
  }

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Section header detection (e.g., ## 1.1 — Agentic loops...)
    const secMatch = line.match(/^##\s+([0-9]+\.[0-9]+|duplicate)/i);
    if (secMatch) {
      commitCurrentQuestion();
      currentSection = secMatch[1].toLowerCase();
      continue;
    }

    // Question header detection (e.g., ### UD1-005 or ### QD1-02 or ### BU1-001)
    const qHeaderMatch = line.match(/^###\s+([A-Z0-9_-]+)/i);
    if (qHeaderMatch) {
      commitCurrentQuestion();
      const qCode = qHeaderMatch[1];
      currentQuestion = {
        question: "",
        options: [],
        rawAnswerKey: "",
        answer: "",
        difficulty: "Medium",
        source: qCode,
        explanation: "",
        examTrick: "",
        importance: "High",
        tags: ["CCAF", `Domain-${domainNum}`, currentSection || `Section-${domainNum}`]
      };
      continue;
    }

    if (!currentQuestion) continue;

    // Question text detection
    if (line.startsWith('**Q.**') || line.startsWith('**Q:**') || (line.startsWith('Q.') && !currentQuestion.question)) {
      currentQuestion.question = line.replace(/^\*\*Q[:.]\*\*\s*|^Q\.\s*/, '').trim();
      inOptions = false;
      inWhyCorrect = false;
      inWhyOthersFail = false;
      inSource = false;
      continue;
    }

    // Option lines: - A. ... or - **A** ... or A. ...
    const optMatch = line.match(/^[-*]?\s*([A-D])\.\s*(.+)/);
    if (optMatch) {
      inOptions = true;
      inWhyCorrect = false;
      inWhyOthersFail = false;
      inSource = false;
      const optText = optMatch[2].trim();
      currentQuestion.options.push(optText);
      continue;
    }

    // Answer line: **✅ Answer: A** or **✅ Answer: B (No)**
    const ansMatch = line.match(/\*\*✅\s*Answer:\s*([^*]+)\*\*/i) || line.match(/✅\s*Answer:\s*(.+)/i);
    if (ansMatch) {
      inOptions = false;
      currentQuestion.rawAnswerKey = ansMatch[1].trim();
      continue;
    }

    // Why it's correct section
    if (line.match(/\*\*Why it's correct\.\*\*/i) || line.match(/\*\*Why they're correct\.\*\*/i)) {
      inWhyCorrect = true;
      inWhyOthersFail = false;
      inSource = false;
      const rest = line.replace(/\*\*Why (it's|they're) correct\.\*\*\s*/i, '').trim();
      if (rest) whyCorrectText.push(rest);
      continue;
    }

    // Why the others fail section
    if (line.match(/\*\*Why (the others|the other options) fail\.\*\*/i) || line.match(/\*\*Why "Yes" fails\.\*\*/i)) {
      inWhyCorrect = false;
      inWhyOthersFail = true;
      inSource = false;
      const rest = line.replace(/\*\*Why [^*]+\*\*\s*/i, '').trim();
      if (rest) whyOthersFailText.push(rest);
      continue;
    }

    // Source line
    if (line.match(/\*\*Source\.\*\*/i) || line.match(/^Source\./i)) {
      inWhyCorrect = false;
      inWhyOthersFail = false;
      inSource = true;
      const rest = line.replace(/\*\*Source\.\*\*\s*|^Source\.\s*/i, '').trim();
      if (rest) sourceText.push(rest);
      continue;
    }

    // Continuation lines
    if (inWhyCorrect) {
      if (line.trim()) whyCorrectText.push(line.trim());
    } else if (inWhyOthersFail) {
      if (line.trim()) whyOthersFailText.push(line.trim());
    } else if (inSource) {
      if (line.trim()) sourceText.push(line.trim());
    } else if (!inOptions && currentQuestion.question && !currentQuestion.options.length && !currentQuestion.rawAnswerKey) {
      // Additional lines of question stem
      if (line.trim() && !line.startsWith('---')) {
        currentQuestion.question += ' ' + line.trim();
      }
    }
  }

  commitCurrentQuestion();
  return sections;
}

console.log("Starting comprehensive parsing of all 5 CCAF domains from markdown pools...");

let grandTotal = 0;

for (let d = 1; d <= 5; d++) {
  const poolFile = path.join(rawPoolsDir, `D${d}.md`);
  if (!fs.existsSync(poolFile)) {
    console.log(`Skipping D${d}.md (not found)`);
    continue;
  }

  console.log(`\n========================================`);
  console.log(`Processing Domain ${d}...`);
  const domainInfo = domainMeta[d];
  const targetFolder = path.join(contentRoot, domainInfo.folder);
  if (!fs.existsSync(targetFolder)) {
    fs.mkdirSync(targetFolder, { recursive: true });
  }

  const sections = parseMarkdownFile(poolFile, d);
  let domainQuestionCount = 0;

  for (const [secKey, secQuestions] of Object.entries(sections)) {
    const chapterCfg = domainInfo.chapters[secKey] || {
      title: `${secKey} In-Depth Exam Questions`,
      file: `chapter-${secKey.replace('.', '-')}.json`,
      desc: `Comprehensive domain questions covering task statement ${secKey}.`
    };

    const chapterData = {
      subject: domainInfo.subject,
      chapter: chapterCfg.title,
      exam: "Claude CCAF",
      paper: domainInfo.paper,
      description: chapterCfg.desc,
      questions: secQuestions
    };

    const targetFile = path.join(targetFolder, chapterCfg.file);
    fs.writeFileSync(targetFile, JSON.stringify(chapterData, null, 2), 'utf8');
    console.log(`  -> Chapter ${secKey} (${chapterCfg.file}): ${secQuestions.length} questions`);
    domainQuestionCount += secQuestions.length;
  }

  console.log(`Domain ${d} Total: ${domainQuestionCount} questions`);
  grandTotal += domainQuestionCount;
}

console.log(`\n========================================`);
console.log(`🎉 INGESTION COMPLETE!`);
console.log(`Total CCAF Questions in System: ${grandTotal}`);

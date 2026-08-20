/**
 * Master Ingestion File for Claude CCAF Question Bank
 * Ingests all RAW-CG1 (60Q), RAW-GQ (60Q), RAW-EH (53Q), RAW-CG2 (28Q), and RAW-ET (40Q) datasets.
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

// Helper to write JSON
function writeChapter(dirName: string, fileName: string, data: any) {
  const fullDir = path.join(CONTENT_DIR, dirName);
  if (!fs.existsSync(fullDir)) {
    fs.mkdirSync(fullDir, { recursive: true });
  }
  fs.writeFileSync(path.join(fullDir, fileName), JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved ${dirName}/${fileName} (${data.questions.length} questions)`);
}

// -------------------------------------------------------------
// MOCK 1: Claude Certification Guide 60 Questions (RAW-CG1-001 to 060)
// -------------------------------------------------------------
const mock1Questions = [
  {
    id: 1,
    question: "An MCP server exposes a query_database tool for Snowflake. Agents ignore it and run SQL via the built-in Bash tool against the Snowflake CLI, even though the MCP tool returns structured results with column types and pagination that Bash does not. What is the most likely cause and fix?",
    options: [
      "The MCP server is not properly connected. Restart the MCP server and verify the connection with a test query.",
      "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
      "Disable the Bash tool entirely so the agent is forced to use the MCP tool for all operations.",
      "Add a system prompt instruction telling the agent to always use query_database instead of Bash for SQL queries."
    ],
    answer: "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
    difficulty: "Medium",
    source: "RAW-CG1-001 / Lesson 2.4",
    explanation: "When MCP tool descriptions are sparse, agents default to the familiar Bash tool. Enhancing the description to explain structured results, column types, and pagination gives the agent sufficient semantic signal to prefer the MCP tool.",
    examTrick: "Sparse description = Agent defaults to familiar general tools. Differentiate descriptions explicitly.",
    importance: "High",
    tags: ["MCP Server Integration", "Tool Descriptions", "Semantic Routing"]
  },
  {
    id: 2,
    question: "A multi-agent research system must process a customer's request that involves three sequential stages: data collection, analysis, and report generation. Each stage depends on the output of the previous one. Which orchestration pattern is most appropriate?",
    options: [
      "Parallel orchestration — run all three subagents simultaneously to minimise latency",
      "Pipeline orchestration — pass the output of each stage as input to the next in a defined sequence",
      "Dynamic adaptive decomposition — let the coordinator decide the order at runtime based on query complexity",
      "Hub-and-spoke with all three agents reporting independently to the coordinator"
    ],
    answer: "Pipeline orchestration — pass the output of each stage as input to the next in a defined sequence",
    difficulty: "Easy",
    source: "RAW-CG1-002 / Lesson 1.2",
    explanation: "Pipeline orchestration is the correct pattern for sequential dependencies where each stage completes before the next begins, with the output of one serving as input to the next.",
    examTrick: "Strict sequential dependency chain (A -> B -> C) = Pipeline Orchestration.",
    importance: "High",
    tags: ["Multi-Agent Orchestration", "Pipeline Pattern", "Workflow Design"]
  },
  {
    id: 3,
    question: "The moderation system's classification schema has a 'category' field defined as a free-text string. Auditors find 47 different category values in production data, including 'hate speech', 'Hate Speech', 'hate-speech', 'hateful content', and 'hate_speech' — all intended to be the same category. This makes downstream analytics and routing unreliable. What is the best schema fix?",
    options: [
      "Add a post-processing normalisation step that maps all variations to canonical category names",
      "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', and 'harassment', plus an 'other' option.",
      "Add detailed instructions to the prompt listing the exact category names and their capitalisation so the model always emits the canonical string.",
      "Add few-shot examples showing the correct category formatting for each type"
    ],
    answer: "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', and 'harassment', plus an 'other' option.",
    difficulty: "Medium",
    source: "RAW-CG1-003 / Lesson 4.2",
    explanation: "Enum fields constrain the model to predefined values at schema generation time, eliminating spelling and formatting variations deterministically.",
    examTrick: "Free-text drift / category variations = Enum schema constraint.",
    importance: "High",
    tags: ["Structured Output", "JSON Schema", "Enums"]
  },
  {
    id: 4,
    question: "A research agent calls an external API via an MCP server. After the 30th query in a batch of 50, the API starts returning HTTP 429 errors. The MCP server returns a generic 'Request failed' for every failure, so the agent abandons the batch after three consecutive failures. What MCP server change would most improve resilience?",
    options: [
      "Implement automatic retry with exponential backoff inside the MCP server, hiding rate limits from the agent entirely.",
      "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait.",
      "Return errorCategory: 'business', isRetryable: false to tell the agent to stop making requests entirely.",
      "Queue all 50 requests at the MCP server level and process them sequentially with built-in rate limiting."
    ],
    answer: "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait.",
    difficulty: "Hard",
    source: "RAW-CG1-004 / Lesson 2.2",
    explanation: "Rate limiting is a transient error that resolves after a delay. Structured metadata with retryAfterMs lets the agent space out remaining queries intelligently rather than abandoning the batch.",
    examTrick: "HTTP 429 Rate Limits = Transient + isRetryable: true + retryAfterMs.",
    importance: "High",
    tags: ["MCP Error Handling", "Rate Limiting", "Structured Errors"]
  },
  {
    id: 5,
    question: "Your manager proposes switching both your blocking pre-merge code review and your overnight technical debt report to the Message Batches API for 50% cost savings. How should you evaluate this proposal?",
    options: [
      "Switch both to batch processing with status polling to check for completion",
      "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks",
      "Keep real-time calls for both to avoid batch result ordering issues",
      "Switch both to batch with a timeout fallback to real-time if batches take too long"
    ],
    answer: "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks",
    difficulty: "Medium",
    source: "RAW-CG1-005 / Lesson 4.5",
    explanation: "Pre-merge checks are blocking workflows where developers wait (requires real-time latency). Technical debt reports are overnight and latency-tolerant (up to 24 hours), making them ideal for the Batches API.",
    examTrick: "Interactive / blocking workflows = Real-time API. Overnight / asynchronous = Message Batches API (50% off).",
    importance: "High",
    tags: ["Message Batches API", "Cost Optimization", "Latency SLAs"]
  },
  {
    id: 6,
    question: "A web search subagent in a multi-agent research system times out while researching a complex topic. You need to design how this failure information flows back to the coordinator. Which approach best enables intelligent recovery?",
    options: [
      "Return structured error context including failure type, attempted query, partial results, and potential alternative approaches",
      "Implement automatic retry with exponential backoff, returning a generic 'search unavailable' status only after all retries are exhausted",
      "Catch the timeout and return an empty result set marked as successful",
      "Propagate the timeout exception to a top-level handler that terminates the entire research workflow"
    ],
    answer: "Return structured error context including failure type, attempted query, partial results, and potential alternative approaches",
    difficulty: "Medium",
    source: "RAW-CG1-006 / Lesson 5.3",
    explanation: "Returning structured error context (failure type, query, partial findings, alternatives) equips the coordinator with actionable intelligence to re-route or recover without crashing the pipeline.",
    examTrick: "Subagent error propagation = Structured error context (failure type + partial findings + attempted query).",
    importance: "High",
    tags: ["Error Propagation", "Multi-Agent Systems", "Resilience"]
  },
  {
    id: 7,
    question: "The moderation system's agentic loop uses a hardcoded decision tree: if the classify_content tool returns 'hate_speech', always call escalate_to_human; if it returns 'spam', always call auto_remove. During testing, the team discovers that satirical posts criticising hate speech are being auto-escalated, and sophisticated spam disguised as legitimate marketing slips through. What is the architectural problem?",
    options: [
      "The classify_content tool needs more granular category labels so it can tell satire criticising hate speech apart from genuine hate speech.",
      "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh the full context of each post before it acts.",
      "Add a confidence threshold so only high-confidence classifications trigger automatic actions",
      "Route all ambiguous cases to human review to avoid misclassification"
    ],
    answer: "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh the full context of each post before it acts.",
    difficulty: "Medium",
    source: "RAW-CG1-007 / Lesson 1.1",
    explanation: "Hardcoded decision trees fail on nuanced context (satire, complex spam). An agentic loop should allow the LLM to reason dynamically over the full context rather than routing via rigid if-else branches.",
    examTrick: "Nuanced context failure = Replace rigid hardcoded decision tree with model-driven reasoning loop.",
    importance: "High",
    tags: ["Agentic Loops", "Model-Driven Decisions", "Anti-Patterns"]
  },
  {
    id: 8,
    question: "A documentation team needs to simultaneously update API reference docs for three independent microservices after a breaking change. Each update requires reading source code, updating Markdown files, and validating links. A single Claude Code session would exhaust the context window trying to hold all three services' code simultaneously. What is the recommended approach?",
    options: [
      "Process the three services sequentially in the same session, running /compact between each service to free context",
      "Use git worktree for three branches, each with its own Claude Code session on one service, then merge the results",
      "Create a single skill with context: fork that processes all three services in parallel within one session",
      "Split the documentation files into smaller chunks and process each chunk in a separate API call using the batch API"
    ],
    answer: "Use git worktree for three branches, each with its own Claude Code session on one service, then merge the results",
    difficulty: "Hard",
    source: "RAW-CG1-008 / Lesson 3.6",
    explanation: "git worktree creates isolated working directories on separate branches. Each gets a fresh, dedicated Claude Code session with full context window budget, running concurrently without interference.",
    examTrick: "Multi-service codebase updates with context limits = Git worktrees + parallel Claude Code sessions.",
    importance: "High",
    tags: ["Claude Code", "Git Worktrees", "Context Budgeting"]
  },
  {
    id: 9,
    question: "The data platform team has built an MCP server with 22 tools: query_snowflake, query_postgres, query_api, plus 19 specialised tools for individual data transformations (pivot_table, calculate_percentile, normalise_currency, etc.). Agents take 3-4 turns to select the correct tool and frequently choose the wrong transformation. What is the most effective redesign?",
    options: [
      "Improve all 22 tool descriptions with detailed examples and boundary conditions to help the agent distinguish between them.",
      "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.",
      "Use tool_choice: 'any' to force the agent to always call a tool, eliminating turns where the agent reasons without acting.",
      "Split the tools across two separate MCP servers — one for queries and one for transformations — to reduce cognitive load."
    ],
    answer: "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.",
    difficulty: "Medium",
    source: "RAW-CG1-009 / Lesson 2.3",
    explanation: "Tool selection accuracy degrades sharply when tool count exceeds 4-5 tools per agent. Consolidating 19 similar transformation tools into a single parameterized tool restores high reliability.",
    examTrick: "Too many micro-tools (15+ tools) = Consolidate into parameterized tools (4-5 tools max per agent).",
    importance: "High",
    tags: ["Tool Design", "Tool Overload", "Consolidation"]
  },
  {
    id: 10,
    question: "A documentation team creates a /generate-api-docs skill that reads source code files and produces Markdown API reference pages. The skill generates verbose output (200+ lines per endpoint) and should be available to every team member who clones the repository. How should the skill be configured?",
    options: [
      "Create a SKILL.md in ~/.claude/skills/ with context: fork frontmatter, and instruct each team member to copy it locally",
      "Create a SKILL.md in .claude/skills/ with context: fork, so it is shared via git and isolates the verbose output",
      "Add the documentation generation instructions to the root CLAUDE.md so they load automatically in every session",
      "Create a SKILL.md in .claude/skills/ without any frontmatter, relying on the team to manually manage context overflow"
    ],
    answer: "Create a SKILL.md in .claude/skills/ with context: fork, so it is shared via git and isolates the verbose output",
    difficulty: "Medium",
    source: "RAW-CG1-010 / Lesson 3.2",
    explanation: "`.claude/skills/` is project-scoped and committed to Git (shared across the team). `context: fork` isolates verbose generated output to a sub-context, protecting the main session context.",
    examTrick: "Team-shared skill with verbose output = `.claude/skills/` + `context: fork`.",
    importance: "High",
    tags: ["Custom Skills", "Context Forking", "Team Scoping"]
  },
  {
    id: 11,
    question: "Claude Code is synthesising release notes from commit messages, PR descriptions, and changelog entries. During a 200+ commit session, summaries of early commits become vague ('various bug fixes') while recent commits are still detailed accurately. The context window is not full. What is the most likely cause?",
    options: [
      "The model's temperature is set too high, causing it to generate vague summaries randomly",
      "The lost-in-the-middle effect: the model favours the start and end of long input, losing middle commit detail.",
      "The commit messages for early commits are inherently less detailed than recent ones, so the vague summaries are accurate",
      "Claude Code applies progressive summarisation to older commits to conserve context for recent ones"
    ],
    answer: "The lost-in-the-middle effect: the model favours the start and end of long input, losing middle commit detail.",
    difficulty: "Medium",
    source: "RAW-CG1-011 / Lesson 5.1",
    explanation: "The lost-in-the-middle effect occurs in long input contexts where LLMs attend heavily to the beginning and end of sequences while attention drops in the middle.",
    examTrick: "Vagueness in middle/early sections of long lists = Lost-in-the-middle effect.",
    importance: "High",
    tags: ["Context Reliability", "Lost in the Middle", "Attention Dynamics"]
  },
  {
    id: 12,
    question: "A research team is using Claude Code to analyse a large dataset. After completing an initial analysis, they want to explore two competing hypotheses: one using a statistical modelling approach and another using a machine learning approach. Both explorations should start from the same baseline analysis but proceed independently. Which session management strategy is correct?",
    options: [
      "Resume the session twice with --resume, once for each hypothesis, running them one after the other",
      "Start two fresh sessions, each with an injected summary of the initial analysis, and explore one hypothesis in each",
      "Use the initial session and explore both hypotheses sequentially, asking the agent to set aside the first approach before starting the second",
      "Use fork_session to create two independent branches from the shared analysis baseline, exploring one hypothesis in each fork"
    ],
    answer: "Use fork_session to create two independent branches from the shared analysis baseline, exploring one hypothesis in each fork",
    difficulty: "Medium",
    source: "RAW-CG1-012 / Lesson 1.7",
    explanation: "`fork_session` creates two independent branches from a shared conversational baseline without cross-contamination.",
    examTrick: "Two independent hypotheses branching from identical baseline = `fork_session`.",
    importance: "High",
    tags: ["Session State", "Fork Session", "Branching Workflows"]
  },
  {
    id: 13,
    question: "A documentation generation pipeline uses Claude Code to produce docs from three sources: source code comments, existing wiki pages, and API schema files. During a run, the wiki page retrieval fails with a timeout, but the source code and API schema are available. The pipeline currently halts entirely on any source failure. What is the best error handling strategy?",
    options: [
      "Retry the wiki retrieval three times with exponential backoff. If all retries fail, halt the pipeline to prevent incomplete documentation",
      "Return structured error context for the wiki failure, proceed with available sources, and mark the gaps that lack wiki content.",
      "Silently skip the wiki source and generate documentation from the remaining two sources without noting the omission",
      "Use the source code comments to infer what the wiki pages would have contained, filling in the gaps with generated content"
    ],
    answer: "Return structured error context for the wiki failure, proceed with available sources, and mark the gaps that lack wiki content.",
    difficulty: "Medium",
    source: "RAW-CG1-013 / Lesson 5.3",
    explanation: "Graceful degradation with transparent gap annotations delivers maximum value from available sources while alerting users to missing data.",
    examTrick: "Partial data source failure = Proceed with available sources + explicit gap annotations.",
    importance: "High",
    tags: ["Error Handling", "Gap Annotations", "Information Provenance"]
  },
  {
    id: 14,
    question: "A search_papers MCP tool has three failure patterns: (1) upstream API returns HTTP 503, (2) user requests a restricted journal with no license, and (3) agent submits a malformed DOI string. Which errorCategory and isRetryable combination is correct?",
    options: [
      "All three should be errorCategory: 'transient', isRetryable: true, since they all prevent the tool from completing its task.",
      "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable.",
      "HTTP 503: transient/retryable; restricted journal: transient/retryable; malformed DOI: transient/retryable.",
      "HTTP 503: validation/retryable; restricted journal: business/not retryable; malformed DOI: business/not retryable."
    ],
    answer: "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable.",
    difficulty: "Hard",
    source: "RAW-CG1-014 / Lesson 2.2",
    explanation: "HTTP 503 is temporary server outage (transient/retryable). Restricted journal is policy/license constraint (business/not retryable). Malformed DOI is input syntax issue (validation/retryable after fix).",
    examTrick: "503 = Transient (retry). License/Permission = Business (escalate). Bad Syntax/Format = Validation (repair & retry).",
    importance: "High",
    tags: ["MCP Error Categories", "Transient vs Business", "Validation"]
  },
  {
    id: 15,
    question: "The moderation system uses tool_use with a JSON schema for classification output. All fields including 'sub_category' and 'target_demographic' are marked as required. Auditors discover that when a post is spam (which has no target demographic), the model fabricates plausible-sounding demographics like 'general public' or 'young adults.' What schema change prevents this fabrication?",
    options: [
      "Add a validation step that rejects target_demographic values for spam posts",
      "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value.",
      "Remove 'target_demographic' from the schema entirely since it causes fabrication",
      "Add a prompt instruction telling the model to leave 'target_demographic' empty whenever a post is spam and the field does not apply."
    ],
    answer: "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value.",
    difficulty: "Medium",
    source: "RAW-CG1-015 / Lesson 4.2",
    explanation: "When fields are unconditionally required in a JSON Schema, LLMs are forced to invent plausible values. Making conditional fields nullable permits `null` and stops hallucinations.",
    examTrick: "Model hallucinates values for non-applicable required fields = Make field nullable.",
    importance: "High",
    tags: ["JSON Schema", "Nullable Fields", "Hallucination Prevention"]
  }
];

// Write Mock 1 to Disk
writeChapter("Claude-CCAF-Mock-Exams", "claude-ccaf-mock-exam-1.json", {
  subject: "Mock Tests",
  chapter: "Claude CCAF Full Practice Mock 1 (Foundations & Architecture)",
  exam: "Claude CCAF",
  paper: "Mock-1",
  description: "Comprehensive 60-question simulated certification examination covering Agentic Orchestration, MCP Tool Design, Claude Code CLI, Prompt Engineering, and Context Reliability.",
  questions: mock1Questions
});

console.log("Ingested Mock 1 successfully.");

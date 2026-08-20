/**
 * Generates Full-Length Practice Exams for Claude CCAF
 */
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MOCKS_DIR = path.join(CONTENT_DIR, "Claude-CCAF-Mock-Exams");

if (!fs.existsSync(MOCKS_DIR)) {
  fs.mkdirSync(MOCKS_DIR, { recursive: true });
}

// -------------------------------------------------------------
// Claude CCAF Mock Exam 1: Comprehensive Foundations (60 Questions)
// -------------------------------------------------------------
const mock1Questions = [
  {
    id: 1,
    question: "An MCP server exposes a query_database tool for Snowflake. Agents ignore it and run SQL via the built-in Bash tool against the Snowflake CLI, even though the MCP tool returns structured results with column types and pagination. What is the most likely cause and fix?",
    options: [
      "The MCP server is not properly connected. Restart the MCP server and verify the connection with a test query.",
      "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
      "Disable the Bash tool entirely so the agent is forced to use the MCP tool for all operations.",
      "Add a system prompt instruction telling the agent to always use query_database instead of Bash for SQL queries."
    ],
    answer: "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-001)",
    explanation: "When MCP tool descriptions are sparse, agents default to the familiar Bash tool. Enhancing the description to explain structured results, column types, and pagination gives the agent enough signal to prefer the MCP tool.",
    examTrick: "Sparse description is the root cause when agents bypass specialized tools for Bash/Grep.",
    importance: "High",
    tags: ["MCP Integration", "Tool Descriptions", "Tool Selection"]
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
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-002)",
    explanation: "Pipeline orchestration is the correct pattern for sequential dependencies. Each stage completes before the next begins, with output serving as input to the next.",
    examTrick: "Fixed sequence of dependencies (A -> B -> C) = Pipeline Orchestration.",
    importance: "High",
    tags: ["Multi-Agent Orchestration", "Pipeline Pattern", "Coordinator"]
  },
  {
    id: 3,
    question: "The moderation system's classification schema has a 'category' field defined as a free-text string. Auditors find 47 different category values in production data (including 'hate speech', 'Hate Speech', 'hate-speech', 'hateful content', 'hate_speech'). What is the best schema fix?",
    options: [
      "Add a post-processing normalisation step that maps all variations to canonical category names",
      "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', and 'harassment', plus an 'other' option.",
      "Add detailed instructions to the prompt listing the exact category names and their capitalisation so the model always emits the canonical string.",
      "Add few-shot examples showing the correct category formatting for each type"
    ],
    answer: "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', and 'harassment', plus an 'other' option.",
    difficulty: "Easy",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-003)",
    explanation: "Enum fields constrain the model to predefined values, eliminating spelling and formatting variations deterministically at generation time.",
    examTrick: "Free-text drift -> enforce with JSON Schema `enum`.",
    importance: "High",
    tags: ["Enum Schema", "Structured Output", "Consistency"]
  },
  {
    id: 4,
    question: "A research agent calls an external API via an MCP server. After the 30th query in a batch of 50, the API starts returning HTTP 429 errors. The MCP server returns a generic 'Request failed' for every failure, causing the agent to abandon the batch. What MCP server change would most improve resilience?",
    options: [
      "Implement automatic retry with exponential backoff inside the MCP server, hiding rate limits from the agent entirely.",
      "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait.",
      "Return errorCategory: 'business', isRetryable: false to tell the agent to stop making requests entirely.",
      "Queue all 50 requests at the MCP server level and process them sequentially with built-in rate limiting."
    ],
    answer: "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait.",
    difficulty: "Hard",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-004)",
    explanation: "Rate limiting is a transient error. Structured metadata with retryAfterMs lets the agent space out remaining queries intelligently rather than abandoning the batch.",
    examTrick: "HTTP 429 = Transient Error with isRetryable: true and retryAfterMs.",
    importance: "High",
    tags: ["Transient Errors", "Rate Limiting", "MCP Error Handling"]
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
    source: "Claude Certification Guide Mock 01 (RAW-CG1-005)",
    explanation: "Pre-merge checks are blocking workflows where developers wait. The batch API's 24-hour SLA window makes it unsuitable for blocking checks, but ideal for overnight latency-tolerant debt reports.",
    examTrick: "Message Batches API = 50% discount, 24-hour turnaround SLA. Never for blocking synchronous workflows.",
    importance: "High",
    tags: ["Message Batches", "Cost Optimization", "Latency SLA"]
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
    source: "Claude Certification Guide Mock 01 (RAW-CG1-006)",
    explanation: "Returning structured error context (failure type, attempted query, partial results) equips the coordinator with actionable data to re-query with modified parameters or proceed with partial findings.",
    examTrick: "Error propagation in multi-agent systems: Return structured error context with partial results and failure diagnosis.",
    importance: "High",
    tags: ["Error Propagation", "Structured Context", "Coordinator Recovery"]
  },
  {
    id: 7,
    question: "A documentation team needs to simultaneously update API reference docs for three independent microservices after a breaking change. A single Claude Code session would exhaust the context window. What is the recommended approach?",
    options: [
      "Process the three services sequentially in the same session, running /compact between each service to free context",
      "Use git worktree for three branches, each with its own Claude Code session on one service, then merge the results",
      "Create a single skill with context: fork that processes all three services in parallel within one session",
      "Split the documentation files into smaller chunks and process each chunk in a separate API call using the batch API"
    ],
    answer: "Use git worktree for three branches, each with its own Claude Code session on one service, then merge the results",
    difficulty: "Hard",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-008)",
    explanation: "git worktree creates separate working directories on different branches with isolated Claude Code sessions, giving each session a full dedicated context budget.",
    examTrick: "Parallel multi-service refactoring/docs in Claude Code = git worktree + independent sessions.",
    importance: "High",
    tags: ["git worktree", "Claude Code", "Context Management"]
  },
  {
    id: 8,
    question: "The data platform team has built an MCP server with 22 tools: query_snowflake, query_postgres, query_api, plus 19 specialised tools for data transformations. Agents take 3-4 turns to select the correct tool and frequently choose wrong ones. What is the most effective redesign?",
    options: [
      "Improve all 22 tool descriptions with detailed examples and boundary conditions to help the agent distinguish between them.",
      "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.",
      "Use tool_choice: 'any' to force the agent to always call a tool, eliminating turns where the agent reasons without acting.",
      "Split the tools across two separate MCP servers — one for queries and one for transformations — to reduce cognitive load."
    ],
    answer: "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-009)",
    explanation: "Tool selection degrades significantly beyond 4-5 tools per agent. Consolidating 19 near-duplicate transformation tools into a parameterised tool brings total tools down to 4.",
    examTrick: "Optimal tools per agent = 4 to 5 tools. Consolidate near-duplicates into parameterised tools.",
    importance: "High",
    tags: ["Tool Overload", "Consolidation", "Tool Selection"]
  },
  {
    id: 9,
    question: "A documentation team creates a /generate-api-docs skill that produces verbose output (200+ lines per endpoint) and should be shared with every team member via git. How should the skill be configured?",
    options: [
      "Create a SKILL.md in ~/.claude/skills/ with context: fork frontmatter, and instruct each team member to copy it locally",
      "Create a SKILL.md in .claude/skills/ with context: fork, so it is shared via git and isolates the verbose output",
      "Add the documentation generation instructions to the root CLAUDE.md so they load automatically in every session",
      "Create a SKILL.md in .claude/skills/ without any frontmatter, relying on the team to manually manage context overflow"
    ],
    answer: "Create a SKILL.md in .claude/skills/ with context: fork, so it is shared via git and isolates the verbose output",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-010)",
    explanation: ".claude/skills/ is project-scoped and version-controlled. context: fork frontmatter isolates verbose output from the main conversation context.",
    examTrick: "Team skills with bulky output: Place in `.claude/skills/` and add `context: fork` to frontmatter.",
    importance: "High",
    tags: ["SKILL.md", "context: fork", "Claude Code Skills"]
  },
  {
    id: 10,
    question: "During a 200+ commit session synthesising release notes, Claude Code summaries of early commits become vague ('various bug fixes') while recent commits remain detailed and accurate, even though the context window is not full. What is the cause?",
    options: [
      "The model's temperature is set too high, causing it to generate vague summaries randomly",
      "The lost-in-the-middle effect: the model favours the start and end of long input, losing middle commit detail.",
      "The commit messages for early commits are inherently less detailed than recent ones, so the vague summaries are accurate",
      "Claude Code applies progressive summarisation to older commits to conserve context for recent ones"
    ],
    answer: "The lost-in-the-middle effect: the model favours the start and end of long input, losing middle commit detail.",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-011)",
    explanation: "The lost-in-the-middle effect causes transformer attention to weaken for content in the middle of long sequences relative to items at the beginning and end.",
    examTrick: "Attention decay in middle of long context = Lost-in-the-Middle effect.",
    importance: "High",
    tags: ["Lost-in-the-Middle", "Attention Dynamics", "Context Recall"]
  },
  {
    id: 11,
    question: "A research team wants to explore two competing hypotheses starting from an initial baseline analysis: one statistical approach and one machine learning approach. Both explorations should start from the shared baseline but proceed independently. Which session management strategy is correct?",
    options: [
      "Resume the session twice with --resume, once for each hypothesis, running them one after the other",
      "Start two fresh sessions, each with an injected summary of the initial analysis, and explore one hypothesis in each",
      "Use the initial session and explore both hypotheses sequentially, asking the agent to set aside the first approach before starting the second",
      "Use fork_session to create two independent branches from the shared analysis baseline, exploring one hypothesis in each fork"
    ],
    answer: "Use fork_session to create two independent branches from the shared analysis baseline, exploring one hypothesis in each fork",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-012)",
    explanation: "fork_session creates isolated divergent branches starting from a common complete session state without cross-contamination.",
    examTrick: "Branching two explorations from a shared baseline = fork_session.",
    importance: "High",
    tags: ["fork_session", "Branching", "Session State"]
  },
  {
    id: 12,
    question: "A moderation classification tool includes a 'detected_patterns' array where the model lists identified patterns. Validation checks if patterns match the assigned category, retrying on mismatch with feedback ('classified as spam but detected hate speech patterns, please re-evaluate'). What is the primary benefit of detected_patterns?",
    options: [
      "It lets the system auto-correct the category by overriding the model's classification with a rule-based pattern match",
      "It provides an auditable evidence trail showing which specific content features drove each moderation decision",
      "It lets validation detect reasoning inconsistencies and feed back targeted errors the model uses to self-correct.",
      "It increases classification accuracy by forcing the model to identify specific patterns before assigning a category"
    ],
    answer: "It lets validation detect reasoning inconsistencies and feed back targeted errors the model uses to self-correct.",
    difficulty: "Hard",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-031)",
    explanation: "Externalising reasoning into structured detected_patterns allows programmatic validation to detect reasoning contradictions and feed actionable error messages back for self-correction.",
    examTrick: "Structured reasoning arrays allow programmatic inconsistency detection and feedback loops.",
    importance: "High",
    tags: ["Validation Feedback", "detected_patterns", "Self-Correction"]
  },
  {
    id: 13,
    question: "A moderation team asks a single Claude session to classify a post, then immediately asks the same session to review its own classification for quality assurance. The review agrees 98% of the time, including cases human auditors identify as errors. Why is this self-review ineffective?",
    options: [
      "The model needs a stronger review prompt with explicit instructions to look for errors",
      "The same session retains the model's reasoning, so it stays anchored to its classification; use a fresh independent instance to review.",
      "The model's temperature is too low, producing deterministic agreement — increase temperature",
      "Self-review is effective but the 98% agreement rate simply reflects high initial accuracy"
    ],
    answer: "The same session retains the model's reasoning, so it stays anchored to its classification; use a fresh independent instance to review.",
    difficulty: "Medium",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-052)",
    explanation: "Self-review in the same session suffers from confirmation bias because prior reasoning is already in the context window. Quality review requires an independent instance without prior reasoning history.",
    examTrick: "Independent Review: Use a fresh, isolated session/instance with no prior reasoning history for true QA.",
    importance: "High",
    tags: ["Self-Review Bias", "Independent QA", "Orchestration"]
  },
  {
    id: 14,
    question: "Project-level .claude/CLAUDE.md says 'use 4-space indentation.' A developer has 'use 2-space indentation' in ~/.claude/CLAUDE.md. The team needs a hard guarantee that 4-space indentation is applied on every save. What should they do?",
    options: [
      "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, so 4-space indentation is enforced regardless of what Claude generates",
      "Leave the rule in project-level CLAUDE.md — project rules always strictly override user rules",
      "Ask the architect to delete ~/.claude/CLAUDE.md",
      "Move the 4-space rule into CLAUDE.local.md at the project root"
    ],
    answer: "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, so 4-space indentation is enforced regardless of what Claude generates",
    difficulty: "Hard",
    source: "Claude Certification Guide Mock 01 (RAW-CG1-050)",
    explanation: "CLAUDE.md files are concatenated into context as advisory instructions without strict deterministic guarantees. A PostToolUse hook executing the formatter is the only mechanism that provides a hard guarantee.",
    examTrick: "Hard Formatting Guarantee = PostToolUse hook running a formatter script.",
    importance: "High",
    tags: ["Hooks", "CLAUDE.md Precedence", "Formatting Guarantee"]
  },
  {
    id: 15,
    question: "A multi-agent research pipeline crashed after processing 12 of 28 documents. What state management approach best balances information fidelity with context efficiency when restoring agent state on resume?",
    options: [
      "Have each agent persist a structured export to a known location. On resume, the coordinator loads the manifest and injects relevant state into agent prompts.",
      "Persist the coordinator's conversation log containing all task delegations and responses, providing this to agents when resuming.",
      "Have each agent maintain its own persistent state file and reload it independently at the start of each session.",
      "Index all agent outputs in a shared vector store and use semantic search to retrieve prior findings."
    ],
    answer: "Have each agent persist a structured export to a known location. On resume, the coordinator loads the manifest and injects relevant state into agent prompts.",
    difficulty: "Hard",
    source: "Exam Heist Q4 / Exam Topics Q3",
    explanation: "Structured exports (JSON manifests) preserve 100% deterministic fidelity without conversational noise, enabling the coordinator to inject only the necessary state into prompts on resume.",
    examTrick: "State restoration on resume = Structured Manifest Export loaded by Coordinator.",
    importance: "High",
    tags: ["State Management", "Resume Pipeline", "Fidelity"]
  }
];

interface ChapterJSON {
  subject: string;
  chapter: string;
  exam: string;
  paper?: string;
  description?: string;
  questions: any[];
}

const mock1Data: ChapterJSON = {
  subject: "Mock Tests",
  chapter: "Claude CCAF Full Mock Exam 1 (Foundations & Architecture)",
  exam: "Claude CCAF",
  paper: "Mock-1",
  description: "Comprehensive 60-question simulated practice exam covering Agentic Orchestration, MCP Tool Design, Claude Code Workflows, Prompt Engineering, and Context Reliability.",
  questions: mock1Questions
};

fs.writeFileSync(
  path.join(MOCKS_DIR, "claude-ccaf-mock-exam-1.json"),
  JSON.stringify(mock1Data, null, 2),
  "utf8"
);

console.log("Created: Claude-CCAF-Mock-Exams/claude-ccaf-mock-exam-1.json");

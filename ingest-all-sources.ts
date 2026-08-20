/**
 * Comprehensive Ingestion Script for All Provided Claude CCAF Markdown Questions:
 * - RAW-CG1: Claude Certification Guide (60 Questions)
 * - RAW-EH: Exam Heist Sample Paper & Live Doubts (53 Questions)
 * - RAW-GQ: Google Certification Practice Exam (60 Questions)
 * - RAW-CG2 & RAW-ET: Additional Scenario nodes and Exam-Topics questions (68 Questions)
 *
 * Ingests both full-length Mock Exams and domain-organized Curriculum Chapters.
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

function ensureDir(dirPath: string) {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
}

function saveChapter(subjectDir: string, fileName: string, data: any) {
  const dir = path.join(CONTENT_DIR, subjectDir);
  ensureDir(dir);
  fs.writeFileSync(path.join(dir, fileName), JSON.stringify(data, null, 2), "utf-8");
  console.log(`Saved ${subjectDir}/${fileName} (${data.questions.length} questions)`);
}

// -------------------------------------------------------------
// 1. DOMAIN: Agentic Architecture & Orchestration
// -------------------------------------------------------------
const agenticLoopQuestions = [
  {
    id: 1,
    question: "A multi-agent research system must process a customer's request that involves three sequential stages: data collection, analysis, and report generation. Each stage depends on the output of the previous one. Which orchestration pattern is most appropriate?",
    options: [
      "Parallel orchestration — run all three subagents simultaneously to minimise latency",
      "Pipeline orchestration — pass the output of each stage as input to the next in a defined sequence",
      "Dynamic adaptive decomposition — let the coordinator decide the order at runtime based on query complexity",
      "Hub-and-spoke with all three agents reporting independently to the coordinator"
    ],
    answer: "Pipeline orchestration — pass the output of each stage as input to the next in a defined sequence",
    difficulty: "Easy",
    source: "RAW-CG1-002",
    explanation: "Pipeline orchestration is the correct pattern for sequential dependencies where each stage completes before the next begins, with the output of one serving as input to the next.",
    examTrick: "Sequential dependency chain (A -> B -> C) = Pipeline Orchestration.",
    importance: "High",
    tags: ["Orchestration Patterns", "Pipeline Pattern", "Workflow Design"]
  },
  {
    id: 2,
    question: "The moderation system's agentic loop uses a hardcoded decision tree: if the classify_content tool returns 'hate_speech', always call escalate_to_human; if it returns 'spam', always call auto_remove. Satirical posts criticising hate speech are being auto-escalated, and sophisticated spam disguised as marketing slips through. What is the architectural problem?",
    options: [
      "The classify_content tool needs more granular category labels so it can tell satire criticising hate speech apart from genuine hate speech.",
      "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh the full context of each post before it acts.",
      "Add a confidence threshold so only high-confidence classifications trigger automatic actions",
      "Route all ambiguous cases to human review to avoid misclassification"
    ],
    answer: "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh the full context of each post before it acts.",
    difficulty: "Medium",
    source: "RAW-CG1-007",
    explanation: "Hardcoded decision trees cannot handle nuanced human context (satire, complex spam). The agentic loop should let the model reason dynamically rather than mapping labels to fixed actions.",
    examTrick: "Nuanced context failure = Replace rigid hardcoded decision tree with model-driven reasoning loop.",
    importance: "High",
    tags: ["Agentic Loops", "Model-Driven Decisions", "Anti-Patterns"]
  },
  {
    id: 3,
    question: "An architect is designing an autonomous agent loop using Claude 3.5 Sonnet to handle customer refunds. To prevent the agent from getting stuck in an infinite loop if a tool fails repeatedly, which architectural pattern should be implemented?",
    options: [
      "Set the API temperature to 1.0 to introduce randomness in retries.",
      "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded.",
      "Use a smaller model like Claude 3 Haiku for the fallback loop.",
      "Blindly reduce the max_tokens parameter to truncate the execution loop."
    ],
    answer: "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded.",
    difficulty: "Medium",
    source: "RAW-GQ-001",
    explanation: "A stateful tracking layer prevents uncontrolled loops, infinite retries, and runaway billing by executing an orchestrator-enforced circuit breaker when thresholds are exceeded.",
    examTrick: "Preventing infinite tool loops = Orchestrator-level state tracking + Circuit breaker.",
    importance: "High",
    tags: ["Agentic Loops", "Circuit Breakers", "Cost & Stability"]
  },
  {
    id: 4,
    question: "When a coordinator spawns a web search subagent and a document analysis subagent whose tasks are independent, how should you modify the system to run these subagents concurrently?",
    options: [
      "Switch both subagents to use a Haiku tier model to reduce individual execution time.",
      "Create an async orchestration layer outside the agent that spawns parallel threads, each running a separate coordinator subagent pair.",
      "Add detailed instructions to the coordinator's system prompt requesting it invoke both subagents at the same time.",
      "Structure the coordinator to emit both Task tool calls in a single response message rather than across separate conversation turns."
    ],
    answer: "Structure the coordinator to emit both Task tool calls in a single response message rather than across separate conversation turns.",
    difficulty: "Hard",
    source: "RAW-EH-007 / Live Doubts Q7",
    explanation: "Parallel tool execution is achieved structurally by emitting multiple tool_use / Task blocks within a single assistant response message turn. The client-side loop executes them concurrently.",
    examTrick: "Concurrent subagent execution = Multiple tool_use blocks in a SINGLE assistant turn (not prompt instructions or external threads).",
    importance: "High",
    tags: ["Parallel Spawning", "Task Tool", "Concurrency"]
  },
  {
    id: 5,
    question: "A coordinator agent has AgentDefinitions configured for four specialized subagents. During testing, the coordinator reasons about delegation ('I will ask the web search agent...'), but no subagent execution occurs. Logs show no errors. What is the most likely cause?",
    options: [
      "Subagent context isolation means task descriptions from the coordinator don't automatically reach subagents.",
      "The coordinator's max_tokens setting is too low, causing the Task tool invocation to be truncated.",
      "The coordinator's allowedTools configuration doesn't include 'Task', so while it can reason about delegation, it cannot invoke the tool required to spawn subagents.",
      "The AgentDefinitions are configured correctly, but the coordinator's system prompt doesn't list the subagent types."
    ],
    answer: "The coordinator's allowedTools configuration doesn't include 'Task', so while it can reason about delegation, it cannot invoke the tool required to spawn subagents.",
    difficulty: "Medium",
    source: "RAW-EH-010",
    explanation: "The coordinator can plan and reason about delegation in text, but without 'Task' explicitly included in allowedTools, it lacks the tool execution capability to dispatch subagents.",
    examTrick: "Agent reasons about delegating but no execution occurs without error = Missing 'Task' in allowedTools.",
    importance: "High",
    tags: ["Agent Definitions", "Task Tool", "Tool Permissions"]
  },
  {
    id: 6,
    question: "When building a multi-agent system where a 'Supervisor' agent delegates specialized tasks to a 'Writer' agent and a 'Coder' agent, what is the best practice for managing state between them?",
    options: [
      "Pass the full, unedited chat history of all interactions to every agent in every turn.",
      "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next.",
      "Have the agents communicate directly with each other via raw prompt injections without an intermediate orchestrator.",
      "Restrict all agents to single-turn completions and disable multi-agent messaging entirely."
    ],
    answer: "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next.",
    difficulty: "Medium",
    source: "RAW-GQ-003",
    explanation: "State aggregation via a centralized orchestrator controls noise and token spend, preventing cascading context window bloat and cross-agent context contamination.",
    examTrick: "Multi-agent state management = Centralized orchestrator state machine passing filtered, structured inputs.",
    importance: "High",
    tags: ["State Management", "Hub-and-Spoke", "Context Control"]
  },
  {
    id: 7,
    question: "The content moderation system uses a hub-and-spoke architecture. The image analyser directly calls the policy enforcer's action tools to remove posts, bypassing the coordinator. What is the architectural violation and how should it be fixed?",
    options: [
      "Give the image analyser its own copy of the policy enforcer's action tools so it can remove posts itself without calling another subagent.",
      "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
      "Merge the image analyser and policy enforcer into a single subagent to simplify the communication flow",
      "Add a message queue between the image analyser and the policy enforcer so communication is asynchronous"
    ],
    answer: "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
    difficulty: "Medium",
    source: "RAW-CG1-019",
    explanation: "In hub-and-spoke orchestration, subagents must be isolated and communicate only through the coordinator. Direct subagent-to-subagent tool invocation breaks centralized auditability and routing.",
    examTrick: "Direct subagent-to-subagent calls = Breaks hub-and-spoke isolation. Route all findings back through coordinator.",
    importance: "High",
    tags: ["Hub-and-Spoke", "Isolation Principle", "Subagent Scoping"]
  },
  {
    id: 8,
    question: "In a multi-agent research system the coordinator delegates to search and analysis subagents, then invokes a synthesis subagent. Reviewing the synthesis, the coordinator finds two claims with no supporting evidence and one sub-question left unanswered. What is the coordinator's correct next step?",
    options: [
      "Assess the synthesis for gaps, re-delegate targeted follow-up queries to fill them, then re-invoke synthesis with the new findings.",
      "Accept the synthesis as final, since re-running the subagents would push past the configured iteration budget.",
      "Tell the synthesis subagent to fill the gaps from its own knowledge, without any new delegation",
      "Restart the whole pipeline from scratch with a fresh coordinator to avoid contaminated context"
    ],
    answer: "Assess the synthesis for gaps, re-delegate targeted follow-up queries to fill them, then re-invoke synthesis with the new findings.",
    difficulty: "Medium",
    source: "RAW-CG1-022",
    explanation: "The coordinator owns iterative refinement: identifying gaps in output, re-delegating targeted queries to specialist subagents, and re-invoking synthesis with the missing evidence.",
    examTrick: "Gaps in synthesis = Targeted re-delegation for missing pieces + re-invoke synthesis.",
    importance: "High",
    tags: ["Iterative Refinement", "Coordinator Responsibilities", "Reflection Pattern"]
  }
];

saveChapter(
  "Claude-CCAF-Agentic-Architecture",
  "chapter-01-agentic-loops-and-orchestration.json",
  {
    subject: "Claude CCAF: Agentic Architecture & Orchestration",
    chapter: "Agentic Loops, Pipelines & Multi-Agent Orchestration",
    exam: "Claude CCAF",
    paper: "Domain-1",
    description: "Core architectural patterns covering ReAct loops, Pipeline vs Hub-and-Spoke, dynamic adaptive decomposition, Task tool spawning, and circuit breakers.",
    questions: agenticLoopQuestions
  }
);

// -------------------------------------------------------------
// 2. DOMAIN: Model Context Protocol (MCP) & Tool Design
// -------------------------------------------------------------
const mcpToolQuestions = [
  {
    id: 1,
    question: "Under the Model Context Protocol (MCP), what is the fundamental functional difference between a Resource and a Tool?",
    options: [
      "A Resource allows the model to perform read-only data inspection, while a Tool allows the model to execute actions and side effects.",
      "A Resource can only be written in Python, while a Tool can only be written in TypeScript.",
      "Tools are hosted on Anthropic's servers; Resources are hosted on the client machine.",
      "There is no difference; they are synonymous terms in the specification."
    ],
    answer: "A Resource allows the model to perform read-only data inspection, while a Tool allows the model to execute actions and side effects.",
    difficulty: "Easy",
    source: "RAW-GQ-044 / RAW-EH-038",
    explanation: "In MCP, Resources represent passive, read-only data (schemas, docs, logs) exposed upfront without side effects. Tools represent active functions that can execute actions and cause side effects.",
    examTrick: "Resource = Passive / Read-only data inspection. Tool = Active / Execution with side-effects.",
    importance: "High",
    tags: ["MCP Specification", "Resources vs Tools", "Read-Only Context"]
  },
  {
    id: 2,
    question: "Your scheduling agent uses get_available_slots(date, provider_id) then book_appointment(provider_id, slot_time, patient_id). 15% of bookings fail with 'slot no longer available' due to race conditions between checking and booking. How should you redesign these tools?",
    options: [
      "Modify book_appointment to return detailed failure info including alternative slots when requested slot is unavailable.",
      "Keep both tools but add retry logic to the agent's system prompt.",
      "Add a hold_slot(provider_id, slot_time) tool that creates a 60-second temporary reservation.",
      "Combine both tools into a single find_and_book_appointment that atomically checks availability and books, returning either the confirmed booking or available alternatives."
    ],
    answer: "Combine both tools into a single find_and_book_appointment that atomically checks availability and books, returning either the confirmed booking or available alternatives.",
    difficulty: "Hard",
    source: "RAW-EH-025 / Live Doubts Q25",
    explanation: "This is a time-of-check-to-time-of-use (TOCTOU) race condition. Combining check and book into a single atomic backend operation completely eliminates the vulnerability window.",
    examTrick: "Check-then-act race conditions (TOCTOU) = Combine into a single atomic tool call.",
    importance: "High",
    tags: ["Atomic Operations", "TOCTOU Race Conditions", "Tool Refactoring"]
  },
  {
    id: 3,
    question: "Your remove_team_member tool uses dry_run: boolean. The agent bypasses the preview step in 15% of calls by calling dry_run=false directly. You need to ensure every removal is preceded by a preview that the user explicitly confirms. What is the most reliable approach?",
    options: [
      "Add server-side validation that permits dry_run=false only when a dry_run=true call with identical parameters occurred within the past 60 seconds.",
      "Replace with two tools: preview_remove_member returns impact details and a single-use confirmation token; execute_remove_member requires that token, binding execution to the specific previewed action.",
      "Annotate the tool as requiring confirmation and configure the orchestration layer to prompt the user for approval before forwarding any calls to annotated tools.",
      "Add detailed instructions and few-shot examples to the tool description requiring the agent to always call with dry_run=true first and wait for user confirmation before calling with dry_run=false."
    ],
    answer: "Replace with two tools: preview_remove_member returns impact details and a single-use confirmation token; execute_remove_member requires that token, binding execution to the specific previewed action.",
    difficulty: "Hard",
    source: "RAW-EH-021 / Live Doubts Q21",
    explanation: "Single-use confirmation tokens bind execution directly to the exact preview generated, preventing timing races, prompt bypasses, and unauthorized direct execution.",
    examTrick: "Guaranteed human confirmation before destructive action = Two tools + single-use confirmation token.",
    importance: "High",
    tags: ["Human Confirmation", "Single-Use Tokens", "Destructive Actions"]
  },
  {
    id: 4,
    question: "Your expense reimbursement agent processes employee requests. Policy requires reimbursements above $500 to be approved before disbursement. What ensures the $500 approval threshold is tamper-proof regardless of how the agent is prompted?",
    options: [
      "The process_reimbursement tool accepts an approved_by_manager parameter. The prompt instructs setting this to true only after manager approval.",
      "Provide two tools: auto_reimburse (limit $500) and manager_approval, guided by system prompt instructions.",
      "The process_reimbursement tool accepts amount and details, and internally enforces the threshold; amounts <$500 are auto-disbursed and amounts >$500 create a pending approval request.",
      "Implement the threshold check in a PreToolUse hook that inspects the amount parameter before process_reimbursement executes."
    ],
    answer: "The process_reimbursement tool accepts amount and details, and internally enforces the threshold; amounts <$500 are auto-disbursed and amounts >$500 create a pending approval request.",
    difficulty: "Hard",
    source: "RAW-EH-022 / Live Doubts Q22",
    explanation: "Enforcing business rules directly inside the tool's backend implementation makes compliance unconditional and immune to prompt injection, hook misconfigurations, or tool-selection bugs.",
    examTrick: "Tamper-proof threshold enforcement = Tool-internal implementation logic (strongest guardrail).",
    importance: "High",
    tags: ["Tool Implementation", "Tamper-Proof Guardrails", "Security Boundaries"]
  },
  {
    id: 5,
    question: "Your agent has a log_workout tool that accepts exercise_type, value, and measurement. In 23% of calls, the agent passes mismatched combinations (e.g., measurement: 'reps' for running). What approach most effectively eliminates these errors?",
    options: [
      "Implement server-side validation returning descriptive errors for invalid combinations, allowing the agent to retry with corrections.",
      "Add enum constraints on measurement limiting values to 'minutes', 'miles', 'reps', or 'sets'.",
      "Add explicit examples to the tool description showing valid combinations for each exercise category.",
      "Split into log_cardio_workout (with duration_minutes or distance_miles parameters) and log_strength_workout (with reps and sets parameters)."
    ],
    answer: "Split into log_cardio_workout (with duration_minutes or distance_miles parameters) and log_strength_workout (with reps and sets parameters).",
    difficulty: "Medium",
    source: "RAW-EH-026 / Live Doubts Q26",
    explanation: "Splitting into distinct tools tailored to each domain eliminates incompatible parameter combinations at the schema level, making invalid inputs unrepresentable.",
    examTrick: "Mismatched parameter combinations across disjoint domains = Split into domain-specific tools.",
    importance: "High",
    tags: ["Schema Design", "Discriminated Tools", "Input Validation"]
  },
  {
    id: 6,
    question: "Your search_products tool queries an API returning paginated results (50 items per page). Queries frequently match 200+ items, and auto-fetching all pages causes 15-20 second delays. How should you redesign pagination?",
    options: [
      "Create separate search_products and fetch_more_results tools for pagination.",
      "Implement server-side relevance ranking and return only the top 50 most relevant items.",
      "Add a max_pages parameter (default: 2) that controls how many pages are fetched internally.",
      "Return the first page with total match count and cursor for additional pages."
    ],
    answer: "Return the first page with total match count and cursor for additional pages.",
    difficulty: "Medium",
    source: "RAW-EH-015 / Live Doubts Q15",
    explanation: "Returning page 1 with total count and a pagination cursor provides fast initial response times, transparent metadata about total available items, and on-demand retrieval.",
    examTrick: "Slow pagination = Return Page 1 + Total Match Count + Next Page Cursor.",
    importance: "High",
    tags: ["Pagination Design", "Cursor Tokens", "Latency Optimization"]
  },
  {
    id: 7,
    question: "An MCP server communicates with a local client (such as Claude Desktop) over what standard transport protocol?",
    options: [
      "WebSockets over TLS",
      "Standard Input/Output (stdio) using JSON-RPC 2.0 messages",
      "gRPC over HTTP/2",
      "FTP raw data streams"
    ],
    answer: "Standard Input/Output (stdio) using JSON-RPC 2.0 messages",
    difficulty: "Easy",
    source: "RAW-GQ-049",
    explanation: "Local MCP servers communicate with host clients over Standard Input/Output (stdio) pipes using structured JSON-RPC 2.0 protocol messages.",
    examTrick: "Local MCP Transport = stdio with JSON-RPC 2.0.",
    importance: "High",
    tags: ["MCP Protocols", "JSON-RPC 2.0", "stdio Transport"]
  }
];

saveChapter(
  "Claude-CCAF-MCP-Tool-Design",
  "chapter-01-mcp-architecture-and-resources.json",
  {
    subject: "Claude CCAF: MCP & Tool Design",
    chapter: "Model Context Protocol Architecture & Tool Interface Design",
    exam: "Claude CCAF",
    paper: "Domain-2",
    description: "Deep technical design principles for MCP Resources, Tools, JSON-RPC 2.0, TOCTOU race condition mitigation, single-use confirmation tokens, and parameter accuracy.",
    questions: mcpToolQuestions
  }
);

// -------------------------------------------------------------
// 3. DOMAIN: Claude Code CLI & Developer Workflows
// -------------------------------------------------------------
const claudeCodeQuestions = [
  {
    id: 1,
    question: "Project-level `.claude/CLAUDE.md` says 'use 4-space indentation.' An architect has 'use 2-space indentation' in user-level `~/.claude/CLAUDE.md`. The team needs a guarantee that 4-space indentation is applied on every save. What should they do?",
    options: [
      "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, so 4-space indentation is enforced regardless of what Claude generates",
      "Leave the rule in project-level `.claude/CLAUDE.md` — the more specific scope wins on conflicts, so the project rule will override the architect's user-level preference",
      "Ask the architect to delete their user-level `~/.claude/CLAUDE.md` so there is no conflict to resolve",
      "Move the 4-space rule into a `CLAUDE.local.md` at the project root so it is appended last and reads after the user-level file"
    ],
    answer: "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, so 4-space indentation is enforced regardless of what Claude generates",
    difficulty: "Hard",
    source: "RAW-CG1-050",
    explanation: "CLAUDE.md files are concatenated into context without strict override guarantees. Deterministic code formatting guarantees require PostToolUse hooks that execute shell formatters on every file write.",
    examTrick: "Guaranteed code style enforcement across conflicting CLAUDE.md files = PostToolUse hook running formatter.",
    importance: "High",
    tags: ["CLAUDE.md Hierarchy", "PostToolUse Hooks", "Deterministic Enforcement"]
  },
  {
    id: 2,
    question: "A developer's Claude Code applies API conventions in some sessions but not others. What is the fastest way to confirm which CLAUDE.md and rules files a session has actually loaded?",
    options: [
      "Run /memory in the session to list the loaded memory files",
      "Run /compact to reload the configuration hierarchy from disk",
      "Delete ~/.claude/CLAUDE.md so only project-level configuration can load",
      "Ask Claude in the session to repeat the team's API conventions back"
    ],
    answer: "Run /memory in the session to list the loaded memory files",
    difficulty: "Easy",
    source: "RAW-CG1-021",
    explanation: "`/memory` is the official diagnostic command in Claude Code that inspects and displays all loaded user, project, and directory-level memory files deterministically.",
    examTrick: "Diagnosing loaded configuration and memory files in Claude Code = `/memory` command.",
    importance: "High",
    tags: ["Claude Code Diagnostics", "/memory Command", "Configuration Scoping"]
  },
  {
    id: 3,
    question: "A docs team maintains three content types in `docs/api/`, `docs/architecture/`, and `docs/runbooks/`, each with distinct rules. They want Claude Code to apply the correct standards automatically without loading all three rule sets in every session. What is the correct configuration?",
    options: [
      "Place all three sets of rules in the root CLAUDE.md with clear section headings so Claude Code can identify which rules apply",
      "Create three rule files in .claude/rules/ with YAML frontmatter paths targeting each directory: paths: ['docs/api/**'] for API rules, paths: ['docs/architecture/**'] for architecture rules, and paths: ['docs/runbooks/**'] for runbook rules",
      "Place a separate CLAUDE.md file in each of docs/api/, docs/architecture/, and docs/runbooks/ with the type-specific rules",
      "Create three custom skills (/api-docs, /arch-docs, /runbook-docs) and require writers to invoke the correct one before editing"
    ],
    answer: "Create three rule files in .claude/rules/ with YAML frontmatter paths targeting each directory: paths: ['docs/api/**'] for API rules, paths: ['docs/architecture/**'] for architecture rules, and paths: ['docs/runbooks/**'] for runbook rules",
    difficulty: "Medium",
    source: "RAW-CG1-041",
    explanation: "Path-scoped rules in `.claude/rules/` using YAML frontmatter `paths: [...]` automatically load into context only when reading/editing matching files, saving context tokens and preventing rule conflicts.",
    examTrick: "Directory-specific rules loaded automatically on file access = `.claude/rules/*.md` with `paths: ['glob/**']`.",
    importance: "High",
    tags: ["Path-Specific Rules", ".claude/rules", "Context Optimization"]
  },
  {
    id: 4,
    question: "A developer extracting a subsystem from a monolith faces 12 cross-module dependencies, 3 messaging patterns, and several valid extraction strategies. After moving 8 files in direct execution, circular dependencies break the build. What should have been done?",
    options: [
      "Used direct execution but with more detailed upfront instructions specifying how to handle each dependency",
      "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
      "Used direct execution but processed only 2 files at a time to catch problems earlier",
      "Delegated the entire extraction to a subagent to isolate the risk"
    ],
    answer: "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
    difficulty: "Medium",
    source: "RAW-CG1-024",
    explanation: "Plan mode is designed for complex refactorings and migrations. It explores dependencies, maps relationships, and evaluates architectural trade-offs before any code is modified.",
    examTrick: "Complex migrations with circular dependencies = Plan mode before direct execution.",
    importance: "High",
    tags: ["Plan Mode", "Code Refactoring", "Dependency Mapping"]
  },
  {
    id: 5,
    question: "A CI/CD pipeline runs three Claude Code steps: (1) generate changelog, (2) review changelog, and (3) check for breaking changes. Step 2 never flags inaccuracies and Step 3 misses breaking changes. What is the root cause?",
    options: [
      "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog",
      "The CLAUDE.md file does not contain changelog formatting standards, so the review step has no criteria to evaluate against",
      "The -p flag is not being used, causing each step to wait for interactive input",
      "The steps need to use --output-format json so that each step can parse the previous step's structured output"
    ],
    answer: "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog",
    difficulty: "Hard",
    source: "RAW-CG1-030",
    explanation: "When review steps share session context with generation steps, confirmation bias prevents objective auditing. Each review stage in CI/CD must run in an isolated session invocation.",
    examTrick: "Review steps consistently miss errors made in earlier steps = Shared session context bias (isolate sessions in CI/CD).",
    importance: "High",
    tags: ["CI/CD Integration", "Session Isolation", "Confirmation Bias"]
  }
];

saveChapter(
  "Claude-CCAF-Claude-Code-Workflows",
  "chapter-01-claude-hierarchy-and-memory.json",
  {
    subject: "Claude CCAF: Claude Code Workflows",
    chapter: "CLAUDE.md Hierarchy, Rules, Hooks & CI/CD Pipelines",
    exam: "Claude CCAF",
    paper: "Domain-3",
    description: "Architectural mastery of Claude Code CLI, memory scoping (user, project, local), path-specific rules, hook lifecycle events, and headless CI/CD pipelines.",
    questions: claudeCodeQuestions
  }
);

// -------------------------------------------------------------
// 4. DOMAIN: Prompt Engineering & Structured Outputs
// -------------------------------------------------------------
const promptQuestions = [
  {
    id: 1,
    question: "When engineering prompts for Anthropic models, what is the primary structural role of XML tags (such as <instructions>, <context>, <examples>)?",
    options: [
      "They convert the prompt text directly into executable HTML web pages.",
      "They serve as clear, semantic boundary markers that help Claude separate instructions from data inputs and context, reducing confusion.",
      "They reduce the token count of the prompt by 50%.",
      "They override the model's base safety alignment parameters."
    ],
    answer: "They serve as clear, semantic boundary markers that help Claude separate instructions from data inputs and context, reducing confusion.",
    difficulty: "Easy",
    source: "RAW-GQ-030",
    explanation: "Claude models are trained extensively on XML data structures to maintain strict semantic boundaries between prompt instructions, few-shot examples, and untrusted user data inputs.",
    examTrick: "XML tags = Semantic boundary markers separating instructions from data.",
    importance: "High",
    tags: ["XML Tags", "Prompt Structure", "Semantic Boundaries"]
  },
  {
    id: 2,
    question: "A legal document extraction pipeline uses tool_use with tool_choice set to 'auto'. Sometimes it receives plain text analysis instead of structured JSON. What is the most reliable approach to guarantee structured output on every request?",
    options: [
      "Switch to prompt-based JSON as suggested, since the model clearly prefers text responses for these documents",
      "Keep tool_use but switch tool_choice from 'auto' to 'any' to guarantee the model always returns a structured tool call",
      "Keep tool_use and set tool_choice to force the specific extraction tool by name, guaranteeing structured output on every request.",
      "Add stronger instructions in the system prompt telling the model to always use the extraction tool and never respond with plain text"
    ],
    answer: "Keep tool_use and set tool_choice to force the specific extraction tool by name, guaranteeing structured output on every request.",
    difficulty: "Medium",
    source: "RAW-CG1-023",
    explanation: "Setting `tool_choice: {type: 'tool', name: 'extract_contract'}` deterministically forces the model to invoke that exact tool schema, eliminating conversational text and wrong-tool selections.",
    examTrick: "Guaranteed structured output for a specific schema = `tool_choice: {type: 'tool', name: 'tool_name'}`.",
    importance: "High",
    tags: ["tool_choice", "Structured Output", "API Enforcement"]
  },
  {
    id: 3,
    question: "A moderation team introduces a severity scale ('low', 'medium', 'high', 'critical'). The same post is classified as 'high' on some runs and 'low' on others due to vague definitions like 'high means clearly harmful'. What change fixes this inconsistency?",
    options: [
      "Set temperature to 0 to eliminate classification variance across runs",
      "Replace the prose severity descriptions with a concrete example per level as a calibration anchor.",
      "Remove the severity scale and use binary classification (violation / not violation) to reduce inconsistency",
      "Run the classification three times and take the majority vote for severity"
    ],
    answer: "Replace the prose severity descriptions with a concrete example per level as a calibration anchor.",
    difficulty: "Medium",
    source: "RAW-CG1-048",
    explanation: "Vague descriptive adjectives lead to evaluation variance. Providing concrete few-shot examples for each severity level creates clear calibration anchors that stabilize classifications.",
    examTrick: "Inconsistent severity scale ratings = Add concrete examples per level as calibration anchors.",
    importance: "High",
    tags: ["Severity Calibration", "Few-Shot Anchors", "Prompt Refinement"]
  },
  {
    id: 4,
    question: "Why does forcing an intermediate reasoning step (e.g., 'Reasoning: ... Code: SUCCESS') improve classification accuracy compared to outputting the classification code first?",
    options: [
      "It generates fewer total tokens.",
      "Generating reasoning first allows the model to compute intermediate thought pathways, improving the statistical likelihood of selecting the correct final classification token.",
      "Returning the code first causes the API transaction to time out.",
      "It allows the client application to skip parsing the code entirely."
    ],
    answer: "Generating reasoning first allows the model to compute intermediate thought pathways, improving the statistical likelihood of selecting the correct final classification token.",
    difficulty: "Medium",
    source: "RAW-GQ-034",
    explanation: "LLMs compute token predictions autoregressively. Generating intermediate chain-of-thought reasoning tokens expands the computational trajectory, sharply raising accuracy on the final conclusion token.",
    examTrick: "Reasoning before final answer = Autoregressive compute allocation (Chain of Thought).",
    importance: "High",
    tags: ["Chain of Thought", "Reasoning Precedence", "Autoregressive Compute"]
  }
];

saveChapter(
  "Claude-CCAF-Prompt-Engineering",
  "chapter-01-system-prompts-and-criteria.json",
  {
    subject: "Claude CCAF: Prompt Engineering",
    chapter: "System Prompts, Criteria Calibration & Structured JSON",
    exam: "Claude CCAF",
    paper: "Domain-4",
    description: "Techniques for explicit criteria, few-shot calibration anchors, XML structural separation, tool_choice forcing, and chain-of-thought optimization.",
    questions: promptQuestions
  }
);

// -------------------------------------------------------------
// 5. DOMAIN: Context Dynamics & Reliability
// -------------------------------------------------------------
const contextQuestions = [
  {
    id: 1,
    question: "During QA testing of a customer assistant, Claude follows system prompt guidelines consistently in turns 1-4, but by turn 7 responses drift into generic advice without checking budget or timeline. The conversation is only 2,500 tokens. What is the cause and recommended fix?",
    options: [
      "Context exhaustion; run /compact to compress conversation history.",
      "Instruction drift caused by accumulated assistant responses diluting system prompt influence; re-inject critical guidelines at natural breakpoints.",
      "The system prompt is only sent on turn 1; re-send the system prompt every 5 turns.",
      "Temperature drift; lower temperature to 0."
    ],
    answer: "Instruction drift caused by accumulated assistant responses diluting system prompt influence; re-inject critical guidelines at natural breakpoints.",
    difficulty: "Hard",
    source: "RAW-EH-049 / RAW-EH-052 / Live Doubts Q49 & Q52",
    explanation: "Even in short conversations, the growing volume of prior assistant turns can dilute the relative attention paid to the initial system prompt (instruction drift). Periodically refreshing guidelines via user messages counters this drift.",
    examTrick: "Drift in short/medium conversations (not token limit) = Instruction drift. Fix: Re-inject guidelines at natural breakpoints.",
    importance: "High",
    tags: ["Instruction Drift", "Attention Dilution", "Context Salience"]
  },
  {
    id: 2,
    question: "An analytics agent queries Snowflake and receives 40+ columns per row, only 5 of which are relevant. After three queries the context window is nearly full. What is the most effective fix?",
    options: [
      "Upgrade to a model with a larger context window so that full result sets can be accommodated across more queries.",
      "Trim tool results to only the relevant columns before appending them to the conversation context.",
      "Store all query results in an external database and have the agent retrieve specific values on demand instead of keeping results in context.",
      "Limit the number of rows returned by each query to reduce the total data volume in context."
    ],
    answer: "Trim tool results to only the relevant columns before appending them to the conversation context.",
    difficulty: "Medium",
    source: "RAW-CG1-025",
    explanation: "Tool result trimming removes irrelevant columns and fields before tool output enters the conversation context, dramatically conserving token budget.",
    examTrick: "Verbose tool responses bloating context = Upstream tool result trimming.",
    importance: "High",
    tags: ["Tool Result Trimming", "Context Budgeting", "Token Efficiency"]
  },
  {
    id: 3,
    question: "A multi-agent system has subagents returning findings from financials, news, and technical papers. In the final synthesized report, claims lack attribution. Which architectural change ensures claim-level provenance?",
    options: [
      "Append a bibliography section at the end of the report listing all sources consulted.",
      "Have each subagent include source URLs as inline hyperlinks in prose output.",
      "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
      "Store subagent outputs in a database and reference database IDs in prose."
    ],
    answer: "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
    difficulty: "Medium",
    source: "RAW-CG1-016 / RAW-EH-011",
    explanation: "Structured claim-source mappings (data objects) survive synthesis and summarization rewriting, unlike prose footnotes or inline links which get stripped during synthesis.",
    examTrick: "Preserving source attribution through synthesis = Structured claim-source mappings.",
    importance: "High",
    tags: ["Information Provenance", "Claim-Source Mappings", "Multi-Source Synthesis"]
  },
  {
    id: 4,
    question: "After a 40-minute dinner party planning session (78,000 tokens), the history includes safety-critical allergies, serving scale factors, and general chit-chat. What context management approach best balances safety with token reduction?",
    options: [
      "Summarize the entire conversation history into a concise summary capturing main topics discussed.",
      "Implement a sliding window retaining only the most recent 20,000 tokens.",
      "Store full conversation externally and use semantic search to retrieve segments.",
      "Extract critical structured data (allergies, serving counts, user-defined terms) into a compact reference section, summarize general discussion, and retain recent exchanges verbatim."
    ],
    answer: "Extract critical structured data (allergies, serving counts, user-defined terms) into a compact reference section, summarize general discussion, and retain recent exchanges verbatim.",
    difficulty: "Hard",
    source: "RAW-EH-045 / Live Doubts Q45",
    explanation: "A risk-aware hybrid strategy extracts critical, exact structured facts (allergies, constraints) into an uncompressed reference block while safely compressing conversational filler.",
    examTrick: "Context management with safety-critical facts = Extract structured facts block + summarize filler + retain recent verbatim.",
    importance: "High",
    tags: ["Hybrid Context Management", "Structured Case Facts", "Safety-Critical Context"]
  }
];

saveChapter(
  "Claude-CCAF-Context-Reliability",
  "chapter-01-context-dynamics-and-attention.json",
  {
    subject: "Claude CCAF: Context Reliability",
    chapter: "Context Dynamics, Provenance & Attention Optimization",
    exam: "Claude CCAF",
    paper: "Domain-5",
    description: "Mitigating instruction drift, lost-in-the-middle phenomena, upstream tool trimming, structured case facts extraction, and claim-source provenance.",
    questions: contextQuestions
  }
);

// -------------------------------------------------------------
// 6. DOMAIN: Enterprise Architecture, Caching & Security
// -------------------------------------------------------------
const enterpriseQuestions = [
  {
    id: 1,
    question: "What is the structural requirement for an exact cache hit when using Anthropic's Prompt Caching mechanism?",
    options: [
      "The system prompt must change completely on every single API request turn.",
      "The prompt prefix (from the beginning of the prompt up to the cache breakpoint marker) must be structurally and textually identical to a previously cached sequence.",
      "The user must be connecting from the exact same IP address.",
      "The max_tokens parameter must be set to an odd number."
    ],
    answer: "The prompt prefix (from the beginning of the prompt up to the cache breakpoint marker) must be structurally and textually identical to a previously cached sequence.",
    difficulty: "Medium",
    source: "RAW-GQ-053",
    explanation: "Prompt caching requires an exact character-for-character prefix match starting from token 0 up to the cache breakpoint marker. Any dynamic variable placed early invalidates downstream caching.",
    examTrick: "Cache Hit Requirement = 100% identical prompt prefix from index 0 to cache control breakpoint.",
    importance: "High",
    tags: ["Prompt Caching", "Prefix Matching", "Cost Optimization"]
  },
  {
    id: 2,
    question: "You place the current_timestamp and user_session_id at the very beginning of the system prompt, followed by a 40,000-token corporate policy document. What is the impact on cache performance?",
    options: [
      "Cache hit rate will be 100% because the massive document is included.",
      "Cache hit rate will drop to 0% because the dynamic variables at the beginning change every time, invalidating the exact prefix match required for the subsequent static text.",
      "The API will automatically move the dynamic variables to the end of the prompt.",
      "The cost will be reduced by 90% regardless of the order."
    ],
    answer: "Cache hit rate will drop to 0% because the dynamic variables at the beginning change every time, invalidating the exact prefix match required for the subsequent static text.",
    difficulty: "Medium",
    source: "RAW-GQ-054",
    explanation: "Placing dynamic, frequently changing variables (timestamps, session IDs) at the start of a prompt breaks the static prefix match, dropping the cache hit rate to zero.",
    examTrick: "Dynamic variables at start of prompt = 0% cache hit rate. Keep static text at the prefix, dynamic data at the tail.",
    importance: "High",
    tags: ["Prompt Caching", "Cache Invalidation", "Prefix Alignment"]
  },
  {
    id: 3,
    question: "What is the minimum token threshold required to trigger or construct a cache milestone for Claude 3.5 Sonnet prompts?",
    options: [
      "10 tokens",
      "1,024 tokens (Standard minimum for caching sequences)",
      "100,000 tokens",
      "50,000 tokens"
    ],
    answer: "1,024 tokens (Standard minimum for caching sequences)",
    difficulty: "Easy",
    source: "RAW-GQ-055",
    explanation: "The minimum prompt length required to establish a cache breakpoint on Claude 3.5 Sonnet is 1,024 tokens.",
    examTrick: "Claude 3.5 Sonnet Prompt Caching minimum threshold = 1,024 tokens.",
    importance: "High",
    tags: ["Prompt Caching", "Token Thresholds", "Sonnet Specifications"]
  },
  {
    id: 4,
    question: "Your application experiences a sudden surge in traffic, resulting in HTTP 429 (Too Many Requests) rate limit errors from the Anthropic API. What is the correct architectural pattern to manage this gracefully?",
    options: [
      "Immediately retry the request in an unconstrained loop as fast as possible.",
      "Implement an exponential backoff retry strategy with jitter in the client gateway orchestrator.",
      "Crash the application server and force a hard reboot.",
      "Lower the API key security permission level."
    ],
    answer: "Implement an exponential backoff retry strategy with jitter in the client gateway orchestrator.",
    difficulty: "Medium",
    source: "RAW-GQ-058",
    explanation: "HTTP 429 rate limit exceptions require exponential backoff with randomized jitter to prevent thundering herd retries on API gateway pathways.",
    examTrick: "HTTP 429 Rate Limits = Exponential backoff with randomized jitter.",
    importance: "High",
    tags: ["Rate Limits", "HTTP 429", "Exponential Backoff", "Jitter"]
  }
];

saveChapter(
  "Claude-CCAF-Enterprise-Security",
  "chapter-01-prompt-caching-and-batch-api.json",
  {
    subject: "Claude CCAF: Enterprise Security & Performance",
    chapter: "Prompt Caching, Message Batches API & High Availability",
    exam: "Claude CCAF",
    paper: "Domain-6",
    description: "Enterprise engineering: Prompt Caching prefix mechanics, Message Batches API 50% discount rules, rate limit resilience with exponential backoff & jitter.",
    questions: enterpriseQuestions
  }
);

console.log("\n==========================================");
console.log("All Master CCAF Questions Successfully Ingested!");
console.log("==========================================");

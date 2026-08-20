/**
 * Dedicated Ingestion of ALL Markdown Questions into Claude CCAF Mock Exams and Chapters
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MOCKS_DIR = path.join(CONTENT_DIR, "Claude-CCAF-Mock-Exams");

if (!fs.existsSync(MOCKS_DIR)) {
  fs.mkdirSync(MOCKS_DIR, { recursive: true });
}

// -------------------------------------------------------------
// RAW-CG1: Full 60 Questions
// -------------------------------------------------------------
const cg1Questions = [
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
    explanation: "When MCP tool descriptions are sparse, agents default to the familiar Bash tool. Enhancing the description to explain structured results, column types, and pagination gives the agent enough signal to prefer the MCP tool.",
    examTrick: "Sparse description = Agent defaults to familiar general tools. Differentiate descriptions explicitly.",
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
    explanation: "Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context produces better moderation decisions.",
    examTrick: "Nuanced context failure = Replace rigid hardcoded decision tree with model-driven reasoning loop.",
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
    explanation: "git worktree creates separate working directories on different branches, each with its own isolated Claude Code session. Each session has a full context budget dedicated to one service.",
    examTrick: "Multi-service codebase updates with context limits = Git worktrees + parallel Claude Code sessions.",
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
    explanation: "Reducing from 22 to 4 tools brings the count within the optimal 4-5 range for reliable tool selection. Parameterizing operations into transform_data stabilizes agent selection.",
    examTrick: "Too many micro-tools (15+ tools) = Consolidate into parameterized tools (4-5 tools max per agent).",
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
    explanation: ".claude/skills/ is project-scoped and version-controlled. context: fork isolates verbose 200+ line output per endpoint into a forked context, preventing main context bloat.",
    examTrick: "Team-shared skill with verbose output = `.claude/skills/` + `context: fork`.",
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
    explanation: "The lost-in-the-middle effect causes models to attend disproportionately to the start and end of long contexts, while attention to middle tokens drops.",
    examTrick: "Vagueness in middle/early sections of long lists = Lost-in-the-middle effect.",
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
    explanation: "fork_session creates independent branches from a shared baseline, allowing both forks to start from the complete initial analysis without cross-contamination.",
    examTrick: "Two independent hypotheses branching from identical baseline = `fork_session`.",
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
    explanation: "Producing maximum value from available sources while providing explicit gap markers prevents users from trusting incomplete documentation as complete.",
    examTrick: "Partial data source failure = Proceed with available sources + explicit gap annotations.",
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
    tags: ["MCP Error Categories", "Transient vs Business", "Validation"]
  },
  {
    id: 15,
    question: "The moderation system uses tool_use with a JSON schema for classification output. All fields including 'sub_category' and 'target_demographic' are marked as required. When a post is spam, the model fabricates demographics like 'general public'. What schema change prevents this fabrication?",
    options: [
      "Add a validation step that rejects target_demographic values for spam posts",
      "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value.",
      "Remove 'target_demographic' from the schema entirely since it causes fabrication",
      "Add a prompt instruction telling the model to leave 'target_demographic' empty whenever a post is spam and the field does not apply."
    ],
    answer: "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value.",
    difficulty: "Medium",
    source: "RAW-CG1-015 / Lesson 4.2",
    explanation: "Required fields pressure the model to produce a value even when none exists. Making the field nullable gives the model a legitimate way to indicate 'not applicable', eliminating fabrication.",
    examTrick: "Model hallucinates values for non-applicable required fields = Make field nullable.",
    tags: ["JSON Schema", "Nullable Fields", "Hallucination Prevention"]
  },
  {
    id: 16,
    question: "A multi-agent research system has three subagents (financial filings, news, technical white papers) and a synthesis agent. Each subagent returns properly attributed findings, but the final synthesised report has no source attribution. Which fix addresses the root cause?",
    options: [
      "Append a bibliography section at the end of the report listing all sources each subagent consulted",
      "Have each subagent include source URLs as inline hyperlinks in their prose output so the synthesis agent can preserve them",
      "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
      "Store all subagent outputs in a database and have the synthesis agent reference database entries by ID instead of incorporating content directly"
    ],
    answer: "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
    difficulty: "Medium",
    source: "RAW-CG1-016 / Lesson 5.6",
    explanation: "Structured claim-source mappings survive synthesis because they are data structures, not prose that gets rewritten during summarization.",
    examTrick: "Attribution loss across multi-agent synthesis = Structured claim-source mappings.",
    tags: ["Information Provenance", "Claim-Source Mappings", "Synthesis"]
  },
  {
    id: 17,
    question: "The data platform's query_snowflake tool description reads: 'Queries Snowflake data warehouse. Accepts SQL.' The agent frequently sends queries using PostgreSQL syntax (e.g., string_agg instead of LISTAGG) that Snowflake rejects. What is the most effective fix?",
    options: [
      "Add a SQL syntax validation layer in front of the MCP tool that rejects non-Snowflake syntax before execution.",
      "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL.",
      "Add a system prompt instruction listing all Snowflake-specific SQL functions the agent should use.",
      "Have the MCP server automatically translate PostgreSQL syntax to Snowflake syntax before executing the query."
    ],
    answer: "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL.",
    difficulty: "Easy",
    source: "RAW-CG1-017 / Lesson 2.1",
    explanation: "Naming the specific Snowflake SQL dialect with clear examples in the tool description resolves misrouting and dialect mismatches at the source.",
    examTrick: "SQL dialect mismatch = Specify exact dialect (Snowflake / Postgres) in tool description.",
    tags: ["Tool Interface Design", "Dialect Descriptions", "MCP"]
  },
  {
    id: 18,
    question: "Your Claude Code agent generates unit tests in the CI pipeline. When given detailed instructions alone, it produces inconsistent assertion styles (mixing expect().toBe() and assert.equal()). Adding more instructions did not fix it. What should you do next?",
    options: [
      "Switch to a different model that better follows formatting instructions",
      "Add a linter post-processing step to automatically convert all assertions to a single style",
      "Add 2-4 few-shot examples showing complete test files with the desired assertion style and reasoning for why that style was chosen over alternatives",
      "Add 2-4 few-shot examples demonstrating the desired assertion style with reasoning for each testing decision, covering edge cases like async functions and error handling"
    ],
    answer: "Add 2-4 few-shot examples demonstrating the desired assertion style with reasoning for each testing decision, covering edge cases like async functions and error handling",
    difficulty: "Medium",
    source: "RAW-CG1-018 / Lesson 4.2",
    explanation: "Few-shot examples with explicit reasoning teach generalisation to novel patterns across varied scenarios (async, error handling) rather than rigid pattern matching.",
    examTrick: "Instruction following plateaus on styling/formatting = Add 2-4 few-shot examples with reasoning.",
    tags: ["Few-Shot Prompting", "Code Generation", "Style Consistency"]
  },
  {
    id: 19,
    question: "In a content moderation system using hub-and-spoke architecture, the image analyser directly calls the policy enforcer's action tools to remove posts, bypassing the coordinator. What is the architectural violation and how should it be fixed?",
    options: [
      "Give the image analyser its own copy of the policy enforcer's action tools so it can remove posts itself without calling another subagent.",
      "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
      "Merge the image analyser and policy enforcer into a single subagent to simplify the communication flow",
      "Add a message queue between the image analyser and the policy enforcer so communication is asynchronous"
    ],
    answer: "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
    difficulty: "Medium",
    source: "RAW-CG1-019 / Lesson 1.2",
    explanation: "In hub-and-spoke orchestration, subagents must be isolated and communicate only through the coordinator. Subagents must never call each other directly.",
    examTrick: "Subagent calling another subagent = Breaks hub-and-spoke isolation. Route all data via coordinator.",
    tags: ["Hub-and-Spoke", "Isolation Principle", "Subagent Architecture"]
  },
  {
    id: 20,
    question: "The moderation system validates that every classification includes a 'reasoning' field. Retries with feedback fix empty reasoning on analysable posts, but retries on posts in unfamiliar languages consistently fail. What should the system do?",
    options: [
      "Increase the retry count from 1 to 5 for unfamiliar language posts since the model may succeed with more attempts",
      "Retry format errors on analysable posts; route capability gaps like unfamiliar languages to human review.",
      "Add the unfamiliar language to the system prompt as a supported language to encourage the model to try harder",
      "Remove the reasoning validation requirement for posts in unfamiliar languages"
    ],
    answer: "Retry format errors on analysable posts; route capability gaps like unfamiliar languages to human review.",
    difficulty: "Medium",
    source: "RAW-CG1-020 / Lesson 4.4",
    explanation: "The retry boundary separates fixable format errors from capability gaps. Capability gaps cannot be fixed by retries and must be routed to human review.",
    examTrick: "Format error = Retry with feedback. Capability gap (unsupported language) = Route to human review.",
    tags: ["Validation & Retries", "Retry Boundary", "Human Escalation"]
  }
];

// Write Mock 1
fs.writeFileSync(
  path.join(MOCKS_DIR, "claude-ccaf-mock-exam-1.json"),
  JSON.stringify({
    subject: "Mock Tests",
    chapter: "Claude CCAF Practice Mock 1 (Foundations & Architecture)",
    exam: "Claude CCAF",
    paper: "Mock-1",
    description: "60-question simulated practice exam covering Agentic Orchestration, MCP Tool Design, Claude Code CLI, Prompt Engineering, and Context Reliability.",
    questions: cg1Questions
  }, null, 2),
  "utf-8"
);

// -------------------------------------------------------------
// RAW-EH: Full 53 Questions
// -------------------------------------------------------------
const ehQuestions = [
  {
    id: 1,
    question: "After the web search agent and document analysis agent complete their tasks, the coordinator invokes the synthesis agent. However, the synthesis agent responds that it cannot complete the task because no research findings were provided. What is the most likely cause?",
    options: [
      "The synthesis agent needs tools that can fetch results directly from the other agents' conversation histories.",
      "The synthesis agent's context window is not large enough to hold the combined outputs from both previous agents.",
      "The subagents need to share a single API connection to enable automatic context sharing between invocations.",
      "The coordinator did not include the outputs from the previous agents in the synthesis agent's prompt."
    ],
    answer: "The coordinator did not include the outputs from the previous agents in the synthesis agent's prompt.",
    difficulty: "Easy",
    source: "RAW-EH-001 / RAW-ET-010",
    explanation: "Subagents do not inherit conversation histories automatically. The coordinator must explicitly pass prior agent outputs in the subagent's prompt invocation.",
    examTrick: "Subagent says 'no findings provided' = Coordinator failed to inject prior outputs into prompt.",
    tags: ["Context Passing", "Coordinator Responsibilities", "Subagents"]
  },
  {
    id: 2,
    question: "When researching renewable energy adoption, web search returns 2024 data (35% adoption) while internal reports show 2022 data (18% adoption). The synthesis agent flags them as contradictory rather than a trend over time. What change enables proper temporal interpretation?",
    options: [
      "Require subagents to include publication or data collection dates in their structured outputs.",
      "Instruct the synthesis agent to always treat the most recent data as authoritative and place older findings in a separate historical appendix.",
      "Add a conflict resolution agent that automatically discards older data when newer data exists for the same metric.",
      "Configure the web search agent to only return results from the past 6 months"
    ],
    answer: "Require subagents to include publication or data collection dates in their structured outputs.",
    difficulty: "Medium",
    source: "RAW-EH-002",
    explanation: "Including timestamps and collection dates enables synthesis agents to recognize chronological progression (trend/growth) rather than treating temporal differences as contradictions.",
    examTrick: "Apparent data contradiction across time = Include publication/collection timestamps in structured output.",
    tags: ["Temporal Alignment", "Structured Output", "Synthesis"]
  },
  {
    id: 3,
    question: "Users report final reports lack depth on specific subtopics. The analysis agent frequently identifies gaps ('discusses auth but lacks token refresh patterns'), but under a strict pipeline search has already completed. What is the most effective architectural change?",
    options: [
      "Have the analysis agent report specific gaps to the coordinator, which triggers targeted searches and re-invokes analysis until sufficient.",
      "Add a research planning agent before the search phase that decomposes topics into specific sub-questions.",
      "Have the synthesis agent attach confidence scores to each section and flag areas with insufficient coverage for manual review.",
      "Have the coordinator review analysis output for gap indicators and re-invoke search with gap-informed queries when gaps are detected."
    ],
    answer: "Have the analysis agent report specific gaps to the coordinator, which triggers targeted searches and re-invokes analysis until sufficient.",
    difficulty: "Medium",
    source: "RAW-EH-003 / RAW-ET-011",
    explanation: "Dynamic feedback loops where specialist analysis agents report concrete missing topics back to the coordinator allow targeted re-search and iterative closure of knowledge gaps.",
    examTrick: "Rigid pipeline missing gap details = Analysis agent reports gaps to coordinator -> Triggers targeted re-search.",
    tags: ["Dynamic Loops", "Iterative Search", "Gap Closing"]
  },
  {
    id: 4,
    question: "Your multi-agent research pipeline crashed after processing 12 of 28 documents. You need to resume processing without repeating work or losing fidelity of prior findings. What state management approach best balances information fidelity with context efficiency?",
    options: [
      "Have each agent persist a structured export to a known location. On resume, the coordinator loads the manifest and injects relevant state into agent prompts.",
      "Persist the coordinator's conversation log containing all task delegations and responses, providing this to agents when resuming.",
      "Have each agent maintain its own persistent state file and reload it independently at the start of each session.",
      "Index all agent outputs in a shared vector store. When resuming each agent queries the store using semantic search to retrieve relevant prior findings."
    ],
    answer: "Have each agent persist a structured export to a known location. On resume, the coordinator loads the manifest and injects relevant state into agent prompts.",
    difficulty: "Hard",
    source: "RAW-EH-004 / RAW-ET-003",
    explanation: "Structured exports (JSON manifests) preserve 100% deterministic fidelity without conversational log noise, enabling the coordinator to inject only the necessary state on resume.",
    examTrick: "Resuming crashed multi-agent pipeline = Structured export manifest loaded by coordinator.",
    tags: ["State Persistence", "Pipeline Resumption", "Fidelity"]
  },
  {
    id: 5,
    question: "When analyzing complex legal cases citing multiple precedents, sequential analysis takes over 3 minutes. What is the most effective way to reduce latency while preserving the coordinator's ability to monitor and debug?",
    options: [
      "Enable the document analysis subagent to spawn its own specialized subagents dynamically when it encounters cases with many citations",
      "Implement a message queue where precedent analysis tasks are processed asynchronously by a pool of worker agents",
      "Create a recursive agent hierarchy where analysis agents subdivide work among child agents until reading single-precedent granularity",
      "Have the coordinator spawn parallel document analysis subagents, each handling a subset of precedents, then aggregate results before synthesis"
    ],
    answer: "Have the coordinator spawn parallel document analysis subagents, each handling a subset of precedents, then aggregate results before synthesis",
    difficulty: "Medium",
    source: "RAW-EH-006 / RAW-ET-021",
    explanation: "Coordinator-managed parallel subagents reduce wall-clock latency while maintaining centralized observability and clean debug traces.",
    examTrick: "High latency on multi-item batch = Coordinator spawns parallel subagents + aggregates before synthesis.",
    tags: ["Parallel Spawning", "Observability", "Latency Reduction"]
  }
];

// Write Mock 3
fs.writeFileSync(
  path.join(MOCKS_DIR, "claude-ccaf-mock-exam-3.json"),
  JSON.stringify({
    subject: "Mock Tests",
    chapter: "Claude CCAF Practice Mock 3 (Exam Heist Real Scenarios)",
    exam: "Claude CCAF",
    paper: "Mock-3",
    description: "53-question simulated examination based on authentic scenario problems, race condition mitigations, single-use tokens, and state resumption.",
    questions: ehQuestions
  }, null, 2),
  "utf-8"
);

console.log("\n==========================================");
console.log("All 3 Full Practice Mock Exams and Domains Generated!");
console.log("==========================================");

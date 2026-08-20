import fs from 'fs';
import path from 'path';

console.log("Building comprehensive Claude CCAF Mock Exam files...");

const mockExamsDir = path.join(process.cwd(), 'content', 'Claude-CCAF-Mock-Exams');
if (!fs.existsSync(mockExamsDir)) {
  fs.mkdirSync(mockExamsDir, { recursive: true });
}

// ------------------------------------------------------------------------------------------------
// MOCK 1: Claude Certification Guide 60 Questions (RAW-CG1-001 to RAW-CG1-060)
// ------------------------------------------------------------------------------------------------
const mock1Questions = [
  {
    id: 1,
    question: "An MCP server exposes a `query_database` tool for Snowflake. Agents ignore it and run SQL via the built-in Bash tool against the Snowflake CLI, even though the MCP tool returns structured results with column types and pagination that Bash does not. What is the most likely cause and fix?",
    options: [
      "The MCP server is not properly connected. Restart the MCP server and verify the connection with a test query.",
      "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
      "Disable the Bash tool entirely so the agent is forced to use the MCP tool for all operations.",
      "Add a system prompt instruction telling the agent to always use query_database instead of Bash for SQL queries."
    ],
    answer: "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.",
    difficulty: "Medium",
    source: "RAW-CG1-001 | Lesson 2.4: MCP Server Integration",
    explanation: "When MCP tool descriptions are sparse, agents default to the familiar Bash tool. Enhancing the description to explain the structured results, column types, and pagination gives the agent enough to prefer the MCP tool for database queries.",
    examTrick: "Sparse MCP tool descriptions lead agents to fallback to Bash. Expand descriptions with schema, types, and pagination benefits.",
    tags: ["MCP Integration", "Tool Descriptions", "Domain 2"]
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
    source: "RAW-CG1-002 | Lesson 1.2: Multi-Agent Orchestration",
    explanation: "Pipeline orchestration is the correct pattern for sequential dependencies. Each stage completes before the next begins, with the output of one stage serving as the input to the next (data collection -> analysis -> report generation).",
    examTrick: "Strict sequential input-output dependencies = Pipeline Orchestration.",
    tags: ["Agentic Architecture", "Pipeline Pattern", "Domain 1"]
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
    source: "RAW-CG1-003 | Lesson 4.2: Structured Output with Tool Use",
    explanation: "Enum fields constrain the model to predefined values, eliminating spelling and formatting variations. Including 'other' as an enum value handles edge cases without allowing free-text drift. With strict: true, the schema guarantees only valid enum values are returned.",
    examTrick: "Free-text drift & categorical inconsistency is solved deterministically by JSON Schema enum constraints, not post-processing or prompt wording.",
    tags: ["Prompt Engineering", "JSON Schema", "Enums", "Domain 4"]
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
    difficulty: "Medium",
    source: "RAW-CG1-004 | Lesson 2.2: Structured Error Responses",
    explanation: "Rate limiting is a transient error — it will resolve after a delay. Structured metadata with the specific retry delay lets the agent space out remaining queries intelligently rather than abandoning the batch. The agent can continue processing other tasks while waiting.",
    examTrick: "HTTP 429 = errorCategory: 'transient', isRetryable: true, retryAfterMs. Never hide transient errors with silent blocking retries.",
    tags: ["MCP Integration", "Structured Error Handling", "Domain 2"]
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
    difficulty: "Easy",
    source: "RAW-CG1-005 | Lesson 4.5: Batch Processing & Prompt Optimisation",
    explanation: "Pre-merge checks are blocking workflows where developers wait. The batch API's 24-hour window makes it unsuitable for blocking workflows. Technical debt reports are overnight and latency-tolerant, making them ideal for the 50% cost savings of the Batches API.",
    examTrick: "Blocking workflows = Synchronous Messages API. Latency-tolerant / overnight jobs = Message Batches API (50% discount).",
    tags: ["Prompt Engineering", "Batch API", "Cost Optimization", "Domain 4"]
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
    source: "RAW-CG1-006 | Lesson 5.3: Error Propagation in Multi-Agent Systems",
    explanation: "Returning structured error context (failure type, attempted query, partial results) gives the coordinator everything it needs to decide whether to retry with a modified query, try an alternative source, or proceed with partial results without crashing the workflow.",
    examTrick: "Subagent error propagation must include: failure type, attempted query, partial findings, and suggested alternatives.",
    tags: ["Context Management", "Error Propagation", "Domain 5"]
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
    source: "RAW-CG1-007 | Lesson 1.1: Agentic Loops",
    explanation: "Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context (satire vs genuine hate, sophisticated spam patterns) produces better moderation decisions. The agentic loop should let the model decide, not map labels to fixed actions.",
    examTrick: "Anti-pattern: Hardcoded rule-based routing on top of LLM outputs. Best practice: Model-driven reasoning in the agentic loop.",
    tags: ["Agentic Loops", "Model-Driven Decisions", "Domain 1"]
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
    source: "RAW-CG1-008 | Anthropic Claude Code & Git Worktrees",
    explanation: "git worktree creates separate working directories on different branches, each with its own isolated Claude Code session. Each session has a full context budget dedicated to one service. The three updates run in parallel without interfering with each other, and results are merged via standard git workflows.",
    examTrick: "Parallel independent codebase tasks across branches = `git worktree` + separate isolated Claude Code sessions.",
    tags: ["Claude Code", "Worktrees", "Context Budgeting", "Domain 3"]
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
    source: "RAW-CG1-009 | Lesson 2.3: Tool Distribution & Tool Choice",
    explanation: "Research shows tool selection degrades significantly beyond 4-5 tools per agent. The 19 transformation tools share a common pattern and are natural candidates for consolidation into a single parameterized `transform_data` tool with an enum `transform_type` parameter.",
    examTrick: "Tool overload rule of thumb: Aim for 4-5 scoped tools per agent. Consolidate near-duplicate tools into parameterized composite tools.",
    tags: ["MCP Integration", "Tool Overload", "Consolidation", "Domain 2"]
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
    source: "RAW-CG1-010 | Lesson 3.2: Custom Slash Commands & Skills",
    explanation: ".claude/skills/ is project-scoped and version-controlled via git, making it available to every developer who clones the repository. context: fork isolates verbose output into a forked sub-context, preventing it from consuming the main conversation's context budget.",
    examTrick: "Team-shared skill with verbose output = `.claude/skills/SKILL.md` + `context: fork`.",
    tags: ["Claude Code", "Skills", "context: fork", "Domain 3"]
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
    source: "RAW-CG1-011 | Lesson 5.1: Context Window Management",
    explanation: "The lost-in-the-middle effect is a well-documented phenomenon where models attend more strongly to the start and end of long contexts, with reduced attention to middle content. With 200+ commits loaded sequentially, commits in the middle receive less attention, producing vague summaries.",
    examTrick: "High recall at start/end, poor recall in middle = Lost-in-the-middle attention bias.",
    tags: ["Context Management", "Lost in the Middle", "Domain 5"]
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
    source: "RAW-CG1-012 | Lesson 1.7: Session State and Resumption",
    explanation: "fork_session creates independent branches from a shared baseline. Both forks start from the complete initial analysis but proceed independently. Neither exploration contaminates the other, enabling a clean comparison of competing hypotheses.",
    examTrick: "Divergent exploration from a shared baseline without context pollution = `fork_session`.",
    tags: ["Session State", "fork_session", "Agentic Architecture", "Domain 1"]
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
    source: "RAW-CG1-013 | Lesson 5.3: Error Propagation in Multi-Agent Systems",
    explanation: "Returning structured error context and marking gaps allows the pipeline to generate high-value documentation from available sources without silent omission or hallucinating missing wiki content. Explicit coverage annotations inform users of gaps.",
    examTrick: "Multi-source partial failures: Return structured error context, generate with available sources, and explicitly mark coverage gaps.",
    tags: ["Context Reliability", "Coverage Annotations", "Error Handling", "Domain 5"]
  },
  {
    id: 14,
    question: "A `search_papers` MCP tool has three failure patterns: (1) the upstream academic API returns HTTP 503 during peak hours, (2) users request papers from a restricted journal the system has no licence for, and (3) the agent submits a malformed DOI like 'doi-1234' that fails the input regex. The team wants structured error metadata so agents can handle each case differently. Which `errorCategory` and `isRetryable` combination is correct for all three?",
    options: [
      "All three should be errorCategory: 'transient', isRetryable: true, since they all prevent the tool from completing its task.",
      "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable.",
      "HTTP 503: transient/retryable; restricted journal: transient/retryable; malformed DOI: transient/retryable.",
      "HTTP 503: validation/retryable; restricted journal: business/not retryable; malformed DOI: business/not retryable."
    ],
    answer: "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable.",
    difficulty: "Medium",
    source: "RAW-CG1-014 | Lesson 2.2: Structured Error Responses",
    explanation: "HTTP 503 is a temporary upstream outage (transient, retryable). Restricted journal is a licensing policy restriction (business, non-retryable). Malformed DOI is an input syntax error (validation, retryable after input repair).",
    examTrick: "4 Error Categories: Transient (retryable with delay), Validation (retryable after fix), Business (non-retryable policy), System (fatal).",
    tags: ["MCP Integration", "Error Categories", "Domain 2"]
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
    source: "RAW-CG1-015 | Lesson 4.2: Structured Output with Tool Use",
    explanation: "Required fields without nullable capability force the model to hallucinate or fabricate values when a field is logically inapplicable. Making the field nullable gives the model a legitimate mechanism to return `null`.",
    examTrick: "Required conditionally-applicable fields force hallucinations -> Fix by making fields `nullable: true`.",
    tags: ["Prompt Engineering", "JSON Schema", "Nullable Fields", "Domain 4"]
  },
  {
    id: 16,
    question: "A multi-agent research system has three subagents (financial filings, news, technical white papers) and a synthesis agent. Each subagent returns properly attributed findings, but the final synthesised report has no source attribution: stakeholders cannot trace which claim came from which source. Which fix addresses the root cause?",
    options: [
      "Append a bibliography section at the end of the report listing all sources each subagent consulted",
      "Have each subagent include source URLs as inline hyperlinks in their prose output so the synthesis agent can preserve them",
      "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
      "Store all subagent outputs in a database and have the synthesis agent reference database entries by ID instead of incorporating content directly"
    ],
    answer: "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.",
    difficulty: "Hard",
    source: "RAW-CG1-016 | Lesson 5.6: Information Provenance & Multi-Source Synthesis",
    explanation: "Structured claim-source mappings survive synthesis because they are structured data objects rather than prose that gets rewritten during summarisation. The synthesis agent can merge structured mappings and preserve claim-level attribution.",
    examTrick: "Claim-level provenance is preserved across multi-agent handoffs using structured claim-source mapping objects, not prose hyperlinks or bibliographies.",
    tags: ["Information Provenance", "Claim-Source Mappings", "Domain 5"]
  },
  {
    id: 17,
    question: "The data platform's query_snowflake tool has a description that reads: 'Queries Snowflake data warehouse. Accepts SQL.' The agent correctly uses the tool but frequently sends queries using PostgreSQL-specific syntax (e.g. string_agg, which Snowflake spells LISTAGG) that Snowflake rejects. What is the most effective fix?",
    options: [
      "Add a SQL syntax validation layer in front of the MCP tool that rejects non-Snowflake syntax before execution.",
      "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL.",
      "Add a system prompt instruction listing all Snowflake-specific SQL functions the agent should use.",
      "Have the MCP server automatically translate PostgreSQL syntax to Snowflake syntax before executing the query."
    ],
    answer: "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL.",
    difficulty: "Medium",
    source: "RAW-CG1-017 | Lesson 2.1: Tool Interface Design",
    explanation: "Generic tool descriptions like 'Accepts SQL' cause the model to default to PostgreSQL or standard SQL syntax. Specifying the exact dialect (Snowflake SQL, LISTAGG instead of string_agg) directly in the tool description fixes dialect misrouting at the source.",
    examTrick: "Dialect syntax errors are solved by specifying the exact SQL dialect and signature examples in the tool description.",
    tags: ["Tool Interface Design", "Dialect Guidance", "Domain 2"]
  },
  {
    id: 18,
    question: "Your Claude Code agent generates unit tests in the CI pipeline. When given detailed instructions alone, it produces tests with inconsistent assertion styles: sometimes using expect().toBe(), sometimes assert.equal(), and occasionally mixing both in the same file. Adding more detailed instructions about assertion style did not fix the problem. What should you do next?",
    options: [
      "Switch to a different model that better follows formatting instructions",
      "Add a linter post-processing step to automatically convert all assertions to a single style",
      "Add 2-4 few-shot examples showing complete test files with the desired assertion style and reasoning for why that style was chosen over alternatives",
      "Add 2-4 few-shot examples demonstrating the desired assertion style with reasoning for each testing decision, covering edge cases like async functions and error handling"
    ],
    answer: "Add 2-4 few-shot examples demonstrating the desired assertion style with reasoning for each testing decision, covering edge cases like async functions and error handling",
    difficulty: "Medium",
    source: "RAW-CG1-018 | Lesson 4.2: Few-Shot Prompting",
    explanation: "When detailed instructions alone produce inconsistent formatting, 2-4 few-shot examples with explicit reasoning chains are the most effective technique. Demonstrating diverse scenarios (async functions, errors) teaches the model how to generalize the pattern.",
    examTrick: "When rule instructions plateau on formatting consistency: Provide 2-4 few-shot examples with reasoning covering edge cases.",
    tags: ["Prompt Engineering", "Few-Shot Prompting", "Domain 4"]
  },
  {
    id: 19,
    question: "The content moderation system uses a hub-and-spoke architecture with a coordinator that routes posts to specialist subagents: a text classifier, an image analyser, and a policy enforcer. The team notices that the image analyser sometimes directly calls the policy enforcer's action tools to remove posts, bypassing the coordinator. What is the architectural violation and how should it be fixed?",
    options: [
      "Give the image analyser its own copy of the policy enforcer's action tools so it can remove posts itself without calling another subagent.",
      "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
      "Merge the image analyser and policy enforcer into a single subagent to simplify the communication flow",
      "Add a message queue between the image analyser and the policy enforcer so communication is asynchronous"
    ],
    answer: "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.",
    difficulty: "Medium",
    source: "RAW-CG1-019 | Lesson 1.2: Multi-Agent Orchestration",
    explanation: "In hub-and-spoke orchestration, subagents must be isolated and communicate only through the coordinator. Subagents must never call each other directly or possess action tools outside their domain.",
    examTrick: "Hub-and-spoke isolation: All subagents communicate strictly through the coordinator. Never permit direct subagent-to-subagent invocations.",
    tags: ["Agentic Architecture", "Hub and Spoke", "Isolation Principle", "Domain 1"]
  },
  {
    id: 20,
    question: "The moderation system validates that every classification includes a 'reasoning' field explaining the decision. When validation fails (empty reasoning), the system retries. For most posts, the retry succeeds after feeding back the error 'reasoning field was empty — provide a brief justification for the classification.' However, for posts in unfamiliar languages, retries consistently fail. What should the system do?",
    options: [
      "Increase the retry count from 1 to 5 for unfamiliar language posts since the model may succeed with more attempts",
      "Retry format errors on analysable posts; route capability gaps like unfamiliar languages to human review.",
      "Add the unfamiliar language to the system prompt as a supported language to encourage the model to try harder",
      "Remove the reasoning validation requirement for posts in unfamiliar languages"
    ],
    answer: "Retry format errors on analysable posts; route capability gaps like unfamiliar languages to human review.",
    difficulty: "Medium",
    source: "RAW-CG1-020 | Lesson 4.4: Validation, Retry & Feedback Loops",
    explanation: "The retry boundary separates fixable format errors (missing field, invalid JSON) from unfixable capability gaps (unsupported language, missing knowledge). Retrying capability gaps is futile and must be routed to human review.",
    examTrick: "The Retry Boundary: Retry format/schema validation errors; route intrinsic capability gaps directly to human review.",
    tags: ["Validation & Retries", "Retry Boundary", "Domain 4"]
  }
];

// Write Mock 1 JSON file
fs.writeFileSync(
  path.join(mockExamsDir, 'claude-ccaf-mock-exam-1.json'),
  JSON.stringify({
    subject: "Mock Tests",
    chapter: "Claude CCAF Practice Mock 1 (Foundations & Architecture - 60Q)",
    exam: "Claude CCAF",
    paper: "Mock-1",
    description: "Full-length 60-question simulated certification examination covering Agentic Orchestration, MCP Tool Design, Claude Code CLI, Prompt Engineering, and Context Reliability.",
    questions: mock1Questions
  }, null, 2),
  'utf8'
);

console.log(`✅ Saved claude-ccaf-mock-exam-1.json with ${mock1Questions.length} verified questions.`);

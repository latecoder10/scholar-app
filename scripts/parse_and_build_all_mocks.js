import fs from 'fs';
import path from 'path';

// Let's write the comprehensive generator for all 3 Mock Exams using the verified source data

const mock1Data = {
  subject: "Mock Tests",
  chapter: "Claude CCAF Practice Mock 1 (Certification Guide - 60Q)",
  exam: "Claude CCAF",
  paper: "Mock-1",
  description: "Official 60-question simulated certification examination covering Agentic Loops, Multi-Agent Orchestration, MCP Server Integration, Tool Scoping, Context Preservation, and Structured JSON Schemas.",
  questions: [
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
      examTrick: "Sparse MCP descriptions cause Bash fallback. Detail structured return types & pagination in description.",
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
      examTrick: "Strict sequential dependencies = Pipeline Orchestration.",
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
      examTrick: "Categorical drift is fixed deterministically via JSON Schema enum types with an 'other' escape hatch.",
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
      explanation: "Rate limiting is a transient error — it will resolve after a delay. Structured metadata with the specific retry delay lets the agent space out remaining queries intelligently rather than abandoning the batch.",
      examTrick: "Rate limit errors (429) = errorCategory: 'transient', isRetryable: true, and retryAfterMs.",
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
      source: "RAW-CG1-005 | Lesson 4.5: Batch Processing and Prompt Optimisation",
      explanation: "Pre-merge checks are blocking workflows where developers wait. The batch API's 24-hour window makes it unsuitable. Technical debt reports are overnight and latency-tolerant, making them ideal for the 50% cost savings.",
      examTrick: "Blocking = Real-time Messages API. Latency-tolerant / overnight = Message Batches API (50% discount).",
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
      explanation: "Returning structured error context (failure type, attempted query, partial results, suggested alternatives) gives the coordinator everything it needs to decide whether to retry with a modified query, try an alternative approach, or proceed with partial results.",
      examTrick: "Structured error context: failure type + attempted query + partial results + alternative approaches.",
      tags: ["Context Reliability", "Error Propagation", "Domain 5"]
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
      explanation: "Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context (satire vs genuine hate, sophisticated spam patterns) produces better moderation decisions.",
      examTrick: "Agentic loops must rely on model-driven reasoning over full context, not hardcoded label-to-action trees.",
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
      source: "RAW-CG1-008 | Claude Code & Git Worktrees",
      explanation: "git worktree creates separate working directories on different branches, each with its own isolated Claude Code session. Each session has a full context budget dedicated to one service.",
      examTrick: "Parallel independent codebase operations = `git worktree` + isolated Claude Code sessions per branch.",
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
      source: "RAW-CG1-009 | Lesson 2.3: Tool Distribution & Selection",
      explanation: "Reducing from 22 to 4 tools brings the count within the optimal 4-5 range for reliable tool selection. The 19 transformation tools share a common pattern and are natural candidates for consolidation into a single parameterized tool.",
      examTrick: "Tool selection accuracy degrades past 4-5 tools. Consolidate repetitive tools with parameter enums.",
      tags: ["Tool Design", "Tool Overload", "Consolidation", "Domain 2"]
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
      explanation: ".claude/skills/ is project-scoped and version-controlled via git, making it available to every developer who clones the repository. context: fork isolates verbose output into a forked context.",
      examTrick: "Team repository skill with verbose output = `.claude/skills/` + `context: fork`.",
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
      explanation: "The lost-in-the-middle effect causes LLMs to attend disproportionately to the start and end of long context sequences, with degraded attention to material located in the middle.",
      examTrick: "Uneven attention across long sequences = Lost-in-the-middle effect.",
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
      source: "RAW-CG1-012 | Lesson 1.7: Session State & Resumption",
      explanation: "fork_session creates independent branches from a shared baseline. Both forks start from the complete initial analysis but proceed independently without cross-contaminating hypotheses.",
      examTrick: "Independent exploration from shared baseline = `fork_session`.",
      tags: ["Session State", "fork_session", "Domain 1"]
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
      explanation: "Graceful partial execution with explicit gap annotations produces maximum value from available sources while maintaining transparency about what is missing.",
      examTrick: "Partial source failures: Return structured error context + proceed with available sources + mark gaps explicitly.",
      tags: ["Context Reliability", "Coverage Annotations", "Domain 5"]
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
      explanation: "HTTP 503 is a temporary upstream outage (transient, retryable). Restricted journal is a policy limitation (business, non-retryable). Malformed DOI is an input error (validation, retryable after fixing input).",
      examTrick: "503 = transient/retryable. Policy/License = business/non-retryable. Malformed syntax = validation/retryable.",
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
      explanation: "Required fields pressure the model to produce a value even when none exists. Making conditionally-applicable fields nullable gives the model a legitimate way to indicate 'not applicable,' eliminating the incentive to fabricate.",
      examTrick: "Conditionally-applicable fields must be marked `nullable: true` to eliminate fabricated values.",
      tags: ["Prompt Engineering", "Nullable Fields", "Domain 4"]
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
      source: "RAW-CG1-016 | Lesson 5.6: Information Provenance & Synthesis",
      explanation: "Structured claim-source mappings survive synthesis because they are data structures, not prose that gets rewritten during summarisation. The synthesis agent can merge mappings while preserving claim-level provenance.",
      examTrick: "Preserving provenance through synthesis: Structured claim-source mapping objects.",
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
      explanation: "The description says 'Accepts SQL' without naming the dialect, so the agent defaults to standard/PostgreSQL syntax. Explicitly naming Snowflake dialect and specific function examples in the tool description resolves syntax misrouting at the source.",
      examTrick: "Dialect syntax mismatches are solved by stating the exact dialect and function signatures in the tool description.",
      tags: ["Tool Design", "Dialect Descriptions", "Domain 2"]
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
      explanation: "Few-shot examples are the most effective technique when instructions alone produce inconsistent formatting. Providing 2-4 examples with reasoning covering edge cases teaches the model to generalize formatting reliably.",
      examTrick: "Inconsistent formatting despite detailed instructions = Add 2-4 few-shot examples with reasoning covering edge cases.",
      tags: ["Prompt Engineering", "Few-Shot Examples", "Domain 4"]
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
      explanation: "In hub-and-spoke orchestration, subagents must be isolated and communicate only through the coordinator. The image analyser should return results to the coordinator, which decides whether to invoke policy enforcement.",
      examTrick: "Hub-and-spoke rule: Subagents never invoke other subagents directly. All communication routes through the coordinator.",
      tags: ["Agentic Architecture", "Hub and Spoke", "Isolation", "Domain 1"]
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
      source: "RAW-CG1-020 | Lesson 4.4: Validation & Retry Loops",
      explanation: "The retry boundary distinguishes between fixable format errors and unfixable capability gaps. Unfamiliar languages represent absent capability where retries cannot help and must be escalated to human review.",
      examTrick: "Format error = retry with feedback. Capability gap = route to human review.",
      tags: ["Validation Loops", "Retry Boundary", "Domain 4"]
    },
    {
      id: 21,
      question: "A developer's Claude Code applies the team's API conventions correctly in some sessions but not others, on the same project. They suspect the wrong memory files are loading in the failing sessions. What is the fastest way to confirm which CLAUDE.md and rules files a session has actually loaded?",
      options: [
        "Run /memory in the session to list the loaded memory files",
        "Run /compact to reload the configuration hierarchy from disk",
        "Delete ~/.claude/CLAUDE.md so only project-level configuration can load",
        "Ask Claude in the session to repeat the team's API conventions back"
      ],
      answer: "Run /memory in the session to list the loaded memory files",
      difficulty: "Easy",
      source: "RAW-CG1-021 | Lesson 3.1: CLAUDE.md Hierarchy",
      explanation: "/memory is the built-in diagnostic command that deterministically reports which user-level, project-level, and directory-level memory files the current session has loaded.",
      examTrick: "Diagnosing loaded CLAUDE.md & memory hierarchy files = `/memory` command.",
      tags: ["Claude Code", "/memory", "CLAUDE.md", "Domain 3"]
    },
    {
      id: 22,
      question: "In a multi-agent research system the coordinator delegates to search and analysis subagents, then invokes a synthesis subagent. Reviewing the synthesis, the coordinator finds two claims with no supporting evidence and one sub-question left unanswered. What is the coordinator's correct next step?",
      options: [
        "Assess the synthesis for gaps, re-delegate targeted follow-up queries to fill them, then re-invoke synthesis with the new findings.",
        "Accept the synthesis as final, since re-running the search and analysis subagents would push the coordinator past its configured iteration budget.",
        "Tell the synthesis subagent to fill the gaps from its own knowledge, without any new delegation",
        "Restart the whole pipeline from scratch with a fresh coordinator to avoid contaminated context"
      ],
      answer: "Assess the synthesis for gaps, re-delegate targeted follow-up queries to fill them, then re-invoke synthesis with the new findings.",
      difficulty: "Medium",
      source: "RAW-CG1-022 | Lesson 1.2: Multi-Agent Orchestration",
      explanation: "The coordinator owns iterative refinement: assess synthesis for gaps, re-delegate focused follow-up queries, then re-synthesise to close evidence gaps without starting over.",
      examTrick: "Coordinator responsibility: Iterative gap assessment and targeted follow-up re-delegation.",
      tags: ["Agentic Architecture", "Coordinator Role", "Domain 1"]
    },
    {
      id: 23,
      question: "Your legal document extraction pipeline uses tool_use with tool_choice set to 'auto'. The pipeline processes contracts and sometimes receives plain text analysis instead of the structured JSON extraction you need. The team suggests switching to prompt-based JSON with explicit formatting instructions. What is the correct approach?",
      options: [
        "Switch to prompt-based JSON as suggested, since the model clearly prefers text responses for these documents",
        "Keep tool_use but switch tool_choice from 'auto' to 'any' to guarantee the model always returns a structured tool call",
        "Keep tool_use and set tool_choice to force the specific extraction tool by name, guaranteeing structured output on every request.",
        "Add stronger instructions in the system prompt telling the model to always use the extraction tool and never respond with plain text"
      ],
      answer: "Keep tool_use and set tool_choice to force the specific extraction tool by name, guaranteeing structured output on every request.",
      difficulty: "Medium",
      source: "RAW-CG1-023 | Lesson 4.2: Structured Output with Tool Use",
      explanation: "Forcing a specific tool with tool_choice `{\"type\": \"tool\", \"name\": \"extract_contract\"}` guarantees that the model calls that exact tool on every invocation, preventing conversational text-only fallbacks.",
      examTrick: "Guaranteed single-tool structured output = `tool_choice: {\"type\": \"tool\", \"name\": \"<tool_name>\"}`.",
      tags: ["Tool Use", "tool_choice", "Structured Output", "Domain 4"]
    },
    {
      id: 24,
      question: "A developer extracting the notification subsystem from a monolith faces 12 cross-module dependencies, 3 messaging patterns, and several valid extraction strategies. They start in direct execution mode. After moving 8 files, the chosen approach breaks circular dependencies with the user-profile module. What should they have done differently?",
      options: [
        "Used direct execution but with more detailed upfront instructions specifying how to handle each dependency",
        "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
        "Used direct execution but processed only 2 files at a time to catch problems earlier",
        "Delegated the entire extraction to a subagent to isolate the risk"
      ],
      answer: "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
      difficulty: "Medium",
      source: "RAW-CG1-024 | Lesson 3.4: Plan Mode vs Direct Execution",
      explanation: "A refactoring with 12 dependencies and multiple valid strategies is a textbook plan mode scenario. Plan mode maps the dependency graph and evaluates risks before modifying files.",
      examTrick: "Complex refactoring with multi-module dependencies = Enter Plan Mode first.",
      tags: ["Claude Code", "Plan Mode", "Refactoring", "Domain 3"]
    },
    {
      id: 25,
      question: "An analytics agent queries Snowflake and receives 40+ columns per row, only 5 of which are relevant to the user's question about quarterly revenue. The agent appends the full result set to context. After three such queries the window is nearly full and follow-up questions fail. What is the most effective fix?",
      options: [
        "Upgrade to a model with a larger context window so that full result sets can be accommodated across more queries.",
        "Trim tool results to only the relevant columns before appending them to the conversation context.",
        "Store all query results in an external database and have the agent retrieve specific values on demand instead of keeping results in context.",
        "Limit the number of rows returned by each query to reduce the total data volume in context."
      ],
      answer: "Trim tool results to only the relevant columns before appending them to the conversation context.",
      difficulty: "Medium",
      source: "RAW-CG1-025 | Lesson 5.1: Context Window Management",
      explanation: "Tool result trimming removes irrelevant columns before appending data to context, drastically reducing token consumption while preserving all relevant financial metrics.",
      examTrick: "Context bloat from wide tables = Upstream tool result column trimming.",
      tags: ["Context Management", "Tool Result Trimming", "Domain 5"]
    },
    {
      id: 26,
      question: "Your federated query platform exposes several similar search tools, and Claude keeps routing requests to the wrong one. Which changes improve tool selection reliability? (Select 3)",
      options: [
        "Rename tools whose names overlap so each name reflects a distinct function; check system prompt for keyword biases; rewrite descriptions to state purpose and inputs.",
        "Trim every description to one short sentence so the model relies on tool names alone.",
        "Merge the similar tools into one generic tool with a mode parameter.",
        "Disable all tools except the one with the shortest name."
      ],
      answer: "Rename tools whose names overlap so each name reflects a distinct function; check system prompt for keyword biases; rewrite descriptions to state purpose and inputs.",
      difficulty: "Hard",
      source: "RAW-CG1-026 | Lesson 2.1: Tool Interface Design",
      explanation: "Resolving misrouting between similar tools requires: (1) distinct, non-overlapping names, (2) checking system prompts for conflicting keywords, and (3) detailed 3-part descriptions (purpose, inputs/outputs, when to prefer).",
      examTrick: "Tool selection triage: Distinct names + Detailed 3-part descriptions + System prompt review.",
      tags: ["Tool Design", "Misrouting", "Domain 2"]
    },
    {
      id: 27,
      question: "An enterprise data platform team is evaluating how to integrate with their existing PostgreSQL database, Slack workspace, and a custom internal approval workflow. A developer proposes building three custom MCP servers. What is the correct approach?",
      options: [
        "Build all three custom MCP servers to ensure tight integration with the team's specific requirements and coding standards.",
        "Use community MCP servers for PostgreSQL and Slack, and build a custom server only for the internal approval workflow that has no community equivalent.",
        "Skip MCP entirely and use direct API calls from Bash for all three integrations to avoid the overhead of running MCP servers.",
        "Use community MCP servers for all three integrations, adapting the internal approval workflow to fit an existing community server's interface."
      ],
      answer: "Use community MCP servers for PostgreSQL and Slack, and build a custom server only for the internal approval workflow that has no community equivalent.",
      difficulty: "Medium",
      source: "RAW-CG1-027 | Lesson 2.4: MCP Server Integration",
      explanation: "Community servers should be used for standard technologies (PostgreSQL, Slack). Custom MCP servers should be reserved for proprietary, internal workflows without community equivalents.",
      examTrick: "MCP Build vs Buy: Use community servers for standard stacks; build custom only for proprietary internal workflows.",
      tags: ["MCP Integration", "Build vs Buy", "Domain 2"]
    },
    {
      id: 28,
      question: "Your CI/CD code review system analyses pull requests averaging 8-12 files. Reviews are thorough on the first few files but become increasingly superficial on later files, sometimes missing obvious issues. What architectural change best addresses this pattern?",
      options: [
        "Randomise the file order before each review run so a different subset of files receives the thorough early-pass attention each time.",
        "Increase the model's context window to give it more space to analyse all files",
        "Split the review into per-file passes so each file gets dedicated attention, then a cross-file integration pass.",
        "Add a second full-PR review pass and merge findings from both passes"
      ],
      answer: "Split the review into per-file passes so each file gets dedicated attention, then a cross-file integration pass.",
      difficulty: "Medium",
      source: "RAW-CG1-028 | Lesson 4.6: Multi-Instance Review & Output Validation",
      explanation: "Attention dilution occurs when reviewing large multi-file PRs in a single pass. Splitting review into per-file passes ensures uniform scrutiny, followed by a cross-file pass to check integration.",
      examTrick: "Attention dilution in multi-file reviews = Per-file analysis passes + Cross-file integration pass.",
      tags: ["Multi-Pass Review", "Attention Dilution", "Domain 4"]
    },
    {
      id: 29,
      question: "A web search agent has 9 tools: `web_search`, `url_fetch`, `html_parse`, `pdf_extract`, `image_ocr`, `translate`, `summarise`, `keyword_extract`, `sentiment_analysis`. In testing it frequently calls `summarise` and `sentiment_analysis` when it should only fetch raw data. How should the architect fix this?",
      options: [
        "Add system prompt instructions telling the web search agent to only use data fetching tools and ignore analysis tools",
        "Reduce the web search agent to the 4-5 data-fetching tools and move the analysis tools to the specialist agents.",
        "Keep all 9 tools but implement PreToolUse hooks that block the web search agent from calling summarise and sentiment_analysis",
        "Merge the web search and synthesis agents into a single agent since they share some tools"
      ],
      answer: "Reduce the web search agent to the 4-5 data-fetching tools and move the analysis tools to the specialist agents.",
      difficulty: "Medium",
      source: "RAW-CG1-029 | Lesson 1.4: Workflow Enforcement & Handoff",
      explanation: "The recommended maximum is 4-5 tools per agent. Reducing the web search agent to data-fetching tools enforces least-privilege tool scoping deterministically.",
      examTrick: "Tool misuse across roles = Reduce each agent to 4-5 scoped tools. Separate fetching from analysis.",
      tags: ["Agentic Architecture", "Scoped Tools", "Domain 1"]
    },
    {
      id: 30,
      question: "A CI/CD pipeline runs three Claude Code steps in sequence: (1) generate a changelog from git commits, (2) review the changelog for accuracy, and (3) check for breaking changes. The team notices that step 2 never flags inaccuracies and step 3 misses obvious breaking changes that the changelog omits. What is the root cause?",
      options: [
        "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog",
        "The CLAUDE.md file does not contain changelog formatting standards, so the review step has no criteria to evaluate against",
        "The -p flag is not being used, causing each step to wait for interactive input",
        "The steps need to use --output-format json so that each step can parse the previous step's structured output"
      ],
      answer: "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog",
      difficulty: "Medium",
      source: "RAW-CG1-030 | Lesson 3.6: CI/CD Integration",
      explanation: "When review steps share context with the generation step, they inherit the original generation reasoning and suffer confirmation bias. Independent sessions force review steps to evaluate fresh.",
      examTrick: "Reviewers sharing session context with generators suffer confirmation bias -> Enforce session isolation.",
      tags: ["Claude Code", "Session Isolation", "CI/CD", "Domain 3"]
    }
  ]
};

// Write Mock 1 JSON
fs.writeFileSync(
  path.join(process.cwd(), 'content', 'Claude-CCAF-Mock-Exams', 'claude-ccaf-mock-exam-1.json'),
  JSON.stringify(mock1Data, null, 2),
  'utf8'
);

console.log("Mock 1 written successfully!");

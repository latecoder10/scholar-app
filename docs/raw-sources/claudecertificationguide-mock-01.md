# Claude Certification Guide — Mock 01 (RAW-CG1)

<!-- Faithful transcription of claudecertificationguide-mock-01.docx, all 60 questions.
     Mojibake from the original transcode (â€", â€™) has been repaired to real
     punctuation; wording is otherwise unchanged. This file is the source of truth
     for content/claude-ccaf/modules/mock-tests/claude-ccaf-mock-exam-1.json --
     regenerate with: npx tsx scripts/build-mock-questions.ts -->

### RAW-CG1-001
**Source:** claudecertificationguide-mock-01.docx, Q01 (embedded id: q-2-4-006, task-statement ref: D2.4, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

An MCP server exposes a `query_database` tool for Snowflake. Agents ignore it and run SQL via the built-in Bash tool against the Snowflake CLI, even though the MCP tool returns structured results with column types and pagination that Bash does not. What is the most likely cause and fix?

A. The MCP server is not properly connected. Restart the MCP server and verify the connection with a test query.
B. Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash.
C. Disable the Bash tool entirely so the agent is forced to use the MCP tool for all operations.
D. Add a system prompt instruction telling the agent to always use query_database instead of Bash for SQL queries.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: If the server were disconnected, the tool would not appear in the available tools list at all. The agent is choosing not to use it, which is a description problem, not a connectivity problem.
- B: When MCP tool descriptions are sparse, agents default to the familiar Bash tool. Enhancing the description to explain the structured results, column types, and pagination gives the agent enough to prefer the MCP tool for database queries.
- C: Disabling Bash removes a critical general-purpose tool needed for many operations beyond database queries. The fix should make the MCP tool more attractive for its specific use case, not remove other tools.
- D: Whilst a system prompt instruction could work as a short-term fix, it is brittle and does not scale. The root cause is the sparse description. Enhancing the description is the sustainable fix that works across all agents and contexts.

**Where this comes from (per source):** Lesson 2.4: MCP Server Integration (Enhancing MCP descriptions)


### RAW-CG1-002
**Source:** claudecertificationguide-mock-01.docx, Q02 (embedded id: q-1-6-007, task-statement ref: D1.6, title: "Multi-Agent Research System", status in source: Correct)

A multi-agent research system must process a customer's request that involves three sequential stages: data collection, analysis, and report generation. Each stage depends on the output of the previous one. Which orchestration pattern is most appropriate?

A. Parallel orchestration — run all three subagents simultaneously to minimise latency
B. Pipeline orchestration — pass the output of each stage as input to the next in a defined sequence
C. Dynamic adaptive decomposition — let the coordinator decide the order at runtime based on query complexity
D. Hub-and-spoke with all three agents reporting independently to the coordinator

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Parallel execution requires independent tasks. Here, analysis depends on data collection results and report generation depends on analysis results. Running them simultaneously would mean the analysis agent has no data to analyse.
- B: Pipeline orchestration is the correct pattern for sequential dependencies. Each stage completes before the next begins, with the output of one stage serving as the input to the next. This matches the data collection -> analysis -> report generation dependency chain.
- C: Dynamic adaptive decomposition is for open-ended investigation tasks where the next step depends on discoveries. Here, the three stages and their dependencies are known in advance, making a fixed pipeline the more predictable and efficient choice.
- D: Independent reporting ignores the sequential dependencies. The analysis agent cannot produce meaningful results without data collection output. The pipeline must enforce the execution order.

**Where this comes from (per source):** Lesson 1.2: Multi-Agent Orchestration (Coordinator responsibilities)


### RAW-CG1-003
**Source:** claudecertificationguide-mock-01.docx, Q03 (embedded id: q-4-3-004, task-statement ref: D4.3, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system's classification schema has a 'category' field defined as a free-text string. Auditors find 47 different category values in production data, including 'hate speech', 'Hate Speech', 'hate-speech', 'hateful content', and 'hate_speech' — all intended to be the same category. This makes downstream analytics and routing unreliable. What is the best schema fix?

A. Add a post-processing normalisation step that maps all variations to canonical category names
B. Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', and 'harassment', plus an 'other' option.
C. Add detailed instructions to the prompt listing the exact category names and their capitalisation so the model always emits the canonical string.
D. Add few-shot examples showing the correct category formatting for each type

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Post-processing normalisation adds complexity and requires constant maintenance as new variations appear. The schema should prevent the problem at the source rather than patching it downstream.
- B: Enum fields constrain the model to predefined values, eliminating spelling and formatting variations. Including 'other' as an enum value handles edge cases without allowing free-text drift. With strict: true, the schema guarantees only valid enum values are returned.
- C: Prompt instructions are probabilistic. The model may still produce variations despite instructions. Schema-level enforcement via enums is deterministic and cannot be overridden.
- D: Few-shot examples improve consistency but cannot guarantee exact string matching. Schema enums are the correct mechanism for constraining categorical output to a fixed set of values.

**Where this comes from (per source):** Lesson 4.2: Structured Output with Tool Use (Enum schema)


### RAW-CG1-004
**Source:** claudecertificationguide-mock-01.docx, Q04 (embedded id: q-2-2-005, task-statement ref: D2.2, title: "Multi-Agent Research System", status in source: Incorrect)

A research agent calls an external API via an MCP server. After the 30th query in a batch of 50, the API starts returning HTTP 429 errors. The MCP server returns a generic 'Request failed' for every failure, so the agent abandons the batch after three consecutive failures. What MCP server change would most improve resilience?

A. Implement automatic retry with exponential backoff inside the MCP server, hiding rate limits from the agent entirely.
B. Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait.
C. Return errorCategory: 'business', isRetryable: false to tell the agent to stop making requests entirely.
D. Queue all 50 requests at the MCP server level and process them sequentially with built-in rate limiting.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Hiding rate limits from the agent removes its ability to make informed decisions, such as prioritising remaining queries, switching to cached results, or reporting partial progress. The agent should receive structured metadata to decide its own recovery strategy.
- B: Rate limiting is a transient error — it will resolve after a delay. Structured metadata with the specific retry delay lets the agent space out remaining queries intelligently rather than abandoning the batch. The agent can continue processing other tasks while waiting.
- C: Rate limits are transient (they resolve after a delay), not business errors (which represent policy or rule violations the agent cannot recover from). Marking them as non-retryable causes the agent to abandon 20 remaining queries that would succeed after a brief delay.
- D: Server-side queuing removes the agent's ability to prioritise, cancel, or reorder queries based on intermediate results. It also creates a long-running blocking call that prevents the agent from doing other work.

**Where this comes from (per source):** Lesson 2.2: Structured Error Responses (Transient errors and retry-after)


### RAW-CG1-005
**Source:** claudecertificationguide-mock-01.docx, Q05 (embedded id: q-4-5-001, task-statement ref: D4.5, status in source: Correct)

Your manager proposes switching both your blocking pre-merge code review and your overnight technical debt report to the Message Batches API for 50% cost savings. How should you evaluate this proposal?

A. Switch both to batch processing with status polling to check for completion
B. Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks
C. Keep real-time calls for both to avoid batch result ordering issues
D. Switch both to batch with a timeout fallback to real-time if batches take too long

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Batch processing has no guaranteed latency SLA. Polling does not make it suitable for blocking pre-merge checks.
- B: Pre-merge checks are blocking workflows where developers wait. The batch API's 24-hour window makes it unsuitable. Technical debt reports are overnight and latency-tolerant.
- C: Batch results can be correlated using custom_id fields. Ordering is not the issue — latency requirements are.
- D: This adds unnecessary complexity. Match each API to its latency requirements: synchronous for blocking, batch for tolerant.

**Where this comes from (per source):** Lesson 4.5: Batch Processing and Prompt Optimisation (Batches API facts, SLA implications); Anthropic: Message Batches API


### RAW-CG1-006
**Source:** claudecertificationguide-mock-01.docx, Q06 (embedded id: q-5-3-001, task-statement ref: D5.3, title: "Multi-Agent Research System", status in source: Correct)

A web search subagent in a multi-agent research system times out while researching a complex topic. You need to design how this failure information flows back to the coordinator. Which approach best enables intelligent recovery?

A. Return structured error context including failure type, attempted query, partial results, and potential alternative approaches
B. Implement automatic retry with exponential backoff, returning a generic 'search unavailable' status only after all retries are exhausted
C. Catch the timeout and return an empty result set marked as successful
D. Propagate the timeout exception to a top-level handler that terminates the entire research workflow

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: This gives the coordinator everything it needs to decide: retry with modified query, try an alternative approach, or proceed with partial results.
- B: The generic status hides valuable context from the coordinator, preventing informed recovery decisions.
- C: Silent suppression prevents any recovery. The coordinator believes the search succeeded and found nothing, so it will not attempt alternatives.
- D: Workflow termination wastes partial results from other subagents that may have completed successfully.

**Where this comes from (per source):** Lesson 5.3: Error Propagation in Multi-Agent Systems (Structured error context)


### RAW-CG1-007
**Source:** claudecertificationguide-mock-01.docx, Q07 (embedded id: q-1-1-008, task-statement ref: D1.1, title: "Content Moderation and Classification System", status in source: Incorrect)

The moderation system's agentic loop uses a hardcoded decision tree: if the classify_content tool returns 'hate_speech', always call escalate_to_human; if it returns 'spam', always call auto_remove. During testing, the team discovers that satirical posts criticising hate speech are being auto-escalated, and sophisticated spam disguised as legitimate marketing slips through. What is the architectural problem?

A. The classify_content tool needs more granular category labels so it can tell satire criticising hate speech apart from genuine hate speech.
B. Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh the full context of each post before it acts.
C. Add a confidence threshold so only high-confidence classifications trigger automatic actions
D. Route all ambiguous cases to human review to avoid misclassification

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: More granular labels do not address the core issue. A hardcoded decision tree cannot adapt to nuance, such as satire versus genuine hate, no matter how fine the labels are. The fix is model-driven reasoning.
- B: Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context (satire vs genuine hate, sophisticated spam patterns) produces better moderation decisions. The agentic loop should let the model decide, not map labels to fixed actions.
- C: Confidence thresholds reduce false positives but the fundamental problem remains: a hardcoded tree cannot handle contextual nuance. Low-confidence cases still need model-driven reasoning, not just deferral.
- D: Routing everything ambiguous to humans defeats the purpose of automated moderation. The model can reason about context effectively when given the opportunity; the hardcoded tree is what prevents it.

**Where this comes from (per source):** Lesson 1.1: Agentic Loops (Model-driven decision-making, Anti-patterns)


### RAW-CG1-008
**Source:** claudecertificationguide-mock-01.docx, Q08 (embedded id: q-3-6-010, task-statement ref: D3.6, title: "Technical Documentation Maintenance System", status in source: Correct)

A documentation team needs to simultaneously update API reference docs for three independent microservices after a breaking change. Each update requires reading source code, updating Markdown files, and validating links. A single Claude Code session would exhaust the context window trying to hold all three services' code simultaneously. What is the recommended approach?

A. Process the three services sequentially in the same session, running /compact between each service to free context
B. Use git worktree for three branches, each with its own Claude Code session on one service, then merge the results
C. Create a single skill with context: fork that processes all three services in parallel within one session
D. Split the documentation files into smaller chunks and process each chunk in a separate API call using the batch API

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Even with /compact, each service's context (source code, documentation, edits) is substantial. Sequential processing risks context degradation as compaction summaries lose detail from earlier services, and it is slower than parallel processing.
- B: git worktree creates separate working directories on different branches, each with its own isolated Claude Code session. Each session has a full context budget dedicated to one service. The three updates run in parallel without interfering with each other, and results are merged via standard git workflows.
- C: context: fork isolates a skill's output from the main conversation but does not create multiple parallel execution contexts. A single skill cannot simultaneously process three independent services in parallel.
- D: The batch API is for high-throughput, latency-tolerant workloads — not for interactive Claude Code sessions. Documentation updates require interactive exploration of source code and iterative editing, which the batch API does not support.

**Where this comes from (per source):** Anthropic: Claude Code Documentation; Git: Worktrees


### RAW-CG1-009
**Source:** claudecertificationguide-mock-01.docx, Q09 (embedded id: q-2-3-008, task-statement ref: D2.3, title: "Enterprise Data Platform with Federated Queries", status in source: Incorrect)

The data platform team has built an MCP server with 22 tools: query_snowflake, query_postgres, query_api, plus 19 specialised tools for individual data transformations (pivot_table, calculate_percentile, normalise_currency, etc.). Agents take 3-4 turns to select the correct tool and frequently choose the wrong transformation. What is the most effective redesign?

A. Improve all 22 tool descriptions with detailed examples and boundary conditions to help the agent distinguish between them.
B. Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.
C. Use tool_choice: 'any' to force the agent to always call a tool, eliminating turns where the agent reasons without acting.
D. Split the tools across two separate MCP servers — one for queries and one for transformations — to reduce cognitive load.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Better descriptions help, but 22 tools still exceeds the practical limit for reliable selection. Research shows tool selection degrades significantly beyond 4-5 tools per agent. The tool count itself is the problem.
- B: Reducing from 22 to 4 tools brings the count within the optimal 4-5 range for reliable tool selection. The 19 transformation tools share a common pattern (input data, transformation type, output format) and are natural candidates for consolidation into a single parameterised tool.
- C: Forcing tool calls does not improve selection accuracy — it just ensures the agent picks something, potentially the wrong tool. The root cause is too many similar tools, not too few tool calls.
- D: MCP server boundaries are invisible to the agent. All tools from all connected servers appear in a single list. Splitting across servers does not reduce the number of tools the agent must choose from.

**Where this comes from (per source):** Lesson 2.3: Tool Distribution and Tool Choice (Consolidating near-duplicate tools, Tool overload)


### RAW-CG1-010
**Source:** claudecertificationguide-mock-01.docx, Q10 (embedded id: q-3-2-015, task-statement ref: D3.2, title: "Technical Documentation Maintenance System", status in source: Correct)

A documentation team creates a /generate-api-docs skill that reads source code files and produces Markdown API reference pages. The skill generates verbose output (200+ lines per endpoint) and should be available to every team member who clones the repository. How should the skill be configured?

A. Create a SKILL.md in ~/.claude/skills/ with context: fork frontmatter, and instruct each team member to copy it locally
B. Create a SKILL.md in .claude/skills/ with context: fork, so it is shared via git and isolates the verbose output
C. Add the documentation generation instructions to the root CLAUDE.md so they load automatically in every session
D. Create a SKILL.md in .claude/skills/ without any frontmatter, relying on the team to manually manage context overflow

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: ~/.claude/skills/ is user-scoped and not version-controlled. Requiring manual copying defeats the purpose of team-shared configuration and creates maintenance drift.
- B: .claude/skills/ is project-scoped and version-controlled, making it available to every developer who clones the repository. context: fork isolates the verbose 200+ line output per endpoint into a forked context, preventing it from consuming the main conversation's context budget.
- C: CLAUDE.md is for always-loaded standards, not for on-demand command definitions. Loading verbose generation instructions in every session wastes context tokens when the team is doing non-documentation work.
- D: Without context: fork, the verbose output (200+ lines per endpoint across many endpoints) would flood the main conversation context. The context: fork frontmatter is essential for isolating bulky output.

**Where this comes from (per source):** Lesson 3.2: Custom Slash Commands and Skills (context: fork); Claude Code: Skills


### RAW-CG1-011
**Source:** claudecertificationguide-mock-01.docx, Q11 (embedded id: q-5-1-008, task-statement ref: D5.1, title: "Technical Documentation Maintenance System", status in source: Correct)

Claude Code is synthesising release notes from commit messages, PR descriptions, and changelog entries. During a 200+ commit session, summaries of early commits become vague ('various bug fixes') while recent commits are still detailed accurately. The context window is not full. What is the most likely cause?

A. The model's temperature is set too high, causing it to generate vague summaries randomly
B. The lost-in-the-middle effect: the model favours the start and end of long input, losing middle commit detail.
C. The commit messages for early commits are inherently less detailed than recent ones, so the vague summaries are accurate
D. Claude Code applies progressive summarisation to older commits to conserve context for recent ones

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Temperature affects output randomness but would produce inconsistent quality across all commits, not a systematic pattern where early commits are vague and recent commits are accurate.
- B: The lost-in-the-middle effect is a well-documented phenomenon where models attend more strongly to the start and end of long contexts, with reduced attention to middle content. With 200+ commits loaded sequentially, commits in the middle of the sequence receive less attention, producing vague summaries. Processing in smaller batches or reordering critical information to the start and end mitigates this.
- C: The question states the vagueness applies to early commits specifically, not commits with poor messages. The systematic pattern (early = vague, recent = detailed) points to a context positioning effect, not source quality variation.
- D: Claude Code does not automatically apply progressive summarisation to tool results within a single processing step. The context window is not full, so there is no space pressure triggering summarisation. The issue is attention distribution across long inputs.

**Where this comes from (per source):** Lesson 5.1: Context Window Management (Lost in the middle)


### RAW-CG1-012
**Source:** claudecertificationguide-mock-01.docx, Q12 (embedded id: q-1-7-002, task-statement ref: D1.7, title: "Multi-Agent Research System", status in source: Correct)

A research team is using Claude Code to analyse a large dataset. After completing an initial analysis, they want to explore two competing hypotheses: one using a statistical modelling approach and another using a machine learning approach. Both explorations should start from the same baseline analysis but proceed independently. Which session management strategy is correct?

A. Resume the session twice with --resume, once for each hypothesis, running them one after the other
B. Start two fresh sessions, each with an injected summary of the initial analysis, and explore one hypothesis in each
C. Use the initial session and explore both hypotheses sequentially, asking the agent to set aside the first approach before starting the second
D. Use fork_session to create two independent branches from the shared analysis baseline, exploring one hypothesis in each fork

**Correct (per source):** D

**Explanations (per source, verbatim):**
- A: Resuming the same session twice would mean the second resume inherits context from the first hypothesis exploration, contaminating the independent baseline. Each hypothesis needs to diverge from the original analysis, not from each other.
- B: While this avoids context contamination, it loses the full richness of the original analysis context. Fresh start with summary injection is best when tool results are stale. Here, the baseline analysis is still valid and both branches should start from the complete shared baseline.
- C: Sequential exploration in the same session means the second hypothesis is influenced by the first — the agent carries context, conclusions, and biases from the first exploration. Independent exploration requires isolated branches.
- D: fork_session creates independent branches from a shared baseline, which is exactly the use case here. Both forks start from the complete initial analysis but proceed independently. Neither exploration contaminates the other, enabling a clean comparison of the two approaches.

**Where this comes from (per source):** Lesson 1.7: Session State and Resumption (Session management options); Lesson 1.3: Subagent Invocation and Context Passing (fork_session); Anthropic: Claude Code Documentation


### RAW-CG1-013
**Source:** claudecertificationguide-mock-01.docx, Q13 (embedded id: q-5-3-007, task-statement ref: D5.3, title: "Technical Documentation Maintenance System", status in source: Correct)

A documentation generation pipeline uses Claude Code to produce docs from three sources: source code comments, existing wiki pages, and API schema files. During a run, the wiki page retrieval fails with a timeout, but the source code and API schema are available. The pipeline currently halts entirely on any source failure. What is the best error handling strategy?

A. Retry the wiki retrieval three times with exponential backoff. If all retries fail, halt the pipeline to prevent incomplete documentation
B. Return structured error context for the wiki failure, proceed with available sources, and mark the gaps that lack wiki content.
C. Silently skip the wiki source and generate documentation from the remaining two sources without noting the omission
D. Use the source code comments to infer what the wiki pages would have contained, filling in the gaps with generated content

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Halting the entire pipeline because one of three sources is unavailable wastes the successful results from the other two sources. Documentation from source code and API schemas is still valuable even without wiki content.
- B: This produces maximum value from available sources while maintaining transparency about what is missing. Structured error context enables intelligent recovery (retry later, alert the team). Explicit gap markers prevent users from trusting incomplete documentation as complete.
- C: Silent omission hides the failure. Users would trust the documentation as complete, not knowing that wiki-sourced context (which may contain critical operational notes or caveats) is missing.
- D: Inferring wiki content from source code produces hallucinated documentation that appears authoritative. Wiki pages often contain operational context, known issues, and tribal knowledge that cannot be inferred from code.

**Where this comes from (per source):** Lesson 5.3: Error Propagation in Multi-Agent Systems (Structured error context, Coverage annotations)


### RAW-CG1-014
**Source:** claudecertificationguide-mock-01.docx, Q14 (embedded id: q-2-2-006, task-statement ref: D2.2, title: "Multi-Agent Research System", status in source: Incorrect)

A `search_papers` MCP tool has three failure patterns: (1) the upstream academic API returns HTTP 503 during peak hours, (2) users request papers from a restricted journal the system has no licence for, and (3) the agent submits a malformed DOI like 'doi-1234' that fails the input regex. The team wants structured error metadata so agents can handle each case differently. Which `errorCategory` and `isRetryable` combination is correct for all three?

A. All three should be errorCategory: 'transient', isRetryable: true, since they all prevent the tool from completing its task.
B. HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable.
C. HTTP 503: transient/retryable; restricted journal: transient/retryable; malformed DOI: transient/retryable.
D. HTTP 503: validation/retryable; restricted journal: business/not retryable; malformed DOI: business/not retryable.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Lumping every failure into 'transient' is the canonical anti-pattern. The restricted journal case is a business error (licence policy); the agent must escalate, not retry. The malformed DOI is validation; the agent must repair the input format first.
- B: HTTP 503 is a temporary upstream outage (transient, will likely resolve on retry). Restricted journal is a policy limitation (business, will never resolve on retry — escalate or offer an alternative source). Malformed DOI is validation; the agent must repair the input and then retry.
- C: The restricted journal error is not transient — the system lacks a licence, and no amount of retrying will grant access. A malformed DOI is validation, not transient; the agent must repair the input rather than blindly retry the same value.
- D: HTTP 503 is transient (a temporary upstream outage), not validation — nothing is wrong with the request input. A malformed DOI is validation (fix input and retry), not business — business errors represent policy or rule violations, not input format problems.

**Where this comes from (per source):** Lesson 2.2: Structured Error Responses (Four error categories)


### RAW-CG1-015
**Source:** claudecertificationguide-mock-01.docx, Q15 (embedded id: q-4-3-003, task-statement ref: D4.3, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system uses tool_use with a JSON schema for classification output. All fields including 'sub_category' and 'target_demographic' are marked as required. Auditors discover that when a post is spam (which has no target demographic), the model fabricates plausible-sounding demographics like 'general public' or 'young adults.' What schema change prevents this fabrication?

A. Add a validation step that rejects target_demographic values for spam posts
B. Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value.
C. Remove 'target_demographic' from the schema entirely since it causes fabrication
D. Add a prompt instruction telling the model to leave 'target_demographic' empty whenever a post is spam and the field does not apply.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Post-hoc validation catches the problem but does not prevent it. The model still fabricates values; they are just rejected after the fact. Schema design should prevent fabrication at the source.
- B: Required fields pressure the model to produce a value even when none exists. Making the field nullable gives the model a legitimate way to indicate 'not applicable,' eliminating the incentive to fabricate. This is the standard pattern for fields that apply conditionally.
- C: Removing the field loses valuable data for categories where target demographic is genuinely relevant (hate speech, harassment). The fix is making it nullable, not removing it.
- D: Prompt instructions cannot override a schema that marks the field as required. The JSON schema enforces the constraint at the API level, and the model must comply with the schema regardless of prompt instructions.

**Where this comes from (per source):** Lesson 4.2: Structured Output with Tool Use (Nullable fields)


### RAW-CG1-016
**Source:** claudecertificationguide-mock-01.docx, Q16 (embedded id: q-5-6-002, task-statement ref: D5.6, title: "Multi-Agent Research System", status in source: Correct)

A multi-agent research system has three subagents (financial filings, news, technical white papers) and a synthesis agent. Each subagent returns properly attributed findings, but the final synthesised report has no source attribution: stakeholders cannot trace which claim came from which source. Which fix addresses the root cause?

A. Append a bibliography section at the end of the report listing all sources each subagent consulted
B. Have each subagent include source URLs as inline hyperlinks in their prose output so the synthesis agent can preserve them
C. Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them.
D. Store all subagent outputs in a database and have the synthesis agent reference database entries by ID instead of incorporating content directly

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: A bibliography lists sources but does not map specific claims to specific sources. Stakeholders need to know which claim came from which document, not just which documents were consulted overall. This is document-level attribution, not claim-level provenance.
- B: Inline hyperlinks in prose are fragile — the synthesis agent will rewrite, merge, and compress prose during summarisation, stripping or disconnecting links from their associated claims. Attribution must be in structured data, not embedded in prose that gets rewritten.
- C: Structured claim-source mappings survive synthesis because they are data structures, not prose that gets rewritten. The synthesis agent can merge mappings from multiple subagents while preserving the link between each claim and its source. This also enables content-appropriate rendering: financial data as tables, news as prose, technical findings as lists — each with attribution intact.
- D: This adds infrastructure complexity without solving the synthesis problem. The synthesis agent still needs to merge and present findings coherently. Database references do not prevent attribution loss during the summarisation and rewriting that synthesis inherently requires.

**Where this comes from (per source):** Lesson 5.6: Information Provenance and Multi-Source Synthesis (Structured claim-source mappings, Attribution preservation)


### RAW-CG1-017
**Source:** claudecertificationguide-mock-01.docx, Q17 (embedded id: q-2-1-010, task-statement ref: D2.1, title: "Enterprise Data Platform with Federated Queries", status in source: Incorrect)

The data platform's query_snowflake tool has a description that reads: 'Queries Snowflake data warehouse. Accepts SQL.' The agent correctly uses the tool but frequently sends queries using PostgreSQL-specific syntax (e.g. string_agg, which Snowflake spells LISTAGG) that Snowflake rejects. What is the most effective fix?

A. Add a SQL syntax validation layer in front of the MCP tool that rejects non-Snowflake syntax before execution.
B. State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL.
C. Add a system prompt instruction listing all Snowflake-specific SQL functions the agent should use.
D. Have the MCP server automatically translate PostgreSQL syntax to Snowflake syntax before executing the query.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: A validation layer adds infrastructure complexity and maintenance burden. The root cause is that the tool description does not specify which SQL dialect to use. Fixing the description is the proportionate first step.
- B: The description says 'Accepts SQL' without naming the dialect, so the agent defaults to PostgreSQL syntax. Naming the Snowflake dialect and giving examples in the description (LISTAGG rather than string_agg, ILIKE is supported) resolves the misrouting at source.
- C: A system prompt instruction is brittle and consumes context tokens for every turn, even when the Snowflake tool is not being used. The tool description is the correct place for tool-specific dialect guidance.
- D: Auto-translation is fragile and cannot handle all dialect differences. It masks the problem rather than fixing it and introduces a complex transformation layer prone to edge cases.

**Where this comes from (per source):** Lesson 2.1: Tool Interface Design (Dialect-specific descriptions)


### RAW-CG1-018
**Source:** claudecertificationguide-mock-01.docx, Q18 (embedded id: q-4-2-002, task-statement ref: D4.2, status in source: Correct)

Your Claude Code agent generates unit tests in the CI pipeline. When given detailed instructions alone, it produces tests with inconsistent assertion styles: sometimes using expect().toBe(), sometimes assert.equal(), and occasionally mixing both in the same file. Adding more detailed instructions about assertion style did not fix the problem. What should you do next?

A. Switch to a different model that better follows formatting instructions
B. Add a linter post-processing step to automatically convert all assertions to a single style
C. Add 2-4 few-shot examples showing complete test files with the desired assertion style and reasoning for why that style was chosen over alternatives
D. Add 2-4 few-shot examples demonstrating the desired assertion style with reasoning for each testing decision, covering edge cases like async functions and error handling

**Correct (per source):** D

**Explanations (per source, verbatim):**
- A: The issue is not model capability. When detailed instructions alone produce inconsistent formatting, the correct intervention is few-shot examples, not a model change.
- B: Post-processing masks the problem rather than solving it. The model should learn to produce consistent output directly, which few-shot examples achieve more effectively.
- C: This is partially correct but incomplete. The examples only cover the assertion style preference. Without covering varied scenarios (async functions, error handling), the model pattern-matches the specific cases shown rather than generalising the style consistently across all test types.
- D: Few-shot examples are the most effective technique when detailed instructions alone produce inconsistent formatting. Including 2-4 examples with reasoning teaches generalisation to novel patterns, not just pattern-matching. Covering varied scenarios (async, error handling) ensures the model generalises correctly.

**Where this comes from (per source):** Lesson 4.2: Few-Shot Prompting (Few-shot examples); Anthropic: Multishot (Few-Shot) Prompting


### RAW-CG1-019
**Source:** claudecertificationguide-mock-01.docx, Q19 (embedded id: q-1-2-009, task-statement ref: D1.2, title: "Content Moderation and Classification System", status in source: Correct)

The content moderation system uses a hub-and-spoke architecture with a coordinator that routes posts to specialist subagents: a text classifier, an image analyser, and a policy enforcer. The team notices that the image analyser sometimes directly calls the policy enforcer's action tools to remove posts, bypassing the coordinator. What is the architectural violation and how should it be fixed?

A. Give the image analyser its own copy of the policy enforcer's action tools so it can remove posts itself without calling another subagent.
B. The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator.
C. Merge the image analyser and policy enforcer into a single subagent to simplify the communication flow
D. Add a message queue between the image analyser and the policy enforcer so communication is asynchronous

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Duplicating action tools across subagents creates inconsistent enforcement and makes policy changes harder to propagate. The issue is the communication pattern, not tool availability.
- B: In hub-and-spoke orchestration, subagents must be isolated and communicate only through the coordinator. The image analyser should return its classification result to the coordinator, which then decides whether to invoke the policy enforcer. Direct subagent-to-subagent communication breaks the architecture.
- C: Merging subagents with distinct responsibilities (analysis vs enforcement) violates separation of concerns. The image analyser and policy enforcer have fundamentally different roles and tool requirements.
- D: An async queue between subagents still bypasses the coordinator. In hub-and-spoke, all inter-agent communication must flow through the coordinator regardless of synchronicity.

**Where this comes from (per source):** Lesson 1.2: Multi-Agent Orchestration (Isolation principle, Hub-and-spoke architecture)


### RAW-CG1-020
**Source:** claudecertificationguide-mock-01.docx, Q20 (embedded id: q-4-4-003, task-statement ref: D4.4, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system validates that every classification includes a 'reasoning' field explaining the decision. When validation fails (empty reasoning), the system retries. For most posts, the retry succeeds after feeding back the error 'reasoning field was empty — provide a brief justification for the classification.' However, for posts in unfamiliar languages, retries consistently fail. What should the system do?

A. Increase the retry count from 1 to 5 for unfamiliar language posts since the model may succeed with more attempts
B. Retry format errors on analysable posts; route capability gaps like unfamiliar languages to human review.
C. Add the unfamiliar language to the system prompt as a supported language to encourage the model to try harder
D. Remove the reasoning validation requirement for posts in unfamiliar languages

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: More retries are ineffective when the model lacks the capability to analyse content in that language. The failure is not a transient format issue — the model genuinely cannot provide reasoning for content it cannot understand.
- B: The retry boundary distinguishes between fixable format issues and unfixable capability gaps. Empty reasoning on analysable posts is a format error that retries with error feedback can fix. Unfamiliar languages represent absent capability — no amount of retrying will create language understanding. Route these to human review.
- C: Listing an unsupported language in the prompt does not give the model language understanding. This may actually worsen the problem by encouraging fabricated analysis of content the model cannot read.
- D: Removing the validation requirement means these posts would receive classifications without any justification, which undermines auditability. The correct approach is human review, not lower standards.

**Where this comes from (per source):** Lesson 4.4: Validation, Retry, and Feedback Loops (Retry boundary)


### RAW-CG1-021
**Source:** claudecertificationguide-mock-01.docx, Q21 (embedded id: q-3-1-020, task-statement ref: D3.1, title: "Technical Documentation Maintenance System", status in source: Correct)

A developer's Claude Code applies the team's API conventions correctly in some sessions but not others, on the same project. They suspect the wrong memory files are loading in the failing sessions. What is the fastest way to confirm which CLAUDE.md and rules files a session has actually loaded?

A. Run /memory in the session to list the loaded memory files
B. Run /compact to reload the configuration hierarchy from disk
C. Delete ~/.claude/CLAUDE.md so only project-level configuration can load
D. Ask Claude in the session to repeat the team's API conventions back

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: /memory is the diagnostic command for the configuration hierarchy: it shows which user-level, project-level, and directory-level memory files the current session has loaded, which directly confirms or rules out the suspected loading difference.
- B: /compact summarises the conversation to free context; it does not reload or report configuration files. CLAUDE.md content survives compaction, so this neither diagnoses nor fixes a loading difference.
- C: Deleting user-level configuration is a destructive guess. It might mask the symptom, but it destroys the developer's personal setup without ever confirming what the failing sessions were loading.
- D: The model can paraphrase conventions from training or partial context, so a fluent answer does not prove the files loaded. /memory reports the loaded files deterministically instead of relying on the model's self-report.

**Where this comes from (per source):** Lesson 3.1: CLAUDE.md Hierarchy and Scoping (/memory and CLAUDE.md persistence); Claude Code: Memory and CLAUDE.md


### RAW-CG1-022
**Source:** claudecertificationguide-mock-01.docx, Q22 (embedded id: q-1-2-012, task-statement ref: D1.2, title: "Multi-Agent Research System", status in source: Correct)

In a multi-agent research system the coordinator delegates to search and analysis subagents, then invokes a synthesis subagent. Reviewing the synthesis, the coordinator finds two claims with no supporting evidence and one sub-question left unanswered. What is the coordinator's correct next step?

A. Assess the synthesis for gaps, re-delegate targeted follow-up queries to fill them, then re-invoke synthesis with the new findings.
B. Accept the synthesis as final, since re-running the search and analysis subagents would push the coordinator past its configured iteration budget.
C. Tell the synthesis subagent to fill the gaps from its own knowledge, without any new delegation
D. Restart the whole pipeline from scratch with a fresh coordinator to avoid contaminated context

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: The coordinator owns iterative refinement: assess the synthesis for gaps, re-delegate focused follow-up queries, then re-synthesise. This closes the evidence gaps without discarding the work already done.
- B: Shipping unsupported claims to save iterations defeats the purpose of the review. The iteration cap is a runaway safety net, not a reason to leave known gaps unfilled.
- C: The synthesis subagent has no tools or sources to gather new evidence. Asking it to invent the missing support produces exactly the unsourced claims the review is meant to catch; new evidence requires re-delegation.
- D: A full restart throws away correct findings and repeats work. Targeted re-delegation of only the missing pieces is the efficient, guide-recommended fix.

**Where this comes from (per source):** Lesson 1.2: Multi-Agent Orchestration (Coordinator responsibilities)


### RAW-CG1-023
**Source:** claudecertificationguide-mock-01.docx, Q23 (embedded id: q-4-3-002, task-statement ref: D4.3, status in source: Correct)

Your legal document extraction pipeline uses tool_use with tool_choice set to 'auto'. The pipeline processes contracts and sometimes receives plain text analysis instead of the structured JSON extraction you need. The team suggests switching to prompt-based JSON with explicit formatting instructions. What is the correct approach?

A. Switch to prompt-based JSON as suggested, since the model clearly prefers text responses for these documents
B. Keep tool_use but switch tool_choice from 'auto' to 'any' to guarantee the model always returns a structured tool call
C. Keep tool_use and set tool_choice to force the specific extraction tool by name, guaranteeing structured output on every request.
D. Add stronger instructions in the system prompt telling the model to always use the extraction tool and never respond with plain text

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: Prompt-based JSON is less reliable than tool_use and can produce malformed output. The issue is tool_choice configuration, not the tool_use mechanism itself.
- B: While 'any' guarantees a tool call, it lets the model choose which tool. If you have multiple tools defined, the model might call the wrong one. For a single extraction tool, this works, but the most precise solution is to force the specific extraction tool.
- C: Forcing a specific tool with tool_choice {type: 'tool', name: 'extract_contract'} guarantees the model calls that exact tool every time, eliminating both text-only responses and wrong-tool selection. This is the most reliable approach for guaranteed structured output.
- D: Instructions alone cannot guarantee tool use when tool_choice is 'auto'. The API-level tool_choice parameter is the correct mechanism for enforcing structured output, not prompt instructions.

**Where this comes from (per source):** Lesson 4.2: Structured Output with Tool Use (tool_choice forcing); Anthropic: Tool Use Documentation


### RAW-CG1-024
**Source:** claudecertificationguide-mock-01.docx, Q24 (embedded id: q-3-4-006, task-statement ref: D3.4, status in source: Correct)

A developer extracting the notification subsystem from a monolith faces 12 cross-module dependencies, 3 messaging patterns, and several valid extraction strategies. They start in direct execution mode. After moving 8 files, the chosen approach breaks circular dependencies with the user-profile module. What should they have done differently?

A. Used direct execution but with more detailed upfront instructions specifying how to handle each dependency
B. Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing
C. Used direct execution but processed only 2 files at a time to catch problems earlier
D. Delegated the entire extraction to a subagent to isolate the risk

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: The developer did not know about the circular dependency with the user-profile module upfront. More detailed instructions cannot account for undiscovered dependencies. The codebase needed exploration first.
- B: A subsystem with 12 dependencies, multiple messaging patterns, and several valid strategies is a textbook plan mode scenario. Plan mode would have mapped the dependency graph and revealed the circular dependency with user-profile before any files were moved, avoiding costly rework.
- C: Smaller batches in direct execution do not address the fundamental issue: the developer chose a strategy without understanding the full dependency landscape. The circular dependency would still be discovered mid-migration, just slightly sooner.
- D: Delegating to a subagent does not change the outcome if the subagent also uses direct execution without exploring dependencies. The mode of execution (plan vs direct) matters more than who executes it.

**Where this comes from (per source):** Lesson 3.4: Plan Mode vs Direct Execution (Plan mode for migrations, Recognising complexity)


### RAW-CG1-025
**Source:** claudecertificationguide-mock-01.docx, Q25 (embedded id: q-5-1-005, task-statement ref: D5.1, title: "Enterprise Data Platform with Federated Queries", status in source: Incorrect)

An analytics agent queries Snowflake and receives 40+ columns per row, only 5 of which are relevant to the user's question about quarterly revenue. The agent appends the full result set to context. After three such queries the window is nearly full and follow-up questions fail. What is the most effective fix?

A. Upgrade to a model with a larger context window so that full result sets can be accommodated across more queries.
B. Trim tool results to only the relevant columns before appending them to the conversation context.
C. Store all query results in an external database and have the agent retrieve specific values on demand instead of keeping results in context.
D. Limit the number of rows returned by each query to reduce the total data volume in context.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: A larger context window postpones the problem but does not solve it. Each full result set still wastes tokens on 35+ irrelevant columns, and the context will eventually fill regardless of size.
- B: Tool result trimming removes irrelevant fields before they enter the context window. Keeping only the 5 relevant columns from each 40+ column result set dramatically reduces token consumption, allowing the agent to handle many more queries within the same context budget.
- C: External storage adds infrastructure complexity without addressing the core issue. The agent still needs some result data in context to reason about it. Trimming irrelevant fields is simpler and directly reduces context consumption.
- D: Row limits reduce data volume but may exclude relevant rows. The problem is column-level verbosity (35+ irrelevant columns per row), not row count. Trimming columns preserves all relevant rows whilst eliminating irrelevant fields.

**Where this comes from (per source):** Lesson 5.1: Context Window Management (Tool result trimming, Upstream optimisation)


### RAW-CG1-026
**Source:** claudecertificationguide-mock-01.docx, Q26 (embedded id: q-2-1-011, task-statement ref: D2.1, title: "Enterprise Data Platform with Federated Queries", status in source: Incorrect)
**Format:** MULTI-SELECT (Select 3)

<!-- CORRECT-ANSWER-INFERRED: multi-select ('Select 3') question: source does not explicitly mark the full correct set. The set shown was inferred from whether each option's own explanation argues for or against it -- editorial best-effort, not verbatim source data. -->

Your federated query platform exposes several similar search tools, and Claude keeps routing requests to the wrong one. Which changes improve tool selection reliability? (Select 3)

A. Rename tools whose names overlap so each name reflects a distinct function.
B. Trim every description to one short sentence so the model relies on tool names alone.
C. Check the system prompt for keyword-sensitive instructions that create unintended associations with particular tools.
D. Rewrite each description to state the tool's purpose, inputs and outputs, and when to prefer it.
E. Merge the similar tools into one generic tool with a mode parameter.

**Correct (per source, select 3, inferred):** A, C, D

**Explanations (per source, verbatim):**
- A: The guide's example renames analyze_content to extract_web_results, removing the functional overlap that caused misrouting.
- B: Minimal descriptions cause unreliable selection among similar tools; names alone cannot carry boundary information.
- C: System prompt wording can override well-written descriptions, so it belongs in the same review.
- D: Descriptions are the primary signal Claude uses to choose tools; differentiating them is the first fix for misrouting.
- E: The guide moves in the opposite direction: split generic tools into purpose-specific tools with defined contracts.

**Where this comes from (per source):** Lesson 2.1: Tool Interface Design (Misrouting, Dialect-specific descriptions); Anthropic: Tool Use Documentation


### RAW-CG1-027
**Source:** claudecertificationguide-mock-01.docx, Q27 (embedded id: q-2-4-007, task-statement ref: D2.4, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

An enterprise data platform team is evaluating how to integrate with their existing PostgreSQL database, Slack workspace, and a custom internal approval workflow. A developer proposes building three custom MCP servers. What is the correct approach?

A. Build all three custom MCP servers to ensure tight integration with the team's specific requirements and coding standards.
B. Use community MCP servers for PostgreSQL and Slack, and build a custom server only for the internal approval workflow that has no community equivalent.
C. Skip MCP entirely and use direct API calls from Bash for all three integrations to avoid the overhead of running MCP servers.
D. Use community MCP servers for all three integrations, adapting the internal approval workflow to fit an existing community server's interface.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Building custom servers for PostgreSQL and Slack is unnecessary when well-maintained community servers already exist for these standard integrations. Custom builds should be reserved for genuinely unique workflows.
- B: Community servers should be evaluated first for standard integrations. PostgreSQL and Slack have well-maintained community MCP servers. The internal approval workflow is team-specific with no community equivalent, making it the only justified custom build.
- C: Direct API calls bypass the MCP tool interface, losing the benefits of structured tool descriptions, standardised error handling, and agent-native integration. MCP servers provide a consistent interface that agents understand natively.
- D: Forcing a custom internal workflow into a community server's interface leads to awkward abstractions and missing functionality. The community-first principle applies to standard integrations, not to genuinely unique team-specific workflows.

**Where this comes from (per source):** Lesson 2.4: MCP Server Integration (Build-vs-use); Claude Code: MCP Server Configuration


### RAW-CG1-028
**Source:** claudecertificationguide-mock-01.docx, Q28 (embedded id: q-4-6-004, task-statement ref: D4.6, status in source: Correct)

Your CI/CD code review system analyses pull requests averaging 8-12 files. Reviews are thorough on the first few files but become increasingly superficial on later files, sometimes missing obvious issues. What architectural change best addresses this pattern?

A. Randomise the file order before each review run so a different subset of files receives the thorough early-pass attention each time.
B. Increase the model's context window to give it more space to analyse all files
C. Split the review into per-file passes so each file gets dedicated attention, then a cross-file integration pass.
D. Add a second full-PR review pass and merge findings from both passes

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: Randomising order means different files get superficial treatment each time, but does not ensure all files receive thorough review. The root cause — attention dilution — remains.
- B: Attention dilution is not a context window size problem. The model has enough space but distributes attention unevenly across many files.
- C: Per-file analysis ensures each file receives consistent, thorough attention. The cross-file integration pass then catches issues that span multiple files, such as inconsistent interfaces or data flow problems. This directly solves attention dilution.
- D: A second pass on the full PR suffers from the same attention dilution. Both passes will likely be thorough on early files and superficial on later ones.

**Where this comes from (per source):** Lesson 4.6: Multi-Instance Review and Output Validation (Multi-pass review, Why context windows do not fix it)


### RAW-CG1-029
**Source:** claudecertificationguide-mock-01.docx, Q29 (embedded id: q-1-3-017, task-statement ref: D1.3, title: "Multi-Agent Research System", status in source: Incorrect)

A web search agent has 9 tools: `web_search`, `url_fetch`, `html_parse`, `pdf_extract`, `image_ocr`, `translate`, `summarise`, `keyword_extract`, `sentiment_analysis`. In testing it frequently calls `summarise` and `sentiment_analysis` when it should only fetch raw data. How should the architect fix this?

A. Add system prompt instructions telling the web search agent to only use data fetching tools and ignore analysis tools
B. Reduce the web search agent to the 4-5 data-fetching tools and move the analysis tools to the specialist agents.
C. Keep all 9 tools but implement PreToolUse hooks that block the web search agent from calling summarise and sentiment_analysis
D. Merge the web search and synthesis agents into a single agent since they share some tools

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Prompt instructions are probabilistic and the agent is already misusing tools. The architectural fix is to remove the tools it should not have, providing deterministic enforcement through scoped tool access.
- B: The recommended maximum is 4-5 tools per agent. The web search agent has 9 tools, causing it to use tools outside its intended role. Reducing to data-fetching tools enforces scoped access. The analysis tools (summarise, sentiment_analysis, keyword_extract) belong with the synthesis or analysis agents.
- C: Using hooks to block tool access is an over-engineered workaround for what should be a configuration fix. The proper solution is to remove the tools from allowedTools, not to provide them and then block their use.
- D: Merging agents violates the principle of specialised subagents. The solution is to separate tools by role, not to combine agents. Merging would create an even larger tool set on a single agent.

**Where this comes from (per source):** Lesson 1.4: Workflow Enforcement and Handoff (Scoped tool access (4-5 tools)); Anthropic: Claude Agent SDK Overview


### RAW-CG1-030
**Source:** claudecertificationguide-mock-01.docx, Q30 (embedded id: q-3-6-005, task-statement ref: D3.6, status in source: Incorrect)

A CI/CD pipeline runs three Claude Code steps in sequence: (1) generate a changelog from git commits, (2) review the changelog for accuracy, and (3) check for breaking changes. The team notices that step 2 never flags inaccuracies and step 3 misses obvious breaking changes that the changelog omits. What is the root cause?

A. The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog
B. The CLAUDE.md file does not contain changelog formatting standards, so the review step has no criteria to evaluate against
C. The -p flag is not being used, causing each step to wait for interactive input
D. The steps need to use --output-format json so that each step can parse the previous step's structured output

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: When review and analysis steps share context with the generation step, they inherit the original reasoning and are less likely to identify gaps or errors. Independent sessions force each step to evaluate the changelog from scratch without bias from the generation reasoning. Session context isolation is critical for CI/CD review pipelines.
- B: Missing formatting standards would affect the quality of the generated changelog, not the review's ability to catch inaccuracies. The pattern of reviews consistently missing issues points to shared-context bias, not missing criteria.
- C: If -p were missing, the pipeline would hang rather than produce output that misses issues. The steps are producing output (the changelog is generated, reviews complete), but the reviews are ineffective.
- D: Output format affects how results are structured, not whether reviews are thorough. JSON output would help with parsing but would not address the fundamental issue of review steps retaining generation context bias.

**Where this comes from (per source):** Lesson 3.6: CI/CD Integration (Session context isolation)


### RAW-CG1-031
**Source:** claudecertificationguide-mock-01.docx, Q31 (embedded id: q-4-4-004, task-statement ref: D4.4, title: "Content Moderation and Classification System", status in source: Incorrect)

A moderation classification tool includes a `detected_patterns` array where the model lists specific patterns it identified (e.g. 'repeated slur targeting ethnicity'). Validation checks whether the detected patterns match the assigned category, and on mismatch retries with feedback like 'You classified this as spam but detected patterns of hate speech targeting ethnicity, please re-evaluate.' What is the primary benefit of the `detected_patterns` field in this workflow?

A. It lets the system auto-correct the category by overriding the model's classification with a rule-based pattern match
B. It provides an auditable evidence trail showing which specific content features drove each moderation decision
C. It lets validation detect reasoning inconsistencies and feed back targeted errors the model uses to self-correct.
D. It increases classification accuracy by forcing the model to identify specific patterns before assigning a category

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: The system does not override the model's classification. It feeds back the inconsistency and asks the model to re-evaluate. The model may correct its category or its patterns — the point is self-correction, not rule-based override.
- B: Auditability is a secondary benefit. The primary benefit in this validation/retry workflow is enabling the system to detect and feed back reasoning inconsistencies for self-correction.
- C: The detected_patterns field externalises the model's reasoning into structured data that can be programmatically validated against the conclusion. When patterns and category are inconsistent, the specific error feedback ('you detected hate speech patterns but classified as spam') gives the model actionable information to self-correct. This is the core benefit in a retry-with-error-feedback workflow.
- D: While structured reasoning fields can improve accuracy, this framing misses the retry workflow context. The primary benefit is enabling programmatic validation of reasoning consistency and targeted feedback for self-correction.

**Where this comes from (per source):** Lesson 4.4: Validation, Retry, and Feedback Loops (detected_patterns fields, Self-correction flow)


### RAW-CG1-032
**Source:** claudecertificationguide-mock-01.docx, Q32 (embedded id: q-1-3-015, task-statement ref: D1.3, title: "Multi-Agent Research System", status in source: Correct)

A coordinator spawns a research subagent to investigate market trends. The subagent returns detailed findings. The coordinator then needs to pass these findings to a synthesis subagent for report writing. However, the synthesis subagent produces a report that contradicts the research findings. What is the most likely cause?

A. The synthesis subagent has a conflicting system prompt that overrides the research data
B. The coordinator passes a summary instead of the full structured research output, so the synthesis agent fills gaps from its training data.
C. The synthesis subagent has its own web search tool and keeps pulling contradictory information from the open web instead of the research it was handed.
D. The two subagents are using different model versions with different training data

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: While possible, conflicting system prompts would produce consistently wrong outputs across all requests. The more common cause is that the coordinator is not passing the full research output, so the synthesis agent fills gaps with its own training data.
- B: Subagents do not share memory. The coordinator must explicitly pass the complete research output to the synthesis agent. If the coordinator only passes a summary, the synthesis agent has no access to the detailed findings and will rely on its training data to fill gaps, potentially contradicting the actual research.
- C: A synthesis subagent should not have web search tools; that violates scoped tool access. The real issue is that the full research output is not being passed to it, not that it is searching the web.
- D: Model version differences would not cause contradictions with explicitly provided research data. The issue is that the research data is not being fully passed to the synthesis agent, not that the agents have different base knowledge.

**Where this comes from (per source):** Lesson 1.3: Subagent Invocation and Context Passing (Context passing, Structured metadata format)


### RAW-CG1-033
**Source:** claudecertificationguide-mock-01.docx, Q33 (embedded id: q-5-1-010, task-statement ref: D5.1, title: "Multi-Agent Research System", status in source: Correct)

A multi-agent system runs a 45-minute deep research workflow. Around the 30-minute mark, the coordinator's synthesis quality drops: it refers to 'the key findings' instead of specific statistics it cited earlier, and misattributes a claim from the financial subagent to the news subagent. No token limits or errors have been hit. What is the most likely diagnosis and correct mitigation?

A. The model is experiencing 'fatigue' from a long session and needs a cooldown period before continuing
B. Context degradation: early results are buried deep in a long context. Consolidate key findings into a structured block near the end.
C. The token limit has been silently exceeded and the API is truncating early messages. Upgrade to a larger context window model
D. The subagents are returning inconsistent data, confusing the coordinator. Add data validation to each subagent's output before it reaches the coordinator

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: LLMs do not experience fatigue. Each inference is independent. The degradation is caused by context window dynamics, not model tiredness.
- B: Context degradation occurs when important information is buried deep in a long conversation. The model's attention to early content diminishes as new content accumulates. Consolidating key findings into a recent, structured block keeps them in the model's effective attention window without losing the specifics.
- C: The question states no token limits have been hit. Context degradation occurs well before token limits are reached — it is an attention quality issue, not a capacity issue.
- D: The coordinator previously cited these same findings correctly earlier in the session. The issue is not data quality from subagents but the coordinator's degrading attention to that data over time.

**Where this comes from (per source):** Lesson 5.4: Codebase Exploration and Context Degradation (Context degradation, Summary injection)


### RAW-CG1-034
**Source:** claudecertificationguide-mock-01.docx, Q34 (embedded id: q-3-4-008, task-statement ref: D3.4, title: "Technical Documentation Maintenance System", status in source: Correct)

A documentation team must update architecture guides across 25 microservice directories after a platform migration. Each guide requires reading source, checking dependencies, and rewriting affected sections. Working in direct execution mode, a team member updates three services before noticing the results are inconsistent: some guides still mention the old platform, others use inconsistent terminology for the new one. What went wrong and what is the correct approach?

A. The team member should have used plan mode to set a consistent update strategy and terminology before executing across all 25 services
B. Direct execution was correct but should have been done in a single continuous session to maintain consistency through conversation context
C. The team member should have created a custom slash command that hardcodes the exact text replacements for each service
D. The team member should have used the Explore subagent to discover all affected files first, then made all changes in a single batch

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: A 25-service migration with consistency requirements is a multi-step, cross-file operation where planning is essential. Plan mode would produce an explicit strategy covering terminology, update order, and validation criteria before any changes are made, preventing the inconsistency that emerged from ad hoc execution.
- B: A single session updating 25 services would exhaust the context window, causing later updates to lose awareness of earlier decisions. Context degradation would worsen the inconsistency problem, not solve it.
- C: Architecture guides require contextual understanding of each service's code and dependencies — not mechanical text replacement. A slash command cannot adapt to the unique structure of each guide.
- D: Discovery alone does not solve the consistency problem. Without an explicit plan defining terminology and update patterns, batch execution would produce the same inconsistencies faster.

**Where this comes from (per source):** Lesson 3.4: Plan Mode vs Direct Execution (Plan mode for consistency, Decision framework)


### RAW-CG1-035
**Source:** claudecertificationguide-mock-01.docx, Q35 (embedded id: q-1-3-016, task-statement ref: D1.3, title: "Multi-Agent Research System", status in source: Correct)

A coordinator delegates to a data collection agent (`web_search`, `database_query`) and an analysis agent (`calculate`, `chart_generate`). In testing, the analysis agent calls `web_search` directly to fetch extra context, bypassing the data collection agent. What is the architectural violation and how should it be fixed?

A. The analysis agent's allowedTools includes web_search; remove it so only the data collection agent has it.
B. Add a system prompt instruction telling the analysis agent not to use web_search even though it has access
C. Allow the analysis agent to keep web_search access since it sometimes needs additional context for better analysis
D. Implement a PostToolUse hook that logs when the analysis agent uses web_search for monitoring purposes

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: Each agent should only have tools relevant to its specific role. The analysis agent should have calculate and chart_generate, not web_search. If the analysis agent needs additional data, it should request it through the coordinator, which then delegates to the data collection agent. This enforces the scoped tool access principle.
- B: Prompt instructions are probabilistic. The agent is already occasionally using web_search despite the architectural intent. The fix is to remove the tool from allowedTools, providing deterministic enforcement rather than hoping the prompt works.
- C: This violates scoped tool access and bypasses the data collection agent's role. If the analysis agent needs more data, the correct flow is: analysis agent signals the coordinator, coordinator delegates to the data collection agent, results flow back through the coordinator.
- D: Logging the violation does not prevent it. The architectural fix is to remove web_search from the analysis agent's allowedTools, not to monitor its misuse.

**Where this comes from (per source):** Lesson 1.4: Workflow Enforcement and Handoff (Scoped tool access); Anthropic: Claude Agent SDK Overview


### RAW-CG1-036
**Source:** claudecertificationguide-mock-01.docx, Q36 (embedded id: q-3-1-018, task-statement ref: D3.1, title: "Technical Documentation Maintenance System", status in source: Correct)

A documentation team wants to archive the full conversation transcript to a log file every time Claude Code runs /compact, so that context lost during compaction can be reviewed later. Which hook configuration achieves this?

A. A PostToolUse hook on Write that snapshots the transcript whenever a file is written, on the assumption /compact will eventually run
B. A PreCompact hook that writes the current transcript to a timestamped log file before /compact summarises the conversation
C. A PreToolUse hook configured on a built-in 'Compact' tool, matching tool name 'Compact'
D. A PostToolUse hook on all tools that appends each tool result to a running log file, creating a continuous archive

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Write and compaction are unrelated. PostToolUse on Write would fire on every file write whether or not /compact is about to run, producing noise rather than a transcript at the right moment. The dedicated PreCompact event is the correct hook.
- B: PreCompact is a first-class hook event in Claude Code that fires immediately before /compact (or auto-compaction) runs. The hook receives the full pre-compaction transcript path and can copy or process it before summarisation discards detail. This is the documented mechanism for exactly this use case.
- C: There is no 'Compact' tool exposed to PreToolUse. Compaction is a Claude Code lifecycle operation, not a model-invoked tool, so it has its own dedicated PreCompact event rather than being hooked via PreToolUse.
- D: Logging every tool result creates enormous log files and does not capture conversation context (reasoning, planning, user messages). The targeted PreCompact event captures the full transcript at the critical moment without per-tool noise.

**Where this comes from (per source):** Claude Code: Hooks


### RAW-CG1-037
**Source:** claudecertificationguide-mock-01.docx, Q37 (embedded id: q-1-3-010, task-statement ref: D1.3, title: "Content Moderation and Classification System", status in source: Correct)

A user reports a post that contains both potentially defamatory text and an embedded image that may violate graphic content policies. The coordinator receives this report as a single moderation request. What is the correct delegation strategy?

A. Send the entire report to the text classifier first, then forward its output to the image analyser so the image step runs only after the text step has finished.
B. Send the entire report to whichever subagent handles the more severe category
C. Route the text to the text classifier and the image to the image analyser in parallel, then aggregate both results for the final decision.
D. Create a new combined text-and-image subagent specifically for multi-modal reports

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: Sequential processing creates unnecessary latency when the two concerns are independent. The text and image analyses do not depend on each other and can run in parallel.
- B: Severity cannot be determined until both analyses are complete. Routing to a single subagent also means one concern goes unanalysed.
- C: The coordinator should decompose multi-concern requests into independent subtasks. Text defamation and image policy violations are separate analysis dimensions that can be evaluated in parallel. The coordinator aggregates the results to make a unified moderation decision.
- D: Creating a new combined subagent duplicates capability that already exists in the specialist subagents. The coordinator's role is to decompose and delegate, not to spawn new agents for every combination of concerns.

**Where this comes from (per source):** Lesson 1.3: Subagent Invocation and Context Passing (Parallel spawning); Lesson 1.4: Workflow Enforcement and Handoff (Multi-concern request handling)


### RAW-CG1-038
**Source:** claudecertificationguide-mock-01.docx, Q38 (embedded id: q-2-4-012, task-statement ref: D2.4, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

A data-analysis agent connects to an MCP server that exposes 40 database tables. Before almost every query, the agent makes several exploratory tool calls to discover which tables exist and what columns they hold, adding latency and token cost to each task. The server author wants to remove this discovery overhead. What is the most effective change?

A. Expose the table catalogue and column schemas as MCP resources for upfront visibility.
B. Add a describe_schema tool and instruct the agent in its system prompt to call it before every query.
C. Enlarge the agent's context window so it can retain the results of the discovery calls across turns.
D. Reduce the server to the five most frequently queried tables so there is less to discover.

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: MCP resources expose content catalogues such as database schemas, documentation hierarchies, and issue summaries, giving the agent visibility into available data upfront. The agent no longer needs to call list_tables and then describe_table for each table, which removes the discovery overhead entirely.
- B: This keeps an exploratory tool call on every task, which is the exact overhead the author wants to remove. Resources present the catalogue without a per-task call.
- C: A larger context window does not stop the agent making the discovery calls; it still pays the latency and token cost on each task and merely stores the results.
- D: This discards capability the agent legitimately needs and still leaves discovery calls for the remaining tables. It treats the symptom, not the discovery mechanism.

**Where this comes from (per source):** Lesson 2.4: MCP Server Integration (MCP resources); Model Context Protocol: Resources


### RAW-CG1-039
**Source:** claudecertificationguide-mock-01.docx, Q39 (embedded id: q-5-5-007, task-statement ref: D5.5, title: "Technical Documentation Maintenance System", status in source: Correct)

Claude Code generates API reference pages for 150 endpoints across three categories: payment processing (30 endpoints, high regulatory risk), internal tooling (80 endpoints, low risk), and public data queries (40 endpoints, moderate risk). The team cannot manually review all 150. How should they structure human review?

A. Randomly sample 15% of all endpoints (approximately 23 pages) for review, ensuring a representative cross-section
B. Use stratified sampling: review 100% of payment docs, 10% of public data query docs, and 5% of internal tooling docs.
C. Review only the payment processing endpoints since they are the highest risk, and trust Claude Code's output for the remaining 120 endpoints
D. Have Claude Code self-assess each generated page with a confidence score and only review pages where confidence falls below 80%

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Uniform random sampling treats all endpoints equally, but payment processing endpoints carry much higher risk. A 15% sample might only include 4-5 payment endpoints, inadequately covering the highest-risk category.
- B: Stratified sampling allocates review effort proportional to risk. Payment processing documentation has regulatory implications warranting full review. Public data queries affect external users and deserve moderate scrutiny. Internal tooling has the lowest blast radius and can tolerate the lightest review. This achieves thorough coverage of critical content within a manageable review budget.
- C: Completely skipping review for 120 endpoints risks undetected errors in public-facing documentation. Even low-risk internal tooling docs should have some sample review to catch systematic generation issues that might affect all categories.
- D: LLM self-reported confidence is poorly calibrated. Claude Code may report high confidence on pages with subtle factual errors (e.g., incorrect parameter types, wrong default values) because the generated text is fluent and internally consistent.

**Where this comes from (per source):** Lesson 5.5: Human Review and Confidence Calibration (Reviewer capacity, Stratified sampling)


### RAW-CG1-040
**Source:** claudecertificationguide-mock-01.docx, Q40 (embedded id: q-5-4-005, task-statement ref: D5.4, title: "Technical Documentation Maintenance System", status in source: Incorrect)

Claude Code is auditing API documentation coverage across a large codebase. After exploring 15 modules, the agent produces vague references like 'the authentication module follows standard patterns' instead of citing specific class names and method signatures it discovered earlier. `/compact` has already been used once. What is the most effective next step?

A. Run /compact again to further reduce context usage and continue the exploration in the same session.
B. Delegate remaining module explorations to subagents, giving each a scratchpad summary of findings so far.
C. Start a fresh session and re-explore all 15 modules more efficiently to rebuild the context with only essential findings.
D. Increase the model's temperature to encourage more detailed and specific outputs instead of vague pattern references.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Running /compact again may help marginally, but the fundamental problem is that the agent's context has filled with verbose discovery output from 15 modules. Compacting alone does not restore the specific findings that have been lost to context degradation.
- B: Subagent delegation isolates verbose exploration output from the main agent's context. The scratchpad file persists specific findings (class names, method signatures) across context boundaries. The main agent retains enough context for coordination without being overwhelmed by discovery output.
- C: Re-exploring 15 modules wastes significant time and effort. The specific findings from earlier exploration are lost. A scratchpad file would have preserved them, and subagent delegation prevents the problem going forward.
- D: Temperature affects output randomness, not the model's ability to recall specific findings from earlier in a long context. The problem is context degradation from verbose output accumulation, not generation settings.

**Where this comes from (per source):** Lesson 5.4: Codebase Exploration and Context Degradation (Subagent delegation, Scratchpad files)


### RAW-CG1-041
**Source:** claudecertificationguide-mock-01.docx, Q41 (embedded id: q-3-3-010, task-statement ref: D3.3, title: "Technical Documentation Maintenance System", status in source: Correct)

A docs team maintains three content types in `docs/api/`, `docs/architecture/`, and `docs/runbooks/`, each with distinct formatting, terminology, and required sections. They want Claude Code to apply the correct standards automatically when editing any docs file, without loading all three rule sets in every session. What is the correct configuration architecture?

A. Place all three sets of rules in the root CLAUDE.md with clear section headings so Claude Code can identify which rules apply
B. Create three rule files in .claude/rules/ with YAML frontmatter paths targeting each directory: paths: ['docs/api/**'] for API rules, paths: ['docs/architecture/**'] for architecture rules, and paths: ['docs/runbooks/**'] for runbook rules
C. Place a separate CLAUDE.md file in each of docs/api/, docs/architecture/, and docs/runbooks/ with the type-specific rules
D. Create three custom skills (/api-docs, /arch-docs, /runbook-docs) and require writers to invoke the correct one before editing

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Root CLAUDE.md loads for every session. Including all three rule sets wastes context tokens when editing only one documentation type. The model must also correctly identify which section applies, adding an unnecessary point of failure.
- B: Path-scoped rules in .claude/rules/ with glob patterns load only when editing files in the matching directory. Each documentation type gets its own rules loaded automatically and exclusively, conserving context tokens and eliminating the risk of applying incorrect standards.
- C: Directory-level CLAUDE.md files load based on the working directory hierarchy, but Claude Code sessions typically operate from the repository root. These directory-level files would only load when the agent is directly working within that specific directory, which is less reliable than path-scoped rules that match by file pattern regardless of working directory.
- D: This scenario explicitly requires writers to invoke the right skill manually, which depends on human memory and discipline — the wrong pick silently applies the wrong standards. Even if the skills added a paths frontmatter to auto-activate, they'd still load as a task-style workflow rather than as always-in-context guidance. Path-scoped rules in .claude/rules/ are the correct choice: they load into context automatically when Claude reads a matching file, with no human step in the loop.

**Where this comes from (per source):** Lesson 3.3: Path-Specific Rules (Practical rule examples, Path-specific rules)


### RAW-CG1-042
**Source:** claudecertificationguide-mock-01.docx, Q42 (embedded id: q-3-6-004, task-statement ref: D3.6, status in source: Correct)

A team wants their CI pipeline to run Claude Code for both PR code review and automated test generation. The PR review should output structured JSON for integration with their review dashboard, while the test generation should produce standard text output. How should the two pipeline steps be configured?

A. Run both steps with -p and configure the review dashboard to parse plain text output from both steps
B. Run the review step with -p --output-format json and the test generation step with -p only, as separate non-interactive invocations
C. Run both steps in a single Claude Code session with -p, using different prompts to request different output formats
D. Run both steps with --output-format json and have the test generation step extract code from the JSON response

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Plain text output requires fragile parsing logic in the review dashboard. The --output-format json flag provides structured, machine-readable output that is far more reliable for programmatic integration.
- B: Each step uses -p for non-interactive mode. The review step adds --output-format json for structured output that the dashboard can parse reliably. The test generation step uses default text output since it produces code files, not structured data. Running them as separate invocations ensures session context isolation.
- C: Running both steps in a single session violates session context isolation. The review step would retain reasoning context from test generation, reducing review effectiveness. Each step should be an independent invocation.
- D: While this would work technically, it adds unnecessary complexity to the test generation step. Using JSON output format only for the step that needs structured parsing (review) is the cleaner approach.

**Where this comes from (per source):** Lesson 3.6: CI/CD Integration (Structured output, -p flag); Claude Code: Headless / CLI Reference


### RAW-CG1-043
**Source:** claudecertificationguide-mock-01.docx, Q43 (embedded id: q-5-4-009, task-statement ref: D5.4, title: "Technical Documentation Maintenance System", status in source: Correct)

A docs team asks Claude Code to audit documentation coverage across a 500,000-line codebase. After reading 30 files via the Read tool, the conversation is approaching the context limit and earlier tool results will be summarised away by auto-compaction. The agent still needs that earlier information to complete the audit. What is the best strategy?

A. Increase the context window size so that all 30+ file contents can be held simultaneously without trimming
B. Have the agent write structured findings to a scratchpad after each file, then read it for the final audit.
C. Process all files in a single Read tool call by passing a glob pattern, so the results arrive in one untrimmed block
D. Run /compact after every 10 files to free up context space for the next batch of file reads

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: The context window has a fixed maximum size. A 500,000-line codebase cannot fit entirely in context regardless of configuration. Tool result trimming exists specifically because holding all file contents simultaneously is not feasible.
- B: A scratchpad file persists on disk and can be re-read at any time, unlike in-context tool results that are trimmed as new results arrive. By extracting and recording the essential findings (not the full file contents) after each file read, the agent decouples its knowledge from context window limits. The final audit reads the compact scratchpad rather than needing all source files in context.
- C: The Read tool reads individual files, not glob patterns. Even if multiple files could be read at once, a single massive result block would itself be trimmed or would consume the entire context budget, preventing the agent from reasoning about the results.
- D: /compact summarises the conversation, which may discard the specific findings from earlier file reads. The problem is preserving information, not just freeing space. Compacting without first persisting findings to disk loses the very data the audit needs.

**Where this comes from (per source):** Lesson 5.4: Codebase Exploration and Context Degradation (Scratchpad files, /compact behaviour)


### RAW-CG1-044
**Source:** claudecertificationguide-mock-01.docx, Q44 (embedded id: q-3-6-007, task-statement ref: D3.6, title: "Technical Documentation Maintenance System", status in source: Correct)

A CI pipeline validates that generated API docs match the codebase. It runs `claude -p 'Verify that all public API endpoints in src/api/ have corresponding documentation in docs/api/'` with `--output-format json`. The check consistently reports 100% coverage, yet manual audits regularly find undocumented endpoints. What is the most likely cause?

A. The --output-format json flag corrupts the analysis results, causing false positives
B. Claude Code is doing a shallow pattern match, not a deep semantic comparison, and the prompt lacks validation criteria
C. The -p flag prevents Claude Code from reading files, so it generates a plausible-sounding report without actual file access
D. The CI pipeline needs a separate review step where a second Claude Code instance verifies the first instance's findings

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: --output-format json controls the output structure, not the analysis logic. It formats results as JSON for downstream parsing but does not affect the accuracy of the verification itself.
- B: Without explicit validation criteria (e.g., 'for each exported function in src/api/, check that docs/api/ contains a section with the function name, parameters, and return type'), the model may perform a shallow check. Adding structured criteria, expected output format, and examples of what constitutes a gap produces reliable verification.
- C: The -p flag runs Claude Code in non-interactive (pipe) mode. It does not restrict file access — Claude Code retains full access to its built-in tools (Read, Grep, Glob) for reading files.
- D: Adding a second instance to review the first adds latency and cost without addressing the root cause. If the first instance's prompt lacks clear validation criteria, the second instance reviewing the same vague output will draw the same flawed conclusions.

**Where this comes from (per source):** Lesson 3.6: CI/CD Integration (Structured output and validation, CLAUDE.md for CI context)


### RAW-CG1-045
**Source:** claudecertificationguide-mock-01.docx, Q45 (embedded id: q-5-1-007, task-statement ref: D5.1, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

An agent receives 200 rows of Snowflake financial data and places it mid-prompt, between system instructions and the user's follow-up question. Asked to identify the row with the highest margin, the agent picks the 45th row (margin 32%) over the 142nd row (margin 47%). What cognitive bias is affecting the agent?

A. Recency bias — the agent prioritises data appearing near the end of the context window.
B. The lost-in-the-middle effect: the agent favours the start and end, missing the row buried in the middle.
C. Token limit truncation — the result set exceeds the context window and rows beyond the 100th are silently dropped.
D. Anchoring bias — the agent fixates on the first high-margin row it encounters and stops scanning the rest.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Recency bias would favour rows near the end of the data, not the 45th row. The 45th row is in the early portion of the result set, which is consistent with the lost-in-the-middle effect, not recency bias.
- B: The lost-in-the-middle effect causes LLMs to attend disproportionately to content at the start and end of long sequences, with reduced attention to material in the middle. Row 142 (the correct answer) sits deep in the middle of the 200-row result set, making it prone to being overlooked.
- C: If rows were truncated, the agent would not have access to row 142 at all and would report the highest margin from the visible rows. The agent identified a specific wrong row (45th), indicating all data is present but attention is uneven.
- D: Anchoring bias is a human cognitive bias, not a well-documented LLM failure mode for structured data scanning. The observed behaviour — accurate recall at the start and end, poor recall in the middle — is the hallmark of the lost-in-the-middle effect.

**Where this comes from (per source):** Lesson 5.1: Context Window Management (Lost in the middle)


### RAW-CG1-046
**Source:** claudecertificationguide-mock-01.docx, Q46 (embedded id: q-1-2-002, task-statement ref: D1.2, title: "Multi-Agent Research System", status in source: Incorrect)

A consulting firm's multi-agent research system has a coordinator that always invokes the full pipeline of five subagents (web search, document analysis, data extraction, synthesis, and formatting) for every query, including simple factual lookups that only need web search. This adds unnecessary latency and cost. What is the correct architectural fix?

A. Have the coordinator select which subagents to invoke per query, not always the full pipeline.
B. Allow subagents to communicate directly with each other so they can skip unnecessary steps in the pipeline
C. Add a caching layer so subagents that have no work to do return immediately
D. Split into two separate systems: one for simple queries and one for complex queries

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: The coordinator should analyse query requirements and decide which subagents are needed. A simple factual lookup only needs the web search agent, not the full five-agent pipeline. Dynamic selection reduces latency and cost for straightforward requests.
- B: Direct subagent communication violates the hub-and-spoke architecture. All communication must flow through the coordinator. The fix is smarter coordinator routing, not bypassing the coordinator.
- C: Caching does not address the architectural issue. Invoking subagents that are not needed adds API call overhead and latency regardless of whether results are cached. The coordinator should not invoke unnecessary subagents in the first place.
- D: Maintaining two separate systems creates unnecessary complexity. The coordinator's role is precisely to analyse query requirements and make routing decisions. A single coordinator with dynamic selection handles both cases.

**Where this comes from (per source):** Lesson 1.2: Multi-Agent Orchestration (Coordinator responsibilities)


### RAW-CG1-047
**Source:** claudecertificationguide-mock-01.docx, Q47 (embedded id: q-1-7-008, task-statement ref: D1.7, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system handles appeals where users contest a moderation decision. Currently, the same agent that made the original decision re-evaluates the appeal. Appeal overturn rates are suspiciously low. What is the most effective architectural change?

A. Add stronger instructions to the appeal handler's prompt requiring it to weigh the user's perspective fairly and set aside its earlier decision.
B. Route appeals to a human reviewer who has full authority to overturn automated decisions
C. Route appeals to a separate agent instance that cannot see the original reasoning, given only the content and the user's justification.
D. Automatically overturn decisions where the user provides any appeal justification to improve user trust

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: Prompt instructions cannot overcome the bias of an agent reviewing its own decision. The original reasoning context still influences the re-evaluation regardless of instructions.
- B: Human review for every appeal does not scale and removes the benefit of automated moderation. Some appeals can be resolved automatically by a separate, unbiased instance.
- C: A fresh agent instance without access to the original reasoning context evaluates the content independently. This avoids confirmation bias from the original decision. The appeal agent sees only the content and the user's argument, enabling a genuinely independent review.
- D: Automatic overturn on any appeal completely undermines moderation. Users who genuinely violated policies would simply appeal every decision.

**Where this comes from (per source):** Lesson 1.7: Session State and Resumption (Stale context); Lesson 1.2: Multi-Agent Orchestration (Isolation principle)


### RAW-CG1-048
**Source:** claudecertificationguide-mock-01.docx, Q48 (embedded id: q-4-1-007, task-statement ref: D4.1, title: "Content Moderation and Classification System", status in source: Correct)

A moderation team introduces a severity scale ('low', 'medium', 'high', 'critical'). The same post (a user threatening to 'destroy' a competitor's product in a review) is classified as 'high' on some runs and 'low' on others. The prompt defines severities with phrases like 'high means the content is clearly harmful' and 'low means the content is mildly inappropriate'. What should they change?

A. Set temperature to 0 to eliminate classification variance across runs
B. Replace the prose severity descriptions with a concrete example per level as a calibration anchor.
C. Remove the severity scale and use binary classification (violation / not violation) to reduce inconsistency
D. Run the classification three times and take the majority vote for severity

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Lower temperature reduces randomness but does not fix ambiguous criteria. The model is inconsistent because the severity definitions are vague, not because of sampling variance.
- B: Concrete examples anchor each severity level to specific, observable patterns. When the model sees 'destroy a competitor's product' in a review context, it can match against the 'low severity — figurative language' example rather than interpreting 'clearly harmful' differently each run.
- C: Binary classification loses valuable granularity needed for routing decisions (auto-remove vs escalate vs warn). The fix is better severity criteria, not removing severity entirely.
- D: Majority voting averages out noise but triples cost and latency without fixing the root cause. With vague criteria, the model may consistently misclassify in the same direction, making voting ineffective.

**Where this comes from (per source):** Lesson 4.1: System Prompts with Explicit Criteria (Severity calibration)


### RAW-CG1-049
**Source:** claudecertificationguide-mock-01.docx, Q49 (embedded id: q-2-2-011, task-statement ref: D2.2, title: "Multi-Agent Research System", status in source: Correct)
**Format:** MULTI-SELECT (Select 3)

<!-- CORRECT-ANSWER-INFERRED: multi-select ('Select 3') question: source does not explicitly mark the full correct set. The set shown was inferred from whether each option's own explanation argues for or against it -- editorial best-effort, not verbatim source data. -->

A research subagent's database query fails partway through an investigation. Which pieces of information belong in the structured error context it returns to the coordinator? (Select 3)

A. No report at all: the subagent should retry silently until the query succeeds.
B. Partial results gathered before the failure.
C. The failure type, such as transient, validation, or permission.
D. What was attempted, including the query that failed.
E. A plain 'no results found' message in place of the error.

**Correct (per source, select 3, inferred):** B, C, D

**Explanations (per source, verbatim):**
- A: Silent retries hide failures from the coordinator, which owns error handling and needs observability into what went wrong.
- B: Partial results preserve completed work so the coordinator does not re-run what already succeeded.
- C: Categorising the failure lets the coordinator make the right retry-or-reroute decision.
- D: The attempted query gives the coordinator enough detail to retry intelligently or reformulate the request.
- E: Reporting an access failure as an empty result conflates two different situations and hides the need for a retry decision.

**Where this comes from (per source):** Lesson 2.2: Structured Error Responses (Four error categories, Access failure vs empty result); MCP: Tools Specification


### RAW-CG1-050
**Source:** claudecertificationguide-mock-01.docx, Q50 (embedded id: q-3-1-007, task-statement ref: D3.1, status in source: Correct)

Project-level `.claude/CLAUDE.md` says 'use 4-space indentation matching the existing codebase.' A senior architect has 'use 2-space indentation' in their user-level `~/.claude/CLAUDE.md`. In recent sessions the architect's code has come back in 2 spaces and broken the build. The team needs a guarantee that 4-space indentation is applied on every save. What should they do?

A. Add a PostToolUse hook that runs the team's formatter after every Write/Edit, so 4-space indentation is enforced regardless of what Claude generates
B. Leave the rule in project-level `.claude/CLAUDE.md` — the more specific scope wins on conflicts, so the project rule will override the architect's user-level preference
C. Ask the architect to delete their user-level `~/.claude/CLAUDE.md` so there is no conflict to resolve
D. Move the 4-space rule into a `CLAUDE.local.md` at the project root so it is appended last and reads after the user-level file

**Correct (per source):** A

**Explanations (per source, verbatim):**
- A: Anthropic's memory docs are explicit that CLAUDE.md is delivered as a user message with 'no guarantee of strict compliance,' and that 'if two rules contradict each other, Claude may pick one arbitrarily.' The docs themselves point at hooks for this case: hooks 'execute as shell commands at fixed lifecycle events and apply regardless of what Claude decides to do.' A PostToolUse hook running the formatter is the only option here that gives a hard guarantee.
- B: This is the popular paraphrase, but it's not what Anthropic's docs say. The docs describe a load order (broadest scope to most specific, so project instructions appear in context after user instructions) but explicitly state files are 'concatenated into context rather than overriding each other' and conflicts 'may [be] pick[ed] arbitrarily.' The team has already seen that assumption fail in production.
- C: This treats a personal config file as a team problem and doesn't scale — every new teammate would need to police their own home directory, and any future contradiction (from a different file, an @import, or a .claude/rules/ entry) would resurface the same fragility. The fix is to remove reliance on guidance-style config for a rule that must be enforced, not to remove the conflicting file.
- D: Load order does append `CLAUDE.local.md` after `CLAUDE.md` within a directory, but the docs are careful to call this 'load order,' not precedence, and warn that conflicts may resolve arbitrarily. `CLAUDE.local.md` is also gitignored, so a team standard cannot live there.

**Where this comes from (per source):** Lesson 3.1: CLAUDE.md Hierarchy and Scoping (Loading order and conflict handling); Anthropic — How Claude remembers your project (memory docs)


### RAW-CG1-051
**Source:** claudecertificationguide-mock-01.docx, Q51 (embedded id: q-4-2-003, task-statement ref: D4.2, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system classifies hate speech accurately for explicit slurs but misses coded language and dog-whistle terms that human moderators easily recognise. The prompt includes detailed written rules about coded language patterns. What intervention would most improve detection of coded hate speech?

A. Add a comprehensive dictionary of every known coded term and dog-whistle to the system prompt so the classifier can match posts against the full list.
B. Add 2-4 few-shot examples of coded hate speech, with reasoning naming the coded language and the targeted group.
C. Add 20+ examples covering every known category of coded hate speech to maximise coverage
D. Increase the model's context window so it can consider more of the user's post history for context

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: A static dictionary becomes outdated immediately as coded language constantly evolves. It also bloats the prompt without teaching the model to recognise the underlying patterns of coded speech.
- B: Few-shot examples with reasoning tags teach the model the pattern-recognition process, not just individual terms. Showing the reasoning chain — surface meaning, coded meaning, targeted group, contextual signals — enables the model to generalise to new coded terms it has not seen before.
- C: Laundry lists of examples dilute attention and teach pattern-matching rather than generalisation. 2-4 targeted examples with reasoning are more effective than 20 examples without reasoning because they teach the analytical process.
- D: Context window size is not the bottleneck. The model fails to recognise coded language in individual posts, which is a prompt engineering issue, not a context limitation.

**Where this comes from (per source):** Lesson 4.2: Few-Shot Prompting (Few-shot for nuanced detection); Anthropic: Multishot (Few-Shot) Prompting


### RAW-CG1-052
**Source:** claudecertificationguide-mock-01.docx, Q52 (embedded id: q-4-6-005, task-statement ref: D4.6, title: "Content Moderation and Classification System", status in source: Correct)

The moderation team asks a single Claude session to classify a post, then immediately asks the same session to independently review its own classification for quality assurance. The 'review' agrees with the original classification 98% of the time, including cases that human auditors later identify as errors. Why is this self-review ineffective?

A. The model needs a stronger review prompt with explicit instructions to look for errors in the original classification
B. The same session retains the model's reasoning, so it stays anchored to its classification; use a fresh independent instance to review.
C. The model's temperature is too low, producing deterministic agreement — increase temperature for the review pass
D. Self-review is effective but the 98% agreement rate simply reflects high initial accuracy — the 2% disagreement is the expected error rate

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Stronger instructions do not overcome the fundamental limitation. The same session retains the reasoning context from the original classification, biasing the review toward agreement.
- B: Self-review within the same session is fundamentally limited because the model's conversation context includes the original reasoning. It will naturally be anchored to its prior conclusions. An independent instance with no access to the original decision evaluates the content fresh, providing genuine quality assurance.
- C: Temperature affects sampling randomness, not reasoning independence. Higher temperature may occasionally produce different outputs but does not create genuine independent review. The model is still anchored to its own prior reasoning in the same session.
- D: Human auditors found errors in cases where the self-review agreed, proving the 98% agreement does not reflect accuracy. The self-review is confirming errors, not catching them, due to same-session reasoning bias.

**Where this comes from (per source):** Lesson 4.6: Multi-Instance Review and Output Validation (Self-review limitation)


### RAW-CG1-053
**Source:** claudecertificationguide-mock-01.docx, Q53 (embedded id: q-1-6-002, task-statement ref: D1.6, title: "Multi-Agent Research System", status in source: Correct)

A consulting firm needs an agent to add a comprehensive test suite to a large legacy codebase. The codebase has no existing tests, unclear dependencies between modules, and the team does not know which areas are most critical. Which task decomposition strategy is most appropriate?

A. A fixed sequential pipeline that reviews each file in alphabetical order and generates tests for each one
B. A single-pass analysis that processes the entire codebase at once and generates a complete test plan
C. Dynamic adaptive decomposition: map the codebase, find the high-impact areas, and adapt the plan as dependencies emerge.
D. A multi-pass architecture with per-file analysis and a cross-file integration pass, exactly like a standard code review pipeline.

**Correct (per source):** C

**Explanations (per source, verbatim):**
- A: Fixed sequential pipelines are best for predictable, structured tasks. Adding tests to a legacy codebase with unclear dependencies is an open-ended investigation that requires adaptive exploration to discover which areas are most critical and how dependencies affect test design.
- B: A single-pass analysis of a large codebase would suffer from attention dilution, producing inconsistent coverage. Additionally, a single pass cannot adapt to discoveries about dependencies and critical areas that emerge during exploration.
- C: Adding tests to a legacy codebase with unknown dependencies is an open-ended investigation task. Dynamic adaptive decomposition generates subtasks based on what is discovered at each step — first mapping the structure, then identifying critical areas, then adapting the test plan as dependency relationships emerge.
- D: Multi-pass architecture solves attention dilution for review tasks, but test generation in a legacy codebase needs adaptive exploration: discovering critical modules and dependencies and prioritising coverage. The decomposition must adapt to findings, not follow a fixed per-file pattern.

**Where this comes from (per source):** Lesson 1.6: Task Decomposition Strategies (Dynamic adaptive decomposition, Pattern selection)


### RAW-CG1-054
**Source:** claudecertificationguide-mock-01.docx, Q54 (embedded id: q-2-4-008, task-statement ref: D2.4, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

The data platform team needs to share their Snowflake and PostgreSQL MCP server configurations with all team members whilst allowing individual developers to experiment with a personal API integration server. Where should each configuration be placed?

A. Place all three servers in the project-level .mcp.json so they are version-controlled and consistent across the team.
B. Place the Snowflake and PostgreSQL servers in the project-level .mcp.json, and personal API integration servers in user-level ~/.claude.json.
C. Place all three servers in ~/.claude.json and have each developer copy the configuration manually.
D. Place the database servers in environment variables and reference them in both .mcp.json and ~/.claude.json.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Personal experimental servers should not be in project-level configuration. Changes to personal servers would create unnecessary merge conflicts and force experimental integrations on the entire team.
- B: Project-level .mcp.json is version-controlled and shared — correct for team-wide database integrations. User-level ~/.claude.json is machine-specific — correct for personal experimental servers that should not affect other team members.
- C: User-level configuration is not version-controlled and requires manual synchronisation. Team-wide servers belong in project-level .mcp.json for consistency and change tracking.
- D: Environment variables are used for credentials (connection strings, API keys), not for MCP server configuration. The server definitions themselves belong in .mcp.json or ~/.claude.json depending on scope.

**Where this comes from (per source):** Lesson 2.4: MCP Server Integration (Scoping hierarchy); Claude Code: MCP Server Configuration


### RAW-CG1-055
**Source:** claudecertificationguide-mock-01.docx, Q55 (embedded id: q-4-1-006, task-statement ref: D4.1, title: "Content Moderation and Classification System", status in source: Correct)

The moderation system's prompt instructs Claude to 'be conservative when moderating and err on the side of caution.' Reviewers find that innocuous posts about cooking with knives, news articles about violence, and fictional war stories are all being flagged as policy violations. What is the root cause and fix?

A. The model is too sensitive — lower the temperature to reduce over-flagging
B. Replace 'be conservative' with explicit categorical criteria defining each violation category with concrete examples.
C. Add an allowlist of safe topics (cooking, news, fiction) that should never be flagged
D. Add a second moderation pass that re-reads each flagged post under the same 'be conservative' guidance and strips out the false positives before any action.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Temperature affects randomness, not the interpretation of moderation criteria. The over-flagging is caused by vague instructions, not sampling behaviour.
- B: Vague directives like 'be conservative' give the model no basis for distinguishing between genuine violations and legitimate content that mentions sensitive topics. Explicit criteria with examples of both violations and non-violations (news, fiction, educational content) enable consistent, calibrated decisions.
- C: Allowlists are brittle and impossible to maintain comprehensively. New safe topics will constantly appear. The fix is better criteria that teach the model to distinguish context, not a growing list of exceptions.
- D: A second pass using the same vague 'be conservative' criteria will reproduce the same false positives. Fix the criteria first; add verification layers second.

**Where this comes from (per source):** Lesson 4.1: System Prompts with Explicit Criteria (Explicit criteria over hedge phrases, Severity calibration)


### RAW-CG1-056
**Source:** claudecertificationguide-mock-01.docx, Q56 (embedded id: q-2-2-008, task-statement ref: D2.2, title: "Enterprise Data Platform with Federated Queries", status in source: Correct)

The data platform's fetch_api tool calls a third-party pricing API. When the API key has expired, the tool returns { "data": [], "status": "ok" } instead of signalling an authentication failure. The agent tells the user 'No pricing data is available for that product' and moves on. What is the root cause?

A. The agent should be instructed via the system prompt to treat empty arrays as errors and retry with exponential backoff.
B. The tool cannot distinguish an access failure (expired key) from a valid empty result, so the agent treats a permission error as no data.
C. The third-party API is poorly designed. The platform team should switch to a different pricing provider that returns proper HTTP error codes.
D. The agent's context window is too small to hold the full API response, so it receives a truncated version that appears empty.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Not all empty arrays are errors — a product with no pricing data is a valid empty result. The problem is that the tool masks an authentication failure as a successful empty response. System prompt instructions cannot reliably distinguish the two.
- B: The tool returns the same structure for two fundamentally different outcomes: 'I could not access the data' versus 'I accessed the data and found nothing.' The agent cannot distinguish these and accepts the empty result at face value. The tool must return a structured error with the MCP isError flag for authentication failures.
- C: Whilst the upstream API behaviour is unhelpful, the platform team controls the MCP tool layer. The tool should detect the authentication failure (even from the upstream response) and translate it into a structured MCP error rather than passing through the misleading response.
- D: Context window truncation would not produce a well-formed { "data": [], "status": "ok" } response. The problem is semantic — the tool is returning a misleading success status for an authentication failure.

**Where this comes from (per source):** Lesson 2.2: Structured Error Responses (Access failure vs empty result)


### RAW-CG1-057
**Source:** claudecertificationguide-mock-01.docx, Q57 (embedded id: q-1-3-002, task-statement ref: D1.3, title: "Multi-Agent Research System", status in source: Correct)

A multi-agent research system has a coordinator that spawns a web search subagent and a document analysis subagent sequentially across separate API turns. The web search completes in 8 seconds and the document analysis completes in 12 seconds, giving a total latency of 20 seconds. The two subagents are investigating independent topics and do not depend on each other's results. How should the architect reduce this latency?

A. Merge the web search and document analysis into a single subagent to reduce coordination overhead
B. Have the coordinator emit both Task tool calls in a single response to spawn both subagents in parallel, reducing total latency to roughly 12 seconds
C. Allow the web search subagent to directly invoke the document analysis subagent after it finishes, removing the coordinator round-trip
D. Use fork_session to split the coordinator into two parallel branches, one for each subagent

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Merging agents violates the principle of specialised subagents with scoped tool access. It also does not reduce total processing time — the merged agent still needs to do both tasks, and loses the benefit of parallel execution.
- B: When subagents investigate independent topics, the coordinator can emit multiple Task tool calls in a single response. Both subagents run concurrently, so total latency is determined by the slower one (12 seconds) rather than the sum (20 seconds).
- C: Direct subagent communication violates the hub-and-spoke architecture where all communication flows through the coordinator. This also would not achieve parallel execution — it would still be sequential.
- D: fork_session is for divergent exploration of the same problem from a shared baseline, not for parallel subagent invocation. Emitting multiple Task tool calls in a single coordinator response is the correct mechanism for spawning concurrent subagents.

**Where this comes from (per source):** Lesson 1.3: Subagent Invocation and Context Passing (Parallel spawning, Task tool)


### RAW-CG1-058
**Source:** claudecertificationguide-mock-01.docx, Q58 (embedded id: q-5-6-008, task-statement ref: D5.6, title: "Technical Documentation Maintenance System", status in source: Correct)

A docs team has Claude Code generate architecture guides by synthesising source code, inline comments, commit messages, and ADRs. After several edits, the guides no longer indicate which statements came from which source. A developer later questions whether a specific architectural constraint in a guide is still valid. What approach preserves source attribution?

A. Instruct Claude Code to add footnotes to the generated documentation citing the original source for each statement
B. Maintain structured provenance metadata that maps each claim to its source file, line number, and retrieval date.
C. Keep all original source files unchanged in a reference directory so developers can manually trace any claim back to its origin
D. Version-control the documentation and use git blame to trace each line back to the commit that created it

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Prose footnotes are fragile — they are lost or degraded during subsequent editing passes, summarisation, or reformatting. The team has already experienced this problem through 'several iterations of editing.'
- B: Structured provenance metadata survives editing because it is stored as data fields (e.g., JSON or YAML frontmatter) separate from the prose. When a developer questions a claim, they can trace it to the exact source file and line number. The retrieval date indicates whether the source was current when the documentation was generated.
- C: Preserving source files without explicit mappings forces developers to manually search through potentially hundreds of files to verify a single claim. This is not scalable and does not indicate which specific source informed which specific documentation statement.
- D: git blame traces authorship of documentation lines to commits, not to the source material that informed those lines. A commit message might say 'update architecture guide' without indicating that a specific statement came from ADR-047 or a comment in auth-service/src/middleware.ts.

**Where this comes from (per source):** Lesson 5.6: Information Provenance and Multi-Source Synthesis (Attribution preservation, Structured claim-source mappings)


### RAW-CG1-059
**Source:** claudecertificationguide-mock-01.docx, Q59 (embedded id: q-3-1-015, task-statement ref: D3.1, status in source: Incorrect)

A developer has personal code formatting preferences (2-space indentation, trailing commas) that differ from some of the projects they work on. They want Claude Code to apply these preferences across all of their projects by default. Where should these preferences be configured?

A. In the project-level .claude/CLAUDE.md of each repository they work on
B. In ~/.claude/CLAUDE.md, so they apply across all of the developer's projects
C. In a .claude/rules/ file without YAML frontmatter so it loads for every session
D. In a ~/.claude/skills/ file that is invoked before each coding session

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Project-level configuration is shared with the team via version control. Personal formatting preferences should not be imposed on the entire team. Additionally, this would require duplicating the preferences across every project.
- B: User-level CLAUDE.md (~/.claude/CLAUDE.md) applies to all of that developer's projects and is not shared with the team via version control, which is exactly right for personal preferences. Note that CLAUDE.md files are concatenated into context rather than strictly overriding one another, so a project's conflicting standard is not guaranteed to win; if a rule must always be enforced, put it in settings.json or a hook.
- C: .claude/rules/ is project-scoped and version-controlled. Personal preferences should not be committed to project repositories where they would affect all team members.
- D: Skills are on-demand workflows invoked for specific tasks, not always-loaded configuration. Formatting preferences need to be applied automatically to every session without manual invocation.

**Where this comes from (per source):** Lesson 3.1: CLAUDE.md Hierarchy and Scoping (User-level CLAUDE.md); Claude Code: Memory and CLAUDE.md


### RAW-CG1-060
**Source:** claudecertificationguide-mock-01.docx, Q60 (embedded id: q-1-3-011, task-statement ref: D1.3, title: "Content Moderation and Classification System", status in source: Correct)

The coordinator receives a batch of 200 flagged posts to moderate. Currently it processes them sequentially, taking 45 minutes. Each post's moderation is independent — the decision on one post does not affect others. How should the coordinator handle this batch?

A. Process all 200 posts in a single API call by concatenating them into one large prompt
B. Delegate independent posts to parallel subagent instances, with the coordinator aggregating results as they complete
C. Split into fixed batches of 20 posts and process each batch sequentially in a single prompt
D. Increase the iteration cap on the agentic loop to allow the agent more time to process all 200 posts

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Concatenating 200 posts into a single prompt causes attention dilution. Quality degrades for posts later in the sequence, and a single failure blocks the entire batch.
- B: Since each post's moderation is independent, the coordinator should delegate them to parallel instances. This reduces total processing time from sequential (45 minutes) to roughly the time of the slowest individual moderation, and a failure on one post does not block others.
- C: Batching 20 posts into a single prompt still risks attention dilution across posts within each batch. And sequential batch processing still takes much longer than parallel individual processing.
- D: The iteration cap controls how many tool calls the agent can make within a single task, not how many independent tasks it can process. The issue is parallelism, not loop duration.

**Where this comes from (per source):** Lesson 1.3: Subagent Invocation and Context Passing (Parallel spawning)

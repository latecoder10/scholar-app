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
- B: Rate limiting is a transient error — it will resolve after a delay. Structured metadata with the specific retry delay lets the agent space out remaining queries intelligently rather than abandoning the batch. The agent can continue processing other tasks while waiting.(correct answer)
- C: Rate limits are transient (they resolve after a delay), not business errors (which represent policy or rule violations the agent cannot recover from). Marking them as non-retryable causes the agent to abandon 20 remaining queries that would succeed after a brief delay.(your answer)
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

**Where this comes from (per source):**
- Lesson 4.5: Batch Processing and Prompt Optimisation (Batches API facts)
- Lesson 4.5: Batch Processing and Prompt Optimisation (SLA implications)
- Anthropic: Message Batches API↗


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
- A: More granular labels do not address the core issue. A hardcoded decision tree cannot adapt to nuance, such as satire versus genuine hate, no matter how fine the labels are. The fix is model-driven reasoning.(your answer)
- B: Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context (satire vs genuine hate, sophisticated spam patterns) produces better moderation decisions. The agentic loop should let the model decide, not map labels to fixed actions.(correct answer)
- C: Confidence thresholds reduce false positives but the fundamental problem remains: a hardcoded tree cannot handle contextual nuance. Low-confidence cases still need model-driven reasoning, not just deferral.
- D: Routing everything ambiguous to humans defeats the purpose of automated moderation. The model can reason about context effectively when given the opportunity; the hardcoded tree is what prevents it.

**Where this comes from (per source):**
- Lesson 1.1: Agentic Loops (Model-driven decision-making)
- Lesson 1.1: Agentic Loops (Anti-patterns)


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

**Where this comes from (per source):**
- Anthropic: Claude Code Documentation↗
- Git: Worktrees↗


### RAW-CG1-009
**Source:** claudecertificationguide-mock-01.docx, Q09 (embedded id: q-2-3-008, task-statement ref: D2.3, title: "Enterprise Data Platform with Federated Queries", status in source: Incorrect)

The data platform team has built an MCP server with 22 tools: query_snowflake, query_postgres, query_api, plus 19 specialised tools for individual data transformations (pivot_table, calculate_percentile, normalise_currency, etc.). Agents take 3-4 turns to select the correct tool and frequently choose the wrong transformation. What is the most effective redesign?

A. Improve all 22 tool descriptions with detailed examples and boundary conditions to help the agent distinguish between them.
B. Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools.
C. Use tool_choice: 'any' to force the agent to always call a tool, eliminating turns where the agent reasons without acting.
D. Split the tools across two separate MCP servers — one for queries and one for transformations — to reduce cognitive load.

**Correct (per source):** B

**Explanations (per source, verbatim):**
- A: Better descriptions help, but 22 tools still exceeds the practical limit for reliable selection. Research shows tool selection degrades significantly beyond 4-5 tools per agent. The tool count itself is the problem.(your answer)
- B: Reducing from 22 to 4 tools brings the count within the optimal 4-5 range for reliable tool selection. The 19 transformation tools share a common pattern (input data, transformation type, output format) and are natural candidates for consolidation into a single parameterised tool.(correct answer)
- C: Forcing tool calls does not improve selection accuracy — it just ensures the agent picks something, potentially the wrong tool. The root cause is too many similar tools, not too few tool calls.
- D: MCP server boundaries are invisible to the agent. All tools from all connected servers appear in a single list. Splitting across servers does not reduce the number of tools the agent must choose from.

**Where this comes from (per source):**
- Lesson 2.3: Tool Distribution and Tool Choice (Consolidating near-duplicate tools)
- Lesson 2.3: Tool Distribution and Tool Choice (Tool overload)


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

**Where this comes from (per source):**
- Lesson 3.2: Custom Slash Commands and Skills (context: fork)
- Claude Code: Skills↗


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

**Where this comes from (per source):**
- Lesson 1.7: Session State and Resumption (Session management options)
- Lesson 1.3: Subagent Invocation and Context Passing (fork_session)
- Anthropic: Claude Code Documentation↗


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

**Where this comes from (per source):**
- Lesson 5.3: Error Propagation in Multi-Agent Systems (Structured error context)
- Lesson 5.3: Error Propagation in Multi-Agent Systems (Coverage annotations)


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
- B: HTTP 503 is a temporary upstream outage (transient, will likely resolve on retry). Restricted journal is a policy limitation (business, will never resolve on retry — escalate or offer an alternative source). Malformed DOI is validation; the agent must repair the input and then retry.(correct answer)
- C: The restricted journal error is not transient — the system lacks a licence, and no amount of retrying will grant access. A malformed DOI is validation, not transient; the agent must repair the input rather than blindly retry the same value.
- D: HTTP 503 is transient (a temporary upstream outage), not validation — nothing is wrong with the request input. A malformed DOI is validation (fix input and retry), not business — business errors represent policy or rule violations, not input format problems.(your answer)

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

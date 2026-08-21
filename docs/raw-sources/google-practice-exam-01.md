# Google Source — 60-Question Practice Exam (RAW-GQ)

<!-- Faithful transcription of google-s-01.md, all 60 questions. Answer key parsed from the
     source file's own Answer-Key-and-Explanations section. Questions 1-17 had clean markdown
     structure in the source; Questions 18-60 had lost their line-break formatting and were
     reconstructed via sequential Q-number anchoring plus non-greedy A/B/C/D-boundary matching.

     NOTE: this set carries ONE explanation per question (not per-option), unlike RAW-CG1/RAW-EH.

     Source of truth for content/claude-ccaf/modules/mock-tests/claude-ccaf-mock-exam-2.json --
     regenerate with: npx tsx scripts/build-mock-questions.ts -->

### RAW-GQ-001
**Source:** google-s-01.md, Q1

An architect is designing an autonomous agent loop using Claude 3.5 Sonnet to handle customer refunds. The agent must check a database, verify conditions, and execute a payout tool. To prevent the agent from getting stuck in an infinite loop if a tool fails repeatedly, which architectural pattern should be implemented?

A. Set the API `temperature` to 1.0 to introduce randomness in retries.
B. Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded.
C. Use a smaller model like Claude 3 Haiku for the fallback loop.
D. Blindly reduce the `max_tokens` parameter to truncate the execution loop.

**Correct (per source):** B

**Explanation (per source, verbatim):** A stateful tracking layer prevents uncontrolled loops, which are a major stability and cost risk in autonomous agent systems.


### RAW-GQ-002
**Source:** google-s-01.md, Q2

You are building an application where Claude needs to evaluate its own output against a set of compliance rules before returning it to the user. This is an example of which agentic design pattern?

A. Routing/Triage Pattern
B. Parallel Tool Execution Pattern
C. Critic/Reflexion Pattern
D. Single-turn Extraction Pattern

**Correct (per source):** C

**Explanation (per source, verbatim):** Self-correction or validation cycles against rules map directly to the Critic/Reflexion agentic loop design.


### RAW-GQ-003
**Source:** google-s-01.md, Q3

When building a multi-agent system where a "Supervisor" agent delegates specialized tasks to a "Writer" agent and a "Coder" agent, what is the best practice for managing state between them?

A. Pass the full, unedited chat history of all interactions to every agent in every turn.
B. Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next.
C. Have the agents communicate directly with each other via raw prompt injections without an intermediate orchestrator.
D. Restrict all agents to single-turn completions and disable multi-agent messaging entirely.

**Correct (per source):** B

**Explanation (per source, verbatim):** State aggregation via an orchestrator controls noise and token spend, preventing cascading context window bloat.


### RAW-GQ-004
**Source:** google-s-01.md, Q4

An agentic system built on Claude 3.5 Sonnet needs to process an ambiguous user request that might require three separate tool calls. To minimize total turnaround time, the architect wants to use parallel tool calling. What is a critical requirement for the backend application handling this?

A. The backend must execute the tools sequentially to avoid confusing the LLM.
B. The tool execution layer must support concurrent execution and handle shared state safely without race conditions.
C. All tools must accept identical JSON schemas.
D. Claude must be forced into a 3-second wait state between tool blocks.

**Correct (per source):** B

**Explanation (per source, verbatim):** Concurrency management is critical at the application tier when an LLM issues multiple tool targets simultaneously.


### RAW-GQ-005
**Source:** google-s-01.md, Q5

An engineer notices that an agent using a ReAct (Reasoning + Acting) loop becomes progressively less accurate as the conversation extends to 30+ turns. What is the root cause and the most robust architectural fix?

A. Root cause: Model temperature drift. Fix: Dynamically lower temperature to 0 over time.
B. Root cause: Context window dilution and noise accumulation. Fix: Implement a sliding window with a summary layer for older turns.
C. Root cause: Tool definition degradation. Fix: Redefine the tools in every single prompt turn using different names.
D. Root cause: Token limit exhaustion. Fix: Switch the model to an open-source alternative mid-session.

**Correct (per source):** B

**Explanation (per source, verbatim):** Multi-turn loops accumulate attention noise and redundant tokens. Rolling summaries maintain state cleanly.


### RAW-GQ-006
**Source:** google-s-01.md, Q6

In an orchestrator-worker pattern, why is it beneficial to use Claude 3 Haiku for the initial classification/routing step rather than Claude 3.5 Sonnet or Opus?

A. Haiku has a larger context window than Sonnet or Opus.
B. Haiku provides a significant reduction in Time-to-First-Token (TTFT) and lower token cost for high-volume routing tasks.
C. Haiku natively supports more tool schemas than Sonnet.
D. Haiku eliminates the need for an orchestrator layer entirely.

**Correct (per source):** B

**Explanation (per source, verbatim):** Triage tasks should minimize TTFT and transaction costs; Haiku is highly optimized for fast categorization.


### RAW-GQ-007
**Source:** google-s-01.md, Q7

You are designing a routing architecture for an enterprise helpdesk. Simple queries should go to a fast model, while complex reasoning queries go to a premium model. What is the most reliable way to perform this routing?

A. Use a rule-based regex parser first; if it fails, use a fast LLM classifier to evaluate intent into distinct categories.
B. Send all queries to both models simultaneously and let the user choose the best response.
C. Use a vector embedding distance match against 1,000,000 documents for every single incoming greeting.
D. Randomly distribute 50% of traffic to each model to balance server load.

**Correct (per source):** A

**Explanation (per source, verbatim):** Rule-based triage combined with low-cost classification models ensures deterministic routing without unnecessary high-tier model expense.


### RAW-GQ-008
**Source:** google-s-01.md, Q8

When an autonomous agent using Claude calls a tool, how does the orchestrator signal a failure (e.g., an API timeout) back to Claude so it can self-correct?

A. The orchestrator should raise a local code exception and crash the user session.
B. The orchestrator must append a new message block with the role `user` (or a specific tool response block) indicating the failure state or error message.
C. The orchestrator must modify Claude's original system prompt to include the error message.
D. The orchestrator should re-submit the request with a higher temperature without mentioning the error.

**Correct (per source):** B

**Explanation (per source, verbatim):** Error boundaries are communicated back into the context conversation window via structured user or tool_result message elements.


### RAW-GQ-009
**Source:** google-s-01.md, Q9

Which of the following scenarios is uniquely suited for a multi-agent choreography architecture over a single monolithic agent prompt?

A. Extracting 5 fields of structured data from a single invoice PDF.
B. A software development workflow requiring separate phases for requirement analysis, code generation, independent code review, and automated unit testing.
C. Translating a short paragraph from English to Spanish.
D. Running a quick mathematical calculation using a calculator tool.

**Correct (per source):** B

**Explanation (per source, verbatim):** Sequential phase gates with varying rule sets are the textbook use case for multi-agent isolation architectures.


### RAW-GQ-010
**Source:** google-s-01.md, Q10

An agent is tasked with writing a complex report. You implement a Plan-and-Solve pattern. How does this differ fundamentally from a standard zero-shot prompt?

A. The model is instructed to output an explicit step-by-step execution plan first before executing the sub-tasks.
B. The model bypasses the prompt entirely and queries an external planning database.
C. The model executes all steps in parallel without considering dependencies.
D. It relies exclusively on few-shot examples without structural instructions.

**Correct (per source):** A

**Explanation (per source, verbatim):** Plan-and-solve enforces explicit intermediate checkpoint tokens to lay out structural reasoning dependencies before code/text generation.


### RAW-GQ-011
**Source:** google-s-01.md, Q11

You want an agent to dynamically discover available APIs at runtime rather than hardcoding 50 different tool definitions into the system prompt. How can you architect this cleanly?

A. Put all 50 tools into the prompt regardless of token cost, as Claude ignores irrelevant tools.
B. Implement a two-step RAG pipeline where a coordinator agent searches a vector index of tool schemas based on the user's query, and only injects relevant tool schemas into the active execution prompt.
C. Force Claude to guess the tool names and catch the syntax errors on the client side.
D. Use a single generic tool called `call_any_api` that accepts an unvalidated raw URL and payload string.

**Correct (per source):** B

**Explanation (per source, verbatim):** Dynamic runtime tool-injection via a RAG vector index saves extensive prompt token costs and scales efficiently.


### RAW-GQ-012
**Source:** google-s-01.md, Q12

What is a major risk of allowing an LLM agent to operate in a completely unconstrained loop (`while True`) without an orchestrator-enforced step limit?

A. The model will run out of internal weights and degrade permanently.
B. Extreme cost accumulation and infinite loops due to unexpected edge case inputs or unhandled tool errors.
C. The API key will automatically rotate and lock the system out.
D. The model will start returning responses in the wrong language.

**Correct (per source):** B

**Explanation (per source, verbatim):** Uncapped automation loops risk massive API billing and unchecked operational errors if edge case inputs loop indefinitely.


### RAW-GQ-013
**Source:** google-s-01.md, Q13

When designing a human-in-the-loop (HITL) pattern for a high-risk financial trading agent, at what point should the orchestrator pause execution to wait for human authorization?

A. Before parsing the user's initial prompt text.
B. Immediately after a tool successfully completes an internal read-only database lookup.
C. After the model generates a tool call for `execute_wire_transfer` but before the orchestrator runs the underlying execution code.
D. Only after the wire transfer has been irreversibly processed by the clearing bank.

**Correct (per source):** C

**Explanation (per source, verbatim):** High-risk boundary operations must intercept execution after intent generation but before backend code commitment.


### RAW-GQ-014
**Source:** google-s-01.md, Q14

An agent needs to synthesize feedback from three different expert agents. Which aggregation technique minimizes conflicting instructions in the final output?

A. Appending all three outputs back-to-back without structure.
B. Using a final "Synthesizer" or "Editor" agent prompt instructed to reconcile discrepancies and format a unified response.
C. Selecting the longest response and discarding the other two.
D. Averaging the token lengths of the responses.

**Correct (per source):** B

**Explanation (per source, verbatim):** Aggregating expert outputs requires an explicit processing layer or specialized judge/editor model to resolve instruction conflicts.


### RAW-GQ-015
**Source:** google-s-01.md, Q15

Why does a "Chain-of-Thought" (CoT) approach improve an agent's success rate when navigating multi-step logic pathways?

A. It directly reduces the token cost per generation.
B. It allows the model to allocate computational tokens to decompose the problem into manageable steps before generating a conclusion.
C. It completely prevents the model from making syntax errors in JSON.
D. It increases the throughput speed of the API gateway.

**Correct (per source):** B

**Explanation (per source, verbatim):** CoT exposes reasoning trajectories as tokens, allowing self-correcting generation paths before final selections.


### RAW-GQ-016
**Source:** google-s-01.md, Q16

You are building an agent that must interact with a legacy terminal system. The terminal often returns multi-page unformatted text tables. Which pattern works best?

A. Feed the raw unformatted text into the agent and hope it interprets the layout natively.
B. Use an intermediate parser tool that converts the unformatted text table into structured JSON or Markdown before passing it to Claude.
C. Increase the model's temperature to allow it to "guess" missing columns.
D. Convert the entire terminal output into a single giant string and delete all spaces.

**Correct (per source):** B

**Explanation (per source, verbatim):** Transforming messy infrastructure text structures into structured JSON or Markdown normalizes context tokens for predictable downstream parsing.


### RAW-GQ-017
**Source:** google-s-01.md, Q17

An enterprise development team is integrating the `claude-code` CLI tool into their localized development workflow. When configuration variables need to be scoped strictly to a specific project repository, where should they be declared?

A. In the user's global shell configuration (`~/.bashrc` or `~/.zshrc`).
B. Inside a local configuration file located at the root directory of the repository.
C. Passed as environment variables via an external cloud vault every time a command runs.
D. Hardcoded into the system kernel variables.

**Correct (per source):** B

**Explanation (per source, verbatim):** Repository-level scoping isolates configuration patterns to prevent accidental environment variables leakage.


### RAW-GQ-018
**Source:** google-s-01.md, Q18

When executing file system modifications via claude-code or an automated codebase assistant, what is the best practice for ensuring safe code merges?

A. Allow the agent to write directly to the main or production branch without constraints.
B. Have the tool operate on a dedicated feature branch, and enforce a human-reviewed Pull Request (PR) workflow with automated CI pipeline testing.
C. Delete all unit tests so the agent's code never triggers a test failure flag.
D. Disable git tracking entirely while the agent is writing code.

**Correct (per source):** B

**Explanation (per source, verbatim):** Secure coding execution dictates isolation to feature branches validated by automated continuous integration loops and human checks.


### RAW-GQ-019
**Source:** google-s-01.md, Q19

Your automated coding workspace assistant keeps modifying files outside the intended module scope. How can you cleanly restrict its file visibility and writing capabilities?

A. Rename all other files to hidden files.
B. Configure a targeting array or path ignore list (such as .gitignore or a dedicated tool configuration file) to restrict file system search tool paths.
C. Enforce a maximum token limit of 50 tokens per file read.
D. Encrypt the rest of the codebase with an asymmetric key.

**Correct (per source):** B

**Explanation (per source, verbatim):** Scoping target file system rules within path exclusion definitions matches production tool execution boundaries.


### RAW-GQ-020
**Source:** google-s-01.md, Q20

A development team wants to configure Claude to write automated unit tests for legacy code. To maximize test quality, what context should be provided alongside the target source file?

A. The entire git commit history from the last three years.
B. The project's testing framework standards, a mock data utility guide, and a few examples of well-written existing tests.
C. The compiler source code of the operating system.
D. A list of all developer usernames and email addresses.

**Correct (per source):** B

**Explanation (per source, verbatim):** Test quality correlates directly with providing in-context execution rules, architecture frameworks, and high-quality baseline few-shot examples.


### RAW-GQ-021
**Source:** google-s-01.md, Q21

When using Claude for large-scale code refactoring, what is a primary limitation of processing a codebase purely through a standard text-based chat interface compared to a specialized workspace tool?

A. Standard chat interfaces cannot understand programming languages other than Python.
B. Standard chat interfaces lack automatic file system synchronization, dependency graph tracking, and terminal execution hooks.
C. Standard chat interfaces are entirely deterministic and cannot generate creative code.
D. Standard chat interfaces enforce a maximum limit of 10 lines of code per response.

**Correct (per source):** B

**Explanation (per source, verbatim):** Standard web completion lacks file-system manipulation trees, workspace terminal execution loops, and git hooks.


### RAW-GQ-022
**Source:** google-s-01.md, Q22

An architect needs to configure automated linting checks into an LLM-driven coding agent pipeline. Why should linting occur immediately after code generation?

A. It reduces the cost of the initial generation block.
B. It allows the system to catch and automatically feed syntax/style errors back to the model for self-correction before any human code review occurs.
C. It changes the model's architecture from dense to sparse.
D. It speeds up the internet connection to the API endpoint.

**Correct (per source):** B

**Explanation (per source, verbatim):** Inline linting checks capture syntax patterns immediately, looping errors into context for low-latency self-healing paths.


### RAW-GQ-023
**Source:** google-s-01.md, Q23

When providing feedback to Claude Code about a compilation failure, which input format yields the fastest and most accurate resolution?

A. "The build failed, please fix it."
B. The complete, exact compiler error log along with the names and relevant lines of the files that failed to compile.
C. A screenshot of the terminal window converted to a base64 string.
D. A link to a public forums page discussing a similar error.

**Correct (per source):** B

**Explanation (per source, verbatim):** Precision self-healing relies on supplying deterministic stack traces alongside file names to avoid speculative iterations.


### RAW-GQ-024
**Source:** google-s-01.md, Q24

To prevent an automated coding agent from introducing breaking security vulnerabilities (e.g., hardcoded secrets, SQL injection), which architectural guardrail should be enforced?

A. Rely entirely on the model's systemic safety tuning to never write insecure code.
B. Integrate automated static application security testing (SAST) tools into the agent's post-generation execution chain.
C. Remove all database access blocks from the enterprise entirely.
D. Force the model to only use single-character variable names.

**Correct (per source):** B

**Explanation (per source, verbatim):** Automated post-generation SAST validation guarantees a reliable security guardrail that cannot be bypassed by system tuning bypasses.


### RAW-GQ-025
**Source:** google-s-01.md, Q25

A team is using Claude to migrate a monolithic backend to microservices. The codebase is roughly 2 million lines of code. What is the most token-efficient way to handle this with Claude's context window?

A. Upload all 2 million lines of code in a single API request.
B. Deconstruct the architecture into modular components, extract dependency graphs, and process individual modules sequentially.
C. Convert the entire codebase into binary and feed it as a single chunk.
D. Skip passing the source code and ask the model to generate the microservices based purely on a 1-sentence summary.

**Correct (per source):** B

**Explanation (per source, verbatim):** Breaking giant text volumes down into modular graphs matches context scaling best practices and limits input cost bloat.


### RAW-GQ-026
**Source:** google-s-01.md, Q26

Which environment variable is typically used to authenticate automated CLI tools like Claude Code against enterprise infrastructure securely?

A. ANTHROPIC_API_KEY
B. CLAUDE_PASSWORD
C. SYSTEM_ROOT_AUTH
D. GITHUB_USER_COOKIE

**Correct (per source):** A

**Explanation (per source, verbatim):** ANTHROPIC_API_KEY is the standard cross-platform credential environment variable for authenticating tool endpoints.


### RAW-GQ-027
**Source:** google-s-01.md, Q27

When using an LLM to generate complex Docker configurations, what precaution must be taken regarding base images?

A. Base images should always be left blank for the model to invent.
B. Explicitly pin verified, secure, and minimal base images (like Alpine or distroless tags) in the system context/instructions rather than letting the model pick unverified tags.
C. Allow the model to pull random images from public unverified personal registries.
D. Avoid using base images entirely and build everything from scratch.

**Correct (per source):** B

**Explanation (per source, verbatim):** Strict enterprise hardening mandates explicit pinning of secure base images inside context systems to prevent supply chain execution leaks.


### RAW-GQ-028
**Source:** google-s-01.md, Q28

Your codebase tracking system needs to provide Claude with an understanding of project structure. What is the most lightweight, token-saving structural overview you can provide?

A. A full printout of every file's contents.
B. A clean directory tree diagram (e.g., generated via the tree command) showing paths and file names up to a reasonable depth.
C. A list of all file sizes in bytes.
D. A text file containing only the vowels found in the filenames.

**Correct (per source):** B

**Explanation (per source, verbatim):** Standard system directory map output summaries reduce structural over-indexing while supplying directory schema mapping.


### RAW-GQ-029
**Source:** google-s-01.md, Q29

You want Claude 3.5 Sonnet to reliably output a complex nested JSON object matching an exact schema for an upstream API. Which technique is recommended?

A. Wrap the schema description in informal dialogue and set temperature to 1.0.
B. Provide a clear JSON schema definition using XML tags for structure, provide a concrete few-shot example of a valid JSON output, and set the temperature to 0.
C. Request the output in Markdown format first, then manually write regex to guess the keys.
D. Tell the model that if it fails to output perfect JSON, the connection will drop.

**Correct (per source):** B

**Explanation (per source, verbatim):** Combining explicit typing definitions, distinct XML tags, formatting anchors, and zero temperature maximizes structured compliance.


### RAW-GQ-030
**Source:** google-s-01.md, Q30

What is the structural role of XML tags (e.g., <instructions>, <context>, <examples>) when engineering prompts for Anthropic models?

A. They convert the prompt text directly into executable HTML web pages.
B. They serve as clear, semantic boundary markers that help Claude separate instructions from data inputs and context, reducing confusion.
C. They reduce the token count of the prompt by 50%.
D. They override the model's base safety alignment parameters.

**Correct (per source):** B

**Explanation (per source, verbatim):** Anthropic models are trained extensively on XML data structures to maintain strict semantic borders between code instructions and user parameters.


### RAW-GQ-031
**Source:** google-s-01.md, Q31

You are experiencing a high rate of hallucinations in a document summarization application. The model keeps adding facts not found in the original source text. How can you minimize this via prompt engineering?

A. Tell the model to think creatively and infer missing values.
B. Explicitly instruct the model to rely only on the provided text, state "if the information is not present, respond with 'Not found'", and use a clear thinking step before answering.
C. Delete the system prompt and put everything in the user prompt role.
D. Increase the temperature to 0.9.

**Correct (per source):** B

**Explanation (per source, verbatim):** Anchoring models directly to the provided text block while giving an explicit "escape phrase" for missing items minimizes hallucinations.


### RAW-GQ-032
**Source:** google-s-01.md, Q32

What is a key difference between the system prompt parameter and the user prompt parameter in the Anthropic Messages API?

A. The system prompt is meant for high-level instructions, behavioral constraints, and roles that persist across structural processing, while the user prompt represents the active query turn.
B. The system prompt is billed at 10x the rate of the user prompt.
C. The user prompt cannot accept text strings.
D. The system prompt can only be read by Claude 3 Opus.

**Correct (per source):** A

**Explanation (per source, verbatim):** The system parameter fixes static boundary conditions, persona constraints, and baseline rules across API context steps.


### RAW-GQ-033
**Source:** google-s-01.md, Q33

When providing few-shot examples in a prompt to guide Claude's formatting behavior, where should these examples ideally be placed according to Anthropic's documentation guidelines?

A. Interleaved randomly throughout the user's input text.
B. Inside distinct XML tags (e.g., <examples>) within the system prompt or early in the context, before the actual data to be processed.
C. At the very end of the prompt sequence, after the model's stop sequences.
D. Wrapped inside an image payload asset.

**Correct (per source):** B

**Explanation (per source, verbatim):** Structuring baseline context examples inside clean semantic brackets prevents confusion with input variables.


### RAW-GQ-034
**Source:** google-s-01.md, Q34

An engineer wants to force Claude to write an explanation before giving a final classification code (e.g., "Reasoning: ... Code: SUCCESS"). Why is this sequential ordering superior to returning the code first?

A. It generates fewer total tokens.
B. Generating reasoning first allows the model to compute intermediate thought pathways, improving the statistical likelihood of selecting the correct final classification token.
C. Returning the code first causes the API transaction to time out.
D. It allows the client application to skip parsing the code entirely.

**Correct (per source):** B

**Explanation (per source, verbatim):** Forcing intermediate rationalization phases utilizes context calculations to increase final selection probability metrics.


### RAW-GQ-035
**Source:** google-s-01.md, Q35

Which parameter should be modified to make Claude's responses completely deterministic for recurring validation testing?

A. Set max_tokens to 1.
B. Set temperature to 0.0.
C. Set top_p to 1.0 and temperature to 1.0.
D. Add a random string to the system prompt.

**Correct (per source):** B

**Explanation (per source, verbatim):** A zero-value temperature forces model token processing to follow deterministic pathways by disabling probabilistic variations.


### RAW-GQ-036
**Source:** google-s-01.md, Q36

You notice that Claude is failing to follow negative constraints (e.g., "Do not include any pleasantries or greetings"). What is an effective way to re-engineer this instruction for better compliance?

A. Write the negative constraint 50 times in uppercase letters.
B. Rephrase it as a positive constraint (e.g., "Start your response directly with the first data point. Omit all greetings, introductions, and polite transitions.") and enforce it with a few-shot example.
C. Increase the model's temperature to 1.0.
D. Switch to a model from a different vendor.

**Correct (per source):** B

**Explanation (per source, verbatim):** Positive prescriptive structural framing is processed more reliably than abstract negative constraints.


### RAW-GQ-037
**Source:** google-s-01.md, Q37

What happens if you specify a stop sequence of ["</json>"] in your API request to Claude?

A. The API will throw an invalid parameter error.
B. The model will immediately cease text generation as soon as it outputs the token string </json>, preventing further trailing text or tokens.
C. The model will skip generating JSON entirely.
D. The server will cache the prompt automatically.

**Correct (per source):** B

**Explanation (per source, verbatim):** Stop sequences immediately interrupt API generations once the target character structure matches, optimizing token efficiency.


### RAW-GQ-038
**Source:** google-s-01.md, Q38

When asking Claude to process raw text data containing arbitrary symbols, brackets, and conversational text, how should you wrap that data to prevent prompt injection or parsing failures?

A. Enclose the raw data cleanly within descriptive XML tags like <user_data>...</user_data> and instruct the model to treat everything inside those tags as untrusted content.
B. Remove all spaces and punctuation from the raw text data.
C. URL-encode the text data into a single string line.
D. Paste it directly into the middle of your core instruction sentence.

**Correct (per source):** A

**Explanation (per source, verbatim):** Enclosing incoming string blocks in XML brackets creates clear data isolation lines to neutralize prompt injection vectors.


### RAW-GQ-039
**Source:** google-s-01.md, Q39

You want Claude to generate text in a highly specific, rare poetic style. Which approach gives the model the best guidance?

A. Give a 1-word instruction naming the style.
B. Provide explicit structural rules of the poetic form (syllables, rhyme scheme) along with multiple high-quality examples of that exact style inside XML tags.
C. Lower the max_tokens limit to 10 tokens.
D. Use Claude 3 Haiku without any instructions.

**Correct (per source):** B

**Explanation (per source, verbatim):** Structural rule declarations combined with illustrative style blueprints ensure maximum style adherence.


### RAW-GQ-040
**Source:** google-s-01.md, Q40

When designing prompts for high-volume enterprise production environments, why should you avoid overly verbose and repetitive phrasing in your instructions?

A. Claude cannot read prompts longer than 500 words.
B. Verbosity increases input token costs and input latency unnecessarily without guaranteeing a proportional increase in accuracy.
C. Repetitive phrasing causes the Anthropic API gateway to flag the request as spam.
D. Verbosity changes the output format to binary.

**Correct (per source):** B

**Explanation (per source, verbatim):** Redundant token noise inflates execution latency and overhead costs without driving equivalent accuracy returns.


### RAW-GQ-041
**Source:** google-s-01.md, Q41

An enterprise architecture requires Claude to communicate securely with an on-premise PostgreSQL database. Under the Model Context Protocol (MCP) framework, which component is directly responsible for establishing the database connection and running SQL queries?

A. The MCP Client
B. The MCP Server
C. The Anthropic Hosted API Cloud
D. The Claude Desktop Application Client

**Correct (per source):** B

**Explanation (per source, verbatim):** Within the Model Context Protocol architecture, the Server component directly manages downstream local data execution connections.


### RAW-GQ-042
**Source:** google-s-01.md, Q42

When defining a tool's input_schema in the Claude API, what standard format must be used?

A. Protocol Buffers
B. XML Schema Definition (XSD)
C. JSON Schema (typically draft-07)
D. Raw YAML string blocks

**Correct (per source):** C

**Explanation (per source, verbatim):** Tool parameter descriptions are standard draft-07 JSON schemas parsing key-value object structures.


### RAW-GQ-043
**Source:** google-s-01.md, Q43

What is the structural role of the description field within a tool definition payload submitted to the Claude API?

A. It is ignored by the model and used only for internal human developer logging.
B. It provides semantic context that tells Claude what the tool does, when it should be called, and what its parameters mean.
C. It defines the encryption key for the tool payload transmission.
D. It specifies the billing rate tier for the tool execution loop.

**Correct (per source):** B

**Explanation (per source, verbatim):** Tool descriptions function as critical semantic instructions used by the model's inner reasoning turns to select endpoints.


### RAW-GQ-044
**Source:** google-s-01.md, Q44

Under the Model Context Protocol (MCP), what is the fundamental functional difference between a Resource and a Tool?

A. A Resource allows the model to perform read-only data inspection, while a Tool allows the model to execute actions and side effects.
B. A Resource can only be written in Python, while a Tool can only be written in TypeScript.
C. Tools are hosted on Anthropic's servers; Resources are hosted on the client machine.
D. There is no difference; they are synonymous terms in the specification.

**Correct (per source):** A

**Explanation (per source, verbatim):** Resources are read-only background context sources; Tools are active execution blocks engineered to generate side effects.


### RAW-GQ-045
**Source:** google-s-01.md, Q45

An application developer passes a tool definition called get_weather to Claude. Claude outputs a response containing a tool_use block. What action must the client application take next?

A. Do nothing; Claude executes the weather API internally on Anthropic's secure servers.
B. Intercept the tool_use block, read the parameters, execute the local code or external weather API, and return the result to Claude in a tool_result message block.
C. Throw a validation exception and terminate the session.
D. Clear the chat history and restart the prompt turn.

**Correct (per source):** B

**Explanation (per source, verbatim):** The client gateway abstracts tool execution, running local system code before feeding results back into the session history stack.


### RAW-GQ-046
**Source:** google-s-01.md, Q46

You are configuring an MCP integration for an engineering team using Claude Desktop. Where are the local MCP servers declared so the desktop client can discover and spin them up?

A. In a centralized system registry keys folder.
B. Inside the claude_desktop_config.json configuration file under the mcpServers key block.
C. In the environment path variable $PATH.
D. By sending a POST request to anthropic.com.

**Correct (per source):** B

**Explanation (per source, verbatim):** Local client configurations specify MCP server paths, discovery arguments, and runtime variables inside the workspace profile.


### RAW-GQ-047
**Source:** google-s-01.md, Q47

An enterprise security policy states that Claude must never see unencrypted credit card tokens. However, Claude needs to trigger a payment processor tool. How should you design the tool schema parameters?

A. Have Claude accept the raw card details and trust the model to encrypt them.
B. Have the tool accept a temporary, abstract session_id or vault_token that the backend system resolves internally without exposing raw credit card numbers to the LLM.
C. Pass the credit card numbers inside an image asset payload.
D. Disable the payment tool and ask the user to type the credit card number into a public forum.

**Correct (per source):** B

**Explanation (per source, verbatim):** Abstract token routing structures prevent toxic or restricted data items from entering the transformer history layers.


### RAW-GQ-048
**Source:** google-s-01.md, Q48

When configuring the tool_choice parameter in the Anthropic Messages API, setting it to {"type": "any"} instructs the model to do what?

A. Refuse to use any tools and only output a conversational text response.
B. Force the model to select and call at least one of the provided tools, bypassing conversational response text if necessary.
C. Pick a tool from a completely random third-party public directory.
D. Let the model choose whether to use a tool or return text freely.

**Correct (per source):** B

**Explanation (per source, verbatim):** Setting any-type tool choice locks the model into an immediate tool allocation mode, forcing structural programmatic turns.


### RAW-GQ-049
**Source:** google-s-01.md, Q49

An MCP server communicates with an MCP client (like Claude Desktop) over what standard transport protocol for local processes?

A. WebSockets over TLS
B. Standard Input/Output (stdio) using JSON-RPC 2.0 messages
C. gRPC over HTTP/2
D. FTP raw data streams

**Correct (per source):** B

**Explanation (per source, verbatim):** Local host-to-server MCP configurations operate over JSON-RPC 2.0 communication protocols via standard I/O pipes.


### RAW-GQ-050
**Source:** google-s-01.md, Q50

What is an MCP Prompt primitive as defined by the Model Context Protocol specification?

A. An automated system that deletes user history logs.
B. A server-exposed slice of reusable prompt templates and workflows that the client can discover and present to the user or model.
C. A hardware acceleration chip used to train Claude models.
D. A mandatory security password required to log into Claude Code.

**Correct (per source):** B

**Explanation (per source, verbatim):** Prompt primitives expose centralized templates and conversational workflows directly out of the server layers.


### RAW-GQ-051
**Source:** google-s-01.md, Q51

If a tool parameter is critical for execution (e.g., account_id for a banking lookup), how should this be enforced in the tool definition payload?

A. Mention it casually in the tool's description text.
B. Include the parameter name string within the required array of the tool's JSON schema block.
C. Create a separate tool called require_account_id.
D. Set the model's temperature to exactly 0.5.

**Correct (per source):** B

**Explanation (per source, verbatim):** Marking critical schema components inside the JSON required list explicitly enforces structural runtime compliance.


### RAW-GQ-052
**Source:** google-s-01.md, Q52

An enterprise legal application processes 200-page contracts repeatedly throughout the day. To optimize API latency and reduce input token expenses, the architect should utilize which Anthropic feature?

A. Token compression arrays
B. Prompt Caching (context caching)
C. Local context window slicing
D. Dynamic model compilation

**Correct (per source):** B

**Explanation (per source, verbatim):** Context caching patterns allow massive reference datasets to be retained in server memory pools to lower cost parameters.


### RAW-GQ-053
**Source:** google-s-01.md, Q53

What is the structural requirement for an exact cache hit when using Anthropic's Prompt Caching mechanism?

A. The system prompt must change completely on every single API request turn.
B. The prompt prefix (from the beginning of the prompt up to the cache breakpoint marker) must be structurally and textually identical to a previously cached sequence.
C. The user must be connecting from the exact same IP address.
D. The max_tokens parameter must be set to an odd number.

**Correct (per source):** B

**Explanation (per source, verbatim):** Cache matches demand absolute binary character and structure identity starting from the absolute beginning of the string layout.


### RAW-GQ-054
**Source:** google-s-01.md, Q54

You are implementing prompt caching for a customer service chatbot. You place the current_timestamp and user_session_id at the very beginning of the system prompt, followed by a 40,000-token corporate policy knowledge base document. What is the impact on cache performance?

A. Cache hit rate will be 100% because the massive document is included.
B. Cache hit rate will drop to 0% because the dynamic variables at the beginning change every time, invalidating the exact prefix match required for the subsequent static text.
C. The API will automatically move the dynamic variables to the end of the prompt.
D. The cost will be reduced by 90% regardless of the order.

**Correct (per source):** B

**Explanation (per source, verbatim):** Prepending variable metadata strings early inside the input structure shifts alignment positions, invalidating downline prefix matching.


### RAW-GQ-055
**Source:** google-s-01.md, Q55

What is the minimum token threshold required to trigger or construct a cache milestone for Claude 3.5 Sonnet prompts?

A. 10 tokens
B. 1,024 tokens
C. 100,000 tokens
D. 50,000 tokens

**Correct (per source):** B

**Explanation (per source, verbatim):** The baseline entry milestone for caching mechanisms requires an initial character text depth of 1,024 prompt tokens.


### RAW-GQ-056
**Source:** google-s-01.md, Q56

An application needs to summarize a high-volume flow of incoming medical logs while ensuring the highest level of data privacy and reliability. Which deployment choice aligns with strict enterprise governance?

A. Sending the logs via a public unencrypted third-party proxy website.
B. Using Anthropic's API endpoints configured with zero data retention commitments or enterprise cloud-provider gateways (e.g., AWS Bedrock or Google Cloud Vertex AI) that guarantee data isolation.
C. Storing the logs in a public GitHub repository for easy API fetching.
D. Disabling all API security tokens to speed up delivery.

**Correct (per source):** B

**Explanation (per source, verbatim):** High-compliance ecosystems rely on private cloud infrastructure tenancy models to manage pipeline data residency layers.


### RAW-GQ-057
**Source:** google-s-01.md, Q57

When designing a system to handle token limit exceptions defensively, what is the best metric to monitor on the client application side from the API response?

A. The response latency time in milliseconds.
B. The usage metadata block, specifically input_tokens and output_tokens.
C. The server IP address string.
D. The version code of the operating system.

**Correct (per source):** B

**Explanation (per source, verbatim):** API token logging records usage dimensions directly inside returned transport metadata blocks.


### RAW-GQ-058
**Source:** google-s-01.md, Q58

Your application experiences a sudden surge in traffic, resulting in HTTP 429 (Too Many Requests) rate limit errors from the Anthropic API. What is the correct architectural pattern to manage this gracefully?

A. Immediately retry the request in an unconstrained loop as fast as possible.
B. Implement an exponential backoff retry strategy with jitter in the client gateway orchestrator.
C. Crash the application server and force a hard reboot.
D. Lower the API key security permission level.

**Correct (per source):** B

**Explanation (per source, verbatim):** Rate limit exceptions demand retry pacing protocols built on randomized exponential delays to protect API pathways.


### RAW-GQ-059
**Source:** google-s-01.md, Q59

Why should system architectures decouple long-term enterprise knowledge (e.g., 500 product manuals) into a Retrieval-Augmented Generation (RAG) vector database rather than feeding everything into Claude's massive context window every single turn?

A. Claude cannot read text related to product manuals.
B. It optimizes both cost and operational latency by retrieving only the most relevant text chunks for a query, avoiding wasting tokens on irrelevant context.
C. Vector databases automatically correct syntax errors in Claude's output.
D. Decoding speed is completely independent of prompt size.

**Correct (per source):** B

**Explanation (per source, verbatim):** RAG pipelines eliminate extensive token footprint overhead by routing only highly relevant historical chunks into the system window.


### RAW-GQ-060
**Source:** google-s-01.md, Q60

When utilizing Claude 3.5 Sonnet for critical automated assessments, what is the primary reason for configuring a dual-region or fallback endpoint architecture (e.g., primary on AWS Bedrock, fallback on Anthropic API direct)?

A. It makes the model execute responses twice as fast under normal loads.
B. It ensures high availability and business continuity in the event of regional cloud outages or strict API rate limit exhaustion.
C. It alters the underlying weights of the model dynamically.
D. It is a mandatory requirement enforced by the JSON schema standard.

**Correct (per source):** B

**Explanation (per source, verbatim):** Cross-regional high-availability architectures preserve runtime continuity against regional infrastructure link downlines.

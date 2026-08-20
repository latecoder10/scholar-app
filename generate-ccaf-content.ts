/**
 * Script to generate comprehensive Claude CCAF (Claude Certified Architect - Foundations) content packs
 */
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");

interface Question {
  id: number;
  question: string;
  options: string[];
  answer: string;
  difficulty: "Easy" | "Medium" | "Hard";
  source: string;
  explanation: string;
  examTrick: string;
  importance: "High" | "Medium" | "Low";
  tags: string[];
}

interface ChapterJSON {
  subject: string;
  chapter: string;
  exam: string;
  paper: string;
  description: string;
  questions: Question[];
}

// Ensure base dir exists
if (!fs.existsSync(CONTENT_DIR)) {
  fs.mkdirSync(CONTENT_DIR, { recursive: true });
}

function writeChapter(folderName: string, fileName: string, data: ChapterJSON) {
  const folderPath = path.join(CONTENT_DIR, folderName);
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true });
  }
  const filePath = path.join(folderPath, fileName);
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
  console.log(`Created: ${folderName}/${fileName} with ${data.questions.length} questions`);
}

// -------------------------------------------------------------
// DOMAIN 1: Agentic Architecture & Orchestration
// -------------------------------------------------------------
writeChapter("Claude-CCAF-Agentic-Architecture", "chapter-01-agentic-loops-and-orchestration.json", {
  subject: "Agentic Architecture & Orchestration",
  chapter: "Agentic Loops & Orchestration Patterns",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Core principles of agentic loops, stop_reason inspects, coordinator-worker models, pipeline vs parallel decomposition, and avoiding hardcoded decision trees.",
  questions: [
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
      difficulty: "Medium",
      source: "Claude Certification Guide / Anthropic Architect",
      explanation: "Pipeline orchestration is the textbook pattern for sequential dependencies where each stage completes before the next begins, with the output of one stage serving as input to the next (data collection -> analysis -> report generation).",
      examTrick: "When dependencies are strictly sequential and known upfront (A -> B -> C), choose Pipeline Orchestration. When independent, choose Parallel. When open-ended, choose Dynamic Adaptive.",
      importance: "High",
      tags: ["Agentic Orchestration", "Pipeline Pattern", "Coordinator"]
    },
    {
      id: 2,
      question: "The moderation system's agentic loop uses a hardcoded decision tree: if classify_content returns 'hate_speech', call escalate_to_human; if 'spam', call auto_remove. Testing shows satirical critique is auto-escalated and disguised spam passes. What is the architectural problem?",
      options: [
        "The classify_content tool needs more granular category labels to differentiate satire",
        "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh full context before acting",
        "Add a confidence threshold so only high-confidence classifications trigger automatic actions",
        "Route all ambiguous cases to human review to avoid misclassification"
      ],
      answer: "Replace the hardcoded decision tree with model-driven decisions, letting Claude weigh full context before acting",
      difficulty: "Hard",
      source: "Claude CCAF Official Exam Guide",
      explanation: "Hardcoded decision trees treat classification labels as absolute when real content is nuanced. Letting Claude reason about context (satire vs genuine hate, subtle spam patterns) produces far better moderation decisions.",
      examTrick: "Anti-Pattern Alert: Hardcoded if/else trees on classification outputs destroy agentic flexibility. Real agentic loops rely on model-driven reasoning within the loop.",
      importance: "High",
      tags: ["Agentic Loops", "Model-Driven Decisions", "Anti-Patterns"]
    },
    {
      id: 3,
      question: "An architect is designing an autonomous agent loop using Claude 3.5 Sonnet to handle customer refunds. To prevent getting stuck in an infinite loop if a tool fails repeatedly, which architectural pattern should be implemented?",
      options: [
        "Set the API temperature to 1.0 to introduce randomness in retries",
        "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded",
        "Use a smaller model like Claude 3 Haiku for the fallback loop",
        "Blindly reduce the max_tokens parameter to truncate the execution loop"
      ],
      answer: "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded",
      difficulty: "Medium",
      source: "Google / Anthropic Architect Exam",
      explanation: "A stateful tracking layer and iteration cap / circuit breaker in the orchestrator prevents uncontrolled runaway loops, mitigating catastrophic billing and hanging sessions.",
      examTrick: "Always enforce an iteration cap / loop circuit breaker at the orchestrator level, never depend on model self-termination in failure states.",
      importance: "High",
      tags: ["Circuit Breaker", "Loop Safety", "Orchestrator"]
    },
    {
      id: 4,
      question: "A customer-support agent runs an agentic loop. Each turn it inspects stop_reason; when the value is 'tool_use' it executes the requested tool. Before calling the model again so the loop continues coherently, what must the agent do?",
      options: [
        "Append the tool result to the conversation history as a new message, then send the full updated conversation on the next call",
        "Replace the previous assistant message with the tool output to keep the context window small",
        "Send only the tool output on the next call, since the API retains the earlier turn server-side",
        "Store the tool output in an external store and pass a reference id to the model on the next call"
      ],
      answer: "Append the tool result to the conversation history as a new message, then send the full updated conversation on the next call",
      difficulty: "Easy",
      source: "Claude Agent SDK Guide",
      explanation: "The Claude Messages API is stateless. The client application must append the assistant's tool_use block and the corresponding tool_result message block into the messages array and send the updated array.",
      examTrick: "The Messages API is completely stateless: tool_use followed by tool_result must both exist in the conversation history sent on the next request.",
      importance: "High",
      tags: ["Agentic Loops", "Messages API", "tool_result"]
    },
    {
      id: 5,
      question: "In an orchestrator-worker pattern, why is it beneficial to use Claude 3 Haiku for the initial classification/routing step rather than Claude 3.5 Sonnet or Opus?",
      options: [
        "Haiku has a larger context window than Sonnet or Opus",
        "Haiku provides a significant reduction in Time-to-First-Token (TTFT) and lower token cost for high-volume routing tasks",
        "Haiku natively supports more tool schemas than Sonnet",
        "Haiku eliminates the need for an orchestrator layer entirely"
      ],
      answer: "Haiku provides a significant reduction in Time-to-First-Token (TTFT) and lower token cost for high-volume routing tasks",
      difficulty: "Easy",
      source: "Anthropic Enterprise Architecture",
      explanation: "Triage and intent classification are fast, single-turn classification tasks. Claude 3 Haiku delivers near-instant Time-to-First-Token and fraction-of-a-cent pricing, preserving Sonnet/Opus budget for deep reasoning workers.",
      examTrick: "Triage / Router = Haiku (low TTFT, low cost). Execution / Synthesis = Sonnet (best coding & reasoning). Complex multi-domain deliberation = Opus.",
      importance: "Medium",
      tags: ["Model Tiering", "Haiku", "Routing Pattern"]
    },
    {
      id: 6,
      question: "In a content moderation system using hub-and-spoke architecture, the image analyser directly calls the policy enforcer's action tools to remove posts, bypassing the coordinator. What is the architectural violation?",
      options: [
        "Give the image analyser its own copy of the policy enforcer's action tools",
        "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator",
        "Merge the image analyser and policy enforcer into a single subagent to simplify communication",
        "Add an asynchronous message queue between the image analyser and policy enforcer"
      ],
      answer: "The image analyser breaks hub-and-spoke isolation; scope its tools to image analysis and route all results back through the coordinator",
      difficulty: "Medium",
      source: "Claude Certification Guide Q19",
      explanation: "In hub-and-spoke orchestration, subagents must be strictly isolated and communicate exclusively through the coordinator. Direct subagent-to-subagent execution creates unmonitored side-effects and breaks auditability.",
      examTrick: "Hub-and-Spoke Golden Rule: Subagents never talk directly to each other or invoke each other's tools. All communication passes through the coordinator.",
      importance: "High",
      tags: ["Hub and Spoke", "Subagent Isolation", "Orchestration"]
    },
    {
      id: 7,
      question: "A consulting firm's research system coordinator always invokes the full 5-subagent pipeline for every query, including simple lookups that only need web search. What is the correct architectural fix?",
      options: [
        "Have the coordinator select which subagents to invoke per query, not always the full pipeline",
        "Allow subagents to communicate directly with each other so they can skip unnecessary steps",
        "Add a caching layer so subagents that have no work to do return immediately",
        "Split into two separate systems: one for simple queries and one for complex queries"
      ],
      answer: "Have the coordinator select which subagents to invoke per query, not always the full pipeline",
      difficulty: "Easy",
      source: "Claude Certification Guide Q46",
      explanation: "The coordinator should analyse query requirements dynamically and only spawn the required subagents, avoiding unnecessary latency and API cost on simple queries.",
      examTrick: "Dynamic routing by the coordinator beats rigid monolithic pipelines every time.",
      importance: "Medium",
      tags: ["Dynamic Routing", "Coordinator", "Cost Optimization"]
    },
    {
      id: 8,
      question: "The coordinator receives a batch of 200 flagged posts to moderate. Currently it processes them sequentially, taking 45 minutes. Each post's moderation is independent. How should the coordinator handle this batch?",
      options: [
        "Process all 200 posts in a single API call by concatenating them into one large prompt",
        "Delegate independent posts to parallel subagent instances, with the coordinator aggregating results as they complete",
        "Split into fixed batches of 20 posts and process each batch sequentially in a single prompt",
        "Increase the iteration cap on the agentic loop to allow the agent more time to process all 200 posts"
      ],
      answer: "Delegate independent posts to parallel subagent instances, with the coordinator aggregating results as they complete",
      difficulty: "Medium",
      source: "Claude Certification Guide Q60",
      explanation: "Since every post is completely independent, delegating each to parallel subagent instances drops total latency to the time of the slowest single evaluation and prevents attention dilution across posts.",
      examTrick: "Independent subtasks = spawn parallel subagent instances. Dependent sequential subtasks = pipeline handoff.",
      importance: "High",
      tags: ["Parallel Subagents", "Throughput", "Attention Dilution"]
    }
  ]
});

writeChapter("Claude-CCAF-Agentic-Architecture", "chapter-02-subagent-spawning-and-context.json", {
  subject: "Agentic Architecture & Orchestration",
  chapter: "Subagent Spawning, Tools Scoping & Context Passing",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Task tool usage, allowedTools configuration, optimal 4-5 tool boundary, context passing schemas, and avoiding context contamination.",
  questions: [
    {
      id: 1,
      question: "The coordinator agent has AgentDefinitions configured for four specialized subagents. During testing, the coordinator reasons 'I will ask the web search agent to find sources', but no subagent execution ever occurs, and logs show no errors. What is the most likely cause?",
      options: [
        "Subagent context isolation means task descriptions don't reach subagents automatically",
        "The coordinator's max_tokens setting is too low, truncating the invocation",
        "The coordinator's allowedTools configuration doesn't include 'Task', so it cannot invoke the tool required to spawn subagents",
        "The coordinator's system prompt doesn't list the subagent names"
      ],
      answer: "The coordinator's allowedTools configuration doesn't include 'Task', so it cannot invoke the tool required to spawn subagents",
      difficulty: "Medium",
      source: "Exam Heist Q10 / CCAF Blueprint",
      explanation: "In the Claude Agent SDK, spawning subagents requires the built-in 'Task' tool. If 'Task' is omitted from allowedTools, the model can reason about delegating in text, but has no programmatic tool to actually execute the spawn.",
      examTrick: "If an agent talks about delegating but nothing actually fires with no errors, check allowedTools for the 'Task' tool!",
      importance: "High",
      tags: ["Task Tool", "AgentDefinitions", "allowedTools"]
    },
    {
      id: 2,
      question: "A web search subagent has 9 tools: web_search, url_fetch, html_parse, pdf_extract, image_ocr, translate, summarise, keyword_extract, sentiment_analysis. In testing, it frequently calls summarise and sentiment_analysis when it should only fetch raw data. How should this be fixed?",
      options: [
        "Add system prompt instructions telling the web search agent to ignore analysis tools",
        "Reduce the web search agent to the 4-5 data-fetching tools and move the analysis tools to the specialist agents",
        "Keep all 9 tools but implement PreToolUse hooks that block the web search agent from calling summarise",
        "Merge the web search and synthesis agents into a single agent since they share tools"
      ],
      answer: "Reduce the web search agent to the 4-5 data-fetching tools and move the analysis tools to the specialist agents",
      difficulty: "Medium",
      source: "Claude Certification Guide Q29",
      explanation: "Anthropic research recommends 4-5 scoped tools per agent. Providing 9 tools increases cognitive decision complexity and causes tool misrouting. The architectural fix is scoped tool access.",
      examTrick: "Recommended Tool Ceiling: 4 to 5 tools per agent. Beyond 5 tools, tool selection accuracy drops steeply.",
      importance: "High",
      tags: ["Tool Scoping", "4-5 Tools Limit", "Subagent Roles"]
    },
    {
      id: 3,
      question: "A coordinator spawns a web search subagent and a document analysis subagent sequentially across separate turns. Web search takes 8s, document analysis takes 12s (total 20s). The two subagents investigate independent topics. How should the architect reduce latency to ~12s?",
      options: [
        "Merge the web search and document analysis into a single subagent",
        "Have the coordinator emit both Task tool calls in a single response message rather than across separate conversation turns",
        "Allow the web search subagent to directly invoke the document analysis subagent",
        "Use fork_session to split the coordinator into two branches"
      ],
      answer: "Have the coordinator emit both Task tool calls in a single response message rather than across separate conversation turns",
      difficulty: "Medium",
      source: "Claude Certification Guide Q57 / Exam Heist Q7",
      explanation: "When the coordinator emits multiple Task tool_use blocks in a single response turn, the runtime executes them concurrently in parallel, so total latency equals the longest individual task (12s instead of 20s).",
      examTrick: "Parallel Tool Execution: Emit multiple tool_use blocks in ONE assistant response turn. The client executes concurrently.",
      importance: "High",
      tags: ["Parallel Spawning", "Task Tool", "Latency Optimization"]
    },
    {
      id: 4,
      question: "After the web search agent finds 25 sources (120K tokens), document analysis extracts key insights (15K tokens), and synthesis drafts a 3K token narrative, the coordinator must pass context to the report generator. What strategy provides the best balance of completeness and efficiency?",
      options: [
        "Pass only the synthesis draft and have a separate post-processing pipeline match claims to sources after generation",
        "Pass the full accumulated 120K context from all prior agents",
        "Pass the synthesis draft along with a structured source index that maps key claims to their source URLs and relevant excerpts",
        "Pass a condensed summary of all prior stages that attributes sources by name only"
      ],
      answer: "Pass the synthesis draft along with a structured source index that maps key claims to their source URLs and relevant excerpts",
      difficulty: "Hard",
      source: "Exam Heist Q14 / Exam Topics Q2",
      explanation: "Passing the draft plus a structured source index keeps the context compact (~5K tokens vs 120K tokens) while retaining exact quote excerpts and URLs for verbatim citation accuracy.",
      examTrick: "Context Passing Best Practice: Pass the synthesized draft + a structured index/manifest of claims & URLs. Avoid raw token dumps.",
      importance: "High",
      tags: ["Context Passing", "Source Index", "Efficiency"]
    },
    {
      id: 5,
      question: "After web search and document analysis complete, the coordinator invokes the synthesis agent. The synthesis agent responds that it cannot complete the task because no research findings were provided. What is the root cause?",
      options: [
        "The synthesis agent needs tools to fetch results directly from other agents' conversation histories",
        "The synthesis agent's context window was exceeded",
        "The subagents need to share a single API connection for automatic context sharing",
        "The coordinator did not include the outputs from the previous agents in the synthesis agent's prompt"
      ],
      answer: "The coordinator did not include the outputs from the previous agents in the synthesis agent's prompt",
      difficulty: "Easy",
      source: "Exam Heist Q1 / Exam Topics Q10",
      explanation: "Subagents have completely isolated contexts and share no memory. The coordinator must explicitly forward the outputs of predecessor subagents inside the invocation prompt of successor subagents.",
      examTrick: "Subagents do NOT share memory or context automatically. The coordinator must explicitly inject previous outputs into the next agent's prompt.",
      importance: "High",
      tags: ["Context Isolation", "Prompt Injection", "Subagents"]
    }
  ]
});

writeChapter("Claude-CCAF-Agentic-Architecture", "chapter-03-task-decomposition-and-session-state.json", {
  subject: "Agentic Architecture & Orchestration",
  chapter: "Task Decomposition Strategies & Session Management",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Dynamic adaptive decomposition, Plan Mode vs Direct Execution, session branching with fork_session, and handling mid-process state crashes.",
  questions: [
    {
      id: 1,
      question: "A research team is using Claude Code to explore two competing hypotheses starting from an initial baseline analysis: one statistical approach and one machine learning approach. Both must proceed independently without context contamination. Which session strategy is correct?",
      options: [
        "Resume the session twice with --resume, once for each hypothesis sequentially",
        "Start two fresh sessions with an injected summary of initial analysis",
        "Use the initial session and explore both hypotheses sequentially",
        "Use fork_session to create two independent branches from the shared analysis baseline"
      ],
      answer: "Use fork_session to create two independent branches from the shared analysis baseline",
      difficulty: "Medium",
      source: "Claude Certification Guide Q12",
      explanation: "fork_session branches the full, rich context of the initial baseline analysis into two independent isolated session threads, preventing either hypothesis from contaminating the other.",
      examTrick: "Divergent hypothesis testing from a common baseline = fork_session.",
      importance: "High",
      tags: ["fork_session", "Session Branching", "Context Isolation"]
    },
    {
      id: 2,
      question: "A multi-agent research pipeline crashed after processing 12 of 28 documents. Web search, partial extraction, and pattern identification had already occurred. What state management approach best balances information fidelity with context efficiency when resuming?",
      options: [
        "Have each agent persist a structured export to a known location; on resume, the coordinator loads the manifest and injects relevant state into agent prompts",
        "Persist the coordinator's raw conversation log containing all delegations and responses",
        "Have each agent maintain its own persistent state file and reload it independently",
        "Index all agent outputs in a shared vector store and use semantic search on resume"
      ],
      answer: "Have each agent persist a structured export to a known location; on resume, the coordinator loads the manifest and injects relevant state into agent prompts",
      difficulty: "Hard",
      source: "Exam Heist Q4 / Exam Topics Q3",
      explanation: "Persisting structured exports (JSON manifests) preserves 100% deterministic fidelity without raw transcript bloat, enabling the coordinator to resume only unprocessed documents with precise state injection.",
      examTrick: "Resuming interrupted multi-agent pipelines: Centralized structured manifest export > raw conversation logs > probabilistic vector stores.",
      importance: "High",
      tags: ["Pipeline Recovery", "State Manifest", "Fault Tolerance"]
    },
    {
      id: 3,
      question: "A developer extracting the notification subsystem from a monolith faces 12 cross-module dependencies, 3 messaging patterns, and several valid strategies. They start in direct execution mode and break circular dependencies after moving 8 files. What should they have done differently?",
      options: [
        "Used direct execution but with more detailed upfront prompt instructions",
        "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
        "Used direct execution but processed only 2 files at a time",
        "Delegated the entire extraction to a subagent to isolate risk"
      ],
      answer: "Used plan mode to map the 12 dependencies and evaluate extraction strategies before committing",
      difficulty: "Medium",
      source: "Claude Certification Guide Q24",
      explanation: "Plan mode is specifically designed for high-complexity, cross-module migrations with multiple valid architectural approaches and unknown dependencies. It maps the graph before file modifications begin.",
      examTrick: "Plan Mode: Use for multi-file migrations, ambiguous refactors, and complex dependencies. Direct Execution: Use for well-defined, local edits.",
      importance: "High",
      tags: ["Plan Mode", "Direct Execution", "Architecture"]
    },
    {
      id: 4,
      question: "A team needs an agent to add a comprehensive test suite to a large legacy codebase with no existing tests, unclear module dependencies, and unknown critical paths. Which task decomposition strategy is most appropriate?",
      options: [
        "A fixed sequential pipeline that reviews each file in alphabetical order",
        "A single-pass analysis that processes the entire codebase at once",
        "Dynamic adaptive decomposition: map the codebase, find high-impact areas, and adapt the plan as dependencies emerge",
        "A multi-pass architecture with per-file analysis and a cross-file integration pass"
      ],
      answer: "Dynamic adaptive decomposition: map the codebase, find high-impact areas, and adapt the plan as dependencies emerge",
      difficulty: "Medium",
      source: "Claude Certification Guide Q53",
      explanation: "Dynamic adaptive decomposition is ideal for open-ended exploration and discovery tasks where the sequence of subtasks must be determined at runtime based on what previous discovery steps uncover.",
      examTrick: "Unknown dependencies & legacy codebase discovery = Dynamic Adaptive Decomposition.",
      importance: "High",
      tags: ["Dynamic Decomposition", "Exploration", "Decomposition"]
    }
  ]
});

// -------------------------------------------------------------
// DOMAIN 2: Tool Design & Model Context Protocol (MCP)
// -------------------------------------------------------------
writeChapter("Claude-CCAF-MCP-Tool-Design", "chapter-01-mcp-architecture-and-resources.json", {
  subject: "Tool Design & Model Context Protocol (MCP)",
  chapter: "MCP Architecture, Resources & Client Integration",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Model Context Protocol specifications, MCP Client vs Server roles, Resources vs Tools, JSON-RPC 2.0 stdio transport, and configuration scoping.",
  questions: [
    {
      id: 1,
      question: "Under the Model Context Protocol (MCP) framework, what is the fundamental functional difference between a Resource and a Tool?",
      options: [
        "A Resource allows the model to perform read-only data inspection, while a Tool allows the model to execute actions and side effects",
        "A Resource can only be written in Python, while a Tool can only be written in TypeScript",
        "Tools are hosted on Anthropic's servers; Resources are hosted on the client machine",
        "There is no difference; they are synonymous terms in the specification"
      ],
      answer: "A Resource allows the model to perform read-only data inspection, while a Tool allows the model to execute actions and side effects",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q44",
      explanation: "In MCP, Resources represent read-only context attachments (schemas, file trees, documents) with no side effects, whereas Tools represent executable functions that can take actions, call APIs, and mutate state.",
      examTrick: "MCP Resource = Read-only context (safe). MCP Tool = Executable action / side effects (mutations).",
      importance: "High",
      tags: ["MCP Specification", "Resources vs Tools", "Core Architecture"]
    },
    {
      id: 2,
      question: "A data-analysis agent connects to an MCP server that exposes 40 database tables. Before almost every query, the agent makes several exploratory tool calls to discover which tables exist and what columns they hold. How can the author remove this discovery overhead?",
      options: [
        "Expose the table catalogue and column schemas as MCP resources for upfront visibility",
        "Add a describe_schema tool and instruct the agent to call it before every query",
        "Enlarge the agent's context window so it retains discovery calls across turns",
        "Reduce the server to the five most frequently queried tables"
      ],
      answer: "Expose the table catalogue and column schemas as MCP resources for upfront visibility",
      difficulty: "Medium",
      source: "Claude Certification Guide Q38",
      explanation: "MCP Resources expose content catalogues (like schemas and table lists) upfront directly into the client's context, eliminating repetitive exploratory tool call round-trips.",
      examTrick: "Schema catalogues & static metadata = Expose as MCP Resources to eliminate exploratory tool calls.",
      importance: "High",
      tags: ["MCP Resources", "Discovery Overhead", "Performance"]
    },
    {
      id: 3,
      question: "An MCP server communicates with an MCP client (such as Claude Desktop or Claude Code) over what standard transport protocol for local processes?",
      options: [
        "WebSockets over TLS",
        "Standard Input/Output (stdio) using JSON-RPC 2.0 messages",
        "gRPC over HTTP/2",
        "FTP raw data streams"
      ],
      answer: "Standard Input/Output (stdio) using JSON-RPC 2.0 messages",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q49",
      explanation: "The official MCP specification for local processes mandates JSON-RPC 2.0 protocol over standard input/output (stdio). For remote servers, Server-Sent Events (SSE) over HTTP is used.",
      examTrick: "MCP Transport: Local = stdio with JSON-RPC 2.0. Remote = SSE over HTTP.",
      importance: "High",
      tags: ["MCP Transport", "stdio", "JSON-RPC 2.0"]
    },
    {
      id: 4,
      question: "The data platform team needs to share Snowflake and PostgreSQL MCP configurations with all team members via git, while allowing developers to experiment with personal API servers locally. Where should each be placed?",
      options: [
        "Place all three servers in project-level .mcp.json",
        "Place the Snowflake and PostgreSQL servers in project-level .mcp.json, and personal API integration servers in user-level ~/.claude.json",
        "Place all three servers in ~/.claude.json and have each developer copy configuration manually",
        "Place the database servers in environment variables and reference in both"
      ],
      answer: "Place the Snowflake and PostgreSQL servers in project-level .mcp.json, and personal API integration servers in user-level ~/.claude.json",
      difficulty: "Medium",
      source: "Claude Certification Guide Q54",
      explanation: "Project-level .mcp.json is version-controlled and shared across all repository contributors. User-level ~/.claude.json is machine-specific, preventing personal experimental servers from polluting shared team configs.",
      examTrick: "Team/Project shared tools = .mcp.json in repo root. Personal/Machine-specific tools = ~/.claude.json in home dir.",
      importance: "High",
      tags: ["MCP Scoping", ".mcp.json", "~/.claude.json"]
    },
    {
      id: 5,
      question: "An enterprise team is evaluating integrating with PostgreSQL, Slack, and an internal proprietary approval workflow. A developer proposes writing three custom MCP servers. What is the correct approach?",
      options: [
        "Build all three custom MCP servers to ensure tight integration with coding standards",
        "Use community MCP servers for PostgreSQL and Slack, and build a custom server only for the internal approval workflow that has no community equivalent",
        "Skip MCP entirely and use direct Bash API calls for all three",
        "Use community MCP servers for all three, adapting the internal approval workflow to fit"
      ],
      answer: "Use community MCP servers for PostgreSQL and Slack, and build a custom server only for the internal approval workflow that has no community equivalent",
      difficulty: "Easy",
      source: "Claude Certification Guide Q27",
      explanation: "Anthropic best practice: Evaluate well-maintained community MCP servers first for standard third-party tools (Slack, Postgres, GitHub, Jira), reserving custom server development solely for bespoke internal enterprise workflows.",
      examTrick: "Build vs Buy: Always leverage community MCP servers for standard integrations; build custom MCP only for proprietary internal workflows.",
      importance: "Medium",
      tags: ["Community MCP", "Build vs Buy", "Best Practices"]
    }
  ]
});

writeChapter("Claude-CCAF-MCP-Tool-Design", "chapter-02-tool-interface-and-schema-design.json", {
  subject: "Tool Design & Model Context Protocol (MCP)",
  chapter: "Tool Interface Design, Schemas & Differentiating Descriptions",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Crafting unambiguous tool descriptions, dialect specifications, consolidating near-duplicates, and splitting conflicting schemas into discriminated tools.",
  questions: [
    {
      id: 1,
      question: "An MCP server exposes a query_database tool for Snowflake. Agents ignore it and run raw SQL via the Bash CLI tool, missing out on structured types and pagination. What is the most likely cause and fix?",
      options: [
        "The MCP server is disconnected. Restart the MCP server",
        "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash",
        "Disable the Bash tool entirely to force MCP tool usage",
        "Add a system prompt instruction telling the agent to always use query_database"
      ],
      answer: "Enhance the sparse description to spell out the tool's structured output and pagination advantages over Bash",
      difficulty: "Medium",
      source: "Claude Certification Guide Q01",
      explanation: "When an MCP tool has a sparse, vague description, agents default to familiar general-purpose tools like Bash. Enriching the description with explicit capabilities (structured columns, auto-pagination, dialect) makes the agent reliably prefer it.",
      examTrick: "If an agent ignores a specialised tool in favor of a general tool (Bash/Grep), the root cause is almost always a sparse/vague tool description.",
      importance: "High",
      tags: ["Tool Descriptions", "Tool Selection", "MCP Integration"]
    },
    {
      id: 2,
      question: "The data platform's query_snowflake tool description reads: 'Queries Snowflake data warehouse. Accepts SQL.' The agent correctly calls the tool but sends PostgreSQL syntax (string_agg instead of LISTAGG), which Snowflake rejects. What is the most effective fix?",
      options: [
        "Add a SQL syntax validation layer in front of the MCP tool that rejects non-Snowflake syntax",
        "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL",
        "Add a system prompt instruction listing all Snowflake-specific SQL functions",
        "Have the MCP server automatically translate PostgreSQL syntax to Snowflake syntax"
      ],
      answer: "State in the tool description that it expects the Snowflake SQL dialect, not PostgreSQL",
      difficulty: "Medium",
      source: "Claude Certification Guide Q17",
      explanation: "Models default to generic/PostgreSQL SQL unless told otherwise. Explicitly stating the target SQL dialect (Snowflake SQL, with examples like LISTAGG) in the tool description resolves dialect mismatches directly at the source.",
      examTrick: "SQL/CLI tools: Always specify the exact dialect / CLI flavor inside the tool's description field.",
      importance: "High",
      tags: ["Dialect Specification", "Tool Description", "SQL"]
    },
    {
      id: 3,
      question: "A data platform has built an MCP server with 22 tools: query_snowflake, query_postgres, query_api, plus 19 specialised transformation tools (pivot_table, calculate_percentile, etc.). Agents take 3-4 turns to select tools and frequently choose wrong ones. What is the most effective redesign?",
      options: [
        "Improve all 22 tool descriptions with detailed examples and boundary conditions",
        "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools",
        "Use tool_choice: 'any' to force the agent to always call a tool",
        "Split the tools across two separate MCP servers to reduce cognitive load"
      ],
      answer: "Consolidate the 19 transformation tools into a single transform_data tool with a transform_type parameter, reducing the total to 4 tools",
      difficulty: "Hard",
      source: "Claude Certification Guide Q09",
      explanation: "Having 22 tools overwhelms the model's tool selection capacity. Consolidating 19 near-duplicate transformation tools into a single parameterised transform_data tool reduces total tools to 4 (within the optimal 4-5 range).",
      examTrick: "Consolidate near-duplicate tools into a single parameterised tool to stay within the recommended 4-5 tool threshold.",
      importance: "High",
      tags: ["Tool Consolidation", "Cognitive Load", "4-5 Tools Limit"]
    },
    {
      id: 4,
      question: "An agent has a log_workout tool that accepts exercise_type (string), value (number), and measurement (string). In 23% of calls, the agent passes invalid combinations like measurement: 'reps' for running or measurement: 'miles' for bench press. What approach most effectively eliminates these errors?",
      options: [
        "Implement server-side validation returning descriptive errors for invalid combinations, allowing retries",
        "Add enum constraints on measurement limiting values to 'minutes', 'miles', 'reps', or 'sets'",
        "Add explicit examples to the tool description showing valid combinations",
        "Split into log_cardio_workout (with duration_minutes or distance_miles parameters) and log_strength_workout (with reps and sets parameters)"
      ],
      answer: "Split into log_cardio_workout (with duration_minutes or distance_miles parameters) and log_strength_workout (with reps and sets parameters)",
      difficulty: "Hard",
      source: "Exam Heist Q26 / Live Doubts Log",
      explanation: "Splitting into two distinct tools makes invalid parameter combinations structurally unrepresentable in the JSON Schema. log_cardio_workout doesn't have a reps field, and log_strength_workout doesn't have a miles field.",
      examTrick: "Structural Schema Separation: When categories have non-overlapping parameter sets, split into separate tools so invalid combinations are impossible to construct.",
      importance: "High",
      tags: ["Schema Design", "Discriminated Tools", "Type Safety"]
    },
    {
      id: 5,
      question: "Your search products tool queries a catalog API returning paginated results (50 items/page). Auto-fetching all matching pages causes 15-20 second delays for 200+ matches. How should you redesign pagination?",
      options: [
        "Create separate search_products and fetch_more_results tools for pagination",
        "Implement server-side relevance ranking and return only the top 50 most relevant items",
        "Add a max_pages parameter (default: 2) that controls how many pages are fetched internally",
        "Return the first page with total match count and cursor for additional pages"
      ],
      answer: "Return the first page with total match count and cursor for additional pages",
      difficulty: "Medium",
      source: "Exam Heist Q15 / Live Doubts Log",
      explanation: "Returning the first page immediately with total match count and a pagination cursor is fast, gives the caller honest metadata about the full result set size, and lets the model fetch subsequent pages on demand.",
      examTrick: "Pagination Golden Rule: Return first page fast + total count + pagination cursor. Never silently truncate or auto-fetch all.",
      importance: "High",
      tags: ["Pagination", "Tool Latency", "Cursor"]
    }
  ]
});

writeChapter("Claude-CCAF-MCP-Tool-Design", "chapter-03-structured-error-handling.json", {
  subject: "Tool Design & Model Context Protocol (MCP)",
  chapter: "Structured Error Handling & Error Categorization",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Protocol vs tool execution errors, 4 error categories (transient, validation, business, permission), isError boolean, and retryAfterMs metadata.",
  questions: [
    {
      id: 1,
      question: "A research agent calls an external API via an MCP server. After 30 queries in a batch of 50, the API returns HTTP 429 rate limit errors. The server currently returns generic 'Request failed'. What MCP server change would most improve resilience?",
      options: [
        "Implement automatic retry with exponential backoff inside the MCP server, hiding rate limits from the agent",
        "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait",
        "Return errorCategory: 'business', isRetryable: false to tell the agent to stop making requests",
        "Queue all 50 requests at the MCP server level and process them sequentially"
      ],
      answer: "Return errorCategory: 'transient', isRetryable: true, with a retryAfterMs field telling the agent how long to wait",
      difficulty: "Medium",
      source: "Claude Certification Guide Q04",
      explanation: "Rate limiting is a transient error. Returning structured error metadata with errorCategory: 'transient', isRetryable: true, and retryAfterMs enables the agent to pause intelligently and resume rather than abandoning the batch.",
      examTrick: "HTTP 429 / Rate Limit = errorCategory: 'transient', isRetryable: true + retryAfterMs.",
      importance: "High",
      tags: ["Rate Limits", "Structured Errors", "Transient Errors"]
    },
    {
      id: 2,
      question: "A search_papers MCP tool has three failure patterns: (1) upstream HTTP 503 during peak hours, (2) user requests papers from an unlicensed restricted journal, and (3) agent submits a malformed DOI string. Which errorCategory and isRetryable combination is correct?",
      options: [
        "All three should be errorCategory: 'transient', isRetryable: true",
        "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable",
        "HTTP 503: transient/retryable; restricted journal: transient/retryable; malformed DOI: transient/retryable",
        "HTTP 503: validation/retryable; restricted journal: business/not retryable; malformed DOI: business/not retryable"
      ],
      answer: "HTTP 503: transient/retryable; restricted journal: business/not retryable; malformed DOI: validation/retryable",
      difficulty: "Hard",
      source: "Claude Certification Guide Q14",
      explanation: "HTTP 503 = Transient (temporary outage, retry later). Restricted Journal = Business (licensing policy, retries will never work -> escalate). Malformed DOI = Validation (agent must fix format and retry).",
      examTrick: "The 4 MCP Error Categories: 1. Transient (503/429 - retryable), 2. Validation (bad schema/regex - repair input & retry), 3. Business (policy/license - non-retryable, escalate), 4. Permission (auth failed - non-retryable).",
      importance: "High",
      tags: ["Error Categories", "isRetryable", "MCP Standards"]
    },
    {
      id: 3,
      question: "Your MCP server implements check_availability for a calendar API. You encounter: (1) missing required user_email parameter, (2) calendar API returns 404 user not found, (3) calendar API returns 503 service unavailable. How should each be reported in MCP?",
      options: [
        "Report all three as tool results with isError: true",
        "Report errors 1 and 2 as JSON-RPC protocol errors, report error 3 as tool result with isError: true",
        "Report error 1 as a JSON-RPC protocol error, report errors 2 and 3 as tool results with isError: true",
        "Report all three as JSON-RPC protocol errors"
      ],
      answer: "Report error 1 as a JSON-RPC protocol error, report errors 2 and 3 as tool results with isError: true",
      difficulty: "Hard",
      source: "Exam Heist Q17",
      explanation: "Malformed JSON-RPC requests (missing required params at protocol level) are JSON-RPC Protocol Errors. Valid tool calls that execute but fail upstream (404 user not found, 503 outage) are Tool Results with isError: true.",
      examTrick: "Protocol Error = Malformed RPC message / unknown method. Tool Result with isError: true = Downstream business / execution / API failures.",
      importance: "High",
      tags: ["Protocol Errors", "Tool Result isError", "JSON-RPC"]
    },
    {
      id: 4,
      question: "The data platform's fetch_api tool calls a pricing API. When the API key has expired, the tool returns { 'data': [], 'status': 'ok' }. The agent tells the user 'No pricing data is available for that product'. What is the root cause?",
      options: [
        "The agent should be instructed via prompt to treat empty arrays as errors",
        "The tool cannot distinguish an access failure (expired key) from a valid empty result, so the agent treats a permission error as no data",
        "The third-party API is poorly designed and should be replaced",
        "The context window was too small to hold the API response"
      ],
      answer: "The tool cannot distinguish an access failure (expired key) from a valid empty result, so the agent treats a permission error as no data",
      difficulty: "Medium",
      source: "Claude Certification Guide Q56",
      explanation: "Masking an access/auth failure as a successful empty array { data: [], status: 'ok' } prevents the agent from realizing an authentication error occurred. Tools must return isError: true with specific errorCategory for access failures.",
      examTrick: "Access Failure vs Empty Result: Never return empty data [] for permission/network errors. Use isError: true with permission/transient errorCategory.",
      importance: "High",
      tags: ["Access Failure vs Empty Result", "isError", "Error Masking"]
    }
  ]
});

writeChapter("Claude-CCAF-MCP-Tool-Design", "chapter-04-atomic-operations-and-tamper-proofing.json", {
  subject: "Tool Design & Model Context Protocol (MCP)",
  chapter: "Atomic Operations, Confirmation Tokens & Tamper-Proofing",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Eliminating TOCTOU race conditions, preview confirmation tokens for destructive actions, and tool-internal server-side enforcement over loose hooks.",
  questions: [
    {
      id: 1,
      question: "Your remove_team_member tool uses a dry_run: boolean parameter. In 15% of calls, the agent bypasses the preview by calling dry_run=false directly. How can you guarantee every removal is preceded by an explicitly confirmed preview?",
      options: [
        "Add server-side validation that permits dry_run=false only if dry_run=true was called within the last 60s",
        "Replace with two tools: preview_remove_member returns impact details and a single-use confirmation token; execute_remove_member requires that token",
        "Annotate the tool as requiring confirmation in the orchestration layer",
        "Add detailed prompt instructions and few-shot examples requiring dry_run=true first"
      ],
      answer: "Replace with two tools: preview_remove_member returns impact details and a single-use confirmation token; execute_remove_member requires that token",
      difficulty: "Hard",
      source: "Exam Heist Q21 / Live Doubts Log",
      explanation: "Requiring a cryptographic/single-use confirmation token generated by preview_remove_member and consumed by execute_remove_member structurally binds execution to the specific previewed action, eliminating bypasses regardless of model behavior.",
      examTrick: "Confirmation Token Pattern: Preview returns single-use token -> Execute requires token. Prevents bypasses and timing races.",
      importance: "High",
      tags: ["Confirmation Token", "Destructive Actions", "Tamper-Proofing"]
    },
    {
      id: 2,
      question: "An expense reimbursement agent handles requests using process_reimbursement. Policy requires reimbursements >$500 must be manager-approved. What design ensures the $500 approval threshold is tamper-proof regardless of how the agent is prompted?",
      options: [
        "The tool accepts approved_by_manager boolean and system prompt tells agent to set it after verifying manager approval",
        "Provide auto_reimburse (limit $500) and manager_approval tools with prompt guidance",
        "The process_reimbursement tool accepts amount and internally enforces the threshold: <=$500 auto-disburses, >$500 creates pending approval request",
        "Implement the threshold check in a PreToolUse hook that adds a requires_approval flag"
      ],
      answer: "The process_reimbursement tool accepts amount and internally enforces the threshold: <=$500 auto-disburses, >$500 creates pending approval request",
      difficulty: "Hard",
      source: "Exam Heist Q22 / Live Doubts Log",
      explanation: "Enforcing business thresholds directly inside the tool's backend implementation makes the rule inseparable from the tool execution itself. It cannot be bypassed by prompt injection, misconfigured flags, or bypassed hooks.",
      examTrick: "Hierarchy of Enforcement: Tool-internal backend logic (strongest) > Coordinating hook > Prompt instructions (weakest).",
      importance: "High",
      tags: ["Tool-Internal Enforcement", "Security Thresholds", "Tamper-Proofing"]
    },
    {
      id: 3,
      question: "A scheduling agent calls get_available_slots then book_appointment. In 15% of attempts, booking fails because another user booked the slot between the availability check and the booking call. How should you redesign these tools?",
      options: [
        "Modify book_appointment to return alternative slots when unavailable so the agent can retry",
        "Add retry logic to the agent's system prompt to call get_available_slots again",
        "Add a hold_slot tool that creates a 60-second temporary reservation between checking and booking",
        "Combine both tools into a single find_and_book_appointment that atomically checks availability and books"
      ],
      answer: "Combine both tools into a single find_and_book_appointment that atomically checks availability and books",
      difficulty: "Hard",
      source: "Exam Heist Q25 / Live Doubts Log",
      explanation: "This is a classic Time-of-Check to Time-of-Use (TOCTOU) race condition. Combining check and book into a single atomic backend operation eliminates the vulnerable time window between separate tool calls entirely.",
      examTrick: "Eliminating TOCTOU race conditions: Collapse check-then-act sequences into a single atomic backend tool operation.",
      importance: "High",
      tags: ["TOCTOU", "Atomic Tools", "Race Conditions"]
    }
  ]
});

// -------------------------------------------------------------
// DOMAIN 3: Claude Code Configuration & Workflows
// -------------------------------------------------------------
writeChapter("Claude-CCAF-Claude-Code-Workflows", "chapter-01-claude-hierarchy-and-memory.json", {
  subject: "Claude Code Configuration & Workflows",
  chapter: "CLAUDE.md Hierarchy, Rules Files & Scoping",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "User vs Project CLAUDE.md, path-scoped rules (.claude/rules/*.md with glob patterns), the /memory diagnostic command, and conflict resolution.",
  questions: [
    {
      id: 1,
      question: "A developer's Claude Code session applies the team's API conventions in some sessions but not others. What is the fastest deterministic way to confirm which CLAUDE.md and rules files the current session has actually loaded?",
      options: [
        "Run /memory in the session to list all loaded memory files",
        "Run /compact to reload configuration hierarchy from disk",
        "Delete ~/.claude/CLAUDE.md so only project configuration loads",
        "Ask Claude in the session to repeat the team's API conventions"
      ],
      answer: "Run /memory in the session to list all loaded memory files",
      difficulty: "Easy",
      source: "Claude Certification Guide Q21",
      explanation: "/memory is the official diagnostic command in Claude Code: it displays the complete list of user-level (~/.claude/CLAUDE.md), project-level (.claude/CLAUDE.md), and directory-level memory files loaded in the active session.",
      examTrick: "Diagnostic command for loaded CLAUDE.md / rules files = /memory.",
      importance: "High",
      tags: ["/memory", "CLAUDE.md", "Diagnostics"]
    },
    {
      id: 2,
      question: "A docs team maintains three content types in docs/api/, docs/architecture/, and docs/runbooks/, each with distinct standards. They want Claude Code to apply standards automatically when editing matching files without loading all three rule sets in every session. What is the correct configuration?",
      options: [
        "Place all three sets of rules in the root CLAUDE.md with section headings",
        "Create three rule files in .claude/rules/ with YAML frontmatter paths targeting each directory: paths: ['docs/api/**'] for API rules, etc.",
        "Place a separate CLAUDE.md file in each directory",
        "Create three custom skills and require writers to invoke them manually"
      ],
      answer: "Create three rule files in .claude/rules/ with YAML frontmatter paths targeting each directory: paths: ['docs/api/**'] for API rules, etc.",
      difficulty: "Medium",
      source: "Claude Certification Guide Q41",
      explanation: "Files in .claude/rules/ with frontmatter glob patterns (e.g. paths: ['docs/api/**']) load automatically and exclusively when editing matching paths, saving context tokens and preventing rule cross-contamination.",
      examTrick: "Path-Specific Rules: Create `.claude/rules/<name>.md` with `paths: ['glob/**']` frontmatter.",
      importance: "High",
      tags: [".claude/rules/", "Path-Specific Rules", "Context Optimization"]
    },
    {
      id: 3,
      question: "Project-level .claude/CLAUDE.md specifies 4-space indentation. A senior developer has 2-space indentation in ~/.claude/CLAUDE.md, causing conflicts. The team needs a hard guarantee that 4-space indentation is applied on every file save. What should they do?",
      options: [
        "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, enforcing 4-space indentation regardless of model output",
        "Leave the rule in project CLAUDE.md as project rules always strictly override user rules",
        "Ask the architect to delete ~/.claude/CLAUDE.md",
        "Move the 4-space rule into CLAUDE.local.md at project root"
      ],
      answer: "Add a PostToolUse hook that runs the team's formatter after every Write/Edit, enforcing 4-space indentation regardless of model output",
      difficulty: "Hard",
      source: "Claude Certification Guide Q50",
      explanation: "CLAUDE.md files are concatenated into context as guidance with no strict compliance guarantee; contradictory rules can be picked arbitrarily. A PostToolUse hook executing a formatter command provides a deterministic hard guarantee.",
      examTrick: "CLAUDE.md = Guidance / probabilistic. Hooks = Deterministic execution / hard guarantee.",
      importance: "High",
      tags: ["CLAUDE.md Precedence", "Hooks Guarantee", "Formatting"]
    },
    {
      id: 4,
      question: "A developer has personal code formatting preferences that differ from some project repos they contribute to. Where should these personal preferences be configured so they apply across all projects by default without affecting other team members?",
      options: [
        "In the project-level .claude/CLAUDE.md of each repository",
        "In ~/.claude/CLAUDE.md, so they apply across all of the developer's projects",
        "In a .claude/rules/ file without YAML frontmatter in each repo",
        "In a ~/.claude/skills/ file invoked manually"
      ],
      answer: "In ~/.claude/CLAUDE.md, so they apply across all of the developer's projects",
      difficulty: "Easy",
      source: "Claude Certification Guide Q59",
      explanation: "User-level ~/.claude/CLAUDE.md is personal to that developer's machine and is not version-controlled in project repositories, making it the correct location for individual developer preferences.",
      examTrick: "User-level ~/.claude/CLAUDE.md = Personal developer defaults. Project .claude/CLAUDE.md = Team standards committed to git.",
      importance: "Medium",
      tags: ["User CLAUDE.md", "Personal Preferences", "Scoping"]
    }
  ]
});

writeChapter("Claude-CCAF-Claude-Code-Workflows", "chapter-02-custom-skills-and-slash-commands.json", {
  subject: "Claude Code Configuration & Workflows",
  chapter: "Custom Skills, Slash Commands & Git Worktrees",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Skill definition (SKILL.md), context: fork frontmatter for output isolation, allowed-tools restriction, and multi-session parallelism with git worktrees.",
  questions: [
    {
      id: 1,
      question: "A documentation team creates a /generate-api-docs skill that generates verbose output (200+ lines per endpoint). The skill should be version-controlled for the whole team and must not flood the main conversation context. How should it be configured?",
      options: [
        "Create SKILL.md in ~/.claude/skills/ with context: fork frontmatter",
        "Create SKILL.md in .claude/skills/ with context: fork in frontmatter",
        "Add documentation generation instructions to root CLAUDE.md",
        "Create SKILL.md in .claude/skills/ without any frontmatter"
      ],
      answer: "Create SKILL.md in .claude/skills/ with context: fork in frontmatter",
      difficulty: "Medium",
      source: "Claude Certification Guide Q10",
      explanation: ".claude/skills/ is project-scoped and version-controlled via git for the team. The context: fork frontmatter isolates the verbose 200+ line execution into a sub-context, preventing it from consuming main conversation tokens.",
      examTrick: "Heavy/verbose output skills: Always specify `context: fork` in SKILL.md frontmatter to prevent main context exhaustion.",
      importance: "High",
      tags: ["Skills", "context: fork", ".claude/skills/"]
    },
    {
      id: 2,
      question: "A documentation team needs to simultaneously update API reference docs for three independent microservices. A single Claude Code session would exhaust the context window holding all three codebases. What is the recommended workflow?",
      options: [
        "Process the three services sequentially in the same session, running /compact between them",
        "Use git worktree for three branches, each with its own Claude Code session on one service, then merge results",
        "Create a single skill with context: fork that processes all three services in parallel",
        "Split the documentation files and process each in the batch API"
      ],
      answer: "Use git worktree for three branches, each with its own Claude Code session on one service, then merge results",
      difficulty: "Hard",
      source: "Claude Certification Guide Q08",
      explanation: "Using git worktree creates separate working directories on distinct git branches, allowing parallel Claude Code sessions each with 100% dedicated context budget and zero cross-contamination.",
      examTrick: "Parallel multi-module refactoring in Claude Code = git worktrees with independent sessions.",
      importance: "High",
      tags: ["git worktree", "Parallel Sessions", "Context Isolation"]
    },
    {
      id: 3,
      question: "A team creates a /security-audit skill that scans the codebase for vulnerabilities. It must be version-controlled, restricted from modifying files, and produce extensive analysis without bloating main context. Which configuration is correct?",
      options: [
        "Place in ~/.claude/skills/ with allowed-tools: ['Read', 'Grep', 'Glob'] and context: fork",
        "Place in .claude/commands/ with allowed-tools: ['Read', 'Grep', 'Glob']",
        "Place in CLAUDE.md as an always-loaded security scanning procedure",
        "Place in .claude/skills/ with a SKILL.md containing allowed-tools: ['Read', 'Grep', 'Glob'] and context: fork in the frontmatter"
      ],
      answer: "Place in .claude/skills/ with a SKILL.md containing allowed-tools: ['Read', 'Grep', 'Glob'] and context: fork in the frontmatter",
      difficulty: "Medium",
      source: "Claude CCAF Mock 2 Q14",
      explanation: ".claude/skills/ ensures team sharing in git. allowed-tools: ['Read', 'Grep', 'Glob'] restricts tool execution to read-only search tools (no Write/Edit), and context: fork isolates verbose scan logs.",
      examTrick: "Read-only Skill Recipe: .claude/skills/SKILL.md + allowed-tools: ['Read', 'Grep', 'Glob'] + context: fork.",
      importance: "High",
      tags: ["Skill Permissions", "allowed-tools", "Read-Only Skills"]
    }
  ]
});

writeChapter("Claude-CCAF-Claude-Code-Workflows", "chapter-03-hooks-and-ci-cd-integration.json", {
  subject: "Claude Code Configuration & Workflows",
  chapter: "Lifecycle Hooks, Compaction & CI/CD Pipelines",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "PreCompact, PreToolUse, PostToolUse hook lifecycles, headless non-interactive mode (-p flag), --output-format json, and session isolation in pipelines.",
  questions: [
    {
      id: 1,
      question: "A team wants to archive the full conversation transcript to a timestamped log file every time Claude Code runs /compact or auto-compaction. Which hook configuration achieves this?",
      options: [
        "A PostToolUse hook on Write that snapshots the transcript whenever a file is written",
        "A PreCompact hook that writes the current transcript to a timestamped log file before /compact summarises the conversation",
        "A PreToolUse hook configured on a built-in 'Compact' tool",
        "A PostToolUse hook on all tools that appends each tool result to a log"
      ],
      answer: "A PreCompact hook that writes the current transcript to a timestamped log file before /compact summarises the conversation",
      difficulty: "Medium",
      source: "Claude Certification Guide Q36",
      explanation: "PreCompact is a dedicated first-class lifecycle hook event in Claude Code that executes immediately before auto-compaction or /compact runs, receiving the pre-compaction transcript path.",
      examTrick: "Transcripts archive before lossy compaction = PreCompact hook.",
      importance: "High",
      tags: ["PreCompact", "Hooks", "Lifecycle"]
    },
    {
      id: 2,
      question: "A CI/CD pipeline runs three Claude Code steps: (1) generate changelog from git commits, (2) review changelog for accuracy, (3) check for breaking changes. Steps 2 and 3 consistently fail to flag omissions. What is the root cause?",
      options: [
        "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog independently",
        "The CLAUDE.md file does not contain changelog formatting standards",
        "The -p flag is missing, causing interactive hangs",
        "The steps need to use --output-format json"
      ],
      answer: "The three steps share session context, so steps 2 and 3 inherit step 1's reasoning instead of judging the changelog independently",
      difficulty: "Hard",
      source: "Claude Certification Guide Q30",
      explanation: "When review steps share session context with the generator step, they inherit confirmation bias and prior reasoning. CI review steps must run as fresh, independent non-interactive invocations with isolated session context.",
      examTrick: "CI/CD Review pipelines: Always enforce Session Context Isolation between generation and review steps.",
      importance: "High",
      tags: ["CI/CD", "Session Isolation", "Review Bias"]
    },
    {
      id: 3,
      question: "A team wants their CI pipeline to run Claude Code for PR review (outputting structured JSON for a dashboard) and automated unit test generation (producing source files). How should the pipeline invocations be configured?",
      options: [
        "Run both steps with -p and parse plain text",
        "Run the review step with -p --output-format json and the test generation step with -p only, as separate non-interactive invocations",
        "Run both steps in a single shared session with -p",
        "Run both steps with --output-format json and have test generation extract code from JSON"
      ],
      answer: "Run the review step with -p --output-format json and the test generation step with -p only, as separate non-interactive invocations",
      difficulty: "Medium",
      source: "Claude Certification Guide Q42",
      explanation: "-p runs Claude Code headlessly in non-interactive mode for CI/CD. --output-format json produces parseable structured output for the review dashboard, while the test generation step writes code directly.",
      examTrick: "Headless CI flags: `claude -p 'prompt'` for non-interactive execution; add `--output-format json` for machine-parseable data.",
      importance: "High",
      tags: ["Headless CLI", "-p flag", "--output-format json"]
    }
  ]
});

// -------------------------------------------------------------
// DOMAIN 4: Prompt Engineering & Structured Output
// -------------------------------------------------------------
writeChapter("Claude-CCAF-Prompt-Engineering", "chapter-01-system-prompts-and-criteria.json", {
  subject: "Prompt Engineering & Structured Output",
  chapter: "System Prompts, Explicit Criteria & XML Tagging",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "Explicit criteria vs hedge words, XML tag semantic boundaries, anchoring against hallucinations, and severity level calibration.",
  questions: [
    {
      id: 1,
      question: "The moderation prompt instructs Claude to 'be conservative when moderating and err on the side of caution.' Reviewers find cooking recipes with knives and news articles about violence are flagged as violations. What is the root cause and fix?",
      options: [
        "The model is too sensitive — lower the temperature",
        "Replace 'be conservative' with explicit categorical criteria defining each violation category with concrete examples",
        "Add an allowlist of safe topics (cooking, news, fiction)",
        "Add a second moderation pass using the same 'be conservative' guidance"
      ],
      answer: "Replace 'be conservative' with explicit categorical criteria defining each violation category with concrete examples",
      difficulty: "Medium",
      source: "Claude Certification Guide Q55",
      explanation: "Vague directives like 'be conservative' or 'err on caution' create severe over-flagging because the model has no concrete boundary definitions. Explicit categorical criteria with positive and negative examples calibrate decisions accurately.",
      examTrick: "Eliminate hedge phrases ('be conservative', 'act carefully'). Replace with explicit criteria + edge-case examples.",
      importance: "High",
      tags: ["Explicit Criteria", "Hedge Phrases", "System Prompts"]
    },
    {
      id: 2,
      question: "What is the structural role of XML tags (e.g., <instructions>, <context>, <examples>, <user_data>) when engineering prompts for Anthropic Claude models?",
      options: [
        "They convert the prompt text directly into executable HTML web pages",
        "They serve as clear, semantic boundary markers that help Claude separate instructions from data inputs, reducing prompt injection and confusion",
        "They reduce the token count of the prompt by 50%",
        "They override the model's base safety alignment parameters"
      ],
      answer: "They serve as clear, semantic boundary markers that help Claude separate instructions from data inputs, reducing prompt injection and confusion",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q30",
      explanation: "Anthropic models are pre-trained extensively on XML-structured prompts. XML tags provide unambiguous semantic boundaries between system directives, reference documents, few-shot examples, and untrusted user data.",
      examTrick: "Anthropic Prompt Standard: Always wrap distinct input sections in semantic XML tags (<instructions>, <context>, <data>).",
      importance: "High",
      tags: ["XML Tags", "Semantic Boundaries", "Prompt Injection Defense"]
    },
    {
      id: 3,
      question: "A moderation team introduces a severity scale ('low', 'medium', 'high', 'critical'). The prompt defines 'high means clearly harmful' and 'low means mildly inappropriate'. The same review post is classified high on some runs and low on others. What should they change?",
      options: [
        "Set temperature to 0 to eliminate variance across runs",
        "Replace the prose severity descriptions with a concrete example per level as a calibration anchor",
        "Remove the severity scale and use binary classification",
        "Run classification three times and take majority vote"
      ],
      answer: "Replace the prose severity descriptions with a concrete example per level as a calibration anchor",
      difficulty: "Medium",
      source: "Claude Certification Guide Q48",
      explanation: "Subjective prose descriptions like 'clearly harmful' are ambiguous across runs. Providing a canonical calibration anchor example for each severity level establishes concrete reference benchmarks for consistent scoring.",
      examTrick: "Calibrating ordinal scales (Low/Med/High): Provide at least 1 concrete calibration example per rating level.",
      importance: "High",
      tags: ["Severity Calibration", "Few-Shot Anchors", "Consistency"]
    }
  ]
});

writeChapter("Claude-CCAF-Prompt-Engineering", "chapter-02-structured-output-and-tool-use.json", {
  subject: "Prompt Engineering & Structured Output",
  chapter: "Structured Output via Tool Use, Enums & Nullable Schemas",
  exam: "Claude CCAF",
  paper: "Domain-4",
  description: "tool_choice forcing, enum schema constraints, nullable fields to avoid hallucinations/fabrication, and Message Batches API economics.",
  questions: [
    {
      id: 1,
      question: "The moderation system's classification schema has a 'category' field defined as a free-text string. Auditors find 47 different category spellings ('hate speech', 'Hate-Speech', 'hateful content', 'hate_speech') in production. What is the best schema fix?",
      options: [
        "Add a post-processing normalisation step mapping all variations to canonical names",
        "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', 'harassment', plus an 'other' option",
        "Add detailed prompt instructions listing exact capitalisation",
        "Add few-shot examples showing correct category formatting"
      ],
      answer: "Change 'category' from free-text to an enum with values like 'hate_speech', 'spam', 'harassment', plus an 'other' option",
      difficulty: "Easy",
      source: "Claude Certification Guide Q03",
      explanation: "Enum fields in JSON Schema constrain outputs deterministically to predefined strings, completely eliminating spelling, capitalisation, and format variations at the API generation level.",
      examTrick: "Categorical output consistency: Use `enum: [...]` in JSON Schema for deterministic compliance; never rely on free-text strings.",
      importance: "High",
      tags: ["Enum Schema", "Structured Output", "Deterministic Constraints"]
    },
    {
      id: 2,
      question: "A classification schema marks 'sub_category' and 'target_demographic' as required. Auditors discover that when a post is spam (which has no target demographic), Claude fabricates plausible values like 'general public' or 'young adults'. What schema change prevents fabrication?",
      options: [
        "Add a validation step that rejects target_demographic for spam",
        "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value",
        "Remove 'target_demographic' from the schema entirely",
        "Add a prompt instruction to leave 'target_demographic' empty on spam"
      ],
      answer: "Make 'target_demographic' nullable so the model can return null when the field does not apply instead of fabricating a value",
      difficulty: "Medium",
      source: "Claude Certification Guide Q15",
      explanation: "When a field is strictly required, the model is forced to produce a non-null value even when irrelevant, incentivising fabrication. Making the field nullable gives the model a valid, schema-compliant way to return null.",
      examTrick: "Preventing schema-induced hallucinations: Make conditionally applicable fields nullable (`type: ['string', 'null']`).",
      importance: "High",
      tags: ["Nullable Fields", "Hallucination Prevention", "JSON Schema"]
    },
    {
      id: 3,
      question: "A contract extraction pipeline uses tool_use with tool_choice: 'auto'. Occasionally, the model returns conversational text analysis instead of calling the extraction tool. You need guaranteed structured JSON extraction on every single request. What is the correct approach?",
      options: [
        "Switch to prompt-based JSON formatting instructions",
        "Switch tool_choice from 'auto' to 'any'",
        "Keep tool_use and set tool_choice to { type: 'tool', name: 'extract_contract' } to force the specific tool by name",
        "Add stronger system prompt instructions demanding tool use"
      ],
      answer: "Keep tool_use and set tool_choice to { type: 'tool', name: 'extract_contract' } to force the specific tool by name",
      difficulty: "Medium",
      source: "Claude Certification Guide Q23 / Exam Heist Q37",
      explanation: "Setting tool_choice to { type: 'tool', name: 'extract_contract' } forces the model to call that exact tool exclusively on every request, eliminating conversational text and wrong-tool selection.",
      examTrick: "Guaranteed structured extraction: `tool_choice: { type: 'tool', name: '<tool_name>' }`.",
      importance: "High",
      tags: ["tool_choice", "Forced Tool Call", "Structured Extraction"]
    },
    {
      id: 4,
      question: "Your manager proposes switching both your blocking pre-merge PR code review (developers waiting) and your overnight technical debt report to the Message Batches API for 50% cost savings. How should you evaluate this proposal?",
      options: [
        "Switch both to batch processing with status polling",
        "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks",
        "Keep real-time calls for both to avoid batch result ordering issues",
        "Switch both to batch with a timeout fallback to real-time"
      ],
      answer: "Use batch processing for the technical debt reports only; keep real-time calls for pre-merge checks",
      difficulty: "Medium",
      source: "Claude Certification Guide Q05",
      explanation: "The Message Batches API offers a 50% discount but has a 24-hour turnaround SLA with no guaranteed low-latency response time. It is perfect for overnight latency-tolerant jobs, but unsuitable for blocking real-time PR checks.",
      examTrick: "Message Batches API: 50% cost discount, 24h SLA. Use for asynchronous/offline jobs; never for blocking interactive paths.",
      importance: "High",
      tags: ["Message Batches API", "50% Discount", "Latency SLA"]
    }
  ]
});

// -------------------------------------------------------------
// DOMAIN 5: Context Management & Reliability
// -------------------------------------------------------------
writeChapter("Claude-CCAF-Context-Reliability", "chapter-01-context-dynamics-and-attention.json", {
  subject: "Context Management & Reliability",
  chapter: "Context Dynamics, Lost-in-the-Middle & Result Trimming",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Attention distribution in long contexts, lost-in-the-middle phenomenon, tool result trimming, and instruction drift refreshment.",
  questions: [
    {
      id: 1,
      question: "An analytics agent queries Snowflake and receives 40+ columns per row, only 5 of which are relevant to the user's question about revenue. After three queries the context window fills and follow-up questions fail. What is the most effective fix?",
      options: [
        "Upgrade to a model with a larger context window",
        "Trim tool results to only the relevant columns before appending them to the conversation context",
        "Store query results in an external database and retrieve values on demand",
        "Limit the number of rows returned by each query"
      ],
      answer: "Trim tool results to only the relevant columns before appending them to the conversation context",
      difficulty: "Medium",
      source: "Claude Certification Guide Q25",
      explanation: "Tool result trimming removes irrelevant columns and verbose fields before results enter the conversation context, dramatically reducing token consumption while preserving all relevant data rows.",
      examTrick: "Tool Result Trimming: Filter raw API/DB outputs at the tool wrapper level to only necessary fields before appending to context.",
      importance: "High",
      tags: ["Tool Result Trimming", "Context Optimization", "Token Bloat"]
    },
    {
      id: 2,
      question: "Claude Code synthesises release notes from 200+ commits. Early commit summaries become vague ('various bug fixes') while recent commits remain detailed and accurate, even though the context window is not full. What is the cause?",
      options: [
        "Temperature is set too high",
        "The lost-in-the-middle effect: the model favours the start and end of long context, with reduced attention to middle content",
        "Early commits were written with less detail",
        "Claude Code applied progressive summarisation to older commits"
      ],
      answer: "The lost-in-the-middle effect: the model favours the start and end of long context, with reduced attention to middle content",
      difficulty: "Medium",
      source: "Claude Certification Guide Q11",
      explanation: "The lost-in-the-middle effect is an inherent transformer attention characteristic where models attend strongly to the beginning (primacy) and end (recency) of long prompts, but have degraded recall for middle content.",
      examTrick: "Lost-in-the-Middle: Critical instructions and crucial data should be positioned at the start or end of context, not buried in the middle.",
      importance: "High",
      tags: ["Lost-in-the-Middle", "Attention Dynamics", "Context Recall"]
    },
    {
      id: 3,
      question: "A home renovation assistant follows system prompt guidelines for turns 1-4, but by turn 7 gives generic advice without asking about budget or timeline. Total tokens is only 2,500. What is the cause and recommended fix?",
      options: [
        "System prompt expired; send system prompt again on each turn",
        "Context window overflowed; upgrade to larger context window",
        "The accumulated conversation responses dilute the system prompt's relative influence; insert user-role reminders at natural breakpoints to refresh salience",
        "Temperature drift; set temperature to 0"
      ],
      answer: "The accumulated conversation responses dilute the system prompt's relative influence; insert user-role reminders at natural breakpoints to refresh salience",
      difficulty: "Hard",
      source: "Exam Heist Q49 & Q52 / Live Doubts Log",
      explanation: "Instruction drift occurs because the growing volume of the assistant's own conversation history competes with and dilutes the system prompt's attention weight. Periodically re-injecting concise guidelines at natural turn breakpoints restores alignment.",
      examTrick: "Instruction Drift in multi-turn chat: Refresh guidelines with short user-role reminders at natural turn breakpoints.",
      importance: "High",
      tags: ["Instruction Drift", "Salience Refresh", "Multi-Turn Drift"]
    }
  ]
});

writeChapter("Claude-CCAF-Context-Reliability", "chapter-02-provenance-and-synthesis.json", {
  subject: "Context Management & Reliability",
  chapter: "Information Provenance, Synthesis & Structured Metadata",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Attribution preservation through structured claim-source mappings, scratchpads on disk for 500k-line codebases, and stratified human review.",
  questions: [
    {
      id: 1,
      question: "A multi-agent research system synthesises findings from financial filings, news, and technical white papers. Subagents have citations, but the final synthesised report loses all source attribution. Which fix addresses the root cause?",
      options: [
        "Append a bibliography listing all sources at the end of the report",
        "Have subagents include source URLs as inline hyperlinks in prose",
        "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them",
        "Store all outputs in a database and reference entries by ID"
      ],
      answer: "Require subagents to output structured claim-source mappings and instruct the synthesis agent to preserve and merge them",
      difficulty: "Hard",
      source: "Claude Certification Guide Q16 / Exam Heist Q11",
      explanation: "Prose hyperlinks and bibliographies get rewritten and lost during summarisation. Structured claim-source mappings (JSON objects binding specific claims to source IDs/URLs) survive synthesis because they are structured data.",
      examTrick: "Preserving citations across synthesis: Use structured claim-source mappings (JSON data structures), never inline prose links.",
      importance: "High",
      tags: ["Structured Provenance", "Claim-Source Mapping", "Attribution"]
    },
    {
      id: 2,
      question: "A docs team asks Claude Code to audit coverage across a 500,000-line codebase. After reading 30 files, context approaches the limit and auto-compaction will discard earlier tool results that are still needed. What is the best strategy?",
      options: [
        "Increase context window size to hold all files simultaneously",
        "Have the agent write structured findings to a scratchpad file on disk after each file, then read the scratchpad for the final audit",
        "Process all files in a single Read call with a glob pattern",
        "Run /compact after every 10 files without saving"
      ],
      answer: "Have the agent write structured findings to a scratchpad file on disk after each file, then read the scratchpad for the final audit",
      difficulty: "Medium",
      source: "Claude Certification Guide Q43",
      explanation: "Writing distilled findings incrementally to a scratchpad file on disk decouples knowledge accumulation from context window limits. The scratchpad persists across /compact and can be read back cleanly.",
      examTrick: "Auditing massive codebases (500k+ lines): Use a scratchpad file on disk to accumulate structured notes incrementally.",
      importance: "High",
      tags: ["Scratchpad File", "Large Codebase Exploration", "Context Limits"]
    },
    {
      id: 3,
      question: "Claude Code generates API docs for 150 endpoints: 30 payment processing (high regulatory risk), 40 public queries (moderate risk), 80 internal tools (low risk). The team cannot review all 150. How should they structure human review?",
      options: [
        "Randomly sample 15% across all endpoints equally",
        "Use stratified sampling: review 100% of payment docs, 10% of public query docs, and 5% of internal tooling docs",
        "Review only payment docs and skip review for the remaining 120 endpoints",
        "Have Claude self-assess confidence and review only items below 80%"
      ],
      answer: "Use stratified sampling: review 100% of payment docs, 10% of public query docs, and 5% of internal tooling docs",
      difficulty: "Medium",
      source: "Claude Certification Guide Q39",
      explanation: "Stratified sampling allocates human review capacity proportional to risk/blast radius. 100% of high-risk payment endpoints receive audit, while low-risk internal tooling is sampled lightly.",
      examTrick: "Human-in-the-Loop Review: Allocate review capacity using Stratified Sampling based on risk/blast-radius.",
      importance: "High",
      tags: ["Stratified Sampling", "Human Review", "Risk Management"]
    }
  ]
});

// -------------------------------------------------------------
// DOMAIN 6: Enterprise Security, Cost & High Availability
// -------------------------------------------------------------
writeChapter("Claude-CCAF-Enterprise-Security", "chapter-01-prompt-caching-and-batch-api.json", {
  subject: "Enterprise Security, Cost & High Availability",
  chapter: "Prompt Caching Mechanics, Cost & High Availability",
  exam: "Claude CCAF",
  paper: "Domain-6",
  description: "Prompt Caching 1,024 token threshold, prefix matching rules, dynamic variable placement, and cross-region high availability.",
  questions: [
    {
      id: 1,
      question: "What is the structural requirement for an exact cache hit when using Anthropic's Prompt Caching mechanism?",
      options: [
        "The system prompt must change completely on every single turn",
        "The prompt prefix (from the beginning of the prompt up to the cache breakpoint marker) must be structurally and textually 100% identical to a previously cached sequence",
        "The user must connect from the exact same IP address",
        "The max_tokens parameter must be an odd number"
      ],
      answer: "The prompt prefix (from the beginning of the prompt up to the cache breakpoint marker) must be structurally and textually 100% identical to a previously cached sequence",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q53",
      explanation: "Anthropic Prompt Caching relies on exact prefix matching. Any difference in characters, whitespace, or order before the cache breakpoint invalidates the cache.",
      examTrick: "Prompt Caching rule: Exact binary prefix match from token 0 to breakpoint. Static content must be placed FIRST.",
      importance: "High",
      tags: ["Prompt Caching", "Prefix Match", "Anthropic API"]
    },
    {
      id: 2,
      question: "A developer places current_timestamp and user_session_id at the very beginning of the system prompt, followed by a 40,000-token corporate policy document. What is the impact on prompt caching?",
      options: [
        "Cache hit rate will be 100%",
        "Cache hit rate will drop to 0% because the dynamic timestamp at the beginning invalidates the exact prefix match for all subsequent text",
        "The API will automatically reorder the timestamp to the end",
        "Cost will be reduced by 90%"
      ],
      answer: "Cache hit rate will drop to 0% because the dynamic timestamp at the beginning invalidates the exact prefix match for all subsequent text",
      difficulty: "Medium",
      source: "Google / Anthropic Architect Q54",
      explanation: "Placing dynamic variables (timestamps, request IDs) before static cacheable text changes the prompt prefix on every request, completely destroying cache hits.",
      examTrick: "Never put dynamic variables (timestamps, session IDs) at the top of a prompt! Place static tools & documents first, dynamic content last.",
      importance: "High",
      tags: ["Prompt Caching", "Cache Invalidation", "Best Practices"]
    },
    {
      id: 3,
      question: "What is the minimum token threshold required to create a cache breakpoint milestone for Claude 3.5 Sonnet prompts?",
      options: [
        "10 tokens",
        "1,024 tokens",
        "100,000 tokens",
        "50,000 tokens"
      ],
      answer: "1,024 tokens",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q55",
      explanation: "In the Anthropic API, prompts must meet a minimum threshold of 1,024 tokens (for Sonnet/Opus) to qualify for prompt caching.",
      examTrick: "Anthropic Prompt Caching minimum threshold = 1,024 tokens.",
      importance: "High",
      tags: ["1024 Tokens", "Prompt Caching", "Pricing"]
    },
    {
      id: 4,
      question: "Your application experiences a surge in traffic, resulting in HTTP 429 (Too Many Requests) rate limit errors from the Anthropic API. What is the correct architectural pattern to manage this gracefully?",
      options: [
        "Immediately retry the request in a tight while loop as fast as possible",
        "Implement an exponential backoff retry strategy with jitter in the client gateway orchestrator",
        "Crash the application server and force a reboot",
        "Lower the API key security permission level"
      ],
      answer: "Implement an exponential backoff retry strategy with jitter in the client gateway orchestrator",
      difficulty: "Easy",
      source: "Google / Anthropic Architect Q58",
      explanation: "HTTP 429 rate limit management requires client-side exponential backoff with randomised jitter (e.g. 2s, 4s, 8s + random ms) to prevent thundering herd collisions against the API.",
      examTrick: "HTTP 429 handling = Exponential Backoff + Random Jitter.",
      importance: "High",
      tags: ["HTTP 429", "Exponential Backoff", "Rate Limits"]
    }
  ]
});

console.log("All Claude CCAF content generated successfully!");

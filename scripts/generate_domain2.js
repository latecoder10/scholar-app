import fs from 'fs';
import path from 'path';

console.log("Generating complete Claude CCAF Domain 2 question banks...");

const contentRoot = path.join(process.cwd(), 'content');

function writeChapter(domainFolder, filename, chapterData) {
  const targetDir = path.join(contentRoot, domainFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2), 'utf8');
  console.log(`Saved: ${domainFolder}/${filename} (${chapterData.questions.length} questions)`);
}

const d2Folder = 'Claude-CCAF-MCP-Tool-Design';

// Domain 2 - Chapter 1: Tool Interface Design
const d2_c1 = {
  subject: "Claude CCAF: Tool Design & MCP Integration",
  chapter: "2.1 Tool Interface Design & Schema Engineering",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Three-part descriptions (what, when, when NOT), JSON schema constraints, strict mode, enums, discriminated unions, and token economy.",
  questions: [
    {
      id: 1,
      question: "An MCP tool description says \"Retrieves customer information.\" The agent misroutes requests because the description lacks specificity; the tool accepts customer_id, email, or phone number. How should the description be improved?",
      options: [
        "Keep the description concise, as brevity improves agent processing speed.",
        "Tool descriptions should remain minimal, delegating selection to agent reasoning.",
        "Expand the description with specific use cases, accepted parameters, return format, and when to use.",
        "Add a schema definition describing all possible parameters and return fields."
      ],
      answer: "Expand the description with specific use cases, accepted parameters, return format, and when to use.",
      difficulty: "Medium",
      source: "UD2-001 | Tool use — tool definitions and descriptions · Writing tools for agents",
      explanation: "Tool selection is driven by descriptions. Specifying accepted identifiers, expected output shapes, and concrete use cases gives the model the necessary semantic discriminator to select correctly.",
      examTrick: "Tool selection failure = Expand 3-part description (what it does, parameters accepted, when to use / not use).",
      importance: "High",
      tags: ["Tool Descriptions", "Interface Design", "Routing"]
    },
    {
      id: 2,
      question: "A tool description says \"Processes orders.\" It actually updates order status, cancels orders, and initiates refunds; the agent misuses it for status checks. Improve the description?",
      options: [
        "Schema definition alone is sufficient without natural language description.",
        "Tool descriptions should be minimal, allowing agent reasoning to determine usage.",
        "Keep descriptions concise for faster agent processing.",
        "Detailed description with specific capabilities, use cases, and when NOT to use."
      ],
      answer: "Detailed description with specific capabilities, use cases, and when NOT to use.",
      difficulty: "Easy",
      source: "UD2-003 | Writing tools for agents · Tool use overview",
      explanation: "Vague verbs like \"Processes\" invite misuse on read-only operations. Adding explicit 'when NOT to use' boundaries steers read-only checks away from mutating tools.",
      examTrick: "Prevent read-only misuse of mutating tools = Explicit 'when NOT to use' exclusion clauses.",
      importance: "High",
      tags: ["Tool Descriptions", "Mutating Tools", "Exclusion Clauses"]
    },
    {
      id: 3,
      question: "An MCP tool's operation takes 45 seconds; the agent times out and never receives the (successful) result. How should long-running MCP operations be handled?",
      options: [
        "Implement an async pattern: the tool returns immediately with a job_id, plus a separate status-check tool.",
        "Split the long operation into smaller incremental steps with partial results.",
        "Increase agent timeout values to accommodate long-running operations.",
        "Long-running operations should be handled outside agentic workflows entirely."
      ],
      answer: "Implement an async pattern: the tool returns immediately with a job_id, plus a separate status-check tool.",
      difficulty: "Medium",
      source: "UD2-010 | Writing tools for agents — long-running operations · MCP specification",
      explanation: "Long-running operations must follow the async job pattern: the initiating tool returns a job_id immediately, and a secondary check_status tool allows the agent to poll for completion without connection timeouts.",
      examTrick: "Long-running MCP operations (>10s) = Async job pattern (return job_id immediately + check_status tool).",
      importance: "High",
      tags: ["Async Operations", "Long-Running Tools", "Job Pattern"]
    },
    {
      id: 4,
      question: "An MCP database_query tool executes SQL constructed by the agent from natural language. SQL injection risk exists. How should the tool protect against it?",
      options: [
        "Include SQL injection prevention instructions in the tool description.",
        "The agent should validate SQL queries before execution.",
        "The tool implementation uses parameterized queries preventing injection.",
        "SQL injection is handled by the database layer, not the MCP tool."
      ],
      answer: "The tool implementation uses parameterized queries preventing injection.",
      difficulty: "Easy",
      source: "UD2-013 | MCP security best practices · Writing tools for agents",
      explanation: "Parameterized queries structurally separate SQL logic from data literals, preventing injection regardless of model-generated text. Security must be enforced in server code, not prompts.",
      examTrick: "SQL injection prevention in tools = Parameterized queries in tool implementation.",
      importance: "High",
      tags: ["Tool Security", "SQL Injection", "Parameterized Queries"]
    },
    {
      id: 5,
      question: "A status parameter should only ever be pending, shipped, delivered, or cancelled, but is typed as a plain string; Claude occasionally sends Shipped or in-transit. Most direct schema-level fix, and why does it work at the mechanism level under strict tool use?",
      options: [
        "Add validation code after the tool call that rejects bad values and asks Claude to retry.",
        "Type the parameter as an enum of the four valid values.",
        "Add a detailed description explaining the exact four valid values and their casing.",
        "Use a pattern regex constraining the string to match one of the four words, case-insensitively."
      ],
      answer: "Type the parameter as an enum of the four valid values.",
      difficulty: "Medium",
      source: "GEN2-001 | Structured outputs and strict tool use · Tool use — input schemas",
      explanation: "Under strict tool use, schema enums are compiled into a sampling grammar that constrains token generation, making invalid tokens or wrong casing physically ungeneratable.",
      examTrick: "Strict tool use compiles JSON schema enums into a sampling grammar; invalid values cannot be sampled.",
      importance: "High",
      tags: ["Enums", "Strict Tool Use", "Sampling Grammar"]
    },
    {
      id: 6,
      question: "With strict: true and type: integer for passenger_count, what happens if the model tries to generate \"two\"?",
      options: [
        "The call is sent to your function with passenger_count: \"two\", and your code must coerce it.",
        "The API rejects the completed tool call after generation and returns a 400.",
        "The schema is compiled into a grammar that constrains token sampling, so the model is physically incapable of generating a string token where an integer is required.",
        "Strict mode has no effect on primitive types, only on enum and object fields."
      ],
      answer: "The schema is compiled into a grammar that constrains token sampling, so the model is physically incapable of generating a string token where an integer is required.",
      difficulty: "Medium",
      source: "GEN2-002 | Structured outputs and strict tool use",
      explanation: "Strict tool use acts at token-generation time by constraining logits to valid grammar tokens. It prevents type violations before completion.",
      examTrick: "strict: true = Generation-time grammar enforcement on token sampling.",
      importance: "High",
      tags: ["Strict Mode", "Grammar Constraints"]
    },
    {
      id: 7,
      question: "create_ticket has title (always needed), description (works fine without one), priority (defaults to medium), assignee_id (rarely provided). Which fields belong in required?",
      options: [
        "All four, since marking everything required guarantees nothing is left out.",
        "Only title.",
        "title and priority, since priority is important enough to always specify.",
        "None of them."
      ],
      answer: "Only title.",
      difficulty: "Medium",
      source: "GEN2-004 | Tool use — input schemas · Writing tools for agents",
      explanation: "Only mark fields as required if the tool cannot function without them. Forcing optional fields into required forces the model to hallucinate or fabricate values.",
      examTrick: "required array = Only fields without defaults that are strictly necessary for tool execution.",
      importance: "High",
      tags: ["Required Fields", "Schema Design", "Preventing Fabrication"]
    },
    {
      id: 8,
      question: "A discount_percent field is type: number, minimum: 0, maximum: 100 under strict: true. What does strict mode actually guarantee?",
      options: [
        "Strict mode guarantees the value is a number (grammar-enforced by type), but does NOT guarantee it falls within 0–100.",
        "Strict mode guarantees both the type AND the range, since all declared constraints are grammar-enforced.",
        "Strict mode guarantees the range but not the type.",
        "Strict mode has no effect on numeric fields at all."
      ],
      answer: "Strict mode guarantees the value is a number (grammar-enforced by type), but does NOT guarantee it falls within 0–100.",
      difficulty: "Hard",
      source: "GEN2-013 | Structured outputs and strict tool use",
      explanation: "Grammar constraints enforce structural tokens (type: number, object shape, enums). Semantic range constraints like minimum/maximum are NOT grammar-enforced and must still be validated server-side.",
      examTrick: "strict: true guarantees structural type (number), NOT semantic range (minimum/maximum).",
      importance: "High",
      tags: ["Strict Tool Use Limits", "Numeric Ranges", "Semantic Validation"]
    },
    {
      id: 9,
      question: "A schema defines exactly three parameters, but the model occasionally includes an extra undeclared field the implementation silently ignores. To eliminate undeclared fields at the schema level, add:",
      options: [
        "additionalProperties: false on the schema.",
        "A maxProperties: 3 constraint.",
        "Nothing.",
        "required: [\"customer_id\", \"reason\", \"amount\"]."
      ],
      answer: "additionalProperties: false on the schema.",
      difficulty: "Easy",
      source: "GEN2-015 | Structured outputs and strict tool use",
      explanation: "additionalProperties: false explicitly disallows undeclared keys in JSON Schema and is required for strict tool use compilation.",
      examTrick: "Prevent extraneous/undeclared keys in tool input = additionalProperties: false.",
      importance: "High",
      tags: ["additionalProperties", "Strict Schemas"]
    },
    {
      id: 10,
      question: "In one turn the model emits two parallel reserve_inventory calls for the same SKU; they execute concurrently against the same inventory count and occasionally over-reserve. Most direct fix at the API-call-configuration level?",
      options: [
        "Increase schema strictness so qty is validated more precisely.",
        "Set disable_parallel_tool_use so Claude emits tool calls one at a time in this context, avoiding concurrent execution against shared mutable inventory state.",
        "Rewrite the tool descriptions to be more specific about inventory limits.",
        "Force tool_choice: \"any\" so only one tool call happens per turn."
      ],
      answer: "Set disable_parallel_tool_use so Claude emits tool calls one at a time in this context, avoiding concurrent execution against shared mutable inventory state.",
      difficulty: "Hard",
      source: "GEN2-017 | Tool use — parallel tool use and disable_parallel_tool_use",
      explanation: "disable_parallel_tool_use forces the model to emit tool calls sequentially across turns, eliminating race conditions against shared mutable state at API configuration level.",
      examTrick: "Prevent concurrent race conditions on shared mutable tools = disable_parallel_tool_use.",
      importance: "High",
      tags: ["disable_parallel_tool_use", "Concurrency", "Race Conditions"]
    }
  ]
};
writeChapter(d2Folder, 'chapter-01-tool-interface-design.json', d2_c1);

// Domain 2 - Chapter 2: Structured Error Handling
const d2_c2 = {
  subject: "Claude CCAF: Tool Design & MCP Integration",
  chapter: "2.2 Structured Error Handling & Resilience",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "isError protocol flags, 4-field error schemas (code, message, context, suggested_action), retry idempotency keys, and circuit breakers.",
  questions: [
    {
      id: 1,
      question: "A developer needs to distinguish \"the tool errored\" from \"the tool succeeded but found no results\"; the agent currently says \"I couldn't find that information\" for both. What response distinction should be implemented?",
      options: [
        "Distinguish access failures (isError: true, isRetryable: true for timeouts) from valid empty results (isError: false with an empty result set).",
        "Always return isError: true and include a severity field to differentiate.",
        "Return the same response format but include a log_level field (warning vs error).",
        "Use HTTP status codes (404 for not found, 500 for errors) in the tool response."
      ],
      answer: "Distinguish access failures (isError: true, isRetryable: true for timeouts) from valid empty results (isError: false with an empty result set).",
      difficulty: "Medium",
      source: "UD3-052 | MCP — tools and error handling · Implement tool use",
      explanation: "isError: false with an empty array indicates a successful query that found zero records. isError: true signals an execution or connectivity failure. Conflating them confuses the agent.",
      examTrick: "Empty result set = isError: false. Tool/network failure = isError: true.",
      importance: "High",
      tags: ["isError", "Empty Results vs Errors", "Error Protocols"]
    },
    {
      id: 2,
      question: "How should a business rule violation (refund amount exceeds policy limit) be communicated back to the agent?",
      options: [
        "Return isError: false with the policy limit details embedded in the success response.",
        "Throw an exception that terminates the agentic loop.",
        "Return isError: true with structured metadata including errorCategory='policy_violation', isRetryable: false, and a customer-friendly description.",
        "Return isError: true with a generic \"Operation failed\" message."
      ],
      answer: "Return isError: true with structured metadata including errorCategory='policy_violation', isRetryable: false, and a customer-friendly description.",
      difficulty: "Medium",
      source: "UD3-055 | MCP — tools · Writing tools for agents — error messages",
      explanation: "Business rule violations must return isError: true with errorCategory='policy_violation' and isRetryable: false so the agent knows not to retry and can explain the policy to the customer.",
      examTrick: "Business rule violation = isError: true, isRetryable: false, category: policy_violation.",
      importance: "High",
      tags: ["Business Rule Violations", "Error Schemas", "Non-Retryable Errors"]
    },
    {
      id: 3,
      question: "A payment tool's error response is just {\"status\": \"error\"}. Which redesign best follows the four-field structured error pattern?",
      options: [
        "{\"error_code\": \"INSUFFICIENT_FUNDS\", \"message\": \"The account balance is too low to complete this payment.\", \"context\": {\"account_id\": \"acct_123\", \"attempted_amount\": 500}, \"suggested_action\": \"ask_user\"}",
        "{\"status\": \"error\", \"details\": \"payment failed, see logs for stack trace\"}",
        "{\"status\": \"error\", \"error_code\": \"ERROR\"}",
        "{\"status\": \"success\", \"note\": \"payment may not have completed, please verify\"}"
      ],
      answer: "{\"error_code\": \"INSUFFICIENT_FUNDS\", \"message\": \"The account balance is too low to complete this payment.\", \"context\": {\"account_id\": \"acct_123\", \"attempted_amount\": 500}, \"suggested_action\": \"ask_user\"}",
      difficulty: "Easy",
      source: "GEN2-020 | Writing tools for agents — error messages · Implement tool use",
      explanation: "The 4-field error pattern provides: (1) error_code (stable machine code), (2) message (explanatory text), (3) context (exact parameters involved), and (4) suggested_action (retry, ask_user, escalate).",
      examTrick: "4-field structured error schema = error_code + message + context + suggested_action.",
      importance: "High",
      tags: ["Structured Error Pattern", "4-Field Schema"]
    },
    {
      id: 4,
      question: "Which operation is idempotent by nature, and which requires deliberate design to become retry-safe?",
      options: [
        "A GET-style balance lookup is idempotent by nature (repeat calls re-read the same state); a payment-charge tool is NOT (each call is a new side effect) and needs a deliberate mechanism such as a client-generated idempotency key.",
        "Both are idempotent by nature.",
        "Neither is idempotent, since any tool call could theoretically be retried.",
        "The payment-charge tool is idempotent by nature since gateways deduplicate internally by default."
      ],
      answer: "A GET-style balance lookup is idempotent by nature (repeat calls re-read the same state); a payment-charge tool is NOT (each call is a new side effect) and needs a deliberate mechanism such as a client-generated idempotency key.",
      difficulty: "Medium",
      source: "GEN2-025 | Implement tool use — retries · Writing tools for agents",
      explanation: "Reads/lookups are inherently idempotent. Mutating actions (charges, refunds, emails) are non-idempotent and require client-generated idempotency keys for retry safety.",
      examTrick: "Reads = Naturally idempotent. Mutating actions = Require client-generated idempotency keys.",
      importance: "High",
      tags: ["Idempotency", "Retry Safety"]
    },
    {
      id: 5,
      question: "A circuit breaker is Closed and failures start exceeding the threshold. What happens next, in order?",
      options: [
        "Closed -> threshold exceeded -> Open (calls blocked outright, fallback or error returns immediately) -> after a configured wait -> Half-Open (a single probe call tests recovery) -> probe succeeds -> Closed; probe fails -> Open.",
        "Closed -> Half-Open (calls blocked) -> Open (probe tests recovery) -> back to Closed regardless of the probe's result.",
        "Once a circuit breaker opens, it never recovers automatically.",
        "Circuit breakers only have two states, Closed and Open."
      ],
      answer: "Closed -> threshold exceeded -> Open (calls blocked outright, fallback or error returns immediately) -> after a configured wait -> Half-Open (a single probe call tests recovery) -> probe succeeds -> Closed; probe fails -> Open.",
      difficulty: "Medium",
      source: "GEN2-029 | Building effective agents — resilience patterns · API errors",
      explanation: "Circuit breaker lifecycle: Closed (normal) -> threshold breached -> Open (fail fast without calling downstream) -> sleep wait -> Half-Open (single probe) -> Closed (if probe OK) or Open (if probe fails).",
      examTrick: "Circuit Breaker states: Closed (healthy) -> Open (failing/blocked) -> Half-Open (canary probe).",
      importance: "High",
      tags: ["Circuit Breakers", "Resilience Patterns", "Fault Tolerance"]
    }
  ]
};
writeChapter(d2Folder, 'chapter-02-structured-error-handling.json', d2_c2);

// Domain 2 - Chapter 3: Tool Distribution & Selection
const d2_c3 = {
  subject: "Claude CCAF: Tool Design & MCP Integration",
  chapter: "2.3 Tool Distribution, Selection & tool_choice",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "tool_choice modes (auto, any, tool, none), role-scoped tool catalogs, tool search with defer_loading, and selection drift.",
  questions: [
    {
      id: 1,
      question: "An agent has 16 tools across multiple MCP servers; selection reliability is degrading and not all tools are relevant to its role. How do you optimize tool distribution?",
      options: [
        "Routing classifier dynamically filtering tools based on request type.",
        "Training period for the agent to learn optimal selection patterns.",
        "Consolidate MCP servers to a single server, reducing management complexity.",
        "Role-specific MCP configuration exposing only the relevant 4–5 tools per agent."
      ],
      answer: "Role-specific MCP configuration exposing only the relevant 4–5 tools per agent.",
      difficulty: "Easy",
      source: "UD2-016 | Claude Code MCP · Writing tools for agents",
      explanation: "Role-specific configuration restricts each agent's catalog to 4–5 relevant tools, removing distractor candidates and reducing tool definition token overhead.",
      examTrick: "Catalog degradation with too many tools = Scope 4–5 role-specific tools per agent.",
      importance: "High",
      tags: ["Tool Scoping", "Role-Specific Catalogs"]
    },
    {
      id: 2,
      question: "Match tool_choice settings: (1) an open-ended assistant that answers directly for simple questions but uses tools for complex ones; (2) a database dispatcher that must always act (lookup/create/update) but the action depends on the request; (3) a pipeline step that must always run one specific extraction tool; (4) a turn where tools are attached but this turn should be text-only.",
      options: [
        "(1) auto, (2) any, (3) tool, (4) none",
        "(1) any, (2) auto, (3) none, (4) tool",
        "All four should use auto.",
        "(1) tool, (2) none, (3) auto, (4) any"
      ],
      answer: "(1) auto, (2) any, (3) tool, (4) none",
      difficulty: "Medium",
      source: "GEN2-034 | Tool use — tool_choice",
      explanation: "tool_choice modes: 'auto' (model decides text or tool), 'any' (forces at least one tool call), 'tool' (forces specific named tool), 'none' (forces text response while keeping tools cached).",
      examTrick: "tool_choice: auto (optional), any (some tool required), tool (specific tool required), none (text only).",
      importance: "High",
      tags: ["tool_choice", "API Configuration"]
    },
    {
      id: 3,
      question: "200 tools aggregated across MCP servers; a tool search tool is added and defer_loading: true set on most. What happens to those definitions, and what must remain true for search to work?",
      options: [
        "The 200 deferred definitions are entirely omitted from the request; only the search tool's definition is sent.",
        "Deferred tool definitions are still included in the request (so search can find and expand them) but kept out of the active context until the model searches for and matches one; at least one tool must remain non-deferred (and the search tool itself must never be deferred).",
        "Setting defer_loading: true immediately loads all 200 definitions in a compressed format.",
        "defer_loading only works if every tool, including the search tool, is deferred."
      ],
      answer: "Deferred tool definitions are still included in the request (so search can find and expand them) but kept out of the active context until the model searches for and matches one; at least one tool must remain non-deferred (and the search tool itself must never be deferred).",
      difficulty: "Hard",
      source: "GEN2-044 | Tool search and defer_loading · Writing tools for agents",
      explanation: "defer_loading: true defers tool schema expansion until searched. The tool search tool itself must NEVER be deferred, and at least one non-deferred tool must exist.",
      examTrick: "Tool search: defer_loading: true on catalog; tool search tool itself must NEVER be deferred.",
      importance: "High",
      tags: ["Tool Search", "defer_loading", "Large Catalogs"]
    },
    {
      id: 4,
      question: "extract_metadata must run before lookup_citations (which needs the DOI it produces), but on \"extract the metadata and tell me how cited it is\" Claude sometimes calls lookup_citations first and it fails. Most effective way to ensure extraction happens first?",
      options: [
        "Set tool_choice: \"any\" plus system prompt instructions prioritizing extract_metadata.",
        "Set tool_choice: \"auto\" and reorder the tools array so extract_metadata appears first, since Claude prioritizes earlier-listed tools.",
        "Set tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"} and process the enrichment requests in subsequent turns after receiving the extracted metadata.",
        "Set tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"} for every API call in the pipeline."
      ],
      answer: "Set tool_choice: {\"type\": \"tool\", \"name\": \"extract_metadata\"} and process the enrichment requests in subsequent turns after receiving the extracted metadata.",
      difficulty: "Medium",
      source: "CS2-001 (§2.3) | Tool use — tool_choice",
      explanation: "Force the named tool on the FIRST turn only. Once the DOI is extracted and returned in context, revert to auto on subsequent turns so enrichment tools can be called.",
      examTrick: "Enforce first step: Force tool_choice: {'type': 'tool', name: '...'} on Turn 1 -> auto on Turn 2.",
      importance: "High",
      tags: ["tool_choice", "Workflow Dependency Gating"]
    }
  ]
};
writeChapter(d2Folder, 'chapter-03-tool-distribution-and-selection.json', d2_c3);

// Domain 2 - Chapter 4: MCP Server Integration
const d2_c4 = {
  subject: "Claude CCAF: Tool Design & MCP Integration",
  chapter: "2.4 MCP Server Integration & Protocols",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Tools vs Resources vs Prompts, STDIO vs StreamableHTTP transports, Roots, Sampling, and enterprise plugin distribution.",
  questions: [
    {
      id: 1,
      question: "Users should be able to click a button to trigger a \"summarize document\" workflow. Which MCP primitive?",
      options: [
        "Resources — because you need to fetch document data.",
        "Functions — because it involves processing.",
        "Prompts — because users control when to start the workflow.",
        "Tools — because the AI needs new capabilities."
      ],
      answer: "Prompts — because users control when to start the workflow.",
      difficulty: "Easy",
      source: "UD2-050 | MCP — prompts · MCP specification",
      explanation: "Prompts are user-controlled templates surfaced in UI slash menus. Tools are model-controlled actions. Resources are application-controlled data context.",
      examTrick: "MCP primitive ownership: Prompts = User-controlled. Tools = Model-controlled. Resources = App-controlled.",
      importance: "High",
      tags: ["MCP Primitives", "Prompts vs Tools vs Resources"]
    },
    {
      id: 2,
      question: "Which transport requires both client and server to run on the same machine?",
      options: [
        "TCP transport",
        "Stdio transport",
        "WebSocket transport",
        "HTTP transport"
      ],
      answer: "Stdio transport",
      difficulty: "Easy",
      source: "UD2-057 | MCP specification — transports",
      explanation: "STDIO communicates via standard input/output streams of a spawned child process, requiring same-machine execution. StreamableHTTP is networked for remote connections.",
      examTrick: "Same-machine child process = STDIO. Remote/networked multi-client = StreamableHTTP.",
      importance: "High",
      tags: ["MCP Transports", "STDIO vs StreamableHTTP"]
    },
    {
      id: 3,
      question: "What is sampling in MCP?",
      options: [
        "A method for collecting data from multiple sources.",
        "A way for servers to access language models through connected MCP clients.",
        "A process for validating client credentials.",
        "A technique for optimizing server performance."
      ],
      answer: "A way for servers to access language models through connected MCP clients.",
      difficulty: "Medium",
      source: "UD2-058 | MCP — sampling · MCP specification",
      explanation: "Sampling allows an MCP server to request LLM completions through the host client, leveraging the client's API keys, billing, and user approval gates.",
      examTrick: "MCP Sampling = Server requests LLM generation routed through the host client.",
      importance: "High",
      tags: ["MCP Sampling", "Host-Mediated LLM Calls"]
    },
    {
      id: 4,
      question: "Correct sequence for MCP connection initialization?",
      options: [
        "Initialized Notification -> Initialize Request -> Initialize Result",
        "Initialize Request -> Initialized Notification -> Initialize Result",
        "Initialize Result -> Initialize Request -> Initialized Notification",
        "Initialize Request -> Initialize Result -> Initialized Notification"
      ],
      answer: "Initialize Request -> Initialize Result -> Initialized Notification",
      difficulty: "Easy",
      source: "UD2-063 | MCP specification — lifecycle",
      explanation: "Handshake sequence: Client sends Initialize Request -> Server responds with Initialize Result -> Client sends Initialized Notification to begin normal operation.",
      examTrick: "MCP Handshake: Initialize Request -> Initialize Result -> Initialized Notification.",
      importance: "High",
      tags: ["MCP Handshake", "Protocol Lifecycle"]
    },
    {
      id: 5,
      question: "All engineers should have three approved internal MCP servers available from Day 1 without configuring them manually. Correct architecture?",
      options: [
        "Add the servers to allowedMcpServers in managed-settings.json.",
        "Add the configs to the shared .mcp.json in the team's main repository.",
        "Bundle the MCP server configs into a plugin, assign the engineering SCIM group to it via RBAC, and deploy org-wide.",
        "Send each developer the configuration file and include setup steps in the onboarding doc."
      ],
      answer: "Bundle the MCP server configs into a plugin, assign the engineering SCIM group to it via RBAC, and deploy org-wide.",
      difficulty: "Hard",
      source: "UD2-069 | Claude Code plugins · Claude Code IAM",
      explanation: "Enterprise distribution uses Plugins assigned to SCIM user groups via RBAC for zero-touch configuration. allowedMcpServers only permits servers but does not distribute them.",
      examTrick: "Zero-touch MCP enterprise distribution = Plugins + SCIM Group RBAC.",
      importance: "High",
      tags: ["Enterprise MCP", "Plugins", "SCIM RBAC"]
    }
  ]
};
writeChapter(d2Folder, 'chapter-04-mcp-server-integration.json', d2_c4);

// Domain 2 - Chapter 5: Built-in & Client Tools
const d2_c5 = {
  subject: "Claude CCAF: Tool Design & MCP Integration",
  chapter: "2.5 Built-in Tools vs Custom Client Tools",
  exam: "Claude CCAF",
  paper: "Domain-2",
  description: "Server vs client tools, Bash vs Grep vs Glob, computer_use, code_execution, and hybrid architecture patterns.",
  questions: [
    {
      id: 1,
      question: "Which built-in tools run on Anthropic's infrastructure with no handler code, and which execute in the developer's environment requiring a handler?",
      options: [
        "web_search and code_execution are server tools (Anthropic infra, no handler); computer_use, bash, and text_editor are client tools (developer's environment, still need handler code even though schema authoring is skipped).",
        "All five run entirely on Anthropic's infrastructure with zero developer-side code.",
        "computer_use and code_execution are server tools; web_search, bash, and text_editor are client tools.",
        "The server/client distinction doesn't apply to built-in tools, only to custom MCP tools."
      ],
      answer: "web_search and code_execution are server tools (Anthropic infra, no handler); computer_use, bash, and text_editor are client tools (developer's environment, still need handler code even though schema authoring is skipped).",
      difficulty: "Hard",
      source: "GEN2-058 | Tool use overview — client vs. server tools · Code execution tool",
      explanation: "Server tools (web_search, code_execution) execute on Anthropic servers with zero client handler code. Client tools (bash, text_editor, computer_use) execute inside your local environment.",
      examTrick: "Server tools (Anthropic infra) = web_search, code_execution. Client tools (local infra) = bash, text_editor, computer_use.",
      importance: "High",
      tags: ["Server vs Client Tools", "Built-in Tools"]
    },
    {
      id: 2,
      question: "Find all files matching **/*.test.tsx across a large codebase. Which built-in tool?",
      options: [
        "Read",
        "Glob",
        "Bash",
        "Grep"
      ],
      answer: "Glob",
      difficulty: "Easy",
      source: "UD2-029 | Claude Code — built-in tools",
      explanation: "Glob is purpose-built for filename pattern matching. Grep searches file contents. Read opens a specific file.",
      examTrick: "Search file names / directory paths = Glob. Search file contents = Grep.",
      importance: "High",
      tags: ["Glob", "Grep", "Built-in Tools"]
    },
    {
      id: 3,
      question: "A security review asks which built-in tools could theoretically be tricked into reaching the company's private internal network. Which can, and why?",
      options: [
        "Client tools like bash, text_editor, and computer_use can reach private resources, because they run in the developer's own environment, wherever that environment is connected; server tools like web_search and code_execution stay inside Anthropic's boundary and cannot reach a company's private network at all.",
        "All built-in tools can equally reach a private network, since they're all controlled by the same model.",
        "Only web_search can, since it makes outbound requests.",
        "None of the built-in tools can ever reach a private network."
      ],
      answer: "Client tools like bash, text_editor, and computer_use can reach private resources, because they run in the developer's own environment, wherever that environment is connected; server tools like web_search and code_execution stay inside Anthropic's boundary and cannot reach a company's private network at all.",
      difficulty: "Hard",
      source: "GEN2-067 | Tool use overview — client vs. server tools · Claude Code security",
      explanation: "Network reach follows execution location. Client tools execute inside your private subnet/VPC; server tools execute on Anthropic infrastructure with no routing into your private network.",
      examTrick: "Private network access: Only Client Tools (bash, text_editor) run inside your perimeter.",
      importance: "High",
      tags: ["Network Security", "Client vs Server Tools", "SSRF"]
    },
    {
      id: 4,
      question: "Inserting a helper function between two existing functions in a 150-line module; Edit fails because old_string cannot find unique text (repetitive docstrings, names, structure). Most reliable way?",
      options: [
        "Use Edit with a 30+ line old_string to guarantee uniqueness.",
        "Use Edit's replace_all to target a common pattern and embed the new function in the replacement.",
        "Use Bash to append the function to the end of the file with a heredoc.",
        "Use Read to load the file, add the function at the appropriate location, then Write the updated file."
      ],
      answer: "Use Read to load the file, add the function at the appropriate location, then Write the updated file.",
      difficulty: "Medium",
      source: "CS2-001 (§2.5) | Claude Code — built-in tools · Best practices",
      explanation: "When old_string uniqueness fails in repetitive files, Read-modify-Write bypasses anchor matching: load the file, place the function in context, and Write the full updated file.",
      examTrick: "Edit unique anchor match fails -> Fall back to Read-modify-Write pattern.",
      importance: "High",
      tags: ["Read-Modify-Write", "Edit Tool", "Built-in Tools"]
    }
  ]
};
writeChapter(d2Folder, 'chapter-05-builtin-and-client-tools.json', d2_c5);

console.log("Domain 2 completed successfully!");

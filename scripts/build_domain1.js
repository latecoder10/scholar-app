import fs from 'fs';
import path from 'path';

const domain1Dir = path.join(process.cwd(), 'content', 'Claude-CCAF-Agentic-Architecture');
if (!fs.existsSync(domain1Dir)) {
  fs.mkdirSync(domain1Dir, { recursive: true });
}

// Chapter 1: 1.1 Agentic loops, stop_reason, and loop termination
const chapter1Questions = [
  {
    id: 1,
    question: "Your agentic loop checks if response.content[0].type equals \"text\" to determine completion. The agent sometimes terminates prematurely mid-task; production logs show tasks incomplete when the agent could continue. What causes premature termination?",
    options: [
      "Checking for text content instead of stop_reason creates false termination signal.",
      "Agent lacks sufficient tools to complete tasks requiring premature termination.",
      "Context window exhaustion prevents agent from continuing with additional iterations.",
      "Max iteration count reached before task completion causing early stop."
    ],
    answer: "Checking for text content instead of stop_reason creates false termination signal.",
    difficulty: "Medium",
    source: "UD1-005 | Handling stop reasons · Tool use overview",
    explanation: "A single assistant turn can contain mixed content blocks — Claude routinely emits a text block (\"I'll look up that order first…\") followed by one or more tool_use blocks in the same message. Because content[0] is the first block, a leading narration block makes the check fire even though the turn's stop_reason is \"tool_use\" and work remains. Only stop_reason carries completion meaning.",
    examTrick: "Check stop_reason == 'end_turn' as the sole termination predicate. Never rely on content[0].type == 'text'.",
    importance: "High",
    tags: ["Agentic Loops", "stop_reason", "Loop Termination"]
  },
  {
    id: 2,
    question: "An agent repeatedly calls the same tool with identical parameters after receiving successful responses, creating an infinite loop. What is the most appropriate architectural safeguard?",
    options: [
      "Increase the maximum iteration limit so the agent has more opportunities to finish.",
      "Add explicit loop detection by tracking repeated tool invocations and terminate or escalate when repetition is detected.",
      "Improve the system prompt instructing the agent not to repeat tool calls.",
      "Add more tools so the agent has additional choices."
    ],
    answer: "Add explicit loop detection by tracking repeated tool invocations and terminate or escalate when repetition is detected.",
    difficulty: "Medium",
    source: "UD1-009 | Building effective agents — guardrails and stopping conditions",
    explanation: "The failure is spinning (repeated action with no new information). The harness holds a deterministic record of every (tool_name, input) pair it has executed. Hashing invocations and tripping on repeats gives a hard guarantee and provides an escalation path rather than a silent hang.",
    examTrick: "Spinning detection = Hash (tool_name, input) pairs in harness; trigger circuit breaker on repeats.",
    importance: "High",
    tags: ["Loop Control", "Spinning Detection", "Circuit Breakers"]
  },
  {
    id: 3,
    question: "The loop continues while stop_reason == \"tool_use\" and terminates on \"end_turn\". The agent sometimes continues after completing the task; logs show end_turn received but the loop continues. What causes continued iteration after completion?",
    options: [
      "Context window size affects stop_reason reliability in long conversations.",
      "Tool results appended to conversation causing unexpected tool_use stop_reason.",
      "Multiple stop_reason values can occur requiring checking all values.",
      "Checking additional conditions beyond stop_reason creates continuation logic errors; stop_reason=\"end_turn\" is definitive completion."
    ],
    answer: "Checking additional conditions beyond stop_reason creates continuation logic errors; stop_reason=\"end_turn\" is definitive completion.",
    difficulty: "Medium",
    source: "UD1-012 | Handling stop reasons · Messages API reference",
    explanation: "stop_reason is a single scalar on each response, and \"end_turn\" is authoritative. If the loop iterates after receiving it, an additional condition in the loop predicate (e.g., text check or leftover heuristic) is overriding the definitive signal.",
    examTrick: "stop_reason is authoritative and single scalar. Do not OR additional heuristic continuation conditions.",
    importance: "High",
    tags: ["stop_reason", "Loop Termination", "Control Flow"]
  },
  {
    id: 4,
    question: "A production loop terminates when the response contains text content, assuming completion. The agent sometimes provides an explanation then continues with tool_use, so the loop terminates before tool execution. What is the correct loop termination signal?",
    options: [
      "Presence of text content in response indicates agent has completed reasoning and task.",
      "Maximum iteration count threshold as primary termination mechanism for safety.",
      "Check stop_reason value for end_turn as authoritative completion signal, not text content.",
      "Count tool_use occurrences in response; zero tool calls indicates completion."
    ],
    answer: "Check stop_reason value for end_turn as authoritative completion signal, not text content.",
    difficulty: "Easy",
    source: "UD1-029 | Handling stop reasons · Implement tool use",
    explanation: "Text and tool-use blocks coexist inside one turn. The API's explicit completion contract is stop_reason == 'end_turn'. Reading it is O(1), unambiguous, and stable across model versions.",
    examTrick: "stop_reason == 'end_turn' is the only reliable signal of task completion.",
    importance: "High",
    tags: ["stop_reason", "Loop Termination"]
  },
  {
    id: 5,
    question: "The loop continues while stop_reason == tool_use and stops on end_turn. It also checks whether the response contains \"DONE\" text, triggering termination. What causes incorrect early loop termination?",
    options: [
      "Text-based completion detection in addition to stop_reason creates false termination triggers.",
      "Text checking necessary as backup when stop_reason values are unreliable.",
      "Both stop_reason and text conditions required for robust production termination.",
      "Multiple termination conditions improve robustness catching all possible completion signals."
    ],
    answer: "Text-based completion detection in addition to stop_reason creates false termination triggers.",
    difficulty: "Medium",
    source: "UD1-049 | Handling stop reasons · Building effective agents",
    explanation: "The added text check is a weaker trigger OR-ed into the predicate. \"DONE\" can legitimately appear inside reasoning (\"the migration is not DONE until...\"), log output, or identifiers — causing early termination.",
    examTrick: "Never OR natural language text checks with stop_reason; it broadens false positives.",
    importance: "High",
    tags: ["Loop Termination", "Anti-Patterns"]
  },
  {
    id: 6,
    question: "A developer's Agent SDK agent definition includes 3 tools and a system prompt. When they call agent.run(), what happens internally?",
    options: [
      "The SDK sends the tools to a separate tool execution service and polls for results.",
      "The SDK makes a single API call with all tools and returns the complete result.",
      "The SDK enters an agentic loop: sends messages to Claude, receives a response, checks for tool_use blocks, executes any tools, appends tool results to the conversation, and continues until Claude responds with end_turn.",
      "The SDK makes parallel API calls."
    ],
    answer: "The SDK enters an agentic loop: sends messages to Claude, receives a response, checks for tool_use blocks, executes any tools, appends tool results to the conversation, and continues until Claude responds with end_turn.",
    difficulty: "Easy",
    source: "UD1-052 | Claude Agent SDK overview · Implement tool use",
    explanation: "This is the canonical agentic loop: request -> inspect stop_reason -> execute requested tools -> append tool_result blocks as a user message -> request again -> repeat until end_turn.",
    examTrick: "Canonical Agentic Loop: Request -> tool_use -> Execute -> tool_result -> Repeat until end_turn.",
    importance: "High",
    tags: ["Agent SDK", "Agentic Loop Lifecycle"]
  },
  {
    id: 7,
    question: "Streaming a response containing both text and thinking blocks; thinking must render in a separate UI panel. How do streaming events distinguish thinking from text content?",
    options: [
      "Thinking content uses a different streaming endpoint from text content.",
      "Thinking content arrives first, followed by text content.",
      "All content arrives in the same stream with inline markdown tags to distinguish thinking.",
      "Streaming events include a content_block_start event with the block type (thinking or text), allowing the client to route content to the appropriate UI panel."
    ],
    answer: "Streaming events include a content_block_start event with the block type (thinking or text), allowing the client to route content to the appropriate UI panel.",
    difficulty: "Medium",
    source: "UD1-055 | Streaming messages · Extended thinking",
    explanation: "The streaming protocol is block-structured. Each content block opens with a content_block_start event carrying an index and a typed content_block ({\"type\": \"thinking\"} or {\"type\": \"text\"}), followed by content_block_delta events.",
    examTrick: "Streaming protocol: content_block_start declares type ('thinking' | 'text'); content_block_delta streams chunks.",
    importance: "High",
    tags: ["Extended Thinking", "Streaming Events", "content_block_start"]
  },
  {
    id: 8,
    question: "Three subagents (researcher, analyzer, reporter). The researcher frequently gets stuck in recursive web searches, making dozens of tool calls without converging. What architectural pattern prevents this?",
    options: [
      "Add a PostToolUse hook that counts tool calls and terminates after 10.",
      "Increase the researcher's context window to give it more room for exploration.",
      "Remove the researcher subagent and have the main agent do research directly.",
      "Set an iteration limit for the researcher subagent and require it to report findings at the limit even if incomplete."
    ],
    answer: "Set an iteration limit for the researcher subagent and require it to report findings at the limit even if incomplete.",
    difficulty: "Hard",
    source: "UD1-057 | Multi-agent research system · Claude Code subagents",
    explanation: "Two things are needed: an effort budget/bound on the subagent's exploration, and a defined output contract at that bound (\"report what you have so far\"). A subagent that returns partial findings keeps the orchestrator's pipeline alive.",
    examTrick: "Bounded subagent exploration = Fixed iteration limit + mandatory structured partial findings report.",
    importance: "High",
    tags: ["Multi-Agent Orchestration", "Iteration Bounds", "Subagent Convergence"]
  },
  {
    id: 9,
    question: "A loop processes tool_use blocks sequentially, one at a time, and is slow when Claude requests multiple tools in a single response. What optimization should they implement?",
    options: [
      "Execute independent tool calls in parallel.",
      "Queue tool calls and batch them for execution on a fixed schedule.",
      "Increase the API timeout to accommodate the sequential execution time.",
      "Limit Claude to one tool call per response using tool_choice to prevent multiple simultaneous requests."
    ],
    answer: "Execute independent tool calls in parallel.",
    difficulty: "Easy",
    source: "UD1-061 | Implement tool use — parallel tool use",
    explanation: "Parallel tool use is supported: one assistant message may contain multiple tool_use blocks. Execute them concurrently and return all tool_result blocks in a single user message.",
    examTrick: "Multiple tool_use in single turn -> Execute in parallel and return all tool_results in single user message.",
    importance: "High",
    tags: ["Parallel Tool Use", "Latency Optimization"]
  },
  {
    id: 10,
    question: "Your agentic loop continues executing even after Claude has signalled completion. What is the correct control-flow condition to terminate the loop?",
    options: [
      "Terminate when stop_reason is 'end_turn'; continue when stop_reason is 'tool_use'.",
      "Set a maximum iteration count of 10 and terminate when it is reached.",
      "Terminate when the assistant message contains no tool_use content blocks.",
      "Terminate when the response text contains phrases such as 'I have completed' or 'Done'."
    ],
    answer: "Terminate when stop_reason is 'end_turn'; continue when stop_reason is 'tool_use'.",
    difficulty: "Easy",
    source: "UD1-071 | Handling stop reasons",
    explanation: "The contract is exact: stop_reason == 'end_turn' -> stop; stop_reason == 'tool_use' -> execute tools and continue. Caps and timeouts serve as secondary safety backstops.",
    examTrick: "stop_reason == 'end_turn' -> Terminate. stop_reason == 'tool_use' -> Continue.",
    importance: "High",
    tags: ["Control Flow", "stop_reason"]
  },
  {
    id: 11,
    question: "On a given turn the response's stop_reason is \"tool_use\". What should the loop do?",
    options: [
      "Truncate the response since the model ran out of output tokens.",
      "Execute the requested tool call(s), append the results to conversation history as tool results, and send the updated conversation back to the model for another turn.",
      "Treat this as the end of the task and return the response to the user.",
      "Treat this as an error and retry the turn."
    ],
    answer: "Execute the requested tool call(s), append the results to conversation history as tool results, and send the updated conversation back to the model for another turn.",
    difficulty: "Easy",
    source: "QD1-17 | Handling stop reasons · Implement tool use",
    explanation: "\"tool_use\" means the model paused specifically to obtain information. The handling is fixed: run each tool_use block, build a user message containing one tool_result per call (matched by tool_use_id), append it, and re-request.",
    examTrick: "stop_reason == 'tool_use' -> Execute -> append tool_result (with tool_use_id) -> send next API call.",
    importance: "High",
    tags: ["Agentic Loops", "Tool Results", "tool_use_id"]
  },
  {
    id: 12,
    question: "15 turns into a 20-turn budget on a complex refactor; each turn calls a different tool and history keeps growing. How do you decide whether to continue or escalate?",
    options: [
      "Let it run until the full 20-turn budget is exhausted regardless of content, since turn budgets exist precisely to allow this.",
      "Escalate only if the agent explicitly says it's stuck.",
      "Check whether each turn's tool calls and results represent new information/progress toward the goal, not just whether the turn count is high.",
      "Escalate immediately once past turn 10, since that's over half the budget."
    ],
    answer: "Check whether each turn's tool calls and results represent new information/progress toward the goal, not just whether the turn count is high.",
    difficulty: "Medium",
    source: "QD1-18 | Building effective agents — knowing when to stop",
    explanation: "Turn count measures spend, not health. Progress-based evaluation determines whether new files/records are being touched, remaining work is shrinking, or if the agent is stuck in repetitive actions without progress.",
    examTrick: "Assess progress delta (new information / unvisited files), not arbitrary turn-count fractions.",
    importance: "High",
    tags: ["Loop Control", "Progress Evaluation", "Escalation"]
  },
  {
    id: 13,
    question: "A long-running session's history is approaching the model's context window limit after many tool calls. Most reliable fix?",
    options: [
      "Truncate the oldest turns from the conversation history and never look at them again.",
      "Switch to a model with a larger context window as the permanent fix.",
      "Stop making tool calls once history gets large enough.",
      "Periodically summarize/compact older turns into a condensed representation, preserving only what's still needed for remaining work, rather than keeping every raw tool result."
    ],
    answer: "Periodically summarize/compact older turns into a condensed representation, preserving only what's still needed for remaining work, rather than keeping every raw tool result.",
    difficulty: "Medium",
    source: "QD1-19 | Context windows · Effective context engineering for AI agents",
    explanation: "Compaction is selective: it discards bulky raw tool payloads while carrying forward decisions, constraints, file paths, and open work items. Blind truncation deletes initial task constraints.",
    examTrick: "Compaction/Summarization of older turns preserves constraints and decisions while shedding raw tool payloads.",
    importance: "High",
    tags: ["Context Windows", "Compaction", "Context Engineering"]
  },
  {
    id: 14,
    question: "Your agent needs to call an internal, authenticated company API that only your backend can reach. Which tool implementation approach fits?",
    options: [
      "Define it as a client tool: the model requests the call, but your application code executes it and returns the result.",
      "Define it as a server tool the model executes directly without your application in the loop.",
      "Give the model direct network access so it can call the API itself.",
      "Have the model generate the API call as text for a human to run manually."
    ],
    answer: "Define it as a client tool: the model requests the call, but your application code executes it and returns the result.",
    difficulty: "Easy",
    source: "QD1-20 | Tool use overview — client vs. server tools",
    explanation: "Client tools (user-defined tools) publish name, description, and input_schema; the model emits a tool_use request; your process executes it inside your network with your credentials; and returns tool_result. Secrets stay on your backend.",
    examTrick: "Internal/private backend API = Client Tool (executed locally in application code with private credentials).",
    importance: "High",
    tags: ["Client Tools", "Security", "Tool Architecture"]
  },
  {
    id: 15,
    question: "A tool call fails 3 times in a row with the same error, inside a loop with a 10-retry budget still remaining. What should happen?",
    options: [
      "Immediately terminate the entire session.",
      "Classify the error type first.",
      "Keep retrying until the retry budget is fully exhausted, since budget exists for exactly this.",
      "Silently skip the failed tool call and continue the loop with the next step."
    ],
    answer: "Classify the error type first.",
    difficulty: "Medium",
    source: "QD1-21 | Implement tool use — handling tool errors · API errors",
    explanation: "Retry policy must be a function of error class. Transient errors (429, 5xx, timeouts) warrant retries with backoff. Deterministic errors (400 bad input, 401 auth, 404 missing resource) will fail identically on every attempt.",
    examTrick: "Classify error before retrying: Transient (retry with backoff) vs Deterministic (fail fast/escalate).",
    importance: "High",
    tags: ["Error Classification", "Retry Strategy"]
  },
  {
    id: 16,
    question: "A Customer Support Agent action loop, during a billing-system outage, retried the same failing balance lookup hundreds of times until it exhausted the rate limit. Which design BEST addresses the root cause while preserving autonomy?",
    options: [
      "Lower the model temperature to zero so the loop behaves deterministically.",
      "Replace the agent with a fixed workflow so retry behavior is hard-coded and the model can no longer choose to repeat the lookup.",
      "Add explicit termination conditions plus exponential backoff that classifies the outage as a transient environment error and escalates after bounded retries.",
      "Switch the balance lookup to a parallel fan-out of three concurrent calls so a healthy replica answers before the loop repeats."
    ],
    answer: "Add explicit termination conditions plus exponential backoff that classifies the outage as a transient environment error and escalates after bounded retries.",
    difficulty: "Hard",
    source: "BU1-001 | Building effective agents — guardrails · API errors",
    explanation: "The root cause is unbounded retries against a failing dependency. Adding explicit termination conditions, exponential backoff, error classification, and bounded escalation fixes the issue while preserving agentic autonomy.",
    examTrick: "Unbounded retry fix = Explicit termination conditions + Exponential backoff + Bounded retries + Escalation.",
    importance: "High",
    tags: ["Error Handling", "Rate Limits", "Backoff & Escalation"]
  },
  {
    id: 17,
    question: "Which BEST captures the difference between tool use and an agentic loop in a Data Extraction context?",
    options: [
      "Tool use is strictly read-only, whereas an agentic loop introduces the ability to write changes back to external systems.",
      "Tool use refers to a single tool invocation; an agentic loop is many tool invocations chained by the model based on observations.",
      "Tool use requires JSON schemas; an agentic loop accepts free-form output.",
      "Tool use is synchronous; an agentic loop is asynchronous."
    ],
    answer: "Tool use refers to a single tool invocation; an agentic loop is many tool invocations chained by the model based on observations.",
    difficulty: "Easy",
    source: "BU1-002 | Tool use overview · Building effective agents",
    explanation: "Tool use is the capability for a single invocation. The agentic loop is the feedback-driven control structure where the model observes results and iteratively decides subsequent actions.",
    examTrick: "Tool use = Single call capability. Agentic loop = Iterative perception-action-observation feedback loop.",
    importance: "High",
    tags: ["Agentic Loops vs Tool Use", "Definitions"]
  },
  {
    id: 18,
    question: "A team built an agent expecting runtime adaptation. Six months of telemetry shows the same five tool-call sequences 92% of the time. Most consistent interpretation?",
    options: [
      "Add more tools so it has even more flexibility.",
      "It performs well on all the data, so no architectural change is needed.",
      "The original choice was wrong for the common path; a workflow with the five sequences would better fit the 92%.",
      "Replace the agent with a conversational system."
    ],
    answer: "The original choice was wrong for the common path; a workflow with the five sequences would better fit the 92%.",
    difficulty: "Medium",
    source: "BU1-004 | Building effective agents — cost/latency tradeoffs",
    explanation: "If 92% of executions follow predetermined fixed paths, paying agent-tier latency, token costs, and non-determinism is over-engineering. A deterministic workflow should handle the 92% common path, routing the 8% adaptive edge cases to an agent.",
    examTrick: "Predetermined paths (>90% telemetry) = Workflow. Open-ended adaptive paths = Agent.",
    importance: "High",
    tags: ["Workflows vs Agents", "Architecture Selection", "Cost Optimization"]
  },
  {
    id: 19,
    question: "A team wants their SDK app to fall back to a different model if Claude is unavailable. Which characterization is MOST accurate?",
    options: [
      "Fallback is the application's job.",
      "The SDK automatically falls back to other vendors on failure, giving cross-provider resilience for free.",
      "The SDK natively supports OpenAI as a fallback target configured directly in the SDK.",
      "Cross-model fallback is not supported in any SDK at all, so the application must simply fail the request."
    ],
    answer: "Fallback is the application's job.",
    difficulty: "Medium",
    source: "BU1-006 | Client configuration and retries · Messages API",
    explanation: "Anthropic SDKs handle transport-level retries (429, 5xx, timeouts), but cross-vendor/cross-provider fallback routing is an application-layer responsibility.",
    examTrick: "Cross-provider/model fallback logic belongs in the application layer, not the SDK.",
    importance: "High",
    tags: ["SDK Architecture", "High Availability", "Failover"]
  },
  {
    id: 20,
    question: "In an evaluator-optimizer loop, later iterations make only tiny wording changes without improving quality. Which stopping criterion BEST prevents wasted iterations?",
    options: [
      "Continue until the maximum iteration count is reached regardless of improvement.",
      "Stop once improvements fall below a defined convergence threshold or quality no longer meaningfully increases.",
      "Lower temperature after every iteration so revisions naturally stop changing.",
      "Always run exactly five optimization iterations to keep behavior predictable."
    ],
    answer: "Stop once improvements fall below a defined convergence threshold or quality no longer meaningfully increases.",
    difficulty: "Medium",
    source: "BU1-017 | Building effective agents — evaluator-optimizer workflow",
    explanation: "Stopping based on marginal quality delta (convergence threshold) halts execution when score improvements plateau, saving tokens and latency.",
    examTrick: "Evaluator-Optimizer stopping criterion = Marginal improvement falls below convergence threshold delta.",
    importance: "High",
    tags: ["Evaluator-Optimizer", "Stopping Conditions", "Convergence"]
  }
];

// Write Chapter 1
fs.writeFileSync(
  path.join(domain1Dir, 'chapter-01-agentic-loops-and-orchestration.json'),
  JSON.stringify({
    subject: "Claude CCAF: Agentic Architecture & Orchestration",
    chapter: "1.1 Agentic Loops, stop_reason & Loop Termination",
    exam: "Claude CCAF",
    paper: "Domain-1",
    description: "Deep dive into ReAct control loops, stop_reason contracts ('tool_use' vs 'end_turn'), loop bounds, spinning detection, and streaming content block routing.",
    questions: chapter1Questions
  }, null, 2)
);

console.log("Domain 1 Chapter 1 written successfully!");

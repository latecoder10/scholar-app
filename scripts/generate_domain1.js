import fs from 'fs';
import path from 'path';

console.log("Generating complete Claude CCAF domain question banks...");

const contentRoot = path.join(process.cwd(), 'content');

// Helper to write chapter JSON
function writeChapter(domainFolder, filename, chapterData) {
  const targetDir = path.join(contentRoot, domainFolder);
  if (!fs.existsSync(targetDir)) {
    fs.mkdirSync(targetDir, { recursive: true });
  }
  const filePath = path.join(targetDir, filename);
  fs.writeFileSync(filePath, JSON.stringify(chapterData, null, 2), 'utf8');
  console.log(`Saved: ${domainFolder}/${filename} (${chapterData.questions.length} questions)`);
}

// -------------------------------------------------------------
// DOMAIN 1: Agentic Architecture & Orchestration
// -------------------------------------------------------------
const d1Folder = 'Claude-CCAF-Agentic-Architecture';

// Domain 1 - Chapter 1: Agentic Loops & Termination
const d1_c1 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.1 Agentic Loops, stop_reason & Loop Termination",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Core mechanics of ReAct loops, stop_reason contracts ('tool_use' vs 'end_turn'), loop bounds, spinning detection, and streaming block routing.",
  questions: [
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
      explanation: "A single assistant turn can contain mixed content blocks — Claude routinely emits a text block (\"I'll look up that order first…\") followed by tool_use blocks in the same message. Checking content[0].type triggers false termination when text precedes tool use.",
      examTrick: "stop_reason == 'end_turn' is the authoritative completion signal; never check content[0].type == 'text'.",
      importance: "High",
      tags: ["Agentic Loops", "stop_reason", "Termination"]
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
      explanation: "The failure is spinning. The harness holds a deterministic record of every (tool_name, input) pair. Hashing invocations and tripping a circuit breaker on repeats guarantees termination and provides an escalation path.",
      examTrick: "Spinning detection = Hash (tool_name, input) in harness; trigger circuit breaker on repeats.",
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
      explanation: "stop_reason is a single scalar on each response, and \"end_turn\" is authoritative. If the loop iterates after receiving it, an additional condition in the loop predicate is overriding the definitive signal.",
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
      explanation: "Text and tool-use blocks coexist in one turn. The API's explicit completion contract is stop_reason == 'end_turn'. Counting tool_use is a derived proxy that fails on max_tokens, pause_turn, and refusal.",
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
      explanation: "The added text check is a weaker trigger OR-ed into the predicate. \"DONE\" can legitimately appear inside reasoning (\"the migration is not DONE until...\"), log output, or identifiers.",
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
      explanation: "Each content block opens with content_block_start carrying an index and a typed content_block ({\"type\": \"thinking\"} or {\"type\": \"text\"}), followed by content_block_delta events.",
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
      explanation: "Two things are needed: an effort budget/bound on exploration, and a defined output contract at that bound (\"report what you have\"). Partial findings keep the orchestrator's pipeline alive.",
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
      explanation: "Parallel tool use is enabled by default: one assistant message may contain multiple tool_use blocks. Execute them concurrently and return all tool_result blocks in a single user message.",
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
      question: "The loop terminates by checking whether the assistant's latest message contains \"Task complete\". It occasionally fires when the phrase appears inside an explanation. Best fix?",
      options: [
        "Replace the text-based check with checking stop_reason == \"end_turn\" to determine when to stop the loop.",
        "Add a stricter, less-common phrase (e.g. ===TASK COMPLETE===) that's less likely to appear accidentally.",
        "Set a maximum iteration cap so the loop terminates safely regardless of text content.",
        "Ask the model to always confirm completion with a structured JSON object at the end of its response."
      ],
      answer: "Replace the text-based check with checking stop_reason == \"end_turn\" to determine when to stop the loop.",
      difficulty: "Easy",
      source: "QD1-02 | Handling stop reasons",
      explanation: "The defect is one of category: free text generation is probabilistic, whereas stop_reason is protocol metadata emitted by the API that cannot be produced accidentally in prose.",
      examTrick: "Replace model-generated prose sentinel checks with API protocol metadata (stop_reason == 'end_turn').",
      importance: "High",
      tags: ["stop_reason", "Anti-Patterns"]
    },
    {
      id: 12,
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
      id: 13,
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
      id: 14,
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
      id: 15,
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
      id: 16,
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
      id: 17,
      question: "An agent repeatedly calls the same search tool with slightly reworded queries across 6 turns without incorporating any new result into its plan. Best characterization and response?",
      options: [
        "This is legitimate exploration and should be allowed to continue since search tools are inherently iterative.",
        "This is a tool error and the tool itself should be retried with backoff.",
        "This is expected behavior for the perception-reasoning-action-observation loop and requires no intervention.",
        "This is spinning, not legitimate multi-step progress."
      ],
      answer: "This is spinning, not legitimate multi-step progress.",
      difficulty: "Medium",
      source: "QD1-23 | Multi-agent research system · Building effective agents",
      explanation: "The defining marker of spinning is action without integration: results return and the internal plan does not change. Reworded queries vary surface action while the agent's internal state remains stuck.",
      examTrick: "Action without integration/updating plan = Spinning. Intervene, bound search, or escalate.",
      importance: "High",
      tags: ["Spinning Detection", "Loop Health"]
    },
    {
      id: 18,
      question: "The loop terminates after exactly 6 tool calls regardless of whether the issue is resolved, occasionally cutting off mid-resolution on complex tickets. Most effective fix?",
      options: [
        "Replace the fixed iteration cap as the primary termination logic with stop_reason-based termination, keeping a higher cap only as a safety backstop.",
        "Raise the fixed cap from 6 to 12 to reduce how often this happens.",
        "Let the agent decide for itself when 6 calls is enough by reasoning about it in the prompt.",
        "Remove the cap entirely so the loop runs until stop_reason appears, with no safety bound at all."
      ],
      answer: "Replace the fixed iteration cap as the primary termination logic with stop_reason-based termination, keeping a higher cap only as a safety backstop.",
      difficulty: "Medium",
      source: "QD1S-04 | Handling stop reasons · Building effective agents — guardrails",
      explanation: "stop_reason must be the primary termination condition so the loop ends when work is complete. The iteration cap is demoted to a secondary safety backstop set high enough not to bind during normal operation.",
      examTrick: "Primary termination = stop_reason. Secondary backstop = Iteration cap.",
      importance: "High",
      tags: ["Loop Termination", "Guardrails"]
    },
    {
      id: 19,
      question: "A teammate argues: \"Since the loop already checks stop_reason correctly, the 6-iteration cap serves no purpose and should be removed.\" Is this reasoning sound?",
      options: [
        "Yes, stop_reason is completely sufficient on its own.",
        "No, an iteration cap defends against infinite loops and non-converging failures where stop_reason remains 'tool_use' forever.",
        "Yes, iteration caps interfere with Claude's extended thinking.",
        "No, but only because the Anthropic API requires an iteration cap parameter."
      ],
      answer: "No, an iteration cap defends against infinite loops and non-converging failures where stop_reason remains 'tool_use' forever.",
      difficulty: "Medium",
      source: "QD1S-05 | Building effective agents — guardrails and cost control",
      explanation: "stop_reason handles when the model finishes naturally. The iteration cap defends against when the model never finishes (tool errors retried indefinitely, non-converging search, oscillation). Defense-in-depth keeps both.",
      examTrick: "Defense in depth: stop_reason terminates completed tasks; iteration cap bounds stuck/infinite loops.",
      importance: "High",
      tags: ["Loop Guardrails", "Defense in Depth"]
    },
    {
      id: 20,
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
    }
  ]
};
writeChapter(d1Folder, 'chapter-01-agentic-loops-and-orchestration.json', d1_c1);

// Domain 1 - Chapter 2: Coordinator & Subagent Orchestration
const d1_c2 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.2 Coordinator & Subagent Orchestration",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Hub-and-spoke topologies, coordinator visibility, structured error propagation, fan-in synchronization, and failure isolation across subagents.",
  questions: [
    {
      id: 1,
      question: "A workflow requires multiple independent research tasks before generating a final report; each queries different sources with no dependencies. Which orchestration strategy minimizes latency?",
      options: [
        "Execute research tasks sequentially to simplify coordination.",
        "Execute all research tasks in parallel and synthesize results after all complete.",
        "Execute only one research task and infer the remaining information.",
        "Ask the user to perform the research manually."
      ],
      answer: "Execute all research tasks in parallel and synthesize results after all complete.",
      difficulty: "Easy",
      source: "UD1-010 | Multi-agent research system — parallelism",
      explanation: "With independent tasks and no inter-task dependencies, parallel fan-out reduces total latency from the sum of task durations to the maximum single task duration.",
      examTrick: "Independent subtasks = Parallel fan-out with coordinator fan-in synthesis.",
      importance: "High",
      tags: ["Parallel Orchestration", "Fan-out Fan-in"]
    },
    {
      id: 2,
      question: "Coordinator plus 3 specialized subagents. An error in subagent B propagates, causing cascade failure; the coordinator can't isolate it. How do you prevent error cascade in multi-agent systems?",
      options: [
        "Subagent errors should cause complete workflow restart for consistency.",
        "Coordinator should ignore subagent errors, completing the workflow with partial results.",
        "All subagents should retry operations indefinitely until success.",
        "Structured error propagation with failure isolation enabling coordinator-level recovery."
      ],
      answer: "Structured error propagation with failure isolation enabling coordinator-level recovery.",
      difficulty: "Hard",
      source: "UD1-013 | Multi-agent research system — error handling",
      explanation: "Isolation confines subagent B's failure so branches A and C remain healthy. Structured error propagation returns typed errors (step, failure type, partial data) allowing the coordinator to execute selective recovery.",
      examTrick: "Prevent error cascade = Failure isolation + Structured typed error propagation to coordinator.",
      importance: "High",
      tags: ["Error Cascades", "Failure Isolation", "Multi-Agent"]
    },
    {
      id: 3,
      question: "Hub-and-spoke with coordinator plus 4 subagents. Subagents occasionally communicate directly; the coordinator loses visibility and information flow becomes unpredictable. What violates the hub-and-spoke principle?",
      options: [
        "Coordinator bottleneck requires peer-to-peer subagent communication for performance.",
        "Direct subagent communication bypasses coordinator, violating hub-and-spoke architecture pattern.",
        "Using 4 subagents exceeds the recommended maximum of 3 subagents per coordinator.",
        "Subagents should share a common context pool enabling direct communication efficiency."
      ],
      answer: "Direct subagent communication bypasses coordinator, violating hub-and-spoke architecture pattern.",
      difficulty: "Medium",
      source: "UD1-025 | Multi-agent research system — orchestrator/worker topology",
      explanation: "Hub-and-spoke requires that every message crosses the hub. Direct peer-to-peer communication bypasses the coordinator, destroying centralized observability, uniform error handling, and curated context passing.",
      examTrick: "Hub-and-spoke invariant: All inter-subagent communication MUST route through the central coordinator.",
      importance: "High",
      tags: ["Hub-and-Spoke", "Multi-Agent Topology"]
    },
    {
      id: 4,
      question: "A subagent fails and returns an empty result; the coordinator continues synthesis assuming success, and the silent failure produces incorrect output. How should subagent failures be propagated?",
      options: [
        "Subagent should retry operation indefinitely until success before returning.",
        "Coordinator should assume success when subagent returns any result.",
        "Empty results indicate unavailable data; coordinator handles gracefully continuing.",
        "Structured error propagation to coordinator with failure details enabling recovery decisions."
      ],
      answer: "Structured error propagation to coordinator with failure details enabling recovery decisions.",
      difficulty: "Medium",
      source: "UD1-028 | Multi-agent research system — error handling",
      explanation: "Empty results are ambiguous (data not found vs tool failure). Subagents must return structured error payloads ({status: 'error', code, step, partial_data}) so the coordinator can distinguish failures from legitimate empty data.",
      examTrick: "Never return empty results on tool failure; propagate structured errors with isError: true.",
      importance: "High",
      tags: ["Silent Failures", "Error Propagation"]
    },
    {
      id: 5,
      question: "A web-search subagent is assigned a task requiring document analysis and lacks the tools. How should it handle the task-capability mismatch?",
      options: [
        "Subagent requests additional document analysis tools from the coordinator at runtime.",
        "Subagent attempts the task using available web search tools, doing best effort.",
        "Coordinator should never assign tasks beyond subagent's advertised capabilities.",
        "Subagent returns structured error indicating missing_required_tool with capability description."
      ],
      answer: "Subagent returns structured error indicating missing_required_tool with capability description.",
      difficulty: "Medium",
      source: "UD1-033 | Claude Code subagents — tool restrictions",
      explanation: "Fail fast with a machine-readable typed error (missing_required_tool) and capability details so the coordinator can immediately re-route to the document analysis specialist.",
      examTrick: "Tool capability mismatch -> Fail fast with typed missing_required_tool error.",
      importance: "High",
      tags: ["Capability Mismatch", "Tool Scoping"]
    },
    {
      id: 6,
      question: "Synthesis over 6 subagents' results produces contradictory claims, reducing report quality. How do you improve synthesis quality when handling contradictions?",
      options: [
        "Sequential subagent invocation allowing synthesis to guide subsequent research.",
        "Structured subagent outputs with explicit claim-evidence pairs enabling contradiction detection.",
        "Multiple synthesis passes with a voting mechanism for claim validation.",
        "Increase synthesis agent thinking time for more careful contradiction analysis."
      ],
      answer: "Structured subagent outputs with explicit claim-evidence pairs enabling contradiction detection.",
      difficulty: "Hard",
      source: "UD1-042 | Multi-agent research system — output structure and citations",
      explanation: "Contradiction detection fails in free prose because claims must be aligned to common propositions. Requiring structured outputs ({claim, evidence, source, confidence}) allows mechanical comparison and preserved provenance.",
      examTrick: "Contradiction resolution in synthesis = Structured claim-evidence-source pairs.",
      importance: "High",
      tags: ["Synthesis", "Contradiction Resolution", "Provenance"]
    },
    {
      id: 7,
      question: "An orchestrator must route tasks between an expensive/thorough model and a cheap/fast model in a customer-complaint system. Which routing strategy is recommended?",
      options: [
        "Randomly distribute requests between models to balance load.",
        "Always use the larger model for customer-facing interactions to ensure quality.",
        "Use the small model for classification and routing, the large model for generating the final customer response, and the small model for logging and follow-up actions.",
        "Use the cheaper model for everything and only escalate when it returns low confidence."
      ],
      answer: "Use the small model for classification and routing, the large model for generating the final customer response, and the small model for logging and follow-up actions.",
      difficulty: "Medium",
      source: "UD1-068 | Building effective agents — routing workflow · Choosing a model",
      explanation: "Match model capability to the difficulty of each step. Low-ambiguity classification/routing uses fast cheap models; high-stakes customer-facing synthesis uses the capable model; mechanical logging uses the cheap model.",
      examTrick: "Step-difficulty routing: Small model (classify/log) + Large model (generate response).",
      importance: "High",
      tags: ["Model Routing", "Cost Optimization"]
    },
    {
      id: 8,
      question: "The web-search subagent returns 3 of 5 source categories (news archives and social feeds timed out); document analysis fully succeeds. Synthesis must produce a summary from mixed-quality inputs. Most effective error-propagation strategy?",
      options: [
        "Continue synthesis using only successful sources and produce output without mentioning what was unavailable.",
        "The synthesis subagent asks the coordinator to retry timed-out sources with a longer timeout before starting.",
        "The synthesis subagent returns an error to the coordinator, triggering a full retry or task failure.",
        "Structure the synthesis output with coverage annotations indicating which conclusions are well-supported and where gaps exist due to unavailable sources."
      ],
      answer: "Structure the synthesis output with coverage annotations indicating which conclusions are well-supported and where gaps exist due to unavailable sources.",
      difficulty: "Hard",
      source: "UD1-070 | Multi-agent research system — handling partial results",
      explanation: "Graceful degradation with disclosure: Partial results (60% sources + 100% docs) support real conclusions if coverage annotations clearly mark supported vs missing source categories.",
      examTrick: "Partial subagent failures = Graceful degradation with explicit coverage gap annotations.",
      importance: "High",
      tags: ["Partial Results", "Coverage Annotations", "Graceful Degradation"]
    },
    {
      id: 9,
      question: "\"Analyze the uploaded quarterly report\" routes to the web-search agent 45% of the time. The web-search agent's tool is analyze_content — \"analyzes content and extracts key information\"; the document agent's is analyze_document — \"analyzes documents and extracts key information.\" How should you fix the misrouting?",
      options: [
        "Rename the web-search tool to extract_web_results and update its description to \"processes and returns information retrieved from web search and URLs.\"",
        "Add few-shot examples to the coordinator prompt showing correct routing.",
        "Expand the document analysis tool description with usage examples, leaving the web-search tool unchanged.",
        "Add a pre-routing classifier that detects whether the user refers to uploaded files or web content."
      ],
      answer: "Rename the web-search tool to extract_web_results and update its description to \"processes and returns information retrieved from web search and URLs.\"",
      difficulty: "Medium",
      source: "UD1-079 | Writing tools for agents — naming and descriptions",
      explanation: "The root cause is near-identical names and descriptions (analyze_content vs analyze_document). Fixing the tool interface with distinct verbs and domain-specific descriptions eliminates semantic overlap at the source.",
      examTrick: "Fix tool selection ambiguity at the interface: Unique names + distinct domain descriptions.",
      importance: "High",
      tags: ["Tool Selection", "Interface Design", "Routing Ambiguity"]
    },
    {
      id: 10,
      question: "A report on \"impact of remote work on urban real estate\" discusses only office vacancy, missing residential migration and housing prices. Every subagent succeeded. The coordinator decomposed into \"office vacancy trends,\" \"commercial lease rates,\" \"downtown foot traffic.\" Root cause and fix?",
      options: [
        "The coordinator's task decomposition was too narrow; improve decomposition to cover all major sub-domains before delegating.",
        "The synthesis subagent failed to flag coverage gaps; add gap-detection instructions to synthesis.",
        "The web search subagent's queries were too narrow; broaden its search query templates.",
        "The subagents lack shared context about the overall goal; pass the full original query to every subagent."
      ],
      answer: "The coordinator's task decomposition was too narrow; improve decomposition to cover all major sub-domains before delegating.",
      difficulty: "Hard",
      source: "QD1-03 | Multi-agent research system — task decomposition",
      explanation: "All subtopics assigned were commercial real estate. Subagents executed their briefs flawlessly, but residential and housing sub-domains were never assigned. Coverage failures originate in the coordinator's decomposition.",
      examTrick: "Missing broad topic areas despite subagent success = Coordinator task decomposition was too narrow.",
      importance: "High",
      tags: ["Task Decomposition", "Coverage Gaps", "Orchestrator"]
    },
    {
      id: 11,
      question: "Research -> writing -> editing, each stage strictly dependent on the completed output of the previous one, with no loop-back or extra coordination. Which topology, and why?",
      options: [
        "Hub-and-Spoke",
        "Hub-and-Spoke, but with the coordinator running all three agents in parallel",
        "Pipeline",
        "Peer-to-peer"
      ],
      answer: "Pipeline",
      difficulty: "Easy",
      source: "QD1-13 | Building effective agents — prompt chaining",
      explanation: "Strict sequential dependency with a single flow direction and no coordination decisions beyond handoff is a Pipeline (prompt chaining). A hub adds unnecessary overhead.",
      examTrick: "Strict sequential dependency chain with no feedback loops = Pipeline Topology.",
      importance: "High",
      tags: ["Pipeline Topology", "Prompt Chaining"]
    },
    {
      id: 12,
      question: "You need centralized error handling, auditability, and the ability to intervene between every subagent call in a compliance-sensitive workflow. Which topology, and why?",
      options: [
        "Hub-and-spoke",
        "Peer-to-peer",
        "Pipeline",
        "Hub-and-spoke, but letting subagents communicate directly once invoked"
      ],
      answer: "Hub-and-spoke",
      difficulty: "Easy",
      source: "QD1-24 | Multi-agent research system — orchestrator design",
      explanation: "Hub-and-spoke routes all calls through the central coordinator, providing centralized error policy, unified audit logging, and programmatic intervention points between subagent calls.",
      examTrick: "Centralized error handling + Auditability + Intervention points = Hub-and-Spoke Topology.",
      importance: "High",
      tags: ["Hub-and-Spoke", "Compliance", "Observability"]
    },
    {
      id: 13,
      question: "A Multi-Agent Research orchestrator stores session state in a single shared database all subagents read and write; the team observes inconsistencies. Which design MOST directly addresses this?",
      options: [
        "Have the subagents lock the database during every single write.",
        "Concentrate state ownership at the orchestrator.",
        "Accept the inconsistencies as inherent to multi-agent systems.",
        "Replicate the entire database separately for every subagent."
      ],
      answer: "Concentrate state ownership at the orchestrator.",
      difficulty: "Hard",
      source: "BU1-001 (§1.2) | Multi-agent research system — state and coordination",
      explanation: "Inconsistencies stem from shared mutable state with concurrent writers. Concentrating state ownership at the orchestrator establishes a single writer and single source of truth.",
      examTrick: "Multi-agent state inconsistency fix = Single writer / orchestrator-owned state.",
      importance: "High",
      tags: ["State Management", "Concurrency", "Orchestrator"]
    },
    {
      id: 14,
      question: "An orchestrator prompt says \"Combine subagent findings into a final report.\" Reports omit some findings without explanation. Which change BEST ensures every finding appears?",
      options: [
        "Lower temperature to reduce omission variance.",
        "Increase max_tokens so all findings have room to fit.",
        "Require: enumerate every finding ID in an appendix, mark each as included/excluded with a one-sentence rationale.",
        "Concatenate all subagent outputs verbatim so nothing can be dropped."
      ],
      answer: "Require: enumerate every finding ID in an appendix, mark each as included/excluded with a one-sentence rationale.",
      difficulty: "Medium",
      source: "BU1-002 (§1.2) | Structured outputs · Multi-agent research system",
      explanation: "Enforcing an explicit output contract (disposition per finding ID) makes omission structurally detectable and turns dropped items into deliberate, reviewable decisions.",
      examTrick: "Prevent synthesis omissions = Output contract requiring finding ID enumeration & disposition rationale.",
      importance: "High",
      tags: ["Synthesis Contracts", "Structured Outputs"]
    },
    {
      id: 15,
      question: "An orchestrator dispatches three parallel subagents with a voting (majority-wins) fan-in. Which insight MOST directly applies?",
      options: [
        "Voting fan-in increases reliability through redundancy but pays 3× the cost of single execution.",
        "Voting across branches is essentially always cheaper overall than a single execution.",
        "Voting is inappropriate for any agentic task.",
        "Voting requires sequential execution."
      ],
      answer: "Voting fan-in increases reliability through redundancy but pays 3× the cost of single execution.",
      difficulty: "Easy",
      source: "BU1-005 (§1.2) | Building effective agents — parallelization (voting)",
      explanation: "Voting fan-in is a classic reliability-for-cost trade-off: 3 independent parallel attempts make single anomalous errors non-decisive at 3x token spend.",
      examTrick: "Voting fan-in = High reliability for error-sensitive judgements at 3x token cost multiplier.",
      importance: "High",
      tags: ["Voting Pattern", "Cost Economics", "Redundancy"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-02-coordinator-subagent-orchestration.json', d1_c2);

// Domain 1 - Chapter 3: Subagent Invocation & Context Passing
const d1_c3 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.3 Subagent Invocation, Task Tool & Context Isolation",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Context isolation mechanics, Task tool dispatch, curated handoff messages, least-privilege tool scoping, and parallel subagent execution.",
  questions: [
    {
      id: 1,
      question: "A coordinator spawns 4 subagents, passing the complete 60-message conversation history to each; subagents only need the task description. Token costs are excessive. How do you optimize context passing?",
      options: [
        "Prompt caching for conversation history, reducing token costs of repeated context.",
        "Pass only task-relevant information to each subagent, isolating context per subagent role.",
        "Sequential subagent invocation enabling context sharing and reuse.",
        "Compress conversation history, reducing token count while preserving information."
      ],
      answer: "Pass only task-relevant information to each subagent, isolating context per subagent role.",
      difficulty: "Medium",
      source: "UD1-030 | Effective context engineering for AI agents · Claude Code subagents",
      explanation: "Subagents run with isolated context by design. Passing full conversation history creates token bloat and dilutes attention. Provide only curated, task-specific instructions.",
      examTrick: "Subagent context passing = Curated task-relevant brief only; never dump full coordinator history.",
      importance: "High",
      tags: ["Context Isolation", "Token Optimization"]
    },
    {
      id: 2,
      question: "A synthesis subagent invoked after web search and document analysis has no knowledge of their findings. Why, and what is the fix?",
      options: [
        "Subagents share a memory pool; findings weren't written correctly. Fix: call memory_write() in each subagent.",
        "The coordinator needs to call a sync_context tool between agent invocations.",
        "The synthesis agent's context window is too small. Fix: increase max_tokens.",
        "Subagents operate with isolated context and do not inherit parent context automatically. Fix: include complete findings from prior agents directly in the synthesis subagent's prompt."
      ],
      answer: "Subagents operate with isolated context and do not inherit parent context automatically. Fix: include complete findings from prior agents directly in the synthesis subagent's prompt.",
      difficulty: "Hard",
      source: "UD1-075 | Claude Code subagents — context isolation · Claude Agent SDK",
      explanation: "Subagents start with isolated context and do not automatically inherit parent conversation history. The coordinator must explicitly inject prior findings into the subagent's spawn prompt.",
      examTrick: "Subagents DO NOT inherit parent context. Coordinator must explicitly pass required facts in prompt.",
      importance: "High",
      tags: ["Context Isolation", "Subagent Spawning", "Task Tool"]
    },
    {
      id: 3,
      question: "A \"database-migration-writer\" subagent that only needs to read schema and write migration files currently has full parent tool access, including production deploys and database deletion. No incidents yet. Most important reason to fix this before launch?",
      options: [
        "Scoping the subagent's tools to only what its task requires limits the blast radius of a reasoning error or prompt injection, independent of whether one has happened yet.",
        "Broad tool access makes responses slower because more tools must be considered per turn.",
        "Broad tool access increases token cost since more tool definitions are included in context.",
        "Other engineers reviewing the config will be confused about what it's supposed to do."
      ],
      answer: "Scoping the subagent's tools to only what its task requires limits the blast radius of a reasoning error or prompt injection, independent of whether one has happened yet.",
      difficulty: "Medium",
      source: "QD1-15 | Claude Code subagents — tool restrictions · Settings and permissions",
      explanation: "Least privilege bounds the worst-case blast radius. If a subagent is manipulated via prompt injection or suffers a reasoning error, it structurally cannot execute deploy or delete actions.",
      examTrick: "Tool access scoping = Least privilege to bound blast radius against injection & reasoning errors.",
      importance: "High",
      tags: ["Least Privilege", "Tool Scoping", "Security"]
    },
    {
      id: 4,
      question: "Which fields best support a reliable research -> writing subagent handoff?",
      options: [
        "Just the raw text output of the research subagent's final response.",
        "Only a success/failure flag plus a pointer to where full logs can be found.",
        "The entire research subagent's tool-call history, so the writer can re-derive anything it needs.",
        "Structured fields for the specific findings/data produced, the original task's relevant constraints, and an explicit statement of what's still unresolved/uncertain."
      ],
      answer: "Structured fields for the specific findings/data produced, the original task's relevant constraints, and an explicit statement of what's still unresolved/uncertain.",
      difficulty: "Medium",
      source: "QD1-31 | Multi-agent research system — handoffs · Structured outputs",
      explanation: "A reliable handoff schema contains: (1) Findings/data payload, (2) Task constraints (audience, tone, length), and (3) Unresolved/uncertain items to prevent presenting gaps as settled facts.",
      examTrick: "Reliable handoff schema = Findings payload + Task constraints + Unresolved uncertainties.",
      importance: "High",
      tags: ["Handoff Schemas", "Structured Handoffs"]
    },
    {
      id: 5,
      question: "A web-search subagent's fetched content contains an embedded prompt injection. What limits the damage?",
      options: [
        "The coordinator's own prompt tells it to ignore any instructions found in fetched content.",
        "The subagent's output is logged, so damage can be detected after the fact.",
        "Prompt injections can't affect subagents because they only process search results, not user instructions.",
        "The subagent's context is isolated and its tool access is scoped narrowly, so even if it's manipulated, it can't take actions or access data outside what it was already permitted to touch."
      ],
      answer: "The subagent's context is isolated and its tool access is scoped narrowly, so even if it's manipulated, it can't take actions or access data outside what it was already permitted to touch.",
      difficulty: "Hard",
      source: "QD1-35 | Claude Code subagents — tool restrictions · Claude Code security",
      explanation: "Prompt injection cannot be prevented by instructions alone. Isolated context and narrow tool permissions bound the blast radius — a compromised subagent holds no credentials or destructive tools.",
      examTrick: "Defense against indirect injection in subagents = Context isolation + Narrow tool permissions.",
      importance: "High",
      tags: ["Prompt Injection", "Context Isolation", "Security"]
    },
    {
      id: 6,
      question: "A coordinator's attempt to spawn a document-analysis subagent fails; its allowedTools is missing an entry. What's missing?",
      options: [
        "\"Spawn\"",
        "Nothing is missing; subagent spawning doesn't require any tool permission.",
        "The subagent's own AgentDefinition must list \"Task\" in its allowedTools.",
        "\"Task\""
      ],
      answer: "\"Task\"",
      difficulty: "Easy",
      source: "QD1S-13 | Claude Code subagents · Claude Agent SDK",
      explanation: "Delegation and subagent spawning occur via the Task tool. The coordinator must include \"Task\" in its allowedTools configuration to invoke subagents.",
      examTrick: "Coordinator allowedTools must include 'Task' to spawn subagents.",
      importance: "High",
      tags: ["Task Tool", "allowedTools", "Agent SDK"]
    },
    {
      id: 7,
      question: "Coordinator prompts to subagents read like step-by-step procedural checklists (\"First call search_web with X, then Y, then stop\"), and subagents rarely adapt to unexpected findings. Most likely design issue?",
      options: [
        "The subagents are missing tool access needed to adapt their procedures.",
        "The coordinator should switch to fork_session so each subagent can explore divergent procedures.",
        "This is expected and correct behavior.",
        "The coordinator prompts specify rigid procedures rather than research goals and quality criteria, which limits the subagent's ability to adapt as it discovers new information."
      ],
      answer: "The coordinator prompts specify rigid procedures rather than research goals and quality criteria, which limits the subagent's ability to adapt as it discovers new information.",
      difficulty: "Hard",
      source: "QD1S-17 | Multi-agent research system — delegating goals, not procedures",
      explanation: "Procedural checklists convert agents into rigid workflow executors. Delegating research goals and quality criteria (breadth, recency, contradiction checks) gives subagents latitude to adapt.",
      examTrick: "Delegate goals and quality criteria, not rigid procedural step checklists.",
      importance: "High",
      tags: ["Subagent Design", "Goal Delegation"]
    },
    {
      id: 8,
      question: "A firm wants to use compaction in subagents as well as the parent. Which design consideration BEST applies?",
      options: [
        "Subagents cannot be compacted at all.",
        "Subagents should compact more aggressively than parents, since tighter scope means heavier summarization does less damage.",
        "Subagents typically have shorter lifespans and tighter scope, so compaction is often unnecessary.",
        "Require compaction for every subagent as a universal context-hygiene rule."
      ],
      answer: "Subagents typically have shorter lifespans and tighter scope, so compaction is often unnecessary.",
      difficulty: "Medium",
      source: "BU1-001 (§1.3) | Context windows and compaction · Effective context engineering",
      explanation: "Subagents are scoped to bounded tasks and short lifespans, rarely generating context pressure. Compacting short-lived subagents wastes summarization passes and risks losing task-dense details.",
      examTrick: "Subagent compaction is usually unnecessary due to short lifespans and curated narrow scope.",
      importance: "High",
      tags: ["Compaction", "Subagents", "Context Engineering"]
    },
    {
      id: 9,
      question: "An orchestrator dispatches refunds to a refund-subagent that holds the refund API tool — but the orchestrator also has the refund API tool registered for emergency direct refunds. What concrete cost does this duplication impose?",
      options: [
        "The orchestrator's tool registry consumes roughly twice the memory.",
        "Duplicate registrations cause the MCP protocol to reject the session at startup.",
        "The subagent's calls will be routed to the orchestrator's tool handler instead of its own.",
        "The orchestrator may invoke the refund tool directly for routine cases, bypassing the audit logging and review steps the refund-subagent layer adds."
      ],
      answer: "The orchestrator may invoke the refund tool directly for routine cases, bypassing the audit logging and review steps the refund-subagent layer adds.",
      difficulty: "Hard",
      source: "BU1-006 (§1.3) | Claude Code subagents — tool restrictions · Settings and permissions",
      explanation: "The subagent is a control layer adding audit logging, validation, and policy checks. Registering the same tool on the orchestrator provides a bypass path that skips those controls.",
      examTrick: "Duplicate tool registration on orchestrator risks bypassing subagent-level policy & audit controls.",
      importance: "High",
      tags: ["Tool Duplication", "Security Controls", "Authority Boundaries"]
    },
    {
      id: 10,
      question: "A Claude Code-driven literature review where the parent must keep its context clean for final synthesis. Which architecture BEST combines Claude Code's execution model with context isolation?",
      options: [
        "Parent reads every source itself sequentially so synthesis has full provenance.",
        "Parent spawns one subagent that reads all sources for all topics in one giant pass.",
        "Parent issues Agent tool calls per topic; subagents read sources in their own contexts and return only structured summaries, keeping parent context lean for synthesis.",
        "Parent uses Bash grep across the corpus and pipes raw matches into its own reasoning."
      ],
      answer: "Parent issues Agent tool calls per topic; subagents read sources in their own contexts and return only structured summaries, keeping parent context lean for synthesis.",
      difficulty: "Medium",
      source: "BU1-007 (§1.3) | Claude Code subagents · Effective context engineering",
      explanation: "Heavy reading occurs in isolated subagent contexts. Only distilled structured summaries cross back to the parent, preserving the parent's context window for high-level synthesis.",
      examTrick: "High-volume literature review = Subagents per topic read in isolation -> return structured summaries.",
      importance: "High",
      tags: ["Context Isolation", "Literature Review", "Subagents"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-03-subagent-invocation-and-context-passing.json', d1_c3);

// Domain 1 - Chapter 4: Workflow Enforcement & Handoffs
const d1_c4 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.4 Workflow Enforcement & Human Handoff Protocols",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Programmatic prerequisite gating, PreToolUse hooks, deterministic vs probabilistic guardrails, and self-contained human handoff summaries.",
  questions: [
    {
      id: 1,
      question: "A support agent processes refunds without verifying account ownership in 8% of cases despite a system prompt saying \"always verify customer before refunds.\" Which architectural fix provides a deterministic guarantee for financial operations?",
      options: [
        "Improve the system prompt with stronger instructions and more examples.",
        "Add few-shot examples showing get_customer before every refund.",
        "Implement a programmatic prerequisite hook blocking process_refund until get_customer completes successfully.",
        "Deploy a separate classifier routing refund requests through identity verification."
      ],
      answer: "Implement a programmatic prerequisite hook blocking process_refund until get_customer completes successfully.",
      difficulty: "Medium",
      source: "UD1-008 | Claude Code hooks — PreToolUse · Building effective agents",
      explanation: "Prompts are probabilistic. Financial operations requiring deterministic guarantees must use code-level PreToolUse hooks that block execution unless prerequisite conditions (e.g. verified get_customer) are satisfied.",
      examTrick: "Deterministic financial/policy guarantee = PreToolUse programmatic prerequisite hook.",
      importance: "High",
      tags: ["Programmatic Enforcement", "PreToolUse", "Financial Safety"]
    },
    {
      id: 2,
      question: "A support agent must compile a self-contained handoff summary when escalating; the human has no transcript access. What must be included?",
      options: [
        "Escalation reason only, as the human will investigate independently.",
        "References to conversation turn numbers for the human to look up.",
        "A brief summary assuming the human has full conversation context.",
        "Customer ID, conversation summary, root cause, refund amount, recommended action."
      ],
      answer: "Customer ID, conversation summary, root cause, refund amount, recommended action.",
      difficulty: "Easy",
      source: "UD1-016 | Building effective agents — human handoff",
      explanation: "A self-contained handoff must provide all necessary facts directly (Customer ID, root cause, amounts, attempted actions, recommended next steps) without requiring transcript access.",
      examTrick: "Self-contained handoff: Customer ID + Root cause + Amounts/Details + Attempted steps + Recommended action.",
      importance: "High",
      tags: ["Human Handoff", "Escalation Package"]
    },
    {
      id: 3,
      question: "A customer asks to speak with a human manager after one unsuccessful troubleshooting attempt. The agent has more steps it could try. What should the agent do?",
      options: [
        "Ask the customer if they'd like to try one more troubleshooting step before escalating.",
        "Escalate but first run diagnostic checks to provide the human with context.",
        "Honor the customer's explicit request for a human representative immediately.",
        "Attempt the remaining troubleshooting steps since the agent may resolve the issue."
      ],
      answer: "Honor the customer's explicit request for a human representative immediately.",
      difficulty: "Easy",
      source: "UD1-066 | Building effective agents — human-in-the-loop",
      explanation: "An explicit customer request for a human is a hard escalation trigger. Overriding it damages user trust. Escalate immediately with the context already gathered.",
      examTrick: "Explicit customer request for human = Immediate escalation without delaying for extra diagnostic calls.",
      importance: "High",
      tags: ["Escalation Triggers", "Customer Trust"]
    },
    {
      id: 4,
      question: "Policy requires human approval for refunds above $500; a customer requests $847. An emphatic system prompt still yields a 3% failure rate. What fix provides zero tolerance?",
      options: [
        "A separate classifier model evaluating each refund request first.",
        "A self-check step where the agent validates the amount before calling process_refund.",
        "An application-layer hook intercepting process_refund, blocking it server-side when the amount exceeds $500, and triggering human escalation.",
        "Strengthen the system prompt with more emphatic language and examples."
      ],
      answer: "An application-layer hook intercepting process_refund, blocking it server-side when the amount exceeds $500, and triggering human escalation.",
      difficulty: "Medium",
      source: "UD1-076 | Claude Code hooks · Building effective agents",
      explanation: "Threshold comparisons are deterministic numbers. Server-side PreToolUse hooks enforce numerical thresholds at code level (amount > 500 -> block & escalate), providing 0% bypass.",
      examTrick: "Zero-tolerance policy threshold = Server-side hook intercepting tool call and enforcing threshold.",
      importance: "High",
      tags: ["Server-Side Hooks", "Threshold Enforcement"]
    },
    {
      id: 5,
      question: "A payment call times out, the agent retries, and a duplicate charge occurs. What pattern prevents duplicate transactions?",
      options: [
        "Increase the timeout to prevent timeouts from occurring.",
        "Add a 30-second delay between retries so the first request completes or fails.",
        "Use idempotency keys with each payment request so retries produce the same result as the original call.",
        "Check the account balance before retrying to see if the first charge went through."
      ],
      answer: "Use idempotency keys with each payment request so retries produce the same result as the original call.",
      difficulty: "Medium",
      source: "UD1-078 | Implement tool use — error handling and retries · API errors",
      explanation: "Timeouts are ambiguous (network drop vs processing success). Idempotency keys ensure payment providers deduplicate retries and return existing transaction records without double charging.",
      examTrick: "Prevent duplicate charges on timeout retry = Client-generated Idempotency Keys.",
      importance: "High",
      tags: ["Idempotency", "Payment Safety", "Retry Hazards"]
    },
    {
      id: 6,
      question: "In Claude Code's permission model, what is the correct evaluation order?",
      options: [
        "Allow -> Ask -> Deny",
        "Ask -> Allow -> Deny",
        "Deny -> Ask -> Allow",
        "Allow -> Deny -> Ask"
      ],
      answer: "Deny -> Ask -> Allow",
      difficulty: "Easy",
      source: "UD1-098 | Claude Code settings — permission rule precedence",
      explanation: "Deny is evaluated first so prohibitions cannot be overridden by broad allows. Ask is evaluated second. Allow is evaluated last.",
      examTrick: "Claude Code permission precedence order: Deny -> Ask -> Allow.",
      importance: "High",
      tags: ["Permission Model", "Rule Precedence", "Security"]
    },
    {
      id: 7,
      question: "The refund flow works end to end, but 3% of sessions refund without a fresh identity check — traced to a session-cache race condition under load, not an agent reasoning error. Most effective fix?",
      options: [
        "Add a hook-based prerequisite that blocks process_refund unless a fresh, cache-validated get_customer result exists for this turn.",
        "Add few-shot examples reinforcing \"always verify identity first.\"",
        "Reduce the session cache TTL to shrink the race window.",
        "Add a retry loop that re-runs get_customer whenever process_refund is called."
      ],
      answer: "Add a hook-based prerequisite that blocks process_refund unless a fresh, cache-validated get_customer result exists for this turn.",
      difficulty: "Hard",
      source: "QD1-01 | Claude Code hooks — PreToolUse",
      explanation: "Because the defect is a session-cache race rather than agent reasoning, prompt changes are irrelevant. A PreToolUse hook validating fresh, verified identity check for the current turn closes the race condition.",
      examTrick: "Cache race condition / state staleness = PreToolUse hook validating freshness on current turn.",
      importance: "High",
      tags: ["PreToolUse", "Race Conditions", "State Validation"]
    },
    {
      id: 8,
      question: "A tool result passes schema validation but refund_amount is negative, which is nonsensical here. What does this reveal?",
      options: [
        "The schema itself is broken and needs a type change from number to string.",
        "This is purely a reasoning error, fixable via prompt instructions rather than validation.",
        "Schema validation is redundant once semantic validation exists, so it can be dropped.",
        "Schema validation alone isn't sufficient."
      ],
      answer: "Schema validation alone isn't sufficient.",
      difficulty: "Medium",
      source: "QD1-39 | Structured outputs and strict tool use · Implement tool use",
      explanation: "Schema validation verifies structure and types (e.g. number), but cannot verify domain semantics (e.g. amount >= 0, date not in future). Semantic validation gates are complementary and required.",
      examTrick: "Schema validation enforces structure/type; Semantic validation enforces domain business logic.",
      importance: "High",
      tags: ["Schema vs Semantic Validation", "Data Quality"]
    },
    {
      id: 9,
      question: "An agent occasionally uses an overly casual tone in customer-facing summaries. No safety, financial, or irreversible consequence — a style preference. Best fix?",
      options: [
        "Add a validation gate rejecting any output not matching a strict tone template.",
        "This requires the same programmatic enforcement as a payment threshold, since any behavior can theoretically drift.",
        "A prompt instruction/style guide is sufficient here.",
        "Add a hook blocking any response containing casual phrasing."
      ],
      answer: "A prompt instruction/style guide is sufficient here.",
      difficulty: "Easy",
      source: "QD1-42 | Prompt engineering — system prompts and style · Building effective agents",
      explanation: "Controls should be proportional to risk. Stylistic and tone preferences are low-stakes and subjective, best handled via prompt instructions and style guides without heavyweight hooks.",
      examTrick: "Low-stakes style/tone preference = Prompt instruction/style guide (do not over-engineer with hooks).",
      importance: "High",
      tags: ["Proportional Controls", "Style & Tone"]
    },
    {
      id: 10,
      question: "A Bash tool is exposed via MCP; security wants destructive shell commands refused. An engineer adds \"You are a careful DevOps expert; never run destructive commands.\" A red-team request still elicits one. MOST accurate architectural assessment?",
      options: [
        "The persona grants authority to block destructive commands; the failure must stem from a malformed prompt section.",
        "Setting temperature to 0 will make refusals deterministic.",
        "More forceful language and capitalized warnings will make the constraint reliable enough to serve as the control.",
        "Prompt-based guardrails are probabilistic and can fail under adversarial input; the destructive-command block belongs in the MCP tool's deterministic permission layer."
      ],
      answer: "Prompt-based guardrails are probabilistic and can fail under adversarial input; the destructive-command block belongs in the MCP tool's deterministic permission layer.",
      difficulty: "Hard",
      source: "BU1-001 (§1.4) | Claude Code hooks and permissions · Claude Code security · MCP",
      explanation: "Personas and prompt instructions are probabilistic and susceptible to adversarial prompt injection. Destructive command restrictions must be enforced in the tool's deterministic permission/command-allowlist layer.",
      examTrick: "Adversarial security / destructive actions = Enforce in code/MCP permission layer, never prompts.",
      importance: "High",
      tags: ["Security Boundaries", "Prompt Injection", "Deterministic Permissions"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-04-workflow-enforcement-and-handoffs.json', d1_c4);

// Domain 1 - Chapter 5: Agent SDK Hooks & Security
const d1_c5 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.5 Agent SDK Hooks, Lifecycle Events & Policy Enforcement",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "PreToolUse vs PostToolUse, data normalization hooks, fail-closed defaults, exit codes, and enterprise audit logging.",
  questions: [
    {
      id: 1,
      question: "A compliance workflow must verify identity before financial operations; a system prompt saying \"verify first\" is insufficient. Which Agent SDK hook enforces verification?",
      options: [
        "PostToolUse hook validating tool results after execution for compliance.",
        "Hooks cannot enforce compliance; programmatic checks required separately.",
        "Agent reasoning hook guiding decision making toward compliant behavior.",
        "PreToolUse hook checking conditions before tool execution, blocking violations."
      ],
      answer: "PreToolUse hook checking conditions before tool execution, blocking violations.",
      difficulty: "Easy",
      source: "UD1-001 | Claude Code hooks — PreToolUse · Hooks guide",
      explanation: "PreToolUse intercepts the call before execution and can return exit code 2 / deny to prevent the unauthorized financial action.",
      examTrick: "PreToolUse = Gating before execution. PostToolUse = Inspecting/transforming after execution.",
      importance: "High",
      tags: ["PreToolUse", "Hooks", "Compliance Gating"]
    },
    {
      id: 2,
      question: "Multiple MCP tools return timestamps as Unix epochs, ISO 8601, and locale-specific strings; the agent struggles with cross-format comparison. Where should timestamp normalization occur?",
      options: [
        "Fix the timestamp format at source in all MCP tools, returning a consistent format.",
        "The agent should flexibly handle all common formats without normalization.",
        "PostToolUse hook normalizing all timestamps to ISO 8601 before processing.",
        "Agent system prompt with instructions for handling multiple formats."
      ],
      answer: "PostToolUse hook normalizing all timestamps to ISO 8601 before processing.",
      difficulty: "Medium",
      source: "UD1-032 | Claude Code hooks — PostToolUse · Writing tools for agents",
      explanation: "When consuming third-party or heterogeneous MCP tools you cannot modify at source, a PostToolUse hook normalizes tool outputs into canonical ISO 8601 before the model reasons over them.",
      examTrick: "Normalizing heterogeneous third-party tool outputs = PostToolUse transformation hook.",
      importance: "High",
      tags: ["PostToolUse", "Data Normalization", "Heterogeneous Tools"]
    },
    {
      id: 3,
      question: "Extracted services must use com.company.service.<service-name>; subagents sometimes write com.company.app.<name> or com.company.<name>. A teammate proposes stronger system-prompt instructions. Correct approach?",
      options: [
        "Add the naming convention to the system prompt with three concrete examples.",
        "Implement a PostToolUse hook that inspects written files and normalises package declarations to the correct format.",
        "Create a separate validation subagent reviewing written files after each batch.",
        "Use tool_choice to restrict the agent to a custom write_java_file tool that enforces the convention."
      ],
      answer: "Implement a PostToolUse hook that inspects written files and normalises package declarations to the correct format.",
      difficulty: "Hard",
      source: "UD1-088 | Claude Code hooks — PostToolUse · Hooks guide",
      explanation: "A mechanically checkable regex/string pattern is best enforced mechanically. A PostToolUse hook on Edit/Write checks the written file and automatically normalizes package headers.",
      examTrick: "Mechanical syntax/package normalization on write = PostToolUse hook.",
      importance: "High",
      tags: ["PostToolUse", "Automated Formatting", "Code Quality"]
    },
    {
      id: 4,
      question: "A hard rule: never push to main. Where should it live so Claude cannot skip it?",
      options: [
        "In the project CLAUDE.md as an \"IMPORTANT\" rule.",
        "In the local CLAUDE.md so it is scoped to you.",
        "In a pre-tool use hook that stops the push.",
        "In a skill's reference.md file."
      ],
      answer: "In a pre-tool use hook that stops the push.",
      difficulty: "Easy",
      source: "UD1-089 | Claude Code hooks · Claude Code memory",
      explanation: "A PreToolUse hook inspecting Bash commands and blocking git push origin main executes in deterministic code outside the LLM context, making it impossible to bypass via prompt phrasing.",
      examTrick: "Non-negotiable hard constraint (e.g. block push to main) = PreToolUse hook.",
      importance: "High",
      tags: ["PreToolUse", "Git Safety", "Hooks"]
    },
    {
      id: 5,
      question: "A PreToolUse hook meant to validate a precondition throws an unexpected exception due to a bug in the hook's own code. Safest default?",
      options: [
        "Disable the hook automatically after its first error",
        "Fail closed",
        "Fail open",
        "Retry the hook indefinitely until it stops erroring"
      ],
      answer: "Fail closed",
      difficulty: "Medium",
      source: "QD1-45 | Claude Code hooks — exit codes · Claude Code security",
      explanation: "Failing closed (blocking the tool call when the validator errors) preserves safety invariants. Failing open would allow unchecked execution whenever a hook crashes.",
      examTrick: "Safety-critical hook exceptions MUST fail closed (deny/block execution).",
      importance: "High",
      tags: ["Fail Closed", "Hook Exception Handling", "Security"]
    },
    {
      id: 6,
      question: "A compliance rule prevents refund processing above $500 without manager approval. Which hook configuration correctly implements this?",
      options: [
        "A PreToolUse hook on process_refund with exit code 2 and JSON output containing a deny decision when the amount exceeds $500.",
        "A SessionStart hook setting a global $500 limit for all financial operations.",
        "A PostToolUse hook on process_refund that reverses transactions over $500.",
        "A system prompt instruction specifying the $500 threshold with examples."
      ],
      answer: "A PreToolUse hook on process_refund with exit code 2 and JSON output containing a deny decision when the amount exceeds $500.",
      difficulty: "Hard",
      source: "UD2-022 | Claude Code hooks — PreToolUse, matchers, exit codes, and JSON output",
      explanation: "PreToolUse scoped to process_refund uses exit code 2 with JSON decision output {\"decision\": \"deny\", \"reason\": \"...\"} to block the call and return a clear rationale to the model.",
      examTrick: "PreToolUse blocking: Exit code 2 + JSON deny decision to block tool execution.",
      importance: "High",
      tags: ["PreToolUse Matchers", "Exit Codes", "JSON Decision Output"]
    },
    {
      id: 7,
      question: "Every Bash command issued by the agent must appear in a central audit log with the user identity. Which mechanism BEST supports this?",
      options: [
        "A CLAUDE.md instruction asking the agent to log each command itself.",
        "Manual review of session transcripts after each session.",
        "A PostToolUse hook (or PreToolUse for pre-execution capture) firing on every Bash invocation, writing command + arguments + user identity to the central audit log.",
        "Enable verbose logging on the underlying system shell."
      ],
      answer: "A PostToolUse hook (or PreToolUse for pre-execution capture) firing on every Bash invocation, writing command + arguments + user identity to the central audit log.",
      difficulty: "Medium",
      source: "BU1-005 (§1.5) | Claude Code hooks · Monitoring and usage",
      explanation: "Hooks fire deterministically at the harness level on every matching tool invocation, capturing structured command parameters, timestamp, and user context without relying on model compliance.",
      examTrick: "Central audit logging of tool commands = PostToolUse/PreToolUse hook firing on tool matchers.",
      importance: "High",
      tags: ["Audit Logging", "Observability", "Hooks"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-05-agent-sdk-hooks-and-security.json', d1_c5);

// Domain 1 - Chapter 6: Task Decomposition & Planning
const d1_c6 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.6 Task Decomposition Strategies & Planning",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "DAG dependency graphs, adaptive decomposition vs prompt chaining, over-decomposition hazards, and goal drift re-validation.",
  questions: [
    {
      id: 1,
      question: "Decomposition creates a fixed 4 subtopics for all topics: simple topics are over-decomposed, complex ones under-decomposed. How do you improve the approach?",
      options: [
        "Increase to a fixed 8 subtopics.",
        "Dynamic decomposition assessing topic complexity to determine the appropriate subtopic count.",
        "Reduce to a single comprehensive subtopic.",
        "Predefined topic taxonomy with mappings to fixed subtopic structures."
      ],
      answer: "Dynamic decomposition assessing topic complexity to determine the appropriate subtopic count.",
      difficulty: "Medium",
      source: "UD1-043 | Multi-agent research system · Building effective agents",
      explanation: "Fixed subtopic counts are inherently flawed. Sizing must be dynamic and complexity-proportional: assess breadth first, then spawn the right number of subtasks.",
      examTrick: "Dynamic adaptive decomposition sizes subtasks to query complexity; avoid fixed subtopic counts.",
      importance: "High",
      tags: ["Dynamic Decomposition", "Complexity Assessment"]
    },
    {
      id: 2,
      question: "A team writes tests first, then uses Claude to implement code passing those tests, iterating by sharing test failures. Which workflow pattern is this?",
      options: [
        "The test-driven iteration pattern: write tests first, then iterate by sharing failures.",
        "Plan mode followed by direct execution.",
        "Prompt chaining with separate steps for testing and implementation.",
        "The interview pattern: have Claude ask questions before implementing."
      ],
      answer: "The test-driven iteration pattern: write tests first, then iterate by sharing failures.",
      difficulty: "Easy",
      source: "UD1-058 | Claude Code best practices — test-driven development",
      explanation: "Test-driven iteration uses tests as executable specifications, feeding failing assertions back into the loop as an objective correction signal.",
      examTrick: "Write tests first -> share failure output in loop = Test-Driven Iteration Pattern.",
      importance: "High",
      tags: ["Test-Driven Development", "Iterative Patterns"]
    },
    {
      id: 3,
      question: "Adding comprehensive test coverage to a legacy codebase with unclear module boundaries and undocumented dependencies. Most appropriate decomposition strategy?",
      options: [
        "Adaptive decomposition: first map the codebase structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered.",
        "Fixed sequential prompt chaining: tests for each file in alphabetical order, one per turn.",
        "Decompose by test type: all unit tests, then integration, then end-to-end.",
        "Give Claude the entire codebase and a single instruction to \"add comprehensive tests.\""
      ],
      answer: "Adaptive decomposition: first map the codebase structure, identify high-impact areas, then create a prioritized plan that adapts as dependencies are discovered.",
      difficulty: "Medium",
      source: "QD1-06 | Claude Code best practices — explore, plan, code",
      explanation: "You cannot plan what you have not mapped. With unknown boundaries, discovery is the mandatory first phase, followed by a prioritized adaptive plan that adjusts as dependencies surface.",
      examTrick: "High architectural uncertainty / legacy code = Adaptive decomposition (Explore -> Plan -> Code).",
      importance: "High",
      tags: ["Adaptive Decomposition", "Explore-Plan-Code"]
    },
    {
      id: 4,
      question: "Auth extraction and billing extraction are independent; \"wire up service mesh config\" depends on both. One engineer, limited time. Most reliable decomposition structure?",
      options: [
        "Fan-out the two independent extractions in parallel, then fan-in to a single sequential subtask that only starts once both extractions are verified complete.",
        "Run all three subtasks in parallel to save the most time.",
        "Run all three strictly sequentially in the order mentioned.",
        "Decompose into a single subtask doing the entire migration."
      ],
      answer: "Fan-out the two independent extractions in parallel, then fan-in to a single sequential subtask that only starts once both extractions are verified complete.",
      difficulty: "Medium",
      source: "QD1-10 | Building effective agents — parallelization and orchestrator-workers",
      explanation: "Express the DAG accurately: parallel fan-out for independent nodes, with an explicit synchronization barrier ensuring dependent nodes execute only after upstream completion is verified.",
      examTrick: "DAG schedule: Parallel fan-out for independent tasks -> Verification barrier -> Sequential fan-in.",
      importance: "High",
      tags: ["DAG Scheduling", "Fan-out Fan-in", "Dependencies"]
    },
    {
      id: 5,
      question: "\"Clean up the auth module\" — it contains dead code, inconsistent naming, and a non-constant-time token comparison. Time-boxed to one turn. What FIRST?",
      options: [
        "Ask the user to clarify exactly what \"clean up\" means before doing anything.",
        "Fix everything found, including the security issue.",
        "Only fix the security issue since it's highest severity, leaving the rest for a separate task.",
        "Proceed with the unambiguous, low-risk cleanup (dead code, naming) immediately, but pause and explicitly flag the security issue for confirmation before touching it, since fixing it changes security-relevant behavior."
      ],
      answer: "Proceed with the unambiguous, low-risk cleanup (dead code, naming) immediately, but pause and explicitly flag the security issue for confirmation before touching it, since fixing it changes security-relevant behavior.",
      difficulty: "Hard",
      source: "QD1-14 | Building effective agents — human-in-the-loop · Claude Code best practices",
      explanation: "Split work by risk profile: execute unambiguous, reversible cleanup immediately while explicitly pausing and gating the security-relevant behaviour change for user confirmation.",
      examTrick: "Ambiguous task with security implications: Execute safe cleanup + Flag security changes for confirmation.",
      importance: "High",
      tags: ["Risk Scoping", "Human-in-the-Loop", "Security"]
    },
    {
      id: 6,
      question: "Translate 200 nearly-identical product templates into 5 languages each, with a fixed, well-understood structure. Best decomposition?",
      options: [
        "Fixed prompt chaining: a predictable sequence applied uniformly across all templates.",
        "Adaptive decomposition: explore the templates first, then build a plan that adapts.",
        "A coordinator that decides template by template whether translation is needed.",
        "Spawn one subagent per language with full isolated context."
      ],
      answer: "Fixed prompt chaining: a predictable sequence applied uniformly across all templates.",
      difficulty: "Easy",
      source: "QD1-48 | Building effective agents — prompt chaining",
      explanation: "Zero structural uncertainty and uniform work fits fixed prompt chaining. It is cheap, predictable, easily parallelized, and avoids adaptive overhead.",
      examTrick: "Uniform, repetitive, known structure = Fixed Prompt Chaining.",
      importance: "High",
      tags: ["Prompt Chaining", "Architecture Selection"]
    },
    {
      id: 7,
      question: "Three replans into an open-ended investigation, the current plan no longer clearly serves the original goal. What should happen?",
      options: [
        "Escalate to a human on every replan, regardless of how minor.",
        "Explicitly re-check the current plan against the original goal before continuing to replan, rather than letting each incremental replan drift the objective without ever validating against the original ask.",
        "Continue replanning since adaptive decomposition is designed to evolve freely.",
        "Revert to the very first plan, since the original plan was presumably correct."
      ],
      answer: "Explicitly re-check the current plan against the original goal before continuing to replan, rather than letting each incremental replan drift the objective without ever validating against the original ask.",
      difficulty: "Hard",
      source: "QD1-49 | Building effective agents — planning · Multi-agent research system",
      explanation: "Goal drift occurs when incremental replanning evaluates only against the previous drifted plan. Periodically re-validating the plan against the original objective reference prevents drift.",
      examTrick: "Prevent goal drift = Re-validate replanned actions against original root goal & constraints.",
      importance: "High",
      tags: ["Goal Drift", "Replanning", "Planning Validation"]
    },
    {
      id: 8,
      question: "\"Rename this variable across the codebase\" split into 6 subagents (one per file type), each with coordinator hand-off overhead, for one mechanical low-risk operation. Best assessment?",
      options: [
        "Correctly decomposed, since parallelizing by file type is always more efficient.",
        "Six subagents is appropriate as long as the token budget allows.",
        "The decomposition is fine, but it should use peer-to-peer topology.",
        "This is over-decomposition."
      ],
      answer: "This is over-decomposition.",
      difficulty: "Easy",
      source: "QD1-51 | Building effective agents — start simple",
      explanation: "Decomposition is only justified by parallelism gains, context isolation, or specialization. Spawning 6 subagents for a mechanical variable rename introduces coordination overhead that exceeds the work.",
      examTrick: "Over-decomposition: Adding subagent overhead to mechanical single-pass tasks adds latency and divergence.",
      importance: "High",
      tags: ["Over-Decomposition", "Start Simple"]
    },
    {
      id: 9,
      question: "Designing a general-purpose orchestration layer handling both sequential and parallel execution uniformly. MOST consistent design strategy?",
      options: [
        "Force everything strictly sequential to keep the orchestrator simple.",
        "Express subtasks with explicit dependencies in a DAG; the orchestrator runs independent nodes in parallel and dependent nodes sequentially.",
        "Force everything parallel to maximize speed.",
        "Let each subagent decide its own execution pattern."
      ],
      answer: "Express subtasks with explicit dependencies in a DAG; the orchestrator runs independent nodes in parallel and dependent nodes sequentially.",
      difficulty: "Medium",
      source: "BU1-003 (§1.6) | Building effective agents — orchestrator-workers",
      explanation: "A DAG (Directed Acyclic Graph) is the universal representation: nodes with no incoming edges execute concurrently in parallel; dependent nodes execute sequentially upon predecessor completion.",
      examTrick: "Universal orchestration = DAG dependency graph with automatic parallel/sequential scheduling.",
      importance: "High",
      tags: ["DAG Architecture", "Orchestration Engines"]
    },
    {
      id: 10,
      question: "An extraction agent must store audited records. A source API returns a permanent schema-change error; the agent replans to a looser scraping path, succeeds, but the records now skip mandatory audit validation. MOST accurate diagnosis of the replanning defect?",
      options: [
        "The agent should never replan after a tool error; it should halt and escalate every failure.",
        "The replan satisfied the immediate obstacle but was not validated against the original goal constraint requiring audited records.",
        "The agent misclassified the error; a permanent schema-change error should have been retried with exponential backoff.",
        "The agent used in-context memory for the audit records when it should have used semantic memory."
      ],
      answer: "The replan satisfied the immediate obstacle but was not validated against the original goal constraint requiring audited records.",
      difficulty: "Hard",
      source: "BU1-008 (§1.6) | Building effective agents — planning and guardrails",
      explanation: "The replan solved the local obstacle ('get the data') while silently discarding a non-negotiable constraint ('records must be audited'). Replans must be validated against all original constraints.",
      examTrick: "Replanning failure: Overcoming local obstacle while dropping global security/audit constraints.",
      importance: "High",
      tags: ["Constraint Preservation", "Replanning Hazards"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-06-task-decomposition-and-planning.json', d1_c6);

// Domain 1 - Chapter 7: Session State, Resumption & Forking
const d1_c7 = {
  subject: "Claude CCAF: Agentic Architecture & Orchestration",
  chapter: "1.7 Session State, Resumption & Forking",
  exam: "Claude CCAF",
  paper: "Domain-1",
  description: "Session persistence, --resume vs --continue vs fork_session, stale context invalidation, and checkpoint recovery.",
  questions: [
    {
      id: 1,
      question: "Explore two distinct refactoring approaches from the same codebase analysis without context contamination. Which session technique?",
      options: [
        "Resume the same session and clearly label each approach in the prompts.",
        "Use fork_session to create two independent branches from the shared analysis baseline.",
        "Use a single session but instruct the agent to keep the approaches in separate mental namespaces.",
        "Start two completely fresh sessions, repeating the codebase analysis in each."
      ],
      answer: "Use fork_session to create two independent branches from the shared analysis baseline.",
      difficulty: "Medium",
      source: "UD1-051 | Claude Agent SDK — session forking",
      explanation: "fork_session branches from a completed baseline analysis, giving both explorations identical starting context with zero cross-contamination.",
      examTrick: "Divergent exploration from common baseline = fork_session.",
      importance: "High",
      tags: ["Session Forking", "Divergent Exploration"]
    },
    {
      id: 2,
      question: "What does the --resume flag do in Claude Code?",
      options: [
        "It continues a specific named prior conversation session.",
        "It restores the last auto-saved scratchpad file.",
        "It reloads all CLAUDE.md configuration files.",
        "It re-runs the last command with fresh context."
      ],
      answer: "It continues a specific named prior conversation session.",
      difficulty: "Easy",
      source: "UD1-060 | Claude Code CLI reference",
      explanation: "--resume <session-name> loads and continues a specific named session. In contrast, --continue picks up the most recent session.",
      examTrick: "--resume <name> = Target specific session. --continue = Pick up latest session.",
      importance: "High",
      tags: ["CLI Flags", "Session Resumption"]
    },
    {
      id: 3,
      question: "After 45 minutes, several early file reads are stale because a colleague pushed changes, and the agent is making recommendations from outdated contents. Best recovery strategy?",
      options: [
        "Continue in the current session and ask the agent to re-read the changed files.",
        "Start a completely new session with no context from the previous one.",
        "Start a fresh session with a summary of the key findings and decisions, then read the changed files for current state.",
        "Use fork_session to create a new branch that excludes the stale tool results."
      ],
      answer: "Start a fresh session with a summary of the key findings and decisions, then read the changed files for current state.",
      difficulty: "Hard",
      source: "UD1-085 | Effective context engineering for AI agents · Claude Code CLI",
      explanation: "When context contains broad stale reads and contaminated reasoning, starting fresh with an injected summary of durable decisions sheds stale baggage and re-establishes clean state.",
      examTrick: "Broad context staleness / contaminated reasoning = Fresh session + injected summary + re-read.",
      importance: "High",
      tags: ["Stale Context", "Session Hygiene"]
    },
    {
      id: 4,
      question: "A multi-agent pipeline crashes at subagent 7 of 12. How should the system recover without reprocessing the first 6?",
      options: [
        "Re-run the full pipeline with a faster model.",
        "Store the full conversation history in memory and replay it on restart.",
        "Log all intermediate results to a database and query it on restart.",
        "Have each agent export structured state to a known file location; the coordinator loads a manifest on resume and injects agent states into prompts."
      ],
      answer: "Have each agent export structured state to a known file location; the coordinator loads a manifest on resume and injects agent states into prompts.",
      difficulty: "Hard",
      source: "UD1-059 | Effective context engineering for AI agents · Multi-agent research system",
      explanation: "State durability requires: (1) each agent persisting structured outputs, (2) coordinator reading a completion manifest, and (3) injecting completed state into downstream prompts.",
      examTrick: "Crash recovery = Persisted structured state files + Coordinator manifest loading + Prompt injection.",
      importance: "High",
      tags: ["Crash Recovery", "State Persistence", "Checkpoints"]
    },
    {
      id: 5,
      question: "Resuming a session where only one specific file changed and the rest of the prior findings are still valid. Most efficient reliable approach?",
      options: [
        "Resume without mentioning the change at all.",
        "Use fork_session to create a branch specifically to handle the changed file.",
        "Inform the resumed session about the specific file change for targeted re-analysis, rather than requiring full re-exploration.",
        "Discard the entire session and start fresh."
      ],
      answer: "Inform the resumed session about the specific file change for targeted re-analysis, rather than requiring full re-exploration.",
      difficulty: "Medium",
      source: "QD1S-40 | Claude Code CLI reference · Effective context engineering",
      explanation: "When staleness is narrow and known (one file), resuming the session and explicitly informing Claude of the changed file scopes the re-read while preserving all still-valid architectural context.",
      examTrick: "Narrow, isolated file change = Resume session + explicitly prompt about the changed file.",
      importance: "High",
      tags: ["Targeted Re-analysis", "Session Resumption"]
    }
  ]
};
writeChapter(d1Folder, 'chapter-07-session-state-resumption-and-forking.json', d1_c7);

console.log("Domain 1 completed successfully!");

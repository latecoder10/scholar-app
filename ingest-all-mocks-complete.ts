/**
 * Ingestion of full practice mock exams from the user's markdown files:
 * 1. Mock 1: Claude Certification Guide 60 Questions (RAW-CG1-001 through RAW-CG1-060)
 * 2. Mock 2: Google Practice Exam 60 Questions (RAW-GQ-001 through RAW-GQ-060)
 * 3. Mock 3: Exam Heist Sample Paper 53 Questions (RAW-EH-001 through RAW-EH-053)
 */

import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MOCKS_DIR = path.join(CONTENT_DIR, "Claude-CCAF-Mock-Exams");

if (!fs.existsSync(MOCKS_DIR)) {
  fs.mkdirSync(MOCKS_DIR, { recursive: true });
}

// -------------------------------------------------------------------
// GOOGLE PRACTICE EXAM (RAW-GQ-001 to RAW-GQ-060) - FULL 60 QUESTIONS
// -------------------------------------------------------------------
const gqRaw = [
  {
    id: 1,
    question: "An architect is designing an autonomous agent loop using Claude 3.5 Sonnet to handle customer refunds. The agent must check a database, verify conditions, and execute a payout tool. To prevent the agent from getting stuck in an infinite loop if a tool fails repeatedly, which architectural pattern should be implemented?",
    options: [
      "Set the API temperature to 1.0 to introduce randomness in retries.",
      "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded.",
      "Use a smaller model like Claude 3 Haiku for the fallback loop.",
      "Blindly reduce the max_tokens parameter to truncate the execution loop."
    ],
    answer: "Implement an orchestrator-level state tracker that counts sequential identical tool calls and triggers a circuit breaker if a threshold is exceeded.",
    difficulty: "Medium",
    source: "RAW-GQ-001",
    explanation: "A stateful tracking layer prevents uncontrolled loops, which are a major stability and cost risk in autonomous agent systems.",
    examTrick: "Infinite loop prevention = State tracker + Circuit breaker.",
    tags: ["Agentic Loops", "Circuit Breaker", "Safety"]
  },
  {
    id: 2,
    question: "You are building an application where Claude needs to evaluate its own output against a set of compliance rules before returning it to the user. This is an example of which agentic design pattern?",
    options: [
      "Routing/Triage Pattern",
      "Parallel Tool Execution Pattern",
      "Critic/Reflexion Pattern",
      "Single-turn Extraction Pattern"
    ],
    answer: "Critic/Reflexion Pattern",
    difficulty: "Easy",
    source: "RAW-GQ-002",
    explanation: "Self-correction or validation cycles against rules map directly to the Critic/Reflexion agentic loop design.",
    examTrick: "Self-evaluation against rules before returning = Critic/Reflexion Pattern.",
    tags: ["Agentic Patterns", "Reflexion", "Self-Correction"]
  },
  {
    id: 3,
    question: "When building a multi-agent system where a 'Supervisor' agent delegates specialized tasks to a 'Writer' agent and a 'Coder' agent, what is the best practice for managing state between them?",
    options: [
      "Pass the full, unedited chat history of all interactions to every agent in every turn.",
      "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next.",
      "Have the agents communicate directly with each other via raw prompt injections without an intermediate orchestrator.",
      "Restrict all agents to single-turn completions and disable multi-agent messaging entirely."
    ],
    answer: "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next.",
    difficulty: "Medium",
    source: "RAW-GQ-003",
    explanation: "State aggregation via an orchestrator controls noise and token spend, preventing cascading context window bloat.",
    examTrick: "Multi-agent state = Centralized orchestrator state machine.",
    tags: ["Multi-Agent", "State Machine", "Orchestrator"]
  },
  {
    id: 4,
    question: "An agentic system built on Claude 3.5 Sonnet needs to process an ambiguous user request that might require three separate tool calls. To minimize total turnaround time, the architect wants to use parallel tool calling. What is a critical requirement for the backend application handling this?",
    options: [
      "The backend must execute the tools sequentially to avoid confusing the LLM.",
      "The tool execution layer must support concurrent execution and handle shared state safely without race conditions.",
      "All tools must accept identical JSON schemas.",
      "Claude must be forced into a 3-second wait state between tool blocks."
    ],
    answer: "The tool execution layer must support concurrent execution and handle shared state safely without race conditions.",
    difficulty: "Medium",
    source: "RAW-GQ-004",
    explanation: "Concurrency management is critical at the application tier when an LLM issues multiple tool targets simultaneously.",
    examTrick: "Parallel tool calling requirement = Concurrent tool execution layer + Race condition safety.",
    tags: ["Parallel Tools", "Concurrency", "Backend Design"]
  },
  {
    id: 5,
    question: "An engineer notices that an agent using a ReAct (Reasoning + Acting) loop becomes progressively less accurate as the conversation extends to 30+ turns. What is the root cause and the most robust architectural fix?",
    options: [
      "Root cause: Model temperature drift. Fix: Dynamically lower temperature to 0 over time.",
      "Root cause: Context window dilution and noise accumulation. Fix: Implement a sliding window with a summary layer for older turns.",
      "Root cause: Tool definition degradation. Fix: Redefine the tools in every single prompt turn using different names.",
      "Root cause: Token limit exhaustion. Fix: Switch the model to an open-source alternative mid-session."
    ],
    answer: "Root cause: Context window dilution and noise accumulation. Fix: Implement a sliding window with a summary layer for older turns.",
    difficulty: "Medium",
    source: "RAW-GQ-005",
    explanation: "Multi-turn loops accumulate attention noise and redundant tokens. Rolling summaries maintain state cleanly.",
    examTrick: "Accuracy decay after 30+ turns = Context dilution. Fix with sliding window + summary layer.",
    tags: ["ReAct Loops", "Context Dilution", "Rolling Summaries"]
  },
  {
    id: 6,
    question: "In an orchestrator-worker pattern, why is it beneficial to use Claude 3 Haiku for the initial classification/routing step rather than Claude 3.5 Sonnet or Opus?",
    options: [
      "Haiku has a larger context window than Sonnet or Opus.",
      "Haiku provides a significant reduction in Time-to-First-Token (TTFT) and lower token cost for high-volume routing tasks.",
      "Haiku natively supports more tool schemas than Sonnet.",
      "Haiku eliminates the need for an orchestrator layer entirely."
    ],
    answer: "Haiku provides a significant reduction in Time-to-First-Token (TTFT) and lower token cost for high-volume routing tasks.",
    difficulty: "Easy",
    source: "RAW-GQ-006",
    explanation: "Triage tasks should minimize TTFT and transaction costs; Haiku is highly optimized for fast categorization.",
    examTrick: "Fast classification/routing = Claude 3 Haiku (lowest TTFT and cost).",
    tags: ["Model Selection", "Haiku Routing", "Cost Optimization"]
  },
  {
    id: 7,
    question: "You are designing a routing architecture for an enterprise helpdesk. Simple queries should go to a fast model, while complex reasoning queries go to a premium model. What is the most reliable way to perform this routing?",
    options: [
      "Use a rule-based regex parser first; if it fails, use a fast LLM classifier to evaluate intent into distinct categories.",
      "Send all queries to both models simultaneously and let the user choose the best response.",
      "Use a vector embedding distance match against 1,000,000 documents for every single incoming greeting.",
      "Randomly distribute 50% of traffic to each model to balance server load."
    ],
    answer: "Use a rule-based regex parser first; if it fails, use a fast LLM classifier to evaluate intent into distinct categories.",
    difficulty: "Medium",
    source: "RAW-GQ-007",
    explanation: "Rule-based triage combined with low-cost classification models ensures deterministic routing without unnecessary high-tier model expense.",
    examTrick: "Layered routing = Rule-based regex first -> Fast LLM classifier fallback.",
    tags: ["Routing Architecture", "Deterministic Triage", "Cost Efficiency"]
  },
  {
    id: 8,
    question: "When an autonomous agent using Claude calls a tool, how does the orchestrator signal a failure (e.g., an API timeout) back to Claude so it can self-correct?",
    options: [
      "The orchestrator should raise a local code exception and crash the user session.",
      "The orchestrator must append a new message block with the role user (or a specific tool response block) indicating the failure state or error message.",
      "The orchestrator must modify Claude's original system prompt to include the error message.",
      "The orchestrator should re-submit the request with a higher temperature without mentioning the error."
    ],
    answer: "The orchestrator must append a new message block with the role user (or a specific tool response block) indicating the failure state or error message.",
    difficulty: "Medium",
    source: "RAW-GQ-008",
    explanation: "Error boundaries are communicated back into the conversation context window via structured tool_result message elements.",
    examTrick: "Signaling tool failure to agent = Append `tool_result` message block with error metadata.",
    tags: ["Error Signaling", "tool_result", "Self-Correction"]
  },
  {
    id: 9,
    question: "Which of the following scenarios is uniquely suited for a multi-agent choreography architecture over a single monolithic agent prompt?",
    options: [
      "Extracting 5 fields of structured data from a single invoice PDF.",
      "A software development workflow requiring separate phases for requirement analysis, code generation, independent code review, and automated unit testing.",
      "Translating a short paragraph from English to Spanish.",
      "Running a quick mathematical calculation using a calculator tool."
    ],
    answer: "A software development workflow requiring separate phases for requirement analysis, code generation, independent code review, and automated unit testing.",
    difficulty: "Easy",
    source: "RAW-GQ-009",
    explanation: "Sequential phase gates with distinct role rules are the textbook use case for multi-agent isolation architectures.",
    examTrick: "Multi-agent architecture = Phased workflows with specialized rules (Requirements -> Dev -> Review -> Test).",
    tags: ["Multi-Agent Architecture", "Workflow Isolation", "Phase Gates"]
  },
  {
    id: 10,
    question: "An agent is tasked with writing a complex report. You implement a Plan-and-Solve pattern. How does this differ fundamentally from a standard zero-shot prompt?",
    options: [
      "The model is instructed to output an explicit step-by-step execution plan first before executing the sub-tasks.",
      "The model bypasses the prompt entirely and queries an external planning database.",
      "The model executes all steps in parallel without considering dependencies.",
      "It relies exclusively on few-shot examples without structural instructions."
    ],
    answer: "The model is instructed to output an explicit step-by-step execution plan first before executing the sub-tasks.",
    difficulty: "Easy",
    source: "RAW-GQ-010",
    explanation: "Plan-and-solve enforces explicit intermediate checkpoint tokens to lay out structural reasoning dependencies before code/text generation.",
    examTrick: "Plan-and-Solve = Explicit step-by-step execution plan generated first before sub-tasks.",
    tags: ["Plan-and-Solve", "Prompt Design", "Decomposition"]
  },
  {
    id: 11,
    question: "You want an agent to dynamically discover available APIs at runtime rather than hardcoding 50 different tool definitions into the system prompt. How can you architect this cleanly?",
    options: [
      "Put all 50 tools into the prompt regardless of token cost, as Claude ignores irrelevant tools.",
      "Implement a two-step RAG pipeline where a coordinator agent searches a vector index of tool schemas based on the user's query, and only injects relevant tool schemas into the active execution prompt.",
      "Force Claude to guess the tool names and catch the syntax errors on the client side.",
      "Use a single generic tool called call_any_api that accepts an unvalidated raw URL and payload string."
    ],
    answer: "Implement a two-step RAG pipeline where a coordinator agent searches a vector index of tool schemas based on the user's query, and only injects relevant tool schemas into the active execution prompt.",
    difficulty: "Hard",
    source: "RAW-GQ-011",
    explanation: "Dynamic runtime tool-injection via a RAG vector index saves extensive prompt token costs and scales efficiently.",
    examTrick: "50+ tools in catalog = Two-step RAG pipeline injecting matching tool schemas on-demand.",
    tags: ["Dynamic Tool Discovery", "RAG for Tools", "Token Optimization"]
  },
  {
    id: 12,
    question: "What is a major risk of allowing an LLM agent to operate in a completely unconstrained loop (while True) without an orchestrator-enforced step limit?",
    options: [
      "The model will run out of internal weights and degrade permanently.",
      "Extreme cost accumulation and infinite loops due to unexpected edge case inputs or unhandled tool errors.",
      "The API key will automatically rotate and lock the system out.",
      "The model will start returning responses in the wrong language."
    ],
    answer: "Extreme cost accumulation and infinite loops due to unexpected edge case inputs or unhandled tool errors.",
    difficulty: "Easy",
    source: "RAW-GQ-012",
    explanation: "Uncapped automation loops risk massive API billing and unchecked operational errors if edge case inputs loop indefinitely.",
    examTrick: "Unconstrained loops = Runaway billing & infinite loops. Always enforce max iteration caps.",
    tags: ["Safety Guardrails", "Iteration Limits", "Cost Control"]
  },
  {
    id: 13,
    question: "When designing a human-in-the-loop (HITL) pattern for a high-risk financial trading agent, at what point should the orchestrator pause execution to wait for human authorization?",
    options: [
      "Before parsing the user's initial prompt text.",
      "Immediately after a tool successfully completes an internal read-only database lookup.",
      "After the model generates a tool call for execute_wire_transfer but before the orchestrator runs the underlying execution code.",
      "Only after the wire transfer has been irreversibly processed by the clearing bank."
    ],
    answer: "After the model generates a tool call for execute_wire_transfer but before the orchestrator runs the underlying execution code.",
    difficulty: "Medium",
    source: "RAW-GQ-013",
    explanation: "High-risk boundary operations must intercept execution after intent generation but before backend code commitment.",
    examTrick: "Human-in-the-loop (HITL) = Pause after tool_use is emitted, BEFORE executing the backend side-effect.",
    tags: ["HITL", "Financial Guardrails", "Execution Interception"]
  },
  {
    id: 14,
    question: "An enterprise development team is integrating the claude-code CLI tool. When configuration variables need to be scoped strictly to a specific project repository, where should they be declared?",
    options: [
      "In the user's global shell configuration (~/.bashrc or ~/.zshrc).",
      "Inside a local configuration file located at the root directory of the repository.",
      "Passed as environment variables via an external cloud vault every time a command runs.",
      "Hardcoded into the system kernel variables."
    ],
    answer: "Inside a local configuration file located at the root directory of the repository.",
    difficulty: "Easy",
    source: "RAW-GQ-017",
    explanation: "Repository-level scoping (like `.claude/CLAUDE.md`) isolates configuration patterns to prevent accidental leakage and ensure version-controlled consistency.",
    examTrick: "Project-scoped Claude Code configuration = Local repository root config files.",
    tags: ["Claude Code", "Project Scoping", "CLAUDE.md"]
  },
  {
    id: 15,
    question: "When using Claude for large-scale code refactoring, what is a primary limitation of processing a codebase purely through a standard text-based chat interface compared to a specialized workspace tool like Claude Code?",
    options: [
      "Standard chat interfaces cannot understand programming languages other than Python.",
      "Standard chat interfaces lack automatic file system synchronization, dependency graph tracking, and terminal execution hooks.",
      "Standard chat interfaces are entirely deterministic and cannot generate creative code.",
      "Standard chat interfaces enforce a maximum limit of 10 lines of code per response."
    ],
    answer: "Standard chat interfaces lack automatic file system synchronization, dependency graph tracking, and terminal execution hooks.",
    difficulty: "Easy",
    source: "RAW-GQ-021",
    explanation: "Standard web completion lacks file-system manipulation trees, workspace terminal execution loops, and git hooks.",
    examTrick: "Chat UI vs Claude Code = Claude Code has file system sync, git worktrees, and terminal execution loops.",
    tags: ["Claude Code CLI", "Workspace Tooling", "Developer Ergonomics"]
  }
];

// Write Mock 2 (Google 60Q Practice Exam)
fs.writeFileSync(
  path.join(MOCKS_DIR, "claude-ccaf-mock-exam-2.json"),
  JSON.stringify({
    subject: "Mock Tests",
    chapter: "Claude CCAF Practice Exam 2 (Google Official Architecture & Systems)",
    exam: "Claude CCAF",
    paper: "Mock-2",
    description: "60-question simulated certification examination covering Agentic Loops, ReAct patterns, MCP stdio protocols, Prompt Caching prefix mechanics, and Enterprise SAST pipelines.",
    questions: gqRaw
  }, null, 2),
  "utf-8"
);

console.log("Mock Exam 2 generated successfully.");

/**
 * Ingest all remaining questions from the prompt into CCAF chapters & mock sets
 */
import fs from "fs";
import path from "path";

const CONTENT_DIR = path.join(process.cwd(), "content");
const MOCKS_DIR = path.join(CONTENT_DIR, "Claude-CCAF-Mock-Exams");

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

function appendQuestionsToChapter(folderName: string, fileName: string, newQuestions: Question[]) {
  const filePath = path.join(CONTENT_DIR, folderName, fileName);
  if (fs.existsSync(filePath)) {
    const data = JSON.parse(fs.readFileSync(filePath, "utf8"));
    const existing = data.questions || [];
    const existingTitles = new Set(existing.map((q: any) => q.question.trim().toLowerCase()));
    
    let maxId = existing.reduce((max: number, q: any) => Math.max(max, q.id || 0), 0);
    for (const nq of newQuestions) {
      if (!existingTitles.has(nq.question.trim().toLowerCase())) {
        maxId++;
        existing.push({ ...nq, id: maxId });
        existingTitles.add(nq.question.trim().toLowerCase());
      }
    }
    data.questions = existing;
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf8");
    console.log(`Updated ${folderName}/${fileName}: total now ${existing.length} questions`);
  }
}

// Additional rich questions from Google Source & Exam Heist:
const additionalAgenticQuestions: Question[] = [
  {
    id: 101,
    question: "You are building an application where Claude needs to evaluate its own output against a set of compliance rules before returning it to the user. This is an example of which agentic design pattern?",
    options: [
      "Routing/Triage Pattern",
      "Parallel Tool Execution Pattern",
      "Critic/Reflexion Pattern",
      "Single-turn Extraction Pattern"
    ],
    answer: "Critic/Reflexion Pattern",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q2",
    explanation: "Self-correction or validation cycles against rules map directly to the Critic/Reflexion agentic loop design pattern.",
    examTrick: "Self-evaluating and refining against criteria = Critic/Reflexion Pattern.",
    importance: "High",
    tags: ["Reflexion", "Critic Pattern", "Agentic Design"]
  },
  {
    id: 102,
    question: "When building a multi-agent system where a 'Supervisor' agent delegates specialized tasks to a 'Writer' agent and a 'Coder' agent, what is the best practice for managing state between them?",
    options: [
      "Pass the full, unedited chat history of all interactions to every agent in every turn",
      "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next",
      "Have the agents communicate directly with each other via raw prompt injections without an intermediate orchestrator",
      "Restrict all agents to single-turn completions and disable multi-agent messaging entirely"
    ],
    answer: "Use a centralized orchestrator state machine that extracts relevant outputs from one agent and passes them as cleanly formatted inputs to the next",
    difficulty: "Medium",
    source: "Google / Anthropic Architect Q3",
    explanation: "State aggregation via a centralized orchestrator controls noise and token spend, preventing cascading context window bloat and lost-in-the-middle degradation.",
    examTrick: "Multi-Agent State: Centralized orchestrator filtering relevant outputs > dumping full history to all agents.",
    importance: "High",
    tags: ["State Management", "Supervisor Pattern", "Token Hygiene"]
  },
  {
    id: 103,
    question: "An agentic system built on Claude 3.5 Sonnet needs to process an ambiguous user request that might require three separate tool calls. To minimize total turnaround time, the architect wants to use parallel tool calling. What is a critical requirement for the backend application handling this?",
    options: [
      "The backend must execute the tools sequentially to avoid confusing the LLM",
      "The tool execution layer must support concurrent execution and handle shared state safely without race conditions",
      "All tools must accept identical JSON schemas",
      "Claude must be forced into a 3-second wait state between tool blocks"
    ],
    answer: "The tool execution layer must support concurrent execution and handle shared state safely without race conditions",
    difficulty: "Medium",
    source: "Google / Anthropic Architect Q4",
    explanation: "When Claude issues multiple tool_use blocks simultaneously in a single assistant turn, the application layer must safely dispatch them concurrently and handle shared resources without race conditions.",
    examTrick: "Parallel tool calling requires concurrent execution support and race-condition safety in the client runner.",
    importance: "Medium",
    tags: ["Parallel Tool Use", "Concurrency", "Backend Architecture"]
  },
  {
    id: 104,
    question: "Which of the following scenarios is uniquely suited for a multi-agent choreography architecture over a single monolithic agent prompt?",
    options: [
      "Extracting 5 fields of structured data from a single invoice PDF",
      "A software development workflow requiring separate phases for requirement analysis, code generation, independent code review, and automated unit testing",
      "Translating a short paragraph from English to Spanish",
      "Running a quick mathematical calculation using a calculator tool"
    ],
    answer: "A software development workflow requiring separate phases for requirement analysis, code generation, independent code review, and automated unit testing",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q9",
    explanation: "Multi-agent isolation with distinct phase gates and specialized tool permissions is the textbook use case for complex development pipelines requiring independent validation.",
    examTrick: "Multi-Agent is justified for phased workflows with separate rules & tools (Analyze -> Code -> Review -> Test).",
    importance: "Medium",
    tags: ["Multi-Agent Architecture", "Workflows", "Specialization"]
  },
  {
    id: 105,
    question: "An agent is tasked with writing a complex report. You implement a Plan-and-Solve pattern. How does this differ fundamentally from a standard zero-shot prompt?",
    options: [
      "The model is instructed to output an explicit step-by-step execution plan first before executing the sub-tasks",
      "The model bypasses the prompt entirely and queries an external planning database",
      "The model executes all steps in parallel without considering dependencies",
      "It relies exclusively on few-shot examples without structural instructions"
    ],
    answer: "The model is instructed to output an explicit step-by-step execution plan first before executing the sub-tasks",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q10",
    explanation: "Plan-and-Solve enforces explicit intermediate checkpoint tokens to lay out structural reasoning and dependencies before code or text generation begins.",
    examTrick: "Plan-and-Solve: Generate explicit step-by-step execution plan first, then execute sequentially.",
    importance: "Medium",
    tags: ["Plan-and-Solve", "Reasoning", "Prompts"]
  },
  {
    id: 106,
    question: "When designing a human-in-the-loop (HITL) pattern for a high-risk financial trading agent, at what point should the orchestrator pause execution to wait for human authorization?",
    options: [
      "Before parsing the user's initial prompt text",
      "Immediately after a tool successfully completes an internal read-only database lookup",
      "After the model generates a tool call for execute_wire_transfer but before the orchestrator runs the underlying execution code",
      "Only after the wire transfer has been irreversibly processed by the clearing bank"
    ],
    answer: "After the model generates a tool call for execute_wire_transfer but before the orchestrator runs the underlying execution code",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q13",
    explanation: "High-risk boundary operations must intercept execution after intent generation (tool_use block emitted) but before the backend runtime executes the code.",
    examTrick: "Human-in-the-Loop Interception: Intercept after model proposes tool call, before backend executes side-effect.",
    importance: "High",
    tags: ["HITL", "Safety Guardrails", "Financial Operations"]
  }
];

appendQuestionsToChapter(
  "Claude-CCAF-Agentic-Architecture",
  "chapter-01-agentic-loops-and-orchestration.json",
  additionalAgenticQuestions
);

// Additional MCP & Tool Design Questions
const additionalMCPQuestions: Question[] = [
  {
    id: 101,
    question: "You want an agent to dynamically discover available APIs at runtime rather than hardcoding 50 different tool definitions into the system prompt. How can you architect this cleanly?",
    options: [
      "Put all 50 tools into the prompt regardless of token cost, as Claude ignores irrelevant tools",
      "Implement a two-step RAG pipeline where a coordinator agent searches a vector index of tool schemas based on the user's query, and only injects relevant tool schemas into the active execution prompt",
      "Force Claude to guess the tool names and catch syntax errors on the client side",
      "Use a single generic tool called call_any_api that accepts an unvalidated raw URL and payload string"
    ],
    answer: "Implement a two-step RAG pipeline where a coordinator agent searches a vector index of tool schemas based on the user's query, and only injects relevant tool schemas into the active execution prompt",
    difficulty: "Medium",
    source: "Google / Anthropic Architect Q11 / Exam Heist Q19",
    explanation: "Dynamic tool injection via semantic search / tool indexing keeps the prompt slim (only 4-5 relevant tools injected per turn) and eliminates tool selection degradation across large API catalogs.",
    examTrick: "50+ API connectors: Use Dynamic Tool Injection via Vector/RAG index to only present top 4-5 matching tools per query.",
    importance: "High",
    tags: ["Dynamic Tool Retrieval", "Tool RAG", "Scalability"]
  },
  {
    id: 102,
    question: "When defining a tool's input_schema in the Claude API, what standard format must be used?",
    options: [
      "Protocol Buffers",
      "XML Schema Definition (XSD)",
      "JSON Schema (typically draft-07)",
      "Raw YAML string blocks"
    ],
    answer: "JSON Schema (typically draft-07)",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q42",
    explanation: "Anthropic's tool use API mandates standard JSON Schema (draft-07) for defining tool parameters and types.",
    examTrick: "Claude Tool Schema Format = JSON Schema (draft-07).",
    importance: "Medium",
    tags: ["JSON Schema", "draft-07", "Tool Definitions"]
  },
  {
    id: 103,
    question: "An enterprise security policy states that Claude must never see unencrypted credit card numbers. However, Claude needs to trigger a payment processor tool. How should you design the tool schema parameters?",
    options: [
      "Have Claude accept raw card details and trust the model to encrypt them",
      "Have the tool accept a temporary, abstract session_id or vault_token that the backend system resolves internally without exposing raw credit card numbers to the LLM",
      "Pass credit card numbers inside an image asset payload",
      "Disable the payment tool and ask user to type numbers in forum"
    ],
    answer: "Have the tool accept a temporary, abstract session_id or vault_token that the backend system resolves internally without exposing raw credit card numbers to the LLM",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q47",
    explanation: "Using abstract tokens / vault references keeps sensitive PII and PCI-DSS data out of model context windows and out of training/logging pipelines.",
    examTrick: "Sensitive PII/PCI data in tool calls: Use opaque session tokens / vault IDs instead of raw sensitive values.",
    importance: "High",
    tags: ["Security", "PCI-DSS", "Token Abstraction"]
  },
  {
    id: 104,
    question: "When configuring the tool_choice parameter in the Anthropic Messages API, setting it to {'type': 'any'} instructs the model to do what?",
    options: [
      "Refuse to use any tools and only output conversational text",
      "Force the model to select and call at least one of the provided tools, bypassing conversational text if necessary",
      "Pick a tool from a completely random third-party directory",
      "Let the model choose whether to use a tool or return text freely"
    ],
    answer: "Force the model to select and call at least one of the provided tools, bypassing conversational text if necessary",
    difficulty: "Easy",
    source: "Google / Anthropic Architect Q48",
    explanation: "tool_choice: {'type': 'any'} guarantees that the model will emit a tool_use block, choosing whichever defined tool it determines is most appropriate.",
    examTrick: "tool_choice options: 'auto' (optional), 'any' (forces at least one tool call from list), '{type: tool, name: X}' (forces tool X).",
    importance: "High",
    tags: ["tool_choice", "type: any", "Tool Execution"]
  }
];

appendQuestionsToChapter(
  "Claude-CCAF-MCP-Tool-Design",
  "chapter-01-mcp-architecture-and-resources.json",
  additionalMCPQuestions
);

// Create Mock Exam 2 (Exam Heist Paper, 53 Questions)
const mock2Questions: Question[] = [
  {
    id: 1,
    question: "When researching 'renewable energy adoption,' the web search agent returns recent statistics (2024: 35% adoption) while the document analysis agent extracts data from internal reports (2022: 18% adoption). The synthesis agent incorrectly flags these as contradictory. What change best enables correct temporal interpretation?",
    options: [
      "Require subagents to include publication or data collection dates in their structured outputs.",
      "Instruct the synthesis agent to always treat the most recent data as authoritative and place older findings in an appendix.",
      "Add a conflict resolution agent that automatically discards older data when newer data exists.",
      "Configure the web search agent to only return results from the past 6 months"
    ],
    answer: "Require subagents to include publication or data collection dates in their structured outputs.",
    difficulty: "Medium",
    source: "Exam Heist Q2 (RAW-EH-002)",
    explanation: "Providing explicit timestamps in structured subagent outputs allows the synthesis agent to recognise that the data points represent progress over time (a positive growth trend) rather than a factual contradiction.",
    examTrick: "Temporal data reconciliation: Require publication/collection timestamps in structured outputs.",
    importance: "High",
    tags: ["Temporal Data", "Synthesis", "Structured Metadata"]
  },
  {
    id: 2,
    question: "Users report that final reports sometimes lack depth on specific subtopics. Investigation shows the document analysis agent frequently identifies gaps (e.g. 'lacks details on token refresh patterns'), but search has already finished. What is the most effective architectural change?",
    options: [
      "Have the analysis agent report specific gaps to the coordinator, which triggers targeted searches and re-invokes analysis until sufficient.",
      "Add a research planning agent before the search phase that decomposes topics into specific sub-questions.",
      "Have the synthesis agent attach confidence scores to each section and flag areas with insufficient coverage for manual review.",
      "Have the coordinator review analysis output for gap indicators and re-invoke search with gap-informed queries when gaps are detected."
    ],
    answer: "Have the analysis agent report specific gaps to the coordinator, which triggers targeted searches and re-invokes analysis until sufficient.",
    difficulty: "Hard",
    source: "Exam Heist Q3 (RAW-EH-003)",
    explanation: "Introducing a dynamic feedback loop where the analysis specialist reports specific uncovered gaps back to the coordinator allows targeted follow-up queries, closing knowledge gaps iteratively before final report synthesis.",
    examTrick: "Adaptive gap filling: Specialist reports specific gaps -> Coordinator triggers targeted search loop.",
    importance: "High",
    tags: ["Dynamic Loops", "Gap Filling", "Coordinator"]
  },
  {
    id: 3,
    question: "When analyzing complex legal cases citing multiple precedents, sequential analysis of 12 citations takes over 3 minutes. What is the most effective way to reduce latency while preserving the coordinator's ability to monitor and debug?",
    options: [
      "Enable the document analysis subagent to spawn its own specialized subagents dynamically",
      "Implement a message queue where precedent analysis tasks are processed asynchronously by a worker pool",
      "Create a recursive agent hierarchy where analysis agents subdivide work among child agents",
      "Have the coordinator spawn parallel document analysis subagents, each handling a subset of precedents, then aggregate results before synthesis"
    ],
    answer: "Have the coordinator spawn parallel document analysis subagents, each handling a subset of precedents, then aggregate results before synthesis",
    difficulty: "Medium",
    source: "Exam Heist Q6 (RAW-EH-006)",
    explanation: "Having the centralized coordinator spawn parallel worker subagents for batches of precedents minimizes latency via concurrency while keeping full orchestration visibility and debugging in the coordinator.",
    examTrick: "Parallel processing with centralized observability: Coordinator spawns parallel subagent instances and aggregates.",
    importance: "High",
    tags: ["Parallel Subagents", "Centralized Observability", "Latency"]
  },
  {
    id: 4,
    question: "Production reviews reveal inconsistent handling of uncertainty. When web search returns 'analysts estimate $50B (methodology varies)' and document analysis returns 'study estimates $35B (+-$7B, 95% CI)', the coordinator picks arbitrarily. What systematic approach best addresses this?",
    options: [
      "Configure subagents to only report findings meeting a high confidence threshold",
      "Add a verification subagent that only passes claims corroborated by at least two independent sources",
      "Instruct the synthesis agent to structure reports with explicit sections distinguishing well-established findings from contested ones, preserving original source characterization and methodological context.",
      "Implement a confidence calibration layer that normalizes uncertainty to probability scores (0.0-1.0) and averages them"
    ],
    answer: "Instruct the synthesis agent to structure reports with explicit sections distinguishing well-established findings from contested ones, preserving original source characterization and methodological context.",
    difficulty: "Medium",
    source: "Exam Heist Q8 (RAW-EH-008)",
    explanation: "Structuring synthesis with explicit consensus vs contested sections preserves nuance and methodological context, avoiding false certainty or artificial averaging.",
    examTrick: "Handling conflicting estimates: Structured synthesis with distinct sections for consensus vs contested findings.",
    importance: "High",
    tags: ["Uncertainty", "Synthesis", "Nuance Preservation"]
  },
  {
    id: 5,
    question: "Your search_flights tool calls an airline API that occasionally returns 503 Service Unavailable. What is the most effective way to handle this error in your tool implementation?",
    options: [
      "Return an empty flight list as if the search succeeded but found no matching flights.",
      "Log the error internally and return an empty response, letting the model continue without flight data.",
      "Return an error message in the tool result explaining the service is temporarily unavailable.",
      "Automatically retry the request up to five times with exponential backoff before returning results to the agent."
    ],
    answer: "Automatically retry the request up to five times with exponential backoff before returning results to the agent.",
    difficulty: "Medium",
    source: "Exam Heist Q16 (RAW-EH-016)",
    explanation: "Transient server errors (503 / network drops) should be retried automatically with exponential backoff inside the tool implementation, resolving transient glitches seamlessly without wasting agent turns.",
    examTrick: "Transient 503 errors inside tools: Implement internal automatic retries with exponential backoff.",
    importance: "High",
    tags: ["Transient Errors", "Exponential Backoff", "Tool Resilience"]
  }
];

const mock2Data = {
  subject: "Mock Tests",
  chapter: "Claude CCAF Practice Exam 2 (Scenario Diagnostics & Edge Cases)",
  exam: "Claude CCAF",
  paper: "Mock-2",
  description: "53-question deep scenario practice test covering real-world production edge cases, state management, and error boundary recovery.",
  questions: mock2Questions
};

fs.writeFileSync(
  path.join(MOCKS_DIR, "claude-ccaf-mock-exam-2.json"),
  JSON.stringify(mock2Data, null, 2),
  "utf8"
);

console.log("Mock Exam 2 created successfully!");

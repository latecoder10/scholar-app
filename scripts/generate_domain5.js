import fs from 'fs';
import path from 'path';

console.log("Generating complete Claude CCAF Domain 5 question banks...");

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

const d5Folder = 'Claude-CCAF-Context-Reliability';

// Domain 5 - Chapter 1: Context Preservation & Compaction
const d5_c1 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.1 Context Dynamics, Compaction & Prompt Caching",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Sliding windows, compaction, persistent structured fact blocks, lost-in-the-middle mitigations, and prompt caching breakpoints.",
  questions: [
    {
      id: 1,
      question: "Long-document extraction shows the \"lost in the middle\" effect — middle content is missed despite being within the context window. How do you address attention dilution?",
      options: [
        "Use extended thinking, giving the model more time for complete analysis.",
        "Explicit instructions directing attention to middle sections.",
        "Increase context window size, reducing the \"middle\" proportion of the document.",
        "Split the document into focused chunks, processing each independently with overlap."
      ],
      answer: "Split the document into focused chunks, processing each independently with overlap.",
      difficulty: "Easy",
      source: "UD5-004 | Long context prompting tips · Context windows",
      explanation: "Chunking with overlap eliminates the middle by keeping all content near high-attention boundaries, ensuring complete extraction across long documents.",
      examTrick: "Lost-in-the-middle attention dip fix = Chunk document with overlap + aggregate.",
      importance: "High",
      tags: ["Lost in the Middle", "Chunking", "Attention Dynamics"]
    },
    {
      id: 2,
      question: "After compaction, specific numerical values from early in the conversation (balances, dates, transaction IDs) are lost in the summary. What design pattern prevents this?",
      options: [
        "Increase the compaction trigger threshold to delay summarization.",
        "Disable compaction and rely on larger context windows.",
        "Custom compaction instructions specifically requesting preservation of numerical values.",
        "Extract critical transactional facts into a persistent structured block that survives compaction."
      ],
      answer: "Extract critical transactional facts into a persistent structured block that survives compaction.",
      difficulty: "Hard",
      source: "UD5-032 | Effective context engineering for AI agents · Context windows and compaction",
      explanation: "Summarization is inherently lossy on precise scalar values. Moving transactional facts into a dedicated, persistent structured block carried forward verbatim across compactions guarantees exact retention.",
      examTrick: "Prevent scalar loss during compaction = Persistent structured fact block carried across compactions.",
      importance: "High",
      tags: ["Compaction", "Persistent Fact Block", "Scalar Precision"]
    },
    {
      id: 3,
      question: "Combining prompt caching with compaction: after compaction creates a summary block, subsequent requests show no cache hits even though the system prompt is unchanged. Explanation?",
      options: [
        "Cache TTL expired during compaction processing.",
        "The compaction block itself needs a cache_control breakpoint to establish a new cache entry subsequent requests can match against.",
        "Compaction is incompatible with prompt caching.",
        "The compaction block is too large for the minimum cacheable threshold."
      ],
      answer: "The compaction block itself needs a cache_control breakpoint to establish a new cache entry subsequent requests can match against.",
      difficulty: "Hard",
      source: "UD5-027 | Prompt caching · Context windows and compaction",
      explanation: "Prompt caching matches contiguous prefixes. Compacting history replaces the message stream with a new summary prefix. Setting a cache_control breakpoint on the new compaction block establishes a fresh cache entry.",
      examTrick: "Compaction invalidates message cache prefix -> Set cache_control breakpoint on the compaction summary block.",
      importance: "High",
      tags: ["Prompt Caching", "Compaction", "Cache Breakpoints"]
    },
    {
      id: 4,
      question: "By turn 12 of a 15–20 turn session, Claude drops details established in turns 2–4, causing repetitive questions. The context window is not full. Which multi-turn design pattern MOST directly addresses this mid-conversation forgetting?",
      options: [
        "Increase max_tokens to allow longer responses.",
        "Inject a structured summary of confirmed facts into the conversation before context degrades.",
        "Reduce turns by prompting users to submit a complete description upfront.",
        "Enable extended thinking so Claude reasons more carefully about the full conversation."
      ],
      answer: "Inject a structured summary of confirmed facts into the conversation before context degrades.",
      difficulty: "Medium",
      source: "BU5-001 | Effective context engineering for AI agents · Long context prompting tips",
      explanation: "Mid-conversation forgetting when context is not full is caused by attention dilution over turn history. Periodically re-injecting confirmed facts as a compact block restores high salience.",
      examTrick: "Mid-conversation forgetting (window not full) = Periodic injection of confirmed structured facts.",
      importance: "High",
      tags: ["Attention Dilution", "Confirmed Facts", "Context Hygiene"]
    },
    {
      id: 5,
      question: "Prompt caching shows a 95% cache hit rate but overall API costs are only 15% lower. What explains the gap?",
      options: [
        "A 95% hit rate with only 15% savings indicates the cached prefix is a small fraction of total input tokens.",
        "95% hit rate means 5% are misses, each incurring overhead roughly 10× the normal uncached cost.",
        "The caching TTL has been set too short.",
        "Output tokens have increased since caching was enabled."
      ],
      answer: "A 95% hit rate with only 15% savings indicates the cached prefix is a small fraction of total input tokens.",
      difficulty: "Hard",
      source: "BU5-003 | Prompt caching",
      explanation: "Cost savings from caching equal (Cached Prefix Tokens / Total Input Tokens) * Discount Rate. A high hit rate on a tiny cached prefix (e.g. 2K prompt vs 50K fresh document) yields small overall savings.",
      examTrick: "High cache hit rate with low cost savings = Cached prefix is a tiny fraction of total input tokens.",
      importance: "High",
      tags: ["Prompt Caching Economics", "Cache Sizing"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-01-context-preservation-and-compaction.json', d5_c1);

// Domain 5 - Chapter 2: Escalation & Ambiguity Resolution
const d5_c2 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.2 Escalation Triggers & Ambiguity Resolution",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Explicit escalation triggers, human-in-the-loop gates, ambiguity vs irreversibility, and policy gap handling.",
  questions: [
    {
      id: 1,
      question: "Policy covers refunds within 30 days. A customer asks for a price adjustment matching a competitor — something the policy does not address. What should the agent do?",
      options: [
        "Ask the customer to submit a formal exception request.",
        "Deny the request since it is not in the policy.",
        "Apply the closest analogous policy (30-day price guarantee) by inference.",
        "Escalate to a human, since the request involves a policy gap not addressed by existing guidelines."
      ],
      answer: "Escalate to a human, since the request involves a policy gap not addressed by existing guidelines.",
      difficulty: "Easy",
      source: "UD5-033 | Building effective agents — escalation",
      explanation: "Policy gaps (uncovered scenarios) must be escalated to human operators. Agents must never fabricate policy or infer non-existent rules.",
      examTrick: "Uncovered policy gaps = Escalate to human operator; never fabricate analogous rules.",
      importance: "High",
      tags: ["Policy Gaps", "Escalation Triggers"]
    },
    {
      id: 2,
      question: "\"This is frustrating. I've explained my issue twice and nothing is being resolved. I want to talk to a real person NOW.\" The agent has not yet called any tools. What should it do?",
      options: [
        "Acknowledge the frustration and ask one targeted question before escalating.",
        "Briefly explain what the agent can help with and offer to resolve it quickly, escalating only if the customer repeats the request.",
        "Immediately call escalate_to_human with the conversation history.",
        "First call get_customer and lookup_order to gather account context, then escalate."
      ],
      answer: "Immediately call escalate_to_human with the conversation history.",
      difficulty: "Easy",
      source: "CS5-004 (§5.2) | Building effective agents — human-in-the-loop",
      explanation: "Explicit requests for human representatives must be honoured immediately without delaying the user for extra tool calls or negotiations.",
      examTrick: "Explicit customer human request = Immediate escalate_to_human with existing context.",
      importance: "High",
      tags: ["Human Escalation", "Customer Service Safety"]
    },
    {
      id: 3,
      question: "\"Cancel my plan and refund me\" — the account has two active plans and two recent charges, so the target is ambiguous, and both actions are irreversible. Which approach BEST balances autonomy and safety?",
      options: [
        "Treat the unresolved ambiguity over irreversible actions as an escalation trigger to human-in-the-loop confirmation, then proceed.",
        "Pick the most recent plan and charge by default, since dynamic planning means committing to a best guess.",
        "Replan repeatedly with different assumptions until one path completes without an error, then report that path.",
        "Lower the temperature so the model deterministically resolves the ambiguity."
      ],
      answer: "Treat the unresolved ambiguity over irreversible actions as an escalation trigger to human-in-the-loop confirmation, then proceed.",
      difficulty: "Medium",
      source: "BU5-007 (§5.2) | Building effective agents — human-in-the-loop",
      explanation: "Ambiguity over irreversible/destructive actions is a primary trigger for human-in-the-loop confirmation before executing state mutations.",
      examTrick: "Unresolved ambiguity + Irreversible action = Human confirmation gate before execution.",
      importance: "High",
      tags: ["Ambiguity Resolution", "Irreversible Actions", "Human in the Loop"]
    },
    {
      id: 4,
      question: "Which escalation-trigger approach will most reliably identify cases that genuinely require human intervention?",
      options: [
        "Escalate when the customer requests a human, when the issue requires policy exceptions, or when the agent cannot make meaningful progress.",
        "Escalate after three consecutive tool calls that fail to resolve the issue.",
        "Sentiment analysis monitoring frustration indicators, escalating above a threshold.",
        "A rules engine mapping issue types, customer segments, and product categories to escalation decisions."
      ],
      answer: "Escalate when the customer requests a human, when the issue requires policy exceptions, or when the agent cannot make meaningful progress.",
      difficulty: "Medium",
      source: "CS5-006 (§5.2) | Building effective agents — escalation",
      explanation: "Structural escalation triggers (explicit human request, policy exception, inability to progress) correlate directly with human necessity, unlike noisy sentiment proxies.",
      examTrick: "Reliable escalation triggers: (1) Explicit human request, (2) Policy exception required, (3) Stuck/no progress.",
      importance: "High",
      tags: ["Structural Escalation Triggers", "System Architecture"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-02-escalation-and-ambiguity-resolution.json', d5_c2);

// Domain 5 - Chapter 3: Error Propagation & Recovery
const d5_c3 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.3 Multi-Agent Error Propagation & Resilience",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Token bucket rate limiting, graceful degradation on partial outages, and non-retryable error classification.",
  questions: [
    {
      id: 1,
      question: "A third-party API is limited to 100 requests/minute and the agent's rapid tool calls exceed it. Where should rate limiting be implemented?",
      options: [
        "In the system prompt: \"Wait at least 600ms between API calls\".",
        "In Claude's API parameters via a request_delay field.",
        "In the MCP server implementation, using a token bucket algorithm that queues requests exceeding the rate limit.",
        "In a PreToolUse hook that adds a delay between tool invocations."
      ],
      answer: "In the MCP server implementation, using a token bucket algorithm that queues requests exceeding the rate limit.",
      difficulty: "Medium",
      source: "UD5-025 | Writing tools for agents · API errors and rate limits",
      explanation: "Rate limiting is an infrastructure concern that belongs in the MCP server adapter using token bucket / leaky bucket queuing, preventing 429 errors.",
      examTrick: "Rate limiting on external APIs belongs in MCP server implementation (token bucket queue).",
      importance: "High",
      tags: ["Rate Limiting", "Token Bucket", "MCP Server"]
    },
    {
      id: 2,
      question: "A docs pipeline reads source comments, wiki pages, and API schemas. Wiki retrieval times out; the other two succeed. The pipeline currently halts entirely on any source failure. Best error handling strategy?",
      options: [
        "Retry the wiki three times with exponential backoff; if all retries fail, halt to prevent incomplete documentation.",
        "Return structured error context for the wiki failure, proceed with available sources, and mark the gaps that lack wiki content.",
        "Silently skip the wiki source and generate from the remaining two without noting the omission.",
        "Use the source comments to infer what the wiki pages would have contained."
      ],
      answer: "Return structured error context for the wiki failure, proceed with available sources, and mark the gaps that lack wiki content.",
      difficulty: "Medium",
      source: "UD5-036 | Multi-agent research system — partial results · Building effective agents",
      explanation: "Graceful degradation with disclosure: continue pipeline execution with the successful sources (comments + schemas) while explicitly annotating sections missing wiki data.",
      examTrick: "Partial pipeline source outage = Graceful degradation with explicit gap annotations.",
      importance: "High",
      tags: ["Partial Outages", "Graceful Degradation", "Gap Disclosure"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-03-error-propagation-and-recovery.json', d5_c3);

// Domain 5 - Chapter 4: Large Codebase Context Management
const d5_c4 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.4 Large Codebase Context Management & Chunking",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Explore subagents, selective payload projection, multi-file investigation partitioning, and scratchpads.",
  questions: [
    {
      id: 1,
      question: "Adding error-handling wrappers across 120 files in three phases: (1) discover call sites, (2) collaboratively design the approach, (3) implement consistently. Phase 1's output fills the context window before discovery finishes. Most effective approach?",
      options: [
        "Define the pattern in CLAUDE.md, then process files in batches across multiple sessions relying on the shared memory file for consistency.",
        "Use an Explore subagent for Phase 1 to isolate verbose discovery output and return a summary, then continue Phases 2–3 in the main conversation.",
        "Switch to headless mode with --continue, passing explicit context summaries between batch calls.",
        "Do all phases in the main conversation, periodically using /compact."
      ],
      answer: "Use an Explore subagent for Phase 1 to isolate verbose discovery output and return a summary, then continue Phases 2–3 in the main conversation.",
      difficulty: "Hard",
      source: "UD5-017 | Claude Code subagents · Effective context engineering",
      explanation: "Phase 1 discovery is verbose and exploratory. Delegating it to an Explore subagent confines raw search outputs to a disposable context, returning a clean summary for collaborative design.",
      examTrick: "Large discovery phase = Explore subagent -> returns summary -> design/edit in main session.",
      importance: "High",
      tags: ["Explore Subagent", "Phase Partitioning", "Context Hygiene"]
    },
    {
      id: 2,
      question: "Repeated lookup_order calls return 40+ fields each; tool outputs now dominate the conversation, and the customer mentions two more orders. Most effective approach before making additional lookups?",
      options: [
        "Extract only return-relevant fields (items, purchase date, return window, status) from each existing order response, removing verbose details.",
        "Have the model generate a natural language summary of each order, replacing structured responses with prose.",
        "Move all tool responses to a vector database with semantic indexing, retrieving relevant portions as the conversation continues.",
        "Proceed with additional lookups without modifying the existing context."
      ],
      answer: "Extract only return-relevant fields (items, purchase date, return window, status) from each existing order response, removing verbose details.",
      difficulty: "Medium",
      source: "CS5-001 (§5.4) | Effective context engineering · Writing tools for agents",
      explanation: "Payload projection: prune 40+ fields down to the 4 return-relevant fields (items, date, window, status), reclaiming context while retaining structured precision.",
      examTrick: "Context bloat from repeated tool results = Project payloads to task-relevant fields only.",
      importance: "High",
      tags: ["Payload Projection", "Tool Output Trimming"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-04-large-codebase-context-management.json', d5_c4);

// Domain 5 - Chapter 5: Human Review & Confidence Calibration
const d5_c5 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.5 Human Review & Confidence Calibration",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Confidence score calibration on labeled datasets, out-of-distribution format detection, and stratified review sampling.",
  questions: [
    {
      id: 1,
      question: "Confidence thresholds calibrated over three months; >90% auto-approves. A new client submits contracts in an unusual two-column format the system has never seen, and the system reports 92% confidence. Appropriate safeguard?",
      options: [
        "Maintain stratified random sampling of high-confidence extractions across document types to catch the new format's error rate.",
        "Trust the calibrated threshold, since 92% exceeds 90%.",
        "Raise the threshold from 90% to 98% for all document types.",
        "Add a document format classifier that flags unknown formats for mandatory human review before any auto-approval."
      ],
      answer: "Add a document format classifier that flags unknown formats for mandatory human review before any auto-approval.",
      difficulty: "Hard",
      source: "UD5-037 | Building effective agents — evaluation",
      explanation: "Confidence calibration is only valid within the distribution on which it was trained. Out-of-distribution formats must be flagged by a format classifier for mandatory human review.",
      examTrick: "Novel / unseen format = Flag for mandatory human review (confidence calibration is invalid out-of-distribution).",
      importance: "High",
      tags: ["Out-of-Distribution", "Confidence Calibration", "Format Classifier"]
    },
    {
      id: 2,
      question: "An agent emits confidence scores 0–1; confidence 0.9 and 0.5 produce wrong code at similar rates. MOST important step before relying on these scores?",
      options: [
        "Calibrate the confidence scores against a labeled validation set so 0.9 maps to actual 90% accuracy.",
        "Trust the raw scores as-is.",
        "Drop confidence scoring and gate auto-merge purely on whether the code compiles.",
        "Train the model further on edge cases until confidence becomes reliable."
      ],
      answer: "Calibrate the confidence scores against a labeled validation set so 0.9 maps to actual 90% accuracy.",
      difficulty: "Medium",
      source: "BU5-001 (§5.5) | Building effective agents — evaluation",
      explanation: "Raw self-reported confidence is uncalibrated. Calibration against labeled golden datasets maps raw model scores to actual empirical accuracy probabilities.",
      examTrick: "Raw confidence scores MUST be calibrated against labeled validation datasets before gating automation.",
      importance: "High",
      tags: ["Confidence Calibration", "Validation Sets", "Quality Gating"]
    },
    {
      id: 3,
      question: "Three months at 100% human review; extractions with confidence >90% show 97% accuracy overall. Before automating high-confidence extractions, what validation step is most critical?",
      options: [
        "Analyze accuracy by document type and field to verify high-confidence extractions perform consistently across all segments, not just in aggregate.",
        "Compare accuracy at 85%, 90%, and 95% thresholds to find the optimal cutoff.",
        "Run a two-week pilot routing 25% of high-confidence extractions to downstream systems and monitor error reports.",
        "Verify that 97% accuracy meets requirements for all downstream systems."
      ],
      answer: "Analyze accuracy by document type and field to verify high-confidence extractions perform consistently across all segments, not just in aggregate.",
      difficulty: "Hard",
      source: "CS5-002 (§5.5) | Building effective agents — evaluation",
      explanation: "Aggregate accuracy masks segment-level failures (e.g. 99% on standard invoices but 70% on tables). Validate by segment and field before removing human review.",
      examTrick: "Before automating high-confidence approvals: Segment accuracy by document type and field (Simpson's paradox).",
      importance: "High",
      tags: ["Segmented Evaluation", "Automated Approvals"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-05-human-review-and-confidence-calibration.json', d5_c5);

// Domain 5 - Chapter 6: Provenance & Uncertainty
const d5_c6 = {
  subject: "Claude CCAF: Context Management & Reliability",
  chapter: "5.6 Provenance, Attribution & Multi-Source Uncertainty",
  exam: "Claude CCAF",
  paper: "Domain-5",
  description: "Claim-to-source mappings, custom_id batch correlation, temporal trend reconciliation, and amendment handling.",
  questions: [
    {
      id: 1,
      question: "Batch API processing 50 documents; results must be matched to original documents and the batch returns them unordered. How do you correlate?",
      options: [
        "Use the custom_id field in batch requests to correlate results with document IDs.",
        "Sequential processing with the real-time API for guaranteed ordering.",
        "Results return in submission order, enabling positional array correlation.",
        "Store batch request IDs in a database for post-processing correlation."
      ],
      answer: "Use the custom_id field in batch requests to correlate results with document IDs.",
      difficulty: "Easy",
      source: "UD5-001 | Batch processing · Message Batches API",
      explanation: "custom_id round-trips through the Batch API, enabling order-independent, deterministic correlation between submitted documents and returned results.",
      examTrick: "Batch API result correlation = Match via custom_id parameter.",
      importance: "High",
      tags: ["Batch API", "custom_id", "Correlation"]
    },
    {
      id: 2,
      question: "A synthesis report attributes some claims to the wrong sources; provenance tracking failed. How do you maintain provenance in multi-agent synthesis?",
      options: [
        "The coordinator tracks which subagent produced which information.",
        "Natural language source attribution in subagent responses is sufficient.",
        "A separate provenance tracking subagent logging all information sources.",
        "Subagents emit structured claim-source mappings in results passed to the coordinator."
      ],
      answer: "Subagents emit structured claim-source mappings in results passed to the coordinator.",
      difficulty: "Hard",
      source: "UD5-003 | Multi-agent research system — citations · Citations",
      explanation: "Provenance must be bound at extraction time. Structured claim-source mappings ({claim, source_url, location}) survive synthesis merging and rewriting without misattribution.",
      examTrick: "Preserve multi-agent provenance = Subagents emit structured claim-source mappings.",
      importance: "High",
      tags: ["Provenance", "Claim-Source Mappings", "Citations"]
    },
    {
      id: 3,
      question: "Web search returns \"2024: 35% adoption\"; document analysis returns \"2022: 18% adoption\". The synthesis agent flags these as contradictory rather than recognising growth over time. What change best enables correct interpretation?",
      options: [
        "Require subagents to include publication or data collection dates in their structured outputs.",
        "Add a conflict resolution agent that automatically discards older data when newer data exists.",
        "Configure the web search agent to only return results from the past 6 months.",
        "Instruct the synthesis agent to always treat the most recent data as authoritative and place older findings in a historical appendix."
      ],
      answer: "Require subagents to include publication or data collection dates in their structured outputs.",
      difficulty: "Medium",
      source: "CS5-002 (§5.6) | Multi-agent research system · Structured outputs",
      explanation: "Attaching publication/collection dates to structured findings transforms apparent contradictions into recognized time-series trends (growth from 18% in 2022 to 35% in 2024).",
      examTrick: "Reconcile metric discrepancies over time = Require dates in structured findings.",
      importance: "High",
      tags: ["Temporal Reconciliation", "Time-Series Data", "Discrepancy Resolution"]
    },
    {
      id: 4,
      question: "Contracts frequently include amendments (original \"30-day payment terms\", Amendment 1 changes it to \"45 days\"); the model inconsistently extracts one value or the other with no indication of which applies. Most effective approach?",
      options: [
        "Redesign the schema so amended fields capture multiple values, each with source location and effective date.",
        "Prompt instructions to always extract the most recent amendment and ignore superseded original terms.",
        "Preprocess documents with a classifier that identifies and removes superseded sections before extraction.",
        "Post-extraction validation using pattern matching to detect amendments and flag them for manual review."
      ],
      answer: "Redesign the schema so amended fields capture multiple values, each with source location and effective date.",
      difficulty: "Hard",
      source: "CS5-006 (§5.6) | Structured outputs · Citations",
      explanation: "Contracts with amendments contain multiple valid terms over different effective periods. Structuring the schema as an array of entries with source location and effective date captures full legal provenance.",
      examTrick: "Contract amendments = Schema with array of {value, source_clause, effective_date}.",
      importance: "High",
      tags: ["Contract Amendments", "Legal Provenance", "Schema Design"]
    }
  ]
};
writeChapter(d5Folder, 'chapter-06-provenance-and-uncertainty.json', d5_c6);

console.log("Domain 5 completed successfully!");
console.log("ALL 5 CLAUDE CCAF DOMAINS SUCCESSFULLY GENERATED!");

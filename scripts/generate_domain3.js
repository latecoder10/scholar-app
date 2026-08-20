import fs from 'fs';
import path from 'path';

console.log("Generating complete Claude CCAF Domain 3 question banks...");

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

const d3Folder = 'Claude-CCAF-Claude-Code-Workflows';

// Domain 3 - Chapter 1: CLAUDE.md Hierarchy & Imports
const d3_c1 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.1 CLAUDE.md Hierarchy, Imports & Settings Precedence",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Root vs subdirectory CLAUDE.md files, @import syntax, settings.json precedence, managed settings, and /memory discovery.",
  questions: [
    {
      id: 1,
      question: "Global architecture rules live in the project root CLAUDE.md; directory-specific linting conventions live in subdirectory CLAUDE.md files. How does Claude Code apply the hierarchy?",
      options: [
        "Subdirectory CLAUDE.md overrides project root for files in that directory.",
        "All CLAUDE.md files are merged, applying all rules to all files.",
        "The closest CLAUDE.md to the working file determines rules; no inheritance.",
        "Only the project root CLAUDE.md is applied; subdirectory files are ignored."
      ],
      answer: "Subdirectory CLAUDE.md overrides project root for files in that directory.",
      difficulty: "Easy",
      source: "UD3-009 | Claude Code memory — CLAUDE.md hierarchy",
      explanation: "Inheritance with override: root rules apply globally, and subdirectory CLAUDE.md files override conflicting rules for files within that subtree.",
      examTrick: "CLAUDE.md hierarchy: Inherit from root, override locally in subdirectory.",
      importance: "High",
      tags: ["CLAUDE.md Hierarchy", "Inheritance", "Overrides"]
    },
    {
      id: 2,
      question: "A new team member's Claude Code is not applying the team's Python standards; the standards live in ~/.claude/CLAUDE.md on the senior engineer's machine. Root cause and fix?",
      options: [
        "The new member needs to run /memory reload.",
        "User-level ~/.claude/CLAUDE.md applies only to that user and is not shared via version control. The standards should be moved to the project-level CLAUDE.md committed to the repository.",
        "The standards need to be duplicated in both user-level and project-level CLAUDE.md files.",
        "The new member should manually copy the standards to their own ~/.claude/CLAUDE.md."
      ],
      answer: "User-level ~/.claude/CLAUDE.md applies only to that user and is not shared via version control. The standards should be moved to the project-level CLAUDE.md committed to the repository.",
      difficulty: "Medium",
      source: "UD3-049 | Claude Code memory — memory types and locations",
      explanation: "~/.claude/CLAUDE.md is personal and machine-local. Team coding standards must be committed to the project-level CLAUDE.md in version control.",
      examTrick: "Team conventions MUST live in committed project-level CLAUDE.md, never user-level ~/.claude/CLAUDE.md.",
      importance: "High",
      tags: ["Project vs User Memory", "Version Control", "Team Standards"]
    },
    {
      id: 3,
      question: "For ordinary settings.json values a higher layer replaces a lower one. Does the same apply to permission deny entries, where the enterprise-managed layer denies a path and a project settings.json allows it?",
      options: [
        "The project-level allow wins, since project settings are more specific to this repository.",
        "It's undefined behavior.",
        "The deny rule is still enforced; permission deny rules merge (union) across every settings layer rather than following ordinary override precedence, so a higher layer's deny cannot be reopened by a lower layer's allow.",
        "Whichever rule was written more recently takes effect."
      ],
      answer: "The deny rule is still enforced; permission deny rules merge (union) across every settings layer rather than following ordinary override precedence, so a higher layer's deny cannot be reopened by a lower layer's allow.",
      difficulty: "Hard",
      source: "GEN3-003 | Claude Code settings — permission rules and precedence · Claude Code IAM",
      explanation: "Permission deny rules union across all layers. An enterprise deny rule can NEVER be overridden or bypassed by a project-level allow rule.",
      examTrick: "Permission deny rules UNION across all layers; higher deny always beats lower allow.",
      importance: "High",
      tags: ["Permission Deny Union", "Enterprise Settings", "Security Precedence"]
    },
    {
      id: 4,
      question: "Rank the layers from highest to lowest precedence for an ordinary (non-permission-deny) settings.json value.",
      options: [
        "Enterprise-managed settings -> command-line arguments -> local project settings (.claude/settings.local.json) -> shared project settings (.claude/settings.json) -> user settings (~/.claude/settings.json)",
        "User -> shared project -> local project -> command-line arguments -> enterprise-managed",
        "Shared project -> local project -> enterprise-managed -> user -> command-line arguments",
        "Command-line arguments -> enterprise-managed -> shared project -> local project -> user"
      ],
      answer: "Enterprise-managed settings -> command-line arguments -> local project settings (.claude/settings.local.json) -> shared project settings (.claude/settings.json) -> user settings (~/.claude/settings.json)",
      difficulty: "Hard",
      source: "GEN3-006 | Claude Code settings — precedence",
      explanation: "Precedence order: Enterprise managed-settings.json -> CLI flags -> .claude/settings.local.json -> .claude/settings.json -> ~/.claude/settings.json.",
      examTrick: "Precedence: Enterprise Managed -> CLI args -> Local project -> Shared project -> User.",
      importance: "High",
      tags: ["Settings Precedence", "Hierarchy"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-01-claude-hierarchy-and-memory.json', d3_c1);

// Domain 3 - Chapter 2: Slash Commands & Skills
const d3_c2 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.2 Custom Slash Commands, Skills & Plugins",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Slash commands in .claude/commands/, $ARGUMENTS substitution, SKILL.md, context: fork, and plugin packaging.",
  questions: [
    {
      id: 1,
      question: "A custom Agent Skill with context: fork generates verbose output while the main session context stays clean. When should context: fork be used?",
      options: [
        "Forking creates overhead and should be avoided unless absolutely necessary.",
        "context: fork is required for all custom skills to maintain context cleanliness.",
        "Use context: fork when a skill generates verbose output that would pollute the main context.",
        "context: fork only for skills invoking external tools or MCP servers."
      ],
      answer: "Use context: fork when a skill generates verbose output that would pollute the main context.",
      difficulty: "Medium",
      source: "UD3-006 | Claude Code skills · Effective context engineering",
      explanation: "context: fork runs the skill in an isolated sub-agent context so thousands of lines of intermediate logs/search results do not pollute the parent session window.",
      examTrick: "Verbose skill output = context: fork in SKILL.md frontmatter.",
      importance: "High",
      tags: ["Skills", "context: fork", "Context Isolation"]
    },
    {
      id: 2,
      question: "Invoking /migrate users_table — which substitution variables inside SKILL.md can access the argument?",
      options: [
        "process.argv[2] contains it, passed through to the shell.",
        "$PARAMS['migration_name'] based on the argument-hint definition.",
        "${input} contains it and arguments must be parsed manually.",
        "$ARGUMENTS contains users_table and $1 contains it as the first positional argument."
      ],
      answer: "$ARGUMENTS contains users_table and $1 contains it as the first positional argument.",
      difficulty: "Easy",
      source: "UD3-056 | Claude Code slash commands — arguments · Claude Code skills",
      explanation: "Slash commands and skills expose $ARGUMENTS (the complete argument string) and positional variables ($1, $2, etc.).",
      examTrick: "Slash command argument variables: $ARGUMENTS (full string) and $1, $2 (positional).",
      importance: "High",
      tags: ["Slash Commands", "Argument Substitution", "$ARGUMENTS"]
    },
    {
      id: 3,
      question: "Which element of a Skill definition determines whether Claude invokes it for a given request?",
      options: [
        "The Skill's filename in .claude/skills.",
        "The list of allowed_tools in the manifest.",
        "The description field.",
        "The Skill's load order in the skills directory."
      ],
      answer: "The description field.",
      difficulty: "Easy",
      source: "UD3-094 | Claude Code skills",
      explanation: "The skill's description field in YAML frontmatter is the semantic matching trigger Claude evaluates against the user prompt.",
      examTrick: "Skill invocation matching is determined solely by the description frontmatter field.",
      importance: "High",
      tags: ["Skills", "Semantic Matching", "description"]
    },
    {
      id: 4,
      question: "Does invoking a slash command count as a \"turn\" in the session?",
      options: [
        "No — they bypass per-turn limits as pre-approved built-in shortcuts.",
        "No — they run on a separate channel and do not consume context.",
        "They count as half a turn for context budgeting.",
        "Yes — the resolved prompt is sent to Claude as a normal user turn and counts toward context and any per-turn limits."
      ],
      answer: "Yes — the resolved prompt is sent to Claude as a normal user turn and counts toward context and any per-turn limits.",
      difficulty: "Medium",
      source: "BU3-006 (§3.2) | Claude Code slash commands · Context windows",
      explanation: "Slash commands are expanded client-side into prompt text and sent as standard user turns, consuming tokens and turn counts identically to manual prompts.",
      examTrick: "Slash commands expand into standard user turns and count toward context tokens and turn limits.",
      importance: "High",
      tags: ["Slash Commands", "Turn Counting", "Context Consumption"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-02-slash-commands-and-skills.json', d3_c2);

// Domain 3 - Chapter 3: Path-Specific Rules
const d3_c3 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.3 Path-Specific Rules & Scoping",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Glob-based rule files in .claude/rules/, path scoping frontmatter, and modular project guidelines.",
  questions: [
    {
      id: 1,
      question: "Terraform conventions should load only when editing .tf files, not for all files. How do you configure this?",
      options: [
        "Create a /terraform slash command that loads the conventions on demand.",
        "Create a .claude/rules/ file with YAML frontmatter paths: ['terraform/**/*'] so the rules only activate when editing matching files.",
        "Add Terraform conventions to the root CLAUDE.md under a # Terraform section header.",
        "Create a CLAUDE.md file in the terraform/ directory."
      ],
      answer: "Create a .claude/rules/ file with YAML frontmatter paths: ['terraform/**/*'] so the rules only activate when editing matching files.",
      difficulty: "Medium",
      source: "UD3-057 | Claude Code settings — rules and path scoping",
      explanation: ".claude/rules/*.md files with YAML frontmatter paths: ['glob_pattern'] activate conditionally when files matching the pattern are edited.",
      examTrick: "Conditionally loaded rules for file types/paths = .claude/rules/ with paths frontmatter globs.",
      importance: "High",
      tags: ["Path Rules", ".claude/rules/", "Glob Scoping"]
    },
    {
      id: 2,
      question: "A project uses JavaScript (Prettier) and Rust (rustfmt). How should CLAUDE.md handle this dual-language setup?",
      options: [
        "Rely on the language-specific formatters and don't include formatting rules in CLAUDE.md.",
        "Use .claude/rules/ with glob-based rules: one file with **/*.js,**/*.ts for Prettier rules, another with **/*.rs for rustfmt rules.",
        "Create separate CLAUDE.md files in js/ and rust/ directories.",
        "Include both conventions in the root CLAUDE.md with clear section headers."
      ],
      answer: "Use .claude/rules/ with glob-based rules: one file with **/*.js,**/*.ts for Prettier rules, another with **/*.rs for rustfmt rules.",
      difficulty: "Medium",
      source: "UD2-024 | Claude Code settings — rules · Memory",
      explanation: "Glob-based rules in .claude/rules/ decouple conventions from directory structure, loading Prettier rules for JS/TS and rustfmt for Rust automatically.",
      examTrick: "Dual-language repos = .claude/rules/ with language-specific path globs.",
      importance: "High",
      tags: ["Multi-Language Repos", ".claude/rules/", "Prettier & Rustfmt"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-03-path-specific-rules.json', d3_c3);

// Domain 3 - Chapter 4: Plan Mode & Model Selection
const d3_c4 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.4 Plan Mode vs Direct Execution & Model Tiering",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Plan mode approval gates, direct execution, model tiering (Opus vs Sonnet vs Haiku), and spend management.",
  questions: [
    {
      id: 1,
      question: "A developer wants Claude Code to choose plan mode vs. direct execution automatically based on task complexity. Can it?",
      options: [
        "Claude Code defaults to plan mode for all tasks unless overridden.",
        "No, plan mode versus direct execution must be explicitly specified by the developer.",
        "Yes, Claude Code analyzes task complexity and selects the mode automatically.",
        "Mode selection based on file count: plan for multiple files, direct for single."
      ],
      answer: "No, plan mode versus direct execution must be explicitly specified by the developer.",
      difficulty: "Easy",
      source: "UD3-005 | Claude Code interactive mode and permission modes",
      explanation: "Plan mode is an explicit developer choice (via Shift+Tab / plan toggle / CLI). Claude Code does not automatically toggle plan mode based on complexity.",
      examTrick: "Plan Mode is an explicit developer toggle; it is never auto-switched by Claude.",
      importance: "High",
      tags: ["Plan Mode", "Interactive Mode", "Permission Gates"]
    },
    {
      id: 2,
      question: "A team does high-volume routine work (boilerplate, formatting) and lower-volume complex architectural refactoring. Correct model configuration?",
      options: [
        "Haiku for all tasks.",
        "Opus for all tasks.",
        "Sonnet as default, with Opus available for complex architectural tasks.",
        "Haiku for routine tasks, Sonnet for complex tasks, with Opus disabled."
      ],
      answer: "Sonnet as default, with Opus available for complex architectural tasks.",
      difficulty: "Medium",
      source: "UD3-088 | Choosing a model · Claude Code settings",
      explanation: "Sonnet provides the ideal speed/cost/intelligence balance as default, with Opus reserved for deep architectural reasoning.",
      examTrick: "Model tiering: Sonnet default for balanced development; Opus for deep architecture.",
      importance: "High",
      tags: ["Model Selection", "Cost vs Intelligence", "Sonnet & Opus"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-04-plan-mode-and-model-selection.json', d3_c4);

// Domain 3 - Chapter 5: Iterative Refinement Techniques
const d3_c5 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.5 Iterative Refinement & Multi-Pass Review",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Explore-Plan-Code lifecycle, independent reviewer instances, per-file vs integration passes, and stopping criteria.",
  questions: [
    {
      id: 1,
      question: "A 14-file PR reviewed in a single pass yields contradictory findings — file A's refactor breaks assumptions made while reviewing file B. How do you improve the review architecture?",
      options: [
        "Sequential file-by-file review building cumulative understanding.",
        "Single comprehensive review with extended thinking time.",
        "Increase context window size for complete simultaneous review.",
        "Multi-pass review: per-file local analysis passes plus a cross-file integration pass."
      ],
      answer: "Multi-pass review: per-file local analysis passes plus a cross-file integration pass.",
      difficulty: "Hard",
      source: "UD3-008 | Long context prompting tips · Claude Code best practices",
      explanation: "Multi-pass review separates concerns: per-file local passes ensure deep file-level analysis without dilution, while a final integration pass reconciles cross-file data flows.",
      examTrick: "Large PR review = Local per-file passes + Cross-file integration pass.",
      importance: "High",
      tags: ["Multi-Pass Review", "Code Review Architecture"]
    },
    {
      id: 2,
      question: "Code review in CI/CD; the review instance must not have access to the generation reasoning. How do you ensure independence?",
      options: [
        "Same instance with extended thinking time for critical review mode.",
        "Review-specific system prompt overriding generation context with critical evaluation.",
        "Clear conversation history before review, removing generation context.",
        "A separate independent Claude instance for review, without generation reasoning context."
      ],
      answer: "A separate independent Claude instance for review, without generation reasoning context.",
      difficulty: "Medium",
      source: "UD3-013 | Building effective agents — evaluator-optimizer",
      explanation: "Evaluator independence requires structural separation: a fresh Claude instance evaluating code without the generator's confirmation-biased reasoning trace.",
      examTrick: "Independent code review = Separate Claude instance without generation reasoning context.",
      importance: "High",
      tags: ["Evaluator-Optimizer", "Reviewer Independence", "Confirmation Bias"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-05-iterative-refinement-techniques.json', d3_c5);

// Domain 3 - Chapter 6: CI/CD & Enterprise Deployment
const d3_c6 = {
  subject: "Claude CCAF: Claude Code Configuration & Workflows",
  chapter: "3.6 Claude Code in CI/CD & Enterprise Deployment",
  exam: "Claude CCAF",
  paper: "Domain-3",
  description: "Non-interactive mode (-p), GitHub Actions, corporate proxies, Zero Data Retention (ZDR), and OpenTelemetry chargeback.",
  questions: [
    {
      id: 1,
      question: "A CI script runs claude 'Analyze this PR for security issues' and hangs indefinitely waiting for interactive input. Correct fix?",
      options: [
        "Add the -p flag: claude -p 'Analyze this PR for security issues'",
        "Add a --batch flag.",
        "Redirect stdin: ... < /dev/null.",
        "Set CLAUDE_HEADLESS=true before running."
      ],
      answer: "Add the -p flag: claude -p 'Analyze this PR for security issues'",
      difficulty: "Easy",
      source: "UD3-039 | Claude Code CLI reference — -p · GitHub Actions",
      explanation: "-p (print / non-interactive mode) runs Claude Code headlessly, outputting results directly to stdout and exiting without prompting for interactive input.",
      examTrick: "Unattended CI execution = claude -p 'prompt'.",
      importance: "High",
      tags: ["CI/CD", "Headless Mode", "-p Flag"]
    },
    {
      id: 2,
      question: "CI runs behave inconsistently versus local runs because developers have different CLAUDE.md files, skills, and MCP servers. What ensures consistent CI execution?",
      options: [
        "Using the --bare flag, which skips auto-discovery of all local configuration (hooks, skills, plugins, MCP, CLAUDE.md).",
        "Setting a CLAUDE_CI=true environment variable.",
        "Storing all developer configurations in version control and loading them in CI.",
        "Running CI jobs on standardized Docker containers with identical configurations."
      ],
      answer: "Using the --bare flag, which skips auto-discovery of all local configuration (hooks, skills, plugins, MCP, CLAUDE.md).",
      difficulty: "Hard",
      source: "UD2-039 | Claude Code CLI reference · Settings",
      explanation: "--bare skips auto-discovery of local hooks, skills, and memory files, providing an isolated, deterministic execution baseline in CI.",
      examTrick: "Deterministic CI baseline = --bare flag to disable local auto-discovery.",
      importance: "High",
      tags: ["CI Consistency", "--bare Flag", "Hermetic Execution"]
    }
  ]
};
writeChapter(d3Folder, 'chapter-06-ci-cd-and-enterprise-deployment.json', d3_c6);

console.log("Domain 3 completed successfully!");

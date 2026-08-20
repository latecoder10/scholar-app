/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { 
  Database, 
  Cpu, 
  GitBranch, 
  Compass, 
  Layers, 
  Terminal, 
  Code, 
  Globe, 
  Settings, 
  HelpCircle,
  FileText,
  Workflow
} from "lucide-react";

export default function TechArchitecture() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header Banner */}
      <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm text-white flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="font-display text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
            <Cpu className="w-7 h-7 text-indigo-400" /> System Design & Blueprint Console
          </h1>
          <p className="text-slate-400 text-xs mt-1 max-w-xl font-mono">
            Staff Architect Specifications • Multi-Exam Architecture Engine (CIL MT, GATE, Claude CCAF)
          </p>
        </div>
      </div>

      {/* Specification Tabs */}
      <div className="flex border-b border-slate-200 overflow-x-auto gap-2 pb-px">
        {[
          { id: "overview", name: "1. Core & Folder Spec", icon: GitBranch },
          { id: "db_api", name: "2. Spring Boot & DB Schema", icon: Database },
          { id: "engine", name: "3. Engines & Discovery", icon: Workflow },
          { id: "hierarchy", name: "4. UI & Components Map", icon: Layers }
        ].map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-3 rounded-t-xl text-xs font-semibold font-mono flex items-center gap-2 whitespace-nowrap border-b-2 transition-all cursor-pointer ${
                activeTab === tab.id
                  ? "border-indigo-600 text-indigo-600 font-bold bg-indigo-50/20"
                  : "border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              }`}
            >
              <Icon className="w-4 h-4" /> {tab.name}
            </button>
          );
        })}
      </div>

      {/* Content Container */}
      <div className="bg-white border border-slate-100 rounded-2xl p-6 md:p-8 shadow-xs">
        
        {/* Tab 1: Core & Folder Spec */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in text-sm leading-relaxed text-slate-600">
            {/* 1. Product Architecture */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                1. Product Architecture (Decoupled Engine)
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The platform adopts a complete <strong>Content-Driven, Decoupled Architecture</strong>. 
                Instead of rigid SQL-mapped questions, curriculum is compiled as isolated <strong>Content Packs (JSON)</strong>. 
                The system utilizes a <strong>Stateless Core Engine</strong> that discovers directories dynamically. 
                User progression, performance metrics, and mistake logs are handled as an isolated relational state.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl text-emerald-400 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {`[User Browser]
       │ (React Client / Dynamic HUD)
       ▼
 [Express / Spring Boot REST API] <--- Dynamic Scan ---> [Content Packs Directory (JSON)]
       │
       ▼
 [PostgreSQL DB] (Durable tracking of: answeredQuestions, recentActivity, mistakes)`}
              </div>
            </div>

            {/* 2. Folder Structure */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                2. Folder Structure Specification
              </h3>
              <p className="text-xs text-slate-500">
                Standard hierarchical structure for organizing dynamic subjects and content packs.
              </p>
              <pre className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto leading-relaxed border border-slate-100">
{`content/
├── Computer-Networks/
│   ├── chapter-01-osi-tcpip.json         # OSI & TCP/IP Content Pack
│   ├── chapter-02-routing.json           # Routing Algorithms Pack
│   └── chapter-03-ipv4-subnetting.json   # Subnetting Pack
└── DBMS/
    ├── chapter-01-er-model.json          # Entity-Relationship Model
    └── chapter-02-normalization.json     # DB Normalization & Keys Pack`}
              </pre>
            </div>

            {/* 3. JSON Content Pack Strategy */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                3. JSON Content Pack Strategy (Curriculum Contract)
              </h3>
              <p className="text-xs text-slate-500">
                Strict type schema applied to JSON documents, enabling the auto-discovery layer to catalog items without database synchronization overhead.
              </p>
              <div className="bg-slate-950 p-4 rounded-xl text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800 leading-relaxed">
{`{
  "subject": "Subject Title (e.g. DBMS)",
  "chapter": "Chapter Title (e.g. Normalization)",
  "description": "Short description showing in cards",
  "questions": [
    {
      "id": 101,                             // Unique ID within this chapter
      "question": "Question statement...",
      "options": ["A", "B", "C", "D"],       // Exactly 4 options
      "answer": "B",                         // Literal string matching correct option
      "difficulty": "Easy|Medium|Hard",
      "source": "Exam paper origin (e.g. GATE CS 2021)",
      "explanation": "Detailed step-by-step solution",
      "examTrick": "Immediate memory tactic or shortcut",
      "importance": "Low|Medium|High",
      "tags": ["Tag1", "Tag2"]
    }
  ]
}`}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Spring Boot & DB Schema */}
        {activeTab === "db_api" && (
          <div className="space-y-8 animate-fade-in text-sm leading-relaxed text-slate-600">
            {/* 4. Database Schema (PostgreSQL) */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                4. Database Schema (PostgreSQL DDL)
              </h3>
              <p className="text-xs text-slate-500">
                To guarantee high-durability tracking of user performance, incorrect answers, and confidence levels, the PostgreSQL database is modeled as follows:
              </p>
              <pre className="bg-slate-950 text-slate-300 p-4 rounded-xl text-[11px] font-mono overflow-x-auto border border-slate-800 leading-relaxed">
{`-- Table: Answer Progress Tracker
CREATE TABLE user_progress (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter_id VARCHAR(100) NOT NULL,
    question_id INT NOT NULL,
    user_answer VARCHAR(255) NOT NULL,
    is_correct BOOLEAN NOT NULL,
    confidence VARCHAR(20) NOT NULL, -- 'Guess', 'Somewhat Sure', 'Very Sure'
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_question UNIQUE (user_id, subject, chapter_id, question_id)
);

-- Index for fast progress querying and score calculations
CREATE INDEX idx_progress_user ON user_progress(user_id);
CREATE INDEX idx_progress_subject ON user_progress(user_id, subject);

-- Table: Mistake Book Repository
CREATE TABLE mistake_book (
    id SERIAL PRIMARY KEY,
    user_id VARCHAR(100) NOT NULL,
    subject VARCHAR(100) NOT NULL,
    chapter_id VARCHAR(100) NOT NULL,
    chapter_name VARCHAR(150) NOT NULL,
    question_id INT NOT NULL,
    question_text TEXT NOT NULL,
    options TEXT[] NOT NULL,
    user_answer VARCHAR(255) NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    explanation TEXT,
    exam_trick TEXT,
    confidence VARCHAR(20) NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_mistake UNIQUE (user_id, subject, chapter_id, question_id)
);

-- Index for Mistake Book retrieval
CREATE INDEX idx_mistakes_user_subject ON mistake_book(user_id, subject);`}
              </pre>
            </div>

            {/* 5. API Design (Spring Boot) */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                5. API Design (Spring Boot Controller)
              </h3>
              <p className="text-xs text-slate-500">
                A highly optimized REST architecture containing Spring Boot controller endpoints to service the flight deck.
              </p>
              <pre className="bg-slate-50 p-4 rounded-xl text-xs font-mono text-slate-700 overflow-x-auto leading-relaxed border border-slate-100">
{`@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class MissionControlController {

    @Autowired
    private DiscoveryService discoveryService;

    @Autowired
    private ProgressService progressService;

    // 1. Get Discovered curriculum structure
    @GetMapping("/content")
    public ResponseEntity<List<SubjectDTO>> getDiscoveredContent() {
        return ResponseEntity.ok(discoveryService.discoverAllPacks());
    }

    // 2. Load questions for a single chapter
    @GetMapping("/chapter/{subject}/{chapterId}")
    public ResponseEntity<ChapterData> getChapter(
            @PathVariable String subject, 
            @PathVariable String chapterId) {
        return ResponseEntity.ok(discoveryService.loadChapter(subject, chapterId));
    }

    // 3. Submit an answered item (triggers progress logging & mistake updates)
    @PostMapping("/progress/submit")
    public ResponseEntity<ProgressUpdateResponse> submitAnswer(
            @RequestBody AnswerSubmission submission) {
        return ResponseEntity.ok(progressService.processAnswer(submission));
    }

    // 4. Fetch Mistake Book items
    @GetMapping("/progress/mistakes")
    public ResponseEntity<List<MistakeEntry>> getMistakes(@RequestParam String userId) {
        return ResponseEntity.ok(progressService.getMistakesForUser(userId));
    }
}`}
              </pre>
            </div>
          </div>
        )}

        {/* Tab 3: Engines & Discovery */}
        {activeTab === "engine" && (
          <div className="space-y-8 animate-fade-in text-sm leading-relaxed text-slate-600">
            {/* 8. Auto Discovery Mechanism */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                8. Auto Discovery Mechanism (Plug-and-Play)
              </h3>
              <p className="text-xs text-slate-500">
                The mechanism is completely content-driven. The backend scans the root `content/` folder recursively. 
                Any folder found represents a **Subject**. Any `.json` file inside represents a **Chapter**. 
                The system extracts parameters dynamically at runtime:
              </p>
              <div className="bg-slate-50 p-4 rounded-xl space-y-2 border border-slate-100 text-xs">
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-700 font-mono font-bold text-[10px] shrink-0 mt-0.5">1</span>
                  <p><strong>Folder Discovery</strong>: Subject title is parsed directly from the subdirectory name (e.g. `Computer-Networks` becomes `Computer Networks`).</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-700 font-mono font-bold text-[10px] shrink-0 mt-0.5">2</span>
                  <p><strong>JSON Parse</strong>: The engine reads file headers without buffering entire questions lists to compute counts, difficulty balance (Easy/Medium/Hard), description, and maps them to active endpoints.</p>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="w-5 h-5 flex items-center justify-center bg-indigo-100 rounded-full text-indigo-700 font-mono font-bold text-[10px] shrink-0 mt-0.5">3</span>
                  <p><strong>Instant Invalidation</strong>: Adding/Editing a file triggers immediate updates in the UI list on subsequent calls. Zero compilation or SQL schema runs required.</p>
                </div>
              </div>
            </div>

            {/* 9. Progress Tracking Design */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                9. Progress Tracking & Metrics Design
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The user's stats are updated in real-time. We compute:
                <br />
                • <strong>Coverage</strong> = <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">(Attempted questions / Total questions in system) * 100%</code>.
                <br />
                • <strong>Accuracy</strong> = <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">(Correct responses / Total attempted questions) * 100%</code>.
                <br />
                • <strong>Readiness Score (Metacognitive)</strong> = <code className="bg-slate-100 px-1 py-0.5 rounded text-indigo-600 font-bold">(Coverage * 0.4) + (Accuracy * 0.4) + (VerySureCorrectRatio * 0.2)</code>. This rewards precise confidence calibration.
              </p>
            </div>

            {/* 10. Mistake Book Design */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                10. Mistake Book Purge Loop
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The **Mistake Book** is a self-cleaning cache:
                <br />
                1. If a user submits an **incorrect answer** to any question, it is saved to the `mistake_book` table.
                <br />
                2. During any revision session, if they attempt this question again and **solve it correctly**, the engine immediately purges the item from `mistake_book`.
                <br />
                3. This ensures that the Mistake Book represents a real, live log of un-mastered concepts that naturally shrinks to zero as competence increases.
              </p>
            </div>

            {/* 11. Revision Engine Design */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                11. Revision Assembly Algorithm
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                The algorithm pulls questions dynamically based on weight:
                <br />
                • <strong>Priority 1 (Weight 1.0)</strong>: Active items in Mistake Book.
                <br />
                • <strong>Priority 2 (Weight 0.8)</strong>: Questions in weak chapters (chapters where overall accuracy is less than 60%).
                <br />
                • <strong>Priority 3 (Weight 0.5)</strong>: Items previously solved with 'Guess' confidence, targeting fuzzy knowledge areas.
              </p>
            </div>
          </div>
        )}

        {/* Tab 4: UI & Components Map */}
        {activeTab === "hierarchy" && (
          <div className="space-y-8 animate-fade-in text-sm leading-relaxed text-slate-600">
            {/* 6. Component Hierarchy */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                6. Component Hierarchy (React Flight Deck)
              </h3>
              <p className="text-xs text-slate-500">
                A highly modular, isolated component architecture to ensure memory stability and prevent re-render loops:
              </p>
              <pre className="bg-slate-950 text-emerald-400 p-4 rounded-xl text-xs font-mono overflow-x-auto border border-slate-800 leading-relaxed">
{`App (Core Router, syncs user progress and discovery API)
├── Sidebar/Navigation (Tab controller)
├── Dashboard (Stat counters, recent activity logger, suggestion engine)
├── SubjectView (Chapters grid, progress and accuracy bars)
├── ChapterView (Difficulty breakdown, practicing selection launcher)
├── PracticeSession (Active HUD, confidence calibrator, answer verdict layout)
├── MistakeBook (Filter, single item revision, clearing routines)
├── RevisionEngine (Criteria sliders, custom mock packet compiler)
├── AnalyticsView (Readiness gauge, metacognitive calibration table)
└── ContentPackManager (Drag & drop file upload parser, template specs)`}</pre>
            </div>

            {/* 7. UI Wireframes */}
            <div className="space-y-2">
              <h3 className="font-display text-base font-bold text-slate-800 uppercase tracking-wider font-mono border-l-4 border-indigo-600 pl-3">
                7. UI Wireframes & Layout Design
              </h3>
              <p className="text-xs text-slate-500">
                Visual grid map designed for optimal user cognitive focus during rigorous GATE/CIL MT preparation.
              </p>
              <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-xs font-mono leading-relaxed space-y-4">
                <div>
                  <h4 className="font-bold text-slate-700">Dashboard Layout (Bento Grid):</h4>
                  <pre className="text-[10px] text-slate-500">{`+--------------------------------------------------------------+
| HEADER: App Title             [STATUS: AUTO DISCOVERY ACTIVE]|
+--------------------------------------------------------------+
| [CARD 1: Coverage%] [CARD 2: Accuracy%] [CARD 3: Readiness%]  |
+--------------------------------------------------------------+
| SUGGESTION: Continue Normalization? -> [LAUNCH PRACTICE]     |
+--------------------------------------------------------------+
| WEAK SPOTS (List < 60% Acc)   | RECENT FEED (Live activity)  |
| - Computer Networks Ch 2      | - QID #101 Normalization (C) |
| - DBMS Normalization          | - QID #204 IP Subnetting (W) |
+--------------------------------------------------------------+`}</pre>
                </div>

                <div>
                  <h4 className="font-bold text-slate-700">Question Screen Layout:</h4>
                  <pre className="text-[10px] text-slate-500">{`+--------------------------------------------------------------+
| HUD: Practice Mode | Question 3 of 10           [ProgressBar]|
+--------------------------------------------------------------+
| [Easy]   SOURCE: GATE CS 2021           IMPORTANCE: High     |
|                                                              |
| QUESTION: What represents a weak entity set in an ERD?       |
|                                                              |
| [A] Single Rectangle                                         |
| [B] Double Rectangle  <-- SELECTED                           |
| [C] Double Oval                                              |
| [D] Double Diamond                                           |
|                                                              |
| CALIBRATE CONFIDENCE: [🎲 Guess] [⚖️ Some Sure] [🛡️ Very Sure] |
+--------------------------------------------------------------+
| [Abort Practice]                           [SUBMIT RESPONSE] |
+--------------------------------------------------------------+`}</pre>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}

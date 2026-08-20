# CIL Scholar Hub — Elite Exam Preparation Portal

An advanced, full-stack cognitive exam preparation suite and mock testing environment engineered specifically for candidates preparing for the **Coal India Limited Management Trainee (CIL MT - Systems)** and related high-rigor PSU examinations. 

Built with **React 18**, **Vite**, **Express**, and styled with **Tailwind CSS**, this platform models academic precision, offering interactive mock tests, automated performance analytics, personalized mistake tracking, and modular content discovery.

---

## 🌟 Key Functional Suites

### 1. Mission Control (Dashboard)
- **Fluid Overview**: Displays total progress, overall readiness score, average exam velocity, and active streak metrics.
- **Academic Timeline**: Quick links to jump straight back into current chapters or resume unfinished mock exams.

### 2. Discovered Curriculum (Academic Subjects & Chapters)
- **Deep Study Deck**: Exploration of designated subjects (e.g., Computer Networks, Database Management Systems, Operating Systems, Software Engineering, and General Aptitude).
- **Study Notes & Formulas**: Dedicated notes pages containing essential technical blueprints and exam shortcuts.
- **Active Practice Modes**: Practice on demand in **Easy (Learn)**, **Medium (Challenge)**, or **Hard (Time-Trial)** modes.

### 3. High-Rigor Mock Test Arena
- **Pre-Flight Audits**: Configured with standard CIL guidelines (time limits, total questions, and marking schemes).
- **Interactive Exam Simulator**: Clean sidebar navigation for questions, flagged status toggle, interactive live timer, and real-time response caching.
- **Detailed Explanation Reviews**: Highlights formulas, step-by-step math breakdowns, and elite **Exam Shortcuts / Tricks** for rapid answers in under 30 seconds.

### 4. Personal Mistake Book
- **Erase Errors Offline**: Track incorrectly answered questions across all modules.
- **Interactive Re-testing**: Launch rapid-fire revision sessions featuring only previous mistakes.
- **Pristine Cleansing**: Features a secure double-confirmation dialog to reset mistake books safely.

### 5. Automated Revision Engine
- **Custom Assembly**: Dynamically filter questions by subject, difficulty, and focus areas.
- **Custom Packs**: Compile bespoke mock revisions instantly for targeted weak-spot drilling.

### 6. Analytics Flight Deck
- **Velocity Tracker**: Interactive charts tracking completion speed vs. accuracy.
- **Strength Mapping**: Highlights strong subjects and reveals focus areas needing rapid remediation.

### 7. AI Virtual Teacher Hub & Content Manager
- **Dynamic Content Expansion**: Integrated with a server-side endpoint `/api/chapter/:subject/:chapterId/expand` to dynamically append up to 100+ questions per chapter on-demand.
- **Structural Integrity**: Ensures schema protection for curriculum chapters, saving custom mock logs safely.

---

## 🛠️ Technological Blueprints & Architecture

The application runs a lightweight full-stack **Express + Vite** setup:

- **Express Server (`server.ts`)**: Powers the session persistence, registers mock-test completions, tracks custom user metrics, and executes the dynamic content expansion logic securely.
- **React Frontend (`src/`)**: High-performance single-page app utilizing modular components:
  - `App.tsx`: Layout controller housing state and the newly engineered **collapsible light sidebar** and **premium dynamic header actions**.
  - `Dashboard.tsx`: Gateway landing page.
  - `MockTestArena.tsx`: Implements the CIL examination simulation logic, complete with automated timeout submissions.
  - `MistakeBook.tsx`: Personal archive for targeted recovery.
  - `RevisionEngine.tsx` & `AnalyticsView.tsx`: Custom-designed revision builders and charts.
- **Data Schemas**: Standardized JSON curriculum files kept secure under server state, ensuring precise academic schema validation.

### Project Layout
```
scholarApp/
├── server.ts          # Express API + Vite middleware (dev) / static serving (prod)
├── src/                # React frontend (components, entry point)
├── content/            # Curriculum question banks, served at runtime and downloadable as a zip
├── mobile/              # Standalone Expo/React Native app (own package.json, own bundled data)
├── scripts/             # Small dev utilities (e.g. Gemini API key check)
├── docs/raw-sources/    # Historical raw markdown sources the question banks were originally compiled from
└── data/                 # Runtime-generated user progress store (gitignored)
```

### Content Layout
Exams are discovered from the filesystem — nothing about which exams exist is hardcoded in the UI:
```
content/
└── <exam-id>/            # e.g. claude-ccaf, cil-mt — matches ExamDefinition.id in shared/exams.ts
    └── modules/
        └── <module>/     # e.g. prompt-engineering, mock-tests
            └── chapter-01-*.json
```
Dropping a new `content/<exam-id>/modules/<module>/` folder (or uploading a pack whose `exam` field names a new exam) makes it appear on the next `/api/content` scan. Adding a matching entry to `EXAM_REGISTRY` in [shared/exams.ts](shared/exams.ts) is optional and only supplies presentation metadata — icon, colour, tagline, papers.

---

## 🚀 Local Development Workflow

### Prerequisites
Make sure you have Node.js (version 18 or above) installed.

### 1. Install Dependencies
```bash
npm install
```

### 2. Start the Development Server
```bash
npm run dev
```
The server will boot utilizing `tsx`, routing the client-side bundle and Express APIs concurrently over port `3000`.

### 3. Build for Production
```bash
npm run build
```
This compiles the static React files to `dist/`, then bundles the backend TypeScript server into a stand-alone CommonJS format at `dist/server.cjs` via `esbuild`.

### 4. Run the Production Build
```bash
npm run start
```
Binds to `$PORT` when a host provides one, otherwise `3000`.

---

## ☁️ Deploying

The app runs in two shapes from one codebase, chosen automatically at runtime by [src/lib/contentStore.ts](src/lib/contentStore.ts): it probes `/api/content`, and falls back to prebuilt static JSON when no API answers.

### Static hosting (Firebase Hosting, Cloudflare Pages, GitHub Pages)
No server, no cold starts, free tier, no credit card.

```bash
npm run build:static     # vite build + bakes content into dist/static-content/
npx firebase-tools login
npx firebase-tools projects:create scholar-app   # or reuse an existing project
npx firebase-tools deploy --only hosting
```
Gives you `https://<project>.web.app`. [firebase.json](firebase.json) is already configured — `dist` as the public dir, SPA rewrites, and cache headers.

`npm run preview:static` serves `dist/` locally to check it before deploying.

The static build has no server, so authoring is inherently off (see below) and progress lives in the browser's IndexedDB. To add content: commit JSON to `content/`, re-run `build:static`, redeploy.

### Node hosting (Render, Fly, Railway)
Runs the Express server, so the uploader and AI expand can be switched on.

| Setting | Value |
|---|---|
| Build Command | `npm install --include=dev && npm run build` |
| Start Command | `npm start` |
| Env | `NODE_ENV=production` |

`--include=dev` is required: `esbuild` is a devDependency and `NODE_ENV=production` makes npm skip devDependencies.

---

## 🔐 Authoring Mode

Two features write into `content/` at runtime — the Content Manager uploader and the AI mock expander. Free and serverless hosts have **ephemeral disks**, so those writes appear to succeed and then vanish on the next restart. Both therefore sit behind a capability flag resolved in [shared/capabilities.ts](shared/capabilities.ts) and enforced by the server, with the UI hiding the controls to match.

| `ENABLE_AUTHORING` | Result |
|---|---|
| `true` | Uploader and AI expand on (AI also needs `GEMINI_API_KEY`) |
| `false` | Both off |
| unset | **On in development, off in production** |

Nothing to configure locally — `npm run dev` has authoring on by default. A deployment is safe by default. The server prints the resolved mode on boot, and `GET /api/capabilities` reports it; gated routes answer **503** with an explanation rather than writing.

To add content on a deployed instance, commit the JSON to `content/<exam>/modules/<subject>/` and redeploy — the same folder-driven flow described above.

> Setting `ENABLE_AUTHORING=true` on a public host lets **anyone** who can reach the site upload content packs. There is no authentication on these routes.

---

## 🎨 Design and UX Principles
- **Clean Academic Styling**: Employs an ultra-modern, professional light gray visual canvas (`bg-slate-50/50`) with slate typography.
- **Adaptive Left Sidebar**: Clean Navigation containing dynamic badge updates, featuring a responsive, state-persisted desktop **Collapsible Toggle Panel** (saving configuration directly inside `localStorage`).
- **Secure Modal Confirmation**: Strict double-confirmation protection modals implemented for destructive actions (such as clearing mistake books or wiping progress history), replacing basic browser-native alert triggers with seamless premium design overlays.

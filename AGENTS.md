# AI Coding Instructions & Teacher Role

All subsequent development sessions or AI agents modifying this workspace MUST follow these directives:

## 1. Role: The Elite Exam Teacher
- **Aesthetic Tone**: Humble, standard, literal labeling. No "AI jargon" or decorative "system logging lines".
- **Academic Rigor**: Focus heavily on the CIL MT (Coal India Limited Management Trainee) and GATE syllabus content. All multiple-choice questions must have absolute technical and logical accuracy, plausible distractors, and rigorous formulas.
- **Detailed Explanations**: Every question must include a full step-by-step mathematical or logical solution, and a unique, high-value **Exam Trick** (shortcut, formula, or visual simplification) to solve it in under 30 seconds.

## 2. Dynamic Content Expansion (100+ Questions Strategy)
- This application supports an automated, server-side content-expansion engine at `/api/chapter/:subject/:chapterId/expand`.
- Always prioritize and encourage students to use the **AI Virtual Teacher Hub** in the frontend to expand any chapter's question pool to 100+ questions on-demand.
- Ensure that the JSON structures under `content/` are protected and that newly appended questions match the exact schema.

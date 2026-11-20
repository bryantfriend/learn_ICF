# Unified ICF Academy

All current course activities use `studio.html` and its shared instruction/activity/results workspace. The tutorial starts at `index.html`. The academy dashboard at `academy.html` provides the resume point and progress export.

| Section | Activities | Structure |
| --- | ---: | --- |
| Orientation | 12 | Learn → concept question → explanatory feedback |
| JavaScript Foundations | 12 | 11 coding lessons and one project plan |
| Build Every Stage | 24 | Helpers, factories, independent challenges, declaration, registration, failure handling, capstone |
| Composition | 12 | 11 coding lessons and one project plan |
| Advanced | 12 | 11 coding lessons and one project plan |
| Adaptive Context | 10 | Two concept checks, six guided exercises, an independent signal-adapter repair and a policy-update capstone |
| Roblox | 26 | 25 Luau structure exercises and one project plan |
| JavaScript Basic | 6 | First programs, conditions, debugging, and a seat-count project |
| JavaScript Beginner | 8 | Functions, lists, objects, and a library request project |
| JavaScript Intermediate | 8 | Modules, JSON, HTTP, async code, errors, testing, Git, and a lookup project |
| JavaScript Advanced | 6 | Optional practice with transactions, retries, overlapping requests, and a final project |
| Build a Web Page | 5 | HTML, CSS, form input, feedback, and a real ICF seat booking project |
| Total | 141 | 123 coding exercises, 14 concept checks, four project plans |

The [seat booking project guide](programming-guide.html) shows how to run, change, and test the project offline. It includes a real local HTTP request for JSON and a checkpoint students can save with Git.

Every activity has the same Learn / Your task tabs, central activity panel, results panel, navigation, draft saving, hints, and section menu. The central panel presents code, answer choices, or project fields according to the task. Students can review any section without losing their current work.

## Assessment boundaries

- Builder JavaScript exercises use behavioral tests against the actual template factories, registry, and runner.
- Imported JavaScript exercises keep their original output, structure, and available behavioral checks.
- Roblox checks match text patterns; they do not execute Luau. Students must verify execution in Roblox Studio.
- Concept checks give explanations and allow retries.
- Project plans receive keyword coverage checks, not implementation validation.
- The six stage skill markers require the corresponding three builder exercises. Imported completions, concepts, and project plans do not award those skill markers.

## Progress and previous links

The unified save key is `icf-academy-progress-v2`. On first load, the app imports the builder save, four older track saves, and the first-mission concept progress. Old keys remain unchanged. Imported code drafts and project plans are editable in the shared workspace. Earlier lesson-step markers and outputs are retained in `legacyArchives`, included in the JSON export from the overview.

Subsequent visits use the unified save and do not overwrite edits by reimporting old data. Lesson passes are versioned. Progress is local to the browser and origin; keep using the same local server address.

The old Beginner, Intermediate, Advanced, and Roblox `index.html` links redirect to the matching section and earlier selected module. `learn.html` opens Orientation; its reference anchors redirect to the supporting reference page. Existing builder lesson IDs remain valid.

`reference.html` is a supporting field guide and live template pipeline sandbox, not a competing course app. Its earlier concept questions have moved into Orientation. Template files and capstone starter packs retain their existing locations.

## Source map

- `academy-content.mjs`: the imported lesson content, project rubrics, concept questions, and reference entries.
- `adaptive-course.mjs` defines the Adaptive Context activities. The [failure diagnosis](studio.html#adaptive-trace-failure) uses the runner’s stage and step trace. The [signal-adapter repair](studio.html#adaptive-repair-signals) uses policy and decision evidence from a repeatable recommendation. Both run against the template.
- `studio-course.mjs`: the 24 core builder exercises.
- `academy-course.mjs`: the ordered course, track definitions, and normalized activity contracts.
- `studio-app.mjs` / `studio.css`: shared rendering and interaction for all activities.
- `academy-assessment.mjs` / `studio-worker.mjs`: activity checks and isolated execution.
- `studio-runtime.mjs`: real template integration for builder tests.
- `academy-progress.mjs`: migration and persistence.
- `academy-overview.mjs`: unified course overview, resume, and export.
- `reference-runtime.mjs`: supporting live pipeline sandbox and field guide.

The older `course-app.js`, `app.js`, dashboard assets, and `icf-course/` remain historical source and are no longer the active academy UI. Edit the unified content modules for current lesson changes.

## Verification

Run `node scripts/check-adaptive-context.mjs` for context scoring, eligibility, authorization, policy concurrency, rollback and training rejection checks. Run `node scripts/check-academy.mjs` for every reference input, unique lesson IDs and migration preservation. Run `node scripts/check-studio.mjs` for core builder contracts and empty-code rejection.

Start `node serve.cjs` and open the academy in a separate Playwright CLI test session. Use `run-code --filename scripts/check-academy-browser.txt` for academy navigation and `run-code --filename scripts/check-adaptive-browser.txt` for the adaptive exercises. The workflows write drafts, passes and progress to that test session.

Browser verification covers each section and activity type, wrong and correct concept answers, project persistence, menu counts, former entry-point redirects, progress export, and responsive layouts. Older browser scripts describe superseded UIs and are not the current acceptance workflow.

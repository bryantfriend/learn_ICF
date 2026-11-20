# Build with ICF

The core path is `studio.html`: 24 coding exercises, approximately 5–7 hours including practice. The existing 58 lessons remain available for extra JavaScript, composition, advanced, and Roblox practice.

## Learning sequence

| Lessons | Skill | Guided implementation | Independent evidence |
| --- | --- | --- | --- |
| 1 | Step contract | Successful explicit pass-through | Return values and object preservation checked |
| 2–4 | Validate | Reject malformed book IDs; createValidator | Validate integer ages, boundaries, missing values, and bad types |
| 5–7 | Normalize | Canonicalize book IDs; createNormalizer | Normalize a label without mutating the original Intent or payload |
| 8–10 | AddContext | Load membership by actor; createContextAdder | Load trusted catalog prices, accept zero, reject unknown SKUs |
| 11–13 | Authorize | Check membership and availability; createAuthorizer | Permit only the owner of a draft, deny protected states |
| 14–16 | Process | Commit one in-memory loan; createProcessor | Reserve varied inventory quantities without overselling or partial mutation |
| 17–19 | Emit | Append result-derived events; createEmitter | Publish a reservation event without leaking fields or changing committed state |
| 20 | Declaration | Map all six named groups to helpers | Actual runner executes every supplied helper in order |
| 21 | Registration | Register, create, check failures, run | Actual registry and pipeline; factory failure path |
| 22 | Failure boundary | Stop at Authorize before Process | Write spy remains untouched on denial and runs once on success |
| 23 | Delivery retry | Retry a stored event after Process | Failed delivery remains retryable; completed delivery is not repeated |
| 24 | Full capstone | Independent six-helper BorrowBookIntent | Success, malformed input, forged membership, unavailable stock, and Emit failure after a committed loan |

## How proficiency is recorded

- Reading, hints, and showing reference code do not mark a lesson complete.
- A lesson passes only when every executable check passes on the submitted draft.
- Guided solutions can be inspected without replacing the student's work. Independent challenges have different requirements and no solution-reveal button.
- Each stage skill requires two guided passes and its independent challenge pass.
- The capstone is an additional independent check of integration. Stage skills alone do not mark the capstone complete.
- Later failed practice attempts retain prior earned progress. Drafts are kept separately, and results from an older draft do not award a pass to edits made while checks run.
- Progress is versioned by lesson and stored only in the current browser. The existing track storage keys are unchanged.

These are explicit behavioral contracts, not hidden keyword scoring or a secure exam. Ask learners to explain their decisions and implement a feature in their own project to assess transfer beyond these exercises. Reflection prompts are self-checks, not automatically graded claims of understanding.

## Move the capstone into a project

1. Copy the contents of `Template/` into your project and run `node ICF/examples/checkPipeline.mjs` from the copied root. Compare the successful run with the named failure steps in the output.
2. Put each named library helper into the relevant `ICF/Stages/<category>/Domain/library/` folder. Export it and expose it through that category's registry file.
3. Import those registries into `ICF/Intents/BorrowBookIntent.js`. Keep the factory and stage declaration there; leave business rules in the helper files.
4. Export the Intent factory and register it once in `ICF/Intents/intents.js` during startup. Create a fresh Intent for each request and handle both creation and execution failures.
5. Replace the lab's trusted fixture with authenticated identity and authoritative records. Implement atomic persistence, duplicate-request handling, and durable delivery appropriate to the project.
6. Re-run the success and failure scenarios against the real persistence layer. Test two competing requests and a repeated request as well as single requests.

For maintenance practice, follow the [failed pipeline exercise](studio.html#adaptive-trace-failure) and [wrong recommendation exercise](studio.html#adaptive-repair-signals). In your own project, retain a small fixture that reproduces the reported symptom. Check both that case and an unaffected case after changing the responsible helper.

The in-memory capstone models the order of operations. Database rollback, durable outbox delivery and cross-process duplicate protection require project-specific implementations and tests.

## Maintaining this course

Edit `studio-course.mjs` for content, starters, solutions, and behavioral checks. Increase an exercise's version when its completion contract changes. Run `node scripts/check-studio.mjs` and the separate Playwright browser workflow after meaningful changes. The browser runtime imports the actual local template; changes to those contracts should also trigger a course review.

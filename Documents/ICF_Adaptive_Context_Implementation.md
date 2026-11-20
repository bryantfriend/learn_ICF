# Adaptive Context implementation record

This record describes the initial release. For current integration, investigation and replay, use the [template guide](../Template/ADAPTIVE_CONTEXT.md). For the live curriculum and its verification commands, use the [academy structure](../ACADEMY_STRUCTURE.md#verification).

Implemented as an opt-in AddContext capability. External signals adjust evidence scores and the example's resulting lesson recommendation. Required facts remain separate. Both the recommendation and policy-update intents declare all six stages. New implementation and lesson code use named functions without arrow functions, optional chaining, nullish coalescing, or Crypto API.

At release, the academy had seven sections and 106 activities. Adaptive Context contributed two concept checks, five guided coding exercises, and one independent capstone using the actual template.

## Initial release verification

All completed successfully:

- `node Template/ICF/examples/runAdaptiveContext.mjs`: base policy recommends the advanced project at 80; external factors select prerequisite review at 95.
- `node scripts/check-adaptive-context.mjs`: nine behavior groups plus all eight lessons, including invalid inputs, duplicate identities, eligibility, bounds, snapshot replay, required-fact preservation, authorization, concurrent policy updates, in-flight version pinning, rollback, and empty/wrong-answer rejection.
- `node scripts/check-academy.mjs`: 106 reference inputs, seven sections, 88 coding activities, zero failures; migration passed.
- `node scripts/check-studio.mjs`: 24 builder lessons, 51 checks, zero failures.
- `scripts/check-adaptive-browser.txt`: all eight new activities, incorrect/empty input rejection, draft and completion persistence, menu navigation, desktop/mobile layouts, and zero page errors.
- `scripts/check-academy-browser.txt`: existing activity types, project persistence, legacy redirects, export, responsive layouts, and the updated overview count.

Browser scripts run using Playwright CLI `run-code --filename` after opening the academy in a separate test session. Both use the current page's origin. They intentionally save test progress in that browser session. Screenshots are in `output/playwright/adaptive-overview.png`, `adaptive-capstone.png`, and `adaptive-mobile.png`.

## Compatibility and limits

Existing intent registration and the pipeline engine are unchanged; adaptive intents register separately with trusted services. Existing activity IDs and progress storage keys are preserved. No database migration is introduced.

The policy store is an in-memory reference adapter. Production integrations must supply authenticated identity/data providers and a transactional durable policy store. Automatic outcome learning is not implemented. Ranking and the example's decision rule demonstrate changed behavior, not a measured improvement across real learners. See [the template integration guide](../Template/ADAPTIVE_CONTEXT.md) for contracts and limits.

## Changed source files

New template engine and examples:

- `Template/ICF/engine/adaptiveContext.js`
- `Template/ICF/engine/contextPolicyStore.js`
- `Template/ICF/examples/lessonServices.js`
- `Template/ICF/examples/runAdaptiveContext.mjs`
- `Template/ICF/Intents/RecommendNextLessonIntent.js`
- `Template/ICF/Intents/UpdateContextScoringPolicyIntent.js`
- `Template/ICF/Intents/intents.js` (updated registration exports)

New stage helpers:

- `Template/ICF/Stages/ContextProviders/Core/addAdaptiveContext.js`
- `Template/ICF/Stages/ContextProviders/Domain/adaptiveContext/addLessonContext.js`
- `Template/ICF/Stages/ContextProviders/Domain/adaptiveContext/addPolicyUpdateContext.js`
- `Template/ICF/Stages/Validators/Domain/adaptiveContext/validatePolicyUpdate.js`
- `Template/ICF/Stages/Normalizers/Domain/adaptiveContext/normalizePolicyUpdate.js`
- `Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizeLessonRecommendation.js`
- `Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizePolicyUpdate.js`
- `Template/ICF/Stages/Processors/Domain/adaptiveContext/processLessonRecommendation.js`
- `Template/ICF/Stages/Processors/Domain/adaptiveContext/processPolicyUpdate.js`
- `Template/ICF/Stages/Emitters/Domain/adaptiveContext/emitAdaptiveResult.js`

Updated stage registries under `Template/ICF/Stages/`:

- `ContextProviders/contextProviders.js`
- `Validators/validators.js`
- `Normalizers/normalizers.js`
- `Authorizers/authorizers.js`
- `Processors/processors.js`
- `Emitters/emitters.js`

Training and verification:

- `adaptive-course.mjs` (new activities)
- `academy-course.mjs`
- `studio-runtime.mjs`
- `studio-app.mjs`
- `studio.html`
- `index.html`
- `scripts/check-adaptive-context.mjs` (new)
- `scripts/check-adaptive-browser.txt` (new)
- `scripts/check-academy-browser.txt`

Documentation:

- `Template/ADAPTIVE_CONTEXT.md` (new)
- `Template/README.md`
- `Template/ICF.md`
- `README.md`
- `ACADEMY_STRUCTURE.md`
- `Documents/ICF_Technical_Reference_for_AI.md`
- `Documents/ICF_Adaptive_Context_Proposal.md` (implementation status)
- `Documents/ICF_Adaptive_Context_Implementation.md` (this record)

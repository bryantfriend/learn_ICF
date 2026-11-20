# Adaptive Context

Adaptive Context is an optional capability within AddContext. It ranks optional evidence for the current intent, using external signals to increase or decrease relevance. Existing intents and the six-stage runner are unchanged.

## Run the example

From the project root, run:

```text
node Template/ICF/examples/runAdaptiveContext.mjs
```

After copying only the template into another project, run `node ICF/examples/runAdaptiveContext.mjs`. Use Node 22 or a modern ES-module browser/bundler supporting `structuredClone` and `Object.hasOwn`.

The example runs the actual registered `RecommendNextLessonIntent` twice. With no external signals it recommends `advanced-project` at 80. With repeated errors and a short session it recommends `prerequisite-review` at 95. Both executions retain a decision trace.

## Investigate a context decision

Run `node ICF/examples/runAdaptiveContext.mjs --expired` from the copied template root. At the fixture clock of 10000, every candidate reaches its exclusive expiry boundary. The last trace row is `AddContext.addAdaptiveContext`, and the error reports `expired=3`. The baseline invocation uses time 1000 and succeeds. Raising scores would leave the expiry check unchanged.

| Observation | Where to look |
| --- | --- |
| Required selection fails with no candidates supplied | Inspect the trusted loader's query and source availability. |
| Required selection reports exclusion counts | Match each reason to the relevant clock, scope, source, access check, category, or threshold. Confirm eligibility before tuning weights. |
| A candidate wins unexpectedly | Find its ID and revision in `decisionTrace`. Compare its base, signed factor contributions, missing signals and final score against the expected winner. Check the budget and ID tie-break. |
| The selected ID is right but the outcome is wrong | Inspect the intent's Process step and the domain value attached to the selected evidence. |
| A proposal fails during publication | Read the Process error. For a version conflict, read the active version, review intervening changes and submit a revised proposal with its own reason. |

For a repeatable project fixture, capture the policy version, evaluation time, signal snapshot and candidate revisions through the trusted loader. Use permitted test values and record the expected selected IDs and domain output. Re-run the fixture against a proposed policy before publishing it. The snapshot ID is a lookup key, so replay also needs the corresponding input data.

## Add a signal to a project

Suppose a verified practice schedule says a prerequisite review is due. Agree on the expected behavior first. In the lesson fixture, the project should still win at 80 when the schedule is unavailable. When a review is due, the prerequisite should win at 85. Save this example as an `.mjs` file beside the copied `ICF/` directory and run it with Node.

```js
import assert from "node:assert/strict";
import { rankContextCandidates } from "./ICF/engine/adaptiveContext.js";
import { createLessonCandidates, createLessonPolicy } from "./ICF/examples/lessonServices.js";

var proposal = createLessonPolicy();
proposal.categories.prerequisite.factors.practiceDue = 25;
var candidates = createLessonCandidates();
var cases = [
  { id: "schedule-unavailable", signals: {}, winner: "project", score: 80 },
  { id: "review-due", signals: { practiceDue: 1 }, winner: "gap", score: 85 }
];
for (var fixture of cases) {
  var decision = rankContextCandidates(candidates, fixture.signals, proposal, {
    intentType: proposal.intentType, scope: proposal.scope,
    evaluatedAt: 1000, signalSnapshotId: fixture.id
  });
  assert.equal(decision.selected[0].id, fixture.winner);
  assert.equal(decision.selected[0].score, fixture.score);
}
```

In the project, extend the trusted snapshot loader to supply `practiceDue` from the verified schedule. Omit it when the optional schedule is unavailable. Use the policy-update intent below to publish the tested weight, then run the registered recommendation intent and check the returned lesson ID. Add a domain Process rule only if the meaning of selected evidence changes.

## Scoring contract

```text
score = clamp(baseScore + sum(signed factor weight × signal value), 0, 100)
```

Base scores are 0–100. Factor weights are -100–100; signals are -1–1. Negative weights reduce relevance for a positive signal. Missing optional signals contribute zero and appear as missing in the trace. Invalid numbers fail. Start from the base for every execution; never compound the previous adjusted score. This is a relevance score, not a probability or authorization decision.

The implementation uses signed weights so one shared signal can raise one category and lower another. This refines the initial proposal's nonnegative-weight convention.

```js
import { scoreContextCandidate } from "./ICF/engine/adaptiveContext.js";

var result = scoreContextCandidate(
  { baseScore: 80, factors: { repeatedErrors: -20, shortSession: -25 } },
  { repeatedErrors: 1, shortSession: 1 }
);
// result.score === 35; result.contributions explains each adjustment.
```

`rankContextCandidates(candidates, signals, policy, execution)` is a pure helper. Its complete policy and candidate shapes are in `ICF/examples/lessonServices.js`. Each candidate has a stable ID, revision, category, source, scope, explicit verified accessibility, observedAt, expiresAt, and a domain value. Times are epoch milliseconds in applications; example fixtures use a fixed clock.

The policy is scoped to one intent type and scope. It declares allowed sources, category rules, maxCandidates (1–100), minimumScore, and requireSelection. The execution supplies intentType, scope, evaluatedAt, and signalSnapshotId. The caller must snapshot all inputs consistently and use a signal snapshot ID that identifies those exact captured signals; retain snapshots separately if replay is needed.

Eligibility precedes ranking. Inaccessible, out-of-scope, expired, future-dated, unsupported-source, and unsupported-category candidates are excluded. Malformed records fail the stage. Duplicate IDs fail rather than allowing input order to resolve potentially conflicting revisions. Providers should consolidate duplicate observations deliberately before calling the helper.

Eligible candidates sort by descending score, then ascending stable ID. Candidates below the threshold are excluded; the count budget selects the remainder in order. If nothing qualifies, requireSelection controls whether AddContext fails or returns an empty selection. The lesson recommendation requires a selection. Optional-source outages must be handled explicitly by the trusted loader; unhandled loader failures fail AddContext.

## Integrate with an intent

```js
import contextProviders from "./ICF/Stages/ContextProviders/contextProviders.js";

var addEvidence = contextProviders.createAdaptiveContextProvider(loadSnapshot);
// Declare inside an existing six-stage Intent:
// AddContext: { addRequiredFacts: addRequiredFacts, addEvidence: addEvidence }
```

`loadSnapshot(intent)` returns `{ candidates, signals, policy, scope, evaluatedAt, signalSnapshotId }`. It must use trusted sources, authenticate access before fetching data, enforce timeouts, and verify required signals if the domain has any. Caller-supplied payload, context, accessibility flags, and actor roles are not proof. Text retrieved as evidence is data, not instructions to alter the intent or policy.

The provider clears any earlier `intent.context.adaptiveContext` before loading a fresh decision. Required identity, permissions, tenant facts, and business state stay in their established fields. Authorize uses verified facts. Process defines how the selected evidence affects the output. Resolve conflicting authoritative facts with a domain rule or an explicit failure.

The result contains policyId, policyVersion, evaluatedAt, signalSnapshotId, selected candidates, and decisionTrace. Trace entries explain the base, adjustments, final score, and exclusion reason. The pipeline returns its working intent, so treat the full result as internal. An API boundary must project permitted resultData/events and redact private context and excluded evidence. Do not send the full working intent to clients or place it in public logs.

## Register the included intents

```js
import intents from "./ICF/Intents/intents.js";
import registry from "./ICF/engine/intentRegistry.js";
import pipeline from "./ICF/engine/pipeline.js";
import { createDemoLessonServices } from "./ICF/examples/lessonServices.js";

// Demo only. Configure trusted application services at startup in a real project.
var services = createDemoLessonServices({ signals: { repeatedErrors: 1, shortSession: 1 } });
var registered = intents.registerAdaptiveIntents(services);
if (!registered.ok) { throw new Error(registered.errors.join(" ")); }
var created = registry.createIntent("RecommendNextLessonIntent", { id: "learner", role: "student" }, {});
if (!created.ok) { throw new Error(created.errors.join(" ")); }
var result = await pipeline.run(created.intent);
```

`registerProjectIntents()` still registers the original DemoIntent. Adaptive registration is explicit and takes startup-configured services, never services supplied in a request. The service contract is `now()`, `loadIdentity(actor)`, `loadLessonSnapshot(intent)`, and `policyStore`. In a real application, derive actor identity from an authenticated session; the example's fixed learner/editor lookup is a fixture, not authentication.

## Publish a policy update

`UpdateContextScoringPolicyIntent` takes `{ policy, expectedVersion, reason }`. Validate checks the proposal, Normalize copies it and trims the reason, AddContext loads the current policy and verified identity, Authorize checks update permission and matching scope/target, Process publishes, and Emit reports the new version.

Create the update with the registered factory and run it through the pipeline, just like a recommendation. Do not call storage publication directly from request handlers.

The included `createMemoryContextPolicyStore(initialPolicy)` exposes asynchronous `read()`, `history()`, and `publish(expectedVersion, proposedPolicy, audit)` methods. Reads and history return defensive copies. Publish compares the expected version and appends a new version with audit metadata. Concurrent stale updates fail without changing the current version. Identity, scope, and target intent cannot change. A rollback supplies an older policy's configuration with the current expectedVersion and a rollback reason; it produces a new version.

This store is single-process and non-durable. Replace it with a database adapter that atomically compares the version, writes immutable history with audit metadata, and advances the active policy pointer in one transaction. Preserve the result contract `{ ok: true, policy }` or `{ ok: false, errors }`. Apply any stricter domain weight/source restrictions during validation and authorization. In-flight executions keep their captured policy; updates affect subsequent loads. Recheck mutable business state transactionally in Process where needed.

Outcome measurement and automatic learning are not included. Evaluate expected recommendations before changing policy weights; selection frequency alone is not evidence of usefulness. No autonomous policy changes occur.

## Training and verification

Start at `studio.html#adaptive-boundaries` in the academy. The Adaptive Context exercises use the template API, including authorization denials and stale policy updates.

From the academy root:

```text
node scripts/check-adaptive-context.mjs
node scripts/check-academy.mjs
node scripts/check-studio.mjs
```

The template example runs independently after copying the template folder. The academy and its verification scripts are not dependencies of the copied template.

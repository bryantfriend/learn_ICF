# Proposal: Adaptive Context for ICF

This document preserves the original design proposal. The shipped example uses signed weights, rejects duplicate candidate IDs and publishes policy versions through an in-memory adapter. Use the [template guide](../Template/ADAPTIVE_CONTEXT.md) for the current scoring contract and runnable example. Automatic learning remains future work.

## Purpose

Let available context compete for relevance to the current intent. External factors can increase or decrease each candidate's score, changing which information the intent uses and how strongly it influences the result.

For example, a lesson recommendation might normally favor the learner's stated interests. After repeated mistakes, evidence about an unresolved prerequisite could become more useful. A short available study window could further favor a focused review activity.

The score belongs to **a context candidate evaluated for a particular intent and situation**. It is not a permanent global importance score, a probability of correctness, or permission to act.

## Fit with the current project

The existing template runs Validate → Normalize → AddContext → Authorize → Process → Emit. Its pipeline executes named steps within each stage in declaration order. Context providers already return updated intents through the established success contract.

AddContext can therefore gain ordered steps to collect candidates, evaluate eligibility, score relevance, and select context. A seventh pipeline stage is unnecessary.

Relevant implementation seams:

- `Template/ICF/engine/pipeline.js`: preserves the six-stage execution contract.
- `Template/ICF/StageFactories/createContextAdder.js`: wraps a context provider.
- `Template/ICF/Stages/ContextProviders/contextProviders.js`: exports providers.
- `Template/ICF/Stages/ContextProviders/Core/`: eventual reusable scoring and selection helpers.
- `Template/ICF/Stages/ContextProviders/Domain/`: intent-specific sources and factor rules, when implemented.
- `Template/ICF/Intents/`: intents explicitly opt into the new providers.

The technical reference defines context as system-derived or verified information. This proposal preserves that requirement. A verified source can provide an uncertain observation; its uncertainty must remain explicit. Retrieved content is data, not authority to change the intent or scoring policy.

## Separate required facts from competing context

Required facts include verified identity, tenant boundaries, authorization policy, and state required to perform the action correctly. They are loaded independently and cannot be removed or weakened by relevance scores. Missing required facts cause an explicit stage failure.

Optional candidates include preferences, recent activity, historical outcomes, environmental observations, and supporting material. These can compete within a configured context budget.

Each candidate needs an ID, content or reference, source, observed time, applicable scope, and revision. A policy defines which sources and categories are eligible for an intent. Eligibility checks reject out-of-scope, inaccessible, expired, or unsupported candidates before scoring. Access checks for collecting data must occur at the provider boundary, even though action authorization occurs later.

Conflicting authoritative facts require explicit resolution or failure; scoring must not decide which account balance or permission is true. Conflicting optional observations can coexist with their provenance and uncertainty exposed to Process.

## Initial scoring rule

Start with a small, deterministic rule that people can inspect:

```text
score = clamp(base relevance + sum(factor weight × factor value), 0, 100)
```

Base relevance is between 0 and 100 and is configured by intent type and context category. Each factor value is normalized to [-1, 1]. Each weight is a nonnegative maximum point adjustment. The intent-specific policy defines the sign and meaning of each factor, missing-value behavior, limits, and supported sources.

Possible factors include recent failure, available time, source confidence, age, environment, and verified user preference. These are proposed inputs, not universal factors that every intent needs. Reject nonfinite values and invalid policy configurations. Missing optional signals contribute zero and are recorded as missing; missing required signals fail explicitly.

External factors are captured once for the execution. A candidate's adjustments are always recalculated from its base score, never added to the previous execution's adjusted score. This avoids accidental accumulation.

### Worked example

Illustrative policy for `RecommendNextLessonIntent`; these numbers are design examples, not measured results. Assume a maximum of two selected candidates and a minimum score of 50.

| Context candidate | Base | Repeated-error factor | Short-session factor | Final |
|---|---:|---:|---:|---:|
| Recent evidence of a prerequisite gap | 60 | +25 | +10 | 95 |
| Learner's preferred topic | 75 | -10 | 0 | 65 |
| A longer advanced project | 80 | -20 | -25 | 35 |

Without these factors, the advanced project and preferred topic would be selected. With them, prerequisite evidence and preferred topic are selected. Process could recommend a short prerequisite exercise using the preferred topic as its theme.

This demonstrates both selection and influence. Process needs an explicit domain rule for consuming the selected evidence. Simply appending scores to context does not improve an output by itself.

## Selection and execution contract

1. Load required facts and a versioned scoring policy from trusted sources.
2. Capture the execution time, external signals, and candidate revisions.
3. Apply eligibility checks and deduplicate candidates by canonical identity before ranking.
4. Calculate each eligible candidate's score with a contribution breakdown.
5. Sort by descending score, then ascending stable candidate ID for ties.
6. Select candidates meeting the minimum score until the configured count or size budget is exhausted. A later version can reserve space for diverse categories; the initial version should use a simple count budget.
7. Authorize the requested action against required facts.
8. Process uses only the selected optional candidates plus required facts, according to its declared decision rule.
9. Emit returns the outcome and a permitted explanation of the context decision.

An empty selection is an explicit outcome. Each intent declares whether it can proceed with required facts alone or must fail AddContext because optional evidence is essential to its result. Provider failures and timeouts follow the same declared fallback rule, never an implicit success.

Use a dedicated namespace such as `intent.context.adaptiveContext`. It can hold `policyVersion`, `evaluatedAt`, `signalSnapshotId`, `selected`, and `decisionTrace`. Keep required facts in their established fields. Do not overwrite existing context keys with arbitrary candidate IDs.

The trace records candidate IDs and revisions, base scores, individual adjustments, final scores, and selection or rejection reasons. Store only permitted metadata in ordinary logs; reproducible evidence snapshots require access controls and a retention policy. Do not expose excluded private evidence in user-facing explanations.

Replaying the same intent, candidate snapshot, signal snapshot, evaluation time, and policy version must reproduce scoring and selection. Downstream database changes still require the existing concurrency and transaction controls in Process; a ranking snapshot cannot make mutable business state safe to commit.

## Model-updating intentions

There are two distinct operations:

- **Adapt this execution:** external signals adjust scores inside AddContext. This changes the working context, not the saved scoring model.
- **Update future behavior:** an explicit `UpdateContextScoringPolicyIntent` publishes a new policy version. Here “model” means the context decision policy; it does not imply training an AI model.

The update intent would declare all six stages:

| Stage | Responsibility |
|---|---|
| Validate | Check policy target, proposed rules, expected current version, and update reason. |
| Normalize | Canonicalize supported factor names and representations. |
| AddContext | Load verified updater identity, current policy, allowed bounds, and evaluation evidence. |
| Authorize | Check whether this actor may update this policy in this scope. |
| Process | Atomically publish a new immutable version and update the active pointer only if the expected version still matches. |
| Emit | Report the published version and an audit event describing the change. |

An execution pins its policy version when loading context; a policy update affects subsequent executions. Rollback publishes the previous configuration as a new version, preserving history. Stale concurrent update attempts fail with a version conflict.

Keep outcome collection separate from policy publication. Outcomes can suggest weight changes, but early versions should not automatically reward frequently selected candidates: selection frequency is not evidence of usefulness and can reinforce its own mistakes. Any later learning process should produce evaluated policy proposals through the same update intent.

## First implementation slice

Build an isolated `RecommendNextLessonIntent` example with fixed candidate data and injected external signals. Include all six stages, a pure scoring helper, a selection helper, and a Process rule that visibly changes the recommendation. Use named functions and the existing result helpers. The example should run through the actual template pipeline.

Keep the feature opt-in. Existing intents continue using their current providers. Do not change the academy's lesson count, progress assessment, or canonical specification as part of the prototype.

After the example is useful, expose reusable providers and implement the policy-update intent with a real versioned persistence adapter. An in-memory prototype must not be described as durable policy storage.

### Acceptance checks

- The same snapshots and policy reproduce the same scores, selected IDs, and recommendation.
- Positive and negative external factors change the worked example's selection and output as specified.
- Repeated execution does not compound previous score adjustments.
- Required facts and authorization decisions remain effective regardless of candidate scores.
- Expired, duplicate, out-of-scope, and inaccessible candidates do not win selection.
- Ties, empty input, missing signals, invalid numeric values, provider failures, and context-budget limits have explicit outcomes.
- Conflicting authoritative facts fail or resolve through a domain rule, never a relevance contest.
- Policy changes affect subsequent runs; stale updates fail; rollback remains traceable.
- Existing academy checks still pass after any implementation is integrated.

### Measuring whether it helps

Compare the existing context behavior against adaptive selection using representative intent scenarios with expected outcomes defined before tuning. Measure result quality, necessary-evidence coverage, latency, and context size. For the lesson example, assess whether the recommendation addresses the observed gap and fits the available time. Ranking changes alone do not demonstrate an improvement.

## Recommendation

Explore this as an optional **Adaptive Context** capability within AddContext. Begin with transparent rules and an observable domain outcome. Treat durable changes to those rules as separate model-updating intents. Promote the extension into the core ICF documentation only after the prototype establishes useful behavior and compatibility.

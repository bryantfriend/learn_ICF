# ICF Technical Reference for AI Systems

Document status: project technical reference  
ICF version represented: 1.x project contract  
Primary audience: AI coding agents, software architects, and developers  
Project meaning of ICF: **Intent-Centric Framework**, expressed as **Intent + Context + Flow**

To find a bug from a stage trace, start with the [maintainer walkthrough](../Template/README.md#diagnose-a-bug). For an unexpected recommendation, use the [context decision guide](../Template/ADAPTIVE_CONTEXT.md#investigate-a-context-decision).

## 1. Executive Definition

ICF is a software architecture pattern for controlling meaningful actions and state changes.

In ICF, an important action is represented as an explicit **Intent**. The Intent is registered, created with a predictable data envelope, and executed through six mandatory stage groups in this exact order:

```text
Intent Registration (setup, not an execution stage)
        |
        v
Validate -> Normalize -> AddContext -> Authorize -> Process -> Emit
```

The central invariant is:

> No important state mutation should occur outside an Intent execution pipeline.

ICF makes the cause, authorization, execution, and outcome of a state change visible in one controlled flow. The architecture is optimized for readability, auditability, testability, debugging, safe extension, and predictable maintenance.

ICF is not a programming language, user-interface framework, database, event bus, or third-party library. It is an application architecture pattern that can be implemented in JavaScript, Luau, or other languages.

## 2. Normative Language

The terms below have precise meanings in this document:

- **MUST**: required for ICF compliance.
- **MUST NOT**: prohibited for ICF compliance.
- **SHOULD**: recommended unless a documented reason justifies another choice.
- **MAY**: optional.

## 3. Core Mental Model

ICF separates four questions that are often mixed together in conventional application code:

1. **What is being requested?** The Intent.
2. **What trusted facts apply?** The Context.
3. **Is the request valid and permitted?** Validate and Authorize.
4. **How is the action executed and reported?** Process and Emit.

A useful debugging question is:

> Which Intent caused this state to change?

If an important change cannot be traced to an Intent, the implementation probably bypasses ICF.

## 4. When ICF Applies

Full ICF SHOULD be used for meaningful actions that change durable, shared, security-sensitive, financial, educational, gameplay, or business state.

Examples include:

- creating or updating a product;
- changing inventory;
- placing or changing an order;
- completing or synchronizing an invoice;
- submitting an answer or completing a lesson;
- unlocking a module or awarding XP;
- selecting a tenant, organization, class, or store;
- attacking, purchasing, equipping, or claiming a reward in a game;
- running an administrator or system workflow.

Full ICF is normally unnecessary for visual-only local interactions that do not change important state, such as:

- opening a modal;
- switching a local tab;
- expanding a card;
- previewing a color;
- toggling a dropdown.

The boundary test is:

```text
Does this action change important application or domain state?
  yes -> model it as an Intent
  no  -> a direct local UI handler may be sufficient
```

## 5. Terminology

### 5.1 Intent

An Intent is a declarative object describing one meaningful requested action. It contains identity, actor, untrusted input, trusted working context, metadata, and a map of stage steps.

Intent type names SHOULD use a clear action-oriented form such as:

```text
CreateProductIntent
ApproveTransferIntent
CompleteModuleIntent
ClaimRewardChestIntent
```

An Intent file is primarily a declaration and stage map. Business logic belongs in stage files rather than inside the Intent declaration.

### 5.2 Actor

The actor is the person, player, service, or system identity requesting the action.

Typical actor fields:

```js
{
  id: "actor-123",
  role: "student"
}
```

The presence of a role in an input object does not automatically make that role trustworthy. Authorization should rely on verified identity and context.

### 5.3 Payload

The payload is request data supplied to the Intent. Payload data MUST be treated as untrusted until validated and normalized.

Examples:

- product name and price;
- transfer amount and target account;
- answer selection;
- item identifier;
- requested store identifier.

### 5.4 Context

Context is the working set of trusted or system-derived facts needed to decide and execute the action.

Examples:

- verified user role;
- verified tenant or store identifier;
- current database entity;
- player inventory;
- lesson progress;
- server timestamp;
- document references;
- feature flags or policy configuration.

Context is not merely extra payload. Its architectural purpose is to separate client claims from facts loaded or verified by the system.

The template also supports an opt-in Adaptive Context extension within AddContext. It scores eligible optional evidence using versioned, intent-specific category rules and captured external signals. Required facts and authorization remain outside relevance ranking. `RecommendNextLessonIntent` demonstrates a changed output; `UpdateContextScoringPolicyIntent` publishes future scoring rules through all six stages with authorization and version checks. See [the implemented contract and integration guide](../Template/ADAPTIVE_CONTEXT.md). The included policy store is an in-memory reference adapter, not durable production storage.

### 5.5 Stage Group

A stage group is one of the six required execution phases. Each stage group contains one or more named step functions.

### 5.6 Stage Step

A stage step is a small unit of logic within a stage group. A step may be:

- a function; or
- a stage object with metadata and a `run()` function.

Steps in a group execute sequentially in declaration order.

### 5.7 Emit

Emit translates the completed action into controlled outputs such as result data, domain events, audit entries, analytics, or presentation-facing feedback. It must not be confused with arbitrary hidden side effects.

## 6. Canonical Intent Contract

A JavaScript Intent carries the following fields. The named helpers in this example stand for functions exported by the project's stage registries.

```js
var intent = {
  type: "CreateProductIntent",
  description: "Creates one product in the actor's verified store.",
  actor: {
    id: "user-123",
    role: "admin"
  },
  payload: {
    name: "Green Tea",
    price: "12.50"
  },
  context: {},
  meta: {
    createdAt: Date.now(),
    source: "ui"
  },
  stages: {
    Validate: { requireProductFields: validators.requireProductFields },
    Normalize: { normalizeProductPayload: normalizers.normalizeProductPayload },
    AddContext: { addVerifiedStore: contextProviders.addVerifiedStore },
    Authorize: { requireStoreAdmin: authorizers.requireStoreAdmin },
    Process: { createProduct: processors.createProduct },
    Emit: { addProductCreatedEvent: emitters.addProductCreatedEvent }
  }
};
```

Required top-level fields in the project reference implementation:

| Field | Purpose | Trust classification |
|---|---|---|
| `type` | Stable action identifier | Declared by registered factory |
| `actor` | Requesting identity | Must be authenticated or verified |
| `payload` | Request input | Untrusted |
| `context` | Trusted working facts and results | System-derived or verified |
| `stages` | Complete execution map | Application code |

Recommended fields:

| Field | Purpose |
|---|---|
| `description` | Human-readable action summary |
| `meta.createdAt` | Creation time |
| `meta.source` | Origin such as UI, API, game, job, or system |
| `meta.intentId` | Correlation or audit identifier when needed |

An empty object is valid for `payload` or `context`; a missing object is not.

## 7. Registration and Creation

Registration is a setup step, not one of the six runtime stages.

An Intent registry maps an Intent type to a factory:

```text
"CreateProductIntent" -> createCreateProductIntent(actor, payload, options)
```

The registry SHOULD:

- reject missing or invalid type names;
- reject non-function factories;
- prevent accidental duplicate registration unless replacement is explicit;
- create Intents only through registered factories;
- verify that the created Intent type matches the requested type;
- verify the basic Intent envelope before execution.

Use the registry at application entry points to centralize supported actions. The runner also validates the envelope and stage groups when it receives an Intent directly.

When a `registerIntents` batch contains a duplicate or invalid factory, the reference registry reports the errors and lists the successful registrations in `registeredTypes`. Those entries are already installed. Stop startup, correct the registration map and verify it in a fresh process before accepting requests.

## 8. Mandatory Execution Pipeline

Every Intent MUST include all six stage groups, in this exact order:

| Order | Stage | Primary responsibility | State mutation allowed? |
|---:|---|---|---|
| 1 | `Validate` | Check shape, fields, types, and preconditions | No |
| 2 | `Normalize` | Canonicalize payload values | No important mutation |
| 3 | `AddContext` | Load and attach trusted facts | No main mutation |
| 4 | `Authorize` | Decide whether the actor may act | No |
| 5 | `Process` | Perform the main state transition | Yes |
| 6 | `Emit` | Produce controlled results and follow-up signals | Controlled side effects only |

Missing or empty stage groups are architecture errors. If a stage has no work, it MUST contain an explicit pass-through step.

### 8.1 Validate

Validate checks whether the request is structurally and semantically eligible to continue.

Validate MAY check:

- required fields;
- field types;
- supported values;
- basic business preconditions;
- current entity state when already available.

Validate MUST NOT:

- write to a database;
- perform the requested action;
- make authorization decisions that require trusted context;
- trigger UI feedback.

Example failure:

```js
{
  ok: false,
  stage: "Validate",
  errors: [
    "Missing product name.",
    "Price must be numeric."
  ]
}
```

### 8.2 Normalize

Normalize converts valid input into canonical application form.

Normalize MAY:

- trim strings;
- parse numeric strings;
- standardize case;
- canonicalize dates;
- apply safe defaults;
- convert equivalent representations to one format.

Normalize MUST NOT:

- authorize the actor;
- write important state;
- silently invent security-sensitive values;
- treat client claims as trusted context.

Normalization should be deterministic and idempotent where practical.

### 8.3 AddContext

AddContext loads or verifies facts needed by later stages.

Examples:

- resolve the authenticated actor and verified role;
- resolve a server-approved `storeId`;
- load an existing order or product;
- attach current subscription rules;
- attach player inventory or lesson progress;
- add a server timestamp.

This stage defines the main trust boundary:

```text
Client/request claims -> payload (untrusted)
System-loaded facts   -> context (trusted after verification)
```

AddContext MUST NOT blindly copy sensitive claims from payload into trusted context.

### 8.4 Authorize

Authorize decides whether the verified actor may perform the requested action against the resolved context.

Authorization SHOULD be explicit, readable, and deny with a useful reason. It MUST execute before Process.

Example:

```js
{
  ok: false,
  stage: "Authorize",
  reason: "Only store administrators may create products."
}
```

Authorization in application code does not replace database rules, server validation, or platform security controls. Those controls should align with the ICF authorization policy.

### 8.5 Process

Process performs the main state transition.

Examples:

- create a database record;
- update inventory;
- complete an invoice;
- award XP;
- apply damage;
- transfer funds.

Process SHOULD:

- make the state transition explicit;
- reject illegal transitions;
- avoid partial mutation;
- use transactions or idempotency controls where the domain requires them;
- place useful output in `intent.context.resultData`.

Process SHOULD NOT directly control UI presentation.

### 8.6 Emit

Emit creates controlled outputs after successful processing.

Emit MAY:

- add result messages;
- add domain or integration events;
- write audit records;
- trigger analytics;
- request UI feedback such as notifications, sound, or confetti;
- publish replicated game feedback.

In the reference implementation, result data and events are conventionally stored as:

```js
intent.context.resultData = {};
intent.context.events = [];
```

Emit should not conceal a second unrelated business transaction. A separate meaningful action should normally be represented by another Intent.

## 9. Stage Step Contract

The preferred successful step result is:

```js
{
  ok: true,
  intent: updatedIntent
}
```

A pass-through step may return the unchanged Intent:

```js
function passNormalize(intent) {
  return {
    ok: true,
    intent: intent
  };
}
```

The preferred failed step result is:

```js
{
  ok: false,
  errors: [
    "Readable reason."
  ]
}
```

The pipeline normalizes failures with the stage and step that failed:

```js
{
  ok: false,
  stage: "Authorize",
  step: "requireStoreAdmin",
  errors: [
    "Only store administrators may create products."
  ]
}
```

Stage steps MAY be asynchronous. The runner catches a thrown error and includes its message in the failure result and trace. Adapters should translate service errors into messages suitable for those surfaces before returning or throwing them. The application controls which fields reach clients and persistent logs.

## 10. Runner Semantics

The ICF runner is sequential and fail-fast.

Reference pseudocode:

```text
function run(intent):
    validate basic intent envelope
    validate all six non-empty stage groups

    currentIntent = intent

    for stageName in [
        Validate,
        Normalize,
        AddContext,
        Authorize,
        Process,
        Emit
    ]:
        for step in currentIntent.stages[stageName]:
            result = await step(currentIntent)

            record trace(stageName, stepName, result, duration)

            if result.ok is not true:
                return normalized failure immediately

            if result contains an updated intent:
                currentIntent = result.intent

    return normalized success with:
        final intent
        result data
        events
        timing metadata
        pipeline trace
```

Runner invariants:

- stage order is fixed;
- step order within each stage group is fixed;
- no later step runs after a failure;
- a successful step may return an updated Intent;
- if a successful step omits an updated Intent, the current Intent continues;
- a missing, empty, or invalid stage group fails before execution;
- a step that returns no result fails clearly;
- a thrown exception becomes a structured failure;
- secrets MUST NOT be exposed through normalized error messages or logs.

## 11. Final Result Contracts

Preferred success shape:

```js
{
  ok: true,
  intent: finalIntent,
  data: {},
  events: [],
  meta: {
    startedAt: 0,
    finishedAt: 0,
    durationMs: 0,
    pipelineTrace: []
  }
}
```

Preferred failure shape:

```js
{
  ok: false,
  stage: "Process",
  step: "createProduct",
  errors: [
    "Product could not be created."
  ],
  meta: {
    startedAt: 0,
    finishedAt: 0,
    durationMs: 0,
    pipelineTrace: []
  }
}
```

Results SHOULD be stable enough for UI code, APIs, tests, logs, and AI agents to inspect without guessing.

## 12. File and Module Architecture

A growing JavaScript implementation should separate engine code, Intent declarations, and stage logic:

```text
ICF/
  engine/
    pipeline.js
    intentRegistry.js
    resultHelpers.js
  Intents/
    intents.js
    CreateProductIntent.js
  Stages/
    Validators/
      validators.js
      Core/
      Domain/
    Normalizers/
      normalizers.js
      Core/
      Domain/
    ContextProviders/
      contextProviders.js
      Core/
      Domain/
    Authorizers/
      authorizers.js
      Core/
      Domain/
    Processors/
      processors.js
      Core/
      Domain/
    Emitters/
      emitters.js
      Core/
      Domain/
```

Each distinct validator, normalizer, context provider, authorizer, processor, and emitter SHOULD live in its own file. Category registry files collect and expose named helpers. Domain-specific behavior belongs under `Domain`; reusable framework behavior belongs under `Core`.

Intent declarations SHOULD remain small enough to scan quickly. They should reference stage functions, not contain the stage implementations inline.

## 13. Worked Example

The following condensed example shows the architecture, not a complete database implementation:

```js
function createCreateProductIntent(actor, payload, options) {
  return {
    type: "CreateProductIntent",
    description: "Creates a product in a verified store.",
    actor: actor,
    payload: payload,
    context: {},
    meta: {
      source: options.source,
      createdAt: Date.now()
    },
    stages: {
      Validate: {
        requireProductFields: validators.requireProductFields
      },
      Normalize: {
        normalizeProductPayload: normalizers.normalizeProductPayload
      },
      AddContext: {
        addVerifiedStore: contextProviders.addVerifiedStore
      },
      Authorize: {
        requireStoreAdmin: authorizers.requireStoreAdmin
      },
      Process: {
        createProduct: processors.createProduct
      },
      Emit: {
        addProductCreatedEvent: emitters.addProductCreatedEvent
      }
    }
  };
}
```

Expected flow:

1. `requireProductFields` rejects missing or malformed input.
2. `normalizeProductPayload` trims the name and parses the price.
3. `addVerifiedStore` derives the store from authenticated server-side data.
4. `requireStoreAdmin` verifies access to that store.
5. `createProduct` performs the database write and saves the new product ID in result data.
6. `addProductCreatedEvent` creates a controlled event for downstream feedback.

The UI handler should only create/run the Intent and render its result. It should not duplicate authorization or database mutation logic.

## 14. State, Reliability, and Consistency

### 14.1 State Transitions

Domains SHOULD define legal transitions. Invalid transitions should fail before or during Process.

Example:

```text
pending -> confirmed -> preparing -> delivered
```

The transition `delivered -> pending` should fail unless a specific authorized Intent defines that reversal.

### 14.2 Determinism

Given the same Intent, trusted context, and system state, execution SHOULD produce the same result. Hidden randomness, hidden mutation, and implicit global dependencies reduce ICF predictability.

When randomness is required, such as a game outcome, it should be generated or injected explicitly and recorded in context or audit data.

### 14.3 Atomicity

Each Intent should either fully succeed or fully fail. For multi-write operations, use database transactions, compensating actions, or workflow state appropriate to the platform.

### 14.4 Idempotency

Retryable or externally triggered Intents SHOULD use an Intent ID, idempotency key, or state check to prevent duplicate state changes.

### 14.5 Orchestration

A complex workflow MAY coordinate multiple Intents. The orchestrator should keep each state-changing action explicit, define failure policy, and preserve correlation IDs. It should not bypass the six-stage contract for convenience.

## 15. Security Model

ICF improves security structure but is not a security boundary by itself.

Required principles:

- treat payload and client-provided context as untrusted;
- resolve trusted facts during AddContext;
- authorize before Process;
- validate important multiplayer or remote actions on the server;
- align database or platform security rules with ICF authorization;
- apply rate limits or cooldowns to high-frequency sensitive Intents;
- avoid logging passwords, tokens, private messages, payment data, credentials, or sensitive personal data;
- return safe errors without leaking implementation secrets.

For multi-tenant data, tenant identifiers such as `storeId` MUST be verified rather than trusted from the request.

## 16. Observability and Audit

The pipeline SHOULD produce enough information to reconstruct what happened without exposing secrets.

Useful trace fields:

- Intent ID and type;
- actor ID;
- stage and step names;
- success or failure;
- safe error messages;
- duration per step;
- total duration;
- emitted event types;
- timestamp and source.

The runner records stage, step, success flag, duration and error messages in `result.meta.pipelineTrace`. Preflight failures return `stage: "Pipeline"` and an empty trace. Registration and creation can fail before `pipeline.run` is called. A failed Emit can follow a committed Process, so check the underlying state before retrying an action.

A successful adaptive run also carries `result.intent.context.adaptiveContext.decisionTrace`. This explains each candidate's eligibility and score for the captured policy and signals. Capture the replay inputs separately if the decision must be reproducible later. Limit access to decisions and snapshots that identify private evidence.

Audit records are especially important for financial, administrative, educational-progress, and high-value gameplay actions.

## 17. Testing Strategy

Tests should mirror the architecture.

### Unit tests

Test each stage step independently:

- validators accept and reject the correct shapes;
- normalizers produce canonical values;
- context providers use trusted sources;
- authorizers allow and deny correctly;
- processors enforce state transitions;
- emitters produce predictable data and events.

### Pipeline tests

Verify:

- all six groups execute in order;
- steps within a group execute in order;
- failure stops later execution;
- missing or empty groups fail;
- thrown errors become structured failures;
- updated Intent data reaches later stages;
- result data, events, and traces have stable shapes.

### Integration tests

Verify real persistence, transactions, platform security alignment, retries, idempotency, and external side effects.

## 18. Common Non-Compliant Patterns

### Direct mutation in a UI handler

```text
button click -> database write -> toast
```

Why it is non-compliant: validation, trusted context, authorization, mutation, and feedback are coupled and difficult to audit.

ICF replacement:

```text
button click -> CreateProductIntent -> pipeline -> structured result
```

### Trusting client-provided authorization context

```text
payload.role = "admin"
payload.storeId = "store-b"
```

Why it is unsafe: the requester controls the claim.

ICF replacement: load verified role and store membership during AddContext, then authorize against them.

### Omitting a stage because it has no work

Why it is non-compliant: the architecture becomes implicit and inconsistent.

ICF replacement: include a named pass-through step.

### Performing database writes during Validate or Authorize

Why it is non-compliant: precondition checks gain hidden side effects, and failures can leave partial state.

ICF replacement: reserve the main mutation for Process.

### Putting all logic inside the Intent file

Why it is harmful: the declaration becomes hard to scan, reuse, test, and maintain.

ICF replacement: keep the Intent as a stage map and move logic to focused stage modules.

### Treating Emit as unlimited post-processing

Why it is harmful: unrelated mutations become hidden after the primary action.

ICF replacement: keep Emit focused on results and controlled signals; create another Intent for another meaningful state change.

## 19. Implementation Procedure

For a new or revised ICF feature, work through these questions and checks. The resulting Intent, named helpers and tests form a handoff a maintainer can use locally.

1. Identify the meaningful action and choose one clear Intent name.
2. Identify the actor and how identity is verified.
3. Define the untrusted payload.
4. Define which trusted facts AddContext must load.
5. Define validation rules separately from authorization rules.
6. Define the exact allowed state transition.
7. Define the single primary mutation performed by Process.
8. Define result data and events produced by Emit.
9. Map every rule to a named stage step and file.
10. Confirm all six stage groups exist and are non-empty.
11. Define predictable success and failure shapes.
12. Add tests at step, pipeline, and integration levels as appropriate.
13. Check that no legacy path still bypasses the Intent for the same action.
14. Check logging and errors for sensitive data.

An AI agent should not infer that existing direct mutations are automatically acceptable merely because they currently work. It should identify them as migration candidates while preserving behavior and choosing a low-risk refactor path.

## 20. Machine-Readable Summary

```yaml
architecture:
  name: Intent-Centric Framework
  abbreviation: ICF
  conceptual_expansion:
    - Intent
    - Context
    - Flow
  purpose: Control meaningful actions and state mutations through explicit, auditable pipelines.

core_invariant: No important state mutation occurs outside an Intent pipeline.

registration:
  execution_stage: false
  purpose: Map stable Intent types to validated Intent factories.

intent:
  required_fields:
    - type
    - actor
    - payload
    - context
    - stages
  recommended_fields:
    - description
    - meta.createdAt
    - meta.source
    - meta.intentId
  payload_trust: untrusted
  context_trust: trusted_only_after_system_verification

pipeline:
  sequential: true
  fail_fast: true
  required_non_empty_stages:
    - Validate
    - Normalize
    - AddContext
    - Authorize
    - Process
    - Emit

stage_responsibilities:
  Validate: Check structure, fields, types, and preconditions without mutation.
  Normalize: Convert payload into canonical form without authorization or important mutation.
  AddContext: Load or verify trusted facts required for decisions and execution.
  Authorize: Decide whether the verified actor may act in the verified context.
  Process: Perform the primary state transition.
  Emit: Produce controlled result data, events, audit signals, and feedback.

step_success_contract:
  ok: true
  intent: updated_or_unchanged_intent

step_failure_contract:
  ok: false
  stage: failing_stage
  step: failing_step
  errors:
    - safe_human_readable_error

compliance_checks:
  - All important mutations map to a named Intent.
  - All six stages exist and contain at least one explicit step.
  - Stage order is fixed.
  - Payload is never automatically trusted.
  - Trusted context is system-derived or verified.
  - Authorization occurs before Process.
  - Main mutation occurs in Process.
  - Failures stop later steps.
  - Results and errors have predictable shapes.
  - Logs and traces exclude secrets and sensitive data.
```

## 21. Compact Compliance Checklist

An implementation is ICF-compliant when all answers are **yes**:

- Is the action represented by a clear, registered Intent?
- Does the Intent identify its actor, payload, context, and stage map?
- Are all six required stage groups present and non-empty?
- Do the stage groups run in the required order?
- Is request input treated as untrusted?
- Are trusted facts loaded or verified in AddContext?
- Does authorization complete before Process?
- Is the main state mutation isolated in Process?
- Does Emit expose controlled results or events?
- Does any failure stop the remaining pipeline?
- Are success and failure results predictable?
- Can logs or traces identify the failing stage and step safely?
- Can a developer answer, "Which Intent caused this change?"

## 22. Project Source Map

This reference is synthesized from the current project materials:

- `ICF_Formal_Specification_v1.0.pdf` - formal project specification;
- `Core.docx` - core explanatory source;
- `Template/ICF.md` - canonical implementation rules;
- `Template/ICF/engine/pipeline.js` - executable runner contract;
- `Template/ICF/engine/intentRegistry.js` - registration and creation contract;
- `Template/ICF/engine/resultHelpers.js` - standard result helpers;
- `Template/ICF/Intents/DemoIntent.js` - minimal complete Intent example;
- `Template/AGENTS.md` - project guidance to copy into downstream projects;
- `Documents/AGENTS.md` - guidance on maintaining documentation here;
- beginner, intermediate, advanced, and Roblox course materials - teaching and platform examples.

If project-specific documentation conflicts with a generic interpretation of "ICF," this project's definition and six-stage contract take precedence.

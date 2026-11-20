export const adoptionGuide = [
  {
    title: "Set up a local project",
    body: "Start in a local checkout of the academy with Node.js 22 or newer. This command creates a new seat-demo directory, copies the framework, and prepares one domain directory per stage. Run each line in your terminal. Use an empty destination so earlier work stays safe. The last command runs the framework’s own diagnostic fixtures.",
    language: "Terminal · academy checkout",
    source: "Template/README.md",
    code: `node --version
node -e "const fs = require('node:fs'); fs.mkdirSync('seat-demo'); fs.cpSync('Template/ICF', 'seat-demo/ICF', { recursive: true }); for (const group of ['Validators','Normalizers','ContextProviders','Authorizers','Processors','Emitters']) fs.mkdirSync('seat-demo/ICF/Stages/' + group + '/Domain/seats', { recursive: true });"
cd seat-demo
node ICF/examples/checkPipeline.mjs`
  },
  {
    title: "Describe the reservation",
    body: "A member can reserve one available seat by ID. Ava and Bo are the two verified members in this fixture. A1 and B2 start empty. One successful reservation changes one owner and produces one SeatReserved event. A bad ID, an unknown seat, a guest, or an occupied seat must leave ownership intact. Each file path below is relative to seat-demo."
  },
  {
    title: "Create the local seating adapter",
    body: "Save this as seating-store.mjs. Each store starts with the same named members and seats. readFacts returns a copy of the relevant facts. reserveIfFree rechecks the current owner at the point of mutation. A shared database implementation would check and write in one transaction.",
    language: "seating-store.mjs",
    code: `export function createSeatingStore() {
  const members = new Set(["ava", "bo"]);
  const owners = new Map([["A1", null], ["B2", null]]);
  return {
    readFacts: function readFacts(actorId, seatId) {
      return {
        member: members.has(actorId),
        exists: owners.has(seatId),
        owner: owners.get(seatId)
      };
    },
    reserveIfFree: function reserveIfFree(actorId, seatId) {
      if (!members.has(actorId) || !owners.has(seatId) || owners.get(seatId) !== null) {
        return { ok: false, errors: ["Reservation could not be committed."] };
      }
      owners.set(seatId, actorId);
      return { ok: true };
    }
  };
}`
  },
  {
    title: "Validate the request",
    body: "Save this file at the path shown. The actor comes from the calling application. The payload supplies a seat ID. Reject an empty name before any storage access. The runner adds the named stage and step to a failed result.",
    language: "ICF/Stages/Validators/Domain/seats/requireSeatId.js",
    code: `export function requireSeatId(intent) {
  if (typeof intent.actor.id !== "string" || !intent.actor.id.trim()) {
    return { ok: false, errors: ["Actor ID required."] };
  }
  const id = intent.payload.seatId;
  if (typeof id !== "string" || !id.trim()) {
    return { ok: false, errors: ["Seat ID required."] };
  }
  return { ok: true };
}`
  },
  {
    title: "Normalize the seat ID",
    body: "Save this helper at the path shown. The string ' a1 ' becomes A1. Validate already checked the type, so Normalize can perform a single predictable conversion.",
    language: "ICF/Stages/Normalizers/Domain/seats/normalizeSeatId.js",
    code: `export function normalizeSeatId(intent) {
  intent.payload.seatId = intent.payload.seatId.trim().toUpperCase();
  return { ok: true, intent };
}`
  },
  {
    title: "Load trusted seating facts",
    body: "Save this helper at the path shown. Its store is configured by the application during startup. An unknown seat stops the request in AddContext. Known seats carry their actual owner and the verified membership fact into Authorize.",
    language: "ICF/Stages/ContextProviders/Domain/seats/loadSeatFacts.js",
    code: `export function makeLoadSeatFacts(store) {
  return function loadSeatFacts(intent) {
    const facts = store.readFacts(intent.actor.id, intent.payload.seatId);
    if (!facts.exists) return { ok: false, errors: ["Unknown seat."] };
    intent.context.seating = facts;
    return { ok: true, intent };
  };
}`
  },
  {
    title: "Check eligibility and availability",
    body: "Save this helper at the path shown. Both conditions come from the stored facts. A caller-supplied role or membership flag cannot grant a seat in this example.",
    language: "ICF/Stages/Authorizers/Domain/seats/allowReservation.js",
    code: `export function allowReservation(intent) {
  const facts = intent.context.seating;
  if (!facts.member) return { ok: false, errors: ["Members only."] };
  if (facts.owner !== null) return { ok: false, errors: ["Seat already reserved."] };
  return { ok: true };
}`
  },
  {
    title: "Commit the reservation",
    body: "Save this helper at the path shown. A second request can pass Authorize before the first finishes. The store’s final availability check settles which reservation succeeds. Process attaches the data for a receipt only after the store accepts the change.",
    language: "ICF/Stages/Processors/Domain/seats/reserveSeat.js",
    code: `export function makeReserveSeat(store) {
  return function reserveSeat(intent) {
    const seatId = intent.payload.seatId;
    const memberId = intent.actor.id;
    const saved = store.reserveIfFree(memberId, seatId);
    if (!saved.ok) return saved;
    intent.context.resultData = { seatId, memberId };
    return { ok: true, intent };
  };
}`
  },
  {
    title: "Emit the receipt",
    body: "Save this helper at the path shown. A successful result now contains an event with the committed seat and member IDs. This fixture collects the event in memory. A production receipt service needs its own delivery and deduplication contract.",
    language: "ICF/Stages/Emitters/Domain/seats/emitSeatReserved.js",
    code: `export function emitSeatReserved(intent) {
  const data = intent.context.resultData;
  intent.context.events = [{
    type: "SeatReserved",
    data: { seatId: data.seatId, memberId: data.memberId }
  }];
  return { ok: true, intent };
}`
  },
  {
    title: "Declare the six stages",
    body: "Create ICF/Intents/ReserveSeatIntent.js. Its factory binds the store at startup and makes fresh payload, context and stage groups for each request. The names in this table are the names you will read in a failure trace.",
    language: "ICF/Intents/ReserveSeatIntent.js",
    source: "Template/ICF/Intents/RecommendNextLessonIntent.js",
    code: `import { requireSeatId } from "../Stages/Validators/Domain/seats/requireSeatId.js";
import { normalizeSeatId } from "../Stages/Normalizers/Domain/seats/normalizeSeatId.js";
import { makeLoadSeatFacts } from "../Stages/ContextProviders/Domain/seats/loadSeatFacts.js";
import { allowReservation } from "../Stages/Authorizers/Domain/seats/allowReservation.js";
import { makeReserveSeat } from "../Stages/Processors/Domain/seats/reserveSeat.js";
import { emitSeatReserved } from "../Stages/Emitters/Domain/seats/emitSeatReserved.js";

export function createReservationFactory(store) {
  return function createReservation(actor, payload) {
    return {
      type: "ReserveSeatIntent", actor, payload: { seatId: payload.seatId },
      context: {}, meta: { source: "seating-desk" },
      stages: {
        Validate: { requireSeatId },
        Normalize: { normalizeSeatId },
        AddContext: { loadSeatFacts: makeLoadSeatFacts(store) },
        Authorize: { allowReservation },
        Process: { reserveSeat: makeReserveSeat(store) },
        Emit: { emitSeatReserved }
      }
    };
  };
}`
  },
  {
    title: "Register the feature and expose its entry point",
    body: "Create seating.mjs beside seating-store.mjs. Importing the module sets up one store and one factory per process. reserve constructs a fresh Intent for every request. In a deployed service, derive actorId from the authenticated session before calling this entry point.",
    language: "seating.mjs",
    source: "Template/ICF/engine/intentRegistry.js",
    code: `import registry from "./ICF/engine/intentRegistry.js";
import pipeline from "./ICF/engine/pipeline.js";
import { createReservationFactory } from "./ICF/Intents/ReserveSeatIntent.js";
import { createSeatingStore } from "./seating-store.mjs";

export const store = createSeatingStore();
const registered = registry.registerIntent("ReserveSeatIntent", createReservationFactory(store));
if (!registered.ok) throw new Error(registered.errors.join(" "));

export async function reserve(actorId, seatId) {
  const actor = { id: actorId, role: "visitor" };
  const created = registry.createIntent("ReserveSeatIntent", actor, { seatId });
  if (!created.ok) throw new Error(created.errors.join(" "));
  return pipeline.run(created.intent);
}`
  },
  {
    title: "Add a command-line caller",
    body: "Save try-seats.mjs at the project root. Arguments arrive as actor and seat pairs. One invocation shares one store, so you can observe a conflict. Starting a new process resets the fixture.",
    language: "try-seats.mjs",
    code: `import { reserve } from "./seating.mjs";

const inputs = process.argv.slice(2);
if (!inputs.length || inputs.length % 2) {
  throw new Error('Usage: node try-seats.mjs ava " a1 " bo B2');
}
for (let index = 0; index < inputs.length; index += 2) {
  const result = await reserve(inputs[index], inputs[index + 1]);
  if (result.ok) {
    console.log("RESERVED", result.data.seatId, result.data.memberId, result.events[0].type);
  } else {
    console.log("STOP", result.stage + "." + result.step, result.errors.join(" "));
  }
}`
  },
  {
    title: "Run a passing case and a failure",
    body: "Run this inside seat-demo. After the stage logs, look for RESERVED A1 ava SeatReserved and then STOP Authorize.allowReservation Seat already reserved. Read the last named step before changing the feature.",
    language: "Terminal · seat-demo",
    code: `node try-seats.mjs ava " a1 " bo A1`
  },
  {
    title: "Keep an executable regression check",
    body: "Save check-seats.mjs in the project root. The assertions check the raw-input failure, lookup failure, authorization failure, one successful write and event, and the stored owner after a second request. Node exits unsuccessfully if any contract changes.",
    language: "check-seats.mjs",
    code: `import assert from "node:assert/strict";
import { reserve, store } from "./seating.mjs";

async function expectStop(actor, seat, stage, step) {
  const result = await reserve(actor, seat);
  assert.equal(result.ok, false);
  assert.equal(result.stage, stage);
  assert.equal(result.step, step);
  assert.equal(result.meta.pipelineTrace.at(-1).ok, false);
}

await expectStop("ava", " ", "Validate", "requireSeatId");
await expectStop("ava", "Z9", "AddContext", "loadSeatFacts");
await expectStop("guest", "A1", "Authorize", "allowReservation");
assert.equal(store.readFacts("ava", "A1").owner, null);

const result = await reserve("ava", " a1 ");
assert.equal(result.ok, true);
assert.deepEqual(result.data, { seatId: "A1", memberId: "ava" });
assert.deepEqual(result.events, [{ type: "SeatReserved", data: result.data }]);
assert.deepEqual(result.meta.pipelineTrace.map(function stage(row) { return row.stage; }),
  ["Validate", "Normalize", "AddContext", "Authorize", "Process", "Emit"]);

await expectStop("bo", "A1", "Authorize", "allowReservation");
assert.equal(store.readFacts("bo", "A1").owner, "ava");
console.log("Seating checks passed.");`
  },
  {
    title: "Verify locally and adapt one boundary at a time",
    body: "Run the regression check from seat-demo. Its final line is “Seating checks passed.” For a real feature, keep these fixtures and add a test for your database’s conditional update, authenticated actor lookup and delivery adapter. Register the factory once in the application startup path. Route both the UI and API through the same Intent entry point.",
    language: "Terminal · seat-demo",
    source: "Template/ICF.md",
    code: `node check-seats.mjs`
  }
];

export const workflowGroups = [
  {
    id: "field-adaptive",
    title: "Adaptive Context in practice",
    examples: [
      {
        id: "field-signal-baseline",
        title: "Compare the learner before and after a difficult session",
        task: "From the academy root, run the template's two complete recommendation fixtures. Find the lessonId, score and policy version in each response.",
        code: `node Template/ICF/examples/runAdaptiveContext.mjs`,
        language: "Terminal · academy root",
        expected: "With no signals, advanced-project wins at 80. With repeatedErrors and shortSession both set to 1, prerequisite-review wins at 95. The policy stays at version 1.",
        why: "The common policy lets you isolate the effect of the signal snapshot. A changed recommendation can be correct even though nobody edited the configuration.",
        source: "Template/ICF/examples/runAdaptiveContext.mjs",
        related: "adaptive-context"
      },
      {
        id: "field-expiry",
        title: "Reproduce an empty selection at the expiry boundary",
        task: "Run this from the academy root. It repeats the lesson fixture with the clock moved from 1000 to 10000, the candidates’ exact expiry time.",
        code: `node Template/ICF/examples/runAdaptiveContext.mjs --expired`,
        language: "Terminal · academy root",
        expected: "The run ends at AddContext.addAdaptiveContext. The error includes expired=3. Process and Emit never receive the request.",
        why: "Eligibility uses an exclusive expiry boundary. The timestamps explain why even the highest base score cannot win.",
        source: "Template/ICF/examples/runAdaptiveContext.mjs",
        related: "evidence-eligibility"
      },
      {
        id: "field-budget-tie",
        title: "Resolve a tie under a one-candidate budget",
        task: "Save the block in an .mjs file in the academy root and run it with Node. Limit selection to one and set the project and preference base scores to 75.",
        code: `import { rankContextCandidates } from "./Template/ICF/engine/adaptiveContext.js";
import { createLessonCandidates, createLessonPolicy } from "./Template/ICF/examples/lessonServices.js";

const policy = createLessonPolicy();
const candidates = createLessonCandidates();
const execution = {
  intentType: policy.intentType, scope: policy.scope,
  evaluatedAt: 1000, signalSnapshotId: "lab-1"
};

policy.maxCandidates = 1;
policy.categories.project.baseScore = 75;
for (const input of [candidates, candidates.slice().reverse()]) {
  const decision = rankContextCandidates(input, {}, policy, execution);
  console.log(decision.selected[0].id, decision.selected[0].score);
}`,
        language: "JavaScript · .mjs at academy root",
        expected: "Both runs print interest 75. Reversing the incoming records leaves the winner unchanged.",
        why: "A stable ID breaks a score tie. The sort determines which candidate fits the remaining budget.",
        source: "Template/ICF/engine/adaptiveContext.js",
        related: "evidence-scores"
      },
      {
        id: "field-signal-due",
        title: "Evaluate one proposed signal offline",
        task: "Create an .mjs file in the academy root. Introduce a practiceDue signal from a fixture and preserve the no-signal baseline.",
        code: `import { rankContextCandidates } from "./Template/ICF/engine/adaptiveContext.js";
import { createLessonCandidates, createLessonPolicy } from "./Template/ICF/examples/lessonServices.js";

const policy = createLessonPolicy();
const candidates = createLessonCandidates();
const execution = {
  intentType: policy.intentType, scope: policy.scope,
  evaluatedAt: 1000, signalSnapshotId: "lab-1"
};

policy.categories.prerequisite.factors.practiceDue = 25;
for (const signals of [{}, { practiceDue: 1 }]) {
  const snapshot = { ...execution, signalSnapshotId: JSON.stringify(signals) };
  const winner = rankContextCandidates(candidates, signals, policy, snapshot).selected[0];
  console.log(winner.id, winner.score);
}`,
        language: "JavaScript · .mjs at academy root",
        expected: "The first run prints project 80. The second prints gap 85. The candidate set, evaluation time and other policy weights match across runs.",
        why: "This gives a reviewer a passing baseline and a measurable expected change before wiring a real schedule adapter.",
        source: "Template/ICF/examples/lessonServices.js",
        related: "evidence-scores"
      },
      {
        id: "field-denied-recommendation",
        title: "Run a strong recommendation through a denied permission",
        task: "Save the block as an .mjs file at the academy root. The signals favor review, but the trusted learner record forbids recommending.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import { createLessonRecommendationFactory } from "./Template/ICF/Intents/RecommendNextLessonIntent.js";
import { createDemoLessonServices } from "./Template/ICF/examples/lessonServices.js";

const services = createDemoLessonServices({
  allowed: false, signals: { repeatedErrors: 1, shortSession: 1 }
});
const makeIntent = createLessonRecommendationFactory(services);
const result = await pipeline.run(makeIntent({ id: "learner", role: "student" }, {}));
console.log(result.ok, result.stage, result.step);`,
        language: "JavaScript · .mjs at academy root",
        expected: "The final line is false Authorize authorizeLessonRecommendation. The result contains no recommendation data.",
        why: "The trace shows that required permission still controls entry to Process after optional evidence was ranked.",
        source: "Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizeLessonRecommendation.js",
        related: "authorize"
      },
      {
        id: "field-stale-publish",
        title: "Diagnose two editors competing to publish",
        task: "Save the block as an .mjs file in the academy root. Submit two independent requests that both expect policy version 1.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import { createContextPolicyUpdateFactory } from "./Template/ICF/Intents/UpdateContextScoringPolicyIntent.js";
import { createDemoLessonServices, createLessonPolicy } from "./Template/ICF/examples/lessonServices.js";

const services = createDemoLessonServices();
const makeUpdate = createContextPolicyUpdateFactory(services);
const editor = { id: "editor", role: "admin" };
async function update(policy, version, reason) {
  return pipeline.run(makeUpdate(editor, { policy, expectedVersion: version, reason }));
}
const proposal = createLessonPolicy();
proposal.categories.prerequisite.baseScore = 95;

const responses = await Promise.all([
  update(proposal, 1, "Adjust review weight"),
  update(proposal, 1, "Recheck review weight")
]);
for (const response of responses) {
  console.log(response.ok ? response.data.policyVersion : response.errors[0]);
}
console.log("history", (await services.policyStore.history()).length);`,
        language: "JavaScript · .mjs at academy root",
        expected: "One request publishes version 2. The other reports Policy version conflict. History contains two entries including the original policy.",
        why: "Expected-version checks turn a concurrent write into an observable Process failure. Review the winning policy before preparing another proposal.",
        source: "Template/ICF/Intents/UpdateContextScoringPolicyIntent.js",
        related: "policy-updates"
      },
      {
        id: "field-rollback",
        title: "Restore a configuration and retain its change history",
        task: "Save the block as an .mjs file in the academy root. Publish the changed proposal, read the original policy from history and publish that configuration again.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import { createContextPolicyUpdateFactory } from "./Template/ICF/Intents/UpdateContextScoringPolicyIntent.js";
import { createDemoLessonServices, createLessonPolicy } from "./Template/ICF/examples/lessonServices.js";

const services = createDemoLessonServices();
const makeUpdate = createContextPolicyUpdateFactory(services);
const editor = { id: "editor", role: "admin" };
async function update(policy, version, reason) {
  return pipeline.run(makeUpdate(editor, { policy, expectedVersion: version, reason }));
}
const proposal = createLessonPolicy();
proposal.categories.prerequisite.baseScore = 95;

const changed = await update(proposal, 1, "Try review-first policy");
if (!changed.ok) throw new Error(changed.errors.join(" "));
const original = (await services.policyStore.history())[0];
const restored = await update(original, 2, "Restore baseline after review");
if (!restored.ok) throw new Error(restored.errors.join(" "));
const active = await services.policyStore.read();
console.log(active.version, active.categories.prerequisite.baseScore);
console.log((await services.policyStore.history()).length);`,
        language: "JavaScript · .mjs at academy root",
        expected: "The final lines are 3 60 and 3. The restored rules have a new version and the earlier change still appears in history.",
        why: "A new version identifies exactly when the original behavior returned for future evaluations.",
        source: "Template/ICF/engine/contextPolicyStore.js",
        related: "policy-updates"
      }
    ]
  },
  {
    id: "field-debugging",
    title: "Debugging, tests and retries",
    examples: [
      {
        id: "field-startup-miss",
        title: "Distinguish a setup failure from a pipeline failure",
        task: "Run this .mjs file at the academy root in a fresh Node process. Request a known demo type before and after its startup registration.",
        code: `import registry from "./Template/ICF/engine/intentRegistry.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

const actor = { id: "tester", role: "system" };
const missing = registry.createIntent("DemoIntent", actor, {});
console.log(missing.ok, missing.errors[0]);
registry.registerIntent("DemoIntent", demo.createDemoIntent);
console.log(registry.createIntent("DemoIntent", actor, {}).ok);`,
        language: "JavaScript · .mjs at academy root",
        expected: "First you see false and Intent is not registered: DemoIntent. The second line prints true. No stage has executed.",
        why: "A registry lookup happens before the runner can produce its trace. Check the type and startup registration before debugging a stage helper.",
        source: "Template/ICF/engine/intentRegistry.js",
        related: "intent-registry"
      },
      {
        id: "field-preflight",
        title: "Locate a missing declaration before the first helper",
        task: "Save this .mjs file at the academy root. Remove Emit from a fresh demo Intent before passing it to the runner.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

function fresh() {
  return demo.createDemoIntent({ id: "tester", role: "system" }, {});
}

const intent = fresh();
delete intent.stages.Emit;
const result = await pipeline.run(intent);
console.log(result.stage, result.meta.pipelineTrace.length);
console.log(result.errors.join(" "));`,
        language: "JavaScript · .mjs at academy root",
        expected: "The summary is Pipeline 0 and the error names Emit.",
        why: "An empty trace points to a preflight contract failure. Repair the factory that built the stage map.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "failure-traces"
      },
      {
        id: "field-runtime-declaration",
        title: "Find a helper that accidentally empties the next stage",
        task: "Run this .mjs file at the academy root. Record the last completed step when a Normalize helper replaces AddContext with an empty group.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

function fresh() {
  return demo.createDemoIntent({ id: "tester", role: "system" }, {});
}

const intent = fresh();
intent.stages.Normalize = {
  cleanInput: function cleanInput(value) {
    value.stages.AddContext = {};
    return { ok: true };
  }
};
const result = await pipeline.run(intent);
const tail = result.meta.pipelineTrace.at(-1);
console.log(result.stage, tail.stage, tail.step, tail.ok);
console.log(result.errors.join(" "));`,
        language: "JavaScript · .mjs at academy root",
        expected: "The final trace row passed at Normalize.cleanInput. The failure reports Pipeline and identifies AddContext.",
        why: "The declaration was complete during preflight. The last successful helper provides a concrete place to inspect the later change.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "failure-traces"
      },
      {
        id: "field-broken-return",
        title: "Repair a helper that returns a bare Intent",
        task: "Run this .mjs file at the academy root. Keep the input and step name fixed while replacing the helper's return value.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

function fresh() {
  return demo.createDemoIntent({ id: "tester", role: "system" }, {});
}

async function runWith(cleanInput) {
  const intent = fresh();
  intent.stages.Normalize = { cleanInput };
  return pipeline.run(intent);
}
const broken = await runWith(function bare(intent) { return intent; });
const fixed = await runWith(function wrapped(intent) { return { ok: true, intent }; });
console.log(broken.stage, broken.step, broken.ok);
console.log(fixed.ok, fixed.meta.pipelineTrace.at(-1).stage);`,
        language: "JavaScript · .mjs at academy root",
        expected: "The first summary is Normalize cleanInput false. The repaired request prints true Emit.",
        why: "The helper’s success envelope is part of the runner contract. Returning an object that happens to contain the right payload leaves the result ambiguous.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "stage-contracts"
      },
      {
        id: "field-commit-vs-delivery",
        title: "Check the committed state after a notification failure",
        task: "Save this .mjs file at the academy root. Give the demo a one-write Process and a failing Emit. Inspect both the runner result and your fixture’s state.",
        code: `import pipeline from "./Template/ICF/engine/pipeline.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

function fresh() {
  return demo.createDemoIntent({ id: "tester", role: "system" }, {});
}

const ledger = [];
const intent = fresh();
intent.stages.Process = {
  recordLoan: function recordLoan() {
    ledger.push("loan-42");
    return { ok: true };
  }
};
intent.stages.Emit = {
  sendReceipt: function sendReceipt() { throw new Error("Printer offline."); }
};
const result = await pipeline.run(intent);
console.log(result.stage, result.step, ledger.length, ledger[0]);`,
        language: "JavaScript · .mjs at academy root",
        expected: "The final line is Emit sendReceipt 1 loan-42. The failed result and committed loan coexist.",
        why: "Replaying the original write would produce a duplicate loan. Use a persisted operation ID and recover the outstanding delivery.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "retries"
      },
      {
        id: "field-retry-recipient",
        title: "Replay the same receipt at an idempotent receiver",
        task: "Run this .mjs file at the academy root. Model the receiver storing a receipt and then losing the acknowledgement. The sender retries with the original delivery ID.",
        code: `import assert from "node:assert/strict";
const receipts = new Map();
function deliver(event) {
  if (receipts.has(event.id)) return "already delivered";
  receipts.set(event.id, event.loanId);
  return "delivered";
}
const queued = { id: "loan-42:receipt", loanId: "loan-42" };
assert.equal(deliver(queued), "delivered");
// The receipt was stored; the acknowledgement was lost.
assert.equal(deliver(queued), "already delivered");
assert.equal(receipts.size, 1);
console.log("One receipt, two delivery attempts.");`,
        language: "JavaScript · .mjs at academy root",
        expected: "Both deliveries complete with one receipt stored. The final line reports One receipt, two delivery attempts.",
        why: "This fixture models deduplication in one process. In a real receiver, persist the receipt and its unique delivery ID atomically. Commit the original mutation and the pending delivery together in the sender’s store.",
        source: "Template/ICF.md",
        related: "retries"
      },
      {
        id: "field-compare-fixtures",
        title: "Refresh a template copy and rerun its contract checks",
        task: "From the academy root, compare the template change record with the adopted version. Run both local fixtures and keep the expected failure cases beside their passing counterparts.",
        code: `node Template/ICF/examples/checkPipeline.mjs --verbose
node scripts/check-adaptive-context.mjs`,
        language: "Terminal · academy root",
        expected: "The first command ends with Pipeline checks passed. The repaired Normalize.cleanInput reached Emit. The second emits a JSON summary with status passed.",
        why: "These checks exercise the shared runtime. A project using its own database or delivery adapter should run equivalent tests against those adapters before adopting a changed runtime.",
        source: "Template/ICF/CHANGES.md",
        related: "maintain-a-feature"
      }
    ]
  },
  {
    id: "field-roblox",
    title: "Roblox server and client examples",
    examples: [
      {
        id: "field-studio-remotes",
        title: "Verify the three RemoteEvents before a play test",
        task: "Install the historical sample under the Roblox services named in its README, including its ModuleScripts. Create the Remotes folder and three RemoteEvents in ReplicatedStorage. Run this in Studio’s command bar before testing the handlers.",
        code: `local remotes = game:GetService("ReplicatedStorage"):FindFirstChild("Remotes")
assert(remotes, "Create ReplicatedStorage.Remotes")
for _, name in ipairs({ "BuySword", "ClaimRewardChest", "UiFeedback" }) do
    local event = remotes:FindFirstChild(name)
    assert(event and event:IsA("RemoteEvent"), name .. " must be a RemoteEvent")
    print("Ready", name)
end`,
        language: "Luau · Roblox Studio",
        expected: "The Output panel shows one Ready line for each event. A missing object produces the name of the required event.",
        why: "The handlers and clients use WaitForChild with these exact names. A misnamed instance can stall the demonstration before any Intent is created.",
        source: "using ICF in Roblox/sample-project/README.md",
        related: "roblox-actions"
      },
      {
        id: "field-server-price",
        title: "Purchase a shield using the server’s price",
        task: "In a fresh single-player Studio play test with the sample installed, use this temporary LocalScript in StarterPlayerScripts in place of the automatic purchase and chest sample scripts. Keep the UiFeedback listener. The context builder recognizes Shield01.",
        code: `local storage = game:GetService("ReplicatedStorage")
local remotes = storage:WaitForChild("Remotes")
local function showReceipt(message)
    if message.type == "PurchaseConfirmed" then
        print(message.itemId, message.remainingCoins)
    end
end
remotes:WaitForChild("UiFeedback").OnClientEvent:Connect(showReceipt)
remotes:WaitForChild("BuySword"):FireServer({ itemId = "Shield01" })`,
        language: "Luau · Roblox Studio",
        expected: "The server begins with 250 coins, loads the price of 150, marks Shield01 owned and sends a receipt with 100 coins remaining.",
        why: "The client asks for the item by ID. The server builds inventory and price context and sends the confirmed amount back to the requesting player.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Shop/BuildContext.lua",
        related: "roblox-actions"
      },
      {
        id: "field-insufficient-coins",
        title: "Check a purchase denial without changing the balance",
        task: "Use this temporary server Script in the sample place. It invokes the actual shop domain with a synthetic inventory and 20 coins. The denied path stops before Finalize, so a live Player object is unnecessary for this fixture.",
        code: `local root = game:GetService("ServerScriptService")
local runner = require(root.Core.IntentRunner)
local shop = require(root.Domain.Shop)
local state = { coins = 20, inventory = {} }
local result = runner.run({
    type = "BuySwordIntent", playerState = state, payload = { itemId = "Shield01" }
}, shop)
assert(result.ok == false and result.stage == "authorize")
assert(result.errors[1] == "not enough coins")
assert(state.coins == 20 and state.inventory.Shield01 == nil)
print("Denied before purchase")`,
        language: "Luau · Roblox Studio",
        expected: "The test prints Denied before purchase. The balance remains 20 and the inventory is empty.",
        why: "This historical implementation reports lowercase stage names. Check the stored balance as well as the error when porting a denial fixture.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Shop/Authorize.lua",
        related: "roblox-actions"
      },
      {
        id: "field-duplicate-chest",
        title: "Prove a claimed chest cannot pay twice",
        task: "Run this temporary server Script in the sample place. Supply a chest ID already recorded by a previous claim. This targets the historical sample's earliest duplicate check.",
        code: `local root = game:GetService("ServerScriptService")
local runner = require(root.Core.IntentRunner)
local rewards = require(root.Domain.Rewards)
local state = { coins = 300, claimedChests = { meadow = true } }
local result = runner.run({
    type = "ClaimRewardChestIntent", playerState = state, payload = { chestId = "meadow" }
}, rewards)
assert(result.ok == false and result.stage == "validate")
assert(result.errors[1] == "chest already claimed")
assert(state.coins == 300)
print("Duplicate claim stopped")`,
        language: "Luau · Roblox Studio",
        expected: "The second claim stops at validate. The test prints Duplicate claim stopped and the balance remains 300.",
        why: "The sample checks duplicates during validation before its authorization check. A persistent implementation also needs a conditional write to settle simultaneous claims.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Rewards/Validators.lua",
        related: "roblox-actions"
      },
      {
        id: "field-historical-runner",
        title: "Trace one reward before porting the historical runner",
        task: "In a fresh Studio play test, replace the automatically firing shop and chest scripts with this LocalScript. The server derives the player from OnServerEvent and awards its fixed reward. Observe the final feedback in the client Output panel.",
        code: `local remotes = game:GetService("ReplicatedStorage"):WaitForChild("Remotes")
local function inspectClaim(message)
    if message.type == "RewardChestConfirmed" then
        print(message.chestId, message.rewardCoins, message.currentCoins)
    end
end
remotes:WaitForChild("UiFeedback").OnClientEvent:Connect(inspectClaim)
remotes:WaitForChild("ClaimRewardChest"):FireServer({ chestId = "meadow" })`,
        language: "Luau · Roblox Studio",
        expected: "For an untouched player the client prints meadow 50 300. Follow the historical server stages through Validators, BuildContext, Authorize, Process and Finalize.",
        why: "Use this receipt as a parity test during a port. Add an explicit Normalize between Validate and AddContext and map the historical Finalize feedback to Emit. Execute the migrated path in Roblox Studio.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Core/IntentRunner.lua",
        related: "roblox-actions"
      }
    ]
  },
  {
    id: "field-adoption",
    title: "End-to-end seating scenarios",
    examples: [
      {
        id: "field-domain-smoke",
        title: "Exercise a new domain through its public entry point",
        task: "First build the reservation feature in the adoption guide. Run this command inside seat-demo to reserve two seats in one in-memory session.",
        code: `node try-seats.mjs ava " a1 " bo B2`,
        language: "Terminal · seat-demo",
        expected: "The result lines are RESERVED A1 ava SeatReserved and RESERVED B2 bo SeatReserved. Both calls pass through the registered factory and all six runner stages.",
        why: "A smoke test through the same entry point a UI would call checks the wiring, normalization, stored change and emitted receipt in one run.",
        source: "Template/README.md",
        related: "feature-adoption"
      },
      {
        id: "field-multiple-failures",
        title: "Identify which boundary rejected each seating request",
        task: "With the adoption-guide feature installed, run four requests from seat-demo in one process. Use whitespace for an invalid seat, Z9 for a missing record, and guest for an unverified member.",
        code: `node try-seats.mjs ava " " ava Z9 guest A1 ava A1`,
        language: "Terminal · seat-demo",
        expected: "The first three summaries begin STOP Validate.requireSeatId, STOP AddContext.loadSeatFacts and STOP Authorize.allowReservation. The last is RESERVED A1 ava SeatReserved.",
        why: "These requests express different failures for the same action. A final success on A1 confirms that none of those failures consumed the seat.",
        source: "Template/README.md",
        related: "failure-traces"
      },
      {
        id: "field-reserve-race",
        title: "Settle two competing reservations",
        task: "After completing the adoption guide, save this block as race.mjs beside seating.mjs and run node race.mjs from seat-demo. Both actors request the same normalized seat without awaiting the other.",
        code: `import assert from "node:assert/strict";
import { reserve, store } from "./seating.mjs";

const responses = await Promise.all([reserve("ava", "A1"), reserve("bo", "a1")]);
const winners = responses.filter(function won(response) { return response.ok; });
const losers = responses.filter(function lost(response) { return !response.ok; });
assert.equal(winners.length, 1);
assert.equal(losers.length, 1);
assert.equal(store.readFacts("ava", "A1").owner, winners[0].data.memberId);
console.log("Winner owns A1. Losing boundary:", losers[0].stage, losers[0].step);`,
        language: "JavaScript · race.mjs in seat-demo",
        expected: "Exactly one request wins. The final owner matches its receipt. A request stopped by the final availability check reports Process.reserveSeat. A request arriving after the commit can stop earlier in Authorize.",
        why: "Independent reads may both see an open seat. Ownership is decided by the adapter’s conditional mutation. Repeat this fixture against your actual database to check its concurrency guarantees.",
        source: "Template/README.md",
        related: "transactions"
      },
      {
        id: "field-receipt-projection",
        title: "Return a public receipt from an application endpoint",
        task: "After completing the adoption guide, save this block as receipt.mjs in seat-demo and run node receipt.mjs. Project the reservation result into the small response a caller needs.",
        code: `import { reserve } from "./seating.mjs";

function publicReceipt(result) {
  if (!result.ok) {
    return { accepted: false, reason: result.errors[0] };
  }
  return { accepted: true, seat: result.data.seatId, member: result.data.memberId };
}
console.log(JSON.stringify(publicReceipt(await reserve("ava", "B2"))));
console.log(JSON.stringify(publicReceipt(await reserve("bo", "B2"))));`,
        language: "JavaScript · receipt.mjs in seat-demo",
        expected: "The first receipt contains accepted=true, seat=B2 and member=ava. The second contains accepted=false and reason “Seat already reserved.”",
        why: "This boundary keeps the working Intent, trusted context and internal step details inside the application. In a hosted service, choose public error messages appropriate to the caller.",
        source: "Template/README.md",
        related: "result-envelope"
      }
    ]
  }
];


export const adoptionGuide = [
  {
    title: "Set up the project folder",
    body: "Start in the main folder of your downloaded wiki with Node.js 22 or later. Run each line in the terminal. The commands make a new seat-demo folder, copy the ICF files, and make a folder for each stage. The last line checks that the demo runs.",
    language: "Terminal · academy checkout",
    source: "Template/README.md",
    code: `node --version
node -e "const fs = require('node:fs'); fs.mkdirSync('seat-demo'); fs.cpSync('Template/ICF', 'seat-demo/ICF', { recursive: true }); for (const group of ['Validators','Normalizers','ContextProviders','Authorizers','Processors','Emitters']) fs.mkdirSync('seat-demo/ICF/Stages/' + group + '/Domain/seats', { recursive: true });"
cd seat-demo
node ICF/examples/checkPipeline.mjs`
  },
  {
    title: "Decide what a booking should do",
    body: "Set up two members, Ava and Bo, and two empty seats, A1 and B2. A good request should book one seat and return a SeatReserved event. A guest, a bad seat ID, or an occupied seat should leave the records alone. The file paths below start in seat-demo."
  },
  {
    title: "Make a small store for seats",
    body: "Save this as seating-store.mjs. The store starts with the same members and seats each time. readFacts returns the details for one request. reserveIfFree checks the seat again just before it saves. In a real database, check and save together in a transaction.",
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
    title: "Validate the seat ID",
    body: "Save this file at the path shown. The caller supplies the person and the seat ID. This check rejects an empty ID before the app looks up any records. If it fails, the runner reports the stage and step.",
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
    body: "Save this file at the path shown. The input “ a1 ” becomes “A1”. Validate already checked that the value is text, so this step can focus on cleaning it up.",
    language: "ICF/Stages/Normalizers/Domain/seats/normalizeSeatId.js",
    code: `export function normalizeSeatId(intent) {
  intent.payload.seatId = intent.payload.seatId.trim().toUpperCase();
  return { ok: true, intent };
}`
  },
  {
    title: "AddContext finds the seat and member",
    body: "Save this file at the path shown. This step asks the store about the seat and the person. If the seat does not exist, stop here. If it does, pass its current owner and the membership check to Authorize.",
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
    title: "Authorize checks who can book",
    body: "Save this file at the path shown. Check that the person is a member and the seat is free. Use the facts from the store so a guest cannot claim to be a member.",
    language: "ICF/Stages/Authorizers/Domain/seats/allowReservation.js",
    code: `export function allowReservation(intent) {
  const facts = intent.context.seating;
  if (!facts.member) return { ok: false, errors: ["Members only."] };
  if (facts.owner !== null) return { ok: false, errors: ["Seat already reserved."] };
  return { ok: true };
}`
  },
  {
    title: "Process books the seat",
    body: "Save this file at the path shown. Two people might both pass the first check. Check again as you save so only one person gets the seat. Once it saves, prepare the details for the receipt.",
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
    title: "Emit makes the receipt",
    body: "Save this file at the path shown. The event records the seat and member IDs from the saved result. The sample keeps the event in memory. A real app that sends receipts should track each send so a retry cannot send an unwanted copy.",
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
    title: "Put the six stages together",
    body: "Create ICF/Intents/ReserveSeatIntent.js. The function that makes the Intent gets the store when the app starts. It creates a new request every time. The step names you write here are the names you will see in the trace.",
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
    title: "Register the action and make it callable",
    body: "Create seating.mjs beside seating-store.mjs. The module creates a store and registers the action once. Each call to reserve makes a new Intent. In a real app, get the actor ID from the signed-in account.",
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
    title: "Make a terminal command for booking",
    body: "Save try-seats.mjs in seat-demo. Give it a person and seat for each booking. Both bookings in one command use the same store so you can see a conflict. A new command starts with empty seats again.",
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
    title: "Try a booking and then a repeat",
    body: "Run this inside seat-demo. Look for “RESERVED A1 ava SeatReserved”. The next request should stop at Authorize.allowReservation because the seat is taken.",
    language: "Terminal · seat-demo",
    code: `node try-seats.mjs ava " a1 " bo A1`
  },
  {
    title: "Add a test you can run again",
    body: "Save check-seats.mjs in seat-demo. It tests a bad ID, a missing seat, a guest, and a successful booking. It also checks who owns the seat after a second request. If a check fails, Node reports an error.",
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
    title: "Run the test and use it as a starting point",
    body: "Run the test from seat-demo. The last line should say “Seating checks passed.” For your own app, also test how it checks identity, saves changes, and sends messages. Call the same Intent from the web page and from the API.",
    language: "Terminal · seat-demo",
    source: "Template/ICF.md",
    code: `node check-seats.mjs`
  }
];

export const workflowGroups = [
  {
    id: "field-adaptive",
    title: "Use clues to pick a lesson",
    examples: [
      {
        id: "field-signal-baseline",
        title: "See how a tough session changes the lesson pick",
        task: "Run both lesson examples from the main project folder. Compare the lesson ID, score, and set of rules used.",
        code: `node Template/ICF/examples/runAdaptiveContext.mjs`,
        language: "Terminal · academy root",
        expected: "With no clues, advanced-project wins with 80. With both clues turned on, prerequisite-review wins with 95. The rule version stays at 1.",
        why: "Both runs use the same rules. The new clues explain why the answer changed.",
        source: "Template/ICF/examples/runAdaptiveContext.mjs",
        related: "adaptive-context"
      },
      {
        id: "field-expiry",
        title: "Try a lesson choice right when it expires",
        task: "Run this from the main project folder. The second command moves the sample clock from 1000 to 10000, when the choices expire.",
        code: `node Template/ICF/examples/runAdaptiveContext.mjs --expired`,
        language: "Terminal · academy root",
        expected: "The run stops at AddContext.addAdaptiveContext. The error says expired=3. Process and Emit never run.",
        why: "The clock tells you why all three choices were skipped, even ones with high scores.",
        source: "Template/ICF/examples/runAdaptiveContext.mjs",
        related: "evidence-eligibility"
      },
      {
        id: "field-budget-tie",
        title: "Break a tie when only one choice can win",
        task: "Save the code as an .mjs file in the main project folder and run it with Node. Give two choices a score of 75 and allow only one winner.",
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
        expected: "Both runs print “interest 75”, even when you reverse the order.",
        why: "When scores tie, a stable ID breaks the tie. Changing the order of the list does not change the winner.",
        source: "Template/ICF/engine/adaptiveContext.js",
        related: "evidence-scores"
      },
      {
        id: "field-signal-due",
        title: "Try one new clue without going online",
        task: "Save this as an .mjs file in the main project folder. Compare the result with no clues to the result with practiceDue.",
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
        expected: "The first run prints “project 80”. The second prints “gap 85”.",
        why: "Keep the same choices, time, and other rules. You can then see what the one new clue did.",
        source: "Template/ICF/examples/lessonServices.js",
        related: "evidence-scores"
      },
      {
        id: "field-denied-recommendation",
        title: "Stop a lesson pick when permission is missing",
        task: "Save this as an .mjs file in the main project folder. The clues point to review, but the learner’s record says the app cannot recommend a lesson.",
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
        expected: "The last line is “false Authorize authorizeLessonRecommendation”. The app returns no lesson.",
        why: "Evidence can help score a choice. It cannot give the app permission to use it.",
        source: "Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizeLessonRecommendation.js",
        related: "authorize"
      },
      {
        id: "field-stale-publish",
        title: "See what happens when two editors save at once",
        task: "Save this as an .mjs file in the main project folder. Have two editors both try to change version 1.",
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
        expected: "One change saves as version 2. The other gets “Policy version conflict”. The history has the old version and the new one.",
        why: "Check which version is live before you save. This keeps one editor from silently replacing the other’s change.",
        source: "Template/ICF/Intents/UpdateContextScoringPolicyIntent.js",
        related: "policy-updates"
      },
      {
        id: "field-rollback",
        title: "Restore old rules and keep the history",
        task: "Save this as an .mjs file in the main project folder. Change the policy, then take the original rules from history and save them again.",
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
        expected: "The last two lines are “3 60” and “3”. The restored rules are version 3 and there are three history entries.",
        why: "An undo saves a new version. You can still see every change that led up to it.",
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
        title: "Tell a setup error from a step error",
        task: "Run this .mjs file in the main project folder. Ask for DemoIntent before and after registering it.",
        code: `import registry from "./Template/ICF/engine/intentRegistry.js";
import demo from "./Template/ICF/Intents/DemoIntent.js";

const actor = { id: "tester", role: "system" };
const missing = registry.createIntent("DemoIntent", actor, {});
console.log(missing.ok, missing.errors[0]);
registry.registerIntent("DemoIntent", demo.createDemoIntent);
console.log(registry.createIntent("DemoIntent", actor, {}).ok);`,
        language: "JavaScript · .mjs at academy root",
        expected: "First you see false and “Intent is not registered: DemoIntent.” After setup it prints true. No stage has run yet.",
        why: "Creating the request and running its steps are separate jobs.",
        source: "Template/ICF/engine/intentRegistry.js",
        related: "intent-registry"
      },
      {
        id: "field-preflight",
        title: "Find a missing stage before the run starts",
        task: "Save this as an .mjs file in the main project folder. Remove Emit from a demo Intent before you run it.",
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
        expected: "The summary is “Pipeline 0” and the error names Emit.",
        why: "Zero steps in the trace tells you to start by checking the stage list.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "failure-traces"
      },
      {
        id: "field-runtime-declaration",
        title: "Find the step that emptied the next stage",
        task: "Run this .mjs file in the main project folder. The Normalize helper changes AddContext so it has no steps.",
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
        expected: "The trace shows Normalize.cleanInput passed. The error names Pipeline and AddContext.",
        why: "A stage list can start out right and get changed later. Check the last helper that ran.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "failure-traces"
      },
      {
        id: "field-broken-return",
        title: "Fix a step that returns the wrong shape",
        task: "Run this .mjs file in the main project folder. Run the same input twice and change only what the helper returns.",
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
        expected: "The first summary is “Normalize cleanInput false”. The second prints “true Emit”.",
        why: "A plain helper returns an object with ok and, when needed, the updated Intent.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "stage-contracts"
      },
      {
        id: "field-commit-vs-delivery",
        title: "Check saved data after a message fails",
        task: "Save this as an .mjs file in the main project folder. Make Process save one loan and Emit fail to send the receipt.",
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
        expected: "The final line is “Emit sendReceipt 1 loan-42”. The loan was saved.",
        why: "A send failure does not tell you whether the loan saved. Check the store before retrying.",
        source: "Template/ICF/examples/checkPipeline.mjs",
        related: "retries"
      },
      {
        id: "field-retry-recipient",
        title: "Send the same receipt twice and store it once",
        task: "Run this .mjs file in the main project folder. The first send stores the receipt but loses its reply. Send it again with the same ID.",
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
        expected: "The final line is “One receipt, two delivery attempts.”",
        why: "Save the receipt by its delivery ID so the second send can find the first result.",
        source: "Template/ICF.md",
        related: "retries"
      },
      {
        id: "field-compare-fixtures",
        title: "Check your copy after updating the template",
        task: "From the main project folder, compare the template’s notes with your copy. Then run both checks.",
        code: `node Template/ICF/examples/checkPipeline.mjs --verbose
node scripts/check-adaptive-context.mjs`,
        language: "Terminal · academy root",
        expected: "The first command says the pipeline checks passed. The second prints a result with “status” set to “passed”.",
        why: "Run checks before and after an update. Expected failures should still stop in the right place.",
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
        title: "Check that the Roblox messages are set up",
        task: "Set up the sample from its README. Add the Remotes folder and all three RemoteEvents in ReplicatedStorage. Run the code in the Studio command bar.",
        code: `local remotes = game:GetService("ReplicatedStorage"):FindFirstChild("Remotes")
assert(remotes, "Create ReplicatedStorage.Remotes")
for _, name in ipairs({ "BuySword", "ClaimRewardChest", "UiFeedback" }) do
    local event = remotes:FindFirstChild(name)
    assert(event and event:IsA("RemoteEvent"), name .. " must be a RemoteEvent")
    print("Ready", name)
end`,
        language: "Luau · Roblox Studio",
        expected: "The Output panel shows a Ready line for each event. If one is missing, the error names it.",
        why: "A quick check of the object names can save time before you test a purchase.",
        source: "using ICF in Roblox/sample-project/README.md",
        related: "roblox-actions"
      },
      {
        id: "field-server-price",
        title: "Buy a shield at the server’s price",
        task: "Start a fresh one-player test in Studio. Use this temporary LocalScript in StarterPlayerScripts in place of the sample scripts that buy or claim things on their own. Keep UiFeedback.",
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
        expected: "The player starts with 250 coins. The shield costs 150. The player owns Shield01 and has 100 coins left.",
        why: "The server reads the price from its own list and checks the player’s balance.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Shop/BuildContext.lua",
        related: "roblox-actions"
      },
      {
        id: "field-insufficient-coins",
        title: "Deny a purchase when the player is short on coins",
        task: "Run this temporary server Script in the sample place. Give the sample shopper 20 coins and an empty inventory.",
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
        expected: "The test prints “Denied before purchase”. The player still has 20 coins and no new items.",
        why: "Check the saved balance and items when a purchase fails. Neither should change.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Shop/Authorize.lua",
        related: "roblox-actions"
      },
      {
        id: "field-duplicate-chest",
        title: "Keep a chest from paying twice",
        task: "Run this temporary server Script in the sample place. Use a chest ID already marked as claimed.",
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
        expected: "The second claim stops at validate. It prints “Duplicate claim stopped”. The balance stays at 300.",
        why: "Check the saved claim before you add coins again.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Domain/Rewards/Validators.lua",
        related: "roblox-actions"
      },
      {
        id: "field-historical-runner",
        title: "Follow a chest reward in the older Roblox sample",
        task: "Start a fresh Studio test and use this LocalScript instead of the sample scripts that run on their own. Watch the client Output panel.",
        code: `local remotes = game:GetService("ReplicatedStorage"):WaitForChild("Remotes")
local function inspectClaim(message)
    if message.type == "RewardChestConfirmed" then
        print(message.chestId, message.rewardCoins, message.currentCoins)
    end
end
remotes:WaitForChild("UiFeedback").OnClientEvent:Connect(inspectClaim)
remotes:WaitForChild("ClaimRewardChest"):FireServer({ chestId = "meadow" })`,
        language: "Luau · Roblox Studio",
        expected: "For a fresh player it prints “meadow 50 300”. The older server steps include BuildContext and Finalize.",
        why: "Read what each older step does before you move it to the current six-stage template.",
        source: "using ICF in Roblox/sample-project/ServerScriptService/Core/IntentRunner.lua",
        related: "roblox-actions"
      }
    ]
  },
  {
    id: "field-adoption",
    title: "Seat booking examples",
    examples: [
      {
        id: "field-domain-smoke",
        title: "Try the seat feature from the terminal",
        task: "First build the seat feature in the guide. Run this command inside seat-demo to book two different seats in one run.",
        code: `node try-seats.mjs ava " a1 " bo B2`,
        language: "Terminal · seat-demo",
        expected: "Ava gets A1 and Bo gets B2. Each receipt ends with SeatReserved.",
        why: "Running the feature this way checks the code that real callers use.",
        source: "Template/README.md",
        related: "feature-adoption"
      },
      {
        id: "field-multiple-failures",
        title: "Find which step stopped each seat request",
        task: "After building seat-demo, try an ID made of spaces, unknown seat Z9, a guest request, and a valid booking.",
        code: `node try-seats.mjs ava " " ava Z9 guest A1 ava A1`,
        language: "Terminal · seat-demo",
        expected: "The first three stop at Validate.requireSeatId, AddContext.loadSeatFacts, and Authorize.allowReservation. Ava then gets A1.",
        why: "Different mistakes stop at different steps. The trace tells you which check to read.",
        source: "Template/README.md",
        related: "failure-traces"
      },
      {
        id: "field-reserve-race",
        title: "Try booking the same seat at the same time",
        task: "After building seat-demo, save this as race.mjs next to seating.mjs and run node race.mjs. Start both requests before waiting for either one.",
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
        expected: "Only one request wins. The saved owner matches that receipt. The other stops at the final Process check or, if it arrives later, at Authorize.",
        why: "A final check at the write prevents both callers from getting the same seat.",
        source: "Template/README.md",
        related: "transactions"
      },
      {
        id: "field-receipt-projection",
        title: "Send a short seat receipt to the caller",
        task: "After building seat-demo, save this as receipt.mjs and run node receipt.mjs. Pick the few fields the caller needs.",
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
        expected: "The first receipt says Ava got B2. The second says “Seat already reserved.”",
        why: "A caller needs the answer and a useful reason if it failed. Keep the full trace in the app for debugging.",
        source: "Template/README.md",
        related: "result-envelope"
      }
    ]
  }
];


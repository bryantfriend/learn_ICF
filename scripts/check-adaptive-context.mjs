import assert from "node:assert/strict";
import { rankContextCandidates, scoreContextCandidate } from "../Template/ICF/engine/adaptiveContext.js";
import { createAdaptiveContextProvider } from "../Template/ICF/Stages/ContextProviders/Core/addAdaptiveContext.js";
import { createLessonPolicy, createLessonCandidates, createDemoLessonServices } from "../Template/ICF/examples/lessonServices.js";
import intents from "../Template/ICF/Intents/intents.js";
import registry from "../Template/ICF/engine/intentRegistry.js";
import pipeline from "../Template/ICF/engine/pipeline.js";
import { createLessonRecommendationFactory } from "../Template/ICF/Intents/RecommendNextLessonIntent.js";
import { createContextPolicyUpdateFactory } from "../Template/ICF/Intents/UpdateContextScoringPolicyIntent.js";
import { adaptiveLessons } from "../adaptive-course.mjs";
import { assess } from "../academy-assessment.mjs";

console.info = function quiet() {};
console.warn = function quiet() {};
var checks = 0;
function check(name, run) { run(); checks = checks + 1; }
var execution = { intentType: "RecommendNextLessonIntent", scope: "course-1", evaluatedAt: 1000, signalSnapshotId: "test-1" };
function rank(candidates, signals, policy) { return rankContextCandidates(candidates, signals, policy, execution); }
var policy = createLessonPolicy();
var candidates = createLessonCandidates();
var signals = { repeatedErrors: 1, shortSession: 1 };

check("scoring and deterministic replay", function testScoring() {
  var decision = rank(candidates, signals, policy);
  assert.deepEqual(decision, rank(candidates, signals, policy));
  assert.deepEqual(decision.selected.map(function getId(item) { return item.id; }), ["gap", "interest"]);
  assert.equal(decision.selected[0].score, 95);
  assert.equal(rank(candidates, {}, policy).selected[0].id, "project");
  assert.equal(candidates[0].score, undefined);
  assert.equal(policy.categories.prerequisite.baseScore, 60);
  assert.deepEqual(rank(candidates.slice().reverse(), signals, policy).selected, decision.selected);
  candidates[0].value.lessonId = "changed";
  assert.equal(decision.selected[0].candidate.value.lessonId, "prerequisite-review");
  candidates = createLessonCandidates();
});

check("bounds missing and invalid signals", function testSignals() {
  assert.equal(scoreContextCandidate({ baseScore: 95, factors: { x: 30 } }, { x: 1 }).score, 100);
  assert.equal(scoreContextCandidate({ baseScore: 5, factors: { x: -30 } }, { x: 1 }).score, 0);
  assert.equal(scoreContextCandidate({ baseScore: 60, factors: { x: 25 } }, { x: -1 }).score, 35);
  assert.equal(scoreContextCandidate({ baseScore: 60, factors: { x: 25 } }, {}).contributions[0].missing, true);
  for (var value of [NaN, Infinity, -Infinity, 2, "1", null]) {
    assert.throws(function invalidSignal() { rank(candidates, { repeatedErrors: value }, policy); });
  }
});

check("eligibility and duplicate identities", function testEligibility() {
  for (var patch of [{ accessible: false }, { scope: "other" }, { expiresAt: 1000 },
    { observedAt: 1001 }, { source: "unknown" }, { category: "unknown" }]) {
    var input = createLessonCandidates();
    Object.assign(input[2], patch);
    var result = rank(input, {}, policy);
    assert.equal(result.selected.some(function isProject(item) { return item.id === "project"; }), false);
  }
  var mixed = createLessonCandidates();
  mixed[1].accessible = false;
  mixed[2].scope = "other";
  assert.deepEqual(rank(mixed, {}, policy), rank(mixed.slice().reverse(), {}, policy));
  assert.throws(function duplicate() { rank([candidates[0], candidates[0]], {}, policy); }, /Duplicate/);
  assert.throws(function wrongScope() { rankContextCandidates(candidates, {}, policy, Object.assign({}, execution, { scope: "other" })); }, /match/);
  assert.throws(function wrongIntent() { rankContextCandidates(candidates, {}, policy, Object.assign({}, execution, { intentType: "OtherIntent" })); }, /match/);
});

check("budget ties and empty selection", function testBudget() {
  var limited = createLessonPolicy();
  limited.maxCandidates = 1;
  limited.categories.project.baseScore = 75;
  assert.equal(rank(candidates.slice().reverse(), {}, limited).selected[0].id, "interest");
  assert.throws(function emptyRequired() { rank([], {}, limited); }, /No candidates were supplied/);
  var evidence = createLessonCandidates();
  evidence[0].expiresAt = execution.evaluatedAt;
  limited.minimumScore = 100;
  assert.throws(function noneQualify() { rank(evidence, {}, limited); }, {
    message: "No eligible context meets the selection policy. Exclusions: below-threshold=2, expired=1."
  });
  limited.requireSelection = false;
  assert.equal(rank([], {}, limited).selected.length, 0);
  limited.minimumScore = 100;
  assert.equal(rank(candidates, {}, limited).selected.length, 0);
  limited.maxCandidates = 1.5;
  assert.throws(function fractionalBudget() { rank(candidates, {}, limited); });
});

var loadCount = 0;
var provider = createAdaptiveContextProvider(async function load() {
  loadCount = loadCount + 1;
  return { candidates: candidates, signals: signals, policy: policy, scope: "course-1", evaluatedAt: 1000, signalSnapshotId: "one" };
});
var workingIntent = { type: "RecommendNextLessonIntent", payload: { signals: { repeatedErrors: -1 } }, context: { requiredFact: "keep" } };
assert.equal((await provider(workingIntent)).ok, true);
assert.equal(loadCount, 1);
assert.equal(workingIntent.context.requiredFact, "keep");
assert.equal(workingIntent.context.adaptiveContext.selected[0].score, 95);
await provider(workingIntent);
assert.equal(workingIntent.context.adaptiveContext.selected[0].score, 95);
var failingProvider = createAdaptiveContextProvider(async function loadFailure() { throw new Error("Source failed"); });
assert.equal((await failingProvider(workingIntent)).ok, false);
assert.equal(workingIntent.context.adaptiveContext, undefined);
assert.equal(workingIntent.context.requiredFact, "keep");
var rejectedProvider = createAdaptiveContextProvider(async function rejectSnapshot() { throw null; });
assert.deepEqual((await rejectedProvider(workingIntent)).errors, ["Unknown error."]);
checks = checks + 1;

// Pause after a trusted loader captures version 1; an update must not change that run's snapshot.
var pinnedServices = createDemoLessonServices();
var originalLoader = pinnedServices.loadLessonSnapshot;
var signalCaptured;
var releaseSnapshot;
var captured = new Promise(function capture(resolve) { signalCaptured = resolve; });
var released = new Promise(function release(resolve) { releaseSnapshot = resolve; });
pinnedServices.loadLessonSnapshot = async function pausedLoader(intent) {
  var snapshot = await originalLoader(intent);
  signalCaptured();
  await released;
  return snapshot;
};
var inFlight = pipeline.run(createLessonRecommendationFactory(pinnedServices)({ id: "learner", role: "student" }, {}));
await captured;
var pinnedProposal = createLessonPolicy();
pinnedProposal.categories.prerequisite.baseScore = 95;
var pinnedUpdate = await pipeline.run(createContextPolicyUpdateFactory(pinnedServices)(
  { id: "editor", role: "admin" }, { policy: pinnedProposal, expectedVersion: 1, reason: "In-flight test" }
));
assert.equal(pinnedUpdate.ok, true);
releaseSnapshot();
var pinnedResult = await inFlight;
assert.equal(pinnedResult.intent.context.adaptiveContext.policyVersion, 1);
assert.equal(pinnedResult.intent.context.resultData.lessonId, "advanced-project");
checks = checks + 1;

var learner = { id: "learner", role: "student" };
var editor = { id: "editor", role: "admin" };
var services = createDemoLessonServices();
registry.clearRegistry();
assert.equal(intents.registerProjectIntents().ok, true);
assert.equal(intents.registerAdaptiveIntents(services).ok, true);
var created = registry.createIntent("RecommendNextLessonIntent", learner, {});
assert.equal(created.ok, true);
var before = await pipeline.run(created.intent);
assert.equal(before.ok, true);
assert.equal(before.intent.context.resultData.lessonId, "advanced-project");
var expiredServices = createDemoLessonServices();
expiredServices.now = function fixtureExpiry() { return 10000; };
var readDemoSnapshot = expiredServices.loadLessonSnapshot;
expiredServices.loadLessonSnapshot = async function readFromAdapter(intent) {
  assert.equal(this, expiredServices);
  return readDemoSnapshot(intent);
};
var expiredResult = await pipeline.run(createLessonRecommendationFactory(expiredServices)(learner, {}));
assert.equal(expiredResult.stage, "AddContext");
assert.equal(expiredResult.step, "addAdaptiveContext");
assert.deepEqual(expiredResult.errors, ["No eligible context meets the selection policy. Exclusions: expired=3."]);
assert.equal(expiredResult.meta.pipelineTrace.at(-1).step, "addAdaptiveContext");
var adjusted = await pipeline.run(createLessonRecommendationFactory(createDemoLessonServices({ signals: signals }))(learner, {}));
assert.equal(adjusted.intent.context.resultData.lessonId, "prerequisite-review");
var denied = await pipeline.run(createLessonRecommendationFactory(createDemoLessonServices({ allowed: false, signals: signals }))(learner, {}));
assert.equal(denied.stage, "Authorize");
assert.equal(denied.ok, false);
checks = checks + 1;

var updateFactory = createContextPolicyUpdateFactory(services);
var proposal = createLessonPolicy();
proposal.categories.prerequisite.baseScore = 95;
var deniedUpdate = await pipeline.run(updateFactory({ id: "learner", role: "admin" }, { policy: proposal, expectedVersion: 1, reason: "test" }));
assert.equal(deniedUpdate.stage, "Authorize");
assert.equal((await services.policyStore.read()).version, 1);
var invalidProposal = structuredClone(proposal);
invalidProposal.categories.prerequisite.baseScore = NaN;
var invalidUpdate = await pipeline.run(updateFactory(editor, { policy: invalidProposal, expectedVersion: 1, reason: "test" }));
assert.equal(invalidUpdate.stage, "Validate");
assert.match(invalidUpdate.errors[0], /categories\.prerequisite\.baseScore.*0 to 100/);
var crossScope = structuredClone(proposal);
crossScope.scope = "other";
assert.equal((await pipeline.run(updateFactory(editor, { policy: crossScope, expectedVersion: 1, reason: "test" }))).stage, "Authorize");
var first = updateFactory(editor, { policy: proposal, expectedVersion: 1, reason: "  Improve relevance  " });
var second = updateFactory(editor, { policy: proposal, expectedVersion: 1, reason: "Concurrent proposal" });
var updates = await Promise.all([pipeline.run(first), pipeline.run(second)]);
assert.equal(updates.filter(function succeeded(result) { return result.ok; }).length, 1);
assert.equal(updates.find(function failed(result) { return !result.ok; }).stage, "Process");
assert.equal((await services.policyStore.history()).length, 2);
assert.equal((await services.policyStore.read()).audit.reason, "Improve relevance");
var after = await pipeline.run(createLessonRecommendationFactory(services)(learner, {}));
assert.equal(after.intent.context.resultData.lessonId, "prerequisite-review");
assert.equal(before.intent.context.adaptiveContext.policyVersion, 1);
assert.equal(after.intent.context.adaptiveContext.policyVersion, 2);
proposal.categories.prerequisite.baseScore = 0;
var copy = await services.policyStore.read();
copy.categories.prerequisite.baseScore = 0;
assert.equal((await services.policyStore.read()).categories.prerequisite.baseScore, 95);
checks = checks + 1;

// Roll back by publishing the original configuration as a new version.
var oldPolicy = (await services.policyStore.history())[0];
var rollback = await pipeline.run(updateFactory(editor, { policy: oldPolicy, expectedVersion: 2, reason: "Rollback evaluation" }));
assert.equal(rollback.ok, true);
assert.equal(rollback.intent.context.resultData.policyVersion, 3);
assert.equal((await services.policyStore.history()).length, 3);
var restored = await pipeline.run(createLessonRecommendationFactory(services)(learner, {}));
assert.equal(restored.intent.context.resultData.lessonId, "advanced-project");
checks = checks + 1;

for (var lesson of adaptiveLessons) {
  var correct = lesson.solution;
  var wrong = "";
  if (lesson.kind === "quiz") { correct = lesson.correct; wrong = (correct + 1) % lesson.answers.length; }
  assert.equal((await assess(lesson, correct)).results.every(function passed(result) { return result.ok; }), true, lesson.id);
  assert.equal((await assess(lesson, wrong)).results.every(function passed(result) { return result.ok; }), false, lesson.id + " must reject empty/wrong answers");
}
console.log(JSON.stringify({ behaviorGroups: checks, trainingActivities: adaptiveLessons.length, status: "passed" }));

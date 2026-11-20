// Run locally with Node. Every request and write in this walkthrough is a fixture.
import assert from "node:assert/strict";
import demo from "../Intents/DemoIntent.js";
import registry from "../engine/intentRegistry.js";
import pipeline from "../engine/pipeline.js";
import processors from "../Stages/Processors/processors.js";

// Show the diagnostic evidence by default. Add --verbose to see every runner log.
if (!process.argv.includes("--verbose")) {
  console.info = function skipStepLog() {};
  console.warn = function skipExpectedWarning() {};
}

function freshDemo() {
  var created = registry.createIntent("DemoIntent", { id: "fixture", role: "system" }, {});
  assert.equal(created.ok, true, JSON.stringify(created.errors));
  return created.intent;
}

function checkStoppedAt(result, stage, step) {
  assert.equal(result.ok, false);
  assert.equal(result.stage, stage);
  assert.equal(result.step, step);
  var last = result.meta.pipelineTrace.at(-1);
  assert.equal(last.stage, stage);
  assert.equal(last.step, step);
  assert.equal(last.ok, false);
  assert.deepEqual(last.errors, result.errors);
  console.log("Stopped at " + stage + "." + step + " — " + result.errors.join(" "));
}

// A failed lookup happens before a pipeline trace exists.
var missing = registry.createIntent("DemoIntent");
assert.equal(missing.ok, false);
console.log("Before startup registration — " + missing.errors.join(" "));
assert.deepEqual(registry.listIntentTypes(), []);
assert.equal(registry.hasIntent("toString"), false);
assert.equal(registry.getIntentFactory("toString").ok, false);
// Register only the fixture so this walkthrough also runs in a customized project.
assert.equal(registry.registerIntent("DemoIntent", demo.createDemoIntent).ok, true);

var healthy = await pipeline.run(freshDemo());
assert.equal(healthy.ok, true);
function traceStage(entry) { return entry.stage; }
var stageOrder = Array.from(new Set(healthy.meta.pipelineTrace.map(traceStage)));
assert.deepEqual(stageOrder, ["Validate", "Normalize", "AddContext", "Authorize", "Process", "Emit"]);
console.log("Healthy run — " + stageOrder.join(" → "));

var incomplete = freshDemo();
delete incomplete.stages.Emit;
var preflight = await pipeline.run(incomplete);
assert.equal(preflight.stage, "Pipeline");
assert.deepEqual(preflight.meta.pipelineTrace, []);
assert.match(preflight.errors.join(" "), /Emit/);
console.log("Declaration failed before any step ran — " + preflight.errors.join(" "));

var changed = freshDemo();
changed.stages.Normalize = {
  cleanInput: function dropGroup(intent) {
    intent.stages.AddContext = {};
    return { ok: true };
  }
};
var brokenGroup = await pipeline.run(changed);
assert.equal(brokenGroup.ok, false);
assert.equal(brokenGroup.stage, "Pipeline");
assert.match(brokenGroup.errors.join(" "), /AddContext/);
assert.equal(brokenGroup.meta.pipelineTrace.at(-1).step, "cleanInput");

// A denial stops a write. A delivery failure can happen after that write.
var writes = 0;
function recordWrite() {
  writes = writes + 1;
  return { ok: true };
}
function denyFixture() { return { ok: false, errors: ["Fixture permission denied."] }; }
function failDelivery() { throw new Error("Fixture delivery unavailable."); }
var denied = freshDemo();
denied.stages.Authorize = { checkPermission: denyFixture };
denied.stages.Process = { recordWrite: recordWrite };
checkStoppedAt(await pipeline.run(denied), "Authorize", "checkPermission");
assert.equal(writes, 0);

var delivery = freshDemo();
delivery.stages.Process = { recordWrite: recordWrite };
delivery.stages.Emit = { deliver: failDelivery };
checkStoppedAt(await pipeline.run(delivery), "Emit", "deliver");
assert.equal(writes, 1);
console.log("Process wrote once. Check the saved outcome before retrying delivery.");

// Compare a broken return with a repaired one at the same named step.
var repair = freshDemo();
repair.stages.Normalize = { cleanInput: function cleanInput(intent) { return intent; } };
var bare = await pipeline.run(repair);
checkStoppedAt(bare, "Normalize", "cleanInput");
assert.match(bare.errors.join(" "), /ok: true/);
repair.stages.Normalize.cleanInput = function incompleteReplacement() {
  return { ok: true, intent: { context: {} } };
};
checkStoppedAt(await pipeline.run(repair), "Normalize", "cleanInput");
repair.stages.Normalize.cleanInput = function cleanInput(intent) {
  var updated = Object.assign({}, intent, { payload: { repaired: true } });
  return Object.freeze({ ok: true, intent: updated });
};
var repaired = await pipeline.run(repair);
assert.equal(repaired.ok, true);
assert.equal(repaired.intent.payload.repaired, true);
assert.deepEqual(repair.payload, {});

var named = freshDemo();
named.stages.Validate = {
  checkContract: {
    id: "check-contract", name: "Check contract", stageType: "Validate",
    description: "Checks that a stage object can read its own configuration.",
    run: function run() { return { ok: this.id === "check-contract" }; }
  }
};
assert.equal((await pipeline.run(named)).ok, true);
var capture = freshDemo();
capture.stages.Process = { captureContext: processors.addContextToResultData };
var captured = await pipeline.run(capture);
assert.equal(captured.ok, true);
assert.equal(JSON.parse(JSON.stringify(captured.data)).context.source, "demo");
var repeated = await pipeline.run(captured.intent);
assert.equal(repeated.ok, true);
assert.equal(Object.hasOwn(JSON.parse(JSON.stringify(repeated.data)).context, "resultData"), false);
console.log("Pipeline checks passed. The repaired Normalize.cleanInput reached Emit.");

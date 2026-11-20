import intents from "../Intents/intents.js";
import registry from "../engine/intentRegistry.js";
import pipeline from "../engine/pipeline.js";
import { createDemoLessonServices } from "./lessonServices.js";

async function runRecommendation(services) {
  registry.clearRegistry();
  var registered = intents.registerAdaptiveIntents(services);
  if (!registered.ok) { throw new Error(registered.errors.join(" ")); }
  var created = registry.createIntent("RecommendNextLessonIntent", { id: "learner", role: "student" }, {});
  if (!created.ok) { throw new Error(created.errors.join(" ")); }
  return pipeline.run(created.intent);
}

if (process.argv.length === 2) {
  for (var signals of [{}, { repeatedErrors: 1, shortSession: 1 }]) {
    var result = await runRecommendation(createDemoLessonServices({ signals: signals }));
    if (!result.ok) { throw new Error(result.errors.join(" ")); }
    var decision = result.intent.context.adaptiveContext;
    console.log(JSON.stringify({
      signals: signals, recommendation: result.data, policyVersion: decision.policyVersion,
      evaluatedAt: decision.evaluatedAt, signalSnapshotId: decision.signalSnapshotId,
      trace: decision.decisionTrace
    }, null, 2));
  }
} else if (process.argv.length === 3 && process.argv[2] === "--expired") {
  // Every fixture expires at 10000. Time is the only change from the successful baseline.
  var expired = createDemoLessonServices();
  expired.now = function atFixtureExpiry() { return 10000; };
  var failure = await runRecommendation(expired);
  if (failure.ok || failure.stage !== "AddContext" || failure.step !== "addAdaptiveContext") {
    throw new Error("Expected AddContext.addAdaptiveContext to stop the expired fixture.");
  }
  console.log(JSON.stringify({
    stage: failure.stage, step: failure.step, errors: failure.errors, trace: failure.meta.pipelineTrace
  }, null, 2));
} else {
  throw new Error("Usage: node runAdaptiveContext.mjs [--expired]");
}

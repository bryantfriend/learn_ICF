// Adaptive Context lessons execute against the template API in studio-runtime.mjs.
var adaptiveLessons = [];
function addLesson(lesson) {
  adaptiveLessons.push(Object.assign({ track: "adaptive-context", unit: "Adaptive Context", kind: "javascript",
    mode: "guided", version: 1, duration: "10–15 min", file: "adaptive-context.js",
    source: "Template/ADAPTIVE_CONTEXT.md", reflection: "Explain which evidence changed the output and why." }, lesson));
}
function check(name, body) { return { name: name, body: body }; }

addLesson({ id: "adaptive-boundaries", kind: "quiz", mode: "concept", title: "What should compete for attention?",
  summary: "Separate required facts from optional evidence.", duration: "4 min", file: "Context boundaries",
  narrative: ["An intent can have more context than it can use well. Adaptive Context ranks optional evidence for this action and situation.",
    "Identity, tenant boundaries, permissions, and required business state remain mandatory. A low score cannot remove them, and a high score cannot grant permission."],
  example: "Required: verified learner identity and permission\nOptional: prerequisite gap, preferred topic, longer project",
  instructions: ["Choose the correct use of scoring."], hint: "Relevance and permission answer different questions.",
  answers: ["Rank optional learning evidence while retaining required facts.", "Let the highest-scoring permission claim win.", "Drop required facts when the context budget is full."], correct: 0,
  feedback: "Optional evidence competes. Required facts stay available and Authorize still decides whether the action is permitted.", tests: [{ name: "Context boundary understood" }] });

addLesson({ id: "adaptive-score", title: "Increase and decrease relevance", summary: "Use external signals to adjust a base score.",
  narrative: ["Each category has a base score and signed factor weights. Multiply each weight by its signal, sum the adjustments, and clamp the result to 0–100.",
    "Signals range from -1 to 1; weights range from -100 to 100. Missing optional signals contribute zero. The score is relevance, not a probability. Every run starts from the base."],
  example: "60 + 25 × 1 + 10 × 1 = 95\n80 + (-20) × 1 + (-25) × 1 = 35\napi.scoreContextCandidate(rule, signals) returns score and contributions.",
  instructions: ["Implement scoreEvidence(baseScore, factors, signals).", "Call api.scoreContextCandidate with { baseScore: baseScore, factors: factors } and signals. Return its complete result."],
  hint: "Preserve contributions so the result explains each adjustment.",
  starter: "function scoreEvidence(baseScore, factors, signals) {\n  // Use the template scoring helper.\n}",
  solution: "function scoreEvidence(baseScore, factors, signals) {\n  return api.scoreContextCandidate({ baseScore: baseScore, factors: factors }, signals);\n}",
  tests: [check("Positive and negative factors", "assert(scoreEvidence(60,{errors:25,time:10},{errors:1,time:1}).score===95,'Boost the prerequisite evidence.'); assert(scoreEvidence(80,{errors:-20,time:-25},{errors:1,time:1}).score===35,'Reduce the longer project relevance.');"),
    check("Bounds and explanation", "assert(scoreEvidence(95,{boost:25},{boost:1}).score===100,'Clamp to 100.'); assert(scoreEvidence(5,{cost:-25},{cost:1}).score===0,'Clamp to zero.'); var r=scoreEvidence(60,{errors:25},{}); assert(r.score===60 && r.contributions[0].missing,'Record missing optional signals.');"),
    check("Reject invalid external signals", "var rejected=false; try { scoreEvidence(60,{errors:25},{errors:NaN}); } catch(error) { rejected=true; } assert(rejected,'Invalid numbers must fail.');")] });

addLesson({ id: "adaptive-select", title: "Select useful, eligible context", summary: "Apply eligibility, a threshold, a budget, and stable tie handling.",
  narrative: ["The template checks source, scope, explicit access, category, and timestamps before ranking. Your trusted provider must establish access; a client flag is not verification.",
    "rankContextCandidates returns selected items and a decisionTrace. Equal scores sort by stable ID. Duplicate IDs fail because they may conceal conflicting evidence. Required facts never enter this candidate array."],
  example: "var execution = { intentType: policy.intentType, scope: policy.scope,\n  evaluatedAt: 1000, signalSnapshotId: 'lesson-1' };\napi.rankContextCandidates(candidates, signals, policy, execution);",
  instructions: ["Implement chooseEvidence(candidates, signals, policy).", "Call api.rankContextCandidates using the execution object in the example. Return the complete decision."],
  hint: "The caller supplies policy and candidates. Do not replace them with the demo fixtures.",
  starter: "function chooseEvidence(candidates, signals, policy) {\n  // Rank the supplied snapshot.\n}",
  solution: "function chooseEvidence(candidates, signals, policy) {\n  return api.rankContextCandidates(candidates, signals, policy, {\n    intentType: policy.intentType, scope: policy.scope, evaluatedAt: 1000, signalSnapshotId: 'lesson-1'\n  });\n}",
  tests: [check("Factors change selection", "var p=api.createLessonPolicy(), c=api.createLessonCandidates(); assert(chooseEvidence(c,{},p).selected[0].id==='project','The base scores favor the project.'); var r=chooseEvidence(c,{repeatedErrors:1,shortSession:1},p); assert(r.selected.map(function(x){return x.id;}).join(',')==='gap,interest','Select gap and interest.'); assert(r.decisionTrace.find(function(x){return x.id==='project';}).reason==='below-threshold','Explain exclusion.');"),
    check("Eligibility before scoring", "var p=api.createLessonPolicy(), c=api.createLessonCandidates(); c[2].accessible=false; c[0].expiresAt=1000; var r=chooseEvidence(c,{},p); assert(r.selected.length===1 && r.selected[0].id==='interest','Reject inaccessible and expired evidence.');"),
    check("Budget and input order", "var p=api.createLessonPolicy(); p.maxCandidates=1; p.categories.project.baseScore=75; var c=api.createLessonCandidates(); assert(chooseEvidence(c.reverse(),{},p).selected[0].id==='interest','Equal scores use ascending stable IDs and obey budget.');")] });

addLesson({ id: "adaptive-provider", title: "Add ranking to AddContext", summary: "Load a trusted snapshot and preserve existing required facts.",
  narrative: ["createAdaptiveContextProvider(loadSnapshot) builds a named AddContext step. It loads the snapshot once and places the decision under context.adaptiveContext.",
    "The loader owns data access, snapshot consistency, and provider timeouts. A loader failure returns a stage failure. This provider never reads scoring policy from the request payload."],
  example: "var addEvidence = api.createAdaptiveContextProvider(loadSnapshot);\n// AddContext: { addRequiredFacts: ..., addEvidence: addEvidence }",
  instructions: ["Implement async attachEvidence(intent, loadSnapshot).", "Create the provider using the supplied loader, run it on intent, and return its result."],
  hint: "Await the provider result. Do not copy snapshot fields over context.",
  starter: "async function attachEvidence(intent, loadSnapshot) {\n  // Run the trusted provider.\n}",
  solution: "async function attachEvidence(intent, loadSnapshot) {\n  var provider = api.createAdaptiveContextProvider(loadSnapshot);\n  return await provider(intent);\n}",
  tests: [check("Retains required facts and loads once", "var i={type:'RecommendNextLessonIntent',payload:{policy:'untrusted'},context:{verifiedRole:'student'}}; var calls=0; var result=await attachEvidence(i,async function(){calls++;return {candidates:api.createLessonCandidates(),signals:{},policy:api.createLessonPolicy(),scope:'course-1',evaluatedAt:1000,signalSnapshotId:'one'};}); assert(result.ok && calls===1 && i.context.verifiedRole==='student','Retain required facts and capture once.'); assert(i.context.adaptiveContext.selected[0].id==='project','Use the trusted snapshot.');"),
    check("Provider failure stops the stage", "var r=await attachEvidence({context:{}},async function(){throw new Error('Source unavailable');}); assert(!r.ok && r.errors.includes('Source unavailable'),'Return an explicit context failure.');")] });

addLesson({ id: "adaptive-outcome", title: "Change the intent outcome", summary: "Run the real six-stage lesson recommendation example.",
  narrative: ["The recommendation factory loads verified learner identity, ranks evidence, checks permission, then recommends the lesson attached to the highest-ranked evidence. Emit reports the result.",
    "The fixture services use fixed data for teaching. They are not authentication. Actual applications must authenticate the caller before supplying an actor and implement trusted source adapters."],
  example: "var services = api.createDemoLessonServices({ signals: signals, allowed: allowed });\nvar factory = api.createLessonRecommendationFactory(services);\nvar intent = factory({ id: 'learner', role: 'student' }, {});",
  instructions: ["Implement async recommendLesson(signals, allowed).", "Build services and the intent using the example. Run it through api.pipeline.run and return the pipeline result."],
  hint: "The real pipeline, not your function, must decide whether Process runs.",
  starter: "async function recommendLesson(signals, allowed) {\n  // Create and execute the actual template intent.\n}",
  solution: "async function recommendLesson(signals, allowed) {\n  var services = api.createDemoLessonServices({ signals: signals, allowed: allowed });\n  var factory = api.createLessonRecommendationFactory(services);\n  return await api.pipeline.run(factory({ id: 'learner', role: 'student' }, {}));\n}",
  tests: [check("Different evidence produces different recommendations", "var base=await recommendLesson({},true); var adjusted=await recommendLesson({repeatedErrors:1,shortSession:1},true); assert(base.ok && base.intent.context.resultData.lessonId==='advanced-project','Baseline recommends the project.'); assert(adjusted.ok && adjusted.intent.context.resultData.lessonId==='prerequisite-review','Adjusted context recommends prerequisite review.'); assert(adjusted.intent.context.events.length===1,'Emit reports the result.');"),
    check("High scores never override permission", "var denied=await recommendLesson({repeatedErrors:1,shortSession:1},false); assert(!denied.ok && denied.stage==='Authorize','Permission must deny even high-scoring evidence.');")] });

addLesson({
  id: "adaptive-trace-failure", title: "Find the helper that stopped the request",
  summary: "Read a failed pipeline result and identify which Process helpers already passed.",
  file: "describeFailure.js",
  source: "Template/ICF/Intents/RecommendNextLessonIntent.js",
  narrative: [
    "A learner reports that no recommendation appeared. Reproduce the request with a fixture and read the result. The stage and step locate the declaration in RecommendNextLessonIntent.js. Follow its registry import to the helper that owns the failure.",
    "Read meta.pipelineTrace in order. A loader failure can stop the run before Process. An Emit failure can follow a successful Process. Check the stored state before deciding whether to retry a write. A declaration that fails the pipeline’s initial checks has an empty trace."
  ],
  example: "stage = AddContext\nstep = addAdaptiveContext\nerrors = ['Lesson records unavailable.']\nLast successful step = AddContext.addLearner\nNext file to inspect = the loadLessonSnapshot adapter passed to addAdaptiveContext",
  instructions: [
    "Run the starter, then open Console output to compare the local failure fixtures.",
    "Implement describeFailure(result). Return { stage, step, message, completedProcessSteps }. Use null for an absent step and the first entry of result.errors for the message.",
    "Collect the names of successful Process steps in trace order. Re-run the checks and find the matching step in the linked Intent declaration."
  ],
  hint: "Filter result.meta.pipelineTrace by entry.stage and entry.ok, then map each matching entry to entry.step.",
  reflection: "Which result would make you check for a committed change before retrying? Where would you look if no helper ran?",
  starter: `function describeFailure(result) {
  // These fixtures use synthetic records. Inspect the trace before editing.
  console.log(result.stage, result.step || "(no step)", result.errors[0]);
  for (var entry of result.meta.pipelineTrace) {
    console.log(entry.ok ? "PASS" : "FAIL", entry.stage + "." + entry.step);
  }
  return { stage: "", step: null, message: "", completedProcessSteps: [] };
}`,
  solution: `function describeFailure(result) {
  var completed = result.meta.pipelineTrace.filter(function(entry) {
    return entry.stage === "Process" && entry.ok;
  });
  return {
    stage: result.stage,
    step: result.step || null,
    message: result.errors[0],
    completedProcessSteps: completed.map(function(entry) { return entry.step; })
  };
}`,
  tests: [
    check("The context loader failed before Process", `
      var services = api.createDemoLessonServices();
      services.loadLessonSnapshot = async function() { throw new Error("Lesson records unavailable."); };
      var factory = api.createLessonRecommendationFactory(services);
      var result = await api.pipeline.run(factory({ id: "learner", role: "student" }, {}));
      var report = describeFailure(result);
      assert(report.stage === "AddContext" && report.step === "addAdaptiveContext", "Find the failing step in the Intent declaration.");
      assert(report.message === result.errors[0], "Keep the loader's diagnostic message.");
      assert(Array.isArray(report.completedProcessSteps) && report.completedProcessSteps.length === 0, "No Process helper ran after this failure.");
    `),
    check("Emit failed after Process", `
      var factory = api.createLessonRecommendationFactory(api.createDemoLessonServices());
      var intent = factory({ id: "learner", role: "student" }, {});
      intent.stages.Emit.emitAdaptiveResult = function() { return { ok: false, errors: ["Delivery failed."] }; };
      var result = await api.pipeline.run(intent);
      var report = describeFailure(result);
      assert(report.stage === "Emit" && report.step === "emitAdaptiveResult" && report.message === result.errors[0], "Locate the delivery failure.");
      assert(report.completedProcessSteps.join(",") === "processLessonRecommendation", "Use the trace to name the Process helper that already passed.");
    `),
    check("Only successful Process helpers count", `
      var factory = api.createLessonRecommendationFactory(api.createDemoLessonServices());
      var intent = factory({ id: "learner", role: "student" }, {});
      intent.stages.Process.recordReceipt = function() { return { ok: false, errors: ["Could not save receipt."] }; };
      var result = await api.pipeline.run(intent);
      var report = describeFailure(result);
      assert(report.stage === "Process" && report.step === "recordReceipt", "A Process group can stop partway through its steps.");
      assert(report.completedProcessSteps.join(",") === "processLessonRecommendation", "Record the earlier success and omit the failed Process step.");
    `),
    check("A malformed declaration has no failed step", `
      var factory = api.createLessonRecommendationFactory(api.createDemoLessonServices());
      var intent = factory({ id: "learner", role: "student" }, {});
      delete intent.stages.Normalize;
      var result = await api.pipeline.run(intent);
      var report = describeFailure(result);
      assert(report.stage === "Pipeline" && report.step === null && report.message === result.errors[0], "Report the declaration error before any helper executes.");
      assert(Array.isArray(report.completedProcessSteps) && report.completedProcessSteps.length === 0, "Handle an empty trace.");
    `)
  ]
});

addLesson({
  id: "adaptive-repair-signals", mode: "independent", title: "Repair a wrong recommendation",
  summary: "Use a repeatable fixture and its decision trace to repair a signal adapter.",
  file: "projectLearningSignals.js", source: "Template/ICF/examples/lessonServices.js",
  narrative: [
    "After a change to the learning-records adapter, a learner with repeated errors receives advanced-project. On this fixture the expected next lesson is prerequisite-review. All six stages pass.",
    "Run the broken starter. The checks print the captured metrics, policy version, signal snapshot ID and the trace for the gap candidate. Find the first point where the observed evidence differs from the report. The two local metric names belong to this exercise’s source adapter."
  ],
  example: "Captured metrics     recentErrors = 1, timePressure = 0\nExpected gap score   60 + (25 × 1) + (10 × 0) = 85\nControl fixture      no metrics → advanced-project at 80",
  instructions: [
    "Open Console output after running the starter. Compare the captured metrics to the contributions for the gap candidate.",
    "Repair projectLearningSignals(metrics) so the fixture reaches its expected recommendation. The policy declares its factor names in the linked lessonServices.js file.",
    "Project only present, recognized metrics. Preserve signed numeric values, including zero. Run all checks to verify the original case and the controls under the same policy."
  ],
  hint: "Look for a contribution marked missing even though the trusted capture supplied a value. Check the name that connects the adapter to the policy.",
  reflection: "Which trace field exposed the defect? Which unchanged fixture would catch a repair that always favored prerequisite-review?",
  starter: `function projectLearningSignals(metrics) {
  var signals = {};
  if (Object.hasOwn(metrics, "recentErrors")) {
    signals.repeatErrors = metrics.recentErrors;
  }
  if (Object.hasOwn(metrics, "timePressure")) {
    signals.shortSession = metrics.timePressure;
  }
  return signals;
}`,
  solution: `function projectLearningSignals(metrics) {
  var signals = {};
  if (Object.hasOwn(metrics, "recentErrors")) {
    signals.repeatedErrors = metrics.recentErrors;
  }
  if (Object.hasOwn(metrics, "timePressure")) {
    signals.shortSession = metrics.timePressure;
  }
  return signals;
}`,
  tests: [
    check("Replay the reported recommendation", `
      var metrics = { recentErrors: 1, timePressure: 0 };
      var services = api.createDemoLessonServices({ signals: projectLearningSignals(metrics) });
      var factory = api.createLessonRecommendationFactory(services);
      var result = await api.pipeline.run(factory({ id: "learner", role: "student" }, {}));
      assert(result.ok, "The recommendation must finish all six stages.");
      var decision = result.intent.context.adaptiveContext;
      var gap = decision.decisionTrace.find(function(entry) { return entry.id === "gap"; });
      console.log("Captured metrics", metrics);
      console.log("Policy version", decision.policyVersion, "| snapshot", decision.signalSnapshotId);
      console.log("Recommendation", result.data.lessonId, "| gap candidate", gap.reason, "| score", gap.score);
      for (var contribution of gap.contributions) {
        console.log(contribution.factor, contribution.missing ? "(missing)" : "(present)", contribution.value, "×", contribution.weight, "=", contribution.adjustment);
      }
      assert(result.data.lessonId === "prerequisite-review" && gap.score === 85, "Expected prerequisite-review at 85. Inspect the gap contributions in Console output.");
    `),
    check("Keep the baseline recommendation", `
      var signals = projectLearningSignals({ recordId: "synthetic-01" });
      assert(Object.keys(signals).length === 0, "Keep absent metrics missing and omit unrelated fields.");
      var factory = api.createLessonRecommendationFactory(api.createDemoLessonServices({ signals: signals }));
      var result = await api.pipeline.run(factory({ id: "learner", role: "student" }, {}));
      assert(result.ok && result.data.lessonId === "advanced-project" && result.data.score === 80, "With no signals, the project still wins at 80.");
    `),
    check("Preserve explicit zero and signed values", `
      var signals = projectLearningSignals({ recentErrors: 0, timePressure: -0.5, recordId: "synthetic-02" });
      assert(Object.keys(signals).length === 2 && signals.repeatedErrors === 0 && signals.shortSession === -0.5, "Keep both supplied metrics and their exact values.");
      var sparse = projectLearningSignals({ recentErrors: 0.25 });
      assert(Object.keys(sparse).length === 1 && sparse.repeatedErrors === 0.25, "An absent session metric must stay missing.");
    `)
  ]
});

addLesson({ id: "adaptive-policy-concept", kind: "quiz", mode: "concept", title: "Adapt now or update the model?",
  summary: "Distinguish one execution from a saved policy change.", duration: "4 min", file: "Policy lifecycle",
  narrative: ["External signals change scores for the current run. They do not rewrite the saved policy. A model-updating intent changes the policy used by future executions.",
    "The update has all six stages and requires verified update permission. Process compares the expected version before publishing a new version. Rollback publishes old configuration as a new version."],
  example: "Current run → pinned policy version 1\nUpdateContextScoringPolicyIntent → publish version 2\nNext run → policy version 2",
  instructions: ["Choose how to persist a new scoring rule."], hint: "A saved policy change is an important state mutation.",
  answers: ["Rewrite the policy whenever a candidate is selected.", "Publish a new version through an authorized policy-update intent.", "Let Emit silently increase the winner's weight."], correct: 1,
  feedback: "Publish through the six-stage update intent. Selection frequency alone does not establish usefulness. Concurrent stale updates must fail.", tests: [{ name: "Policy lifecycle understood" }] });

addLesson({ id: "adaptive-policy-update", title: "Publish scoring policy changes", summary: "Use authorization and expected-version checks.",
  narrative: ["The template includes UpdateContextScoringPolicyIntent and a reference in-memory store. The store retains version history for its lifetime; production needs transactional durable storage.",
    "The request supplies a proposed policy, expectedVersion, and reason. Trusted services supply identity and the current policy. Publishing copies the configuration and assigns the next version."],
  example: "var factory = api.createContextPolicyUpdateFactory(services);\nvar intent = factory(actor, { policy: policy, expectedVersion: version, reason: 'Improve review relevance' });",
  instructions: ["Implement async publishPolicy(services, actor, policy, version).", "Create the update intent with a nonempty reason and the supplied values; run and return the real pipeline result."],
  hint: "Do not call services.policyStore.publish directly. Process owns publication.",
  starter: "async function publishPolicy(services, actor, policy, version) {\n  // Publish through the update intent.\n}",
  solution: "async function publishPolicy(services, actor, policy, version) {\n  var factory = api.createContextPolicyUpdateFactory(services);\n  return await api.pipeline.run(factory(actor, { policy: policy, expectedVersion: version, reason: 'Improve review relevance' }));\n}",
  tests: [check("Publish and reject stale updates", "var s=api.createDemoLessonServices(); var p=api.createLessonPolicy(); p.categories.prerequisite.baseScore=90; var r=await publishPolicy(s,{id:'editor',role:'admin'},p,1); assert(r.ok && r.intent.context.resultData.policyVersion===2,'Publish version 2.'); var stale=await publishPolicy(s,{id:'editor',role:'admin'},p,1); assert(!stale.ok && stale.stage==='Process','Reject a stale expected version.'); assert((await s.policyStore.history()).length===2,'No extra history entry on failure.');"),
    check("Verified identity controls update permission", "var s=api.createDemoLessonServices(); var denied=await publishPolicy(s,{id:'learner',role:'admin'},api.createLessonPolicy(),1); assert(!denied.ok && denied.stage==='Authorize','Claiming admin in actor.role does not grant permission.'); assert((await s.policyStore.read()).version===1,'Denied update must not publish.');")] });

addLesson({ id: "adaptive-capstone", mode: "independent", title: "Prove a policy changes future outcomes",
  summary: "Connect policy publication to a subsequent recommendation.", duration: "20–25 min",
  narrative: ["Demonstrate the complete model update using the real template. Preserve the earlier result so it still identifies the policy used for that execution.",
    "Create fresh services. Run a baseline recommendation, publish a policy favoring prerequisite evidence, then run another recommendation. Return the three results."],
  example: "Return { before: pipelineResult, update: pipelineResult, after: pipelineResult }\nUse api.createDemoLessonServices, api.createLessonRecommendationFactory,\napi.createContextPolicyUpdateFactory, and api.pipeline.run.",
  instructions: ["Implement async demonstratePolicyChange().", "Use fresh demo services without signals. Recommend for { id: 'learner', role: 'student' }.", "Read the policy and set categories.prerequisite.baseScore to 95. Publish with { id: 'editor', role: 'admin' }, expectedVersion: 1, and a reason.", "Run the learner recommendation again using the same services. Return before, update, and after. Return a failed update immediately if publication fails."],
  hint: "Keep the same service store for all three executions. A new service instance would discard the policy change.",
  starter: "async function demonstratePolicyChange() {\n  // Prove that a versioned update changes the next recommendation.\n}",
  solution: "async function demonstratePolicyChange() {\n  var services = api.createDemoLessonServices();\n  var recommend = api.createLessonRecommendationFactory(services);\n  var learner = { id: 'learner', role: 'student' };\n  var before = await api.pipeline.run(recommend(learner, {}));\n  var policy = await services.policyStore.read();\n  policy.categories.prerequisite.baseScore = 95;\n  var publish = api.createContextPolicyUpdateFactory(services);\n  var update = await api.pipeline.run(publish({ id: 'editor', role: 'admin' }, { policy: policy, expectedVersion: 1, reason: 'Prioritize prerequisite evidence' }));\n  if (!update.ok) { return update; }\n  var after = await api.pipeline.run(recommend(learner, {}));\n  return { before: before, update: update, after: after };\n}",
  tests: [check("Outcomes follow the published policy", "var r=await demonstratePolicyChange(); assert(r.before.ok && r.update.ok && r.after.ok,'Complete all three executions.'); assert(r.before.intent.context.resultData.lessonId==='advanced-project' && r.after.intent.context.resultData.lessonId==='prerequisite-review','Show a changed recommendation.'); assert(r.before.intent.context.adaptiveContext.policyVersion===1 && r.after.intent.context.adaptiveContext.policyVersion===2,'Preserve the policy version on each result.');"),
    check("All stages and audit evidence remain present", "var r=await demonstratePolicyChange(); for(var result of [r.before,r.update,r.after]) { assert(Object.keys(result.intent.stages).join(',')===api.stageNames.join(','),'Keep all six stages.'); assert(result.intent.context.events.length===1,'Emit each outcome.'); } assert(r.after.intent.context.adaptiveContext.decisionTrace.length===3,'Keep the decision explanation.');")] });

export { adaptiveLessons };

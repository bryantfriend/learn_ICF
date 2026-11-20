import { createMemoryContextPolicyStore } from "../engine/contextPolicyStore.js";

function createLessonPolicy() {
  return {
    id: "lesson-context", version: 1, intentType: "RecommendNextLessonIntent", scope: "course-1",
    maxCandidates: 2, minimumScore: 50, requireSelection: true, allowedSources: ["learning-records"],
    categories: {
      prerequisite: { baseScore: 60, factors: { repeatedErrors: 25, shortSession: 10 } },
      preference: { baseScore: 75, factors: { repeatedErrors: -10 } },
      project: { baseScore: 80, factors: { repeatedErrors: -20, shortSession: -25 } }
    }
  };
}

function createLessonCandidates() {
  return [
    makeCandidate("gap", "prerequisite", "prerequisite-review"),
    makeCandidate("interest", "preference", "preferred-topic"),
    makeCandidate("project", "project", "advanced-project")
  ];
}

function makeCandidate(id, category, lessonId) {
  return { id: id, revision: "1", category: category, source: "learning-records",
    scope: "course-1", accessible: true, observedAt: 0, expiresAt: 10000, value: { lessonId: lessonId } };
}

// Fixed fixtures for a runnable example and the academy. These are not authentication or persistence.
function createDemoLessonServices(options) {
  if (!options) { options = {}; }
  var signals = {};
  if (options.signals) { signals = structuredClone(options.signals); }
  var allowed = options.allowed !== false;
  var signalEntries = Object.keys(signals).sort().map(function snapshotEntry(name) { return [name, signals[name]]; });
  var signalSnapshotId = "demo-signals:" + JSON.stringify(signalEntries);
  var store = createMemoryContextPolicyStore(createLessonPolicy());
  var services = {
    policyStore: store,
    now: function now() { return 1000; },
    loadIdentity: async function loadIdentity(actor) {
      if (actor.id !== "learner" && actor.id !== "editor") { return null; }
      return { id: actor.id, scope: "course-1", canReadLearningData: true,
        canRecommend: allowed, canUpdateContextPolicy: actor.id === "editor" };
    },
    loadLessonSnapshot: async function loadLessonSnapshot(intent) {
      var learner = intent.context.learner;
      if (!learner || learner.canReadLearningData !== true || learner.scope !== "course-1") {
        throw new Error("Learning data access required.");
      }
      return { policy: await store.read(), scope: learner.scope, evaluatedAt: services.now(),
        signalSnapshotId: signalSnapshotId, signals: structuredClone(signals), candidates: createLessonCandidates() };
    }
  };
  return services;
}

export { createLessonPolicy, createLessonCandidates, createDemoLessonServices };

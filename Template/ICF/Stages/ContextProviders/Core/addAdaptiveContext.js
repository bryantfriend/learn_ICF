import resultHelpers from "../../../engine/resultHelpers.js";
import { rankContextCandidates } from "../../../engine/adaptiveContext.js";

function createAdaptiveContextProvider(loadSnapshot) {
  if (typeof loadSnapshot !== "function") { throw new Error("A trusted snapshot loader is required."); }
  async function addAdaptiveContext(intent) {
    try {
      // A failed refresh must not leave an earlier selection on the working intent.
      delete intent.context.adaptiveContext;
      // Loader owns authentication, source access, required facts, timeouts, and snapshot capture.
      // Never use payload or caller-provided context as a substitute for this loader.
      var snapshot = await loadSnapshot(intent);
      var decision = rankContextCandidates(snapshot.candidates, snapshot.signals, snapshot.policy, {
        intentType: intent.type, scope: snapshot.scope, evaluatedAt: snapshot.evaluatedAt,
        signalSnapshotId: snapshot.signalSnapshotId
      });
      intent.context.adaptiveContext = decision;
      return resultHelpers.success(intent);
    } catch (error) {
      return resultHelpers.contextFailure(error);
    }
  }
  return addAdaptiveContext;
}

export { createAdaptiveContextProvider };

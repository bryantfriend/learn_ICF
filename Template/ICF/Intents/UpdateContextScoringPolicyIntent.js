import validators from "../Stages/Validators/validators.js";
import normalizers from "../Stages/Normalizers/normalizers.js";
import contextProviders from "../Stages/ContextProviders/contextProviders.js";
import authorizers from "../Stages/Authorizers/authorizers.js";
import processors from "../Stages/Processors/processors.js";
import emitters from "../Stages/Emitters/emitters.js";

function createContextPolicyUpdateFactory(services) {
  function createUpdateContextScoringPolicyIntent(actor, payload) {
    return {
      type: "UpdateContextScoringPolicyIntent", actor: actor, payload: payload, context: {},
      meta: { source: "adaptive-context", createdAt: services.now() },
      stages: {
        Validate: { requireBaseIntentShape: validators.requireBaseIntentShape, validatePolicyUpdate: validators.validatePolicyUpdate },
        Normalize: { normalizePolicyUpdate: normalizers.normalizePolicyUpdate },
        AddContext: { addPolicyUpdateContext: contextProviders.createPolicyUpdateContextProvider(services) },
        Authorize: { authorizePolicyUpdate: authorizers.authorizePolicyUpdate },
        Process: { processPolicyUpdate: processors.createPolicyUpdateProcessor(services.policyStore) },
        Emit: { emitAdaptiveResult: emitters.emitAdaptiveResult }
      }
    };
  }
  return createUpdateContextScoringPolicyIntent;
}
export { createContextPolicyUpdateFactory };

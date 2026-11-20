import validators from "../Stages/Validators/validators.js";
import normalizers from "../Stages/Normalizers/normalizers.js";
import contextProviders from "../Stages/ContextProviders/contextProviders.js";
import authorizers from "../Stages/Authorizers/authorizers.js";
import processors from "../Stages/Processors/processors.js";
import emitters from "../Stages/Emitters/emitters.js";

// Confirms that the ICF pipeline is wired correctly.
function createDemoIntent(actor, payload, options) {
  return {
    type: "DemoIntent",
    description: "Confirms that the ICF pipeline is wired correctly.",
    actor: createDemoActor(actor),
    payload: createDemoPayload(payload),
    context: {},
    meta: createDemoMeta(options),
    stages: createDemoStages()
  };
}

function createDemoActor(actor) {
  if (actor) {
    return actor;
  }

  return {
    id: "demo-system",
    role: "system"
  };
}

function createDemoPayload(payload) {
  if (payload) {
    return payload;
  }

  return {};
}

function createDemoMeta(options) {
  var source = "demo";

  if (options) {
    if (options.source) {
      source = options.source;
    }
  }

  return {
    source: source,
    createdAt: Date.now()
  };
}

function createDemoStages() {
  return {
    Validate: {
      requireBaseIntentShape: validators.requireBaseIntentShape
    },

    Normalize: {
      passNormalization: normalizers.passNormalization
    },

    AddContext: {
      addTimestampContext: contextProviders.addTimestampContext,
      addSourceContext: contextProviders.addSourceContext,
      addActorRoleContext: contextProviders.addActorRoleContext
    },

    Authorize: {
      allow: authorizers.allow
    },

    Process: {
      setDemoResult: processors.setDemoResult
    },

    Emit: {
      addDemoSuccessMessage: emitters.addDemoSuccessMessage,
      addDemoCompletedEvent: emitters.addDemoCompletedEvent,
      addDebugSummary: emitters.addDebugSummary
    }
  };
}

export default {
  createDemoIntent: createDemoIntent
};

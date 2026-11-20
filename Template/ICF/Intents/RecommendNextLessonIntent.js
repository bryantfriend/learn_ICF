import validators from "../Stages/Validators/validators.js";
import normalizers from "../Stages/Normalizers/normalizers.js";
import contextProviders from "../Stages/ContextProviders/contextProviders.js";
import authorizers from "../Stages/Authorizers/authorizers.js";
import processors from "../Stages/Processors/processors.js";
import emitters from "../Stages/Emitters/emitters.js";

function createLessonRecommendationFactory(services) {
  function createRecommendNextLessonIntent(actor, payload) {
    return {
      type: "RecommendNextLessonIntent", actor: actor, payload: payload, context: {},
      meta: { source: "adaptive-context", createdAt: services.now() },
      stages: {
        Validate: { requireBaseIntentShape: validators.requireBaseIntentShape },
        Normalize: { passNormalize: normalizers.passNormalize },
        AddContext: {
          addLearner: contextProviders.createLessonContextProvider(services),
          addAdaptiveContext: contextProviders.createAdaptiveContextProvider(services.loadLessonSnapshot.bind(services))
        },
        Authorize: { authorizeLessonRecommendation: authorizers.authorizeLessonRecommendation },
        Process: { processLessonRecommendation: processors.processLessonRecommendation },
        Emit: { emitAdaptiveResult: emitters.emitAdaptiveResult }
      }
    };
  }
  return createRecommendNextLessonIntent;
}
export { createLessonRecommendationFactory };

// ICF/Intents/intents.js

import intentRegistry from "../engine/intentRegistry.js";

import demoIntentModule from "./DemoIntent.js";
import { createLessonRecommendationFactory } from "./RecommendNextLessonIntent.js";
import { createContextPolicyUpdateFactory } from "./UpdateContextScoringPolicyIntent.js";

// Configure trusted services at startup; never accept them from a request payload.
function registerAdaptiveIntents(services) {
  return intentRegistry.registerIntents({
    RecommendNextLessonIntent: createLessonRecommendationFactory(services),
    UpdateContextScoringPolicyIntent: createContextPolicyUpdateFactory(services)
  });
}

/**
 * Registers all project Intents.
 *
 * Add new Intent registrations here as the project grows.
 *
 * @returns {Object} Registration result.
 */
function registerProjectIntents() {
  return intentRegistry.registerIntents({
    DemoIntent: demoIntentModule.createDemoIntent
  });
}

export default {
  registerAdaptiveIntents: registerAdaptiveIntents,
  registerProjectIntents: registerProjectIntents
};

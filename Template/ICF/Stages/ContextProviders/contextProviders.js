// ICF/Stages/ContextProviders/contextProviders.js

import passContextModule from "./Core/passContext.js";
import { createAdaptiveContextProvider } from "./Core/addAdaptiveContext.js";
import { createLessonContextProvider } from "./Domain/adaptiveContext/addLessonContext.js";
import { createPolicyUpdateContextProvider } from "./Domain/adaptiveContext/addPolicyUpdateContext.js";
import passAddContextModule from "./Core/passAddContext.js";
import addTimestampContextModule from "./Core/addTimestampContext.js";
import addSourceContextModule from "./Core/addSourceContext.js";
import addActorRoleContextModule from "./Core/addActorRoleContext.js";
import addStaticContextValueModule from "./Core/addStaticContextValue.js";

/**
 * Context Providers
 *
 * This file gathers all context provider functions and factories into one
 * readable object.
 *
 * Intent files should import this file, then choose the context providers
 * they need.
 *
 * AddContext should attach trusted system data needed by later stages.
 */

var contextProviders = {
  createAdaptiveContextProvider: createAdaptiveContextProvider,
  createLessonContextProvider: createLessonContextProvider,
  createPolicyUpdateContextProvider: createPolicyUpdateContextProvider,
  passContext: passContextModule.passContext,
  passAddContext: passAddContextModule.passAddContext,

  addTimestampContext: addTimestampContextModule.addTimestampContext,
  addSourceContext: addSourceContextModule.addSourceContext,
  addActorRoleContext: addActorRoleContextModule.addActorRoleContext,

  createAddStaticContextValueProvider:
    addStaticContextValueModule.createAddStaticContextValueProvider
};

export default contextProviders;

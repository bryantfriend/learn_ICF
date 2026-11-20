import { emitAdaptiveResult } from "./Domain/adaptiveContext/emitAdaptiveResult.js";
// ICF/Stages/Emitters/emitters.js

import passEmitModule from "./Core/passEmit.js";
import addSuccessMessageModule from "./Core/addSuccessMessage.js";
import addEventModule from "./Core/addEvent.js";
import addResultMessageModule from "./Core/addResultMessage.js";
import addDebugSummaryModule from "./Core/addDebugSummary.js";

var addDemoSuccessMessage = addSuccessMessageModule.createAddSuccessMessageEmitter(
  "ICF demo completed successfully."
);

var addDemoCompletedEvent = addEventModule.createAddEventEmitter(
  "DemoIntentCompleted",
  {
    source: "ICF demo"
  }
);

/**
 * Emitters
 *
 * This file gathers all emitter functions and emitter factories into one
 * readable object.
 *
 * Intent files should import this file, then choose the emitters they need.
 *
 * Emit should prepare useful result data, events, logs, notifications,
 * analytics instructions, or UI feedback instructions.
 */

var emitters = {
  emitAdaptiveResult: emitAdaptiveResult,
  passEmit: passEmitModule.passEmit,

  createAddSuccessMessageEmitter:
    addSuccessMessageModule.createAddSuccessMessageEmitter,

  createAddEventEmitter:
    addEventModule.createAddEventEmitter,

  createAddResultMessageEmitter:
    addResultMessageModule.createAddResultMessageEmitter,

  addDemoSuccessMessage:
    addDemoSuccessMessage,

  addDemoCompletedEvent:
    addDemoCompletedEvent,

  addDebugSummary:
    addDebugSummaryModule.addDebugSummary
};

export default emitters;

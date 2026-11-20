import pipeline from './Template/ICF/engine/pipeline.js';
import { scoreContextCandidate, rankContextCandidates } from './Template/ICF/engine/adaptiveContext.js';
import { createAdaptiveContextProvider } from './Template/ICF/Stages/ContextProviders/Core/addAdaptiveContext.js';
import { createLessonPolicy, createLessonCandidates, createDemoLessonServices } from './Template/ICF/examples/lessonServices.js';
import { createLessonRecommendationFactory } from './Template/ICF/Intents/RecommendNextLessonIntent.js';
import { createContextPolicyUpdateFactory } from './Template/ICF/Intents/UpdateContextScoringPolicyIntent.js';
import registry from './Template/ICF/engine/intentRegistry.js';
import { createValidator } from './Template/ICF/StageFactories/createValidator.js';
import { createNormalizer } from './Template/ICF/StageFactories/createNormalizer.js';
import { createContextAdder } from './Template/ICF/StageFactories/createContextAdder.js';
import { createAuthorizer } from './Template/ICF/StageFactories/createAuthorizer.js';
import { createProcessor } from './Template/ICF/StageFactories/createProcessor.js';
import { createEmitter } from './Template/ICF/StageFactories/createEmitter.js';
export const stageNames = pipeline.REQUIRED_STAGE_NAMES.slice();
function pass(intent) { return { ok: true, intent: intent }; }
function passHelpers() { return Object.fromEntries(stageNames.map(function(name) { return [name,pass]; })); }
function tracingHelpers(order) { return Object.fromEntries(stageNames.map(function(name) { return [name,function(intent) { order.push(name); return pass(intent); }]; })); }
function makeIntent(type,actor,payload,helpers) {
  var stages = {};
  stageNames.forEach(function(name) { stages[name] = { run: helpers[name] }; });
  return { type: type, actor: actor, payload: payload, context: {}, meta: { source: 'studio' }, stages: stages };
}
async function runBorrow(factory,actor,payload,library) {
  var registered = registry.hasIntent('BorrowBookIntent') ? { ok:true } : registry.registerIntent('BorrowBookIntent',factory);
  if (!registered.ok) { return registered; }
  var created = registry.createIntent('BorrowBookIntent',actor,payload,{library:library});
  return created.ok ? await pipeline.run(created.intent) : created;
}
export const api = { pipeline,registry,createValidator,createNormalizer,createContextAdder,createAuthorizer,createProcessor,createEmitter,stageNames,passHelpers,tracingHelpers,makeIntent,runBorrow };
Object.assign(api, { scoreContextCandidate, rankContextCandidates, createAdaptiveContextProvider,
  createLessonPolicy, createLessonCandidates, createDemoLessonServices,
  createLessonRecommendationFactory, createContextPolicyUpdateFactory });
export async function runExercise(code, tests, onResult) {
  var results = [];
  var logs = [];
  var AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;
  function assert(condition,message) { if (!condition) { throw new Error(message); } }
  var capturedConsole = { log: function() {
    if (logs.length >= 100) { throw new Error('Too much output. Check whether your loop stops.'); }
    logs.push(Array.from(arguments).map(function(value) { return typeof value === 'object' ? JSON.stringify(value) : String(value); }).join(' '));
  } };
  for (var test of tests) {
    registry.clearRegistry();
    var result;
    try {
      // Fresh lexical scope for each test keeps one test's local variables out of the next.
      await new AsyncFunction('api','assert','console','"use strict";\n'+code+'\n'+test.body)(api,assert,capturedConsole);
      result = { name:test.name, ok:true };
    } catch(error) { result = { name:test.name, ok:false, message:error.name+': '+error.message }; }
    results.push(result);
    if (onResult) { onResult(results.slice()); }
  }
  return { results,logs };
}

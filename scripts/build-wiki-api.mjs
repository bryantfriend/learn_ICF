import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const groups = [];
const overrides = {
  validatePolicyUpdate: "Check a request to change the scoring rules before the app reads or saves the rules.",
  passValidation: "Let the request through Validate as it is.",
  passValidate: "Let the request through Validate as it is.",
  requireIntentType: "Check that the request has a valid action name.",
  requireActor: "Check that the request says who asked.",
  requirePayload: "Check that the request has an object for the inputs.",
  requireContext: "Check that the request has an object for facts and results.",
  requireBaseIntentShape: "Check that the request has the basic parts ICF needs.",
  exampleRequireStoreId: "Stop the request if it has no store ID.",
  createRequireActorRoleValidator: "Make a check that accepts only the roles you list in the actor field.",
  normalizePolicyUpdate: "Put the new scoring rules into a standard format for later checks.",
  passNormalization: "Let the request through Normalize as it is.",
  passNormalize: "Let the request through Normalize as it is.",
  exampleTrimProductName: "Remove spaces from the start and end of the product name.",
  createTrimPayloadStringFieldNormalizer: "Make a step that trims spaces from a text field you choose.",
  createNormalizePayloadNumberFieldNormalizer: "Make a step that turns a field you choose into a number.",
  createNormalizePayloadBooleanFieldNormalizer: "Make a step that reads values such as yes and no as true or false.",
  createNormalizePayloadDateFieldNormalizer: "Make a step that writes a date in the standard ISO format.",
  createAdaptiveContextProvider: "Read the current rules and clues. Use them to score choices that can be picked.",
  createLessonContextProvider: "Look up the learner and add their checked record to the request.",
  createPolicyUpdateContextProvider: "Look up who asked for the change and which rules are live.",
  passContext: "Let the request through AddContext as it is.",
  passAddContext: "Let the request through AddContext as it is.",
  addTimestampContext: "Add the current time to the request’s context.",
  addSourceContext: "Copy where the request came from into context.",
  addActorRoleContext: "Copy the role from actor.role into context. This does not check the role.",
  createAddStaticContextValueProvider: "Make a step that adds a fixed value to context.",
  authorizePolicyUpdate: "Check whether the person has permission to change the rules.",
  authorizeLessonRecommendation: "Check whether the learner is allowed to receive a lesson suggestion.",
  allow: "Always let the request through this permission step.",
  deny: "Always stop the request at this permission step.",
  passAuthorize: "Let the request through Authorize without an extra check.",
  createRequireActorRoleAuthorizer: "Make a permission check that matches actor.role against a list.",
  createRequireContextRoleAuthorizer: "Make a permission check that matches the role saved in context against a list.",
  createRequireContextValueAuthorizer: "Make a permission check that compares a context field with the value you expect.",
  createPolicyUpdateProcessor: "Save the new scoring rules if the version still matches the one the editor started with.",
  processLessonRecommendation: "Put the chosen lesson and its score in resultData.",
  doNothing: "Pass through Process without making a change.",
  passProcess: "Pass through Process without making a change.",
  exampleSetCreatedProductResult: "Write a sample product result to resultData.",
  createSetResultDataProcessor: "Make a step that writes fixed values to resultData.",
  addPayloadToResultData: "Copy the request input into resultData.",
  addContextToResultData: "Copy the request’s context into resultData.",
  setDemoResult: "Mark the demo as having finished Process.",
  emitAdaptiveResult: "Add an event that says what the lesson or rules request did.",
  passEmit: "Let the request through Emit as it is.",
  createAddSuccessMessageEmitter: "Make a step that writes a success message to resultData.",
  createAddEventEmitter: "Make a step that adds an event to the request’s event list.",
  createAddResultMessageEmitter: "Make a step that adds a message to resultData.",
  addDebugSummary: "Add details to resultData that can help you find a problem.",
  run: "Run the Intent. Get the answer or error, along with a list of the named steps that ran.",
  registerIntent: "Tell the registry which function makes one kind of Intent.",
  registerIntents: "Tell the registry which functions make several kinds of Intents.",
  createIntent: "Make a new request using a registered action name.",
  getIntentFactory: "Find the function that makes a registered kind of Intent.",
  hasIntent: "Check whether the registry knows this action name.",
  listIntentTypes: "Show all action names the registry knows.",
  clearRegistry: "Remove all the action names and their factories from the registry.",
  passThrough: "Return success and keep the same Intent.",
  stepFailure: "Build an error that names the stage and step that failed.",
  contextFailure: "Build an error for a step that stopped in AddContext.",
  authorizationFailure: "Build an error for a permission check that failed.",
  normalizeErrors: "Put error messages into one list the runner can read.",
  getResultData: "Read the data the steps built for the final answer.",
  getEvents: "Read the events the steps added to the request.",
  rankContextCandidates: "Check which choices can be used, score them, and keep the top choices allowed by the rules.",
  scoreContextCandidate: "Add up a choice’s score and show what each clue added or took away.",
  validateContextPolicy: "Check that the scoring rules use allowed values and limits.",
  createMemoryContextPolicyStore: "Keep the current rules and their history in memory. Check the version when saving a change.",
  addDemoCompletedEvent: "Add a DemoIntentCompleted event to the demo result.",
  addDemoSuccessMessage: "Add the demo’s success message."
};
function read(file) { return fs.readFileSync(path.join(root,file),'utf8').replaceAll('\r\n','\n'); }
async function load(file) { return import(pathToFileURL(path.join(root,file)).href); }
function firstDoc(source, functionName) {
  const start = source.indexOf('function ' + functionName + '(');
  if (start < 0) return '';
  const before = source.slice(0,start).trimEnd().replace(/\basync$/, '').trimEnd();
  if (!before.endsWith('*/')) return '';
  return before.slice(before.lastIndexOf('/**') + 3,-2).split('\n').map(function clean(line) {
    return line.trim().replace(/^\* ?/,'');
  }).join('\n').trim();
}
function entry(group, key, item, file, alias, moduleFile, named) {
  const isStep = typeof item !== 'function';
  const source = read(file);
  const doc = firstDoc(source, isStep ? key : item.name);
  const description = overrides[key] || (isStep && item.description) || doc.split(/\n\s*\n|\n@/)[0].replaceAll('\n',' ');
  if (!description) throw new Error('Missing description for ' + key);
  const signature = isStep ? '' : Function.prototype.toString.call(item).match(/^\s*(?:async\s+)?function\s*\w*\s*\(([^)]*)\)/)[1].trim();
  const member = named ? key : alias + '.' + key;
  let usage = member + (isStep ? '' : '(' + signature + ')');
  let kind = 'Function';
  if (group.stage) {
    if (isStep || !key.startsWith('create')) {
      kind = isStep ? 'Stage object' : 'Stage step';
      usage = group.stage + ': {\n  ' + key + ': ' + member + '\n}';
    } else kind = 'Configured helper';
  }
  return {id:group.id + '-' + key, key, description, kind, signature:member + (isStep ? '' : '(' + signature + ')'),
    importLine:named ? 'import { ' + key + ' } from "./' + moduleFile + '";' : 'import ' + alias + ' from "./' + moduleFile + '";',
    usage, source:file, params:doc.split('\n').filter(function param(line) { return line.startsWith('@param') || line.startsWith('@returns'); })};
}
async function addRegistry(id,title,stage,file) {
  const api = (await load(file)).default;
  const imports = new Map();
  const text = read(file);
  for (const match of text.matchAll(/^import (?:\{\s*(\w+)\s*\}|(\w+)) from "([^"]+)";/gm)) {
    const relative = path.posix.join(path.posix.dirname(file),match[3]);
    const implementation = await load(relative);
    const values = match[1] ? [implementation[match[1]]] : Object.values(implementation.default);
    for (const value of values) imports.set(value,relative);
  }
  const group = {id,title,stage,entries:[]};
  for (const [key,value] of Object.entries(api)) {
    if (typeof value !== 'function' && !(value && value.run)) continue;
    group.entries.push(entry(group,key,value,imports.get(value) || file,path.posix.basename(file,'.js'),file,false));
  }
  groups.push(group);
}
const base = 'Template/ICF/';
const stages = [
  ['validate','Validate','Validators','validators'], ['normalize','Normalize','Normalizers','normalizers'],
  ['add-context','AddContext','ContextProviders','contextProviders'], ['authorize','Authorize','Authorizers','authorizers'],
  ['process','Process','Processors','processors'], ['emit','Emit','Emitters','emitters']
];
for (const [id,stage,folder,registry] of stages) await addRegistry(id,stage + ' helpers',stage,base+'Stages/'+folder+'/'+registry+'.js');
await addRegistry('runner','Pipeline runner','',base+'engine/pipeline.js');
await addRegistry('registry','Intent registry','',base+'engine/intentRegistry.js');
await addRegistry('results','Result helpers','',base+'engine/resultHelpers.js');
const more = [
  ['factories','Stage factories',['createValidator','createNormalizer','createContextAdder','createAuthorizer','createProcessor','createEmitter'].map(function file(name) { return base+'StageFactories/'+name+'.js'; })],
  ['adaptive-api','Adaptive Context API',[base+'engine/adaptiveContext.js',base+'engine/contextPolicyStore.js']]
];
for (const [id,title,files] of more) {
  const group = {id,title,entries:[]};
  for (const file of files) {
    for (const [key,value] of Object.entries(await load(file))) {
      if (key !== 'default' && typeof value === 'function') group.entries.push(entry(group,key,value,file,'',file,true));
    }
  }
  groups.push(group);
}
fs.writeFileSync(path.join(root,'tutorial-api.mjs'),'// Generated from the template by scripts/build-wiki-api.mjs.\nexport const apiGroups = ' + JSON.stringify(groups,null,2) + ';\n');
console.log(groups.map(function summary(g) { return g.title + ': ' + g.entries.length; }).join('\n'));

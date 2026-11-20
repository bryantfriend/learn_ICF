import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = fileURLToPath(new URL('../', import.meta.url));
const groups = [];
const overrides = {
  run: 'Execute an Intent and return its result with a trace of the named steps that ran.',
  createAdaptiveContextProvider: 'Load a versioned policy, capture signals, and rank eligible optional evidence during AddContext.',
  createLessonContextProvider: 'Look up the learner through the trusted identity service and attach the verified record.',
  createPolicyUpdateContextProvider: 'Load the verified operator and current policy before a policy update.',
  createPolicyUpdateProcessor: 'Save the proposed policy revision through the version-aware policy store.',
  validatePolicyUpdate: 'Check the proposed scoring-policy update before loading or writing policy state.',
  normalizePolicyUpdate: 'Standardize the policy update payload for later checks.',
  authorizePolicyUpdate: 'Check verified policy-management permissions for the proposed update.',
  authorizeLessonRecommendation: 'Check whether the verified learner can receive a recommendation.',
  processLessonRecommendation: 'Project the selected lesson and score into resultData.',
  emitAdaptiveResult: 'Append an event describing the completed adaptive action.',
  validateContextPolicy: 'Validate scoring-policy fields, bounds, and selection settings.',
  scoreContextCandidate: 'Calculate a candidate score and explain individual signal contributions.',
  rankContextCandidates: 'Apply eligibility, scoring, ordering, threshold, and selection-budget rules.',
  createMemoryContextPolicyStore: 'Keep policy versions and history in an in-memory store with revision-aware writes.',
  addDemoCompletedEvent: 'Append the configured DemoIntentCompleted event to the demo result.',
  addDemoSuccessMessage: 'Attach the configured ICF demo success message.'
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

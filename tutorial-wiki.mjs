import { recipeGroups } from './tutorial-recipes.mjs';
import { workflowGroups, adoptionGuide } from './tutorial-workflows.mjs';
import { apiGroups } from './tutorial-api.mjs';
import { escapeHTML, prose, link, kicker, pageIntro, listRow, codeBlock } from './tutorial-ui.mjs';

export { apiGroups };
export const exampleGroups = recipeGroups.concat(workflowGroups);
export const examples = [], apiEntries = [], wikiSearch = [];
const exampleById = new Map(), apiById = new Map();
function addSearch(title,category,href,detail,symbol) {
  wikiSearch.push({title,category,href,detail,symbol});
}
function addGroup(group, collection, lookup, type) {
  const isExample = type === 'example';
  for (const item of isExample ? group.examples : group.entries) {
    const record = {item,group};
    collection.push(item);
    lookup.set(item.id,record);
    addSearch(isExample ? item.title : item.key,(isExample ? 'Example' : 'API') + ' · ' + group.title,
      '#' + type + '/' + item.id,isExample ? [item.task,item.expected,item.why,item.code].join(' ') : [item.description,item.signature,item.source].join(' '),
      isExample ? 'code' : 'book');
  }
}
for (const group of exampleGroups) addGroup(group,examples,exampleById,'example');
for (const group of apiGroups) addGroup(group,apiEntries,apiById,'helper');
for (const group of exampleGroups) addSearch(group.title,'Example collection','#examples/' + group.id,'Worked examples with code and expected output.','code');
for (const group of apiGroups) addSearch(group.title,'API category','#api/' + group.id,'Template helpers and signatures.','book');
addSearch('Set up and use offline','Getting started','#setup','Download the full wiki and run the local HTTP server on your computer without AI or an internet connection.','box');
addSearch('Build a complete feature','Implementation guide','#build','Copy a working six-stage ReserveSeatIntent with registration, success, failure and tests.','route');
addSearch('Worked examples','Wiki library','#examples','All worked examples, inputs and expected outputs.','code');
addSearch('Template API reference','Wiki library','#api','All helper signatures, import paths and source files.','book');
export const wikiNav = [
  {id:'examples',label:'Worked examples',href:'#examples',count:examples.length,children:exampleGroups.map(function group(g) {
    return {id:'ex-'+g.id,label:g.title,href:'#examples/'+g.id,children:g.examples.map(function entry(e) { return {label:e.title,href:'#example/'+e.id}; })};
  })},
  {id:'api',label:'Template API',href:'#api',count:apiEntries.length,children:apiGroups.map(function group(g) {
    return {id:'api-'+g.id,label:g.title,href:'#api/'+g.id,children:g.entries.map(function entry(e) { return {label:e.key,href:'#helper/'+e.id}; })};
  })}
];
function result(title,trail,html,tab) { return {title,trail,html,tab}; }
function sources(file) {
  if (!file) return '';
  return '<p class="source-path"><strong>Source file</strong> ' + link(encodeURI(file),file) + '</p>';
}
function shortList(group, type) {
  const isExample = type === 'examples';
  const records = isExample ? group.examples : group.entries;
  return '<article class="collection"><header>' + kicker(records.length + (isExample ? ' examples' : ' entries')) +
    '<h2>' + link('#' + type + '/' + group.id,group.title) + '</h2></header><ul>' + records.slice(0,3).map(function sample(r) {
      return '<li>' + link((isExample ? '#example/' : '#helper/') + r.id,isExample ? r.title : r.key) + '</li>';
    }).join('') + '</ul>' + link('#'+type+'/'+group.id,'View collection','sub-link') + '</article>';
}
function renderExamples(group) {
  const title = group ? group.title : 'Worked examples';
  const intro = group ? 'Choose a case to see the setup, code, expected result, and the rule it demonstrates.' : 'Find a task, copy its example, and compare your result with the expected output. The examples use the same template that ships with this wiki.';
  const body = group ? '<div class="listing">' + group.examples.map(function row(e) { return listRow('#example/'+e.id,e.title,e.task,'code'); }).join('') + '</div>' :
    '<div class="collection-grid">' + exampleGroups.map(function card(g) { return shortList(g,'examples'); }).join('') + '</div>';
  return result(title,group ? [['Worked examples','#examples'],[title]] : [['Worked examples']],pageIntro('Example library',title,intro) + body,'examples');
}
function renderExample(record) {
  const e = record.item, g = record.group;
  const related = g.examples.filter(function sibling(r) { return r !== e; }).slice(0,3);
  const lang = e.language || 'JavaScript';
  let context = '';
  if (recipeGroups.includes(g) && /javascript|js module|esm/i.test(lang)) context = '<p class="code-note">Save this example as <code>example.mjs</code> beside the downloaded <code>Template/</code> folder. Run <code>node example.mjs</code> with Node.js 22 or newer.</p>';
  const detail = '<div class="wiki-article">' + context + codeBlock(e.code,lang) + (recipeGroups.includes(g) ? '<div id="tryRecipe"></div>' : '') + '<section class="output-block"><h2>Expected result</h2><p>' + prose(e.expected) + '</p></section><section class="lesson-section"><h2>How it works</h2><p>' + prose(e.why) + '</p></section>' + sources(e.source) +
    (e.related ? '<p class="read-related">' + link('#lesson/'+e.related,'Read the related topic','sub-link') + '</p>' : '') +
    '<section class="listing"><h2>More in ' + escapeHTML(g.title) + '</h2>' + related.map(function row(r) { return listRow('#example/'+r.id,r.title,r.task,'code'); }).join('') + '</section></div>';
  return result(e.title,[['Worked examples','#examples'],[g.title,'#examples/'+g.id],[e.title]],pageIntro('Worked example',e.title,e.task) + detail,'examples');
}
function renderApi(group) {
  const title = group ? group.title : 'Template API reference';
  const intro = group ? 'Open an entry for its import, signature, declaration, and implementation file.' : apiEntries.length + ' entries from the current JavaScript template. Use these names when declaring stages, creating Intents, and reading results.';
  const body = group ? '<div class="listing">' + group.entries.map(function row(e) { return listRow('#helper/'+e.id,e.key,e.description,'code'); }).join('') + '</div>' :
    '<div class="collection-grid">' + apiGroups.map(function card(g) { return shortList(g,'api'); }).join('') + '</div>';
  return result(title,group ? [['Template API','#api'],[title]] : [['Template API']],pageIntro('Source reference',title,intro) + body,'reference');
}
function renderHelper(record) {
  const e = record.item, g = record.group;
  let related = examples.filter(function used(ex) { return ex.code.includes(e.key); }).slice(0,4);
  const detail = '<div class="wiki-article"><section class="lesson-section"><h2>Import from the project root</h2>' + codeBlock(e.importLine,'JavaScript') + '</section><section class="lesson-section"><h2>' +
    (e.kind === 'Stage step' || e.kind === 'Stage object' ? 'Place in the stage declaration' : 'Call signature') + '</h2>' + codeBlock(e.usage,'JavaScript') + '</section>' +
    (e.params.length ? '<section class="api-contract"><h2>Parameters and return value</h2><ul>' + e.params.map(function param(s) { return '<li><code>' + escapeHTML(s) + '</code></li>'; }).join('') + '</ul></section>' : '') +
    sources(e.source) + (related.length ? '<section class="listing"><h2>Worked examples</h2>' + related.map(function row(r) { return listRow('#example/'+r.id,r.title,r.task,'code'); }).join('') + '</section>' : listRow('#api/'+g.id,g.title,'Browse the other entries in this category.','book')) + '</div>';
  return result(e.key,[['Template API','#api'],[g.title,'#api/'+g.id],[e.key]],pageIntro(e.kind,e.key,e.description) + detail,'reference');
}
function setup() {
  const title = 'Set up and use offline';
  const intro = 'Keep a complete local copy of the wiki, the example library, the learning studio, and the framework source. Once downloaded, they all run on your computer.';
  const html = '<div class="wiki-article"><section class="lesson-section"><h2>1. Get the project files</h2><p>Download the repository ZIP while online, then extract it. Open a terminal in the folder containing <code>index.html</code>, <code>serve.cjs</code>, and <code>Template/</code>.</p>' +
    link('https://github.com/bryantfriend/learn_ICF/archive/refs/heads/main.zip','Download the complete wiki (.zip)','action primary') + '<p>With Git installed, you can also clone the repository.</p>' + codeBlock('git clone https://github.com/bryantfriend/learn_ICF.git\ncd learn_ICF','Terminal') + '</section>' +
    '<section class="lesson-section"><h2>2. Open the wiki on your computer</h2><p>With Node.js 22 or newer installed, start the included server. It serves the downloaded files on your own machine.</p>' + codeBlock('node serve.cjs','Terminal') +
    '<p>Open <code>http://127.0.0.1:4173/</code> in a browser. Keep the terminal open while using the wiki. Use the same address for later visits to retain your studio progress. Press Ctrl+C to stop the server.</p><p>If you have Python 3, the same pages also work with this local server.</p>' + codeBlock('python -m http.server 4173 --bind 127.0.0.1','Terminal') + '</section>' +
    '<section class="lesson-section"><h2>3. Check the template</h2><p>Run these two commands in a second terminal from the same folder. The first prints a successful pipeline followed by expected failure cases. The second changes evidence and shows which lesson the policy selects.</p>' +
    codeBlock('node Template/ICF/examples/checkPipeline.mjs\nnode Template/ICF/examples/runAdaptiveContext.mjs','Terminal') + '</section>' + listRow('#build','Build a complete feature','Create and test a seat reservation from an empty domain feature.','route') + '</div>';
  return result(title,[[title]],pageIntro('Local handbook',title,intro) + html,'tutorial');
}
function buildGuide() {
  const title = 'Build a complete feature';
  const html = '<div class="wiki-article"><nav class="build-outline" aria-label="Guide steps">' + adoptionGuide.map(function jump(s,i) {
    return '<button data-jump="build-' + i + '">' + (i+1) + '. ' + escapeHTML(s.title) + '</button>';
  }).join('') + '</nav>' + adoptionGuide.map(function step(s,i) {
    return '<section class="lesson-section" id="build-' + i + '"><h2>' + (i+1) + '. ' + escapeHTML(s.title) + '</h2><p>' + prose(s.body) + '</p>' + (s.code ? codeBlock(s.code,s.language || 'JavaScript') : '') + sources(s.source) + '</section>';
  }).join('') + '</div>';
  return result(title,[['Getting started','#setup'],[title]],pageIntro('Implementation guide',title,'Build a seat-reservation Intent from the template. Work through the files in order, then run both passing and failing requests and check the state after each one.') + html,'tutorial');
}
export function wikiPage(category,id) {
  if (category === 'setup') return setup();
  if (category === 'build') return buildGuide();
  if (category === 'examples') return renderExamples(exampleGroups.find(function find(g) { return g.id === id; }));
  if (category === 'api') return renderApi(apiGroups.find(function find(g) { return g.id === id; }));
  if (category === 'example' && exampleById.has(id)) return renderExample(exampleById.get(id));
  if (category === 'helper' && apiById.has(id)) return renderHelper(apiById.get(id));
  return null;
}

import { lessons, skillNames, tracks } from './academy-course.mjs';
import { loadProgress, saveProgress } from './academy-progress.mjs';
import { chapters } from './tutorial-lessons.mjs';

const wikiReadings = new Map(chapters.flatMap(chapter => chapter.lessons.map(reading => [reading.id, reading])));
// A reading can support several exercises, including earlier course activities with different names.
const practiceByReading = {
  'what-is-icf': 'orientation-intent',
  'intent-envelope': 'foundations-intent-envelope roblox-client-intent roblox-shared-contracts',
  'pipeline-order': 'orientation-stages composition-feature-pipeline composition-pipeline-composer roblox-intent-runner',
  'first-run': 'register-intent',
  'result-envelope': 'orientation-errors composition-result-envelope',
  'validate': 'orientation-validate foundations-string-validators foundations-number-validators validate-helper validate-transfer composition-validator-composer composition-field-registry-runner roblox-normalize-validate',
  'normalize': 'foundations-normalize normalize-helper normalize-transfer composition-normalize-pipeline',
  'add-context': 'orientation-context foundations-context addcontext-helper context-transfer composition-context-factory roblox-context roblox-leaderstats-coins',
  'authorize': 'orientation-authorize foundations-authorize authorize-helper authorize-transfer composition-authorize-policies advanced-manual-review-route roblox-authorize roblox-cooldowns',
  'process': 'orientation-process foundations-process process-helper process-transfer composition-processor-steps roblox-serverstorage-tools roblox-serverstorage-models',
  'emit': 'foundations-finalize emit-helper emit-transfer advanced-finalize-ops roblox-process-finalize roblox-gui-feedback roblox-animations roblox-sounds roblox-visual-effects roblox-feedback',
  'stage-contracts': 'orientation-pass-through stage-contract foundations-compose',
  'stage-factories': 'validate-factory normalize-factory addcontext-factory authorize-factory process-factory emit-factory',
  'intent-declarations': 'declare-intent orientation-folders advanced-orchestrator-map',
  'intent-registry': 'orientation-registration',
  'core-and-domain': 'foundations-folder-structure foundations-base-registry composition-core-domain-boundaries advanced-dependency-graph roblox-modulescript-layout',
  'failure-traces': 'stop-on-failure advanced-failure-strategy adaptive-trace-failure',
  'transactions': 'orientation-transactions advanced-production-runner roblox-multiplayer-thinking',
  'retries': 'delivery-retry advanced-retry-gate advanced-idempotency-map',
  'test-strategy': 'orientation-testing',
  'audit-and-observability': 'composition-audit-envelopes advanced-audit-observability advanced-duration-budget advanced-incident-summary',
  'adaptive-context': 'adaptive-boundaries adaptive-provider',
  'evidence-scores': 'adaptive-score',
  'evidence-eligibility': 'adaptive-select',
  'decision-traces': 'adaptive-outcome adaptive-repair-signals',
  'policy-updates': 'adaptive-policy-concept adaptive-policy-update adaptive-capstone',
  'library-checkout': 'library-capstone',
  'roblox-actions': 'roblox-server-entry roblox-gui-buttons roblox-quests roblox-abilities roblox-reward-chest roblox-demo-game roblox-shop-vertical-slice roblox-project',
  'feature-adoption': 'foundations-project composition-project',
  'maintain-a-feature': 'advanced-project'
};
const wikiByActivity = new Map();
for (const [readingId, activityIds] of Object.entries(practiceByReading)) {
  for (const activityId of activityIds.split(' ')) wikiByActivity.set(activityId, wikiReadings.get(readingId));
}
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
let progress=loadProgress(storage);
const $ = id => document.getElementById(id);
let active = lessons.findIndex(item=>item.id===progress.activeId);
let initialHash='';try{initialHash=decodeURIComponent(location.hash.slice(1));}catch(error){}
const linked = lessons.findIndex(item=>item.id===initialHash);
if (linked>=0) active=linked;
let worker=null;
let timer=null;
let running=false;
let draftRevision=0;
let report=null;
const completed = item => progress.passes[item.id] === item.version;
function save() {
  try { saveProgress(storage,progress); $('saveStatus').textContent='Saved in this browser · Export from course overview'; }
  catch(error) { $('saveStatus').textContent='Storage unavailable — copy your code before leaving'; }
}
function node(tag,text,className) { const element=document.createElement(tag); element.textContent=text; if(className)element.className=className; return element; }
function modeLabel(item){return item.kind==='quiz'?'Concept check':item.kind==='project'?'Project plan':item.kind==='luau'?'Luau structure practice':item.mode==='independent'?'Independent challenge':'Guided coding';}
function coding(item){return !['quiz','project'].includes(item.kind);}
function runLabel(){return lessons[active].kind==='quiz'?'Check answer':lessons[active].kind==='project'?'Review coverage':'Run checks';}
function escapeCode(text) { return text.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }
function lines() {
  const code=$('studioEditor').value;
  $('lineNumbers').textContent=code.split('\n').map((_,i)=>i+1).join('\n');
  const tokens=/(\/\/[^\n]*|\/\*[\s\S]*?\*\/|--[^\n]*)|("(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*')|\b(function|return|var|const|let|local|end|then|and|or|not|nil|if|else|async|await|throw|new|try|catch|for|of|true|false|null|undefined|typeof)\b|\b(\d+)\b/g;
  let html='',last=0;
  for(const match of code.matchAll(tokens)) {
    html+=escapeCode(code.slice(last,match.index));
    html+='<span class="token-'+(match[1]?'comment':match[2]?'string':match[3]?'keyword':'number')+'">'+escapeCode(match[0])+'</span>';
    last=match.index+match[0].length;
  }
  $('syntaxCode').innerHTML=html+escapeCode(code.slice(last))+'\n';
  syncScroll();
}
function syncScroll() { $('lineNumbers').scrollTop=$('studioEditor').scrollTop; $('syntaxCode').scrollTop=$('studioEditor').scrollTop; $('syntaxCode').scrollLeft=$('studioEditor').scrollLeft; }
function selectTab(name) {
  for(const tab of ['learn','task']) { const selected=name===tab; $(tab+'Tab').setAttribute('aria-selected',String(selected)); $(tab+'Tab').tabIndex=selected?0:-1; $(tab+'Content').hidden=!selected; }
}
function renderProgress() {
  const count=lessons.filter(completed).length;
  $('courseProgress').textContent=count+' / '+lessons.length+' complete';
  $('courseProgressFill').style.width=(count/lessons.length*100)+'%';
  $('skillMap').replaceChildren();
  for(const name of skillNames) {
    const group=lessons.filter(item=>item.skill===name);
    const passed=group.filter(completed).length;
    $('skillMap').append(node('div',name+' · '+(passed===group.length?'✓ demonstrated':passed+'/'+group.length),'skill-chip'+(passed===group.length?' earned':'')));
  }
  $('lessonLinks').replaceChildren(); let previousUnit='';
  lessons.forEach((item,index)=>{
    if(item.track!==$('trackSelect').value)return;
    if(item.unit!==previousUnit) { $('lessonLinks').append(node('h3',item.unit)); previousUnit=item.unit; }
    const button=node('button',(completed(item)?'✓ ':String(index+1)+'. ')+item.title);
    button.append(node('small',modeLabel(item)));
    if(index===active) button.setAttribute('aria-current','step');
    button.onclick=()=>{ navigate(index); closeMenu(); $('lessonTitle').focus(); };
    $('lessonLinks').append(button);
  });
}
function render() {
  const item=lessons[active];
  $('trackSelect').value=item.track;
  progress.activeId=item.id;
  history.replaceState(null,'','#'+item.id);
  $('lessonEyebrow').textContent=item.unit+' / '+modeLabel(item);
  $('courseName').textContent=tracks.find(track=>track.id===item.track).title;
  $('lessonTitle').textContent=item.title; $('lessonTitle').tabIndex=-1;
  $('lessonSummary').textContent=item.summary;
  $('lessonMeta').textContent=item.duration+' · '+item.tests.length+' '+(item.kind==='luau'?'text-pattern checks':item.kind==='project'?'coverage checks':item.kind==='quiz'?'concept check':'checks');
  $('lessonNarrative').replaceChildren(...item.narrative.map(text=>node('p',text)));
  $('lessonExample').textContent=item.example;
  $('lessonInstructions').replaceChildren(...item.instructions.map(text=>node('li',text)));
  $('lessonHint').textContent=item.hint;
  $('lessonReflection').textContent=item.reflection;
  const reading=wikiByActivity.get(item.id);
  $('wikiLink').href=reading?'index.html#lesson/'+reading.id:'index.html';
  $('wikiReadingTitle').textContent=reading?reading.title:'Browse topics';
  $('sourceLink').href=item.source;
  $('sourceLink').textContent=item.kind==='project'?'Open the project starter and adaptation guide ↗':'Open the supporting reference ↗';
  $('editorFilename').textContent=item.file;
  $('languageLabel').textContent=item.kind==='luau'?'LUAU · NOT EXECUTED':item.kind==='quiz'?'PRACTICE':item.kind==='project'?'FEATURE PLAN':'JAVASCRIPT';
  document.querySelector('.editor-footnote span+span').textContent=coding(item)?'Tab moves focus · Ctrl+Enter runs':'Your answers and plans save as you work';
  $('studioEditor').setAttribute('aria-label',item.kind==='luau'?'Your Luau solution':'Your JavaScript solution');
  $('studioEditor').value=typeof progress.drafts[item.id]==='string'?progress.drafts[item.id]:(item.starter||'');
  $('testCount').textContent=item.tests.length+(item.tests.length===1?' check':' checks');
  $('footerLesson').textContent='Lesson '+(active+1)+' of '+lessons.length;
  $('previousLesson').disabled=active===0;
  $('nextLesson').textContent=active===lessons.length-1?'View skill progress →':'Next lesson →';
  $('showSolution').hidden=item.mode==='independent'||!coding(item);
  document.querySelector('.code-area').hidden=!coding(item);
  $('activityPanel').hidden=coding(item);
  $('runTests').textContent=runLabel();
  renderActivity(item);
  $('consoleOutput').closest('details').hidden=!coding(item);
  document.querySelector('.code-panel').setAttribute('aria-label',coding(item)?'Code editor':'Learning activity');
  document.querySelector('#resultsIntro h2').textContent=item.kind==='quiz'?'Think it through.':item.kind==='project'?'Connect the whole feature.':'Make it work. Then make it yours.';
  document.querySelector('#resultsIntro p').textContent=item.kind==='quiz'?'Choose an answer and check your reasoning. You can retry as often as you need.':item.kind==='project'?'Describe each responsibility, then review the coverage of your plan.':'Run your code against the lesson checks. Each result identifies something to verify or improve.';
  $('solutionPanel').hidden=true; $('solutionPanel').open=false;
  $('resetConfirm').hidden=true; $('hintBox').open=false;
  $('lessonStatus').textContent=completed(item)?'✓ '+modeLabel(item)+' complete'+(progress.imported[item.id]?' · carried over from your earlier course':''):'Complete the task and run its checks when you are ready.';
  $('assessmentNote').textContent=item.kind==='luau'?'Luau is checked for text patterns here. Execute and test the result in Roblox Studio.':item.kind==='project'?'Project plans receive a coverage check, not an implementation test. Use the executable builder capstone to demonstrate integration.':item.kind==='quiz'?'Choose an answer, check it, and use the explanation to refine your understanding.':'Code is checked in a worker. Imported JavaScript lessons retain their original output and structure checks; builder and Adaptive Context lessons use behavioral contracts.';
  $('testResults').replaceChildren(); $('resultsIntro').hidden=false;
  $('consoleOutput').textContent='Your console.log output appears here.';
  report=null; draftRevision=0; lines(); selectTab('learn'); renderProgress(); save();
  $('lessonPanel').scrollTop=0;
}
function stopRun() { if(worker)worker.terminate(); worker=null; clearTimeout(timer); running=false; $('runTests').disabled=false; $('runTests').textContent=runLabel(); }
function navigate(index) { if(index<0||index>=lessons.length)return; stopRun(); active=index; render(); }
function openMenu() { $('syllabus').hidden=false; $('syllabusToggle').setAttribute('aria-expanded','true'); $('closeSyllabus').focus(); }
function closeMenu() { $('syllabus').hidden=true; $('syllabusToggle').setAttribute('aria-expanded','false'); }
function showResults(results,summary,failed) {
  $('resultsIntro').hidden=true;
  $('testResults').replaceChildren();
  if(summary) $('testResults').append(node('div',summary,'run-summary'+(failed?' failed':'')));
  for(const result of results) {
    const row=node('div','','test-row '+(result.ok?'pass':'fail'));
    row.append(node('strong',(result.ok?'✓ ':'↳ ')+result.name));
    if(result.message) row.append(node('p',result.message));
    $('testResults').append(row);
  }
}
function renderActivity(item){
  $('activityPanel').replaceChildren();
  if(item.kind==='quiz'){
    const group=node('fieldset','');group.append(node('legend',item.title));
    item.answers.forEach((answer,index)=>{const label=node('label','','answer-choice');const radio=document.createElement('input');radio.type='radio';radio.name='concept-answer';radio.checked=progress.answers[item.id]===index;radio.onchange=()=>{progress.answers[item.id]=index;draftRevision++;save();};label.append(radio,node('span',answer));group.append(label);});
    $('activityPanel').append(group);
  }else if(item.kind==='project'){
    const draft=progress.projects[item.id]||{};
    for(const [field,title] of [['name','Feature name'],['intent','Intent and payload'],['validate','Validate and Normalize'],['context','AddContext and Authorize'],['process','Process and Emit']]){
      const label=node('label',title);const input=document.createElement('textarea');input.rows=field==='name'?2:4;input.value=draft[field]||'';input.setAttribute('aria-label',title);input.oninput=()=>{progress.projects[item.id]=progress.projects[item.id]||{};progress.projects[item.id][field]=input.value;draftRevision++;save();};label.append(input);$('activityPanel').append(label);
    }
  }
}
function run() {
  if(running)return;
  const item=lessons[active]; const revision=draftRevision;
  if(coding(item))progress.drafts[item.id]=$('studioEditor').value; save();
  running=true; report=null; $('runTests').disabled=true; $('runTests').textContent='Checking…';
  selectTab('task'); showResults([],'Running your solution against '+item.tests.length+' checks…');
  try {
    worker=new Worker('./studio-worker.mjs',{type:'module'});
    worker.onmessage=event=>{
      if(event.data.progress) { report=event.data.progress; showResults(event.data.progress,'Checking '+event.data.progress.length+' of '+item.tests.length+'…'); return; }
      stopRun();
      if(event.data.error) { showResults([],event.data.error,true); return; }
      const {results,logs}=event.data; report=results;
      const passed=results.every(result=>result.ok);
      const changed=revision!==draftRevision;
      if(passed && !changed) { progress.passes[item.id]=item.version; save(); renderProgress(); }
      const summary=changed?'These results are for your previous draft. Run again to check your changes.':passed?(item.kind==='project'?'Draft coverage complete. This is not verification of a working implementation.':item.kind==='luau'?'Text-pattern checks passed. Verify execution in Roblox Studio.':item.kind==='quiz'?'Correct. Read the explanation, then continue.':item.mode==='independent'?'Independent challenge passed. You applied this skill to a new situation.':'All checks passed. Continue when you can explain your solution.'):'Not yet. Review the feedback, make one improvement, and try again.';
      showResults(results,summary,!passed||changed);
      $('consoleOutput').textContent=logs.length?logs.join('\n'):'No console output. The checks tested your return values and behavior directly.';
      $('lessonStatus').textContent=passed&&!changed?'✓ '+modeLabel(item)+' complete':completed(item)?'Previously completed. This attempt is practice.':'Keep going — each failed check gives you a specific next step.';
    };
    worker.onerror=()=>{stopRun();showResults([],'The code runner could not load. Open this course through the local HTTP server, then try again.',true);};
    timer=setTimeout(()=>{stopRun();showResults(report||[],'This run reached the 5-second limit. Check for an endless loop or an awaited operation that never finishes.',true);},5000);
    worker.postMessage({lessonId:item.id,input:item.kind==='quiz'?progress.answers[item.id]:item.kind==='project'?progress.projects[item.id]||{}:$('studioEditor').value});
  } catch(error) { stopRun(); showResults([],error.message,true); }
}
$('studioEditor').addEventListener('input',()=>{ draftRevision++;progress.drafts[lessons[active].id]=$('studioEditor').value;lines();save(); });
$('studioEditor').addEventListener('scroll',syncScroll);
$('studioEditor').addEventListener('keydown',event=>{if((event.ctrlKey||event.metaKey)&&event.key==='Enter'){event.preventDefault();run();}});
$('runTests').onclick=run;
$('learnTab').onclick=()=>selectTab('learn'); $('taskTab').onclick=()=>selectTab('task'); $('startTask').onclick=()=>{selectTab('task');if(coding(lessons[active]))$('studioEditor').focus();else $('activityPanel').querySelector('input,textarea')?.focus();};
for(const name of ['learn','task']) $(name+'Tab').addEventListener('keydown',event=>{if(['ArrowLeft','ArrowRight','Home','End'].includes(event.key)){event.preventDefault();const next=event.key==='Home'?'learn':event.key==='End'?'task':name==='learn'?'task':'learn';selectTab(next);$(next+'Tab').focus();}});
$('previousLesson').onclick=()=>navigate(active-1);
$('nextLesson').onclick=()=>active===lessons.length-1?openMenu():navigate(active+1);
$('syllabusToggle').onclick=()=>$('syllabus').hidden?openMenu():closeMenu();
$('closeSyllabus').onclick=()=>{closeMenu();$('syllabusToggle').focus();};
$('trackSelect').onchange=renderProgress;
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!$('syllabus').hidden){closeMenu();$('syllabusToggle').focus();}});
window.addEventListener('hashchange',()=>{let id;try{id=decodeURIComponent(location.hash.slice(1));}catch(error){return;}const index=lessons.findIndex(item=>item.id===id);if(index>=0&&index!==active)navigate(index);});
$('showSolution').onclick=()=>{
  const item=lessons[active]; if(item.mode==='independent')return;
  progress.assisted[item.id]=true; save();
  $('solutionCode').textContent=item.solution; $('solutionPanel').hidden=false; $('solutionPanel').open=true;
  $('lessonStatus').textContent='Reference opened for guided practice. Your code has not been replaced or marked complete.';
};
$('resetDraft').onclick=()=>{$('resetConfirm').hidden=false;};
$('cancelReset').onclick=()=>{$('resetConfirm').hidden=true;};
$('confirmReset').onclick=()=>{stopRun();draftRevision++;const item=lessons[active];if(coding(item)){$('studioEditor').value=item.starter;progress.drafts[item.id]=item.starter;lines();}else{delete progress.answers[item.id];delete progress.projects[item.id];renderActivity(item);}save();$('resetConfirm').hidden=true;};
const stack=document.createElement('div');stack.className='editor-stack';
$('studioEditor').before(stack);
const syntax=document.createElement('pre');syntax.id='syntaxCode';syntax.setAttribute('aria-hidden','true');stack.append(syntax,$('studioEditor'));
for(const track of tracks){const option=node('option',track.title);option.value=track.id;$('trackSelect').append(option);}
render();

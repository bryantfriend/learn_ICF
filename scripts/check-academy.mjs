import assert from 'node:assert/strict';
import fs from 'node:fs';
import {lessons,tracks} from '../academy-course.mjs';
import {assess} from '../academy-assessment.mjs';
import {loadProgress,saveProgress,progressKey} from '../academy-progress.mjs';
console.info=function(){};console.warn=function(){};
let failed=0;
for(const item of lessons){
  assert(fs.existsSync(decodeURIComponent(item.source.split('#')[0])),'Missing lesson resource: '+item.source);
  const input=item.kind==='quiz'?item.correct:item.kind==='project'?Object.fromEntries(item.projectChecks.map(c=>[c.field,c.keywords.join(' ')])):item.solution;
  const result=await assess(item,input);
  if(!result.results.every(r=>r.ok)){failed++;console.error(item.id,result.results.filter(r=>!r.ok));}
}
const data=new Map();const storage={getItem:key=>data.get(key)||null,setItem:(key,value)=>data.set(key,value)};
data.set('icf-builder-progress-v1',JSON.stringify({activeId:'stage-contract',passes:{'stage-contract':1},drafts:{'stage-contract':'builder draft'},assisted:{'stage-contract':true}}));
data.set('icf-beginner-js-course-progress-v2',JSON.stringify({completed:{'intent-envelope':true},codeByModule:{'intent-envelope':'existing draft'},projectDraft:{name:'Saved project'},stepCompletion:{'keep-me':true},lastOutputByModule:{'intent-envelope':'old output'}}));
data.set('icf-first-mission-v1',JSON.stringify({intent:true}));
let progress=loadProgress(storage);
assert.equal(progress.drafts['foundations-intent-envelope'],'existing draft');assert.equal(progress.passes['foundations-intent-envelope'],1);
assert.equal(progress.drafts['stage-contract'],'builder draft');assert.equal(progress.projects['foundations-project'].name,'Saved project');
assert.equal(progress.passes['orientation-intent'],1);assert.equal(progress.legacyArchives.foundations.stepCompletion['keep-me'],true);
saveProgress(storage,progress);progress.drafts['foundations-intent-envelope']='new draft';saveProgress(storage,progress);
assert.equal(loadProgress(storage).drafts['foundations-intent-envelope'],'new draft');assert.equal(JSON.parse(data.get('icf-beginner-js-course-progress-v2')).codeByModule['intent-envelope'],'existing draft');
data.set(progressKey,'broken');assert.equal(loadProgress(storage).drafts['stage-contract'],'builder draft');
assert.equal(new Set(lessons.map(item=>item.id)).size,lessons.length);
console.log(JSON.stringify({activities:lessons.length,sections:tracks.length,coding:lessons.filter(item=>['javascript','legacy-js','luau'].includes(item.kind)).length,failed,migration:'passed'}));
process.exitCode=failed?1:0;

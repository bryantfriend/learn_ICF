import {lessons as builder,skillNames} from './studio-course.mjs';
import {legacyTracks,questions,guide} from './academy-content.mjs';
import {adaptiveLessons} from './adaptive-course.mjs';
import {programmingTracks,programmingLessons} from './programming-course.mjs';
export {skillNames};
export const tracks=[
  {id:'orientation',title:'Orientation',description:'Learn what a request says, which facts it needs, and how the steps run.'},
  ...programmingTracks,
  {id:'foundations',title:'JavaScript Foundations',description:'Practice the JavaScript you will use in ICF.'},
  {id:'builder',title:'Build Every Stage',description:'Build the code for all six stages. Then try the challenges on your own.'},
  {id:'composition',title:'Composition',description:'Put steps together and decide what each one should return.'},
  {id:'advanced',title:'Advanced',description:'Learn what to do when requests overlap, fail, or need to run again.'},
  {id:'adaptive-context',title:'Adaptive Context',description:'See how clues change a lesson pick. Find what went wrong and save new scoring rules.'},
  {id:'roblox',title:'Roblox',description:'Use Luau and ICF to build game actions the Roblox server checks.'}
];
const orientation=questions.map((q,index)=>({id:'orientation-'+q[4],track:'orientation',unit:'ICF concepts',kind:'quiz',mode:'concept',version:1,title:q[0],summary:'Pick an answer and see why it works.',duration:'2–4 min',narrative:[guide.find(g=>g[0]===q[4])?.[2]||q[3]],example:'Intent Registration\n  ↓\nValidate → Normalize → AddContext → Authorize → Process → Emit',instructions:['Choose the answer that matches the current template.','Read the feedback. Retry if needed before moving on.'],hint:'Check what each step does and when it runs.',reflection:q[3],source:'reference.html#guide-'+q[4],file:'Concept '+(index+1),answers:q[1],correct:q[2],feedback:q[3],tests:[{name:'Concept understood'}],legacyConcept:q[4]}));
function convert(track){
  const modules=track.modules.map(m=>({id:track.id+'-'+m.id,track:track.id,unit:track.title,kind:track.id==='roblox'?'luau':'legacy-js',mode:'guided',version:1,title:m.title,summary:m.summary,duration:m.duration,narrative:m.narrative,example:m.exampleCode,instructions:[m.instructionPrompt,...m.instructions],hint:m.hint,reflection:(m.practice||m.why||[]).join(' '),source:'reference.html#reference',file:track.id==='roblox'?'challenge.lua':'challenge.js',starter:m.starterCode,solution:m.solutionCode,expectedLogs:m.expectedLogs,requiredPatterns:m.requiredPatterns,behaviorChecks:m.behaviorChecks||'',tests:track.id==='roblox'?m.requiredPatterns.map(p=>({name:'Include '+p.text})):[{name:'Expected output'},{name:'Lesson structure'},...(m.behaviorChecks?[{name:'Additional behavior'}]:[])],legacyId:m.id,legacyStorage:track.storageKey}));
  modules.push({id:track.id+'-project',track:track.id,unit:track.title,kind:'project',mode:'project',version:1,title:track.title+' project plan',summary:track.project.prompt,duration:'20–30 min',narrative:['Bring the lessons together in a feature plan. Your plan is saved as you write.', 'This review checks coverage using the original course rubric. It does not execute a finished implementation or demonstrate independent stage mastery. The Build Every Stage capstone provides a separate executable integration challenge.'],example:'Intent: name the action and its inputs.\nValidate / Normalize: define accepted input and cleanup.\nAddContext / Authorize: load facts and decide permission.\nProcess / Emit: change state and report the outcome.',instructions:['Describe your feature in the five fields.','Include the key responsibilities from this section.','Use the starter guide for implementation, and run the finished feature in its target environment.'],hint:'Be specific about trusted data, permission, failure before writes, and delivery after writes.',reflection:'Can someone else follow the entire action from this plan?',source:track.folder+'/capstone-starter/README.md',file:'Project plan',projectChecks:track.project.checks,tests:track.project.checks.map(c=>({name:c.label})),legacyStorage:track.storageKey});
  return modules;
}
export const lessons=[...orientation,...programmingLessons,...convert(legacyTracks[0]),...builder.map(item=>({...item,track:'builder',kind:'javascript'})),...legacyTracks.slice(1,3).flatMap(convert),...adaptiveLessons,...convert(legacyTracks[3])];
export const lessonById=new Map(lessons.map(item=>[item.id,item]));
export function passed(progress,item){return progress.passes[item.id]===item.version;}
export function progressSummary(progress){return tracks.map(track=>{const items=lessons.filter(item=>item.track===track.id);return {...track,total:items.length,passed:items.filter(item=>passed(progress,item)).length,firstId:items[0].id};});}

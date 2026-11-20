import {runExercise} from './studio-runtime.mjs';
function matches(code,p){return p.text!==undefined?code.includes(p.text):new RegExp(p.regex,p.flags).test(code);}
export async function assess(item,input,onResult){
  if(item.kind==='javascript')return runExercise(input,item.tests,onResult);
  if(item.kind==='quiz')return {results:[{name:'Concept understood',ok:input===item.correct,message:item.feedback}],logs:[]};
  if(item.kind==='project')return {results:item.projectChecks.map(c=>({name:c.label,ok:String(input?.[c.field]||'').trim().length>0&&c.keywords.some(word=>String(input[c.field]).toLowerCase().includes(word.toLowerCase())),message:'Draft coverage only; verify the implementation separately.'})),logs:[]};
  if(item.kind==='luau')return {results:item.requiredPatterns.map(p=>({name:'Include '+p.text,ok:matches(input,p),message:'Text-pattern check only. Execute and test this code in Roblox Studio.'})),logs:[]};
  const logs=[];const captured={log:function(){logs.push(Array.from(arguments).map(value=>typeof value==='object'&&value!==null?JSON.stringify(value):String(value)).join(' '));if(logs.length>200)throw new Error('Too much output. Check your loop.');}};
  let error=null;
  try{new Function('console','"use strict";\n'+input+'\n'+item.behaviorChecks)(captured);}catch(e){error=e;}
  const results=[{name:'Expected output',ok:!error&&JSON.stringify(logs)===JSON.stringify(item.expectedLogs),message:error?error.name+': '+error.message:'Expected: '+item.expectedLogs.join(' | ')},{name:'Lesson structure',ok:!error&&item.requiredPatterns.every(p=>matches(input,p)),message:'This imported exercise also checks its original helper names and code structure.'}];
  if(item.behaviorChecks)results.push({name:'Additional behavior',ok:!error,message:error?error.message:'Additional behavior passed.'});
  return {results,logs};
}

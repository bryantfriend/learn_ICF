import { lessons,skillNames } from '../studio-course.mjs';
import { runExercise } from '../studio-runtime.mjs';
let failures=0;
console.info = function() {};
console.warn = function() {};
for(const lesson of lessons) {
  const result=await runExercise(lesson.solution,lesson.tests);
  const errors=result.results.filter(test=>!test.ok);
  if(errors.length){failures++;console.error(lesson.id,errors);}
  // An empty implementation must not pass; logged expected strings are not sufficient.
  const blank=await runExercise('console.log("ok");',lesson.tests);
  if(blank.results.every(test=>test.ok)){failures++;console.error('Empty code accepted:',lesson.id);}
}
for(const name of skillNames) {
  const group=lessons.filter(item=>item.skill===name);
  if(group.length!==3 || group.filter(item=>item.mode==='independent').length!==1){failures++;console.error('Incomplete skill path:',name);}
}
console.log(JSON.stringify({lessons:lessons.length,checks:lessons.reduce((n,item)=>n+item.tests.length,0),independentChallenges:lessons.filter(item=>item.mode==='independent').length,failures}));
process.exitCode=failures?1:0;

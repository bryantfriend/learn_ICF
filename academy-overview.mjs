import {lessons,tracks,progressSummary,skillNames,passed} from './academy-course.mjs';
import {loadProgress,saveProgress} from './academy-progress.mjs';
const storage={getItem:key=>localStorage.getItem(key),setItem:(key,value)=>localStorage.setItem(key,value)};
let progress;
function refresh(){
  progress=loadProgress(storage);try{saveProgress(storage,progress);}catch(error){document.getElementById('overviewNotice').textContent='Storage is unavailable. You can still learn; export progress before leaving.';}
  const active=lessons.find(item=>item.id===progress.activeId)||lessons[0];
  document.getElementById('resumeLink').href='studio.html#'+active.id;
  document.getElementById('resumeTitle').textContent=active.title;
  const count=lessons.filter(item=>passed(progress,item)).length;
  document.getElementById('totalProgress').textContent=count+' / '+lessons.length+' activities complete';
  document.getElementById('overviewProgress').value=count;document.getElementById('overviewProgress').max=lessons.length;
  const container=document.getElementById('courseSections');container.replaceChildren();
  for(const [index,track] of progressSummary(progress).entries()){
    const link=document.createElement('a');link.href='studio.html#'+track.firstId;link.className='section-card';
    const number=document.createElement('span');number.className='eyebrow';number.textContent='SECTION '+String(index+1).padStart(2,'0');
    const title=document.createElement('h2');title.textContent=track.title;
    const description=document.createElement('p');description.textContent=track.description;
    const count=document.createElement('strong');count.textContent=track.passed+' / '+track.total+' complete →';link.append(number,title,description,count);container.append(link);
  }
  document.getElementById('overviewSkills').replaceChildren();
  for(const name of skillNames){const group=lessons.filter(item=>item.skill===name);const done=group.filter(item=>passed(progress,item)).length;const span=document.createElement('span');span.textContent=name+' · '+done+'/3';if(done===3)span.className='earned';document.getElementById('overviewSkills').append(span);}
}
document.getElementById('exportProgress').onclick=()=>{
  const blob=new Blob([JSON.stringify({schema:'icf-academy-v2',exportedAt:new Date().toISOString(),progress,sections:progressSummary(progress)},null,2)],{type:'application/json'});
  const url=URL.createObjectURL(blob);const link=document.createElement('a');link.href=url;link.download='icf-academy-progress.json';link.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
  document.getElementById('overviewNotice').textContent='Export includes lesson progress, code drafts, project plans, and archived earlier-course notes.';
};
window.addEventListener('storage',refresh);refresh();

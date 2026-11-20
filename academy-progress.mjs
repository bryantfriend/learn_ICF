import {lessons,lessonById} from './academy-course.mjs';
import {legacyTracks} from './academy-content.mjs';
export const progressKey='icf-academy-progress-v2';
function read(storage,key){try{const data=JSON.parse(storage.getItem(key)||'null');return data&&typeof data==='object'&&!Array.isArray(data)?data:null;}catch(error){return null;}}
function map(value){return value&&typeof value==='object'&&!Array.isArray(value)?value:{};}
export function loadProgress(storage){
  const saved=read(storage,progressKey);
  const result={activeId:lessons[0].id,drafts:{},passes:{},assisted:{},projects:{},answers:{},imported:{},legacyArchives:{}};
  if(saved){for(const key of ['drafts','passes','assisted','projects','answers','imported','legacyArchives'])result[key]=map(saved[key]);if(lessonById.has(saved.activeId))result.activeId=saved.activeId;return result;}
  const builder=read(storage,'icf-builder-progress-v1');
  if(builder){for(const key of ['drafts','passes','assisted'])for(const [id,value] of Object.entries(map(builder[key])))if(lessonById.has(id))result[key][id]=value;if(lessonById.has(builder.activeId))result.activeId=builder.activeId;result.legacyArchives.builder=builder;}
  for(const track of legacyTracks){
    const old=read(storage,track.storageKey);if(!old)continue;result.legacyArchives[track.id]=old;
    for(const item of lessons.filter(item=>item.track===track.id&&item.legacyId)){
      if(typeof old.codeByModule?.[item.legacyId]==='string')result.drafts[item.id]=old.codeByModule[item.legacyId];
      if(old.completed?.[item.legacyId]===true){result.passes[item.id]=item.version;result.imported[item.id]=true;}
    }
    result.projects[track.id+'-project']=map(old.projectDraft);
    if(old.projectComplete===true){result.passes[track.id+'-project']=1;result.imported[track.id+'-project']=true;}
  }
  const concepts=read(storage,'icf-first-mission-v1');
  if(concepts){result.legacyArchives.orientation=concepts;for(const item of lessons.filter(item=>item.kind==='quiz'))if(concepts[item.legacyConcept]===true){result.passes[item.id]=item.version;result.answers[item.id]=item.correct;result.imported[item.id]=true;}}
  return result;
}
export function saveProgress(storage,progress){storage.setItem(progressKey,JSON.stringify(progress));}

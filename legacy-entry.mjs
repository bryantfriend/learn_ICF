import {legacyTracks} from './academy-content.mjs';
const track=legacyTracks.find(item=>item.id===document.body.dataset.track);
let index=0;
try{const saved=JSON.parse(localStorage.getItem(track.storageKey)||'{}');if(Number.isInteger(saved.activeIndex))index=Math.max(0,Math.min(track.modules.length-1,saved.activeIndex));}catch(error){}
location.replace('../studio.html#'+track.id+'-'+track.modules[index].id);

import { lessons } from './academy-course.mjs';
import { assess } from './academy-assessment.mjs';
self.onmessage = async function(event) {
  var lesson = lessons.find(function(item) { return item.id === event.data.lessonId; });
  if (!lesson) { self.postMessage({ error:'Lesson not found.' }); return; }
  var result = await assess(lesson,event.data.input,function(results) { self.postMessage({progress:results}); });
  self.postMessage(result);
};

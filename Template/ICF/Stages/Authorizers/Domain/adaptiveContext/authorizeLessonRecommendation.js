function authorizeLessonRecommendation(intent) {
  var learner = intent.context.learner;
  if (!learner || learner.id !== intent.actor.id || learner.canRecommend !== true) {
    return { ok: false, errors: ["Lesson recommendation permission required."] };
  }
  return { ok: true, intent: intent };
}
export { authorizeLessonRecommendation };

function processLessonRecommendation(intent) {
  var selected = intent.context.adaptiveContext.selected;
  if (!selected.length) { return { ok: false, errors: ["A lesson recommendation needs selected evidence."] }; }
  var winner = selected[0];
  if (!winner.candidate.value || typeof winner.candidate.value.lessonId !== "string") {
    return { ok: false, errors: ["Selected evidence must identify a lesson."] };
  }
  // Explicit decision rule: recommend the lesson attached to the highest-ranked evidence.
  intent.context.resultData = {
    lessonId: winner.candidate.value.lessonId, evidenceId: winner.id, score: winner.score,
    policyVersion: intent.context.adaptiveContext.policyVersion
  };
  return { ok: true, intent: intent };
}
export { processLessonRecommendation };

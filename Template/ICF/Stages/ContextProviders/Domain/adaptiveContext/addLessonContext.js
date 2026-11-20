function createLessonContextProvider(services) {
  async function addLessonContext(intent) {
    var identity = await services.loadIdentity(intent.actor);
    if (!identity || identity.id !== intent.actor.id || !identity.scope) {
      return { ok: false, errors: ["Verified learner identity required."] };
    }
    intent.context.learner = identity;
    return { ok: true, intent: intent };
  }
  return addLessonContext;
}
export { createLessonContextProvider };

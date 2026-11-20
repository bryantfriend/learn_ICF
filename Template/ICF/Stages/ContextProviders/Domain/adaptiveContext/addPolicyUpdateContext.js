function createPolicyUpdateContextProvider(services) {
  async function addPolicyUpdateContext(intent) {
    var current = await services.policyStore.read();
    var identity = await services.loadIdentity(intent.actor);
    intent.context.policyUpdate = {
      current: current, identity: identity, evaluatedAt: services.now()
    };
    return { ok: true, intent: intent };
  }
  return addPolicyUpdateContext;
}
export { createPolicyUpdateContextProvider };

function createPolicyUpdateProcessor(policyStore) {
  async function processPolicyUpdate(intent) {
    var result = await policyStore.publish(intent.payload.expectedVersion, intent.payload.policy, {
      actorId: intent.context.policyUpdate.identity.id,
      reason: intent.payload.reason, createdAt: intent.context.policyUpdate.evaluatedAt
    });
    if (!result.ok) { return result; }
    intent.context.resultData = { policyId: result.policy.id, policyVersion: result.policy.version };
    return { ok: true, intent: intent };
  }
  return processPolicyUpdate;
}
export { createPolicyUpdateProcessor };

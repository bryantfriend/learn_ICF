function authorizePolicyUpdate(intent) {
  var context = intent.context.policyUpdate;
  var identity = context.identity;
  var proposed = intent.payload.policy;
  // Permission comes from the trusted identity loader, never actor.role or a context score.
  if (!identity || identity.id !== intent.actor.id || identity.canUpdateContextPolicy !== true || identity.scope !== context.current.scope) {
    return { ok: false, errors: ["Context policy update permission required."] };
  }
  if (proposed.id !== context.current.id || proposed.scope !== context.current.scope || proposed.intentType !== context.current.intentType) {
    return { ok: false, errors: ["Policy target does not match the authorized scope."] };
  }
  return { ok: true, intent: intent };
}
export { authorizePolicyUpdate };

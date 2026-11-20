function normalizePolicyUpdate(intent) {
  intent.payload = structuredClone(intent.payload);
  intent.payload.reason = intent.payload.reason.trim();
  return { ok: true, intent: intent };
}
export { normalizePolicyUpdate };

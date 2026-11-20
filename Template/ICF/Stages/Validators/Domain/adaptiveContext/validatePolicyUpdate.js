import { validateContextPolicy } from "../../../../engine/adaptiveContext.js";

function validatePolicyUpdate(intent) {
  try {
    var payload = intent.payload;
    if (!Number.isSafeInteger(payload.expectedVersion) || payload.expectedVersion < 1) { throw new Error("Expected version is required."); }
    if (typeof payload.reason !== "string" || !payload.reason.trim()) { throw new Error("An update reason is required."); }
    validateContextPolicy(payload.policy);
    return { ok: true, intent: intent };
  } catch (error) { return { ok: false, errors: [error.message] }; }
}
export { validatePolicyUpdate };

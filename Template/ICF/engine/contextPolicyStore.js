import { validateContextPolicy } from "./adaptiveContext.js";

function copyPolicy(value) { return structuredClone(value); }

// Single-process reference adapter. Replace with transactional durable storage in production.
// Mutating methods are called by the policy-update Process stage, not request handlers.
function createMemoryContextPolicyStore(initialPolicy) {
  validateContextPolicy(initialPolicy);
  var current = copyPolicy(initialPolicy);
  var history = [copyPolicy(initialPolicy)];
  return {
    read: async function read() { return copyPolicy(current); },
    history: async function readHistory() { return copyPolicy(history); },
    publish: async function publish(expectedVersion, proposedPolicy, audit) {
      if (expectedVersion !== current.version) { return { ok: false, errors: ["Policy version conflict."] }; }
      validateContextPolicy(proposedPolicy);
      if (proposedPolicy.id !== current.id || proposedPolicy.scope !== current.scope || proposedPolicy.intentType !== current.intentType) {
        return { ok: false, errors: ["Policy identity, scope, and target intent cannot change."] };
      }
      var next = copyPolicy(proposedPolicy);
      next.version = current.version + 1;
      validateContextPolicy(next);
      next.audit = copyPolicy(audit);
      // No await between comparison and assignment: atomic within this in-memory adapter.
      current = next;
      history.push(copyPolicy(next));
      return { ok: true, policy: copyPolicy(next) };
    }
  };
}

export { createMemoryContextPolicyStore };

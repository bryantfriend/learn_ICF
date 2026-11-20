const createIntent = require("../../core/createIntent");
const validators = require("../../core/validators");
const normalizeDeposit = require("./normalizeDeposit");
const buildDepositContext = require("./buildDepositContext");
const authorizeDeposit = require("./authorizeDeposit");
const processDeposit = require("./processDeposit");
const finalizeDeposit = require("./finalizeDeposit");

function validatePayload(payload) {
  return Object.keys(validators).every(function (field) {
    return validators[field].every(function (validator) {
      return validator(payload[field]);
    });
  });
}

function runDepositFeature(state, payload, actorId) {
  const intent = createIntent("account/deposit", payload, actorId);
  const normalizedPayload = normalizeDeposit(intent.payload);
  const normalizedIntent = {
    ...intent,
    payload: normalizedPayload
  };

  if (!validatePayload(normalizedPayload)) {
    return {
      ok: false,
      reason: "validation_failed"
    };
  }

  const context = buildDepositContext(state, normalizedIntent);

  if (!authorizeDeposit(context)) {
    return {
      ok: false,
      reason: "not_authorized"
    };
  }

  const nextState = processDeposit(state, normalizedIntent);
  const finalizedState = finalizeDeposit(nextState, normalizedIntent);

  return {
    ok: true,
    nextState: finalizedState
  };
}

module.exports = runDepositFeature;

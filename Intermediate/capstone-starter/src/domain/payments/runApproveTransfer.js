const composeValidators = require("../../core/composeValidators");
const resultEnvelope = require("../../core/resultEnvelope");
const hasPositiveAmount = require("./validators/hasPositiveAmount");
const hasTargetAccount = require("./validators/hasTargetAccount");
const normalizeTransferPayload = require("./normalizers/normalizeTransferPayload");
const buildTransferContext = require("./buildTransferContext");
const authorizeTransfer = require("./authorizeTransfer");
const processTransfer = require("./processTransfer");
const finalizeTransfer = require("./finalizeTransfer");

const amountIsValid = composeValidators([hasPositiveAmount]);
const targetAccountIsValid = composeValidators([hasTargetAccount]);

function runApproveTransfer(state, payload) {
  const normalizedPayload = normalizeTransferPayload(payload);

  if (!amountIsValid(normalizedPayload.amount) || !targetAccountIsValid(normalizedPayload.targetAccountId)) {
    return resultEnvelope(false, {
      reason: "validation_failed"
    });
  }

  const intent = {
    type: "payments/approveTransfer",
    payload: normalizedPayload
  };
  const context = buildTransferContext(state, intent);

  if (!authorizeTransfer(context, normalizedPayload)) {
    return resultEnvelope(false, {
      reason: "not_authorized"
    });
  }

  const nextState = processTransfer(state, normalizedPayload);
  return resultEnvelope(true, {
    nextState: finalizeTransfer(nextState, normalizedPayload)
  });
}

module.exports = runApproveTransfer;

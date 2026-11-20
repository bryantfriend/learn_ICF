function finalizeTransfer(state, payload) {
  return {
    ...state,
    audit: state.audit.concat({
      type: "payments/approveTransfer",
      targetAccountId: payload.targetAccountId
    })
  };
}

module.exports = finalizeTransfer;

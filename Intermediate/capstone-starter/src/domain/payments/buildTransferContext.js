function buildTransferContext(state, intent) {
  return {
    actorRole: state.session.role,
    currentBalance: state.wallet.balance,
    targetAccountId: intent.payload.targetAccountId
  };
}

module.exports = buildTransferContext;

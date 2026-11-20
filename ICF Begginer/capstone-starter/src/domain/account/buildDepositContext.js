function buildDepositContext(state, intent) {
  return {
    actorId: intent.actorId,
    currentView: state.ui.currentView,
    accountBalance: state.account.balance
  };
}

module.exports = buildDepositContext;

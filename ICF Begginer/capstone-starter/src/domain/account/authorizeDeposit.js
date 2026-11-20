function authorizeDeposit(context) {
  return context.currentView === "account" && context.accountBalance >= 0;
}

module.exports = authorizeDeposit;

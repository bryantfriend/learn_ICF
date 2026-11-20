function processDeposit(state, intent) {
  return {
    ...state,
    account: {
      ...state.account,
      balance: state.account.balance + intent.payload.amount
    }
  };
}

module.exports = processDeposit;

function processTransfer(state, payload) {
  return {
    ...state,
    wallet: {
      ...state.wallet,
      balance: state.wallet.balance - payload.amount
    },
    approvals: state.approvals.concat({
      targetAccountId: payload.targetAccountId,
      amount: payload.amount
    })
  };
}

module.exports = processTransfer;

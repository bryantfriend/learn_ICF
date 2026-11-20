function authorizeTransfer(context, payload) {
  return context.actorRole === "manager" && context.currentBalance >= payload.amount;
}

module.exports = authorizeTransfer;

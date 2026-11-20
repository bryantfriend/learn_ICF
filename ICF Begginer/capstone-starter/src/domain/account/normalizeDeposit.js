function normalizeDeposit(payload) {
  return {
    displayName: String(payload.displayName || "").trim(),
    amount: Number(payload.amount)
  };
}

module.exports = normalizeDeposit;

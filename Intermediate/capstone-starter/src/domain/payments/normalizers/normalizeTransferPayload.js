function normalizeTransferPayload(payload) {
  return {
    amount: Number(payload.amount),
    targetAccountId: String(payload.targetAccountId || "").trim(),
    note: String(payload.note || "").trim()
  };
}

module.exports = normalizeTransferPayload;

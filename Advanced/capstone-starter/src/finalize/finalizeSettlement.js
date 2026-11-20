function finalizeSettlement(result) {
  return {
    ...result,
    finalized: true
  };
}

module.exports = finalizeSettlement;

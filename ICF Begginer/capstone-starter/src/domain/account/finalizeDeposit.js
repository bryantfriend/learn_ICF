function finalizeDeposit(state, intent) {
  return {
    ...state,
    audit: state.audit.concat({
      type: intent.type,
      actorId: intent.actorId
    })
  };
}

module.exports = finalizeDeposit;

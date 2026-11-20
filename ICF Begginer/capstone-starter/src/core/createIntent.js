function createIntent(type, payload, actorId) {
  return {
    type,
    payload,
    actorId,
    createdAt: Date.now()
  };
}

module.exports = createIntent;

function buildAuditRecord(workflowName, outcome) {
  return {
    workflowName,
    outcome,
    recordedAt: Date.now()
  };
}

module.exports = buildAuditRecord;

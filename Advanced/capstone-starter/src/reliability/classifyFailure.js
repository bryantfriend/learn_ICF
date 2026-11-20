function classifyFailure(error) {
  if (error && error.code === "TIMEOUT") {
    return {
      level: "retryable",
      escalationRoute: "auto-retry"
    };
  }

  return {
    level: "manual-review",
    escalationRoute: "operations"
  };
}

module.exports = classifyFailure;

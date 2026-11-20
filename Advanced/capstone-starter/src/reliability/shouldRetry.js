function shouldRetry(failure) {
  return failure.level === "retryable";
}

module.exports = shouldRetry;

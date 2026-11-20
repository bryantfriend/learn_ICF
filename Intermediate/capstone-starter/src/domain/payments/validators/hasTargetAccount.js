function hasTargetAccount(value) {
  return typeof value === "string" && value.trim().length >= 5;
}

module.exports = hasTargetAccount;

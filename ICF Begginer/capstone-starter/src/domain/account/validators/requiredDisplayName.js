function requiredDisplayName(value) {
  return typeof value === "string" && value.trim().length >= 3;
}

module.exports = requiredDisplayName;

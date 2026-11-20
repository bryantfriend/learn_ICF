const requiredDisplayName = require("../domain/account/validators/requiredDisplayName");
const minimumDepositAmount = require("../domain/account/validators/minimumDepositAmount");

module.exports = {
  displayName: [
    requiredDisplayName
  ],
  amount: [
    minimumDepositAmount
  ]
};

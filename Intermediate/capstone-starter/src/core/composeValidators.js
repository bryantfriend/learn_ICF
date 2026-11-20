function composeValidators(validators) {
  return function runValidators(value) {
    return validators.every(function (validator) {
      return validator(value);
    });
  };
}

module.exports = composeValidators;

// ICF/Stages/Processors/Core/addContextToResultData.js

import resultHelpers from "../../../engine/resultHelpers.js";

/**
 * Adds intent.context into intent.context.resultData.
 *
 * This is mainly useful for:
 * - testing
 * - debugging
 * - confirming AddContext behavior
 *
 * @param {Object} intent - Current Intent.
 * @returns {Object} Process result.
 */
function addContextToResultData(intent) {
  if (!intent) {
    return resultHelpers.processFailure("Intent is required.");
  }

  if (!intent.context) {
    return resultHelpers.processFailure("Intent context is required.");
  }

  // Capture the current fields before publishing the result. A live reference
  // would point back into resultData and make even a simple fixture circular.
  var contextFields = { ...intent.context };
  delete contextFields.resultData;
  var resultData = { context: contextFields };

  var updatedIntent = resultHelpers.addResultDataToIntent(intent, resultData);

  return resultHelpers.success(updatedIntent);
}

export default {
  addContextToResultData: addContextToResultData
};

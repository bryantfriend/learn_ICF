// ICF/Stages/Processors/Core/setDemoResult.js

import resultHelpers from "../../../engine/resultHelpers.js";

/**
 * Marks the demo intent as successfully processed.
 *
 * @param {Object} intent - Current intent.
 * @returns {Object} Process result.
 */
function setDemoResult(intent) {
  if (!intent) {
    return resultHelpers.processFailure("Intent is required.");
  }

  var resultData = resultHelpers.getResultData(intent);
  var updatedResultData = copyObject(resultData);

  updatedResultData.demoProcessed = true;

  var updatedIntent = resultHelpers.addResultDataToIntent(intent, updatedResultData);

  return resultHelpers.success(updatedIntent);
}

function copyObject(sourceObject) {
  var copiedObject = {};

  if (!sourceObject) {
    return copiedObject;
  }

  var keys = Object.keys(sourceObject);
  var keyIndex = 0;

  while (keyIndex < keys.length) {
    var key = keys[keyIndex];
    copiedObject[key] = sourceObject[key];

    keyIndex = keyIndex + 1;
  }

  return copiedObject;
}

export default {
  setDemoResult: setDemoResult
};

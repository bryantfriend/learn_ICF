// Generated from the template by scripts/build-wiki-api.mjs.
export const apiGroups = [
  {
    "id": "validate",
    "title": "Validate helpers",
    "stage": "Validate",
    "entries": [
      {
        "id": "validate-validatePolicyUpdate",
        "key": "validatePolicyUpdate",
        "description": "Check a request to change the scoring rules before the app reads or saves the rules.",
        "kind": "Stage step",
        "signature": "validators.validatePolicyUpdate(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  validatePolicyUpdate: validators.validatePolicyUpdate\n}",
        "source": "Template/ICF/Stages/Validators/Domain/adaptiveContext/validatePolicyUpdate.js",
        "params": []
      },
      {
        "id": "validate-passValidation",
        "key": "passValidation",
        "description": "Let the request through Validate as it is.",
        "kind": "Stage step",
        "signature": "validators.passValidation(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  passValidation: validators.passValidation\n}",
        "source": "Template/ICF/Stages/Validators/Core/passValidation.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "validate-passValidate",
        "key": "passValidate",
        "description": "Let the request through Validate as it is.",
        "kind": "Stage object",
        "signature": "validators.passValidate",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  passValidate: validators.passValidate\n}",
        "source": "Template/ICF/Stages/Validators/Core/passValidate.js",
        "params": []
      },
      {
        "id": "validate-requireIntentType",
        "key": "requireIntentType",
        "description": "Check that the request has a valid action name.",
        "kind": "Stage step",
        "signature": "validators.requireIntentType(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  requireIntentType: validators.requireIntentType\n}",
        "source": "Template/ICF/Stages/Validators/Core/requireIntentType.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Validation result."
        ]
      },
      {
        "id": "validate-requireActor",
        "key": "requireActor",
        "description": "Check that the request says who asked.",
        "kind": "Stage step",
        "signature": "validators.requireActor(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  requireActor: validators.requireActor\n}",
        "source": "Template/ICF/Stages/Validators/Core/requireActor.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Validation result."
        ]
      },
      {
        "id": "validate-requirePayload",
        "key": "requirePayload",
        "description": "Check that the request has an object for the inputs.",
        "kind": "Stage step",
        "signature": "validators.requirePayload(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  requirePayload: validators.requirePayload\n}",
        "source": "Template/ICF/Stages/Validators/Core/requirePayload.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Validation result."
        ]
      },
      {
        "id": "validate-requireContext",
        "key": "requireContext",
        "description": "Check that the request has an object for facts and results.",
        "kind": "Stage step",
        "signature": "validators.requireContext(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  requireContext: validators.requireContext\n}",
        "source": "Template/ICF/Stages/Validators/Core/requireContext.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Validation result."
        ]
      },
      {
        "id": "validate-requireBaseIntentShape",
        "key": "requireBaseIntentShape",
        "description": "Check that the request has the basic parts ICF needs.",
        "kind": "Stage step",
        "signature": "validators.requireBaseIntentShape(intent)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  requireBaseIntentShape: validators.requireBaseIntentShape\n}",
        "source": "Template/ICF/Stages/Validators/Core/requireBaseIntentShape.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Validation result."
        ]
      },
      {
        "id": "validate-exampleRequireStoreId",
        "key": "exampleRequireStoreId",
        "description": "Stop the request if it has no store ID.",
        "kind": "Stage object",
        "signature": "validators.exampleRequireStoreId",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "Validate: {\n  exampleRequireStoreId: validators.exampleRequireStoreId\n}",
        "source": "Template/ICF/Stages/Validators/Core/exampleRequireStoreId.js",
        "params": []
      },
      {
        "id": "validate-createRequireActorRoleValidator",
        "key": "createRequireActorRoleValidator",
        "description": "Make a check that accepts only the roles you list in the actor field.",
        "kind": "Configured helper",
        "signature": "validators.createRequireActorRoleValidator(allowedRoles)",
        "importLine": "import validators from \"./Template/ICF/Stages/Validators/validators.js\";",
        "usage": "validators.createRequireActorRoleValidator(allowedRoles)",
        "source": "Template/ICF/Stages/Validators/Core/requireActorRole.js",
        "params": [
          "@param {Array} allowedRoles - Allowed actor roles.",
          "@returns {Function} Validator function."
        ]
      }
    ]
  },
  {
    "id": "normalize",
    "title": "Normalize helpers",
    "stage": "Normalize",
    "entries": [
      {
        "id": "normalize-normalizePolicyUpdate",
        "key": "normalizePolicyUpdate",
        "description": "Put the new scoring rules into a standard format for later checks.",
        "kind": "Stage step",
        "signature": "normalizers.normalizePolicyUpdate(intent)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "Normalize: {\n  normalizePolicyUpdate: normalizers.normalizePolicyUpdate\n}",
        "source": "Template/ICF/Stages/Normalizers/Domain/adaptiveContext/normalizePolicyUpdate.js",
        "params": []
      },
      {
        "id": "normalize-passNormalization",
        "key": "passNormalization",
        "description": "Let the request through Normalize as it is.",
        "kind": "Stage step",
        "signature": "normalizers.passNormalization(intent)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "Normalize: {\n  passNormalization: normalizers.passNormalization\n}",
        "source": "Template/ICF/Stages/Normalizers/Core/passNormalization.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "normalize-passNormalize",
        "key": "passNormalize",
        "description": "Let the request through Normalize as it is.",
        "kind": "Stage object",
        "signature": "normalizers.passNormalize",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "Normalize: {\n  passNormalize: normalizers.passNormalize\n}",
        "source": "Template/ICF/Stages/Normalizers/Core/passNormalize.js",
        "params": []
      },
      {
        "id": "normalize-exampleTrimProductName",
        "key": "exampleTrimProductName",
        "description": "Remove spaces from the start and end of the product name.",
        "kind": "Stage object",
        "signature": "normalizers.exampleTrimProductName",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "Normalize: {\n  exampleTrimProductName: normalizers.exampleTrimProductName\n}",
        "source": "Template/ICF/Stages/Normalizers/Core/exampleTrimProductName.js",
        "params": []
      },
      {
        "id": "normalize-createTrimPayloadStringFieldNormalizer",
        "key": "createTrimPayloadStringFieldNormalizer",
        "description": "Make a step that trims spaces from a text field you choose.",
        "kind": "Configured helper",
        "signature": "normalizers.createTrimPayloadStringFieldNormalizer(fieldName)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "normalizers.createTrimPayloadStringFieldNormalizer(fieldName)",
        "source": "Template/ICF/Stages/Normalizers/Core/trimPayloadStringField.js",
        "params": [
          "@param {string} fieldName - Payload field name.",
          "@returns {Function} Normalizer function."
        ]
      },
      {
        "id": "normalize-createNormalizePayloadNumberFieldNormalizer",
        "key": "createNormalizePayloadNumberFieldNormalizer",
        "description": "Make a step that turns a field you choose into a number.",
        "kind": "Configured helper",
        "signature": "normalizers.createNormalizePayloadNumberFieldNormalizer(fieldName)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "normalizers.createNormalizePayloadNumberFieldNormalizer(fieldName)",
        "source": "Template/ICF/Stages/Normalizers/Core/normalizePayloadNumberField.js",
        "params": [
          "@param {string} fieldName - Payload field name.",
          "@returns {Function} Normalizer function."
        ]
      },
      {
        "id": "normalize-createNormalizePayloadBooleanFieldNormalizer",
        "key": "createNormalizePayloadBooleanFieldNormalizer",
        "description": "Make a step that reads values such as yes and no as true or false.",
        "kind": "Configured helper",
        "signature": "normalizers.createNormalizePayloadBooleanFieldNormalizer(fieldName)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "normalizers.createNormalizePayloadBooleanFieldNormalizer(fieldName)",
        "source": "Template/ICF/Stages/Normalizers/Core/normalizePayloadBooleanField.js",
        "params": [
          "@param {string} fieldName - Payload field name.",
          "@returns {Function} Normalizer function."
        ]
      },
      {
        "id": "normalize-createNormalizePayloadDateFieldNormalizer",
        "key": "createNormalizePayloadDateFieldNormalizer",
        "description": "Make a step that writes a date in the standard ISO format.",
        "kind": "Configured helper",
        "signature": "normalizers.createNormalizePayloadDateFieldNormalizer(fieldName)",
        "importLine": "import normalizers from \"./Template/ICF/Stages/Normalizers/normalizers.js\";",
        "usage": "normalizers.createNormalizePayloadDateFieldNormalizer(fieldName)",
        "source": "Template/ICF/Stages/Normalizers/Core/normalizePayloadDateField.js",
        "params": [
          "@param {string} fieldName - Payload field name.",
          "@returns {Function} Normalizer function."
        ]
      }
    ]
  },
  {
    "id": "add-context",
    "title": "AddContext helpers",
    "stage": "AddContext",
    "entries": [
      {
        "id": "add-context-createAdaptiveContextProvider",
        "key": "createAdaptiveContextProvider",
        "description": "Read the current rules and clues. Use them to score choices that can be picked.",
        "kind": "Configured helper",
        "signature": "contextProviders.createAdaptiveContextProvider(loadSnapshot)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "contextProviders.createAdaptiveContextProvider(loadSnapshot)",
        "source": "Template/ICF/Stages/ContextProviders/Core/addAdaptiveContext.js",
        "params": []
      },
      {
        "id": "add-context-createLessonContextProvider",
        "key": "createLessonContextProvider",
        "description": "Look up the learner and add their checked record to the request.",
        "kind": "Configured helper",
        "signature": "contextProviders.createLessonContextProvider(services)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "contextProviders.createLessonContextProvider(services)",
        "source": "Template/ICF/Stages/ContextProviders/Domain/adaptiveContext/addLessonContext.js",
        "params": []
      },
      {
        "id": "add-context-createPolicyUpdateContextProvider",
        "key": "createPolicyUpdateContextProvider",
        "description": "Look up who asked for the change and which rules are live.",
        "kind": "Configured helper",
        "signature": "contextProviders.createPolicyUpdateContextProvider(services)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "contextProviders.createPolicyUpdateContextProvider(services)",
        "source": "Template/ICF/Stages/ContextProviders/Domain/adaptiveContext/addPolicyUpdateContext.js",
        "params": []
      },
      {
        "id": "add-context-passContext",
        "key": "passContext",
        "description": "Let the request through AddContext as it is.",
        "kind": "Stage step",
        "signature": "contextProviders.passContext(intent)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "AddContext: {\n  passContext: contextProviders.passContext\n}",
        "source": "Template/ICF/Stages/ContextProviders/Core/passContext.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "add-context-passAddContext",
        "key": "passAddContext",
        "description": "Let the request through AddContext as it is.",
        "kind": "Stage object",
        "signature": "contextProviders.passAddContext",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "AddContext: {\n  passAddContext: contextProviders.passAddContext\n}",
        "source": "Template/ICF/Stages/ContextProviders/Core/passAddContext.js",
        "params": []
      },
      {
        "id": "add-context-addTimestampContext",
        "key": "addTimestampContext",
        "description": "Add the current time to the request’s context.",
        "kind": "Stage step",
        "signature": "contextProviders.addTimestampContext(intent)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "AddContext: {\n  addTimestampContext: contextProviders.addTimestampContext\n}",
        "source": "Template/ICF/Stages/ContextProviders/Core/addTimestampContext.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Context result."
        ]
      },
      {
        "id": "add-context-addSourceContext",
        "key": "addSourceContext",
        "description": "Copy where the request came from into context.",
        "kind": "Stage step",
        "signature": "contextProviders.addSourceContext(intent)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "AddContext: {\n  addSourceContext: contextProviders.addSourceContext\n}",
        "source": "Template/ICF/Stages/ContextProviders/Core/addSourceContext.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Context result."
        ]
      },
      {
        "id": "add-context-addActorRoleContext",
        "key": "addActorRoleContext",
        "description": "Copy the role from actor.role into context. This does not check the role.",
        "kind": "Stage step",
        "signature": "contextProviders.addActorRoleContext(intent)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "AddContext: {\n  addActorRoleContext: contextProviders.addActorRoleContext\n}",
        "source": "Template/ICF/Stages/ContextProviders/Core/addActorRoleContext.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Context result."
        ]
      },
      {
        "id": "add-context-createAddStaticContextValueProvider",
        "key": "createAddStaticContextValueProvider",
        "description": "Make a step that adds a fixed value to context.",
        "kind": "Configured helper",
        "signature": "contextProviders.createAddStaticContextValueProvider(contextKey, contextValue)",
        "importLine": "import contextProviders from \"./Template/ICF/Stages/ContextProviders/contextProviders.js\";",
        "usage": "contextProviders.createAddStaticContextValueProvider(contextKey, contextValue)",
        "source": "Template/ICF/Stages/ContextProviders/Core/addStaticContextValue.js",
        "params": [
          "@param {string} contextKey - Context key.",
          "@param {*} contextValue - Context value.",
          "@returns {Function} Context provider function."
        ]
      }
    ]
  },
  {
    "id": "authorize",
    "title": "Authorize helpers",
    "stage": "Authorize",
    "entries": [
      {
        "id": "authorize-authorizePolicyUpdate",
        "key": "authorizePolicyUpdate",
        "description": "Check whether the person has permission to change the rules.",
        "kind": "Stage step",
        "signature": "authorizers.authorizePolicyUpdate(intent)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "Authorize: {\n  authorizePolicyUpdate: authorizers.authorizePolicyUpdate\n}",
        "source": "Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizePolicyUpdate.js",
        "params": []
      },
      {
        "id": "authorize-authorizeLessonRecommendation",
        "key": "authorizeLessonRecommendation",
        "description": "Check whether the learner is allowed to receive a lesson suggestion.",
        "kind": "Stage step",
        "signature": "authorizers.authorizeLessonRecommendation(intent)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "Authorize: {\n  authorizeLessonRecommendation: authorizers.authorizeLessonRecommendation\n}",
        "source": "Template/ICF/Stages/Authorizers/Domain/adaptiveContext/authorizeLessonRecommendation.js",
        "params": []
      },
      {
        "id": "authorize-allow",
        "key": "allow",
        "description": "Always let the request through this permission step.",
        "kind": "Stage step",
        "signature": "authorizers.allow(intent)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "Authorize: {\n  allow: authorizers.allow\n}",
        "source": "Template/ICF/Stages/Authorizers/Core/allow.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Authorization result."
        ]
      },
      {
        "id": "authorize-deny",
        "key": "deny",
        "description": "Always stop the request at this permission step.",
        "kind": "Stage step",
        "signature": "authorizers.deny(intent)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "Authorize: {\n  deny: authorizers.deny\n}",
        "source": "Template/ICF/Stages/Authorizers/Core/deny.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Authorization result."
        ]
      },
      {
        "id": "authorize-passAuthorize",
        "key": "passAuthorize",
        "description": "Let the request through Authorize without an extra check.",
        "kind": "Stage object",
        "signature": "authorizers.passAuthorize",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "Authorize: {\n  passAuthorize: authorizers.passAuthorize\n}",
        "source": "Template/ICF/Stages/Authorizers/Core/passAuthorize.js",
        "params": []
      },
      {
        "id": "authorize-createRequireActorRoleAuthorizer",
        "key": "createRequireActorRoleAuthorizer",
        "description": "Make a permission check that matches actor.role against a list.",
        "kind": "Configured helper",
        "signature": "authorizers.createRequireActorRoleAuthorizer(allowedRoles)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "authorizers.createRequireActorRoleAuthorizer(allowedRoles)",
        "source": "Template/ICF/Stages/Authorizers/Core/requireActorRole.js",
        "params": [
          "@param {Array} allowedRoles - Allowed roles.",
          "@returns {Function} Authorizer function."
        ]
      },
      {
        "id": "authorize-createRequireContextRoleAuthorizer",
        "key": "createRequireContextRoleAuthorizer",
        "description": "Make a permission check that matches the role saved in context against a list.",
        "kind": "Configured helper",
        "signature": "authorizers.createRequireContextRoleAuthorizer(allowedRoles)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "authorizers.createRequireContextRoleAuthorizer(allowedRoles)",
        "source": "Template/ICF/Stages/Authorizers/Core/requireContextRole.js",
        "params": [
          "@param {Array} allowedRoles - Allowed roles.",
          "@returns {Function} Authorizer function."
        ]
      },
      {
        "id": "authorize-createRequireContextValueAuthorizer",
        "key": "createRequireContextValueAuthorizer",
        "description": "Make a permission check that compares a context field with the value you expect.",
        "kind": "Configured helper",
        "signature": "authorizers.createRequireContextValueAuthorizer(contextKey, expectedValue)",
        "importLine": "import authorizers from \"./Template/ICF/Stages/Authorizers/authorizers.js\";",
        "usage": "authorizers.createRequireContextValueAuthorizer(contextKey, expectedValue)",
        "source": "Template/ICF/Stages/Authorizers/Core/requireContextValue.js",
        "params": [
          "@param {string} contextKey - Context key to check.",
          "@param {*} expectedValue - Expected value.",
          "@returns {Function} Authorizer function."
        ]
      }
    ]
  },
  {
    "id": "process",
    "title": "Process helpers",
    "stage": "Process",
    "entries": [
      {
        "id": "process-createPolicyUpdateProcessor",
        "key": "createPolicyUpdateProcessor",
        "description": "Save the new scoring rules if the version still matches the one the editor started with.",
        "kind": "Configured helper",
        "signature": "processors.createPolicyUpdateProcessor(policyStore)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "processors.createPolicyUpdateProcessor(policyStore)",
        "source": "Template/ICF/Stages/Processors/Domain/adaptiveContext/processPolicyUpdate.js",
        "params": []
      },
      {
        "id": "process-processLessonRecommendation",
        "key": "processLessonRecommendation",
        "description": "Put the chosen lesson and its score in resultData.",
        "kind": "Stage step",
        "signature": "processors.processLessonRecommendation(intent)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  processLessonRecommendation: processors.processLessonRecommendation\n}",
        "source": "Template/ICF/Stages/Processors/Domain/adaptiveContext/processLessonRecommendation.js",
        "params": []
      },
      {
        "id": "process-doNothing",
        "key": "doNothing",
        "description": "Pass through Process without making a change.",
        "kind": "Stage step",
        "signature": "processors.doNothing(intent)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  doNothing: processors.doNothing\n}",
        "source": "Template/ICF/Stages/Processors/Core/doNothing.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Process result."
        ]
      },
      {
        "id": "process-passProcess",
        "key": "passProcess",
        "description": "Pass through Process without making a change.",
        "kind": "Stage object",
        "signature": "processors.passProcess",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  passProcess: processors.passProcess\n}",
        "source": "Template/ICF/Stages/Processors/Core/passProcess.js",
        "params": []
      },
      {
        "id": "process-exampleSetCreatedProductResult",
        "key": "exampleSetCreatedProductResult",
        "description": "Write a sample product result to resultData.",
        "kind": "Stage object",
        "signature": "processors.exampleSetCreatedProductResult",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  exampleSetCreatedProductResult: processors.exampleSetCreatedProductResult\n}",
        "source": "Template/ICF/Stages/Processors/Core/exampleSetCreatedProductResult.js",
        "params": []
      },
      {
        "id": "process-createSetResultDataProcessor",
        "key": "createSetResultDataProcessor",
        "description": "Make a step that writes fixed values to resultData.",
        "kind": "Configured helper",
        "signature": "processors.createSetResultDataProcessor(resultData)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "processors.createSetResultDataProcessor(resultData)",
        "source": "Template/ICF/Stages/Processors/Core/setResultData.js",
        "params": [
          "@param {Object} resultData - Result data to store.",
          "@returns {Function} Processor function."
        ]
      },
      {
        "id": "process-addPayloadToResultData",
        "key": "addPayloadToResultData",
        "description": "Copy the request input into resultData.",
        "kind": "Stage step",
        "signature": "processors.addPayloadToResultData(intent)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  addPayloadToResultData: processors.addPayloadToResultData\n}",
        "source": "Template/ICF/Stages/Processors/Core/addPayloadToResultData.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Process result."
        ]
      },
      {
        "id": "process-addContextToResultData",
        "key": "addContextToResultData",
        "description": "Copy the request’s context into resultData.",
        "kind": "Stage step",
        "signature": "processors.addContextToResultData(intent)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  addContextToResultData: processors.addContextToResultData\n}",
        "source": "Template/ICF/Stages/Processors/Core/addContextToResultData.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Process result."
        ]
      },
      {
        "id": "process-setDemoResult",
        "key": "setDemoResult",
        "description": "Mark the demo as having finished Process.",
        "kind": "Stage step",
        "signature": "processors.setDemoResult(intent)",
        "importLine": "import processors from \"./Template/ICF/Stages/Processors/processors.js\";",
        "usage": "Process: {\n  setDemoResult: processors.setDemoResult\n}",
        "source": "Template/ICF/Stages/Processors/Core/setDemoResult.js",
        "params": [
          "@param {Object} intent - Current intent.",
          "@returns {Object} Process result."
        ]
      }
    ]
  },
  {
    "id": "emit",
    "title": "Emit helpers",
    "stage": "Emit",
    "entries": [
      {
        "id": "emit-emitAdaptiveResult",
        "key": "emitAdaptiveResult",
        "description": "Add an event that says what the lesson or rules request did.",
        "kind": "Stage step",
        "signature": "emitters.emitAdaptiveResult(intent)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "Emit: {\n  emitAdaptiveResult: emitters.emitAdaptiveResult\n}",
        "source": "Template/ICF/Stages/Emitters/Domain/adaptiveContext/emitAdaptiveResult.js",
        "params": []
      },
      {
        "id": "emit-passEmit",
        "key": "passEmit",
        "description": "Let the request through Emit as it is.",
        "kind": "Stage step",
        "signature": "emitters.passEmit(intent)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "Emit: {\n  passEmit: emitters.passEmit\n}",
        "source": "Template/ICF/Stages/Emitters/Core/passEmit.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Emit result."
        ]
      },
      {
        "id": "emit-createAddSuccessMessageEmitter",
        "key": "createAddSuccessMessageEmitter",
        "description": "Make a step that writes a success message to resultData.",
        "kind": "Configured helper",
        "signature": "emitters.createAddSuccessMessageEmitter(message)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "emitters.createAddSuccessMessageEmitter(message)",
        "source": "Template/ICF/Stages/Emitters/Core/addSuccessMessage.js",
        "params": [
          "@param {string} message - Success message.",
          "@returns {Function} Emitter function."
        ]
      },
      {
        "id": "emit-createAddEventEmitter",
        "key": "createAddEventEmitter",
        "description": "Make a step that adds an event to the request’s event list.",
        "kind": "Configured helper",
        "signature": "emitters.createAddEventEmitter(eventType, eventData)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "emitters.createAddEventEmitter(eventType, eventData)",
        "source": "Template/ICF/Stages/Emitters/Core/addEvent.js",
        "params": [
          "@param {string} eventType - Event type.",
          "@param {Object} eventData - Event data.",
          "@returns {Function} Emitter function."
        ]
      },
      {
        "id": "emit-createAddResultMessageEmitter",
        "key": "createAddResultMessageEmitter",
        "description": "Make a step that adds a message to resultData.",
        "kind": "Configured helper",
        "signature": "emitters.createAddResultMessageEmitter(messageKey, message)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "emitters.createAddResultMessageEmitter(messageKey, message)",
        "source": "Template/ICF/Stages/Emitters/Core/addResultMessage.js",
        "params": [
          "@param {string} messageKey - Result data key.",
          "@param {string} message - Message value.",
          "@returns {Function} Emitter function."
        ]
      },
      {
        "id": "emit-addDemoSuccessMessage",
        "key": "addDemoSuccessMessage",
        "description": "Add the demo’s success message.",
        "kind": "Stage step",
        "signature": "emitters.addDemoSuccessMessage(intent)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "Emit: {\n  addDemoSuccessMessage: emitters.addDemoSuccessMessage\n}",
        "source": "Template/ICF/Stages/Emitters/emitters.js",
        "params": []
      },
      {
        "id": "emit-addDemoCompletedEvent",
        "key": "addDemoCompletedEvent",
        "description": "Add a DemoIntentCompleted event to the demo result.",
        "kind": "Stage step",
        "signature": "emitters.addDemoCompletedEvent(intent)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "Emit: {\n  addDemoCompletedEvent: emitters.addDemoCompletedEvent\n}",
        "source": "Template/ICF/Stages/Emitters/emitters.js",
        "params": []
      },
      {
        "id": "emit-addDebugSummary",
        "key": "addDebugSummary",
        "description": "Add details to resultData that can help you find a problem.",
        "kind": "Stage step",
        "signature": "emitters.addDebugSummary(intent)",
        "importLine": "import emitters from \"./Template/ICF/Stages/Emitters/emitters.js\";",
        "usage": "Emit: {\n  addDebugSummary: emitters.addDebugSummary\n}",
        "source": "Template/ICF/Stages/Emitters/Core/addDebugSummary.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Emit result."
        ]
      }
    ]
  },
  {
    "id": "runner",
    "title": "Pipeline runner",
    "stage": "",
    "entries": [
      {
        "id": "runner-run",
        "key": "run",
        "description": "Run the Intent. Get the answer or error, along with a list of the named steps that ran.",
        "kind": "Function",
        "signature": "pipeline.run(intent)",
        "importLine": "import pipeline from \"./Template/ICF/engine/pipeline.js\";",
        "usage": "pipeline.run(intent)",
        "source": "Template/ICF/engine/pipeline.js",
        "params": [
          "@param {Object} intent - The Intent object.",
          "@returns {Object} Pipeline result."
        ]
      }
    ]
  },
  {
    "id": "registry",
    "title": "Intent registry",
    "stage": "",
    "entries": [
      {
        "id": "registry-registerIntent",
        "key": "registerIntent",
        "description": "Tell the registry which function makes one kind of Intent.",
        "kind": "Function",
        "signature": "intentRegistry.registerIntent(intentType, intentFactory)",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.registerIntent(intentType, intentFactory)",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@param {string} intentType - Intent type name.",
          "@param {Function} intentFactory - Function that creates the Intent.",
          "@returns {Object} Registration result."
        ]
      },
      {
        "id": "registry-registerIntents",
        "key": "registerIntents",
        "description": "Tell the registry which functions make several kinds of Intents.",
        "kind": "Function",
        "signature": "intentRegistry.registerIntents(intentFactories)",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.registerIntents(intentFactories)",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@param {Object} intentFactories - Object of Intent factories.",
          "@returns {Object} Registration result."
        ]
      },
      {
        "id": "registry-createIntent",
        "key": "createIntent",
        "description": "Make a new request using a registered action name.",
        "kind": "Function",
        "signature": "intentRegistry.createIntent(intentType, actor, payload, options)",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.createIntent(intentType, actor, payload, options)",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@param {string} intentType - Intent type name.",
          "@param {Object} actor - Actor requesting the action.",
          "@param {Object} payload - Intent payload.",
          "@param {Object} options - Optional creation options.",
          "@returns {Object} Intent creation result."
        ]
      },
      {
        "id": "registry-getIntentFactory",
        "key": "getIntentFactory",
        "description": "Find the function that makes a registered kind of Intent.",
        "kind": "Function",
        "signature": "intentRegistry.getIntentFactory(intentType)",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.getIntentFactory(intentType)",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@param {string} intentType - Intent type name.",
          "@returns {Object} Factory lookup result."
        ]
      },
      {
        "id": "registry-hasIntent",
        "key": "hasIntent",
        "description": "Check whether the registry knows this action name.",
        "kind": "Function",
        "signature": "intentRegistry.hasIntent(intentType)",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.hasIntent(intentType)",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@param {string} intentType - Intent type name.",
          "@returns {boolean} True if registered."
        ]
      },
      {
        "id": "registry-listIntentTypes",
        "key": "listIntentTypes",
        "description": "Show all action names the registry knows.",
        "kind": "Function",
        "signature": "intentRegistry.listIntentTypes()",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.listIntentTypes()",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@returns {Array} Registered Intent type names."
        ]
      },
      {
        "id": "registry-clearRegistry",
        "key": "clearRegistry",
        "description": "Remove all the action names and their factories from the registry.",
        "kind": "Function",
        "signature": "intentRegistry.clearRegistry()",
        "importLine": "import intentRegistry from \"./Template/ICF/engine/intentRegistry.js\";",
        "usage": "intentRegistry.clearRegistry()",
        "source": "Template/ICF/engine/intentRegistry.js",
        "params": [
          "@returns {Object} Clear result."
        ]
      }
    ]
  },
  {
    "id": "results",
    "title": "Result helpers",
    "stage": "",
    "entries": [
      {
        "id": "results-success",
        "key": "success",
        "description": "Creates a successful result.",
        "kind": "Function",
        "signature": "resultHelpers.success(intent)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.success(intent)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current or updated Intent.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "results-successWithMessage",
        "key": "successWithMessage",
        "description": "Creates a successful result with a message.",
        "kind": "Function",
        "signature": "resultHelpers.successWithMessage(intent, message)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.successWithMessage(intent, message)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current or updated Intent.",
          "@param {string} message - Success message.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "results-successWithData",
        "key": "successWithData",
        "description": "Creates a successful result with extra data.",
        "kind": "Function",
        "signature": "resultHelpers.successWithData(intent, data)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.successWithData(intent, data)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current or updated Intent.",
          "@param {Object} data - Data to return.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "results-passThrough",
        "key": "passThrough",
        "description": "Return success and keep the same Intent.",
        "kind": "Function",
        "signature": "resultHelpers.passThrough(intent)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.passThrough(intent)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@returns {Object} Success result."
        ]
      },
      {
        "id": "results-failure",
        "key": "failure",
        "description": "Creates a generic failure result.",
        "kind": "Function",
        "signature": "resultHelpers.failure(stageName, errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.failure(stageName, errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} stageName - ICF stage name.",
          "@param {Array} errors - Error messages.",
          "@returns {Object} Failure result."
        ]
      },
      {
        "id": "results-stepFailure",
        "key": "stepFailure",
        "description": "Build an error that names the stage and step that failed.",
        "kind": "Function",
        "signature": "resultHelpers.stepFailure(stageName, stepName, errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.stepFailure(stageName, stepName, errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} stageName - ICF stage name.",
          "@param {string} stepName - Step name inside the stage.",
          "@param {Array} errors - Error messages.",
          "@returns {Object} Failure result."
        ]
      },
      {
        "id": "results-validationFailure",
        "key": "validationFailure",
        "description": "Creates a validation failure.",
        "kind": "Function",
        "signature": "resultHelpers.validationFailure(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.validationFailure(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Array} errors - Validation error messages.",
          "@returns {Object} Validation failure result."
        ]
      },
      {
        "id": "results-normalizationFailure",
        "key": "normalizationFailure",
        "description": "Creates a normalization failure.",
        "kind": "Function",
        "signature": "resultHelpers.normalizationFailure(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.normalizationFailure(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Array} errors - Normalization error messages.",
          "@returns {Object} Normalization failure result."
        ]
      },
      {
        "id": "results-contextFailure",
        "key": "contextFailure",
        "description": "Build an error for a step that stopped in AddContext.",
        "kind": "Function",
        "signature": "resultHelpers.contextFailure(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.contextFailure(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Array} errors - Context error messages.",
          "@returns {Object} AddContext failure result."
        ]
      },
      {
        "id": "results-authorizationFailure",
        "key": "authorizationFailure",
        "description": "Build an error for a permission check that failed.",
        "kind": "Function",
        "signature": "resultHelpers.authorizationFailure(reason)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.authorizationFailure(reason)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} reason - Authorization failure reason.",
          "@returns {Object} Authorization failure result."
        ]
      },
      {
        "id": "results-processFailure",
        "key": "processFailure",
        "description": "Creates a process failure.",
        "kind": "Function",
        "signature": "resultHelpers.processFailure(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.processFailure(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Array} errors - Process error messages.",
          "@returns {Object} Process failure result."
        ]
      },
      {
        "id": "results-emitFailure",
        "key": "emitFailure",
        "description": "Creates an emit failure.",
        "kind": "Function",
        "signature": "resultHelpers.emitFailure(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.emitFailure(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Array} errors - Emit error messages.",
          "@returns {Object} Emit failure result."
        ]
      },
      {
        "id": "results-addResultDataToIntent",
        "key": "addResultDataToIntent",
        "description": "Adds result data to intent.context.resultData.",
        "kind": "Function",
        "signature": "resultHelpers.addResultDataToIntent(intent, resultData)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addResultDataToIntent(intent, resultData)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {Object} resultData - Data to attach.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-addEventToIntent",
        "key": "addEventToIntent",
        "description": "Adds one event to intent.context.events.",
        "kind": "Function",
        "signature": "resultHelpers.addEventToIntent(intent, event)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addEventToIntent(intent, event)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {Object} event - Event to attach.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-addEventsToIntent",
        "key": "addEventsToIntent",
        "description": "Adds many events to intent.context.events.",
        "kind": "Function",
        "signature": "resultHelpers.addEventsToIntent(intent, events)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addEventsToIntent(intent, events)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {Array} events - Events to attach.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-addContextValue",
        "key": "addContextValue",
        "description": "Adds a context value to intent.context.",
        "kind": "Function",
        "signature": "resultHelpers.addContextValue(intent, key, value)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addContextValue(intent, key, value)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {string} key - Context key.",
          "@param {*} value - Context value.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-addContextValues",
        "key": "addContextValues",
        "description": "Adds many context values to intent.context.",
        "kind": "Function",
        "signature": "resultHelpers.addContextValues(intent, contextValues)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addContextValues(intent, contextValues)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {Object} contextValues - Values to add.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-replacePayload",
        "key": "replacePayload",
        "description": "Adds or replaces the payload.",
        "kind": "Function",
        "signature": "resultHelpers.replacePayload(intent, payload)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.replacePayload(intent, payload)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {Object} payload - Updated payload.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-addPayloadValue",
        "key": "addPayloadValue",
        "description": "Adds one payload value.",
        "kind": "Function",
        "signature": "resultHelpers.addPayloadValue(intent, key, value)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.addPayloadValue(intent, key, value)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Current Intent.",
          "@param {string} key - Payload key.",
          "@param {*} value - Payload value.",
          "@returns {Object} Updated Intent."
        ]
      },
      {
        "id": "results-createEvent",
        "key": "createEvent",
        "description": "Creates a standard event object.",
        "kind": "Function",
        "signature": "resultHelpers.createEvent(type, data)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.createEvent(type, data)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} type - Event type.",
          "@param {Object} data - Event data.",
          "@returns {Object} Event object."
        ]
      },
      {
        "id": "results-normalizeErrors",
        "key": "normalizeErrors",
        "description": "Put error messages into one list the runner can read.",
        "kind": "Function",
        "signature": "resultHelpers.normalizeErrors(errors)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.normalizeErrors(errors)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {*} errors - Error input.",
          "@returns {Array} Error array."
        ]
      },
      {
        "id": "results-getResultData",
        "key": "getResultData",
        "description": "Read the data the steps built for the final answer.",
        "kind": "Function",
        "signature": "resultHelpers.getResultData(intent)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.getResultData(intent)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Intent object.",
          "@returns {Object} Result data."
        ]
      },
      {
        "id": "results-getEvents",
        "key": "getEvents",
        "description": "Read the events the steps added to the request.",
        "kind": "Function",
        "signature": "resultHelpers.getEvents(intent)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.getEvents(intent)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} intent - Intent object.",
          "@returns {Array} Events."
        ]
      },
      {
        "id": "results-isSuccess",
        "key": "isSuccess",
        "description": "Checks whether a result is successful.",
        "kind": "Function",
        "signature": "resultHelpers.isSuccess(result)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.isSuccess(result)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} result - Result object.",
          "@returns {boolean} True if successful."
        ]
      },
      {
        "id": "results-isFailure",
        "key": "isFailure",
        "description": "Checks whether a result failed.",
        "kind": "Function",
        "signature": "resultHelpers.isFailure(result)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.isFailure(result)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {Object} result - Result object.",
          "@returns {boolean} True if failed."
        ]
      },
      {
        "id": "results-missingField",
        "key": "missingField",
        "description": "Creates a simple missing field message.",
        "kind": "Function",
        "signature": "resultHelpers.missingField(fieldName)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.missingField(fieldName)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} fieldName - Field name.",
          "@returns {string} Error message."
        ]
      },
      {
        "id": "results-invalidField",
        "key": "invalidField",
        "description": "Creates a simple invalid field message.",
        "kind": "Function",
        "signature": "resultHelpers.invalidField(fieldName)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.invalidField(fieldName)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} fieldName - Field name.",
          "@returns {string} Error message."
        ]
      },
      {
        "id": "results-permissionDenied",
        "key": "permissionDenied",
        "description": "Creates a simple permission message.",
        "kind": "Function",
        "signature": "resultHelpers.permissionDenied(reason)",
        "importLine": "import resultHelpers from \"./Template/ICF/engine/resultHelpers.js\";",
        "usage": "resultHelpers.permissionDenied(reason)",
        "source": "Template/ICF/engine/resultHelpers.js",
        "params": [
          "@param {string} reason - Permission reason.",
          "@returns {string} Error message."
        ]
      }
    ]
  },
  {
    "id": "factories",
    "title": "Stage factories",
    "entries": [
      {
        "id": "factories-createValidator",
        "key": "createValidator",
        "description": "Creates a Validate stage object.",
        "kind": "Function",
        "signature": "createValidator(config)",
        "importLine": "import { createValidator } from \"./Template/ICF/StageFactories/createValidator.js\";",
        "usage": "createValidator(config)",
        "source": "Template/ICF/StageFactories/createValidator.js",
        "params": [
          "@param {Object} config - Validator configuration.",
          "@returns {Object} Validate stage object."
        ]
      },
      {
        "id": "factories-createNormalizer",
        "key": "createNormalizer",
        "description": "Creates a Normalize stage object.",
        "kind": "Function",
        "signature": "createNormalizer(config)",
        "importLine": "import { createNormalizer } from \"./Template/ICF/StageFactories/createNormalizer.js\";",
        "usage": "createNormalizer(config)",
        "source": "Template/ICF/StageFactories/createNormalizer.js",
        "params": [
          "@param {Object} config - Normalizer configuration.",
          "@returns {Object} Normalize stage object."
        ]
      },
      {
        "id": "factories-createContextAdder",
        "key": "createContextAdder",
        "description": "Creates an AddContext stage object.",
        "kind": "Function",
        "signature": "createContextAdder(config)",
        "importLine": "import { createContextAdder } from \"./Template/ICF/StageFactories/createContextAdder.js\";",
        "usage": "createContextAdder(config)",
        "source": "Template/ICF/StageFactories/createContextAdder.js",
        "params": [
          "@param {Object} config - Context adder configuration.",
          "@returns {Object} AddContext stage object."
        ]
      },
      {
        "id": "factories-createAuthorizer",
        "key": "createAuthorizer",
        "description": "Creates an Authorize stage object.",
        "kind": "Function",
        "signature": "createAuthorizer(config)",
        "importLine": "import { createAuthorizer } from \"./Template/ICF/StageFactories/createAuthorizer.js\";",
        "usage": "createAuthorizer(config)",
        "source": "Template/ICF/StageFactories/createAuthorizer.js",
        "params": [
          "@param {Object} config - Authorizer configuration.",
          "@returns {Object} Authorize stage object."
        ]
      },
      {
        "id": "factories-createProcessor",
        "key": "createProcessor",
        "description": "Creates a Process stage object.",
        "kind": "Function",
        "signature": "createProcessor(config)",
        "importLine": "import { createProcessor } from \"./Template/ICF/StageFactories/createProcessor.js\";",
        "usage": "createProcessor(config)",
        "source": "Template/ICF/StageFactories/createProcessor.js",
        "params": [
          "@param {Object} config - Processor configuration.",
          "@returns {Object} Process stage object."
        ]
      },
      {
        "id": "factories-createEmitter",
        "key": "createEmitter",
        "description": "Creates an Emit stage object.",
        "kind": "Function",
        "signature": "createEmitter(config)",
        "importLine": "import { createEmitter } from \"./Template/ICF/StageFactories/createEmitter.js\";",
        "usage": "createEmitter(config)",
        "source": "Template/ICF/StageFactories/createEmitter.js",
        "params": [
          "@param {Object} config - Emitter configuration.",
          "@returns {Object} Emit stage object."
        ]
      }
    ]
  },
  {
    "id": "adaptive-api",
    "title": "Adaptive Context API",
    "entries": [
      {
        "id": "adaptive-api-rankContextCandidates",
        "key": "rankContextCandidates",
        "description": "Check which choices can be used, score them, and keep the top choices allowed by the rules.",
        "kind": "Function",
        "signature": "rankContextCandidates(candidates, signals, policy, execution)",
        "importLine": "import { rankContextCandidates } from \"./Template/ICF/engine/adaptiveContext.js\";",
        "usage": "rankContextCandidates(candidates, signals, policy, execution)",
        "source": "Template/ICF/engine/adaptiveContext.js",
        "params": []
      },
      {
        "id": "adaptive-api-scoreContextCandidate",
        "key": "scoreContextCandidate",
        "description": "Add up a choice’s score and show what each clue added or took away.",
        "kind": "Function",
        "signature": "scoreContextCandidate(rule, signals)",
        "importLine": "import { scoreContextCandidate } from \"./Template/ICF/engine/adaptiveContext.js\";",
        "usage": "scoreContextCandidate(rule, signals)",
        "source": "Template/ICF/engine/adaptiveContext.js",
        "params": []
      },
      {
        "id": "adaptive-api-validateContextPolicy",
        "key": "validateContextPolicy",
        "description": "Check that the scoring rules use allowed values and limits.",
        "kind": "Function",
        "signature": "validateContextPolicy(policy)",
        "importLine": "import { validateContextPolicy } from \"./Template/ICF/engine/adaptiveContext.js\";",
        "usage": "validateContextPolicy(policy)",
        "source": "Template/ICF/engine/adaptiveContext.js",
        "params": []
      },
      {
        "id": "adaptive-api-createMemoryContextPolicyStore",
        "key": "createMemoryContextPolicyStore",
        "description": "Keep the current rules and their history in memory. Check the version when saving a change.",
        "kind": "Function",
        "signature": "createMemoryContextPolicyStore(initialPolicy)",
        "importLine": "import { createMemoryContextPolicyStore } from \"./Template/ICF/engine/contextPolicyStore.js\";",
        "usage": "createMemoryContextPolicyStore(initialPolicy)",
        "source": "Template/ICF/engine/contextPolicyStore.js",
        "params": []
      }
    ]
  }
];

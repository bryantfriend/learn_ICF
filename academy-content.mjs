// Unified lesson content migrated from the previous course apps.
export const legacyTracks = [
  {
    "id": "foundations",
    "title": "JavaScript Foundations",
    "folder": "ICF Begginer",
    "storageKey": "icf-beginner-js-course-progress-v2",
    "project": {
      "prompt": "Design a full beginner-friendly feature that moves from an intent envelope through validation, normalization, context, authorization, process, and emit.",
      "checks": [
        {
          "label": "name the feature clearly",
          "field": "name",
          "keywords": [
            "account",
            "deposit",
            "profile",
            "wallet",
            "feature"
          ]
        },
        {
          "label": "describe the intent envelope",
          "field": "intent",
          "keywords": [
            "type",
            "payload",
            "actor",
            "createdat"
          ]
        },
        {
          "label": "include validation or normalization rules",
          "field": "validate",
          "keywords": [
            "validator",
            "required",
            "trim",
            "number",
            "registry"
          ]
        },
        {
          "label": "include context or authorization",
          "field": "context",
          "keywords": [
            "context",
            "view",
            "balance",
            "permission",
            "authorize"
          ]
        },
        {
          "label": "include process and emit follow-through",
          "field": "process",
          "keywords": [
            "process",
            "state",
            "audit",
            "emit",
            "return"
          ]
        }
      ]
    },
    "modules": [
      {
        "id": "intent-envelope",
        "label": "Intent envelope",
        "title": "Describe one action clearly",
        "duration": "6 min",
        "summary": "Give an action a name, an actor, a payload, context, and metadata. No state changes yet.",
        "narrative": [
          "Imagine Ava presses “Create account.” The Intent records what she requested before the app acts.",
          "The current template uses actor: { id, role }, payload, context, and meta: { createdAt, source }. The factory also attaches all six stage groups.",
          "Registration connects a type name to its factory at startup. Creating this envelope is practice for what that factory does on each request."
        ],
        "exampleCode": "function makeIntent(type, payload, actorId) {\n  return {\n    type: type,\n    actor: { id: actorId, role: \"student\" },\n    payload: payload,\n    context: {},\n    meta: { createdAt: Date.now(), source: \"lesson\" }\n  };\n}",
        "instructionPrompt": "Inside the `makeIntent` function, return a JavaScript object that gives the rest of the ICF pipeline a stable shape to work with.",
        "instructions": [
          "Return type and payload unchanged.",
          "Add actor with id: actorId and role: \"student\".",
          "Add an empty context and meta with createdAt: Date.now() and source: \"lesson\"."
        ],
        "hint": "The actor and meta fields each contain another object. The plain envelope is not runnable until a factory adds the six-stage map.",
        "why": [
          "A stable intent envelope makes every later stage easier to reason about.",
          "This is the point where JavaScript code stops being ad hoc button logic and starts looking like a pipeline."
        ],
        "starterCode": "function makeIntent(type, payload, actorId) {\n  // Build the envelope here.\n}\n\nvar intent = makeIntent(\"CreateAccountIntent\", { displayName: \"Ava\" }, \"user-42\");\nconsole.log(intent.type);\nconsole.log(intent.actor.id);\nconsole.log(intent.payload.displayName);",
        "solutionCode": "function makeIntent(type, payload, actorId) {\n  return {\n    type: type,\n    actor: { id: actorId, role: \"student\" },\n    payload: payload,\n    context: {},\n    meta: { createdAt: Date.now(), source: \"lesson\" }\n  };\n}\n\nvar intent = makeIntent(\"CreateAccountIntent\", { displayName: \"Ava\" }, \"user-42\");\nconsole.log(intent.type);\nconsole.log(intent.actor.id);\nconsole.log(intent.payload.displayName);",
        "expectedLogs": [
          "CreateAccountIntent",
          "user-42",
          "Ava"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "var probe = makeIntent(\"OtherIntent\", { value: 7 }, \"user-9\");\nif (probe.type !== \"OtherIntent\" || probe.actor.id !== \"user-9\" || !probe.context || !probe.meta || typeof probe.meta.createdAt !== \"number\" || probe.payload.value !== 7) throw new Error(\"Keep the supplied type, actor, and payload; include context and timestamp metadata.\");"
      },
      {
        "id": "folder-structure",
        "label": "Validation Structure",
        "title": "Find your way around the template",
        "duration": "7 min",
        "summary": "Validation in ICF should not live in one giant file. Students need to understand the relationship between the shared `core` layer and domain-specific validator folders.",
        "narrative": [
          "The template already has a home for each responsibility. ICF/engine runs the flow; ICF/Intents declares actions.",
          "Shared validators live in ICF/Stages/Validators/Core. Feature rules live under ICF/Stages/Validators/Domain, such as Domain/account/hasDisplayName.js.",
          "ICF/Stages/Validators/validators.js imports and exposes named helpers. Do not put feature folders beside Core and Domain."
        ],
        "exampleCode": "ICF/\n  engine/pipeline.js\n  Intents/DemoIntent.js\n  Stages/Validators/\n    validators.js\n    Core/requireActor.js\n    Domain/account/hasDisplayName.js",
        "instructionPrompt": "Add the missing shared and domain validator file paths so the folder plan reflects a real ICF validation setup.",
        "instructions": [
          "Add \"validators.js\" to coreFiles (the registry file).",
          "Add \"Domain/account/hasDisplayName.js\" and \"Domain/account/isEmail.js\" to domainFiles.",
          "These are paths relative to ICF/Stages/Validators; the arrays are only a folder-mapping exercise."
        ],
        "hint": "Think in terms of one shared registry file in `core`, then small feature validators inside `domain/account/validators`.",
        "why": [
          "Folder structure is part of how students learn the architecture, not just the syntax.",
          "If they understand where validators live, they are much less likely to build a single messy validation file later."
        ],
        "starterCode": "const coreFiles = [\"Core/requireActor.js\", \"Core/requirePayload.js\"];\nconst domainFiles = [\"Domain/account/isAccountOpen.js\"];\n\n// Add the missing validator file paths below\n\nconsole.log(coreFiles.includes(\"validators.js\"));\nconsole.log(domainFiles.includes(\"Domain/account/hasDisplayName.js\"));\nconsole.log(domainFiles.includes(\"Domain/account/isEmail.js\"));",
        "solutionCode": "const coreFiles = [\"Core/requireActor.js\", \"Core/requirePayload.js\", \"validators.js\"];\nconst domainFiles = [\n  \"Domain/account/isAccountOpen.js\",\n  \"Domain/account/hasDisplayName.js\",\n  \"Domain/account/isEmail.js\"\n];\n\nconsole.log(coreFiles.includes(\"validators.js\"));\nconsole.log(domainFiles.includes(\"Domain/account/hasDisplayName.js\"));\nconsole.log(domainFiles.includes(\"Domain/account/isEmail.js\"));",
        "expectedLogs": [
          "true",
          "true",
          "true"
        ],
        "requiredPatterns": []
      },
      {
        "id": "base-registry",
        "label": "Validation Registry",
        "title": "Build the Base validators.js Registry",
        "duration": "8 min",
        "summary": "Now that the student has seen the structure, they need to understand the shared registry that pulls validators together in one predictable place.",
        "narrative": [
          "This drill builds a small field-to-rules lookup so you can practice composition.",
          "The template’s validators.js registry exposes named helpers. A field-to-rules lookup like this can live inside a domain validation helper; it is not a replacement for the template registry.",
          "An array lets one field have several checks. Each small predicate answers one narrow question."
        ],
        "exampleCode": "const required = (value) => value !== undefined && value !== null && value !== \"\";\n\nconst validators = {\n  displayName: [required],\n  email: [required]\n};",
        "instructionPrompt": "Add `displayName` and `email` arrays to the shared validator registry so the rest of the pipeline has one place to read from.",
        "instructions": [
          "Inside `validators`, create a `displayName` key with an array containing `required`.",
          "Create an `email` key with an array containing `required`.",
          "When the script runs, the output should show that each field maps to an array and that `displayName` has one validator."
        ],
        "hint": "Each field key should point to an array, even if you only start with one validator.",
        "why": [
          "A registry keeps validation discoverable for the team.",
          "It also makes it easy to add more validators per field without rewriting the rest of the pipeline."
        ],
        "starterCode": "const required = (value) => value !== undefined && value !== null && value !== \"\";\n\nconst validators = {\n  // Add displayName and email validator arrays here\n};\n\nconsole.log(Array.isArray(validators.displayName));\nconsole.log(Array.isArray(validators.email));\nconsole.log(validators.displayName.length);",
        "solutionCode": "const required = (value) => value !== undefined && value !== null && value !== \"\";\n\nconst validators = {\n  displayName: [required],\n  email: [required]\n};\n\nconsole.log(Array.isArray(validators.displayName));\nconsole.log(Array.isArray(validators.email));\nconsole.log(validators.displayName.length);",
        "expectedLogs": [
          "true",
          "true",
          "1"
        ],
        "requiredPatterns": [
          {
            "regex": "displayName\\s*:\\s*\\[",
            "flags": ""
          },
          {
            "regex": "email\\s*:\\s*\\[",
            "flags": ""
          }
        ]
      },
      {
        "id": "string-validators",
        "label": "String Validators",
        "title": "Create a Reusable String Validator",
        "duration": "8 min",
        "summary": "Students should write at least one real validator function themselves so they see how tiny and composable validators can be.",
        "narrative": [
          "This tiny predicate answers one question and returns true or false. A template stage wraps that decision in an { ok: true } or { ok: false, errors: [...] } result.",
          "For strings, `minLength` is a good example because it teaches closures and composition at the same time.",
          "Once students understand this pattern, it becomes much easier to build validators like `hasDisplayName` or `isHandle` later."
        ],
        "exampleCode": "const minLength = (min) => {\n  return (value) => value.length >= min;\n};",
        "instructionPrompt": "Define `minLength(min)` so it returns a validator function. That validator should return `true` only when the input string is long enough.",
        "instructions": [
          "Inside `minLength`, return a new function that receives `value`.",
          "That inner function should check whether `value.length` is greater than or equal to `min`.",
          "When the script runs, the first log should be `true` and the second should be `false`."
        ],
        "hint": "You need a function that returns another function. The inner function can still use `min` because of closure.",
        "why": [
          "This teaches students how reusable validators are built in real JavaScript projects.",
          "It also shows why validators are often stored in arrays and reused from a shared registry."
        ],
        "starterCode": "const minLength = (min) => {\n  // Return a validator function here\n};\n\nconst hasLength = minLength(3);\nconsole.log(hasLength(\"Ava\"));\nconsole.log(hasLength(\"Al\"));",
        "solutionCode": "const minLength = (min) => {\n  return (value) => value.length >= min;\n};\n\nconst hasLength = minLength(3);\nconsole.log(hasLength(\"Ava\"));\nconsole.log(hasLength(\"Al\"));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "if (minLength(4)(\"Ava\") !== false || minLength(2)(\"Al\") !== true) throw new Error(\"Use the supplied minimum, including the exact boundary.\");"
      },
      {
        "id": "number-validators",
        "label": "Number Validators",
        "title": "Create a Minimum Amount Validator",
        "duration": "7 min",
        "summary": "Validation often needs more than strings. Numeric rules are common in ICF, especially when dealing with money, inventory, limits, or counts.",
        "narrative": [
          "Validate runs before Normalize. This focused predicate assumes a number; a real Validate stage must also reject invalid types or check accepted numeric text before conversion.",
          "A minimumAmount predicate is useful for deposits or inventory thresholds.",
          "Try a value exactly at the minimum. It should pass."
        ],
        "exampleCode": "const minimumAmount = (min) => {\n  return (value) => value >= min;\n};",
        "instructionPrompt": "Define `minimumAmount(min)` so it returns a validator function that accepts numbers at or above the configured minimum.",
        "instructions": [
          "Return a validator function from `minimumAmount`.",
          "That validator should compare the incoming `value` against `min`.",
          "When the script runs, `25` should pass and `5` should fail."
        ],
        "hint": "This looks almost the same as `minLength`, but the rule compares numbers instead of string length.",
        "why": [
          "Separate checking a value from converting it.",
          "Reusable rules should work for more than the two example inputs."
        ],
        "starterCode": "const minimumAmount = (min) => {\n  // Return a validator function here\n};\n\nconst amountIsValid = minimumAmount(10);\nconsole.log(amountIsValid(25));\nconsole.log(amountIsValid(5));",
        "solutionCode": "const minimumAmount = (min) => {\n  return (value) => value >= min;\n};\n\nconst amountIsValid = minimumAmount(10);\nconsole.log(amountIsValid(25));\nconsole.log(amountIsValid(5));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "if (minimumAmount(10)(10) !== true || minimumAmount(20)(19) !== false) throw new Error(\"The minimum itself should pass; lower values should fail.\");"
      },
      {
        "id": "normalize",
        "label": "Normalize",
        "title": "Normalize after checking the raw input",
        "duration": "8 min",
        "summary": "Validate checks accepted input first. Normalize then trims strings and converts valid numeric text into a consistent shape.",
        "narrative": [
          "The template always runs Validate before Normalize. Validate must confirm that a display name is a string and that accepted numeric text can be converted safely.",
          "This isolated helper assumes those checks already passed. It trims a name and converts the accepted amount.",
          "Do not use conversion as a substitute for input validation: an empty string converts to zero and invalid text converts to NaN."
        ],
        "exampleCode": "const normalizeDepositPayload = (payload) => ({\n  displayName: payload.displayName.trim(),\n  amount: Number(payload.amount)\n});",
        "instructionPrompt": "Normalize the incoming payload by trimming the display name and converting the amount into a real number.",
        "instructions": [
          "Return a new object from `normalizeDepositPayload`.",
          "Set `displayName` to `payload.displayName.trim()`.",
          "Set `amount` to `Number(payload.amount)`.",
          "When the script runs, the first log should be `Ava` and the second should be `30`."
        ],
        "hint": "Return a fresh object literal. Do not mutate the incoming payload directly.",
        "why": [
          "Keep input checks separate from cleanup.",
          "Never assume a later stage has already run."
        ],
        "starterCode": "const normalizeDepositPayload = (payload) => {\n  // Return a normalized payload here\n};\n\nconst normalized = normalizeDepositPayload({\n  displayName: \"  Ava  \",\n  amount: \"25\"\n});\n\nconsole.log(normalized.displayName);\nconsole.log(normalized.amount + 5);",
        "solutionCode": "const normalizeDepositPayload = (payload) => {\n  return {\n    displayName: payload.displayName.trim(),\n    amount: Number(payload.amount)\n  };\n};\n\nconst normalized = normalizeDepositPayload({\n  displayName: \"  Ava  \",\n  amount: \"25\"\n});\n\nconsole.log(normalized.displayName);\nconsole.log(normalized.amount + 5);",
        "expectedLogs": [
          "Ava",
          "30"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "var raw = { displayName: \" Bo \", amount: \"12\" }; var cleaned = normalizeDepositPayload(raw); if (cleaned.displayName !== \"Bo\" || cleaned.amount !== 12 || raw.displayName !== \" Bo \") throw new Error(\"Trim and convert varied inputs without changing the original payload.\");"
      },
      {
        "id": "context",
        "label": "Context",
        "title": "Build Context From State and Intent",
        "duration": "8 min",
        "summary": "Context is where ICF stops acting like a plain input parser and starts making decisions based on the current state of the system.",
        "narrative": [
          "Students often understand payloads but forget that authorization and later decisions usually need the current application state too.",
          "A context builder gives later stages a single place to read from. That might include the current view, the actor, balances, permissions, or selected records.",
          "This module teaches the habit of building a small derived object instead of repeatedly digging through state later.",
          "In an application, load these facts from a trusted source. Copying a role supplied by a client does not verify that role. This exercise uses an in-memory state fixture."
        ],
        "exampleCode": "const buildContext = (state, intent) => ({\n  intentType: intent.type,\n  currentView: state.ui.currentView,\n  accountBalance: state.account.balance\n});",
        "instructionPrompt": "Return a context object that includes the current view and the account balance so the authorization stage can reason about the current situation.",
        "instructions": [
          "Return an object from `buildContext`.",
          "Include `currentView` from `state.ui.currentView`.",
          "Include `accountBalance` from `state.account.balance`.",
          "When the script runs, the output should be `account` and `120`."
        ],
        "hint": "You can keep the function small. Only include the values the later stage actually needs.",
        "why": [
          "Context helps students separate raw state from decision-ready values.",
          "It sets up authorization to stay readable instead of reaching through the whole state tree."
        ],
        "starterCode": "const buildContext = (state, intent) => {\n  // Return a context object here\n};\n\nconst context = buildContext(\n  { ui: { currentView: \"account\" }, account: { balance: 120 } },\n  { type: \"account/deposit\" }\n);\n\nconsole.log(context.currentView);\nconsole.log(context.accountBalance);",
        "solutionCode": "const buildContext = (state, intent) => {\n  return {\n    intentType: intent.type,\n    currentView: state.ui.currentView,\n    accountBalance: state.account.balance\n  };\n};\n\nconst context = buildContext(\n  { ui: { currentView: \"account\" }, account: { balance: 120 } },\n  { type: \"account/deposit\" }\n);\n\nconsole.log(context.currentView);\nconsole.log(context.accountBalance);",
        "expectedLogs": [
          "account",
          "120"
        ],
        "requiredPatterns": [
          {
            "regex": "currentView",
            "flags": ""
          },
          {
            "regex": "accountBalance",
            "flags": ""
          }
        ]
      },
      {
        "id": "authorize",
        "label": "Authorize",
        "title": "Authorize Against Context",
        "duration": "7 min",
        "summary": "Check the authenticated actor against the verified account owner before changing a balance.",
        "narrative": [
          "Authorize is separate from Process so permission decisions are easy to find.",
          "For this exercise, trusted context includes the actor ID and the account owner ID. Only that owner may make a deposit.",
          "A UI tab is not proof of permission. In an application, derive the actor from authentication and load ownership from trusted records."
        ],
        "exampleCode": "function canDeposit(context) {\n  return context.actorId === context.ownerId;\n}",
        "instructionPrompt": "Return true only when the actor owns the account.",
        "instructions": [
          "Compare context.actorId with context.ownerId using strict equality.",
          "An owner should pass. A different actor should fail."
        ],
        "hint": "Compare the two IDs. Do not use the current UI view as authorization.",
        "why": [
          "This teaches students to keep policy checks visible and intentional.",
          "It reinforces that authorization depends on context, not just payload data."
        ],
        "starterCode": "function canDeposit(context) {\n  // Is this the account owner?\n}\n\nconsole.log(canDeposit({ actorId: \"ava\", ownerId: \"ava\" }));\nconsole.log(canDeposit({ actorId: \"bo\", ownerId: \"ava\" }));",
        "solutionCode": "function canDeposit(context) {\n  return context.actorId === context.ownerId;\n}\n\nconsole.log(canDeposit({ actorId: \"ava\", ownerId: \"ava\" }));\nconsole.log(canDeposit({ actorId: \"bo\", ownerId: \"ava\" }));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "if (canDeposit({ actorId: \"c\", ownerId: \"c\" }) !== true || canDeposit({ actorId: \"c\", ownerId: \"d\" }) !== false) throw new Error(\"Compare the actor with the actual owner; do not hard-code an ID.\");"
      },
      {
        "id": "process",
        "label": "Process",
        "title": "Process Without Mutating State",
        "duration": "9 min",
        "summary": "This is the module where students finally return a new state object and feel the difference between clean process logic and accidental mutation.",
        "narrative": [
          "In ICF, process is where the state transition really happens. That is why it needs to be predictable and safe.",
          "For JavaScript students, the big habit is returning a new object instead of mutating the old one. If they learn that now, debugging gets much easier later.",
          "This task uses a simple deposit example because it makes the state change obvious.",
          "Returning a new state object is a useful pure helper pattern. The Process stage must still commit the real change safely; the template runner does not create database transactions for you."
        ],
        "exampleCode": "const processDeposit = (state, intent) => ({\n  ...state,\n  account: {\n    ...state.account,\n    balance: state.account.balance + intent.payload.amount\n  }\n});",
        "instructionPrompt": "Return a brand-new state object with the updated balance. The original state must still keep its original balance.",
        "instructions": [
          "Return a new object from `processDeposit` instead of changing the old state.",
          "Increase the new balance by `intent.payload.amount`.",
          "When the script runs, the new state should log `125` and the original state should still log `100`."
        ],
        "hint": "Use object spread for both the top-level state and the nested `account` object.",
        "why": [
          "This is one of the most important JavaScript habits in the whole track.",
          "Students should leave this module feeling the difference between returning state and mutating state."
        ],
        "starterCode": "const processDeposit = (state, intent) => {\n  // Return a new state object here\n};\n\nconst startingState = { account: { balance: 100 } };\nconst nextState = processDeposit(startingState, { payload: { amount: 25 } });\n\nconsole.log(nextState.account.balance);\nconsole.log(startingState.account.balance);",
        "solutionCode": "const processDeposit = (state, intent) => {\n  return {\n    ...state,\n    account: {\n      ...state.account,\n      balance: state.account.balance + intent.payload.amount\n    }\n  };\n};\n\nconst startingState = { account: { balance: 100 } };\nconst nextState = processDeposit(startingState, { payload: { amount: 25 } });\n\nconsole.log(nextState.account.balance);\nconsole.log(startingState.account.balance);",
        "expectedLogs": [
          "125",
          "100"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "var before = { account: { balance: 8 }, other: \"keep\" }; var after = processDeposit(before, { payload: { amount: 4 } }); if (before.account.balance !== 8 || after.account.balance !== 12 || after.other !== \"keep\") throw new Error(\"Preserve the original state and unrelated fields while updating the balance.\");"
      },
      {
        "id": "finalize",
        "label": "Emit",
        "title": "Emit With an Audit Entry",
        "duration": "7 min",
        "summary": "Emit should come after a successful process step. Here the student adds a tiny audit trail so they can see the role of post-success follow-through.",
        "narrative": [
          "Emit is a good place for safe after-effects: audit entries, analytics, notifications, or cleanup that should only happen after process succeeded.",
          "It should not replace process. It should enrich the already-processed result.",
          "This module keeps emit simple: append one audit record and return the updated state.",
          "This drill uses an in-memory audit array. If real Emit delivery fails after a database write, the write is not automatically rolled back. Retry delivery without repeating the main action."
        ],
        "exampleCode": "const emitIntent = (state, intent) => ({\n  ...state,\n  audit: state.audit.concat({ type: intent.type })\n});",
        "instructionPrompt": "Append one audit entry during emit so the state records that a successful intent completed.",
        "instructions": [
          "Return a new state object.",
          "Set `audit` to a new array that includes the previous entries plus one object with `type: intent.type`.",
          "When the script runs, the output should be `1` and `account/deposit`."
        ],
        "hint": "Use `concat()` or spread to avoid mutating the old `audit` array.",
        "why": [
          "Students need a concrete example of emit that is useful but not overloaded.",
          "Audit is a very clear first example because it shows what happened after success."
        ],
        "starterCode": "const emitIntent = (state, intent) => {\n  // Return a new state with one audit entry\n};\n\nconst afterEmit = emitIntent({ audit: [] }, { type: \"account/deposit\" });\nconsole.log(afterEmit.audit.length);\nconsole.log(afterEmit.audit[0].type);",
        "solutionCode": "const emitIntent = (state, intent) => {\n  return {\n    ...state,\n    audit: state.audit.concat({ type: intent.type })\n  };\n};\n\nconst afterEmit = emitIntent({ audit: [] }, { type: \"account/deposit\" });\nconsole.log(afterEmit.audit.length);\nconsole.log(afterEmit.audit[0].type);",
        "expectedLogs": [
          "1",
          "account/deposit"
        ],
        "requiredPatterns": [
          {
            "regex": "audit",
            "flags": ""
          },
          {
            "regex": "intent\\.type",
            "flags": ""
          }
        ]
      },
      {
        "id": "compose",
        "label": "Validation Flow",
        "title": "Compose Validators Into One Check",
        "duration": "9 min",
        "summary": "Finish the track by wiring validators together into a simple field-based validation pass, which feels much closer to a real JavaScript ICF feature.",
        "narrative": [
          "A full ICF validator pass usually means iterating through configured validators for each field and stopping only when every rule succeeds.",
          "Students do not need a full framework yet. They just need to understand how a field registry and reusable validator functions work together.",
          "This module ties the earlier validation modules together into one tiny but realistic flow.",
          "In the template, wrap the combined boolean in a stage result: { ok: true, intent: intent } or { ok: false, errors: [\"Validation failed\"] }."
        ],
        "exampleCode": "const validate = (payload, validators) => {\n  return Object.keys(validators).every((field) => {\n    return validators[field].every((validator) => validator(payload[field]));\n  });\n};",
        "instructionPrompt": "Inside `validate`, loop through each field in the `validators` object and return `true` only when every validator passes for every field.",
        "instructions": [
          "Use `Object.keys(validators)` to iterate through the registered fields.",
          "For each field, use `.every()` so all validators for that field must pass.",
          "When the script runs, the first payload should return `true` and the second should return `false`."
        ],
        "hint": "You need nested `.every()` calls: one for fields, one for the validators in each field array.",
        "why": [
          "This is the moment where folder structure, validator functions, and the shared registry all connect.",
          "A student who can complete this task is finally practicing something close to a real ICF validation path."
        ],
        "starterCode": "const validators = {\n  amount: [\n    (value) => Number(value) >= 10\n  ],\n  displayName: [\n    (value) => typeof value === \"string\" && value.trim().length >= 3\n  ]\n};\n\nconst validate = (payload, validators) => {\n  // Return true only when every field passes every validator\n};\n\nconsole.log(validate({ amount: 25, displayName: \"Ava\" }, validators));\nconsole.log(validate({ amount: 5, displayName: \"Al\" }, validators));",
        "solutionCode": "const validators = {\n  amount: [\n    (value) => Number(value) >= 10\n  ],\n  displayName: [\n    (value) => typeof value === \"string\" && value.trim().length >= 3\n  ]\n};\n\nconst validate = (payload, validators) => {\n  return Object.keys(validators).every((field) => {\n    return validators[field].every((validator) => validator(payload[field]));\n  });\n};\n\nconsole.log(validate({ amount: 25, displayName: \"Ava\" }, validators));\nconsole.log(validate({ amount: 5, displayName: \"Al\" }, validators));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "Object\\.keys\\(validators\\)",
            "flags": ""
          },
          {
            "regex": "\\.every\\(",
            "flags": ""
          }
        ]
      }
    ]
  },
  {
    "id": "composition",
    "title": "Composition",
    "folder": "Intermediate",
    "storageKey": "icf-intermediate-js-course-progress-v1",
    "project": {
      "prompt": "Assemble an intermediate ICF feature that clearly shows core vs domain boundaries, composed validation, richer context, and a reusable final pipeline shape.",
      "checks": [
        {
          "label": "name the intermediate feature clearly",
          "field": "name",
          "keywords": [
            "payment",
            "approval",
            "order",
            "transfer",
            "feature"
          ]
        },
        {
          "label": "describe the request shape and boundaries",
          "field": "intent",
          "keywords": [
            "core",
            "domain",
            "type",
            "payload",
            "map"
          ]
        },
        {
          "label": "include composed validation",
          "field": "validate",
          "keywords": [
            "compose",
            "validator",
            "registry",
            "field",
            "normalize"
          ]
        },
        {
          "label": "include context or policy decisions",
          "field": "context",
          "keywords": [
            "context",
            "policy",
            "authorize",
            "balance",
            "state"
          ]
        },
        {
          "label": "include process plus emit flow",
          "field": "process",
          "keywords": [
            "process",
            "result",
            "audit",
            "emit",
            "pipeline"
          ]
        }
      ]
    },
    "modules": [
      {
        "id": "core-domain-boundaries",
        "label": "Core vs Domain",
        "title": "Separate Shared Pipeline Code From Domain Rules",
        "duration": "7 min",
        "summary": "Intermediate ICF work starts with project boundaries. Students should understand which files belong in shared core utilities and which belong in domain-specific features.",
        "narrative": [
          "A beginner can survive with a few files, but an intermediate JavaScript ICF project needs stronger boundaries. Shared composition helpers should live in core, and feature rules should live in the domain that owns them.",
          "That separation makes reuse safer. It also teaches students that architecture is part of the code, not something separate from it.",
          "This module asks the learner to sort real file paths into a structure that the rest of the course will build on."
        ],
        "exampleCode": "core/\n  composeValidators.js\n  runPipeline.js\ndomain/\n  payments/\n    intents/\n    validators/\n",
        "instructionPrompt": "Inside `buildProjectMap`, return a project map that separates shared core files from domain-specific payment files.",
        "instructions": [
          "Return an object with `core` and `domain` arrays.",
          "Put `composeValidators.js` and `runPipeline.js` in `core`.",
          "Put `payments/validators/hasPositiveAmount.js` in `domain`.",
          "When the script runs, all three logs should be `true`."
        ],
        "hint": "The goal is not complexity. Return one object whose arrays make the boundary obvious.",
        "why": [
          "Intermediate students need to see architecture decisions in the code itself.",
          "A clear core/domain split makes later composition modules much easier to teach."
        ],
        "starterCode": "const buildProjectMap = () => {\n  // Return the core and domain file groups here\n};\n\nconst projectMap = buildProjectMap();\nconsole.log(projectMap.core.includes(\"composeValidators.js\"));\nconsole.log(projectMap.core.includes(\"runPipeline.js\"));\nconsole.log(projectMap.domain.includes(\"payments/validators/hasPositiveAmount.js\"));",
        "solutionCode": "const buildProjectMap = () => {\n  return {\n    core: [\"composeValidators.js\", \"runPipeline.js\"],\n    domain: [\"payments/validators/hasPositiveAmount.js\"]\n  };\n};\n\nconst projectMap = buildProjectMap();\nconsole.log(projectMap.core.includes(\"composeValidators.js\"));\nconsole.log(projectMap.core.includes(\"runPipeline.js\"));\nconsole.log(projectMap.domain.includes(\"payments/validators/hasPositiveAmount.js\"));",
        "expectedLogs": [
          "true",
          "true",
          "true"
        ],
        "requiredPatterns": [
          {
            "regex": "core\\s*:",
            "flags": ""
          },
          {
            "regex": "domain\\s*:",
            "flags": ""
          },
          {
            "regex": "composeValidators\\.js",
            "flags": ""
          }
        ]
      },
      {
        "id": "validator-composer",
        "label": "Validator Composer",
        "title": "Compose Multiple Validators For One Field",
        "duration": "8 min",
        "summary": "Intermediate validation means combining multiple reusable rules for one field instead of writing one oversized validator.",
        "narrative": [
          "A composed validation flow often uses arrays of small validator functions. One function checks presence, another checks format, and another checks a domain-specific rule.",
          "The point is not only reuse. Composition also makes failure order and rule ownership easier to explain.",
          "This task teaches the student to run every validator for a field and return one boolean result."
        ],
        "exampleCode": "const validateField = (value, validators) => validators.every((validator) => validator(value));",
        "instructionPrompt": "Inside `validateField`, return `true` only when every validator in the array passes for the given value.",
        "instructions": [
          "Use the `validators` array that is passed in.",
          "Return the result of `.every()` over the validator functions.",
          "When the script runs, the first log should be `true` and the second should be `false`."
        ],
        "hint": "Each validator already returns `true` or `false`. Your job is to combine them.",
        "why": [
          "This is the first real step from single-rule validation into reusable validation pipelines.",
          "It also sets up the later module where multiple fields run through one shared pipeline."
        ],
        "starterCode": "const required = (value) => value !== \"\";\nconst minLength = (min) => (value) => value.length >= min;\n\nconst validateField = (value, validators) => {\n  // Return true only when every validator passes\n};\n\nconsole.log(validateField(\"Ava\", [required, minLength(3)]));\nconsole.log(validateField(\"Al\", [required, minLength(3)]));",
        "solutionCode": "const required = (value) => value !== \"\";\nconst minLength = (min) => (value) => value.length >= min;\n\nconst validateField = (value, validators) => {\n  return validators.every((validator) => validator(value));\n};\n\nconsole.log(validateField(\"Ava\", [required, minLength(3)]));\nconsole.log(validateField(\"Al\", [required, minLength(3)]));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "validators\\.every\\(",
            "flags": ""
          },
          {
            "regex": "validator\\(value\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "normalize-pipeline",
        "label": "Normalize Chain",
        "title": "Chain Reusable Normalizers",
        "duration": "8 min",
        "summary": "Intermediate ICF normalization often means running a payload through several tiny transforms instead of one opaque cleanup block.",
        "narrative": [
          "A reusable normalizer chain keeps payload cleanup explicit. One function trims strings, another coerces numbers, and a third may standardize case.",
          "The important skill is learning to pass the result of one normalizer into the next.",
          "That gives the learner a realistic pattern for larger JavaScript ICF projects."
        ],
        "exampleCode": "const runNormalizers = (payload, normalizers) => normalizers.reduce((current, normalizer) => normalizer(current), payload);",
        "instructionPrompt": "Use `.reduce()` so each normalizer receives the payload returned by the previous normalizer.",
        "instructions": [
          "Return the result of reducing over `normalizers`.",
          "Pass the current payload into each `normalizer`.",
          "When the script runs, the first log should be `ava` and the second should be `15`."
        ],
        "hint": "Start the reducer with the original `payload` as the initial value.",
        "why": [
          "This is the reusable normalization pattern that separates intermediate code from ad hoc beginner cleanup.",
          "Students should leave this module understanding that normalizers can be chained like validators."
        ],
        "starterCode": "const trimName = (payload) => ({ ...payload, displayName: payload.displayName.trim() });\nconst parseAmount = (payload) => ({ ...payload, amount: Number(payload.amount) });\nconst lowerName = (payload) => ({ ...payload, displayName: payload.displayName.toLowerCase() });\n\nconst runNormalizers = (payload, normalizers) => {\n  // Chain the normalizers here\n};\n\nconst normalized = runNormalizers({ displayName: \"  Ava  \", amount: \"15\" }, [trimName, parseAmount, lowerName]);\nconsole.log(normalized.displayName);\nconsole.log(normalized.amount);",
        "solutionCode": "const trimName = (payload) => ({ ...payload, displayName: payload.displayName.trim() });\nconst parseAmount = (payload) => ({ ...payload, amount: Number(payload.amount) });\nconst lowerName = (payload) => ({ ...payload, displayName: payload.displayName.toLowerCase() });\n\nconst runNormalizers = (payload, normalizers) => {\n  return normalizers.reduce((current, normalizer) => normalizer(current), payload);\n};\n\nconst normalized = runNormalizers({ displayName: \"  Ava  \", amount: \"15\" }, [trimName, parseAmount, lowerName]);\nconsole.log(normalized.displayName);\nconsole.log(normalized.amount);",
        "expectedLogs": [
          "ava",
          "15"
        ],
        "requiredPatterns": [
          {
            "regex": "normalizers\\.reduce\\(",
            "flags": ""
          },
          {
            "regex": "normalizer\\(current\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "context-factory",
        "label": "Context Factory",
        "title": "Build Derived Context For Policy Decisions",
        "duration": "8 min",
        "summary": "Intermediate context should include derived flags that make authorization rules shorter and easier to trust.",
        "narrative": [
          "Derived context is the difference between reading raw state and reading decision-ready signals. Instead of letting authorization repeat the same lookups, build those signals once.",
          "This module teaches a small context factory that calculates whether the actor can charge a payment right now.",
          "That pattern becomes useful any time the same rule is needed in more than one place."
        ],
        "exampleCode": "const buildContext = (state, intent) => ({ actorRole: state.session.role, amount: intent.payload.amount, canCharge: state.session.role === \"manager\" && state.account.balance >= intent.payload.amount });",
        "instructionPrompt": "Return a context object with `actorRole`, `amount`, and a derived `canCharge` flag.",
        "instructions": [
          "Include `actorRole` from `state.session.role`.",
          "Include `amount` from `intent.payload.amount`.",
          "Set `canCharge` to `true` only when the role is `manager` and the balance covers the amount.",
          "When the script runs, the output should be `manager` and `true`."
        ],
        "hint": "Build the derived flag inside the returned object so the next stage receives a ready-to-use policy signal.",
        "why": [
          "This module shows how to keep authorization readable by moving repeated lookups into context.",
          "It also teaches that context can safely contain both raw and derived values."
        ],
        "starterCode": "const buildContext = (state, intent) => {\n  // Return context with actorRole, amount, and canCharge\n};\n\nconst context = buildContext(\n  { session: { role: \"manager\" }, account: { balance: 200 } },\n  { payload: { amount: 120 } }\n);\n\nconsole.log(context.actorRole);\nconsole.log(context.canCharge);",
        "solutionCode": "const buildContext = (state, intent) => {\n  return {\n    actorRole: state.session.role,\n    amount: intent.payload.amount,\n    canCharge: state.session.role === \"manager\" && state.account.balance >= intent.payload.amount\n  };\n};\n\nconst context = buildContext(\n  { session: { role: \"manager\" }, account: { balance: 200 } },\n  { payload: { amount: 120 } }\n);\n\nconsole.log(context.actorRole);\nconsole.log(context.canCharge);",
        "expectedLogs": [
          "manager",
          "true"
        ],
        "requiredPatterns": [
          {
            "regex": "canCharge",
            "flags": ""
          },
          {
            "regex": "state\\.session\\.role\\s*===\\s*\\\"manager\\\"",
            "flags": ""
          }
        ]
      },
      {
        "id": "authorize-policies",
        "label": "Policy Auth",
        "title": "Authorize With A Policy Table",
        "duration": "7 min",
        "summary": "Intermediate authorization often reads better as a named policy table than one hard-coded conditional per intent.",
        "narrative": [
          "A policy table keeps authorization discoverable. Each intent type maps to a small rule function, and the authorization stage can look up the rule it needs.",
          "This teaches the learner to separate rule registration from rule execution.",
          "That pattern becomes especially useful when several intents share one authorization stage."
        ],
        "exampleCode": "const authorize = (context, policies, intentType) => policies[intentType](context);",
        "instructionPrompt": "Inside `authorize`, run the correct policy from the `policies` table using `intentType`.",
        "instructions": [
          "Read the policy function from `policies[intentType]`.",
          "Pass `context` into that policy function.",
          "When the script runs, the first log should be `true` and the second should be `false`."
        ],
        "hint": "The policy table is already built for you. This module is about calling the right function cleanly.",
        "why": [
          "Policy tables make authorization easier to grow without scattering rule code across the project.",
          "This is one of the simplest architecture upgrades a student can learn at the intermediate level."
        ],
        "starterCode": "const policies = {\n  \"payments/charge\": (context) => context.canCharge,\n  \"payments/refund\": (context) => context.actorRole === \"manager\"\n};\n\nconst authorize = (context, policies, intentType) => {\n  // Run the matching policy here\n};\n\nconsole.log(authorize({ canCharge: true }, policies, \"payments/charge\"));\nconsole.log(authorize({ canCharge: false }, policies, \"payments/charge\"));",
        "solutionCode": "const policies = {\n  \"payments/charge\": (context) => context.canCharge,\n  \"payments/refund\": (context) => context.actorRole === \"manager\"\n};\n\nconst authorize = (context, policies, intentType) => {\n  return policies[intentType](context);\n};\n\nconsole.log(authorize({ canCharge: true }, policies, \"payments/charge\"));\nconsole.log(authorize({ canCharge: false }, policies, \"payments/charge\"));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "policies\\[intentType\\]",
            "flags": ""
          },
          {
            "regex": "\\(context\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "processor-steps",
        "label": "Processor Chain",
        "title": "Run A Multi-Step Processor Pipeline",
        "duration": "9 min",
        "summary": "Intermediate process logic often needs more than one step. Students should practice chaining processors while keeping new-state semantics intact.",
        "narrative": [
          "A processor chain is like a normalizer chain for state transitions. Each processor receives the current state and returns the next state.",
          "That lets a larger feature stay readable: one step reserves funds, another records a payment, and another updates status.",
          "This module keeps the example small but introduces the exact composition habit students will need later."
        ],
        "exampleCode": "const runProcessors = (state, processors) => processors.reduce((current, processor) => processor(current), state);",
        "instructionPrompt": "Use `.reduce()` to pass the current state through every processor in order.",
        "instructions": [
          "Return the result of reducing over `processors`.",
          "Each `processor` should receive the current state.",
          "When the script runs, the first log should be `95` and the second should be `paid`."
        ],
        "hint": "This is the same composition pattern as normalizers, but now each function returns state instead of payload.",
        "why": [
          "Students need to feel how multi-step process logic can stay explicit without collapsing into one giant function.",
          "This module is the bridge between single-step processing and advanced orchestration."
        ],
        "starterCode": "const subtractFee = (state) => ({ ...state, balance: state.balance - 5 });\nconst markPaid = (state) => ({ ...state, status: \"paid\" });\n\nconst runProcessors = (state, processors) => {\n  // Chain the processors here\n};\n\nconst nextState = runProcessors({ balance: 100, status: \"pending\" }, [subtractFee, markPaid]);\nconsole.log(nextState.balance);\nconsole.log(nextState.status);",
        "solutionCode": "const subtractFee = (state) => ({ ...state, balance: state.balance - 5 });\nconst markPaid = (state) => ({ ...state, status: \"paid\" });\n\nconst runProcessors = (state, processors) => {\n  return processors.reduce((current, processor) => processor(current), state);\n};\n\nconst nextState = runProcessors({ balance: 100, status: \"pending\" }, [subtractFee, markPaid]);\nconsole.log(nextState.balance);\nconsole.log(nextState.status);",
        "expectedLogs": [
          "95",
          "paid"
        ],
        "requiredPatterns": [
          {
            "regex": "processors\\.reduce\\(",
            "flags": ""
          },
          {
            "regex": "processor\\(current\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "audit-envelopes",
        "label": "Audit Detail",
        "title": "Add Useful Audit Detail To A Result",
        "duration": "8 min",
        "summary": "Intermediate audit work should capture more than an intent type. It should include status and a useful timestamp for later investigation.",
        "narrative": [
          "A thin audit trail is better than nothing, but intermediate students should learn to record enough detail to understand a run later.",
          "That usually means an object with a type, status, and timestamp at minimum.",
          "This module keeps the audit step small while teaching the idea of operationally useful output."
        ],
        "exampleCode": "const appendAudit = (audit, entry) => audit.concat(entry);",
        "instructionPrompt": "Return a new audit array that appends one entry with `type`, `status`, and `recordedAt`.",
        "instructions": [
          "Use `audit.concat()` to return a new array.",
          "Set `status` to `\"accepted\"`.",
          "Set `recordedAt` with `Date.now()`.",
          "When the script runs, the output should be `1` and `accepted`."
        ],
        "hint": "You only need to append one object. Keep the entry structure explicit.",
        "why": [
          "This is the first place students see audit as an operational tool instead of just a log message.",
          "It prepares them for the advanced track where observability matters even more."
        ],
        "starterCode": "const appendAudit = (audit, intent) => {\n  // Return a new audit array with one detailed entry\n};\n\nconst audit = appendAudit([], { type: \"payments/charge\" });\nconsole.log(audit.length);\nconsole.log(audit[0].status);",
        "solutionCode": "const appendAudit = (audit, intent) => {\n  return audit.concat({\n    type: intent.type,\n    status: \"accepted\",\n    recordedAt: Date.now()\n  });\n};\n\nconst audit = appendAudit([], { type: \"payments/charge\" });\nconsole.log(audit.length);\nconsole.log(audit[0].status);",
        "expectedLogs": [
          "1",
          "accepted"
        ],
        "requiredPatterns": [
          {
            "regex": "concat\\(",
            "flags": ""
          },
          {
            "regex": "recordedAt\\s*:\\s*Date\\.now\\(\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "feature-pipeline",
        "label": "Feature Runner",
        "title": "Run A Full Intermediate Feature Pipeline",
        "duration": "10 min",
        "summary": "Finish the track by connecting validation, normalization, authorization, and processing into one compact feature runner.",
        "narrative": [
          "Intermediate students need one module where the stage pieces connect. The goal is not a giant framework. It is one readable function that proves the student understands composition.",
          "This runner checks authorization, then returns either a rejected result or a processed result.",
          "That gives the student a realistic picture of how intermediate ICF code starts to feel in practice."
        ],
        "exampleCode": "const runFeature = (context, process) => context.canCharge ? process() : { ok: false, reason: \"blocked\" };",
        "instructionPrompt": "Inside `runFeature`, return a blocked result when `context.canCharge` is false; otherwise return the result of `process()`.",
        "instructions": [
          "Check `context.canCharge` first.",
          "Return `{ ok: false, reason: \"blocked\" }` when the action is not allowed.",
          "Otherwise return `process()`.",
          "When the script runs, the first log should be `true` and the second should be `blocked`."
        ],
        "hint": "This module is about stage order. Authorization should decide whether process runs at all.",
        "why": [
          "This final module proves the student can connect intermediate stage responsibilities instead of only writing isolated helpers.",
          "It also sets up the advanced track, where the same idea scales up into orchestration and reliability decisions."
        ],
        "starterCode": "const runFeature = (context, process) => {\n  // Return a blocked result or run process()\n};\n\nconsole.log(runFeature({ canCharge: true }, () => ({ ok: true })).ok);\nconsole.log(runFeature({ canCharge: false }, () => ({ ok: true })).reason);",
        "solutionCode": "const runFeature = (context, process) => {\n  if (!context.canCharge) {\n    return { ok: false, reason: \"blocked\" };\n  }\n\n  return process();\n};\n\nconsole.log(runFeature({ canCharge: true }, () => ({ ok: true })).ok);\nconsole.log(runFeature({ canCharge: false }, () => ({ ok: true })).reason);",
        "expectedLogs": [
          "true",
          "blocked"
        ],
        "requiredPatterns": [
          {
            "regex": "!context\\.canCharge",
            "flags": ""
          },
          {
            "regex": "process\\(\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "field-registry-runner",
        "label": "Field Runner",
        "title": "Run A Validator Registry Across Multiple Fields",
        "duration": "9 min",
        "summary": "Students should practice taking a validator registry and applying it across every field in a payload, not just one field at a time.",
        "narrative": [
          "This module is where composed validation starts feeling more like a real feature. Instead of testing one value, the student loops through a registry of field validators.",
          "That reinforces why intermediate ICF architecture uses shared registries and small validator functions together.",
          "The goal is to return one boolean that represents the whole payload check."
        ],
        "exampleCode": "const validatePayload = (payload, registry) => Object.keys(registry).every((field) => registry[field].every((validator) => validator(payload[field])));",
        "instructionPrompt": "Use `Object.keys(registry)` and nested `.every()` calls to validate the full payload.",
        "instructions": [
          "Iterate through every field in `registry`.",
          "For each field, run every validator against `payload[field]`.",
          "Return `true` only when every field passes every validator.",
          "When the script runs, the first log should be `true` and the second should be `false`."
        ],
        "hint": "This is the registry version of the earlier `validateField` module.",
        "why": [
          "This module makes the jump from one validator chain to a reusable validation system.",
          "Students who can complete this are much closer to building real intent validation."
        ],
        "practice": [
          "Add a third field to the registry and describe how the function would scale.",
          "Explain why a shared registry is easier to inspect than custom validation inside each intent.",
          "Change one payload field so only one validator fails and predict the result before running."
        ],
        "starterCode": "const registry = {\n  displayName: [(value) => value.length >= 3],\n  amount: [(value) => value >= 10]\n};\n\nconst validatePayload = (payload, registry) => {\n  // Return true only when every field passes every validator\n};\n\nconsole.log(validatePayload({ displayName: \"Ava\", amount: 25 }, registry));\nconsole.log(validatePayload({ displayName: \"Al\", amount: 25 }, registry));",
        "solutionCode": "const registry = {\n  displayName: [(value) => value.length >= 3],\n  amount: [(value) => value >= 10]\n};\n\nconst validatePayload = (payload, registry) => {\n  return Object.keys(registry).every((field) => {\n    return registry[field].every((validator) => validator(payload[field]));\n  });\n};\n\nconsole.log(validatePayload({ displayName: \"Ava\", amount: 25 }, registry));\nconsole.log(validatePayload({ displayName: \"Al\", amount: 25 }, registry));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "Object\\.keys\\(registry\\)",
            "flags": ""
          },
          {
            "regex": "registry\\[field\\]\\.every\\(",
            "flags": ""
          }
        ]
      },
      {
        "id": "result-envelope",
        "label": "Result Envelope",
        "title": "Return A Standard Rejection Result",
        "duration": "7 min",
        "summary": "Intermediate systems benefit from consistent result shapes, especially when validation or authorization rejects a run.",
        "narrative": [
          "A standard result envelope makes downstream code easier to read. Instead of guessing what a failed stage returns, every caller can rely on the same shape.",
          "This module uses a simple rejection helper with `ok`, `stage`, and `errors` fields.",
          "That is a small architecture choice with a big readability payoff."
        ],
        "exampleCode": "const reject = (stage, errors) => ({ ok: false, stage, errors });",
        "instructionPrompt": "Return a rejection object with `ok: false`, the failing `stage`, and the provided `errors` array.",
        "instructions": [
          "Return an object from `reject`.",
          "Set `ok` to `false`.",
          "Include the `stage` argument and the `errors` argument.",
          "When the script runs, the output should be `false` and `validate`."
        ],
        "hint": "Keep the envelope shape simple and reusable.",
        "why": [
          "Students need to see that consistency is part of architecture, not just a style choice.",
          "This result shape becomes useful in larger feature runners and test harnesses."
        ],
        "practice": [
          "Add a `reasonCode` field and explain when that extra detail would help.",
          "Compare this rejection result to returning a raw string and explain which is easier to maintain.",
          "Say which ICF stages might reasonably return this kind of result envelope."
        ],
        "starterCode": "const reject = (stage, errors) => {\n  // Return the rejection envelope here\n};\n\nconst result = reject(\"validate\", [\"amount too low\"]);\nconsole.log(result.ok);\nconsole.log(result.stage);",
        "solutionCode": "const reject = (stage, errors) => {\n  return {\n    ok: false,\n    stage,\n    errors\n  };\n};\n\nconst result = reject(\"validate\", [\"amount too low\"]);\nconsole.log(result.ok);\nconsole.log(result.stage);",
        "expectedLogs": [
          "false",
          "validate"
        ],
        "requiredPatterns": [
          {
            "regex": "ok\\s*:\\s*false",
            "flags": ""
          },
          {
            "regex": "stage",
            "flags": ""
          },
          {
            "regex": "errors",
            "flags": ""
          }
        ]
      },
      {
        "id": "pipeline-composer",
        "label": "Pipeline Composer",
        "title": "Compose the first two stages in the right order",
        "duration": "10 min",
        "summary": "Practice Validate → Normalize as a focused slice. A complete Intent still requires all six stages.",
        "narrative": [
          "Check the raw input before cleaning it. The validator can inspect a trimmed value to enforce a length rule without changing the payload.",
          "Return null on failure; otherwise return normalize(payload). These are deliberately simplified helper returns, not the full runner contract.",
          "For a project, use the template runner and add explicit AddContext, Authorize, Process, and Emit groups."
        ],
        "exampleCode": "function runPipeline(payload, normalize, validate) {\n  if (!validate(payload)) { return null; }\n  return normalize(payload);\n}",
        "instructionPrompt": "Call validate(payload) first. Return null if it fails; otherwise return normalize(payload).",
        "instructions": [
          "Validate the raw payload before normalization.",
          "Return null when validation fails.",
          "Normalize only after validation succeeds."
        ],
        "hint": "A guard clause handles invalid input before any cleanup.",
        "why": [
          "This reinforces composition and stage order before the student moves into advanced orchestration topics.",
          "It also gives the student a second full-flow exercise, not just isolated helpers."
        ],
        "practice": [
          "Pass an object with no displayName. It should fail without throwing.",
          "Explain why this two-stage slice is not a complete Intent."
        ],
        "starterCode": "function normalize(payload) { return { displayName: payload.displayName.trim().toUpperCase() }; }\nfunction validate(payload) { return typeof payload.displayName === \"string\" && payload.displayName.trim().length >= 3; }\n\nfunction runPipeline(payload, normalize, validate) {\n  // Check first, then clean.\n}\n\nconsole.log(runPipeline({ displayName: \" ava \" }, normalize, validate).displayName);\nconsole.log(runPipeline({ displayName: \" a \" }, normalize, validate));",
        "solutionCode": "function normalize(payload) { return { displayName: payload.displayName.trim().toUpperCase() }; }\nfunction validate(payload) { return typeof payload.displayName === \"string\" && payload.displayName.trim().length >= 3; }\n\nfunction runPipeline(payload, normalize, validate) {\n  if (!validate(payload)) { return null; }\n  return normalize(payload);\n}\nconsole.log(runPipeline({ displayName: \" ava \" }, normalize, validate).displayName);\nconsole.log(runPipeline({ displayName: \" a \" }, normalize, validate));",
        "expectedLogs": [
          "AVA",
          "null"
        ],
        "requiredPatterns": [],
        "behaviorChecks": "var order = []; runPipeline({}, function(p) { order.push(\"Normalize\"); return p; }, function() { order.push(\"Validate\"); return true; }); if (order.join() !== \"Validate,Normalize\") throw new Error(\"Validate must run before Normalize.\"); var called = false; runPipeline({}, function(p) { called = true; return p; }, function() { return false; }); if (called) throw new Error(\"Stop immediately when validation fails.\");"
      }
    ]
  },
  {
    "id": "advanced",
    "title": "Advanced",
    "folder": "Advanced",
    "storageKey": "icf-advanced-js-course-progress-v1",
    "project": {
      "prompt": "Design an advanced workflow that shows orchestration, reliability decisions, observability, and safe emit behavior for a production-style ICF system.",
      "checks": [
        {
          "label": "name the advanced workflow clearly",
          "field": "name",
          "keywords": [
            "workflow",
            "payout",
            "settlement",
            "incident",
            "orchestration"
          ]
        },
        {
          "label": "describe the workflow request and dependencies",
          "field": "intent",
          "keywords": [
            "workflow",
            "dependency",
            "service",
            "request",
            "map"
          ]
        },
        {
          "label": "include reliability or validation gates",
          "field": "validate",
          "keywords": [
            "retry",
            "risk",
            "idempotent",
            "validate",
            "budget"
          ]
        },
        {
          "label": "include runtime context or authorization",
          "field": "context",
          "keywords": [
            "context",
            "risk",
            "policy",
            "authorize",
            "signal"
          ]
        },
        {
          "label": "include process plus emit operations",
          "field": "process",
          "keywords": [
            "process",
            "audit",
            "emit",
            "manual-review",
            "observe"
          ]
        }
      ]
    },
    "modules": [
      {
        "id": "orchestrator-map",
        "label": "Orchestration Map",
        "title": "Register A Workflow Map For Large Intent Runs",
        "duration": "8 min",
        "summary": "Advanced ICF work often coordinates several handlers. Students should learn to keep that orchestration visible instead of hiding it inside one mega-intent.",
        "narrative": [
          "At scale, orchestration is about named responsibilities. One intent might reserve funds, another might write an audit record, and another might trigger notifications.",
          "The important lesson is visibility. Reviewers should be able to look at one workflow map and understand the major steps.",
          "This module starts advanced work with a simple workflow registration object."
        ],
        "exampleCode": "const workflows = { settleTournament: [\"reserveFunds\", \"writePayouts\", \"emitNotifications\"] };",
        "instructionPrompt": "Return a workflow map with a `settleTournament` array that lists the major orchestration steps.",
        "instructions": [
          "Return an object with a `settleTournament` key.",
          "That key should point to an array containing `reserveFunds`, `writePayouts`, and `emitNotifications`.",
          "When the script runs, the output should be `3` and `writePayouts`."
        ],
        "hint": "The point is named coordination, not executable code yet.",
        "why": [
          "A visible workflow map teaches ownership and order in one glance.",
          "This is the cleanest first step into orchestration thinking."
        ],
        "starterCode": "const buildWorkflows = () => {\n  // Return the workflow map here\n};\n\nconst workflows = buildWorkflows();\nconsole.log(workflows.settleTournament.length);\nconsole.log(workflows.settleTournament[1]);",
        "solutionCode": "const buildWorkflows = () => {\n  return {\n    settleTournament: [\"reserveFunds\", \"writePayouts\", \"emitNotifications\"]\n  };\n};\n\nconst workflows = buildWorkflows();\nconsole.log(workflows.settleTournament.length);\nconsole.log(workflows.settleTournament[1]);",
        "expectedLogs": [
          "3",
          "writePayouts"
        ],
        "requiredPatterns": [
          {
            "regex": "settleTournament",
            "flags": ""
          },
          {
            "regex": "emitNotifications",
            "flags": ""
          }
        ]
      },
      {
        "id": "dependency-graph",
        "label": "Dependencies",
        "title": "Expose The Dependencies A Workflow Needs",
        "duration": "8 min",
        "summary": "Advanced systems should not hide critical dependencies. Students should practice listing the services a workflow depends on.",
        "narrative": [
          "When a system depends on a payout service, audit store, and notification service, those dependencies should be explicit. Hidden dependencies make production review weak.",
          "A simple dependency object is enough to teach the habit.",
          "This module keeps the structure small so the student focuses on visibility instead of ceremony."
        ],
        "exampleCode": "const dependencies = { payoutStore, auditStore, notifier };",
        "instructionPrompt": "Return a dependency object that names the services this workflow depends on.",
        "instructions": [
          "Return an object with `payoutStore`, `auditStore`, and `notifier` keys.",
          "Map those keys to the provided values.",
          "When the script runs, the output should be `true` and `true`."
        ],
        "hint": "Advanced architecture gets easier to review when dependencies are named plainly.",
        "why": [
          "This teaches students to expose what a workflow needs before they talk about failure handling.",
          "Dependency visibility is a core production-readiness habit."
        ],
        "starterCode": "const buildDependencies = (payoutStore, auditStore, notifier) => {\n  // Return the dependency object here\n};\n\nconst deps = buildDependencies({ name: \"payout\" }, { name: \"audit\" }, { name: \"notify\" });\nconsole.log(Object.prototype.hasOwnProperty.call(deps, \"payoutStore\"));\nconsole.log(Object.prototype.hasOwnProperty.call(deps, \"notifier\"));",
        "solutionCode": "const buildDependencies = (payoutStore, auditStore, notifier) => {\n  return {\n    payoutStore,\n    auditStore,\n    notifier\n  };\n};\n\nconst deps = buildDependencies({ name: \"payout\" }, { name: \"audit\" }, { name: \"notify\" });\nconsole.log(Object.prototype.hasOwnProperty.call(deps, \"payoutStore\"));\nconsole.log(Object.prototype.hasOwnProperty.call(deps, \"notifier\"));",
        "expectedLogs": [
          "true",
          "true"
        ],
        "requiredPatterns": [
          {
            "regex": "payoutStore",
            "flags": ""
          },
          {
            "regex": "auditStore",
            "flags": ""
          },
          {
            "regex": "notifier",
            "flags": ""
          }
        ]
      },
      {
        "id": "failure-strategy",
        "label": "Failure Paths",
        "title": "Classify Failures Before The Run Continues",
        "duration": "8 min",
        "summary": "Advanced systems need visible failure handling. Students should practice distinguishing retryable errors from critical stops.",
        "narrative": [
          "Not every failure should be treated the same. A network timeout may be retryable, while a mismatched payout total may require an immediate halt.",
          "This module teaches classification first, because you cannot design a recovery strategy without naming the category of failure.",
          "That makes later incident reasoning far more concrete."
        ],
        "exampleCode": "const classifyFailure = (error) => error.retryable ? \"retry\" : \"halt\";",
        "instructionPrompt": "Return `\"retry\"` when the error is retryable and `\"halt\"` when it is not.",
        "instructions": [
          "Check `error.retryable`.",
          "Return `\"retry\"` for retryable errors.",
          "Return `\"halt\"` for non-retryable errors.",
          "When the script runs, the output should be `retry` and `halt`."
        ],
        "hint": "This is intentionally small. The lesson is to make the failure category explicit.",
        "why": [
          "Production systems become easier to trust when failure categories are clear.",
          "This gives students a visible transition from vague error handling into policy-based reliability."
        ],
        "starterCode": "const classifyFailure = (error) => {\n  // Return retry or halt here\n};\n\nconsole.log(classifyFailure({ retryable: true }));\nconsole.log(classifyFailure({ retryable: false }));",
        "solutionCode": "const classifyFailure = (error) => {\n  return error.retryable ? \"retry\" : \"halt\";\n};\n\nconsole.log(classifyFailure({ retryable: true }));\nconsole.log(classifyFailure({ retryable: false }));",
        "expectedLogs": [
          "retry",
          "halt"
        ],
        "requiredPatterns": [
          {
            "regex": "retryable",
            "flags": ""
          },
          {
            "regex": "\"retry\"",
            "flags": ""
          },
          {
            "regex": "\"halt\"",
            "flags": ""
          }
        ]
      },
      {
        "id": "retry-gate",
        "label": "Retry Gate",
        "title": "Stop Retries After The Configured Limit",
        "duration": "8 min",
        "summary": "Advanced reliability is not just about retrying. It is about knowing when to stop and escalate.",
        "narrative": [
          "A retry policy should be visible and bounded. Otherwise a system can loop pointlessly and hide that it is in trouble.",
          "This module uses a tiny gate function to teach the student to compare attempts against a configured maximum.",
          "That is one of the simplest but most important production patterns in the whole track."
        ],
        "exampleCode": "const canRetry = (attemptCount, maxRetries) => attemptCount < maxRetries;",
        "instructionPrompt": "Return `true` only when the current attempt count is still below the retry limit.",
        "instructions": [
          "Compare `attemptCount` against `maxRetries`.",
          "Return `true` only while more retries are allowed.",
          "When the script runs, the output should be `true` and `false`."
        ],
        "hint": "Use a strict less-than check so the limit is respected exactly.",
        "why": [
          "Bounded retries are one of the clearest signs that a system has intentional failure behavior.",
          "This module teaches the student to treat retries like a policy, not an impulse."
        ],
        "starterCode": "const canRetry = (attemptCount, maxRetries) => {\n  // Return true only while retries remain\n};\n\nconsole.log(canRetry(1, 3));\nconsole.log(canRetry(3, 3));",
        "solutionCode": "const canRetry = (attemptCount, maxRetries) => {\n  return attemptCount < maxRetries;\n};\n\nconsole.log(canRetry(1, 3));\nconsole.log(canRetry(3, 3));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "attemptCount\\s*<",
            "flags": ""
          },
          {
            "regex": "maxRetries",
            "flags": ""
          }
        ]
      },
      {
        "id": "audit-observability",
        "label": "Observability",
        "title": "Create An Audit Record That Can Reconstruct A Run",
        "duration": "9 min",
        "summary": "Advanced audit should help an operator reconstruct what happened, not just confirm that something ran.",
        "narrative": [
          "A useful audit record needs more than a type string. It should include status, duration, and a correlation id or run id.",
          "Those fields turn a log into a reconstruction tool.",
          "This module gives the student one small object to build that already feels much more production-ready."
        ],
        "exampleCode": "const auditRecord = { runId, status, durationMs, intentType };",
        "instructionPrompt": "Return an audit record with `runId`, `status`, `durationMs`, and `intentType`.",
        "instructions": [
          "Return an object with all four fields.",
          "Map `intentType` from `intent.type`.",
          "When the script runs, the output should be `accepted` and `120`."
        ],
        "hint": "This is a pure object-construction task. Focus on the fields an operator would need later.",
        "why": [
          "Students should start thinking like operators, not only like feature authors.",
          "This is the module where audit becomes observability."
        ],
        "starterCode": "const buildAuditRecord = (runId, status, durationMs, intent) => {\n  // Return the audit record here\n};\n\nconst record = buildAuditRecord(\"run-1\", \"accepted\", 120, { type: \"tournament/settle\" });\nconsole.log(record.status);\nconsole.log(record.durationMs);",
        "solutionCode": "const buildAuditRecord = (runId, status, durationMs, intent) => {\n  return {\n    runId,\n    status,\n    durationMs,\n    intentType: intent.type\n  };\n};\n\nconst record = buildAuditRecord(\"run-1\", \"accepted\", 120, { type: \"tournament/settle\" });\nconsole.log(record.status);\nconsole.log(record.durationMs);",
        "expectedLogs": [
          "accepted",
          "120"
        ],
        "requiredPatterns": [
          {
            "regex": "durationMs",
            "flags": ""
          },
          {
            "regex": "intentType\\s*:\\s*intent\\.type",
            "flags": ""
          }
        ]
      },
      {
        "id": "finalize-ops",
        "label": "Emit Ops",
        "title": "Emit With Focused Operational Follow-Through",
        "duration": "8 min",
        "summary": "Advanced emit should do focused follow-through like notifications and audit appends, not absorb the whole workflow.",
        "narrative": [
          "A production emit step often returns the result plus a list of operational follow-through actions. That keeps the follow-up visible.",
          "This module teaches a compact pattern: return the business result and a short array of post-success actions.",
          "That reinforces emit as structured follow-through rather than a dumping ground."
        ],
        "exampleCode": "const emitRun = (result) => ({ result, ops: [\"writeAudit\", \"notifyOps\"] });",
        "instructionPrompt": "Return an object with `result` and an `ops` array containing `writeAudit` and `notifyOps`.",
        "instructions": [
          "Return an object with `result` and `ops`.",
          "Set `ops` to an array with `writeAudit` and `notifyOps`.",
          "When the script runs, the output should be `2` and `notifyOps`."
        ],
        "hint": "Keep emit focused on explicit post-success actions.",
        "why": [
          "This module gives students a disciplined emit pattern they can reuse in real design reviews.",
          "It also reinforces that operational work should be visible and scoped."
        ],
        "starterCode": "const emitRun = (result) => {\n  // Return result plus focused operational actions\n};\n\nconst emitd = emitRun({ ok: true });\nconsole.log(emitd.ops.length);\nconsole.log(emitd.ops[1]);",
        "solutionCode": "const emitRun = (result) => {\n  return {\n    result,\n    ops: [\"writeAudit\", \"notifyOps\"]\n  };\n};\n\nconst emitd = emitRun({ ok: true });\nconsole.log(emitd.ops.length);\nconsole.log(emitd.ops[1]);",
        "expectedLogs": [
          "2",
          "notifyOps"
        ],
        "requiredPatterns": [
          {
            "regex": "ops\\s*:",
            "flags": ""
          },
          {
            "regex": "writeAudit",
            "flags": ""
          },
          {
            "regex": "notifyOps",
            "flags": ""
          }
        ]
      },
      {
        "id": "incident-summary",
        "label": "Incident View",
        "title": "Summarize An Incident For Operators",
        "duration": "8 min",
        "summary": "Production-ready systems should be able to summarize what failed in a way an operator can understand quickly.",
        "narrative": [
          "A good incident summary is short but concrete. It should name the run, the failure class, and the next action.",
          "This module teaches a summary string builder because it forces the learner to decide which details matter most.",
          "That is a practical operator-thinking skill, not just a coding exercise."
        ],
        "exampleCode": "const summarizeIncident = (incident) => `${incident.runId}: ${incident.failureClass} -> ${incident.nextAction}`;",
        "instructionPrompt": "Return a summary string in the format `runId: failureClass -> nextAction`.",
        "instructions": [
          "Build the string from `incident.runId`, `incident.failureClass`, and `incident.nextAction`.",
          "Use the exact separator format shown in the prompt.",
          "When the script runs, the output should be `run-9: retry -> queue-manual-review`."
        ],
        "hint": "A template literal is the simplest way to build this string cleanly.",
        "why": [
          "Students should learn to translate system detail into an operator-facing summary.",
          "This is the clearest bridge between code structure and incident response communication."
        ],
        "starterCode": "const summarizeIncident = (incident) => {\n  // Return the summary string here\n};\n\nconsole.log(summarizeIncident({ runId: \"run-9\", failureClass: \"retry\", nextAction: \"queue-manual-review\" }));",
        "solutionCode": "const summarizeIncident = (incident) => {\n  return `${incident.runId}: ${incident.failureClass} -> ${incident.nextAction}`;\n};\n\nconsole.log(summarizeIncident({ runId: \"run-9\", failureClass: \"retry\", nextAction: \"queue-manual-review\" }));",
        "expectedLogs": [
          "run-9: retry -> queue-manual-review"
        ],
        "requiredPatterns": [
          {
            "regex": "\\$\\{incident\\.runId\\}",
            "flags": ""
          },
          {
            "regex": "\\$\\{incident\\.failureClass\\}",
            "flags": ""
          },
          {
            "regex": "\\$\\{incident\\.nextAction\\}",
            "flags": ""
          }
        ]
      },
      {
        "id": "production-runner",
        "label": "Production Runner",
        "title": "Gate A Production Run Before Emit Executes",
        "duration": "10 min",
        "summary": "Finish the advanced track by wiring together the main production idea: a run should halt on critical failure and only emit when the core result is safe.",
        "narrative": [
          "This final module combines the lessons of the track. A production run should not blindly emit after a critical failure.",
          "The student practices one simple contract: return a halted result when `failureClass` is `halt`, otherwise call `emit(result)`.",
          "That is a compact version of advanced orchestration, reliability, and emit discipline working together."
        ],
        "exampleCode": "const runProductionFlow = (result, emit) => result.failureClass === \"halt\" ? { ok: false, status: \"halted\" } : emit(result);",
        "instructionPrompt": "Return a halted result when `result.failureClass === \"halt\"`; otherwise return `emit(result)`.",
        "instructions": [
          "Check the `failureClass` on the incoming `result`.",
          "Return `{ ok: false, status: \"halted\" }` for halting failures.",
          "Otherwise call `emit(result)`.",
          "When the script runs, the first log should be `emitd` and the second should be `halted`."
        ],
        "hint": "This is the production version of stage discipline: emit should not run after a critical stop.",
        "why": [
          "This last module proves the student can reason about advanced stage order, not just individual helpers.",
          "It ends the track with a realistic production control decision."
        ],
        "starterCode": "const runProductionFlow = (result, emit) => {\n  // Return a halted result or call emit(result)\n};\n\nconsole.log(runProductionFlow({ failureClass: \"none\" }, () => ({ status: \"emitd\" })).status);\nconsole.log(runProductionFlow({ failureClass: \"halt\" }, () => ({ status: \"emitd\" })).status);",
        "solutionCode": "const runProductionFlow = (result, emit) => {\n  if (result.failureClass === \"halt\") {\n    return { ok: false, status: \"halted\" };\n  }\n\n  return emit(result);\n};\n\nconsole.log(runProductionFlow({ failureClass: \"none\" }, () => ({ status: \"emitd\" })).status);\nconsole.log(runProductionFlow({ failureClass: \"halt\" }, () => ({ status: \"emitd\" })).status);",
        "expectedLogs": [
          "emitd",
          "halted"
        ],
        "requiredPatterns": [
          {
            "regex": "result\\.failureClass\\s*===\\s*\\\"halt\\\"",
            "flags": ""
          },
          {
            "regex": "emit\\(result\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "idempotency-map",
        "label": "Idempotency",
        "title": "Reject Duplicate Run IDs Before Processing",
        "duration": "8 min",
        "summary": "Advanced systems often need idempotency so the same run cannot apply important changes more than once.",
        "narrative": [
          "When a payment, settlement, or reward run arrives twice, the system needs a visible way to recognize that duplicate.",
          "A simple idempotency map is a good first teaching pattern because it makes the duplicate check explicit.",
          "This module keeps the implementation tiny while introducing a very real production concern."
        ],
        "exampleCode": "const isDuplicateRun = (seenRuns, runId) => seenRuns.has(runId);",
        "instructionPrompt": "Return `true` when `seenRuns` already contains the incoming `runId`.",
        "instructions": [
          "Use the provided `Set` named `seenRuns`.",
          "Check whether `runId` is already present.",
          "When the script runs, the output should be `true` and `false`."
        ],
        "hint": "This is a small module about a big idea: one run id should only be applied once.",
        "why": [
          "Idempotency is one of the clearest ways to make advanced systems safer under retries and duplicates.",
          "Students should meet the concept in code, not only in architecture talk."
        ],
        "practice": [
          "Explain what could go wrong if a payout run is retried without an idempotency check.",
          "Describe where this duplicate gate should appear in a larger pipeline.",
          "Change the run ids and predict the output before executing."
        ],
        "starterCode": "const isDuplicateRun = (seenRuns, runId) => {\n  // Return true when the run id was already seen\n};\n\nconst seenRuns = new Set([\"run-1\", \"run-2\"]);\nconsole.log(isDuplicateRun(seenRuns, \"run-2\"));\nconsole.log(isDuplicateRun(seenRuns, \"run-3\"));",
        "solutionCode": "const isDuplicateRun = (seenRuns, runId) => {\n  return seenRuns.has(runId);\n};\n\nconst seenRuns = new Set([\"run-1\", \"run-2\"]);\nconsole.log(isDuplicateRun(seenRuns, \"run-2\"));\nconsole.log(isDuplicateRun(seenRuns, \"run-3\"));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "seenRuns\\.has\\(runId\\)",
            "flags": ""
          }
        ]
      },
      {
        "id": "duration-budget",
        "label": "Time Budget",
        "title": "Flag Runs That Exceed A Duration Budget",
        "duration": "8 min",
        "summary": "Operational thinking includes time. Students should practice checking whether a run stayed inside an allowed duration budget.",
        "narrative": [
          "A run that technically succeeds can still be a production problem if it takes too long.",
          "This module uses a small helper that compares `durationMs` against a configured budget.",
          "That gives the student one more concrete way to think like an operator."
        ],
        "exampleCode": "const withinBudget = (durationMs, budgetMs) => durationMs <= budgetMs;",
        "instructionPrompt": "Return `true` only when the run duration is less than or equal to the allowed budget.",
        "instructions": [
          "Compare `durationMs` against `budgetMs`.",
          "Use a less-than-or-equal check.",
          "When the script runs, the output should be `true` and `false`."
        ],
        "hint": "This is a policy check, just like authorization or retry gates.",
        "why": [
          "Students should see that production health includes timing, not just correctness.",
          "This builds a stronger mental model for observability and operator review."
        ],
        "practice": [
          "Set a tighter budget and predict how the output changes.",
          "Explain why slow success can still need attention from operators.",
          "Describe where you would record this timing result in audit data."
        ],
        "starterCode": "const withinBudget = (durationMs, budgetMs) => {\n  // Return true only when the run stayed inside the budget\n};\n\nconsole.log(withinBudget(120, 200));\nconsole.log(withinBudget(240, 200));",
        "solutionCode": "const withinBudget = (durationMs, budgetMs) => {\n  return durationMs <= budgetMs;\n};\n\nconsole.log(withinBudget(120, 200));\nconsole.log(withinBudget(240, 200));",
        "expectedLogs": [
          "true",
          "false"
        ],
        "requiredPatterns": [
          {
            "regex": "durationMs\\s*<=\\s*budgetMs",
            "flags": ""
          }
        ]
      },
      {
        "id": "manual-review-route",
        "label": "Escalation Route",
        "title": "Route High-Risk Runs To Manual Review",
        "duration": "9 min",
        "summary": "Advanced systems should sometimes stop automation and escalate a run for manual review when the risk is high.",
        "narrative": [
          "A strong production design knows when not to keep going automatically. Manual review is often the right response for high-value mismatches or uncertain system state.",
          "This module uses a simple route helper that returns either `manual-review` or `auto-continue`.",
          "That keeps the idea concrete and teaches the student that escalation is a first-class outcome."
        ],
        "exampleCode": "const routeRun = (riskLevel) => riskLevel === \"high\" ? \"manual-review\" : \"auto-continue\";",
        "instructionPrompt": "Return `manual-review` for high-risk runs and `auto-continue` for lower-risk runs.",
        "instructions": [
          "Check the incoming `riskLevel` string.",
          "Return `manual-review` when the level is `high`.",
          "Otherwise return `auto-continue`.",
          "When the script runs, the output should be `manual-review` and `auto-continue`."
        ],
        "hint": "This module is about operational decisions, not complicated logic.",
        "why": [
          "Students should see that stopping for human review is a valid and often necessary production path.",
          "This helps them think beyond happy-path automation."
        ],
        "practice": [
          "Name one feature in your own project that should escalate to manual review when the risk is high.",
          "Explain why escalation is different from a retry.",
          "Describe which stage or operator tool should receive this route result next."
        ],
        "starterCode": "const routeRun = (riskLevel) => {\n  // Return manual-review or auto-continue here\n};\n\nconsole.log(routeRun(\"high\"));\nconsole.log(routeRun(\"medium\"));",
        "solutionCode": "const routeRun = (riskLevel) => {\n  return riskLevel === \"high\" ? \"manual-review\" : \"auto-continue\";\n};\n\nconsole.log(routeRun(\"high\"));\nconsole.log(routeRun(\"medium\"));",
        "expectedLogs": [
          "manual-review",
          "auto-continue"
        ],
        "requiredPatterns": [
          {
            "regex": "riskLevel\\s*===\\s*\\\"high\\\"",
            "flags": ""
          },
          {
            "regex": "\\\"manual-review\\\"",
            "flags": ""
          },
          {
            "regex": "\\\"auto-continue\\\"",
            "flags": ""
          }
        ]
      }
    ]
  },
  {
    "id": "roblox",
    "title": "Roblox",
    "folder": "using ICF in Roblox",
    "storageKey": "icf-roblox-luau-course-progress-v1",
    "project": {
      "prompt": "Design a fun Roblox feature that starts in a LocalScript, travels through a RemoteEvent into ServerScriptService, runs through ModuleScripts with ICF stages, and sends safe feedback back to the player.",
      "checks": [
        {
          "label": "name the Roblox feature clearly",
          "field": "name",
          "keywords": [
            "shop",
            "reward",
            "ability",
            "purchase",
            "feature"
          ]
        },
        {
          "label": "describe the client request and remote entry",
          "field": "intent",
          "keywords": [
            "localscript",
            "remoteevent",
            "fireserver",
            "request",
            "replicatedstorage"
          ]
        },
        {
          "label": "show the Roblox folder layout",
          "field": "validate",
          "keywords": [
            "replicatedstorage",
            "serverscriptservice",
            "modulescript",
            "starterplayerscripts"
          ]
        },
        {
          "label": "include validation and context",
          "field": "context",
          "keywords": [
            "validate",
            "context",
            "player",
            "inventory",
            "state",
            "authorize"
          ]
        },
        {
          "label": "include process and emit follow-through",
          "field": "process",
          "keywords": [
            "process",
            "fireclient",
            "feedback",
            "emit",
            "server"
          ]
        }
      ]
    },
    "modules": [
      {
        "id": "client-intent",
        "label": "Client Intent",
        "title": "Turn LocalScript Input Into an Intent Request",
        "duration": "7 min",
        "summary": "Start the Roblox flow by treating LocalScript input as a request, not as proof that the gameplay action should happen.",
        "narrative": [
          "In Roblox, a button click or proximity prompt often starts on the client. That is convenient for input, but it is not authoritative.",
          "ICF helps by giving the server a predictable request shape to inspect. The client gathers intent, and the server decides whether the feature really runs.",
          "The important habit is to think in terms of requests leaving the client rather than state changes happening on the client."
        ],
        "exampleCode": "local request = {\n  intentType = \"shop/buySword\",\n  payload = {\n    itemId = \"sword_bronze\"\n  }\n}\n\nBuySwordRemote:FireServer(request)",
        "instructionPrompt": "Inside the LocalScript snippet, build a request table and send it to the server with the RemoteEvent.",
        "instructions": [
          "Create a `local request` table.",
          "Include an `intentType` field with `shop/buySword`.",
          "Include a `payload` table with `itemId = \"sword_bronze\"`.",
          "Call `BuySwordRemote:FireServer(request)`."
        ],
        "hint": "The client should describe the request. It should not grant the item directly.",
        "why": [
          "This is the first Roblox mindset shift: client input starts the request, but the server owns the truth.",
          "A stable request table makes every later server-side ICF stage easier to follow."
        ],
        "practice": [
          "Name one other Roblox action that should become a server request instead of a direct client state change.",
          "Explain why a LocalScript is a good place to gather intent but a bad place to own rewards or currency."
        ],
        "starterCode": "local request = {\n  -- build the request table here\n}\n\n-- send the request to the server here\n",
        "solutionCode": "local request = {\n  intentType = \"shop/buySword\",\n  payload = {\n    itemId = \"sword_bronze\"\n  }\n}\n\nBuySwordRemote:FireServer(request)\n",
        "requiredPatterns": [
          {
            "text": "local request"
          },
          {
            "text": "intentType"
          },
          {
            "text": "payload"
          },
          {
            "text": "itemId"
          },
          {
            "text": ":FireServer(request)"
          }
        ]
      },
      {
        "id": "shared-contracts",
        "label": "Shared Contracts",
        "title": "Define Shared Contracts In ReplicatedStorage",
        "duration": "8 min",
        "summary": "Use ReplicatedStorage for shared request builders and remotes so both client and server agree on names and shapes.",
        "narrative": [
          "ReplicatedStorage is a good place for cross-boundary contracts: RemoteEvents, constants, and small request-builder modules.",
          "It should not contain the authoritative gameplay decision logic. It should contain the shared contract that helps client and server stay aligned.",
          "This module teaches students how to define a contract module that the LocalScript can require before sending the request."
        ],
        "exampleCode": "local BuySwordContract = {}\n\nfunction BuySwordContract.new(itemId)\n  return {\n    intentType = \"shop/buySword\",\n    payload = {\n      itemId = itemId\n    }\n  }\nend\n\nreturn BuySwordContract",
        "instructionPrompt": "Complete the shared contract module so it returns a Roblox request table from `BuySwordContract.new(itemId)`.",
        "instructions": [
          "Create `BuySwordContract.new(itemId)`.",
          "Return a table with `intentType = \"shop/buySword\"`.",
          "Return a nested `payload` table that stores the incoming `itemId`."
        ],
        "hint": "This ModuleScript is about shape agreement, not validation or permissions.",
        "why": [
          "Shared contracts reduce copy-paste mistakes between LocalScripts and server handlers.",
          "They teach where Roblox cross-boundary code should live in an ICF architecture."
        ],
        "practice": [
          "List two things that belong in ReplicatedStorage and two things that should stay server-side.",
          "Explain why a shared contract is different from shared game truth."
        ],
        "starterCode": "local BuySwordContract = {}\n\nfunction BuySwordContract.new(itemId)\n  -- return the shared request table here\nend\n\nreturn BuySwordContract\n",
        "solutionCode": "local BuySwordContract = {}\n\nfunction BuySwordContract.new(itemId)\n  return {\n    intentType = \"shop/buySword\",\n    payload = {\n      itemId = itemId\n    }\n  }\nend\n\nreturn BuySwordContract\n",
        "requiredPatterns": [
          {
            "text": "function BuySwordContract.new(itemId)"
          },
          {
            "text": "intentType"
          },
          {
            "text": "payload"
          },
          {
            "text": "itemId = itemId"
          },
          {
            "text": "return {"
          }
        ]
      },
      {
        "id": "server-entry",
        "label": "Server Entry",
        "title": "Keep ServerScriptService Entry Scripts Thin",
        "duration": "8 min",
        "summary": "Listen for the RemoteEvent in ServerScriptService and hand the request off to reusable ModuleScripts.",
        "narrative": [
          "A server entry script should be easy to read: listen to the RemoteEvent, receive the player and request, and delegate to a runner or domain module.",
          "If too much logic lives here, the feature becomes hard to reuse and hard to audit.",
          "This module teaches the student to keep the entry point thin and authoritative."
        ],
        "exampleCode": "BuySwordRemote.OnServerEvent:Connect(function(player, request)\n  local result = IntentRunner.run(player, request, ShopModules)\n  print(result.ok)\nend)",
        "instructionPrompt": "Complete the ServerScriptService entry so it listens for the RemoteEvent and forwards the request into the runner.",
        "instructions": [
          "Connect to `BuySwordRemote.OnServerEvent`.",
          "Receive `player` and `request` inside the callback.",
          "Call `IntentRunner.run(player, request, ShopModules)` and store the result."
        ],
        "hint": "This script starts the flow. The real stage logic belongs in ModuleScripts.",
        "why": [
          "Thin entry points are one of the cleanest signs of a maintainable Roblox server architecture.",
          "This is where ICF starts to feel like a real project structure rather than disconnected snippets."
        ],
        "practice": [
          "Describe what should stay in the entry script versus what should move into a ModuleScript.",
          "Explain why the entry script belongs in ServerScriptService."
        ],
        "starterCode": "-- listen to the RemoteEvent here\n\n-- call the runner with player, request, and ShopModules\n",
        "solutionCode": "BuySwordRemote.OnServerEvent:Connect(function(player, request)\n  local result = IntentRunner.run(player, request, ShopModules)\n  print(result.ok)\nend)\n",
        "requiredPatterns": [
          {
            "text": "OnServerEvent:Connect"
          },
          {
            "text": "function(player, request)"
          },
          {
            "text": "IntentRunner.run"
          },
          {
            "text": "ShopModules"
          }
        ]
      },
      {
        "id": "modulescript-layout",
        "label": "ModuleScripts",
        "title": "Split Core And Domain Logic With ModuleScripts",
        "duration": "8 min",
        "summary": "Use ModuleScripts to separate shared core helpers from domain-specific gameplay stages.",
        "narrative": [
          "Roblox ICF projects get clearer when `Core` holds reusable flow utilities and `Domain` holds feature-specific rules.",
          "For example, an `IntentRunner` might live in `ServerScriptService/Core`, while shop-specific normalize, validate, and process functions live in `ServerScriptService/Domain/Shop`.",
          "Folder structure is not extra polish here. It is part of what makes the architecture teachable."
        ],
        "exampleCode": "ServerScriptService/\n  Core/\n    IntentRunner.lua\n  Domain/\n    Shop/\n      ShopModules.lua",
        "instructionPrompt": "Create a table that documents the Roblox folder layout for shared core code and shop domain logic.",
        "instructions": [
          "Return a table named `layout`.",
          "Include a `core` field with `ServerScriptService/Core/IntentRunner.lua`.",
          "Include a `domain` field with `ServerScriptService/Domain/Shop/ShopModules.lua`."
        ],
        "hint": "Use this task to reinforce where reusable flow code lives versus where gameplay-specific rules live.",
        "why": [
          "Students need to see that Roblox services and ICF boundaries reinforce each other.",
          "A clear folder map makes the later capstone much easier to build."
        ],
        "practice": [
          "Add one more domain folder you might need for rewards or abilities.",
          "Explain why `IntentRunner.lua` should not live beside the LocalScript."
        ],
        "starterCode": "local layout = {\n  -- add core and domain paths here\n}\n\nprint(layout.core)\nprint(layout.domain)\n",
        "solutionCode": "local layout = {\n  core = \"ServerScriptService/Core/IntentRunner.lua\",\n  domain = \"ServerScriptService/Domain/Shop/ShopModules.lua\"\n}\n\nprint(layout.core)\nprint(layout.domain)\n",
        "requiredPatterns": [
          {
            "text": "local layout"
          },
          {
            "text": "core"
          },
          {
            "text": "ServerScriptService/Core/IntentRunner.lua"
          },
          {
            "text": "domain"
          },
          {
            "text": "ServerScriptService/Domain/Shop/ShopModules.lua"
          }
        ]
      },
      {
        "id": "normalize-validate",
        "label": "Validate + Normalize",
        "title": "Validate and normalize on the server",
        "duration": "8 min",
        "summary": "Check the raw request before cleaning it. The server must reject malformed input before reading nested values.",
        "narrative": [
          "Remote requests may contain unexpected types or missing fields. Validate the raw table, the payload table, and the item ID before using them.",
          "After validation passes, Normalize trims the accepted item ID. It does not make a malformed request trustworthy.",
          "These helper definitions are called in Validate → Normalize order by the runner. The browser only checks their text; test nil, missing payload, blank IDs, and a valid request in Roblox Studio."
        ],
        "exampleCode": "function ShopModules.validate(request)\n  return type(request) == \"table\"\n    and request.intentType == \"shop/buySword\"\n    and type(request.payload) == \"table\"\n    and type(request.payload.itemId) == \"string\"\n    and request.payload.itemId:match(\"%S\") ~= nil\nend\n\nfunction ShopModules.normalize(request)\n  return {\n    intentType = request.intentType,\n    payload = { itemId = request.payload.itemId:match(\"^%s*(.-)%s*$\") }\n  }\nend",
        "instructionPrompt": "Protect the server from malformed requests, then clean an accepted item ID.",
        "instructions": [
          "Validate the request and payload table types before accessing fields.",
          "Require the shop/buySword type and an itemId string containing a non-space character.",
          "In Normalize, return a new request with the itemId trimmed."
        ],
        "hint": "Use and to stop checking as soon as a type check fails. The %S pattern means a non-space character.",
        "why": [
          "This is where Roblox exploit resistance starts to become concrete instead of theoretical.",
          "Separating normalize and validate keeps the later process logic much simpler."
        ],
        "practice": [
          "Try nil, an empty table, and a whitespace-only ID in Roblox Studio.",
          "Explain why tostring(nil) would not be a useful validation strategy."
        ],
        "starterCode": "function ShopModules.validate(request)\n  -- Check table shapes, intent type, and a nonblank string ID.\nend\n\nfunction ShopModules.normalize(request)\n  -- Return a new request with the accepted itemId trimmed.\nend",
        "solutionCode": "function ShopModules.validate(request)\n  return type(request) == \"table\"\n    and request.intentType == \"shop/buySword\"\n    and type(request.payload) == \"table\"\n    and type(request.payload.itemId) == \"string\"\n    and request.payload.itemId:match(\"%S\") ~= nil\nend\n\nfunction ShopModules.normalize(request)\n  return {\n    intentType = request.intentType,\n    payload = { itemId = request.payload.itemId:match(\"^%s*(.-)%s*$\") }\n  }\nend",
        "requiredPatterns": [
          {
            "text": "type(request) == \"table\""
          },
          {
            "text": "type(request.payload) == \"table\""
          },
          {
            "text": "type(request.payload.itemId) == \"string\""
          },
          {
            "text": "request.intentType == \"shop/buySword\""
          },
          {
            "text": ":match(\"%S\") ~= nil"
          },
          {
            "text": ":match(\"^%s*(.-)%s*$\")"
          }
        ]
      },
      {
        "id": "context",
        "label": "Context",
        "title": "Build Roblox Context From Player State",
        "duration": "8 min",
        "summary": "Use server-side player and game state to build the context that later policy and process stages need.",
        "narrative": [
          "Context is where Roblox ICF becomes meaningfully server-side. The request alone is not enough to decide whether the action should happen.",
          "A good context table can include the player, coin balance, inventory state, cooldowns, and other game-specific facts.",
          "This module teaches the student to collect the values later stages actually need instead of reaching through state everywhere."
        ],
        "exampleCode": "function ShopModules.buildContext(player, request)\n  return {\n    player = player,\n    coins = 100,\n    itemId = request.payload.itemId\n  }\nend",
        "instructionPrompt": "Build a Roblox context table that includes the player, their coin balance, and the requested item ID.",
        "instructions": [
          "Return a table from `ShopModules.buildContext(player, request)`.",
          "Include the incoming `player`.",
          "Include `coins` and `itemId`."
        ],
        "hint": "Think about what the authorization and process stages need to read next.",
        "why": [
          "Context stops the code from treating the request as the only source of truth.",
          "It also teaches students how to bridge Roblox player state into the ICF flow cleanly."
        ],
        "practice": [
          "List two more context fields you might need for a reward chest or ability system.",
          "Explain why context should come from the server, not from the client request."
        ],
        "starterCode": "function ShopModules.buildContext(player, request)\n  return {\n    -- include player, coins, and itemId here\n  }\nend\n",
        "solutionCode": "function ShopModules.buildContext(player, request)\n  return {\n    player = player,\n    coins = 100,\n    itemId = request.payload.itemId\n  }\nend\n",
        "requiredPatterns": [
          {
            "text": "player = player"
          },
          {
            "text": "coins"
          },
          {
            "text": "itemId = request.payload.itemId"
          }
        ]
      },
      {
        "id": "authorize",
        "label": "Authorize",
        "title": "Authorize Purchases On The Server",
        "duration": "7 min",
        "summary": "The server should decide whether the player is allowed to continue based on context, not just request shape.",
        "narrative": [
          "Authorization is a separate question from validation. The request might be well-formed and still not be allowed.",
          "In Roblox, that often means checking balance, ownership, cooldowns, roles, or match conditions before process runs.",
          "This module focuses on a simple shop rule: only allow the purchase if the player has enough coins and the item is the expected one."
        ],
        "exampleCode": "function ShopModules.authorize(context, request)\n  return context.coins >= 25 and request.payload.itemId == \"sword_bronze\"\nend",
        "instructionPrompt": "Write the Roblox authorization rule so the server only allows the expected item when the player has enough coins.",
        "instructions": [
          "Return `true` only when `context.coins >= 25`.",
          "Also require `request.payload.itemId == \"sword_bronze\"`.",
          "Return the combined expression directly."
        ],
        "hint": "Use one clear boolean expression. This is a policy decision, not a state mutation.",
        "why": [
          "This keeps permission checks visible before the feature changes game state.",
          "Students need to feel the difference between 'well-formed' and 'allowed'."
        ],
        "practice": [
          "Describe one authorization rule for a reward chest that would depend on server state.",
          "Explain why this rule belongs before process."
        ],
        "starterCode": "function ShopModules.authorize(context, request)\n  -- return a boolean here\nend\n",
        "solutionCode": "function ShopModules.authorize(context, request)\n  return context.coins >= 25 and request.payload.itemId == \"sword_bronze\"\nend\n",
        "requiredPatterns": [
          {
            "text": "context.coins >= 25"
          },
          {
            "text": "request.payload.itemId == \"sword_bronze\""
          },
          {
            "text": "return"
          }
        ]
      },
      {
        "id": "process-finalize",
        "label": "Process + Emit",
        "title": "Process The Purchase And Send Feedback",
        "duration": "9 min",
        "summary": "After the request is validated and authorized, the server can apply the result and then emit with player feedback.",
        "narrative": [
          "Process is where the authoritative state change happens. In a shop flow, that might mean granting the item and reducing the player coin balance.",
          "Emit is the safe follow-through after success: update UI, replicate a message, record an audit event, or fire a response back to the client.",
          "This module helps students feel the full server flow rather than treating emit like an afterthought."
        ],
        "exampleCode": "function ShopModules.process(context, request)\n  return {\n    itemId = request.payload.itemId,\n    newCoinBalance = context.coins - 25\n  }\nend\n\nfunction ShopModules.emit(player, result)\n  PurchaseResultRemote:FireClient(player, result)\nend",
        "instructionPrompt": "Complete the process and emit steps so the server returns the item result and then sends it back to the player.",
        "instructions": [
          "In `process`, return `itemId` and `newCoinBalance`.",
          "Subtract `25` from `context.coins`.",
          "In `emit`, call `PurchaseResultRemote:FireClient(player, result)`."
        ],
        "hint": "Process creates the result; emit delivers or records the result after success.",
        "why": [
          "This is where the Roblox ICF flow finally feels like a complete gameplay feature.",
          "Students need an explicit example of emit as safe feedback, not hidden core logic."
        ],
        "practice": [
          "Explain the difference between `process` returning a result and `emit` sending it.",
          "Name one more emit task you might add, like audit or analytics."
        ],
        "starterCode": "function ShopModules.process(context, request)\n  return {\n    -- return the itemId and newCoinBalance here\n  }\nend\n\nfunction ShopModules.emit(player, result)\n  -- send the result back to the player here\nend\n",
        "solutionCode": "function ShopModules.process(context, request)\n  return {\n    itemId = request.payload.itemId,\n    newCoinBalance = context.coins - 25\n  }\nend\n\nfunction ShopModules.emit(player, result)\n  PurchaseResultRemote:FireClient(player, result)\nend\n",
        "requiredPatterns": [
          {
            "text": "newCoinBalance = context.coins - 25"
          },
          {
            "text": "itemId = request.payload.itemId"
          },
          {
            "text": ":FireClient(player, result)"
          }
        ]
      },
      {
        "id": "gui-buttons",
        "label": "GUI Buttons",
        "title": "Use GUI Buttons To Start Safe Server Requests",
        "duration": "8 min",
        "summary": "A lot of Roblox games begin with a button click, so students should learn how a ScreenGui button can start an ICF request without the GUI owning the real result.",
        "narrative": [
          "A ScreenGui button is a great way to let the player do something fun, like buy a toy sword, open a chest, or claim a daily gift.",
          "But the GUI should not decide the real outcome. The GUI only starts the request, and the server decides whether the action can really happen.",
          "This is a very kid-friendly lesson because students can picture a bright button in their game right away."
        ],
        "exampleCode": "BuyButton.MouseButton1Click:Connect(function()\n  local request = {\n    intentType = \"shop/buySword\",\n    payload = {\n      itemId = \"sword_bronze\"\n    }\n  }\n\n  BuySwordRemote:FireServer(request)\nend)",
        "instructionPrompt": "Write a GUI button click handler that sends a Roblox request to the server.",
        "instructions": [
          "Connect to `BuyButton.MouseButton1Click`.",
          "Create a request table inside the click handler.",
          "Send the request with `BuySwordRemote:FireServer(request)`."
        ],
        "hint": "The GUI starts the action, but it does not hand out the prize by itself.",
        "why": [
          "Buttons are one of the easiest ways for kids to picture how ICF fits into their own game.",
          "This teaches the difference between a player pressing a button and the server saying yes."
        ],
        "practice": [
          "Imagine a second button like `OpenChestButton` and explain what request it would send.",
          "Explain why the button should not directly add coins or tools."
        ],
        "starterCode": "BuyButton.MouseButton1Click:Connect(function()\n  -- build and send the request here\nend)\n",
        "solutionCode": "BuyButton.MouseButton1Click:Connect(function()\n  local request = {\n    intentType = \"shop/buySword\",\n    payload = {\n      itemId = \"sword_bronze\"\n    }\n  }\n\n  BuySwordRemote:FireServer(request)\nend)\n",
        "requiredPatterns": [
          {
            "text": "MouseButton1Click:Connect"
          },
          {
            "text": "local request"
          },
          {
            "text": "intentType"
          },
          {
            "text": ":FireServer(request)"
          }
        ]
      },
      {
        "id": "gui-feedback",
        "label": "GUI Feedback",
        "title": "Update The GUI After The Server Says Yes",
        "duration": "8 min",
        "summary": "Players love to see messages, badges, and happy popups. This module teaches how the GUI can react after the server sends safe feedback back.",
        "narrative": [
          "When the server finishes the real decision, the player should see what happened. Maybe the button says 'Bought!', maybe a reward panel pops open, or maybe a label updates.",
          "That reaction should happen after the server answer comes back, not before.",
          "This helps the student understand that GUI feedback is part of emit and player experience, not the source of game truth."
        ],
        "exampleCode": "PurchaseResultRemote.OnClientEvent:Connect(function(result)\n  StatusLabel.Text = \"You got \" .. result.itemName\nend)",
        "instructionPrompt": "Write the GUI listener that changes a label after the server sends a result back to the player.",
        "instructions": [
          "Connect to `PurchaseResultRemote.OnClientEvent`.",
          "Receive `result` in the callback.",
          "Set `StatusLabel.Text` using the item name from the result."
        ],
        "hint": "The server decides the result first. Then the GUI tells the player the happy news.",
        "why": [
          "This makes the course feel more like real Roblox game building, because kids care about what the player sees.",
          "It reinforces that emit and GUI feedback come after the real server decision."
        ],
        "practice": [
          "Think of a second label message for opening a reward chest.",
          "Explain why changing the label is not the same as granting the item."
        ],
        "starterCode": "PurchaseResultRemote.OnClientEvent:Connect(function(result)\n  -- update the GUI here\nend)\n",
        "solutionCode": "PurchaseResultRemote.OnClientEvent:Connect(function(result)\n  StatusLabel.Text = \"You got \" .. result.itemName\nend)\n",
        "requiredPatterns": [
          {
            "text": "OnClientEvent:Connect"
          },
          {
            "text": "function(result)"
          },
          {
            "text": "StatusLabel.Text"
          },
          {
            "text": "result.itemName"
          }
        ]
      },
      {
        "id": "serverstorage-tools",
        "label": "ServerStorage",
        "title": "Clone Tools From ServerStorage Safely",
        "duration": "9 min",
        "summary": "ServerStorage is a great place to keep tools and prizes until the server decides a player really earned them.",
        "narrative": [
          "If a sword or pet tool lives in ServerStorage, the client cannot just grab it whenever it wants.",
          "That is great for ICF because the server can validate, authorize, and process the request before cloning the item into the backpack.",
          "This module teaches a very real Roblox pattern that many beginners want right away: giving a cool item after the server says yes."
        ],
        "exampleCode": "local swordTemplate = ServerStorage.Tools:FindFirstChild(\"BronzeSword\")\nif swordTemplate then\n  local swordClone = swordTemplate:Clone()\n  swordClone.Parent = player.Backpack\nend",
        "instructionPrompt": "Write the server-side Luau code that finds a sword in ServerStorage, clones it, and puts it into the player's Backpack.",
        "instructions": [
          "Use `ServerStorage.Tools:FindFirstChild(\"BronzeSword\")` to find the tool.",
          "Clone it with `:Clone()`.",
          "Set the clone's parent to `player.Backpack`."
        ],
        "hint": "The item should stay in ServerStorage until the server decides the player really earned it.",
        "why": [
          "This teaches one of the most useful real Roblox server patterns in the whole course.",
          "It also makes the reward feel real and exciting for younger students."
        ],
        "practice": [
          "Rename the tool to `MagicWand` and explain what else would need to change.",
          "Explain why the client should not clone the tool by itself."
        ],
        "starterCode": "local swordTemplate = nil\n\n-- find the tool, clone it, and place it into the Backpack here\n",
        "solutionCode": "local swordTemplate = ServerStorage.Tools:FindFirstChild(\"BronzeSword\")\nif swordTemplate then\n  local swordClone = swordTemplate:Clone()\n  swordClone.Parent = player.Backpack\nend\n",
        "requiredPatterns": [
          {
            "text": "ServerStorage.Tools:FindFirstChild(\"BronzeSword\")"
          },
          {
            "text": ":Clone()"
          },
          {
            "text": "player.Backpack"
          }
        ]
      },
      {
        "id": "serverstorage-models",
        "label": "World Objects",
        "title": "Clone World Objects From ServerStorage",
        "duration": "8 min",
        "summary": "ICF can also help when the server places things into the game world, like treasure chests, pads, or little reward statues.",
        "narrative": [
          "Some rewards are not tools. Sometimes the server wants to place a model into Workspace after a player unlocks something.",
          "This still follows the same idea: the request starts somewhere, the server checks it, and only then does the model get cloned into the world.",
          "This helps students see that ICF is useful for building the world too, not just buttons and backpacks."
        ],
        "exampleCode": "local rewardPad = ServerStorage.WorldItems:FindFirstChild(\"RewardPad\")\nif rewardPad then\n  local padClone = rewardPad:Clone()\n  padClone.Parent = workspace\nend",
        "instructionPrompt": "Write the Luau code that clones a world item from ServerStorage into Workspace after the server approves the action.",
        "instructions": [
          "Find `RewardPad` in `ServerStorage.WorldItems`.",
          "Clone the model.",
          "Parent the clone to `workspace`."
        ],
        "hint": "This is like cloning a tool, but now the object is going into the world instead of the Backpack.",
        "why": [
          "It broadens the student's picture of what server-approved rewards can look like.",
          "This makes the course feel more like a real game-building toolkit."
        ],
        "practice": [
          "Imagine placing a treasure chest instead of a reward pad and explain what name would change.",
          "Explain why the server should decide when the object appears."
        ],
        "starterCode": "local rewardPad = nil\n\n-- clone the world item into Workspace here\n",
        "solutionCode": "local rewardPad = ServerStorage.WorldItems:FindFirstChild(\"RewardPad\")\nif rewardPad then\n  local padClone = rewardPad:Clone()\n  padClone.Parent = workspace\nend\n",
        "requiredPatterns": [
          {
            "text": "ServerStorage.WorldItems:FindFirstChild(\"RewardPad\")"
          },
          {
            "text": ":Clone()"
          },
          {
            "text": "workspace"
          }
        ]
      },
      {
        "id": "animations",
        "label": "Animations",
        "title": "Trigger Animations After Safe Server Results",
        "duration": "8 min",
        "summary": "Animations make the game feel alive. This module shows how the server can approve an action first, and then the player can play an animation as feedback.",
        "narrative": [
          "A dance, attack, or celebration animation can make a feature feel much more fun.",
          "But just like GUI feedback, the animation should follow the real server decision if it represents a meaningful action.",
          "This teaches students that animations are part of the player experience layer, not the source of truth."
        ],
        "exampleCode": "AnimationResultRemote.OnClientEvent:Connect(function(result)\n  local animationTrack = animator:LoadAnimation(victoryAnimation)\n  animationTrack:Play()\nend)",
        "instructionPrompt": "Write the Luau code that listens for a server result and then plays a local animation.",
        "instructions": [
          "Connect to `AnimationResultRemote.OnClientEvent`.",
          "Load the animation with `animator:LoadAnimation(victoryAnimation)`.",
          "Play it with `animationTrack:Play()`."
        ],
        "hint": "The server says the action really happened. Then the client can play the fun animation.",
        "why": [
          "This helps students connect ICF to the fun, expressive side of Roblox.",
          "It also teaches the difference between animation feedback and server-owned game rules."
        ],
        "practice": [
          "Name a game moment where a celebration animation would feel exciting.",
          "Explain why the animation should not be the only proof that the action succeeded."
        ],
        "starterCode": "AnimationResultRemote.OnClientEvent:Connect(function(result)\n  -- load and play the animation here\nend)\n",
        "solutionCode": "AnimationResultRemote.OnClientEvent:Connect(function(result)\n  local animationTrack = animator:LoadAnimation(victoryAnimation)\n  animationTrack:Play()\nend)\n",
        "requiredPatterns": [
          {
            "text": "OnClientEvent:Connect"
          },
          {
            "text": "LoadAnimation"
          },
          {
            "text": "animationTrack:Play()"
          }
        ]
      },
      {
        "id": "sounds",
        "label": "Sounds",
        "title": "Play Sounds After Good Server Feedback",
        "duration": "7 min",
        "summary": "A happy sound can make a purchase, reward, or unlock feel great. This module shows how sound works nicely with emit-style feedback.",
        "narrative": [
          "Sound is one of the quickest ways to make a game feel fun and rewarding.",
          "A good ICF pattern is to let the server decide the real result and then let the client play the sound when the player should hear it.",
          "This keeps the reward feeling exciting without letting sound decide the actual game state."
        ],
        "exampleCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  RewardSound:Play()\nend)",
        "instructionPrompt": "Write the Luau code that plays a reward sound after the client receives the server result.",
        "instructions": [
          "Connect to `RewardResultRemote.OnClientEvent`.",
          "Inside the callback, call `RewardSound:Play()`.",
          "Keep the sound as feedback, not as the thing that decides the reward."
        ],
        "hint": "The sound is the celebration, not the actual rule check.",
        "why": [
          "This makes the course feel more connected to the playful side of Roblox building.",
          "It also reinforces the same good habit again: result first, feedback second."
        ],
        "practice": [
          "Think of a different sound for a chest opening or quest finish.",
          "Explain why hearing the sound should not automatically mean the reward was real."
        ],
        "starterCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  -- play the sound here\nend)\n",
        "solutionCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  RewardSound:Play()\nend)\n",
        "requiredPatterns": [
          {
            "text": "OnClientEvent:Connect"
          },
          {
            "text": "RewardSound:Play()"
          }
        ]
      },
      {
        "id": "visual-effects",
        "label": "VFX",
        "title": "Show Sparkles And Effects After Success",
        "duration": "8 min",
        "summary": "Particle effects and sparkles can make rewards feel magical. This module teaches how visual effects can follow a safe server-approved result.",
        "narrative": [
          "Visual effects like sparkles, smoke puffs, and glowing lights are fun because they make the player feel like something special happened.",
          "ICF fits nicely here because the server can approve the action first, and then the effect can appear after the result is real.",
          "This helps students connect architecture to the fun, colorful parts of Roblox game design."
        ],
        "exampleCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  SparkleEmitter:Emit(20)\nend)",
        "instructionPrompt": "Write the Luau code that triggers a particle effect after the server sends a result to the player.",
        "instructions": [
          "Connect to `RewardResultRemote.OnClientEvent`.",
          "Call `SparkleEmitter:Emit(20)` inside the callback.",
          "Treat the effect as happy feedback after the real server result."
        ],
        "hint": "Think of the sparkles as a prize celebration, not as the thing that grants the prize.",
        "why": [
          "Effects help younger students imagine real, playful Roblox features more easily.",
          "It reinforces the pattern of server truth first, player excitement second."
        ],
        "practice": [
          "Describe a second effect you might show, like hearts, stars, or smoke.",
          "Explain why sparkles should not appear before the server says yes."
        ],
        "starterCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  -- emit the particle effect here\nend)\n",
        "solutionCode": "RewardResultRemote.OnClientEvent:Connect(function(result)\n  SparkleEmitter:Emit(20)\nend)\n",
        "requiredPatterns": [
          {
            "text": "OnClientEvent:Connect"
          },
          {
            "text": "SparkleEmitter:Emit(20)"
          }
        ]
      },
      {
        "id": "quests",
        "label": "Quests",
        "title": "Use ICF For Quests And Daily Rewards",
        "duration": "9 min",
        "summary": "Quests and daily rewards are a perfect fit for ICF because they have lots of rules, checks, and fun player feedback.",
        "narrative": [
          "Quests, daily gifts, and mission rewards are exciting because they make players want to come back and keep playing.",
          "But they also need lots of server-side checks: has the player finished the quest, have they claimed it already, and what reward should they get?",
          "This module shows students that ICF is great for any feature that mixes rules, rewards, and player excitement."
        ],
        "exampleCode": "local request = {\n  intentType = \"quests/claimReward\",\n  payload = {\n    questId = \"collect_10_stars\"\n  }\n}\n\nQuestRewardRemote:FireServer(request)",
        "instructionPrompt": "Write the Luau request that asks the server to claim a quest reward.",
        "instructions": [
          "Create a request with `intentType = \"quests/claimReward\"`.",
          "Add a `payload` table with `questId = \"collect_10_stars\"`.",
          "Send it with `QuestRewardRemote:FireServer(request)`."
        ],
        "hint": "Quests are another fun example where the server needs to check the player's real progress.",
        "why": [
          "This broadens the student's idea of what ICF is useful for in real games.",
          "Quest rewards are fun, easy to picture, and full of good server-side rules."
        ],
        "practice": [
          "Think of a second quest name and rewrite the request for it.",
          "Explain why the client should not claim a quest reward without the server checking first."
        ],
        "starterCode": "local request = {\n  -- build the quest reward request here\n}\n\n-- send the quest reward request here\n",
        "solutionCode": "local request = {\n  intentType = \"quests/claimReward\",\n  payload = {\n    questId = \"collect_10_stars\"\n  }\n}\n\nQuestRewardRemote:FireServer(request)\n",
        "requiredPatterns": [
          {
            "text": "intentType = \"quests/claimReward\""
          },
          {
            "text": "questId"
          },
          {
            "text": ":FireServer(request)"
          }
        ]
      },
      {
        "id": "abilities",
        "label": "Abilities",
        "title": "Use ICF For Magic Powers And Special Abilities",
        "duration": "9 min",
        "summary": "Abilities are another great Roblox example because they often need cooldowns, checks, animations, and effects all at once.",
        "narrative": [
          "A magic power or dash move might look simple to the player, but the server still needs to check whether it is allowed.",
          "Maybe the player is on cooldown, maybe they have enough energy, or maybe the move only works in a special game area.",
          "This module helps students see that ICF is useful for action-heavy features too, not just rewards and shops."
        ],
        "exampleCode": "local request = {\n  intentType = \"abilities/useDash\",\n  payload = {\n    direction = \"forward\"\n  }\n}\n\nAbilityRemote:FireServer(request)",
        "instructionPrompt": "Write the request that asks the server to use a dash ability.",
        "instructions": [
          "Create a request with `intentType = \"abilities/useDash\"`.",
          "Add a `payload` table with `direction = \"forward\"`.",
          "Send it with `AbilityRemote:FireServer(request)`."
        ],
        "hint": "The player can ask to dash, but the server should still decide whether the move can happen.",
        "why": [
          "This gives the track a more action-game example, which many kids enjoy.",
          "Abilities are a nice place to combine cooldowns, animation, sound, and effects with one safe server flow."
        ],
        "practice": [
          "Change the ability to a fireball or jump boost and rewrite the request.",
          "Explain what kind of server checks an ability might need before it runs."
        ],
        "starterCode": "local request = {\n  -- build the ability request here\n}\n\n-- send the ability request here\n",
        "solutionCode": "local request = {\n  intentType = \"abilities/useDash\",\n  payload = {\n    direction = \"forward\"\n  }\n}\n\nAbilityRemote:FireServer(request)\n",
        "requiredPatterns": [
          {
            "text": "intentType = \"abilities/useDash\""
          },
          {
            "text": "direction = \"forward\""
          },
          {
            "text": ":FireServer(request)"
          }
        ]
      },
      {
        "id": "leaderstats-coins",
        "label": "Leaderstats",
        "title": "Read Coins From Leaderstats Safely",
        "duration": "8 min",
        "summary": "Many kid-friendly Roblox games use coins, gems, or points. This module shows how the server should read that data instead of trusting the client.",
        "narrative": [
          "In a Roblox game, coins often live in `leaderstats` or another server-owned data table. That means the client should not decide how many coins they have.",
          "A player might click a shop button and ask to buy something, but the server must read the real coin value before saying yes or no.",
          "This is a friendly but important lesson: the player can ask for the toy sword, but the server checks whether they really earned enough coins."
        ],
        "exampleCode": "local leaderstats = player:FindFirstChild(\"leaderstats\")\nlocal coins = leaderstats and leaderstats:FindFirstChild(\"Coins\")\nlocal coinAmount = coins and coins.Value or 0",
        "instructionPrompt": "Write the Luau code that reads a player's coin amount from `leaderstats` in a safe way.",
        "instructions": [
          "Use `player:FindFirstChild(\"leaderstats\")` to find the stats folder.",
          "Use `leaderstats:FindFirstChild(\"Coins\")` to find the coin value object.",
          "Store the final number in `coinAmount` and fall back to `0` if it is missing."
        ],
        "hint": "Try using `and` to keep the code safe if one of the objects does not exist yet.",
        "why": [
          "This teaches students to read real game data from the server instead of trusting what the client says.",
          "Coins and points are very common in beginner Roblox projects, so this skill shows up again and again."
        ],
        "practice": [
          "Replace `Coins` with `Gems` and explain what would change.",
          "Explain why the client should not send `coinAmount = 999999` and expect the server to believe it."
        ],
        "starterCode": "local leaderstats = player:FindFirstChild(\"leaderstats\")\nlocal coins = nil\nlocal coinAmount = 0\n\n-- read the Coins value safely here\n",
        "solutionCode": "local leaderstats = player:FindFirstChild(\"leaderstats\")\nlocal coins = leaderstats and leaderstats:FindFirstChild(\"Coins\")\nlocal coinAmount = coins and coins.Value or 0\n",
        "requiredPatterns": [
          {
            "text": "FindFirstChild(\"leaderstats\")"
          },
          {
            "text": "FindFirstChild(\"Coins\")"
          },
          {
            "text": "coinAmount"
          },
          {
            "text": "or 0"
          }
        ]
      },
      {
        "id": "reward-chest",
        "label": "Reward Chest",
        "title": "Build A Reward Chest Request",
        "duration": "8 min",
        "summary": "Reward chests are a fun Roblox example for kids because they feel like a real game feature, but they still teach the same safe server flow.",
        "narrative": [
          "A reward chest looks simple to the player: they walk up, press a button, and hope for a prize.",
          "Behind the scenes, the server still needs to check the cooldown, the player, and whether the chest can be claimed right now.",
          "This module helps the student see that ICF works for happy, playful features too, not just shops and admin tools."
        ],
        "exampleCode": "local request = {\n  intentType = \"rewards/claimChest\",\n  payload = {\n    chestId = \"forest_chest_01\"\n  }\n}\n\nClaimChestRemote:FireServer(request)",
        "instructionPrompt": "Create a reward chest request table and send it to the server so the server can decide whether the prize should be given.",
        "instructions": [
          "Create a request table with `intentType = \"rewards/claimChest\"`.",
          "Add a `payload` table with `chestId = \"forest_chest_01\"`.",
          "Send the request with `ClaimChestRemote:FireServer(request)`."
        ],
        "hint": "The player asks for the chest. The server decides whether the prize is real.",
        "why": [
          "This gives the student a second gameplay example so ICF feels reusable, not tied to only one feature.",
          "It also makes the lesson more fun and easier to picture as part of a real game."
        ],
        "practice": [
          "Think of a second chest name and rewrite the request for that chest.",
          "Explain what a sneaky player might try to fake when claiming a chest."
        ],
        "starterCode": "local request = {\n  -- build the chest request here\n}\n\n-- send the chest request here\n",
        "solutionCode": "local request = {\n  intentType = \"rewards/claimChest\",\n  payload = {\n    chestId = \"forest_chest_01\"\n  }\n}\n\nClaimChestRemote:FireServer(request)\n",
        "requiredPatterns": [
          {
            "text": "intentType = \"rewards/claimChest\""
          },
          {
            "text": "payload"
          },
          {
            "text": "chestId"
          },
          {
            "text": ":FireServer(request)"
          }
        ]
      },
      {
        "id": "cooldowns",
        "label": "Cooldowns",
        "title": "Check Cooldowns Before Giving Rewards",
        "duration": "8 min",
        "summary": "Cooldowns stop players from spamming buttons over and over. Kids see this in lots of games, so it is a great way to teach server-side rules.",
        "narrative": [
          "A cooldown is a short waiting rule. Maybe a chest can only be claimed once every minute, or a power can only be used every few seconds.",
          "If the server does not check cooldowns, the feature can be spammed and the game stops feeling fair.",
          "This module teaches that cooldowns belong in the server-side decision flow, not just in a button animation on the client."
        ],
        "exampleCode": "local lastClaim = chestCooldowns[player.UserId] or 0\nlocal canClaim = os.time() - lastClaim >= 60",
        "instructionPrompt": "Write a Luau cooldown check so the server only allows a chest claim if at least 60 seconds have passed.",
        "instructions": [
          "Read `lastClaim` from `chestCooldowns[player.UserId]` and fall back to `0`.",
          "Create `canClaim` by comparing `os.time()` against `lastClaim`.",
          "Require at least `60` seconds before the player can claim again."
        ],
        "hint": "Think of this as a timer rule the server checks before giving the reward.",
        "why": [
          "Cooldown rules make games feel fair and help protect features from spam.",
          "This is a very Roblox-feeling example of why authorization often needs context, not just payload checks."
        ],
        "practice": [
          "Change the cooldown to 10 seconds and explain what the player would feel in game.",
          "Explain why hiding the button on the client is not enough by itself."
        ],
        "starterCode": "local lastClaim = 0\nlocal canClaim = false\n\n-- read the saved cooldown and compare it to os.time() here\n",
        "solutionCode": "local lastClaim = chestCooldowns[player.UserId] or 0\nlocal canClaim = os.time() - lastClaim >= 60\n",
        "requiredPatterns": [
          {
            "text": "chestCooldowns[player.UserId]"
          },
          {
            "text": "or 0"
          },
          {
            "text": "os.time()"
          },
          {
            "text": ">= 60"
          }
        ]
      },
      {
        "id": "feedback",
        "label": "Player Feedback",
        "title": "Send Happy Results Back To The Player",
        "duration": "8 min",
        "summary": "Good Roblox games tell the player what happened. This module teaches a friendly `FireClient` response after the server finishes the real work.",
        "narrative": [
          "When the server says yes, the player should feel it right away. Maybe they see a popup, a sound, or a sparkle effect.",
          "That player-facing response should happen after the server finishes the real decision, not before.",
          "This is a great place to teach kids the difference between game truth and game presentation."
        ],
        "exampleCode": "local result = {\n  rewardName = \"Forest Gem\",\n  newCoinBalance = 120\n}\n\nRewardResultRemote:FireClient(player, result)",
        "instructionPrompt": "Create a small result table and send it back to the player with `FireClient`.",
        "instructions": [
          "Build a `result` table with `rewardName` and `newCoinBalance`.",
          "Use `RewardResultRemote:FireClient(player, result)`.",
          "Keep the feedback in emit, after the server already chose the real outcome."
        ],
        "hint": "The player gets the message after the server decides the prize is real.",
        "why": [
          "Kids notice feedback immediately, so this keeps the lesson tied to how games actually feel.",
          "It reinforces that emit is a follow-up stage, not the place where the decision is made."
        ],
        "practice": [
          "Rename the reward to a different item and imagine what popup you would show in the UI.",
          "Explain why `FireClient` should happen after process, not before."
        ],
        "starterCode": "local result = {\n  -- add rewardName and newCoinBalance here\n}\n\n-- send the result back to the player here\n",
        "solutionCode": "local result = {\n  rewardName = \"Forest Gem\",\n  newCoinBalance = 120\n}\n\nRewardResultRemote:FireClient(player, result)\n",
        "requiredPatterns": [
          {
            "text": "rewardName"
          },
          {
            "text": "newCoinBalance"
          },
          {
            "text": ":FireClient(player, result)"
          }
        ]
      },
      {
        "id": "multiplayer-thinking",
        "label": "Multiplayer",
        "title": "Think About More Than One Player At Once",
        "duration": "9 min",
        "summary": "Roblox games are often multiplayer, so the server has to think about each player separately.",
        "narrative": [
          "In a multiplayer game, many players can press buttons around the same time. The server needs to keep each player's request and game data separate.",
          "That means using things like `player.UserId`, per-player cooldown tables, and player-specific context.",
          "This module helps students see that ICF is not just about one request in one quiet test world. It is about staying organized when many kids are playing together."
        ],
        "exampleCode": "local playerData = sessionByUserId[player.UserId]\nlocal context = {\n  userId = player.UserId,\n  inventory = playerData.inventory,\n  coins = playerData.coins\n}",
        "instructionPrompt": "Build a context table that uses `player.UserId` so the server reads the right data for the right player.",
        "instructions": [
          "Read `playerData` from `sessionByUserId[player.UserId]`.",
          "Create a `context` table.",
          "Include `userId`, `inventory`, and `coins` from the correct player's data."
        ],
        "hint": "The big idea is simple: player A's request should not accidentally use player B's state.",
        "why": [
          "This is one of the easiest ways for beginner Roblox code to get messy, so it is worth practicing early.",
          "It also helps students understand why context-building matters in real multiplayer games."
        ],
        "practice": [
          "Explain what could go wrong if you forgot to use `player.UserId` here.",
          "Name another per-player piece of state you might store, like pets or quests."
        ],
        "starterCode": "local playerData = nil\nlocal context = {}\n\n-- read the correct player data and build the context table here\n",
        "solutionCode": "local playerData = sessionByUserId[player.UserId]\nlocal context = {\n  userId = player.UserId,\n  inventory = playerData.inventory,\n  coins = playerData.coins\n}\n",
        "requiredPatterns": [
          {
            "text": "sessionByUserId[player.UserId]"
          },
          {
            "text": "userId = player.UserId"
          },
          {
            "text": "inventory"
          },
          {
            "text": "coins"
          }
        ]
      },
      {
        "id": "demo-game",
        "label": "Demo Game",
        "title": "Plan A Small Demo Game With Two Features",
        "duration": "10 min",
        "summary": "End the Roblox track by thinking like a real builder: one small game, two fun features, and one shared ICF backbone.",
        "narrative": [
          "A strong learning project is small enough to finish, but big enough to show the full idea. A shop and a reward chest make a great pair for that.",
          "Both features can share the same ICF backbone while still having different payloads, rules, and feedback.",
          "This module prepares the student for the capstone starter pack by asking them to name the files and features of a tiny demo game."
        ],
        "exampleCode": "local demoFeatures = {\n  \"shop/buySword\",\n  \"rewards/claimChest\"\n}\n\nlocal sharedFiles = {\n  \"ReplicatedStorage/IntentContracts\",\n  \"ServerScriptService/Core/IntentRunner.lua\"\n}",
        "instructionPrompt": "Create one table for the game features and one table for the shared files both features will use.",
        "instructions": [
          "Create `demoFeatures` with `shop/buySword` and `rewards/claimChest`.",
          "Create `sharedFiles` with `ReplicatedStorage/IntentContracts` and `ServerScriptService/Core/IntentRunner.lua`.",
          "Keep the tables small and easy to read."
        ],
        "hint": "This module is about seeing one tiny game as a group of related ICF-powered features.",
        "why": [
          "It helps the student move from single lessons to a full build mindset.",
          "This is the final bridge into the Roblox capstone starter pack."
        ],
        "practice": [
          "Add a third feature idea, like a magic ability or daily reward.",
          "Explain why two features can share one runner but still have different domain modules."
        ],
        "starterCode": "local demoFeatures = {\n  -- add two feature names here\n}\n\nlocal sharedFiles = {\n  -- add the shared Roblox ICF folders/files here\n}\n",
        "solutionCode": "local demoFeatures = {\n  \"shop/buySword\",\n  \"rewards/claimChest\"\n}\n\nlocal sharedFiles = {\n  \"ReplicatedStorage/IntentContracts\",\n  \"ServerScriptService/Core/IntentRunner.lua\"\n}\n",
        "requiredPatterns": [
          {
            "text": "shop/buySword"
          },
          {
            "text": "rewards/claimChest"
          },
          {
            "text": "ReplicatedStorage/IntentContracts"
          },
          {
            "text": "ServerScriptService/Core/IntentRunner.lua"
          }
        ]
      },
      {
        "id": "intent-runner",
        "label": "Intent Runner",
        "title": "Compose The Roblox Intent Runner",
        "duration": "9 min",
        "summary": "Tie the Roblox ICF stages together inside a shared server-side runner so each feature follows the same backbone.",
        "narrative": [
          "Use the same order as the template: Validate, Normalize, AddContext, Authorize, Process, Emit. In these Luau helpers, buildContext implements AddContext.",
          "In Roblox, this helps multiple gameplay features share the same server-side structure even if their rules differ.",
          "The main lesson is not complexity. It is sequencing and responsibility."
        ],
        "exampleCode": "if not modules.validate(request) then\n  return { ok = false, stage = \"Validate\" }\nend\nlocal normalizedRequest = modules.normalize(request)\nlocal context = modules.buildContext(player, normalizedRequest)\nif not modules.authorize(context, normalizedRequest) then\n  return { ok = false, stage = \"Authorize\" }\nend\nlocal result = modules.process(context, normalizedRequest)\nmodules.emit(player, result)",
        "instructionPrompt": "Validate the raw request, normalize it, build trusted context, authorize, process, and emit feedback.",
        "instructions": [
          "Reject an invalid request with modules.validate(request) before calling modules.normalize(request).",
          "Reject the flow when validation or authorization fails.",
          "Build `context`, call `modules.process`, and then call `modules.emit(player, result)`."
        ],
        "hint": "This is the full backbone. The order matters more than clever syntax here.",
        "why": [
          "A visible runner helps the student see the whole ICF flow in one place.",
          "This is the module that bridges the lessons into the capstone build most directly."
        ],
        "practice": [
          "Write the stage order from memory after reading this module.",
          "Explain which parts belong in core versus domain code."
        ],
        "starterCode": "-- Validate the request first.\n-- Then normalize, build context, authorize, process, and emit.\n",
        "solutionCode": "if not modules.validate(request) then\n  return { ok = false, stage = \"Validate\" }\nend\nlocal normalizedRequest = modules.normalize(request)\nlocal context = modules.buildContext(player, normalizedRequest)\nif not modules.authorize(context, normalizedRequest) then\n  return { ok = false, stage = \"Authorize\" }\nend\nlocal result = modules.process(context, normalizedRequest)\nmodules.emit(player, result)",
        "requiredPatterns": [
          {
            "text": "modules.validate(request)"
          },
          {
            "text": "modules.normalize(request)"
          },
          {
            "text": "modules.buildContext"
          },
          {
            "text": "modules.authorize"
          },
          {
            "text": "modules.process"
          },
          {
            "text": "modules.emit(player, result)"
          }
        ]
      },
      {
        "id": "shop-vertical-slice",
        "label": "Vertical Slice",
        "title": "Assemble A Full Shop Purchase Vertical Slice",
        "duration": "10 min",
        "summary": "Bring the Roblox lessons together by naming each file and responsibility in one end-to-end shop feature.",
        "narrative": [
          "A vertical slice is where the architecture stops being abstract. The LocalScript, ReplicatedStorage contract, ServerScriptService handler, and ModuleScripts all need to fit together.",
          "This module is less about one function and more about making the full feature map visible in code.",
          "If the student can complete this, they are close to being ready for the Roblox capstone starter pack."
        ],
        "exampleCode": "StarterPlayerScripts/BuySword.client.lua\nReplicatedStorage/IntentContracts/BuySwordContract.lua\nServerScriptService/Handlers/BuySword.server.lua\nServerScriptService/Core/IntentRunner.lua\nServerScriptService/Domain/Shop/ShopModules.lua",
        "instructionPrompt": "Create a Luau table named `featureFiles` that lists the key files in the shop purchase vertical slice.",
        "instructions": [
          "Create `featureFiles` as an array-like table.",
          "Include the LocalScript, shared contract, server handler, runner, and domain module file paths.",
          "Keep the file list in top-to-bottom flow order."
        ],
        "hint": "Think about the full request path from client input to server response.",
        "why": [
          "This prepares the student to open the capstone starter pack with a strong mental map already in place.",
          "It reinforces that Roblox architecture and ICF architecture should line up cleanly."
        ],
        "practice": [
          "Reorder the file list from memory without looking.",
          "Explain which file is the best place to change the purchase policy."
        ],
        "starterCode": "local featureFiles = {\n  -- list the key shop flow files here\n}\n\nprint(#featureFiles)\n",
        "solutionCode": "local featureFiles = {\n  \"StarterPlayerScripts/BuySword.client.lua\",\n  \"ReplicatedStorage/IntentContracts/BuySwordContract.lua\",\n  \"ServerScriptService/Handlers/BuySword.server.lua\",\n  \"ServerScriptService/Core/IntentRunner.lua\",\n  \"ServerScriptService/Domain/Shop/ShopModules.lua\"\n}\n\nprint(#featureFiles)\n",
        "requiredPatterns": [
          {
            "text": "StarterPlayerScripts/BuySword.client.lua"
          },
          {
            "text": "ReplicatedStorage/IntentContracts/BuySwordContract.lua"
          },
          {
            "text": "ServerScriptService/Handlers/BuySword.server.lua"
          },
          {
            "text": "ServerScriptService/Core/IntentRunner.lua"
          },
          {
            "text": "ServerScriptService/Domain/Shop/ShopModules.lua"
          }
        ]
      }
    ]
  }
];
export const questions = [
  [
    "Where does a purchase belong?",
    [
      "In an Intent pipeline",
      "Only in a button’s click handler",
      "In a color-preview helper"
    ],
    0,
    "A purchase changes important state. The button can create a request; the pipeline controls the action.",
    "intent"
  ],
  [
    "What does registration do?",
    [
      "Borrows the book immediately",
      "Connects an Intent type to its factory",
      "Replaces Validate"
    ],
    1,
    "Register the factory at startup. Then create an envelope for each request and run it through six stages.",
    "registration"
  ],
  [
    "Which order matches the template?",
    [
      "Normalize → Validate → Process",
      "Validate → Normalize → AddContext → Authorize → Process → Emit",
      "Validate → Process → Authorize → Emit"
    ],
    1,
    "Registration is separate. All six execution groups must be present in this order.",
    "stages"
  ],
  [
    "The payload says “I am an admin.” What now?",
    [
      "Trust it because it has the right field name",
      "Skip authorization",
      "Load or verify the role through a trusted source"
    ],
    2,
    "Payload and client context are claims. AddContext supplies verified facts; Authorize uses them.",
    "context"
  ],
  [
    "The book ID is missing. Where should the run stop?",
    [
      "Validate",
      "Process",
      "Emit"
    ],
    0,
    "Validate rejects the incomplete input before important state changes.",
    "validate"
  ],
  [
    "A stage has nothing to do. What belongs in its group?",
    [
      "Nothing; leave the group empty",
      "An explicit successful pass-through helper",
      "Delete the stage"
    ],
    1,
    "The current runner rejects missing and empty stage groups. A helper should return { ok: true, intent: intent }.",
    "pass-through"
  ],
  [
    "A request is well-formed, but Ava is not a member. What stops it?",
    [
      "Normalize",
      "Emit",
      "Authorize"
    ],
    2,
    "Validate asks whether the input is usable. Authorize asks whether this actor may act in this context.",
    "authorize"
  ],
  [
    "Where should the actual loan be recorded?",
    [
      "Process",
      "Normalize",
      "In the Intent’s metadata"
    ],
    0,
    "Process owns the main state transition. Keep UI feedback in Emit.",
    "process"
  ],
  [
    "The loan saved, then Emit failed. What is safe?",
    [
      "Automatically repeat the entire loan",
      "Retry the notification without creating another loan",
      "Assume the runner rolled back the database"
    ],
    1,
    "The template does not undo earlier writes. Design transactions, idempotency, or an outbox where your project needs them.",
    "transactions"
  ],
  [
    "What belongs inside the Intent file?",
    [
      "Every database query and helper",
      "A stage map referencing named helpers",
      "A large UI component"
    ],
    1,
    "Keep declarations readable. Domain implementations live in stage files and are exposed by registries.",
    "folders"
  ],
  [
    "What makes a useful failure response?",
    [
      "Something went wrong",
      "Only a number",
      "ok: false, the failing stage, and clear errors"
    ],
    2,
    "Stage-specific errors and the execution trace help you locate the failed responsibility.",
    "errors"
  ],
  [
    "What should you test before reusing a feature?",
    [
      "Only a happy path",
      "Only that the UI looks right",
      "Success, invalid input, denied permission, and failure after a write"
    ],
    2,
    "Also test duplicate requests and competing updates when relevant. Framework structure alone does not provide reliability.",
    "testing"
  ]
];
export const guide = [
  [
    "intent",
    "Intent, actor, payload, and metadata",
    "An Intent names a meaningful action. Actor identifies who initiated it; payload contains requested inputs; context holds supporting facts; meta records information such as source and createdAt. The factory also attaches the stage map. The browser must not be allowed to invent a trusted actor identity."
  ],
  [
    "registration",
    "Registration versus creating a request",
    "ICF/Intents/intents.js registers type names and factory functions once during startup. intentRegistry.createIntent(type, actor, payload, options) calls the factory for one action. Check createResult.ok before pipeline.run(createResult.intent). Registration is not a seventh execution stage."
  ],
  [
    "stages",
    "The six stages, in order",
    "Validate → Normalize → AddContext → Authorize → Process → Emit. All six groups must exist, with at least one named step each. A failing step stops the run; later stages do not execute. Older supplemental examples call Emit “Finalize” or AddContext “Context.” Use the current template’s names for new projects."
  ],
  [
    "validate",
    "Validate and Normalize",
    "Validate checks raw structure, types, and applicable preconditions without changing important state. Normalize then trims, converts, and standardizes accepted inputs. If numeric strings are accepted, validate their format before conversion. Never assume normalization has run during Validate."
  ],
  [
    "context",
    "AddContext and trust",
    "Load or verify facts such as current membership, inventory, ownership, and permissions. Simply copying client input into context does not make it trusted. Template demo helpers illustrate mechanics; a real app must connect authenticated identity and authoritative records."
  ],
  [
    "authorize",
    "Authorize and state transitions",
    "Decide whether the actor can perform this action using the verified facts. Deny illegal state transitions before Process when possible. Recheck changing conditions atomically at the write boundary to prevent two requests using the same stale state."
  ],
  [
    "process",
    "Process and Emit",
    "Process performs the main state change. Emit produces controlled follow-through such as result messages, notifications, analytics, and audit events. Do not move the core mutation into Emit or put UI rendering inside Process."
  ],
  [
    "pass-through",
    "Pass-through stages and return shapes",
    "A plain step returns { ok: true, intent: intent } to pass the Intent through. A successful step can supply a replacement Intent or omit the intent field to keep the current one. A failure returns { ok: false, errors: [\"Clear reason\"] }."
  ],
  [
    "folders",
    "Where files go in the template",
    "ICF/engine holds the runner, registry, and result helpers. ICF/Intents holds declarations. ICF/Stages contains Validators, Normalizers, ContextProviders, Authorizers, Processors, and Emitters. Each stage category contains Core and Domain; put feature folders under Domain. Base registry files expose named helpers. StageFactories create reusable stage objects with metadata and run()."
  ],
  [
    "style",
    "Readable Intent declarations and JavaScript style",
    "Use traditional named functions and clear names in template code. Keep business logic in stage helpers; Intent declarations should be quick to scan. The template avoids arrows, optional chaining, nullish coalescing, Crypto API, and dense shortcuts. Some focused coding drills use generic JavaScript shorthand; adapt them to these conventions in your project."
  ],
  [
    "errors",
    "Debug a stopped pipeline",
    "Read stage, step, errors and meta.pipelineTrace on the failed run. A Pipeline failure with an empty trace points to the envelope or stage declaration. For a named step, open its Intent, find the helper in that stage group and follow the import to its implementation. Use a local fixture to repeat the failure and a success case to check the fix. If Process started, check the stored state before retrying."
  ],
  [
    "audit",
    "Audit logs",
    "Record the action ID, authorized actor ID, outcome and timing where the application needs an audit trail. Project the permitted fields for each audience. Keep private source records, credentials and the full working Intent out of shared logs."
  ],
  [
    "adaptive-debug",
    "Debug a wrong Adaptive Context result",
    "For a successful run with the wrong outcome, inspect intent.context.adaptiveContext. Capture the policy version, evaluation time, signal snapshot ID and candidate revisions. In decisionTrace, find the expected candidate by ID. Its reason explains exclusion or selection. For scored candidates, contributions show the factor, signal value, weight and missing flag. Re-run the same trusted fixture after changing its adapter or policy. Use synthetic records for shared bug reports."
  ],
  [
    "transactions",
    "Transactions, idempotency, and retries",
    "A transaction commits related writes together. Idempotency prevents a repeated request from applying the same effect twice. An outbox stores a notification alongside a committed change for later delivery. These are project responsibilities, not automatic guarantees of this template. An Emit failure can happen after Process has committed."
  ],
  [
    "determinism",
    "Determinism and explicit dependencies",
    "With the same Intent, context, and system state, the action should have the same meaningful outcome. Make time, randomness, and external dependencies explicit when they affect the decision. Supply controlled values in tests rather than hiding them inside business logic."
  ],
  [
    "testing",
    "Testing and growing a feature",
    "Test each helper’s responsibility and the complete six-stage path. Include invalid input, unauthorized actors, duplicate requests, illegal transitions, and processing or delivery failures. Start with one action, reuse helpers when they actually repeat, and keep important mutations inside the flow."
  ],
  [
    "scope",
    "When a full pipeline is unnecessary",
    "Opening a modal, selecting a local tab, and previewing a color may be visual-only changes. Keep those simple. Creating an order, updating inventory, saving a lesson answer, or awarding XP changes important state and belongs in an Intent."
  ]
];

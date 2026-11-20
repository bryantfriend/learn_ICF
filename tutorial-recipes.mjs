// Each snippet runs independently as an ES module at the repository root.
function example(id, title, task, code, expected, why, source, related) {
  return { id, title, task, code: code.trim(), language: "JavaScript", expected, why, source, related };
}

const template = "Template/ICF/";
const stages = template + "Stages/";
const demoSource = template + "Intents/DemoIntent.js";
const runnerSource = template + "engine/pipeline.js";
const registrySource = template + "engine/intentRegistry.js";

function use(binding, source) {
  return 'import ' + binding + ' from "./' + source + '";\n';
}

const demo = use("demo", demoSource);
const runner = use("pipeline", runnerSource);
const registry = use("registry", registrySource);
const normalizersSource = stages + "Normalizers/normalizers.js";
const normalize = use("normalizers", normalizersSource);
const authorizersSource = stages + "Authorizers/authorizers.js";
const authorize = use("authorizers", authorizersSource);
const emittersSource = stages + "Emitters/emitters.js";
const emit = use("emitters", emittersSource);
const lessonServicesSource = template + "examples/lessonServices.js";
const services = use("{ createDemoLessonServices }", lessonServicesSource);
const adaptiveSource = template + "engine/adaptiveContext.js";
const updateSource = template + "Intents/UpdateContextScoringPolicyIntent.js";

export const recipeGroups = [
  {
    id: "foundations", title: "First Intents",
    examples: [
      example("create-fresh-intents", "Keep two requests separate",
        "Make one request for Ava and one for Bo. Add a receipt to Ava’s request, then check Bo’s.", demo + `
var ava = demo.createDemoIntent({ id: "ava", role: "member" }, { bookId: "atlas" });
var bo = demo.createDemoIntent({ id: "bo", role: "member" }, { bookId: "poems" });
ava.context.receipt = "A17";
console.log(ava.payload.bookId, bo.payload.bookId);
console.log(Object.hasOwn(bo.context, "receipt"));`,
        "The first line is “atlas poems”. The second is “false”. Bo’s request has no receipt yet.",
        "Make a new Intent for every request. If you reuse Ava’s request, Bo may get some of her details.", demoSource, "intent-envelope"),
      example("run-startup-demo", "Check that ICF is set up",
        "After copying the template, run DemoIntent with a sample user named setup.", registry + runner + use("intents", template + "Intents/intents.js") + `
var registered = intents.registerProjectIntents();
if (!registered.ok) throw new Error(registered.errors.join(" "));
var made = registry.createIntent("DemoIntent", { id: "setup", role: "system" }, {});
if (!made.ok) throw new Error(made.errors.join(" "));
var result = await pipeline.run(made.intent);
if (!result.ok) throw new Error(result.errors.join(" "));
console.log(result.data.demoProcessed, result.events[0].type);`,
        "After the step logs, the last line is “true DemoIntentCompleted”.",
        "This quick test checks that the app can make the Intent, run all six steps, and return an event.", template + "Intents/intents.js", "first-run"),
      example("public-response", "Show only what the buyer needs",
        "Take a sample purchase result and build a reply for the buyer.", `
var result = {
  ok: true,
  intent: { context: { internalStock: 17 } },
  data: { orderId: "O17", totalCents: 4200 },
  events: [], meta: {}
};
function orderResponse(success) {
  return { id: success.data.orderId, totalCents: success.data.totalCents };
}
console.log(JSON.stringify(orderResponse(result)));`,
        "The reply includes order ID O17 and a total of 4200 cents.",
        "A buyer needs their order details. Keep facts like the store’s stock count inside the app.", runnerSource, "result-envelope")
    ]
  },
  {
    id: "validate", title: "Validate",
    examples: [
      example("check-store-id", "Catch a missing store ID",
        "Try the same check with no store ID and then with a store ID.", use("validators", stages + "Validators/validators.js") + `
var check = validators.exampleRequireStoreId;
var missing = await check.run({ payload: {} });
var present = await check.run({ payload: { storeId: "north" } });
console.log(missing.errors[0]);
console.log(present.ok);`,
        "The first run says “Missing required field: intent.payload.storeId.” The second prints true.",
        "Check required fields early so you can tell the user exactly what to fix.", stages + "Validators/Core/exampleRequireStoreId.js", "validate"),
      example("validate-quantity", "Allow whole numbers from 1 to 12",
        "Test a stock request with 12, a fraction, a number written as text, and zero.", use("{ createValidator }", template + "StageFactories/createValidator.js") + `
var quantityCheck = createValidator({
  id: "quantity", name: "Reservation quantity",
  description: "Require one to twelve whole units.",
  check: function check(intent) {
    var n = intent.payload.quantity;
    if (Number.isInteger(n) && n >= 1 && n <= 12) return true;
    return "Choose 1 to 12 whole units.";
  }
});
for (var n of [12, 2.5, "2", 0]) {
  var result = await quantityCheck.run({ payload: { quantity: n } });
  console.log(JSON.stringify(n), result.ok);
}`,
        "The results in order are true, false, false, and false.",
        "A value can look like a number and still be text. Write down which types and values you accept.", template + "StageFactories/createValidator.js", "stage-factories"),
      example("collect-errors", "Show two form errors at once",
        "Submit a workshop form with no name and an invalid seat count.", `
function validateBooking(intent) {
  var payload = intent.payload || {};
  var errors = [];
  if (typeof payload.name !== "string" || !payload.name.trim()) errors.push("Enter a name.");
  if (!Number.isInteger(payload.seats) || payload.seats < 1) errors.push("Choose at least one seat.");
  if (errors.length) return { ok: false, errors: errors };
  return { ok: true, intent: intent };
}
var result = validateBooking({ payload: { name: " ", seats: 0 } });
console.log(result.errors.join(" "));`,
        "The output is “Enter a name. Choose at least one seat.”",
        "Show both problems so the person can fix them in one try.", template + "engine/resultHelpers.js", "validate")
    ]
  },
  {
    id: "normalize", title: "Normalize",
    examples: [
      example("parse-opt-in", "Turn yes and no into true and false",
        "Try sending “ NO ”, “yes”, and an unknown word from a checkbox form.", normalize + `
var parseOptIn = normalizers.createNormalizePayloadBooleanFieldNormalizer("optIn");
for (var text of [" NO ", "yes", "sometimes"]) {
  var result = parseOptIn({ payload: { optIn: text } });
  if (result.ok) console.log(result.intent.payload.optIn);
  else console.log(result.errors[0]);
}`,
        "The first two print false and true. The third says the app could not read optIn as true or false.",
        "Use a clear rule for text from forms. JavaScript treats any nonempty text as true, including the word “no”.", stages + "Normalizers/Core/normalizePayloadBooleanField.js", "normalize"),
      example("parse-price", "Read prices, including zero",
        "Try “0”, “12.50”, and a price with letters.", normalize + `
var parsePrice = normalizers.createNormalizePayloadNumberFieldNormalizer("price");
for (var raw of ["0", "12.50", "ten"]) {
  var result = parsePrice({ payload: { price: raw } });
  if (result.ok) console.log(typeof result.intent.payload.price, result.intent.payload.price);
  else console.log(result.errors[0]);
}`,
        "The first two become the numbers 0 and 12.5. The last prints an error for price.",
        "Zero is a price. Check for missing values separately so a free item is still valid.", stages + "Normalizers/Core/normalizePayloadNumberField.js", "normalize"),
      example("canonical-due-time", "Put a due time in one standard format",
        "Convert a local time of 09:30 in UTC+06:00 to UTC, a time standard the calendar uses.", normalize + `
var normalizeDue = normalizers.createNormalizePayloadDateFieldNormalizer("due");
var result = normalizeDue({ payload: { due: "2026-11-20T09:30:00+06:00" } });
console.log(result.intent.payload.due);`,
        "The printed time is 2026-11-20T03:30:00.000Z.",
        "Keep the time zone when you read the input so the same deadline shows up at the right time everywhere.", stages + "Normalizers/Core/normalizePayloadDateField.js", "normalize"),
      example("preserve-input", "Clean up a label and keep the original",
        "Trim the label in a copy of a draft. The preview still uses the old draft.", `
function normalizeLabel(intent) {
  var payload = { ...intent.payload, label: intent.payload.label.trim() };
  return { ok: true, intent: { ...intent, payload: payload } };
}
var draft = { payload: { label: "  Books  ", color: "blue" }, context: {} };
var next = normalizeLabel(draft).intent;
console.log(JSON.stringify([draft.payload.label, next.payload.label, next.payload.color]));`,
        "The original label keeps its spaces. The new label is Books. Its color stays blue.",
        "Copy the fields you want to keep, and change only the label in the copy.", runnerSource, "stage-contracts")
    ]
  },
  {
    id: "add-context", title: "AddContext",
    examples: [
      example("lookup-catalog-price", "Look up the price of a free item",
        "Check the store’s own price list for a free guide and an item that is missing.", `
var catalog = new Map([["guide", 0], ["atlas", 1200]]);
function loadPrice(intent) {
  var sku = intent.payload.sku;
  if (!catalog.has(sku)) return { ok: false, errors: ["Unknown catalog item."] };
  intent.context.priceCents = catalog.get(sku);
  return { ok: true, intent: intent };
}
var free = loadPrice({ payload: { sku: "guide", priceCents: 600 }, context: {} });
var missing = loadPrice({ payload: { sku: "map" }, context: {} });
console.log(free.intent.context.priceCents, missing.errors[0]);`,
        "The free guide costs 0. The missing item returns “Unknown catalog item.”",
        "Look up the item first. A price of zero does not mean the item is missing.", "studio-course.mjs", "add-context"),
      example("verified-learner", "Check who the learner is",
        "Try the sample lookup with a known learner ID and a made-up ID.", services + use("providers", stages + "ContextProviders/contextProviders.js") + `
var load = providers.createLessonContextProvider(createDemoLessonServices());
for (var id of ["learner", "missing"]) {
  var result = await load({ actor: { id: id }, context: {} });
  if (result.ok) console.log(result.intent.context.learner.scope);
  else console.log(result.errors[0]);
}`,
        "The known learner belongs to course-1. The other ID gives “Verified learner identity required.”",
        "Use the learner record the app looked up. An ID by itself does not prove the person has access.", stages + "ContextProviders/Domain/adaptiveContext/addLessonContext.js", "add-context"),
      example("rank-optional-signals", "See why a score went down",
        "Give a project a starting score of 80. Add the recent mistakes clue and leave session length blank.", use("{ scoreContextCandidate }", adaptiveSource) + `
var rule = { baseScore: 80, factors: { repeatedErrors: -20, shortSession: -25 } };
var scored = scoreContextCandidate(rule, { repeatedErrors: 1 });
console.log(scored.score);
console.table(scored.contributions);`,
        "The score is 60. Recent mistakes take away 20 points. The missing clue adds zero.",
        "Read each clue’s points to find out what moved the score.", adaptiveSource, "evidence-scores"),
      example("source-metadata", "Record where a request came from",
        "Have a scheduled job name itself when it makes a request. Copy that name into context.", use("providers", stages + "ContextProviders/contextProviders.js") + `
var intent = { meta: { source: "nightly-job" }, context: {} };
var result = providers.addSourceContext(intent);
console.log(result.intent.context.source);`,
        "The source in context is nightly-job.",
        "The source can help you find the part of the app that started the request.", stages + "ContextProviders/Core/addSourceContext.js", "add-context")
    ]
  },
  {
    id: "authorize", title: "Authorize",
    examples: [
      example("check-context-role", "Let an editor publish",
        "Try the permission check with two roles the app has already looked up. One person is an editor and one is a viewer.", authorize + `
var publish = authorizers.createRequireContextRoleAuthorizer(["editor", "admin"]);
var editor = publish({ context: { actorRole: "editor" } });
var viewer = publish({ context: { actorRole: "viewer" } });
console.log(editor.ok, viewer.ok, viewer.errors[0]);`,
        "The editor passes. The viewer gets “Context role is not authorized: viewer.”",
        "Use the role the app checked. A person should not be able to claim they are an editor in their request.", stages + "Authorizers/Core/requireContextRole.js", "authorize"),
      example("verify-draft-owner", "Check who can edit a draft",
        "Try to edit your own open draft, someone else’s draft, and a draft that was already published.", `
function allowEdit(intent) {
  var draft = intent.context.draft;
  if (!draft || draft.ownerId !== intent.actor.id || draft.status !== "draft") {
    return { ok: false, errors: ["An editable draft owned by this actor is required."] };
  }
  return { ok: true, intent: intent };
}
for (var draft of [
  { ownerId: "ava", status: "draft" },
  { ownerId: "bo", status: "draft" },
  { ownerId: "ava", status: "published" }
]) {
  console.log(allowEdit({ actor: { id: "ava" }, context: { draft: draft } }).ok);
}`,
        "The results in order are true, false, and false.",
        "Check who owns the draft and whether it is still open for edits.", "studio-course.mjs", "authorize"),
      example("require-subscription", "Check for an active subscription",
        "Try an active account, a paused account, and an account with no saved status.", authorize + `
var requireActive = authorizers.createRequireContextValueAuthorizer("subscription", "active");
for (var context of [{ subscription: "active" }, { subscription: "paused" }, {}]) {
  var result = requireActive({ context: context });
  console.log(result.ok ? "Allowed" : result.errors[0]);
}`,
        "Active prints “Allowed”. The other two get errors. One status is wrong and one is missing.",
        "A clear error tells you whether the account failed the rule or the app could not find the information.", stages + "Authorizers/Core/requireContextValue.js", "authorize")
    ]
  },
  {
    id: "process", title: "Process",
    examples: [
      example("reserve-last-copy", "Save only one loan for the last copy",
        "Start with one copy in a sample store. Ask for it twice.", `
var stock = new Map([["atlas", 1]]);
function reserve(intent) {
  var sku = intent.payload.sku;
  var remaining = stock.get(sku);
  if (remaining === undefined || remaining < 1) {
    return { ok: false, errors: ["Item unavailable."] };
  }
  stock.set(sku, remaining - 1);
  intent.context.resultData = { sku: sku, remaining: remaining - 1 };
  return { ok: true, intent: intent };
}
for (var attempt of [1, 2]) {
  var result = reserve({ payload: { sku: "atlas" }, context: {} });
  console.log(attempt, result.ok, stock.get("atlas"));
}`,
        "The first request works and leaves zero copies. The second fails and still leaves zero copies.",
        "Check the count again as part of the write. An earlier check may be out of date.", "studio-course.mjs", "transactions"),
      example("choose-next-lesson", "Turn the winning choice into a lesson",
        "Give Process one winning choice with ID gap, score 95, and rule version 3.", use("{ processLessonRecommendation }", stages + "Processors/Domain/adaptiveContext/processLessonRecommendation.js") + `
var context = { adaptiveContext: {
  policyVersion: 3,
  selected: [{ id: "gap", score: 95, candidate: { value: { lessonId: "prerequisite-review" } } }]
} };
var result = processLessonRecommendation({ context: context });
console.log(JSON.stringify(result.intent.context.resultData));`,
        "The answer is prerequisite-review. It also includes gap, 95, and version 3.",
        "Process turns the choice into the result the learner sees. Keep the choice ID so you can explain the answer later.", stages + "Processors/Domain/adaptiveContext/processLessonRecommendation.js", "decision-traces"),
      example("idempotent-credit", "Keep a retry from adding points twice",
        "Give a learner five points with an award ID. Repeat the request, then try using the same ID for a different amount.", `
var balance = 0;
var applied = new Map();
function award(intent) {
  var key = intent.payload.key;
  var points = intent.payload.points; // Validate has required a positive integer.
  if (applied.has(key) && applied.get(key).points !== points) {
    return { ok: false, errors: ["Key already identifies a different award."] };
  }
  if (!applied.has(key)) {
    balance += points;
    applied.set(key, { points: points, balanceAfter: balance });
  }
  intent.context.resultData = applied.get(key);
  return { ok: true, intent: intent };
}
for (var points of [5, 5, 8]) {
  console.log(award({ payload: { key: "lesson-17", points: points }, context: {} }).ok, balance);
}`,
        "The first two calls report success and leave the balance at 5. The third fails and leaves it at 5.",
        "Save the result with the award ID. A repeat can return the old answer without adding more points.", "studio-course.mjs", "retries")
    ]
  },
  {
    id: "emit", title: "Emit",
    examples: [
      example("append-stock-event", "Add an event after stock changes",
        "Start with an earlier event. Then add the event for the new stock hold.", emit + `
var addEvent = emitters.createAddEventEmitter("StockReserved", { channel: "catalog" });
var intent = {
  type: "ReserveStockIntent", actor: { id: "desk", role: "staff" },
  context: { events: [{ type: "EarlierEvent", data: {} }] }
};
var events = addEvent(intent).intent.context.events;
console.log(events.map(function type(event) { return event.type; }).join(", "));
console.log(events[1].data.actorId, events[1].data.channel);`,
        "The events print in order as “EarlierEvent, StockReserved”. The next line is “desk catalog”.",
        "Add the new event to the list so earlier messages stay in order.", stages + "Emitters/Core/addEvent.js", "emit"),
      example("add-receipt-message", "Add a note to a receipt",
        "Start with a saved order ID. Add the text you want the buyer to see.", emit + `
var addMessage = emitters.createAddResultMessageEmitter("receiptMessage", "Order confirmed.");
var intent = { context: { resultData: { orderId: "O17" } } };
var result = addMessage(intent);
console.log(JSON.stringify(result.intent.context.resultData));`,
        "The reply still has order O17, plus “Order confirmed.”",
        "Add the new field and keep the result Process already built.", stages + "Emitters/Core/addResultMessage.js", "emit"),
      example("retry-receipt", "Resend a receipt without making a new loan",
        "Start with a loan that already exists. Make the first send fail, the second work, and the third repeat the request.", `
var receipt = { id: "receipt-52", loanId: "loan-52", delivered: false };
var attempts = 0;
async function send(record) {
  attempts++;
  if (attempts === 1) throw new Error("Delivery unavailable.");
  return record.id;
}
async function deliver(record) {
  if (record.delivered) return "already delivered";
  try {
    await send(record);
    record.delivered = true;
    return "delivered";
  } catch (error) { return error.message; }
}
for (var request of [1, 2, 3]) console.log(await deliver(receipt));
console.log(attempts);`,
        "The messages are “Delivery unavailable.”, “delivered”, and “already delivered”. The app tries to send twice.",
        "Use the saved receipt record. A send error can be fixed without changing the loan again.", "studio-course.mjs", "retries")
    ]
  },
  {
    id: "composition", title: "Put the steps together",
    examples: [
      example("named-validation-chain", "Run two checks in order",
        "Start with the demo’s check for a complete request. Add a check for a store ID. Send a request without the ID.", demo + runner + use("validators", stages + "Validators/validators.js") + `
var intent = demo.createDemoIntent({ id: "ava", role: "staff" }, {});
intent.stages.Validate.requireStore = validators.exampleRequireStoreId;
var result = await pipeline.run(intent);
console.log(result.meta.pipelineTrace.map(function row(step) {
  return step.step + "=" + step.ok;
}).join(", "));`,
        "The first check passes. The second prints requireStore=false.",
        "Name each check so the trace tells you which rule to look at.", runnerSource, "intent-declarations"),
      example("publish-policy", "Let an editor change the scoring rules",
        "Use a sample editor account the app can check. Raise the minimum score to 55.", services + use("{ createContextPolicyUpdateFactory }", updateSource) + runner + `
var adapters = createDemoLessonServices();
var proposal = await adapters.policyStore.read();
proposal.minimumScore = 55;
var create = createContextPolicyUpdateFactory(adapters);
var request = create({ id: "editor", role: "editor" }, {
  policy: proposal, expectedVersion: 1, reason: "Review low-score suggestions."
});
var result = await pipeline.run(request);
if (!result.ok) throw new Error(result.errors.join(" "));
console.log(result.data.policyVersion, (await adapters.policyStore.read()).minimumScore);`,
        "The last line is “2 55”. It shows version 2 and a minimum score of 55.",
        "Changing shared rules is an action too. Give it clear checks and a result people can read.", updateSource, "policy-updates"),
      example("compare-recommendations", "Compare two lesson picks",
        "Ask for a lesson with no clues. Then add recent mistakes and a short session.", services + use("{ createLessonRecommendationFactory }", template + "Intents/RecommendNextLessonIntent.js") + runner + `
for (var signals of [{}, { repeatedErrors: 1, shortSession: 1 }]) {
  var adapters = createDemoLessonServices({ signals: signals });
  var create = createLessonRecommendationFactory(adapters);
  var result = await pipeline.run(create({ id: "learner", role: "student" }, {}));
  if (!result.ok) throw new Error(result.errors.join(" "));
  console.log(result.data.lessonId, result.data.score);
}`,
        "Without clues, advanced-project wins with 80. With both clues, prerequisite-review wins with 95.",
        "Keep the rule version the same. That lets you see what changed because of the clues.", lessonServicesSource, "adaptive-context"),
      example("register-feature", "Teach the app a new Intent name",
        "Register ReadinessCheckIntent using the demo’s steps. Then create and run it by name.", demo + registry + runner + `
function createReadinessCheck(actor, payload) {
  var intent = demo.createDemoIntent(actor, payload);
  intent.type = "ReadinessCheckIntent";
  return intent;
}
var startup = registry.registerIntent("ReadinessCheckIntent", createReadinessCheck);
if (!startup.ok) throw new Error(startup.errors.join(" "));
var made = registry.createIntent("ReadinessCheckIntent", { id: "health", role: "system" }, {});
if (!made.ok) throw new Error(made.errors.join(" "));
var result = await pipeline.run(made.intent);
console.log(result.ok, result.intent.type, result.data.demoProcessed);`,
        "The last line reads “true ReadinessCheckIntent true”.",
        "The registry links an action name to the function that makes it. This sample reuses the demo steps.", registrySource, "intent-registry")
    ]
  },
  {
    id: "failures", title: "Diagnose common failures",
    examples: [
      example("unknown-intent", "Find an Intent the app does not know",
        "Start with an empty registry. Ask it to make CheckoutIntent before you register it.", registry + `
var made = registry.createIntent("CheckoutIntent", { id: "ava", role: "member" }, {});
console.log(made.ok, made.errors[0]);
console.log(registry.listIntentTypes().length);`,
        "The app says “Intent is not registered: CheckoutIntent.” The list has zero entries.",
        "Check registration before you look for a problem in a stage. No stage ran here.", registrySource, "intent-registry"),
      example("missing-group", "Find a missing stage before anything runs",
        "Remove Emit from a sample Intent. Run it and look at the error and trace.", demo + runner + `
var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
delete intent.stages.Emit;
var result = await pipeline.run(intent);
console.log(result.stage, result.meta.pipelineTrace.length);
console.log(result.errors[0]);`,
        "The error names Emit. The stage says Pipeline and the trace has zero steps.",
        "An empty trace can mean the runner stopped before it called any helper.", runnerSource, "failure-traces"),
      example("bare-boolean", "Fix a step that returns only true or false",
        "Run a broken Normalize step, then run the same request after fixing its return value.", demo + runner + `
function broken() { return true; }
function repaired(intent) { return { ok: true, intent: intent }; }
for (var normalizeStep of [broken, repaired]) {
  var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
  intent.stages.Normalize = { cleanInput: normalizeStep };
  var result = await pipeline.run(intent);
  console.log(result.ok ? "Reached Emit" : result.stage + "." + result.step);
}`,
        "The first run stops at Normalize.cleanInput. The fixed run prints “Reached Emit”.",
        "A plain step must return an object so the runner knows what to do next.", runnerSource, "stage-contracts"),
      example("denied-write-count", "Check that a denied request saves nothing",
        "Count calls to Process. Make Authorize deny the request.", demo + runner + authorize + `
var writes = 0;
var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
intent.stages.Authorize = { featureClosed: authorizers.deny };
intent.stages.Process = {
  recordChange: function recordChange(current) {
    writes++;
    return { ok: true, intent: current };
  }
};
var result = await pipeline.run(intent);
console.log(result.stage, result.step, writes);`,
        "The last line is “Authorize featureClosed 0”. The write count is zero.",
        "Check the saved data or write count as well as the error. Both matter when the request should stop.", runnerSource, "test-strategy"),
      example("inspect-emit-failure", "Check whether the loan saved before the receipt failed",
        "Save one loan. Make Emit fail to send the receipt. Look at the error and the saved loan count.", demo + runner + `
var store = { loans: 0 };
var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
intent.stages.Process = {
  recordLoan: function recordLoan(current) {
    store.loans++;
    current.context.resultData = { loanId: "L1" };
    return { ok: true, intent: current };
  }
};
intent.stages.Emit = {
  sendReceipt: function sendReceipt() { return { ok: false, errors: ["Mailbox offline."] }; }
};
var result = await pipeline.run(intent);
console.log(result.ok, result.stage, result.step, store.loans);`,
        "The last line is “false Emit sendReceipt 1”. One loan is in the store even though the run reports failure.",
        "Find out what already saved before you try again. You may only need to resend the receipt.", runnerSource, "retries"),
      example("expired-evidence", "Find out why all the choices expired",
        "Set the sample clock to the exact moment the lesson choices expire. Ask for a recommendation.", services + runner + use("{ createLessonRecommendationFactory }", template + "Intents/RecommendNextLessonIntent.js") + `
var adapters = createDemoLessonServices();
adapters.now = function atExpiry() { return 10000; };
var create = createLessonRecommendationFactory(adapters);
var result = await pipeline.run(create({ id: "learner", role: "student" }, {}));
console.log(result.stage, result.step);
console.log(result.errors[0]);`,
        "The app stops at AddContext.addAdaptiveContext. The error includes expired=3.",
        "A choice stops being valid as soon as its expiry time arrives.", template + "examples/runAdaptiveContext.mjs", "evidence-eligibility")
    ]
  }
];




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
      example("create-fresh-intents", "Keep two borrowers’ requests separate",
        "Create two demo requests in memory. Add a fact to the first request and inspect both.", demo + `
var ava = demo.createDemoIntent({ id: "ava", role: "member" }, { bookId: "atlas" });
var bo = demo.createDemoIntent({ id: "bo", role: "member" }, { bookId: "poems" });
ava.context.receipt = "A17";
console.log(ava.payload.bookId, bo.payload.bookId);
console.log(Object.hasOwn(bo.context, "receipt"));`,
        "The two lines print “atlas poems” and “false”. The second request has its own empty context.",
        "Call the factory for every action and supply a fresh payload. A shallow copy of a previous working Intent can retain its borrower’s data.", demoSource, "intent-envelope"),
      example("run-startup-demo", "Smoke-test an installation",
        "Check startup wiring after you copy the template. Use DemoIntent and a single system actor.", registry + runner + use("intents", template + "Intents/intents.js") + `
var registered = intents.registerProjectIntents();
if (!registered.ok) throw new Error(registered.errors.join(" "));
var made = registry.createIntent("DemoIntent", { id: "setup", role: "system" }, {});
if (!made.ok) throw new Error(made.errors.join(" "));
var result = await pipeline.run(made.intent);
if (!result.ok) throw new Error(result.errors.join(" "));
console.log(result.data.demoProcessed, result.events[0].type);`,
        "After the step logs, the final line prints “true DemoIntentCompleted”.",
        "A single smoke test here checks registration, construction, all six groups, result projection, and event production.", template + "Intents/intents.js", "first-run"),
      example("public-response", "Return a small API response",
        "Format a sample successful purchase result for the buyer. The working Intent also contains an internal stock count.", `
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
        'The public response is {"id":"O17","totalCents":4200}.',
        "Select public fields after the success check. The full execution envelope can carry service objects, private context, and evidence that a client should never receive.", runnerSource, "result-envelope")
    ]
  },
  {
    id: "validate", title: "Validate",
    examples: [
      example("check-store-id", "Reject a missing store ID",
        "Call the template’s store validator with an empty payload, then try a payload containing storeId.", use("validators", stages + "Validators/validators.js") + `
var check = validators.exampleRequireStoreId;
var missing = await check.run({ payload: {} });
var present = await check.run({ payload: { storeId: "north" } });
console.log(missing.errors[0]);
console.log(present.ok);`,
        "The error reads “Missing required field: intent.payload.storeId.” The supplied ID returns true.",
        "A factory-built validator exposes run. This particular helper checks presence. A later provider must establish which store the ID actually identifies.", stages + "Validators/Core/exampleRequireStoreId.js", "validate"),
      example("validate-quantity", "Accept whole quantities from 1 to 12",
        "Build a reserve-stock validator and test the maximum quantity, a fraction, a numeric string, and zero.", use("{ createValidator }", template + "StageFactories/createValidator.js") + `
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
        "The four results are true, false, false, and false.",
        "Validate the representation promised by the request contract. If a form is meant to accept numeric text, give that input its own validation and normalization rules.", template + "StageFactories/createValidator.js", "stage-factories"),
      example("collect-errors", "Report two form errors together",
        "Write a plain Validate step for a workshop sign-up. Submit a blank name with an invalid seat count.", `
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
        "The result prints “Enter a name. Choose at least one seat.”",
        "Collect independent input errors inside a single helper so the visitor can correct the form in one pass. The runner stops when that helper reports failure.", template + "engine/resultHelpers.js", "validate")
    ]
  },
  {
    id: "normalize", title: "Normalize",
    examples: [
      example("parse-opt-in", "Read a text checkbox correctly",
        "A form sends “ NO ”, “yes”, or an unknown word for a checkbox. Use the built-in boolean normalizer.", normalize + `
var parseOptIn = normalizers.createNormalizePayloadBooleanFieldNormalizer("optIn");
for (var text of [" NO ", "yes", "sometimes"]) {
  var result = parseOptIn({ payload: { optIn: text } });
  if (result.ok) console.log(result.intent.payload.optIn);
  else console.log(result.errors[0]);
}`,
        "The first two lines print false and true. The third reports that optIn could not be converted to a boolean.",
        "JavaScript treats every nonempty string as truthy, including “false”. Parse the explicit spellings that your form accepts.", stages + "Normalizers/Core/normalizePayloadBooleanField.js", "normalize"),
      example("parse-price", "Convert a price field while preserving zero",
        "Normalize the strings “0” and “12.50” and try a field containing letters.", normalize + `
var parsePrice = normalizers.createNormalizePayloadNumberFieldNormalizer("price");
for (var raw of ["0", "12.50", "ten"]) {
  var result = parsePrice({ payload: { price: raw } });
  if (result.ok) console.log(typeof result.intent.payload.price, result.intent.payload.price);
  else console.log(result.errors[0]);
}`,
        "The first two values become the numbers 0 and 12.5. The third produces a conversion error for price.",
        "Conversion and domain limits are separate responsibilities. A currency feature must also specify its accepted precision, bounds, and storage unit.", stages + "Normalizers/Core/normalizePayloadNumberField.js", "normalize"),
      example("canonical-due-time", "Canonicalize a due time with its offset",
        "A scheduler submits 09:30 in UTC+06:00. Convert it to the ISO representation the calendar stores.", normalize + `
var normalizeDue = normalizers.createNormalizePayloadDateFieldNormalizer("due");
var result = normalizeDue({ payload: { due: "2026-11-20T09:30:00+06:00" } });
console.log(result.intent.payload.due);`,
        "The resulting timestamp is 2026-11-20T03:30:00.000Z.",
        "The explicit offset identifies an instant. If a feature accepts a date without a time, define a separate date-only contract to protect the user’s calendar day.", stages + "Normalizers/Core/normalizePayloadDateField.js", "normalize"),
      example("preserve-input", "Normalize a label without changing the original",
        "Write a plain Normalize step for a form draft shared with a preview panel. Keep other fields and the unedited draft.", `
function normalizeLabel(intent) {
  var payload = { ...intent.payload, label: intent.payload.label.trim() };
  return { ok: true, intent: { ...intent, payload: payload } };
}
var draft = { payload: { label: "  Books  ", color: "blue" }, context: {} };
var next = normalizeLabel(draft).intent;
console.log(JSON.stringify([draft.payload.label, next.payload.label, next.payload.color]));`,
        'The output is ["  Books  ","Books","blue"].',
        "After Validate establishes a string, copying both the envelope and the changed payload preserves the draft. The successful step explicitly returns the updated Intent.", runnerSource, "stage-contracts")
    ]
  },
  {
    id: "add-context", title: "AddContext",
    examples: [
      example("lookup-catalog-price", "Load a trusted price for a free item",
        "Use a local catalog as the trusted lookup. Compare a free guide with an unknown item.", `
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
        "The free guide has price 0 and the unknown SKU reports “Unknown catalog item.”",
        "Check membership in the catalog explicitly. A zero price is valid, and a posted price never establishes the authoritative cost.", "studio-course.mjs", "add-context"),
      example("verified-learner", "Load an identity by actor ID",
        "Use the included lesson identity fixture to compare the known learner with an unknown one.", services + use("providers", stages + "ContextProviders/contextProviders.js") + `
var load = providers.createLessonContextProvider(createDemoLessonServices());
for (var id of ["learner", "missing"]) {
  var result = await load({ actor: { id: id }, context: {} });
  if (result.ok) console.log(result.intent.context.learner.scope);
  else console.log(result.errors[0]);
}`,
        "The known learner has scope course-1. The unknown ID produces “Verified learner identity required.”",
        "Resolve the authenticated actor against a trusted service and check the returned identity before attaching it. The fixed lookup in this example is a teaching fixture.", stages + "ContextProviders/Domain/adaptiveContext/addLessonContext.js", "add-context"),
      example("rank-optional-signals", "Explain a negative score contribution",
        "Score a project with a base of 80 when repeated errors are present and the session-length signal is missing.", use("{ scoreContextCandidate }", adaptiveSource) + `
var rule = { baseScore: 80, factors: { repeatedErrors: -20, shortSession: -25 } };
var scored = scoreContextCandidate(rule, { repeatedErrors: 1 });
console.log(scored.score);
console.table(scored.contributions);`,
        "The score is 60. Repeated errors contribute −20 and the missing shortSession signal contributes zero.",
        "Compute from the base each time. The trace lets a reader distinguish a missing observation from an observed negative contribution.", adaptiveSource, "evidence-scores"),
      example("source-metadata", "Carry the request source into context",
        "Identify requests submitted by a scheduled job using source metadata set by the job.", use("providers", stages + "ContextProviders/contextProviders.js") + `
var intent = { meta: { source: "nightly-job" }, context: {} };
var result = providers.addSourceContext(intent);
console.log(result.intent.context.source);`,
        "The context source is nightly-job.",
        "This helper copies metadata. Use it for attribution and diagnostics. Permissions require independently verified identity and policy.", stages + "ContextProviders/Core/addSourceContext.js", "add-context")
    ]
  },
  {
    id: "authorize", title: "Authorize",
    examples: [
      example("check-context-role", "Allow an editor to publish",
        "Assume AddContext verified each account’s role. Try the existing authorizer with an editor and a viewer.", authorize + `
var publish = authorizers.createRequireContextRoleAuthorizer(["editor", "admin"]);
var editor = publish({ context: { actorRole: "editor" } });
var viewer = publish({ context: { actorRole: "viewer" } });
console.log(editor.ok, viewer.ok, viewer.errors[0]);`,
        "The editor passes. The viewer fails with “Context role is not authorized: viewer.”",
        "Use the verified context role for this decision. Copying a posted claim into context would give that claim the appearance of authority.", stages + "Authorizers/Core/requireContextRole.js", "authorize"),
      example("verify-draft-owner", "Protect a draft by owner and status",
        "Write a plain Authorize step. Try the owner’s editable draft, another person’s draft, and a published draft.", `
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
        "The three cases print true, false, and false.",
        "Combine actor and resource checks using the loaded draft. If status can change concurrently, the storage mutation also needs to check the expected state at commit.", "studio-course.mjs", "authorize"),
      example("require-subscription", "Require an active subscription",
        "A subscription service supplies a verified status. Compare active, paused, and missing context values.", authorize + `
var requireActive = authorizers.createRequireContextValueAuthorizer("subscription", "active");
for (var context of [{ subscription: "active" }, { subscription: "paused" }, {}]) {
  var result = requireActive({ context: context });
  console.log(result.ok ? "Allowed" : result.errors[0]);
}`,
        "Active prints “Allowed”. The other two report a value mismatch and a missing required value respectively.",
        "A missing fact and a known ineligible state can both deny a request while producing different diagnostic evidence.", stages + "Authorizers/Core/requireContextValue.js", "authorize")
    ]
  },
  {
    id: "process", title: "Process",
    examples: [
      example("reserve-last-copy", "Reserve the last copy in a fixture",
        "Write a plain Process step with a synchronous in-memory stock fixture. Run two requests against one available copy.", `
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
        "Attempt 1 prints true and 0 remaining. Attempt 2 prints false and 0 remaining.",
        "Make the availability decision next to the mutation. This synchronous fixture models the behavior for one process. A shared database requires an atomic conditional write or transaction.", "studio-course.mjs", "transactions"),
      example("choose-next-lesson", "Turn selected evidence into a lesson",
        "Pass one selected evidence record and a policy version to the actual lesson processor.", use("{ processLessonRecommendation }", stages + "Processors/Domain/adaptiveContext/processLessonRecommendation.js") + `
var context = { adaptiveContext: {
  policyVersion: 3,
  selected: [{ id: "gap", score: 95, candidate: { value: { lessonId: "prerequisite-review" } } }]
} };
var result = processLessonRecommendation({ context: context });
console.log(JSON.stringify(result.intent.context.resultData));`,
        'The result contains lessonId “prerequisite-review”, evidenceId “gap”, score 95, and policyVersion 3.',
        "Selecting evidence does not yet answer the caller’s question. Process expresses the domain rule that maps the first selected record to a particular lesson.", stages + "Processors/Domain/adaptiveContext/processLessonRecommendation.js", "decision-traces"),
      example("idempotent-credit", "Recognize a repeated credit award",
        "Put an operation key and amount into a single-learner, in-memory Process fixture. Try a retry and a conflicting reuse of the key.", `
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
        "The results are true/5, true/5, and false/5. A repeated award leaves the balance at 5.",
        "Identify the domain operation across submissions. In a multi-user store, scope keys by actor and action, and persist the key, write, and original result in one transaction.", "studio-course.mjs", "retries")
    ]
  },
  {
    id: "emit", title: "Emit",
    examples: [
      example("append-stock-event", "Append an inventory event",
        "Build an emitter for a confirmed stock change. Start with one existing event to see how ordering is preserved.", emit + `
var addEvent = emitters.createAddEventEmitter("StockReserved", { channel: "catalog" });
var intent = {
  type: "ReserveStockIntent", actor: { id: "desk", role: "staff" },
  context: { events: [{ type: "EarlierEvent", data: {} }] }
};
var events = addEvent(intent).intent.context.events;
console.log(events.map(function type(event) { return event.type; }).join(", "));
console.log(events[1].data.actorId, events[1].data.channel);`,
        "The lines print “EarlierEvent, StockReserved” and “desk catalog”.",
        "The template builds an event record and appends it to the envelope. A consumer or delivery adapter must deliver the record when an external notification is required.", stages + "Emitters/Core/addEvent.js", "emit"),
      example("add-receipt-message", "Add a receipt message without losing the order ID",
        "Add a message for a receipt panel to result data already written by Process.", emit + `
var addMessage = emitters.createAddResultMessageEmitter("receiptMessage", "Order confirmed.");
var intent = { context: { resultData: { orderId: "O17" } } };
var result = addMessage(intent);
console.log(JSON.stringify(result.intent.context.resultData));`,
        'The output is {"orderId":"O17","receiptMessage":"Order confirmed."}.',
        "This emitter preserves existing result fields. The UI can decide how to present the message after it receives the completed result.", stages + "Emitters/Core/addResultMessage.js", "emit"),
      example("retry-receipt", "Retry a pending receipt",
        "A loan already exists. Use its pending receipt record and simulate a failed delivery, a successful retry, and a repeated delivery request.", `
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
        "The messages are “Delivery unavailable.”, “delivered”, and “already delivered”. There are two actual send attempts.",
        "Retry the saved event independently of the loan. For real delivery, persist pending records with the commit and deduplicate by event ID at the consumer to handle a crash after sending.", "studio-course.mjs", "retries")
    ]
  },
  {
    id: "composition", title: "Connect a complete feature",
    examples: [
      example("named-validation-chain", "Chain two checks and locate the failing one",
        "Add the store validator after the demo’s built-in shape check and submit a structurally valid request without a store ID.", demo + runner + use("validators", stages + "Validators/validators.js") + `
var intent = demo.createDemoIntent({ id: "ava", role: "staff" }, {});
intent.stages.Validate.requireStore = validators.exampleRequireStoreId;
var result = await pipeline.run(intent);
console.log(result.meta.pipelineTrace.map(function row(step) {
  return step.step + "=" + step.ok;
}).join(", "));`,
        "The final line is “requireBaseIntentShape=true, requireStore=false”.",
        "The keys in the stage map become the trace’s step labels. Distinct names let you pinpoint a specific rejection inside one stage.", runnerSource, "intent-declarations"),
      example("publish-policy", "Publish an editor’s policy update",
        "Raise the minimum score to 55 in the in-memory lesson policy. Run the actual update Intent with a verified fixture editor.", services + use("{ createContextPolicyUpdateFactory }", updateSource) + runner + `
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
        "The last line is “2 55”. The policy change went through Validate, Normalize, AddContext, Authorize, Process, and Emit.",
        "Submit the reviewed change with an expected version and a reason. A durable project adapter must compare the version and advance the active policy atomically.", updateSource, "policy-updates"),
      example("compare-recommendations", "Compare two complete recommendation runs",
        "Run the same learner request once with no signals and once with repeated errors and a short session.", services + use("{ createLessonRecommendationFactory }", template + "Intents/RecommendNextLessonIntent.js") + runner + `
for (var signals of [{}, { repeatedErrors: 1, shortSession: 1 }]) {
  var adapters = createDemoLessonServices({ signals: signals });
  var create = createLessonRecommendationFactory(adapters);
  var result = await pipeline.run(create({ id: "learner", role: "student" }, {}));
  if (!result.ok) throw new Error(result.errors.join(" "));
  console.log(result.data.lessonId, result.data.score);
}`,
        "The selected lessons are advanced-project at 80 and prerequisite-review at 95.",
        "Vary only the captured signals to explain the decision change. The identity lookup, policy version, clock, authorization rule, and candidate revisions stay comparable.", lessonServicesSource, "adaptive-context"),
      example("register-feature", "Register a named feature at startup",
        "Use a template demo factory as the wiring for a small readiness-check feature. Register, create, and run its own type.", demo + registry + runner + `
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
        "The final line reads “true ReadinessCheckIntent true”. This wiring example deliberately uses the demo’s processing and events.",
        "Keep the registry key and factory result type consistent. A real feature supplies its domain-specific stages and event names in its declaration.", registrySource, "intent-registry")
    ]
  },
  {
    id: "failures", title: "Diagnose common failures",
    examples: [
      example("unknown-intent", "Distinguish an unknown type from a denied request",
        "In a fresh process, ask the empty registry to create a checkout that startup has never registered.", registry + `
var made = registry.createIntent("CheckoutIntent", { id: "ava", role: "member" }, {});
console.log(made.ok, made.errors[0]);
console.log(registry.listIntentTypes().length);`,
        "The result reports “Intent is not registered: CheckoutIntent.” The registry has zero entries.",
        "Start with the registration list when creation fails. A permission rule can only run after a valid Intent has been constructed.", registrySource, "intent-registry"),
      example("missing-group", "Diagnose an empty pipeline trace",
        "Remove the Emit group from a fresh teaching fixture and inspect the resulting preflight failure.", demo + runner + `
var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
delete intent.stages.Emit;
var result = await pipeline.run(intent);
console.log(result.stage, result.meta.pipelineTrace.length);
console.log(result.errors[0]);`,
        "The stage is Pipeline, trace length is 0, and the error identifies the missing Emit group.",
        "A zero-length trace means no step ran. Restore a named Emit step, using the template’s explicit pass-through helper when the feature has no feedback.", runnerSource, "failure-traces"),
      example("bare-boolean", "Repair a helper that returns a bare boolean",
        "Run the same demo with a broken plain Normalize step and its repaired version.", demo + runner + `
function broken() { return true; }
function repaired(intent) { return { ok: true, intent: intent }; }
for (var normalizeStep of [broken, repaired]) {
  var intent = demo.createDemoIntent({ id: "ava", role: "member" }, {});
  intent.stages.Normalize = { cleanInput: normalizeStep };
  var result = await pipeline.run(intent);
  console.log(result.ok ? "Reached Emit" : result.stage + "." + result.step);
}`,
        "The first run prints Normalize.cleanInput. The repaired run prints “Reached Emit”.",
        "A named plain function must return an object containing ok. Factories can support other callback forms because the wrapper translates those forms into the runner’s contract.", runnerSource, "stage-contracts"),
      example("denied-write-count", "Prove a denied feature made zero writes",
        "Attach a write counter to Process and use the template’s explicit denial step in Authorize.", demo + runner + authorize + `
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
        "The final line is “Authorize featureClosed 0”.",
        "Check observable side effects as well as error fields. A zero write count proves that a rejected request stopped before the mutation.", runnerSource, "test-strategy"),
      example("inspect-emit-failure", "Prove that a failed receipt followed a commit",
        "Record one write in a fixture, then make receipt delivery fail inside Emit. Inspect the stored count and failed step.", demo + runner + `
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
        "The final line reads “false Emit sendReceipt 1”. The failed overall run still has one recorded loan.",
        "Inspect the commit before deciding what to retry. Replaying this entire demo would increment the loan counter again.", runnerSource, "retries"),
      example("expired-evidence", "Find out why no candidate qualified",
        "Set the trusted lesson fixture clock exactly to the candidates’ expiry time. Run a recommendation and read the exclusion count.", services + runner + use("{ createLessonRecommendationFactory }", template + "Intents/RecommendNextLessonIntent.js") + `
var adapters = createDemoLessonServices();
adapters.now = function atExpiry() { return 10000; };
var create = createLessonRecommendationFactory(adapters);
var result = await pipeline.run(create({ id: "learner", role: "student" }, {}));
console.log(result.stage, result.step);
console.log(result.errors[0]);`,
        "The result reports AddContext.addAdaptiveContext and an exclusion count of expired=3.",
        "Check eligibility before tuning weights. At the expiry boundary the policy filters all three candidates regardless of their base scores.", template + "examples/runAdaptiveContext.mjs", "evidence-eligibility")
    ]
  }
];




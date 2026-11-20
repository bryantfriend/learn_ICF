// Readings and knowledge checks for the tutorial. Practice links use studio lesson IDs.
function lesson(id, title, summary, sections, question, practice) {
  return { id, title, summary, sections, question, practice };
}

function section(title, body, code, language = "JavaScript") {
  return code ? { title, body, code, language } : { title, body };
}

function quiz(prompt, options, answer, explanation) {
  return { prompt, options, answer, explanation };
}

export const chapters = [
  {
    id: "foundations", title: "Foundations",
    lessons: [
      lesson("what-is-icf", "What is ICF?",
        "See how an app handles a simple request, like borrowing a library book.", [
          section("What happens when you click Borrow?", "One click starts several steps. The app finds the book, checks your membership, sees if a copy is free, and records the loan. ICF stands for Intent-Centric Framework. It gives the whole action a name, such as BorrowBookIntent."),
          section("A request, the facts, and the steps", "An Intent says what someone wants to do. Context holds facts the app can check, like whether the person has a library card. The pipeline runs the steps in order. If a check fails, the app can stop before it changes any records.", "Request       BorrowBookIntent\nPayload       bookId = \" ATLAS \"\nTrusted fact  Ava has an active membership\nOutcome       Record one loan of atlas for Ava", "Text"),
          section("When to use an Intent", "Borrowing a book changes a record other people use. Opening a picture of the cover only changes what you see. Start with actions that change a record, such as marking a lesson complete or placing an order.")
        ], quiz("Which action would you give its own Intent?", ["Expand the plot summary", "Renew a checked-out book", "Highlight the book title"], 1, "Renewing a book changes its due date. An Intent gives the app one place to check the rules before it makes that change."), "orientation-intent"),
      lesson("intent-envelope", "What goes in an Intent?",
        "An Intent is like a request form. It says what to do, who asked, and what they sent.", [
          section("Read the parts of the request", "The type names the action. The actor is the person or system that asked. The payload is what they sent, like a book ID. The context holds facts and results the app gathers. The stages list the steps to run. The meta field can say where or when the request started.", 'var request = {\n  type: "BorrowBookIntent",\n  actor: { id: "ava", role: "member" },\n  payload: { bookId: " ATLAS " },\n  context: {},\n  meta: { source: "library-desk" }\n};\n// The factory also supplies the six-group stages map.'),
          section("Where do the values come from?", "Ava can pick a book. The server uses her signed-in account to find out who she is, then checks its records. If the server let Ava send her own membership status, she could claim to be a member without a library card."),
          section("Start fresh each time", "The steps can clean up the input and add facts or results as they go. Create a new Intent for each request so the next borrower does not get Ava’s details by mistake.")
        ], quiz("Where should the app check whether Ava is a library member?", ["A membership box the borrower fills in", "Facts from the last person’s checkout", "The library’s own records"], 2, "Ava can tell the app which book she wants. The app checks her membership in the library’s own records."), "foundations-intent-envelope"),
      lesson("pipeline-order", "The six steps, in order",
        "Follow one checkout from the Borrow button to a saved loan.", [
          section("A checkout that works", "Validate checks that the book ID is a piece of text with something in it. Normalize makes it match the library’s usual format. AddContext finds the member’s record. Authorize checks if the person may borrow. Process saves the loan. Emit prepares a message about the loan.", "Validate → Normalize → AddContext → Authorize → Process → Emit", "Text"),
          section("A checkout that stops", "Suppose Ava’s library card has expired. The app can find her account, but Authorize stops the request. The trace is a list of steps that ran. It shows where the request stopped. The app leaves the loan and stock records as they were."),
          section("A stage can pass the request through", "Every stage needs at least one named step. If the book ID is already in the right format, Normalize can pass it through. That step leaves the value as it is and shows up in the trace.", "function keepCanonicalInput(intent) {\n  return { ok: true, intent: intent };\n}")
        ], quiz("What is the last stage that runs if the member fails the permission check?", ["Authorize", "Process", "Emit"], 0, "Authorize checks permission. If it fails, the runner stops there. It skips Process and Emit."), "orientation-stages"),
      lesson("first-run", "Run your first Intent",
        "Run a short demo. See what a pass looks like and find the step that stopped on purpose.", [
          section("Try the demo on your computer", "Open a terminal in the main project folder. Use Node.js 22 or later. The demo runs requests that should pass and requests that should fail. Both kinds help you check that the code works.", "node Template/ICF/examples/checkPipeline.mjs\nnode Template/ICF/examples/checkPipeline.mjs --verbose", "Shell"),
          section("Set up the demo, then run it", "Save this as an .mjs file in the main project folder. First tell the app how to make DemoIntent. Then ask it to make one. The runner calls each step. On success, result.data.demoProcessed is true.", 'import intents from "./Template/ICF/Intents/intents.js";\nimport registry from "./Template/ICF/engine/intentRegistry.js";\nimport pipeline from "./Template/ICF/engine/pipeline.js";\n\nvar startup = intents.registerProjectIntents();\nif (!startup.ok) throw new Error(startup.errors.join(" "));\nvar made = registry.createIntent("DemoIntent", { id: "demo", role: "system" }, {});\nif (!made.ok) throw new Error(made.errors.join(" "));\nvar result = await pipeline.run(made.intent);\nconsole.table(result.meta.pipelineTrace);\nif (!result.ok) throw new Error(result.errors.join(" "));\nconsole.log(result.data.demoProcessed); // true'),
          section("Find the code for one step", "Open Template/ICF/Intents/DemoIntent.js. Find setDemoResult in Process. Follow the import to find the function that sets the result. Do the same for addDemoCompletedEvent to see how Emit builds the event.")
        ], quiz("What should you check before sending the new Intent to the runner?", ["Emit must publish an event", "Check that creation succeeded", "The caller must build a trace"], 1, "Making an Intent can fail. For example, the app may not know that action’s name yet. Use the new Intent only after creation succeeds."), "register-intent"),
      lesson("result-envelope", "How to read a result",
        "Check whether the request worked. Then look for the answer or find out where it stopped.", [
          section("When it works", "Check result.ok first. If it is true, result.data holds the answer, such as a loan ID. result.events holds notices about what happened.", 'if (result.ok) {\n  console.log(result.data);\n  console.table(result.events);\n}'),
          section("When it stops", "If result.ok is false, read stage, step, and errors. They tell you where and why it stopped. If the app could not make the Intent in the first place, no stage has run."),
          section("Show the caller what they need", "For a loan, show the user the receipt details they need, such as the loan ID. Keep private records and the full trace inside the app.")
        ], quiz("Which field holds the answer when the request works?", ["meta.durationMs", "stage", "data"], 2, "The data field holds the answer your app built. The trace shows how the request got there."), "composition-result-envelope")
    ]
  },
  {
    id: "stages", title: "The six stages",
    lessons: [
      lesson("validate", "Validate",
        "Check the input before the app uses it.", [
          section("Check what came in", "A book ID should be text with at least one character other than a space. Reject an empty ID or a number if the rule calls for text. This step checks the request. It leaves the input and stored records alone.", 'function validateBook(intent) {\n  var payload = intent.payload;\n  if (!payload || typeof payload.bookId !== "string" || !payload.bookId.trim()) {\n    return { ok: false, errors: ["A nonblank book ID is required."] };\n  }\n  return { ok: true, intent: intent };\n}'),
          section("Test good and bad input", "Try a missing ID, an ID made of spaces, a number, and a real ID with spaces around it. Make sure the good ID can go on to Normalize.")
        ], quiz("Which request can go on to Normalize?", ['{ bookId: 12 }', '{ bookId: " atlas " }', '{ bookId: "   " }'], 1, "A book ID can have spaces around it and still be valid. Validate checks that there is text. Normalize removes the extra spaces."), "validate-helper"),
      lesson("normalize", "Normalize",
        "Put good input into the format the app expects.", [
          section("Clean up one field", "The library stores a book ID as lowercase text with no extra spaces. Turn “ ATLAS ” into “atlas” before looking it up. Keep the other fields in the request.", 'function normalizeBook(intent) {\n  intent.payload.bookId = intent.payload.bookId.trim().toLowerCase();\n  return { ok: true, intent: intent };\n}'),
          section("Try the cleanup twice", "Run the cleanup on the same ID again. The output should still be “atlas”. Also try any values your app treats in a special way, such as an empty field or the number zero.")
        ], quiz("What should happen if you run the same cleanup twice?", ["It writes a new loan", "It assigns a new ID on every run", "The cleaned value stays the same"], 2, "Once the input is clean, running the same cleanup again should leave it as it is."), "normalize-transfer"),
      lesson("add-context", "AddContext",
        "Look up facts the app needs before it can make a decision.", [
          section("Use a source the app can trust", "If a buyer picks an item, use its ID to find the price in the store’s own list. Save that price in context so the next steps can use it.", 'function createMembershipLookup(members) {\n  return function loadMembership(intent) {\n    intent.context.isMember = members[intent.actor.id] === true;\n    return { ok: true, intent: intent };\n  };\n}'),
          section("Handle a missing record", "If the item is missing, stop with an error. An item priced at zero is still in the list, so check for a missing record directly."),
          section("Look up only the facts you need", "Use the current user and item ID to read the right records. The next step may need the price and owner. Skip unrelated details like the buyer’s full account history.")
        ], quiz("What should the app do when the price list says an item costs zero?", ["Use zero as the price", "Treat it as a missing price", "Take a replacement price from the payload"], 0, "Zero is a real price. Check whether the item exists before you decide its price is missing."), "context-transfer"),
      lesson("authorize", "Authorize",
        "Decide whether this person may do this action right now.", [
          section("Make the permission check clear", "Use the member record from AddContext to check whether the person may borrow. If the answer is no, return a useful reason and stop before any write.", 'function requireMembership(intent) {\n  if (intent.context.isMember !== true) {\n    return { ok: false, errors: ["Active membership is required."] };\n  }\n  return { ok: true, intent: intent };\n}'),
          section("Check the right item too", "A user might be allowed to edit their own draft and blocked from editing a classmate’s. Check who owns this exact draft and whether it is still open for edits.")
        ], quiz("Which stage decides if a member is allowed to borrow?", ["Normalize", "Authorize", "Emit"], 1, "Authorize uses facts the app already checked to make a yes-or-no decision."), "authorize-transfer"),
      lesson("process", "Process",
        "Make the approved change or work out the answer.", [
          section("Save the change here", "Process records the main change. At the library, it creates the loan and takes one copy out of stock. Keep both changes together so they can succeed or fail as a pair.", 'function createLoanProcessor(loans) {\n  return async function commitLoan(intent) {\n    var saved = await loans.borrow(intent.actor.id, intent.payload.bookId);\n    if (!saved.ok) return { ok: false, errors: saved.errors };\n    intent.context.resultData = { loanId: saved.id, bookId: intent.payload.bookId };\n    return { ok: true, intent: intent };\n  };\n}'),
          section("Check again before writing", "Two people could pass an earlier check for the same last copy. Make the final check and the write part of the same database transaction, a group of changes saved together."),
          section("Some actions just work out an answer", "Process can also pick a lesson using the facts collected earlier. Put that answer in the result data even when there is no record to save.")
        ], quiz("Where should the app check that the last copy is still free?", ["In the checkout button", "Only in yesterday’s stock report", "As part of saving the loan in the database"], 2, "Check as part of the database write. That way, two requests cannot both take the last copy."), "process-transfer"),
      lesson("emit", "Emit",
        "Prepare a message or event about what happened.", [
          section("Use the saved result", "Build the receipt from the saved loan ID. An event is a small named notice, such as BookBorrowed. Other parts of the app can use it to update a screen or send a message.", 'function emitLoanReceipt(intent) {\n  var loan = intent.context.resultData;\n  var events = intent.context.events || [];\n  events.push({ type: "BookBorrowed", data: { loanId: loan.loanId, bookId: loan.bookId } });\n  intent.context.events = events;\n  return { ok: true, intent: intent };\n}'),
          section("Saving and sending are two steps", "A loan can save even when the receipt fails to send. Check whether the loan exists. If it does, retry the receipt using the same delivery ID.")
        ], quiz("What can you retry if the loan saved but the receipt failed?", ["The complete checkout", "Sending the receipt", "Taking one copy out of stock"], 1, "Retry sending the receipt for the saved loan. Running the whole checkout again could create a second loan."), "emit-transfer")
    ]
  },
  {
    id: "composition", title: "Composition",
    lessons: [
      lesson("stage-contracts", "What a step must return",
        "Give the runner a clear answer after every step.", [
          section("Say whether the step worked", "A plain helper returns an object. Use { ok: true } to pass or return the updated Intent with it. If the step fails, use { ok: false, errors } to tell the runner to stop.", 'function keepInput(intent) {\n  return { ok: true, intent: intent };\n}\n\nfunction rejectMissingStock() {\n  return { ok: false, errors: ["No copies remain."] };\n}'),
          section("Put named steps in order", "A stage can have more than one step. Give each a name that tells you what it checks or does. The trace uses those names when you need to find the code."),
          section("Keep the other parts of the request", "If you return an updated Intent, keep the fields the later steps still need, including the stage list. A new payload by itself is only one part of the request.")
        ], quiz("How should a plain step return a changed Intent?", ["Return { ok: true, intent: updated }", "Return { ok: true, data: updated }", "Return true"], 0, "Return an object with ok set to true and the updated Intent. The runner uses it in the next step."), "stage-contract"),
      lesson("stage-factories", "Make reusable steps with factories",
        "A factory is a function that creates something. A stage factory creates a step you can use in an Intent.", [
          section("Make a check for one job", "Give createValidator a name and the function that checks the input. You can use that step in the Validate stage.", 'import { createValidator } from "./Template/ICF/StageFactories/createValidator.js";\n\nvar requireBookId = createValidator({\n  id: "library.bookId",\n  name: "Book ID",\n  description: "Require a nonblank catalog identifier.",\n  check: function check(intent) {\n    var id = intent.payload.bookId;\n    if (typeof id === "string" && id.trim()) return true;\n    return "A book ID is required.";\n  }\n});'),
          section("Choose a factory for the job", "Use createNormalizer for cleanup and createAuthorizer for permissions. Each factory handles the kind of answer its stage needs. Check that factory’s allowed return values."),
          section("Two kinds of factories", "A stage factory makes one step. An Intent factory builds the whole request, including the actor, payload, context, and all six stages.")
        ], quiz("What does createValidator give you?", ["A registered Intent type", "An HTTP response", "A Validate stage object with a run method"], 2, "It gives you a Validate step object. Its run method calls your check and turns the answer into the format the runner expects."), "validate-factory"),
      lesson("intent-declarations", "List the steps in an Intent",
        "See where an Intent lists the steps the runner should call.", [
          section("Read the stage list", "The Intent lists all six stages and the helper for each step. Keep the list short enough that you can see the whole action at a glance.", 'var stages = {\n  Validate:   { requireBookId: validateBook },\n  Normalize:  { normalizeBookId: normalizeBook },\n  AddContext: { loadMembership: loadMembership },\n  Authorize:  { requireMembership: requireMembership },\n  Process:    { commitLoan: commitLoan },\n  Emit:       { emitLoanReceipt: emitLoanReceipt }\n};'),
          section("Add a new rule in its own helper", "If checkout needs a check for overdue books, write it in a helper and add it to the right stage. The stage list names the rule. The helper spells out how to check it.")
        ], quiz("Where is the best place to look up the steps for one action?", ["The CSS for its button", "The action’s list of steps", "An unrelated category’s test log"], 1, "Open the action’s stage list. The runner follows the names it finds there."), "declare-intent"),
      lesson("intent-registry", "Teach the app about an Intent",
        "The registry is a list of the Intent types the app knows how to make.", [
          section("Add the action to the list", "Register a name such as BorrowBookIntent and the function that makes it. When a request comes in, use the name to create a new Intent.", 'var startup = registry.registerIntent("BorrowBookIntent", createBorrowBookIntent);\nif (!startup.ok) throw new Error(startup.errors.join(" "));'),
          section("Check where the failure happened", "Registering sets up a type. Creating makes one request. Running calls the six stages. Check each result so you know which of those jobs failed.", 'var made = registry.createIntent("BorrowBookIntent", actor, { bookId: "atlas" });\nif (!made.ok) throw new Error(made.errors.join(" "));\nvar result = await pipeline.run(made.intent);')
        ], quiz("What happens if you register the same Intent type twice?", ["An error that says the name is already registered", "A second run of Process", "A merged factory"], 0, "The registry rejects the second entry. Set up each type once when the app starts."), "foundations-base-registry"),
      lesson("core-and-domain", "Where to put a helper",
        "Put shared steps and steps for one part of the app in places where people can find them.", [
          section("Find the right folder", "Core holds steps different features can share. Domain holds steps for one part of the app, like the library. Look in the stage’s folder first.", "ICF/\n  Intents/RecommendNextLessonIntent.js\n  Stages/ContextProviders/contextProviders.js\n  Stages/ContextProviders/Core/addAdaptiveContext.js\n  Stages/ContextProviders/Domain/adaptiveContext/addLessonContext.js", "Text"),
          section("Follow the import to the code", "Open the Intent and find the step name. Follow its import to open the helper. If the import leads to a list of helpers, follow that entry too."),
          section("Pass in what the helper needs", "Give the helper the service it needs, such as a library store, when you set up the app. In a test, give it a small sample store instead.")
        ], quiz("Where would you put a library-only helper?", ["In every button handler", "In the clock implementation", "In its stage category’s Domain/library folder"], 2, "Put it in the library folder under that step’s stage category, such as Domain/library."), "composition-core-domain-boundaries")
    ]
  },
  {
    id: "reliability", title: "Reliability and testing",
    lessons: [
      lesson("failure-traces", "Find where a request stopped",
        "Use the trace to find the last step that ran and open its code.", [
          section("Read the stage, step, and error", "The stage tells you which part of the pipeline stopped. The step tells you which helper ran. The error says what went wrong.", 'if (!result.ok) {\n  console.log(result.stage, result.step, result.errors);\n  console.table(result.meta.pipelineTrace);\n}'),
          section("Go from the name to the code", "Find the named step in the Intent. Follow its import to the helper. Run a small test with the same input so you can see the problem again."),
          section("A request can finish with the wrong answer", "If the run passed but the answer is wrong, look at the facts AddContext found. Then check what Process did with those facts.")
        ], quiz("What do you check if the trace is empty and the stage says Pipeline?", ["Network delivery receipts", "The original request and its list of steps", "The last committed loan"], 1, "Check the starting Intent and its list of stages. The runner can reject an incomplete request before it calls a helper."), "adaptive-trace-failure"),
      lesson("transactions", "When two people ask for the same thing",
        "See what happens when two people try to borrow the last copy.", [
          section("See how two requests can overlap", "Both people might see one copy left before either loan is saved. If both then write a loan, the library has promised the same copy twice."),
          section("Check and write together", "Have the database check that a copy is still free as part of the same transaction that records the loan. A transaction saves related changes as a group.", "Within one transaction\n  Read current stock for atlas\n  Require stock > 0\n  Decrement stock and insert the loan\n  Commit both changes", "Pseudocode"),
          section("Check the saved records", "Send two requests for one book. Check that only one loan exists and that there are zero copies left. Then test what happens when the loan write fails.")
        ], quiz("What should happen to stock if saving the loan fails?", ["The old stock count is restored", "Validate returns quickly", "Both requests wrote a trace"], 0, "The stock count should go back to its old value. Saving the loan and changing stock belong in the same transaction."), "orientation-transactions"),
      lesson("retries", "Try again without doing the same work twice",
        "A retry repeats a request. Idempotency means repeating it does not make the change happen twice.", [
          section("Find out whether it already worked", "A network problem can hide a reply even after the app records the loan. Give the checkout a unique ID. Check that ID before writing anything again."),
          section("Try sending the receipt again", "If the loan exists but the receipt did not arrive, retry only delivery. Keep the same delivery ID so the receiver can spot a repeat.", "Operation key   checkout-817  → loan-52\nEvent ID        receipt-52    → pending\nAfter delivery  receipt-52    → delivered", "Text"),
          section("Try both common failures", "Test a failure before the loan saves and a failure after it saves. Send the same ID again and check how many loans or receipts were actually recorded.")
        ], quiz("What should the app use when the same checkout ID arrives again?", ["Another stock decrement", "A new unrelated loan", "The saved result from the first checkout"], 2, "Look up the saved result for that ID and return it. A second checkout could change the stock twice."), "delivery-retry"),
      lesson("test-strategy", "Test the whole request",
        "Try a checkout that works and requests that should stop at different steps.", [
          section("Start with a small set of test data", "Set up one book and one member. Test data you can build again easily is called a fixture. Starting from the same data makes it easier to see what changed."),
          section("Test more than one way to fail", "Try a missing book ID, a person who cannot borrow, and one checkout that should pass. Check both the final answer and the saved records.", "Case                 Expected outcome\nPadded valid ID      Success and one normalized loan\nBlank ID             Validate failure, no write\nNonmember            Authorize failure, no write\nStock changed        Process failure, no partial write\nDelivery unavailable Emit failure, loan already committed", "Text"),
          section("Run the project’s checks", "Run the included tests before and after your change. If a test breaks, read the first error and check the stage it names.", "node scripts/check-icf.mjs\nnode scripts/check-studio.mjs\nnode scripts/check-adaptive-context.mjs", "Shell")
        ], quiz("What shows that a denied request made no changes?", ["The page title includes ICF", "The loan count stayed the same and the app did not call the write function", "The request has a timestamp"], 1, "Check the saved loans and count calls to the write function. Both checks help show Process did no work."), "stop-on-failure"),
      lesson("audit-and-observability", "Keep a record of what happened",
        "Use step logs for debugging and saved records when people need to check a change later.", [
          section("What the trace tells you", "The trace lists which steps ran and whether they passed. Use it to find out why this request stopped or which checks it made."),
          section("What to save for later", "An audit record is a saved account of what changed, when, and who made the change. Include the details people need to check the change. Leave out passwords and other private values."),
          section("Connect a request to its records", "Use a request ID in the trace and the saved record so you can match them later. If a request wrote a loan, keep the loan ID too.")
        ], quiz("Where should the app keep an audit record it will need later?", ["A saved log the app can read after a restart", "The next request’s context", "The temporary list of steps from a new request"], 0, "Save it somewhere the app can read after a restart. A trace from one request may only live while that request runs."), "advanced-audit-observability")
    ]
  },
  {
    id: "adaptive", title: "Adaptive Context",
    lessons: [
      lesson("adaptive-context", "Facts the app needs and clues it can use",
        "Required facts let the app make a safe decision. Optional clues help it pick a better answer.", [
          section("Facts and clues do different jobs", "The app must know who the learner is and whether it can read their records. After that, clues such as recent mistakes can help it pick a lesson."),
          section("Two steps in AddContext", "One step gets facts about the learner. Another can use optional clues to rank lesson choices. The clue scores do not change who has permission."),
          section("Try one request with and without clues", "Run the same recommendation twice. Give it no clues the first time. Then add recent mistakes and a short session. Compare the lesson it picks.", "node Template/ICF/examples/runAdaptiveContext.mjs", "Shell")
        ], quiz("Which fact must the app check before reading a learner’s records?", ["A topic preference", "A preferred activity length", "A checked permission to read the records"], 2, "Permission is required. A strong clue that the learner needs review cannot grant access to their records."), "adaptive-boundaries"),
      lesson("evidence-scores", "How clues change a score",
        "Start with a score for each choice. Then see how clues raise or lower it.", [
          section("Start from a base score", "The base score is where a lesson starts before the app reads any clues. A clue can add or subtract points under the current rules.", "Project       80 + (−20 × 1) + (−25 × 1) = 35\nPrerequisite  60 + ( 25 × 1) + ( 10 × 1) = 95", "Text"),
          section("Try the sample clues", "The sample uses recent mistakes and a short session. These clues can move a review lesson above a harder project. A missing clue contributes zero in the sample."),
          section("Change just one rule in your test", "Keep the learner, choices, and time the same. Change one weight, the number of points a clue adds or takes away. Then compare the results.")
        ], quiz("If a lesson starts at 80 and a clue adds 5, what is the new score?", ["60", "85", "95"], 1, "Add 5 to 80. The new score is 85."), "adaptive-score"),
      lesson("evidence-eligibility", "Which choices can be picked?",
        "A choice must meet the basic rules before the app considers its score.", [
          section("Check whether a choice is allowed", "The app can rule out a choice if it is too old or meant for someone else. This is called checking eligibility."),
          section("Check the score and the limit", "Among the choices that are allowed, keep those that meet the minimum score. Pick up to the number the rules allow. If scores tie, the app uses a stable ID to break the tie."),
          section("Try the exact expiry time", "Run the sample once before the choices expire and once at the time they expire. Check the reason the trace gives for leaving them out.", "node Template/ICF/examples/runAdaptiveContext.mjs --expired", "Shell")
        ], quiz("What happens when the current time reaches a choice’s expiry time?", ["It can no longer be picked", "It wins on score", "Its expiry extends for one run"], 0, "That choice expires at that moment. It cannot win even if it had the highest score."), "adaptive-select"),
      lesson("decision-traces", "Find out why the app picked a lesson",
        "Read the record of choices, scores, and rules behind a recommendation.", [
          section("Read both traces", "The pipeline trace shows which steps ran. The decision trace shows the choices the app looked at, how it scored them, and why it kept or skipped each one."),
          section("Follow the winning choice", "Check which choice won and what lesson it points to. Process uses that value to build the final answer.", 'var decision = result.intent.context.adaptiveContext;\nconsole.table(decision.decisionTrace);\nconsole.log(result.data.evidenceId, result.data.lessonId);'),
          section("Repeat the same decision", "Use the same clues, choices, time, and rule version when you run it again. Then change one thing and see how the answer moves.")
        ], quiz("The top choice looks right, but the app shows the wrong lesson. What should you check?", ["The page layout", "The score limit", "The winning choice and how Process turned it into a lesson ID"], 2, "Check the winning choice’s value. Then see how Process turns that value into the lesson ID it returns."), "adaptive-repair-signals"),
      lesson("policy-updates", "Save and restore the scoring rules",
        "A policy is a set of rules. Save a new version when you change how lesson scores work.", [
          section("Describe a change", "Say which rule should change and why. For example, you can raise the lowest score a lesson needs in order to be picked."),
          section("Check the version before saving", "If two people edit version 4 at once, only one change should save first. The other person should see a conflict and read the new rules before they try again.", "Active v3\nEditor A submits expectedVersion 3 → v4\nEditor B submits expectedVersion 3 → conflict\nEditor B reviews v4 before making a new proposal", "Text"),
          section("Bring back an older set of rules", "To roll back, save the earlier rules as a new version. Keep the history so someone can tell what changed and why.")
        ], quiz("To restore older rules while version 4 is live, what should you send?", ["A direct edit to the v2 history entry", "The old rules, expectedVersion set to 4, and a reason for the change", "The old rules with expectedVersion set to 2"], 1, "Send the older rules, say you expect version 4 to still be live, and give a reason for restoring the rules."), "adaptive-policy-update")
    ]
  },
  {
    id: "applications", title: "Applied ICF",
    lessons: [
      lesson("library-checkout", "Build a library checkout",
        "Make a checkout that saves one loan and tells the reader what happened.", [
          section("Write down what the action needs", "The request needs a borrower and a book ID. On success, return a loan ID. Decide what errors the app should show for missing books or expired memberships."),
          section("Give each stage its job", "Check and clean up the ID. Load the borrower and check permission. Save the loan and adjust stock. Then prepare a receipt from the saved loan."),
          section("Try the project exercise", "Build and test the checkout in the studio. Try a passing request, a denied request, and two requests for the same last copy.")
        ], quiz("What should the records show after one successful checkout of the last copy?", ["Zero copies left and one loan", "One copy left and zero loans", "Zero copies left and two loans"], 0, "There should be one loan and zero copies left. Check both records so you know the whole change worked."), "library-capstone"),
      lesson("roblox-actions", "Use ICF in a Roblox game",
        "Follow a shop purchase from the player’s click to the item they receive.", [
          section("Send a small request from the player", "Send the item ID when the player clicks Buy. The server knows which player made the request and can load that player’s coin balance.", 'BuySwordRemote.OnServerEvent:Connect(function(player, payload)\n    local request = {\n        type = "BuySwordIntent",\n        player = player,\n        playerState = PlayerStateStore.get(player),\n        payload = payload\n    }\n    IntentRunner.run(request, ShopDomain)\nend)', "Luau"),
          section("Let the server handle the purchase", "Use the server’s current price and balance. Check that the player can buy the item. Update the coins and items together, then send a message back to the player."),
          section("Match the older sample to the current stages", "The Roblox sample uses some older stage names. Read what each one does before you move the code. Use the current six-stage list when you build a new version.")
        ], quiz("Where should the shop get the price of a shield?", ["The amount displayed by the client", "The price posted in the payload", "The price in the server’s item list"], 2, "Read the price from the server’s item list. The player’s device only needs to send which item they want."), "roblox-shop-vertical-slice"),
      lesson("feature-adoption", "Add ICF to an existing app",
        "Pick one feature and move its rules into a single action the app can share.", [
          section("Start with one action", "Choose something small with a clear result, such as reserving a seat. Write down who can do it, what they send, and what should change."),
          section("Set up and test the template", "Copy the template and run the demo. Then create the new Intent and add a few tests before you connect it to the app.", "node ICF/examples/checkPipeline.mjs", "Shell"),
          section("Connect the other ways to ask", "A web page and an API can both ask for the same action. Route both through the Intent so they share the same checks and writes.")
        ], quiz("How can an old button use your new Intent?", ["Keep both writes to ensure delivery", "Have the old button call the same Intent that saves the change", "Move the old write into a success notification"], 1, "Point the button to the same action as your other callers. The shared action should be the one place that saves the change."), "foundations-project"),
      lesson("spec-and-template", "Read the guide beside the code",
        "Use the written rules and the current template together to understand how ICF works.", [
          section("Find the right starting point", "The current guide explains the rules. The template shows how those rules work in code. The original notes explain where the ideas came from."),
          section("Read older stage names by their job", "An old example might call a step Finalize. Check what it does. If it builds a receipt, compare it with Emit in the current template."),
          section("Test a promise before you rely on it", "If you need two writes to succeed or fail together, test that in your database. The runner can tell you where a step failed. Your app decides how it stores and saves records.")
        ], quiz("Which sources should you check when an older example uses different names?", ["The current ICF guide and runner code", "Only the original early notes", "The text of a UI button"], 0, "Start with the current guide and runner. Use older notes to learn why the design changed."), "orientation-errors"),
      lesson("maintain-a-feature", "Fix features as they grow",
        "Start with one request that gives the wrong answer. Follow it to the code and check your fix.", [
          section("Write down what you expected", "Keep the input, what happened, and what should have happened. Pick a case small enough to run each time you change the code."),
          section("Follow the names in the trace", "Find the Intent, then the stage and helper that made the decision. Read its inputs so you can see whether the bug starts there or in an earlier step."),
          section("Check the fix and nearby features", "Run the failing case again. Then run a good case that uses the same helper. Check the saved state as well as the answer the user sees.")
        ], quiz("What extra check helps when you change a shared helper?", ["A screenshot of the registry", "The same failing case run twice", "A passing case from another Intent that uses the helper"], 2, "Try a passing case from another Intent that uses the helper. It should still work after the fix."), "advanced-incident-summary")
    ]
  }
];

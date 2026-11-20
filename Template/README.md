# ICF Template

Copy this folder into a project when you want to add Bryant's ICF pattern quickly.

## What To Copy

- This README, saved as `ICF-README.md` if your project already has a README
- `AGENTS.md`
- `ICF.md`
- `ADAPTIVE_CONTEXT.md` (optional context scoring and policy-update guide)
- `ICF/`, including its `package.json` ES module declaration

## Quick Start

For a project with an earlier copy, use the [dated runtime changes](ICF/CHANGES.md) to identify the files to compare and the checks to repeat.

1. Copy the framework and guides into the project root. If the project already has an `AGENTS.md`, merge the ICF guidance into it.
2. With Node 22 or newer, run `node ICF/examples/checkPipeline.mjs` in the copied project root. This checks the local runner without installing dependencies.
3. Register the included demo Intent once during app startup. Use an ES module for the following example.
4. Run `DemoIntent` before adding project-specific Intents.

```js
import intents from "./ICF/Intents/intents.js";
import intentRegistry from "./ICF/engine/intentRegistry.js";
import pipeline from "./ICF/engine/pipeline.js";

var registered = intents.registerProjectIntents();
if (!registered.ok) { throw new Error(registered.errors.join(" ")); }

var actor = {
  id: "demo-user",
  role: "system"
};

var createResult = intentRegistry.createIntent(
  "DemoIntent",
  actor,
  {},
  {
    source: "startup-smoke-test"
  }
);

if (!createResult.ok) { throw new Error(createResult.errors.join(" ")); }
var runResult = await pipeline.run(createResult.intent);
console.table(runResult.meta.pipelineTrace);
if (!runResult.ok) { throw new Error(runResult.errors.join(" ")); }
console.log(runResult.data.demoProcessed); // true
```

After the demo succeeds, add real project Intents under `ICF/Intents` and register them in `ICF/Intents/intents.js`.

## Diagnose a bug

1. Write down the action, one expected result, and the observed result. Find its type in `ICF/Intents/intents.js`. Create a fresh intent with fixture inputs and local service doubles for reads and writes.
2. Check the registration and creation results before calling `pipeline.run`. A startup error can occur before any stage executes. A run with `stage === "Pipeline"` and an empty trace points to an invalid starting envelope or stage map. If the trace contains passed steps and the error names a missing or empty group, inspect the earlier helpers for a change to the stage map.
3. For a stage failure, read `result.stage`, `result.step`, `result.errors`, and the last row of `result.meta.pipelineTrace`. Find that named step in the intent's `stages` map. Follow its registry import to the implementation under `ICF/Stages/`.
4. For a successful run with the wrong answer, compare the trusted inputs and, for adaptive evidence, the decision trace before inspecting the Process rule that produced `result.data`. If the data is correct but the feedback is wrong, follow the Emit step and its event consumer.
5. Change one input or one rule at a time. Recreate the intent for each run. Assert the expected result, the stop point on the failing path, and any effects on the fixture store. For an Emit failure, check whether Process already committed before attempting a retry.

The pipeline walkthrough prints the diagnosis for each fixture. Run `node ICF/examples/checkPipeline.mjs --verbose` to follow every named helper.

For an offline adaptive context exercise, run these from the copied template root. The second command changes only the fixture clock. Read the last trace row and the counts in `errors`, then compare them with `expiresAt` in [the fixture](ICF/examples/lessonServices.js).

```text
node ICF/examples/runAdaptiveContext.mjs
node ICF/examples/runAdaptiveContext.mjs --expired
```

## Adaptive Context

The template includes optional context scoring, a six-stage lesson recommendation example, and a six-stage policy-update intent. External signals can boost or reduce optional evidence; required facts and authorization stay mandatory. Existing intents are unchanged.

Read [the Adaptive Context guide](ADAPTIVE_CONTEXT.md) for integration and trusted-service contracts. Run `node ICF/examples/runAdaptiveContext.mjs` from the copied template root. The included versioned policy store is an in-memory reference adapter; replace it with transactional durable storage for production use.

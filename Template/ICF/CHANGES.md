# Updating a copied ICF runtime

## 2026-11-20

Use this date to identify this template snapshot in a project. For an older copy, compare the files below with the ones in that project. Merge shared fixes around local changes to Intent declarations, stage registries and service adapters. Record the date adopted and any fixes you deferred in the project's own history.

| Files relative to this folder | What to verify when updating |
| --- | --- |
| [pipeline.js](engine/pipeline.js) and [intentRegistry.js](engine/intentRegistry.js) | A bad step return identifies the stage and helper. Successful helpers can return frozen envelopes. Stage objects can use their own configuration in `run`. Registry lookups find only registered names. Compare stage and step fields in tests that previously matched an entire error string. |
| [adaptiveContext.js](engine/adaptiveContext.js) and [addAdaptiveContext.js](Stages/ContextProviders/Core/addAdaptiveContext.js) | Required selections report an empty source or counts of exclusion reasons. Exclusions are ordered by candidate ID for replay. After a failed refresh the earlier selection is cleared. Check custom loaders and any code that parses diagnostics. |
| [addContextToResultData.js](Stages/Processors/Core/addContextToResultData.js) and [addTimestampContext.js](Stages/ContextProviders/Core/addTimestampContext.js) | The debug processor takes a shallow copy of context fields and omits the previous result. Both timestamp representations come from the same clock reading. |
| [package.json](package.json) | Node treats JavaScript files in this directory as ES modules, including when the parent package uses CommonJS. Review any project-specific CommonJS files placed inside this directory. |

From the project directory containing `ICF/`, run the following with Node.js 22 or newer. These examples use local fixtures. Keep the bundled [demo Intent](Intents/DemoIntent.js) and [recommendation fixture](examples/lessonServices.js) with the examples.

```sh
node ICF/examples/checkPipeline.mjs
node ICF/examples/runAdaptiveContext.mjs
node ICF/examples/runAdaptiveContext.mjs --expired
```

The expected outputs include a repaired Normalize step that reaches Emit, two recommendations scoring 80 and 95, and an expired fixture that stops at `AddContext.addAdaptiveContext` with `expired=3`. In the receiving project, also replay one successful action and its failure case against that project's own adapters. Compare the stored outcome and the emitted event before accepting the update.

# Intent-Centric Framework Wiki

ICF organizes a meaningful application action into six named stages. Use the wiki to look up a stage, inspect its contract and find a working example. [Open the ICF wiki](https://bryantfriend.github.io/learn_ICF/).

## Explore the wiki and course

- [Set up the framework](https://bryantfriend.github.io/learn_ICF/#setup) and run your first Intent with the supplied template.
- Open a topic such as [the Intent envelope](https://bryantfriend.github.io/learn_ICF/#lesson/intent-envelope) or [interpreting a failure trace](https://bryantfriend.github.io/learn_ICF/#lesson/failure-traces). Use the sidebar or search to jump to another topic.
- Browse the [worked example library](https://bryantfriend.github.io/learn_ICF/#examples) and follow an action from its inputs through the named stages to its outcome.
- Find a named helper in the [API reference](https://bryantfriend.github.io/learn_ICF/#api) and open its implementation.
- Practice with JavaScript exercises, concept questions and project plans in the [academy](https://bryantfriend.github.io/learn_ICF/academy.html). Each activity links to its wiki topic and supporting source. Course progress stays in the current browser.
- Run the [library sandbox](https://bryantfriend.github.io/learn_ICF/reference.html#mission), change the scenario and follow the named step that passes or stops the loan.
- Use the [template quick start](Template/README.md) to try the framework in a project. Explore the [JavaScript contract](Template/ICF.md), [Adaptive Context guide](Template/ADAPTIVE_CONTEXT.md) and [Roblox project](using%20ICF%20in%20Roblox/sample-project/README.md).

## Run the site locally

Download or clone this repository. With a local copy and Node.js 22 or newer, you can read the wiki and run the exercises offline. The fonts, examples and framework source are included. Start the bundled preview server in the repository root.

```sh
node serve.cjs
```

Open [the local wiki](http://127.0.0.1:4173/) and keep the server running while studying. Press Ctrl+C in the terminal to stop it.

To run the template fixtures directly, use a second terminal in the same directory.

```sh
node Template/ICF/examples/checkPipeline.mjs
node Template/ICF/examples/runAdaptiveContext.mjs
```

The first command shows success and failure traces. The second compares recommendations with different evidence.

## Reading the original specifications

The [original notes](Core.docx) describe a resolve step. The current template places the primary state change in Process and user feedback in Emit. The [formal specification](ICF_Formal_Specification_v1.0.pdf) describes rollback and durable audit. The supplied JavaScript runner returns an in-memory trace. Applications supply their transaction and delivery guarantees. See the [technical reference](Documents/ICF_Technical_Reference_for_AI.md) for the architecture and the [runner](Template/ICF/engine/pipeline.js) for the implementation.

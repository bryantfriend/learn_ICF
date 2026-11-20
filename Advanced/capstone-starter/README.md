# Advanced Capstone Starter

> Learning scaffold: this pack predates the current Template. Its helper signatures, CommonJS/Luau structure, and names such as `finalize` are exercises, not a drop-in ICF implementation.

## Adapt it to your current template

1. Declare and register a named Intent with actor, payload, context, metadata, and all six stage groups.
2. Check raw inputs in Validate before Normalize. Then run AddContext, Authorize, Process, and Emit. Do not copy an older normalize-first runner into your project.
3. Put reusable named helpers in the corresponding Core or Domain stage folder and expose them through the stage registry.
4. Wrap helper outcomes in the template contracts: `{ ok: true, intent: intent }` or `{ ok: false, errors: ["Reason"] }`. Include explicit pass-through steps.
5. Map older `finalize` helpers to Emit. The runner does not roll back a committed Process change if Emit fails. Test retries without duplicating effects.
6. Test success, malformed input, denied ownership, and processing/delivery failures. Derive permissions from authenticated identity and authoritative state, never the visible UI tab.

Use the [field guide](../../reference.html#template) and [actual demo Intent](../../Template/ICF/Intents/DemoIntent.js) as your reference.

## Original helper assignment

Build a production-style `settleTournamentPayouts` workflow.

Goal:
- register an orchestration map
- expose dependencies and reliability gates
- classify failures and escalation paths
- record observability data and finalize safely

Suggested order:
1. Start with `src/workflows/settleTournamentPayouts.js`
2. Complete reliability rules in `src/reliability`
3. Wire observability and finalize helpers
4. Return a clear result for success, retry, or manual review

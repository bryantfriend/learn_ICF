# Beginner Capstone Starter

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

Build a complete `account/deposit` feature with the full ICF path.

Goal:
- turn a deposit request into a stable intent
- validate and normalize the payload
- build context from state
- authorize the action
- process a safe state update
- finalize with an audit entry

Suggested order:
1. Finish `src/core/createIntent.js`
2. Wire validators in `src/core/validators.js`
3. Complete the account modules in `src/domain/account`
4. Run the feature from `src/domain/account/runDepositFeature.js`

What success should look like:
- the returned `nextState` has a higher account balance
- the original state is not mutated
- the audit array gets a new entry
- invalid payloads return a clear failure result

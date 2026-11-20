# Roblox Capstone Starter

> Learning scaffold: this pack predates the current Template. Its helper signatures, CommonJS/Luau structure, and names such as `finalize` are exercises, not a drop-in ICF implementation.

## Adapt it to your current template

1. Declare and register a named Intent with actor, payload, context, metadata, and all six stage groups.
2. Check raw inputs in Validate before Normalize. Then run AddContext, Authorize, Process, and Emit. Do not copy an older normalize-first runner into your project.
3. Put reusable named helpers in the corresponding Core or Domain stage folder and expose them through the stage registry.
4. Return a Luau table from each step. Use `return { ok = true, intent = intent }` for a pass-through or `return { ok = false, errors = { "Reason" } }` for a failure.
5. Map older `finalize` helpers to Emit. The runner does not roll back a committed Process change if Emit fails. Test retries without duplicating effects.
6. Test success, malformed input, denied ownership, and processing/delivery failures. Derive permissions from authenticated identity and authoritative state, never the visible UI tab.

Use the [field guide](../../reference.html#template) for the execution contract and the [Roblox runner exercise](../../studio.html#roblox-intent-runner) for platform practice.

## Original helper assignment

Build a full demo feature flow for a Roblox shop purchase.

Goal:
- collect client input in `StarterPlayerScripts`
- send a request through a RemoteEvent in `ReplicatedStorage`
- receive the request in `ServerScriptService`
- run validate, context, authorize, process, and finalize through ModuleScripts
- send feedback back to the player

Suggested order:
1. Start from the LocalScript
2. Wire the shared contract module
3. Complete the server handler and ModuleScripts
4. Compare your result with the larger `sample-project` folder if you want a fuller reference

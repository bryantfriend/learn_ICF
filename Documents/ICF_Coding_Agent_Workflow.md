# ICF Coding Agent Workflow

Use this workflow when preparing a coding-agent brief. A maintainer working locally can follow the same Intent declaration and run the same checks directly. Start with the [manual debugging walkthrough](../Template/README.md#diagnose-a-bug).

## Project references

Read the [current implementation contract](../Template/ICF.md) and [project guidance](../Template/AGENTS.md) before writing a brief. For scoring work, include the [Adaptive Context contract](../Template/ADAPTIVE_CONTEXT.md). The [source map](../README.md#reading-the-original-specifications) explains how the original specification and core notes relate to the current implementation.

## Agent Selection Rule

When asked to prepare agent prompts, recommend two available agents before writing the prompts.

Choose from:
- GPT-5.5 Low
- GPT-5.5 Medium
- GPT-5.5 High
- GPT-5.5 Extra High
- Gemini 3.5 Flash Low
- Gemini 3.5 Flash High
- Gemini 3.1 Pro Low
- Gemini 3.1 Pro High
- Claude Sonnet 4.6
- Claude Opus 4.6
- GPT-OSS 120B Medium

## Output Format

For a model-selection and prompt-writing request, include the following.

1. Recommended Agent #1
2. Recommended Agent #2
3. Why these agents
4. Prompt for Agent #1
5. Prompt for Agent #2

## Coding Style Rules

- No arrow functions
- No optional chaining
- No nullish coalescing
- No crypto API
- Clear variable names
- Clear stage separation
- Explicit helper functions
- No clever shortcuts
- Do not touch legacy code unless necessary
- Preserve working behavior

## ICF Implementation Rules

Register the Intent factory during setup. For each request, create a fresh Intent and run its six stage groups in order.

1. Validate
2. Normalize
3. AddContext
4. Authorize
5. Process
6. Emit

Each stage group needs at least one named step. A plain pass-through step returns `{ ok: true, intent: intent }`. Record the local command and expected result alongside each requested change so another person can verify it.

## File Structure Rule

Each validator, normalizer, context adder, authorizer, processor, and emitter should live in its own file.

Base registry files should collect them:

- validators.js
- normalizers.js
- contextProviders.js
- authorizers.js
- processors.js
- emitters.js

Intent files should import the base registry and reference stage functions clearly.

## Default Model Guidance

Use GPT-5.5 Medium for normal development.

Use GPT-5.5 High or Extra High for:
- architecture
- difficult debugging
- major refactors
- pipeline design
- Firestore sync logic
- complex ICF systems

Use Claude Sonnet 4.6 for:
- clean implementation
- readable code
- refactoring messy files
- preserving structure

Use Gemini 3.5 Flash High for:
- fast prototypes
- UI experiments
- HTML/CSS/SVG upgrades
- simple game/lesson interactions

Use Gemini 3.1 Pro High for:
- architecture planning
- long-context analysis
- system design

Use GPT-OSS 120B Medium for:
- boilerplate
- repetitive helper files
- simple implementation tasks

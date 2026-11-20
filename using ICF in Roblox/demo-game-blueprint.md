# Roblox ICF Demo Game Blueprint

This blueprint uses the module names from the [historical Roblox sample](sample-project/README.md). When implementing it in a new project, run Validate, Normalize, AddContext, Authorize, Process and Emit on the server. Map the sample's `BuildContext` and `Finalize` modules to AddContext and Emit. Add a named Normalize step even when the validated payload can pass through unchanged.

## Goal

Build a small Roblox demo game that proves the student understands how to use ICF across multiple features.

Recommended feature set:

- Shop purchase flow
- Reward chest claim flow
- Currency HUD
- Toast or popup feedback

## Suggested Roblox Layout

```text
ReplicatedStorage
  Remotes
    BuySword
    ClaimRewardChest
    UiFeedback
  IntentContracts
    BuySwordContract
    ClaimRewardChestContract
  SharedConstants
    IntentNames

ServerScriptService
  Handlers
    BuySword.server.lua
    ClaimRewardChest.server.lua
  Core
    IntentRunner.lua
    Result.lua
    Audit.lua
  Domain
    Shop
      Validators.lua
      BuildContext.lua
      ProcessPurchase.lua
      FinalizePurchase.lua
    Rewards
      Validators.lua
      BuildContext.lua
      ProcessChestClaim.lua
      FinalizeChestClaim.lua

StarterPlayer
  StarterPlayerScripts
    ShopButton.client.lua
    RewardChest.client.lua
    UiFeedback.client.lua
```

## Feature 1: Shop Purchase

Flow:

1. `ShopButton.client.lua` captures player input.
2. It fires `Remotes.BuySword`.
3. `BuySword.server.lua` receives the request in `ServerScriptService`.
4. It builds a request object and passes it into `Core/IntentRunner.lua`.
5. The runner delegates to `Domain/Shop` modules.
6. The processor updates server-authoritative state.
7. Finalize sends feedback through `UiFeedback`.

## Feature 2: Reward Chest

Flow:

1. `RewardChest.client.lua` sends a claim request.
2. `ClaimRewardChest.server.lua` receives the request.
3. The runner delegates to reward-specific modules.
4. Validation checks chest availability and claim rules.
5. Process grants the reward on the server.
6. Finalize sends confirmation to the player.

## What The Student Should Be Able To Explain

- Why `ReplicatedStorage` holds shared contracts but not authoritative state.
- Why `ServerScriptService` owns the entry handlers and reusable server modules.
- Why `ModuleScripts` are split between `Core` and `Domain`.
- How `LocalScripts` gather input without owning important game truth.
- How multiple features can share one `IntentRunner`.

## Good Final Demo Outcome

The student should be able to open the project tree and point to:

- the client input file,
- the remote,
- the server handler,
- the core runner,
- the domain-specific validator/context/process/finalize modules,
- and the final player feedback path.

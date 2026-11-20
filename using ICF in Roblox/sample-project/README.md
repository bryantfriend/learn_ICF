# Roblox ICF Demo Game Sample

This historical sample predates the six-stage template. When porting its server runner, add an explicit Normalize group after Validate and map its Finalize helper to Emit. The [field guide](../../reference.html#reference) describes the current stage contract.

This sample project shows one practical way to structure ICF inside Roblox.

Included features:

- shop purchase flow
- reward chest claim flow
- shared `IntentRunner`
- domain-specific validators, context, process, and finalize modules
- client request scripts

## Roblox Services Used

- `StarterPlayer/StarterPlayerScripts`
  client input and UI feedback scripts
- `ReplicatedStorage/IntentContracts`
  shared request definitions
- `ReplicatedStorage/Remotes`
  expected RemoteEvents in Studio:
  `BuySword`, `ClaimRewardChest`, `UiFeedback`
- `ServerScriptService/Handlers`
  authoritative remote entry points
- `ServerScriptService/Core`
  shared ICF runner and result helpers
- `ServerScriptService/Domain`
  feature-specific stage logic

## Expected Setup In Studio

Create these `RemoteEvent` instances in `ReplicatedStorage/Remotes`:

- `BuySword`
- `ClaimRewardChest`
- `UiFeedback`

This sample assumes a simple player state shape like:

```lua
local playerState = {
	coins = 250,
	inventory = {},
	claimedChests = {}
}
```

The code is intended as a teaching sample, so some persistence and replication details are simplified on purpose.

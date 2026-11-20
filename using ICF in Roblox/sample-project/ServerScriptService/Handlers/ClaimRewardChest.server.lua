local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local ClaimRewardChestRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("ClaimRewardChest")
local IntentRunner = require(ServerScriptService.Core.IntentRunner)
local PlayerStateStore = require(ServerScriptService.Core.PlayerStateStore)
local RewardsDomain = require(ServerScriptService.Domain.Rewards)

ClaimRewardChestRemote.OnServerEvent:Connect(function(player, payload)
	local request = {
		player = player,
		playerState = PlayerStateStore.get(player),
		type = "ClaimRewardChestIntent",
		payload = payload
	}

	IntentRunner.run(request, RewardsDomain)
end)

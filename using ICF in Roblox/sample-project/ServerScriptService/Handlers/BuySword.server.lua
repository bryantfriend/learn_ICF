local ReplicatedStorage = game:GetService("ReplicatedStorage")
local ServerScriptService = game:GetService("ServerScriptService")

local BuySwordRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("BuySword")
local IntentRunner = require(ServerScriptService.Core.IntentRunner)
local PlayerStateStore = require(ServerScriptService.Core.PlayerStateStore)
local ShopDomain = require(ServerScriptService.Domain.Shop)

BuySwordRemote.OnServerEvent:Connect(function(player, payload)
	local request = {
		player = player,
		playerState = PlayerStateStore.get(player),
		type = "BuySwordIntent",
		payload = payload
	}

	IntentRunner.run(request, ShopDomain)
end)

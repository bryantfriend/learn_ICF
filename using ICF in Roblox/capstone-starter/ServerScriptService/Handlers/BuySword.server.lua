local ReplicatedStorage = game:GetService("ReplicatedStorage")
local BuySwordRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("BuySword")
local IntentRunner = require(script.Parent.Parent.Core.IntentRunner)
local ShopModules = require(script.Parent.Parent.Domain.Shop.ShopModules)

BuySwordRemote.OnServerEvent:Connect(function(player, request)
	local result = IntentRunner.run(player, request, ShopModules)
	print(result.ok)
end)

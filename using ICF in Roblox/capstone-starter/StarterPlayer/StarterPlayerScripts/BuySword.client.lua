local ReplicatedStorage = game:GetService("ReplicatedStorage")
local BuySwordRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("BuySword")
local BuySwordContract = require(ReplicatedStorage:WaitForChild("IntentContracts"):WaitForChild("BuySwordContract"))

local request = BuySwordContract.new("sword_bronze")
BuySwordRemote:FireServer(request)

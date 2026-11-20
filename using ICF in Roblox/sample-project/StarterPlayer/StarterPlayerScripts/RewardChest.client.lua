local ReplicatedStorage = game:GetService("ReplicatedStorage")

local ClaimRewardChestRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("ClaimRewardChest")

local function claimChest(chestId)
	ClaimRewardChestRemote:FireServer({
		chestId = chestId
	})
end

-- Example call for the demo game.
claimChest("Chest01")

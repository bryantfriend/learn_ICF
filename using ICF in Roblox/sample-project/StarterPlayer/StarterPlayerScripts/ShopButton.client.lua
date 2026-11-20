local ReplicatedStorage = game:GetService("ReplicatedStorage")

local BuySwordRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("BuySword")

local function buySword(itemId)
	BuySwordRemote:FireServer({
		itemId = itemId
	})
end

-- Example call for the demo game.
buySword("Sword01")

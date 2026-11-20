local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UiFeedbackRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("UiFeedback")

UiFeedbackRemote.OnClientEvent:Connect(function(message)
	if message.type == "PurchaseConfirmed" then
		print("Purchased:", message.itemId, "Coins left:", message.remainingCoins)
	elseif message.type == "RewardChestConfirmed" then
		print("Chest opened:", message.chestId, "Coins now:", message.currentCoins)
	end
end)

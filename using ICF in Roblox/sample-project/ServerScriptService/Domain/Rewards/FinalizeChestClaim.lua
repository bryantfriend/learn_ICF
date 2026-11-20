local Result = require(script.Parent.Parent.Parent.Core.Result)
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UiFeedbackRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("UiFeedback")

local FinalizeChestClaim = {}

function FinalizeChestClaim.run(request, context, processData)
	UiFeedbackRemote:FireClient(request.player, {
		type = "RewardChestConfirmed",
		chestId = processData.chestId,
		rewardCoins = processData.rewardCoins,
		currentCoins = processData.currentCoins
	})

	return Result.accept({
		feedback = "reward-confirmed"
	})
end

return FinalizeChestClaim

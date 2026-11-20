local Result = require(script.Parent.Parent.Parent.Core.Result)

local ProcessChestClaim = {}

function ProcessChestClaim.run(request, context)
	local playerState = request.playerState
	local claimedChests = playerState.claimedChests or {}

	playerState.coins = (playerState.coins or 0) + context.rewardCoins
	claimedChests[context.chestId] = true
	playerState.claimedChests = claimedChests

	return Result.accept({
		chestId = context.chestId,
		rewardCoins = context.rewardCoins,
		currentCoins = playerState.coins
	})
end

return ProcessChestClaim

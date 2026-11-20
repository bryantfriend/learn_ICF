local BuildContext = {}

function BuildContext.build(request)
	local payload = request.payload
	local playerState = request.playerState
	local chestId = payload.chestId

	return {
		chestId = chestId,
		rewardCoins = 50,
		alreadyClaimed = playerState.claimedChests and playerState.claimedChests[chestId] == true
	}
end

return BuildContext

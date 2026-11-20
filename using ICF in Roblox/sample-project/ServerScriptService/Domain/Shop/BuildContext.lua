local BuildContext = {}

function BuildContext.build(request)
	local payload = request.payload
	local playerState = request.playerState
	local itemId = payload.itemId
	local price = ({
		Sword01 = 100,
		Shield01 = 150
	})[itemId]

	return {
		itemId = itemId,
		price = price,
		currentCoins = playerState.coins or 0,
		ownsItemAlready = playerState.inventory and playerState.inventory[itemId] == true,
		canAfford = (playerState.coins or 0) >= (price or 0)
	}
end

return BuildContext

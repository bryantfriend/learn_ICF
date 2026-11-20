local Result = require(script.Parent.Parent.Parent.Core.Result)

local ProcessPurchase = {}

function ProcessPurchase.run(request, context)
	local playerState = request.playerState
	local inventory = playerState.inventory or {}

	playerState.coins = (playerState.coins or 0) - context.price
	inventory[context.itemId] = true
	playerState.inventory = inventory

	return Result.accept({
		itemId = context.itemId,
		remainingCoins = playerState.coins
	})
end

return ProcessPurchase

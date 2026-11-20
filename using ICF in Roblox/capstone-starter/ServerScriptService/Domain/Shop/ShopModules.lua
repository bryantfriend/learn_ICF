local ShopModules = {}

function ShopModules.normalize(request)
	return {
		intentType = request.intentType,
		payload = {
			itemId = tostring(request.payload.itemId)
		}
	}
end

function ShopModules.validate(request)
	return request.intentType == "shop/buySword" and request.payload.itemId ~= ""
end

function ShopModules.buildContext(player, request)
	return {
		player = player,
		coins = 100,
		itemId = request.payload.itemId
	}
end

function ShopModules.authorize(context, request)
	return context.coins >= 25 and request.payload.itemId == "sword_bronze"
end

function ShopModules.process(context, request)
	return {
		itemId = request.payload.itemId,
		newCoinBalance = context.coins - 25
	}
end

function ShopModules.finalize(player, result)
	print(player.Name .. " bought " .. result.itemId)
end

return ShopModules

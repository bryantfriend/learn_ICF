local Result = require(script.Parent.Parent.Parent.Core.Result)

local PRICE_BY_ITEM = {
	Sword01 = 100,
	Shield01 = 150
}

local Validators = {}

function Validators.validate(request)
	local payload = request.payload or {}
	local playerState = request.playerState or {}
	local itemId = payload.itemId
	local errors = {}

	if type(itemId) ~= "string" or itemId == "" then
		table.insert(errors, "itemId is required")
	end

	if itemId and not PRICE_BY_ITEM[itemId] then
		table.insert(errors, "item is not sold in this shop")
	end

	if itemId and playerState.inventory and playerState.inventory[itemId] then
		table.insert(errors, "player already owns this item")
	end

	if #errors > 0 then
		return Result.reject("validate", errors)
	end

	return Result.accept({
		price = PRICE_BY_ITEM[itemId]
	})
end

return Validators

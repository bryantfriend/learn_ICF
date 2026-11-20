local BuySwordContract = {}

function BuySwordContract.new(itemId)
	return {
		intentType = "shop/buySword",
		payload = {
			itemId = itemId
		}
	}
end

return BuySwordContract

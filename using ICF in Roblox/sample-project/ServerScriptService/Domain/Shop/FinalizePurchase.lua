local Result = require(script.Parent.Parent.Parent.Core.Result)
local ReplicatedStorage = game:GetService("ReplicatedStorage")

local UiFeedbackRemote = ReplicatedStorage:WaitForChild("Remotes"):WaitForChild("UiFeedback")

local FinalizePurchase = {}

function FinalizePurchase.run(request, context, processData)
	UiFeedbackRemote:FireClient(request.player, {
		type = "PurchaseConfirmed",
		itemId = processData.itemId,
		remainingCoins = processData.remainingCoins
	})

	return Result.accept({
		feedback = "purchase-confirmed"
	})
end

return FinalizePurchase

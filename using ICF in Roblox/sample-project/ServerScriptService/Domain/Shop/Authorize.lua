local Result = require(script.Parent.Parent.Parent.Core.Result)

local Authorize = {}

function Authorize.authorize(request, context)
	if context.ownsItemAlready then
		return Result.reject("authorize", { "item already owned" })
	end

	if not context.canAfford then
		return Result.reject("authorize", { "not enough coins" })
	end

	return Result.accept()
end

return Authorize

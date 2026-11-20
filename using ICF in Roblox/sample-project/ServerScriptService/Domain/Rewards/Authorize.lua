local Result = require(script.Parent.Parent.Parent.Core.Result)

local Authorize = {}

function Authorize.authorize(request, context)
	if context.alreadyClaimed then
		return Result.reject("authorize", { "reward chest already claimed" })
	end

	return Result.accept()
end

return Authorize

local Result = require(script.Parent.Parent.Parent.Core.Result)

local Validators = {}

function Validators.validate(request)
	local payload = request.payload or {}
	local playerState = request.playerState or {}
	local chestId = payload.chestId
	local errors = {}

	if type(chestId) ~= "string" or chestId == "" then
		table.insert(errors, "chestId is required")
	end

	if playerState.claimedChests and playerState.claimedChests[chestId] then
		table.insert(errors, "chest already claimed")
	end

	if #errors > 0 then
		return Result.reject("validate", errors)
	end

	return Result.accept()
end

return Validators

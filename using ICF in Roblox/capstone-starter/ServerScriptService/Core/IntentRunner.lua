local IntentRunner = {}

function IntentRunner.run(player, request, modules)
	local normalizedRequest = modules.normalize(request)
	if not modules.validate(normalizedRequest) then
		return { ok = false, reason = "validation_failed" }
	end

	local context = modules.buildContext(player, normalizedRequest)
	if not modules.authorize(context, normalizedRequest) then
		return { ok = false, reason = "not_authorized" }
	end

	local result = modules.process(context, normalizedRequest)
	modules.finalize(player, result)

	return { ok = true, result = result }
end

return IntentRunner

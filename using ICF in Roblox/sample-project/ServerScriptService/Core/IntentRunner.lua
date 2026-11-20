local Result = require(script.Parent.Result)

local IntentRunner = {}

function IntentRunner.run(request, domain)
	local validationResult = domain.Validators.validate(request)
	if not validationResult.ok then
		return validationResult
	end

	local context = domain.BuildContext.build(request)
	local authorizationResult = domain.Authorize.authorize(request, context)
	if not authorizationResult.ok then
		return authorizationResult
	end

	local processResult = domain.Process.run(request, context)
	if not processResult.ok then
		return processResult
	end

	local finalizeResult = domain.Finalize.run(request, context, processResult.data)
	if finalizeResult and finalizeResult.ok == false then
		return finalizeResult
	end

	return Result.accept({
		context = context,
		process = processResult.data,
		finalize = finalizeResult and finalizeResult.data or {}
	})
end

return IntentRunner

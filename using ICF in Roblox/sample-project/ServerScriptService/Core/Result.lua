local Result = {}

function Result.accept(data)
	return {
		ok = true,
		data = data or {}
	}
end

function Result.reject(stage, errors)
	return {
		ok = false,
		stage = stage,
		errors = errors or {}
	}
end

return Result

local PlayerStateStore = {}

local playerStates = {}

function PlayerStateStore.get(player)
	if not playerStates[player] then
		playerStates[player] = {
			coins = 250,
			inventory = {},
			claimedChests = {}
		}
	end

	return playerStates[player]
end

return PlayerStateStore

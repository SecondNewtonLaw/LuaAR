local StateMachine = {}

local Events = {
  "Shat" = function() print("i caca") end,
  "WokeUp" = function() print("I woke up in a new bugati") end
}
local currentState = "Default"

function StateMachine.ChangeState(newState: string)
  local event = Events[newState]
  if event then event() end

   currentState = newState
end
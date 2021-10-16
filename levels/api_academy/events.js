const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");

const INITIAL_STATE = {
  initiation: {
    lastShownHouseNotification: 0,
    enteredMazeFirstTime: false,
  },
};

const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(WORLD_STATE_KEY));

  processInitiationEvents(event, world, worldState);

  world.setState(WORLD_STATE_KEY, worldState);
};

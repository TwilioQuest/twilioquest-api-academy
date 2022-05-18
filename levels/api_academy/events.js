const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const { WORLD_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
  initiation: {
    lastShownHouseNotification: 4,
    enteredMazeFirstTime: false,
  },
};

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(WORLD_STATE_KEY));

  processInitiationEvents(event, world, worldState);

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "triggerAcademyGates"
  ) {
    if (worldState.initiation.lastShownHouseNotification === 4) {
      // do stuff
      world.showEntities("exit_to_inside");
      // world.hideEntities("door");
      world.forEachEntities("door", (door) => door.state.fsm.action("open"));
    } else {
      world.hideEntities("exit_to_inside");
    }
  }

  world.setState(WORLD_STATE_KEY, worldState);
};

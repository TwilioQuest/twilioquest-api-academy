const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const packageInfo = require("../../package.json");
const updateQuestLogWhenComplete = require("./events/updateQuestLogWhenComplete");

const INITIAL_STATE = {
  initiation: {
    lastShownHouseNotification: 4,
    enteredMazeFirstTime: false,
  },
};

const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

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

  updateQuestLogWhenComplete({
    notification:
      'I\'ve completed everything in the <span class="highlight">API Academy</span> for now!',
    log: "I've completed everything in the API Academy for now!",
    event,
    world,
    worldStateKey: WORLD_STATE_KEY,
    version: packageInfo.version,
  });

  world.setState(WORLD_STATE_KEY, worldState);
};

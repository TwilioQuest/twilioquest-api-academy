const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const { WORLD_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
  initiation: {
    lastShownHouseNotification: 0,
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

  updateQuestLogWhenComplete({
    notification:
      'I\'ve ready to enter <span class="highlight">API Academy</span>! I should make my way to the gates!',
    log: "I've proved I'm worthy to enter the <span class=\"highlight\">API Academy</span>!",
    event,
    world,
    worldStateKey: WORLD_STATE_KEY,
    version: packageInfo.version,
    minimumTargetVersion: "1.2.6",
  });

  world.setState(WORLD_STATE_KEY, worldState);
};

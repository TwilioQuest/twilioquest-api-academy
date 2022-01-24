const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const packageInfo = require("../../package.json");
const updateQuestLogWhenComplete = require("./events/updateQuestLogWhenComplete");

const INITIAL_STATE = {
  initiation: {
    hasSpell: false,
    enteredPerimeterFirstTime: false,
  },
};

const INITIAL_LEVEL_STATE = {
  initiation: {
    hasSpell: false,
    enteredPerimeterFirstTime: false,
  },
};

const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";
const LEVEL_STATE_KEY = "API_ACADEMY_LEVEL_STATE";

module.exports = async function (event, world) {
  console.log('hello')
  console.log(world)
  const worldState = merge(INITIAL_STATE, world.getState(WORLD_STATE_KEY));
  //const levelState = merge(INITIAL_LEVEL_STATE, world.getState(LEVEL_STATE_KEY));

  processInitiationEvents(event, world, worldState);

  if (worldState.initiation.lastShownHouseNotification === 4) { 
    // do stuff
    world.showEntities('exit_2');
    world.hideEntities('door');
  } else {
    world.hideEntities('exit_2');
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

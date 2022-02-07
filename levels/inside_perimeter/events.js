const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const packageInfo = require("../../package.json");
const updateQuestLogWhenComplete = require("./events/updateQuestLogWhenComplete");

const LEVEL_STATE = {
  insidePerimeter: {
    hasWand: false,
    enteredPerimeterFirstTime: false,
    destroyedEntities: [],
    clearedCatacombsEntrance: false
  }
};


const CLEAR_STATE = {
  insidePerimeter: {
    hasWand: true,
    enteredPerimeterFirstTime: false,
    destroyedEntities: [],
    clearedCatacombsEntrance: false
  }
};


const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

module.exports = async function (event, world) {
  const worldState = merge(LEVEL_STATE, world.getState(WORLD_STATE_KEY));
  //const worldState = CLEAR_STATE;

  console.log(event.name)
  console.log(worldState.insidePerimeter)

  /*
   * Returns level to last object state
   */
  if (event.name === "mapDidLoad") {
    console.log('resetting map after load');
    world.destroyEntities(({instance}) => worldState.insidePerimeter.destroyedEntities.includes(instance.group));

    if (!worldState.insidePerimeter.clearedCatacombsEntrance) {
      console.log('havent cleared brambles, hiding exit');
      world.hideEntities('exit_to_catacombs');
    } else {
      console.log('brambles cleared, showing exit');
      world.showEntities('exit_to_catacombs');
    }
  }


  /*
   * Checks for interactions with "spellable" objects
   * Currently using 'hasWand' state as placeholder for carrying accessory wand
   */
  if (
    event.name === "playerDidInteract"
    && worldState.insidePerimeter.hasWand) {
    if (event.target.key === "bramble_block") {
      world.destroyEntities(({instance}) => instance.group == event.target.group);

      if (!worldState.insidePerimeter.destroyedEntities.includes(event.target.group)) {
        worldState.insidePerimeter.destroyedEntities.push(event.target.group);
      }

      if (event.target.group === "bramble_catacombs") {
        console.log('cleared catacombs entrance, updating state')
        worldState.insidePerimeter.clearedCatacombsEntrance = true;
        world.showEntities('exit_to_catacombs');
      }
    }
  } else if (
    event.name === "playerDidInteract" 
    && !worldState.insidePerimeter.hasWand) {
      console.log("no magic yet, kid");
  }


  /*
   * Checks for completition of objective
   * Sets hasWand state
   * This can be eliminated when item capability is added
   */
  if (event.name === "objectiveCompleted" || event.name === "objectiveCompletedAgain") {
    worldState.insidePerimeter.hasWand = true;
  }



  updateQuestLogWhenComplete({
    notification:
      'I\'ve completed everything in the <span class="highlight">API Academy Inside Perimeter</span> for now!',
    log: "I've completed everything in the API Academy Inside Perimeter for now!",
    event,
    world,
    worldStateKey: WORLD_STATE_KEY,
    version: packageInfo.version,
  });

  world.setState(WORLD_STATE_KEY, worldState);
};

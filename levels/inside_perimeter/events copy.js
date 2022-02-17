const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const packageInfo = require("../../package.json");
const updateQuestLogWhenComplete = require("./events/updateQuestLogWhenComplete");

const LEVEL_STATE = {
  destroyedEntities: [],
  unlockedEntities: [],
  unhackableEntities: [],
  insidePerimeter: {
    hasWand: false,
    enteredPerimeterFirstTime: false,
  },
  insideCatacombs: {
    keySpellCount: 0,
    hasCredentials: false
  }
};


const CLEAR_STATE = {
  destroyedEntities: [],
  unlockedEntities: [],
  unhackableEntities: [],
  insidePerimeter: {
    hasWand: false,
    enteredPerimeterFirstTime: false,
  },
  insideCatacombs: {
    keySpellCount: 0,
    hasCredentials: false
  }
};




const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

module.exports = async function (event, world) {
  const worldState = merge(LEVEL_STATE, world.getState(WORLD_STATE_KEY));
  //const worldState = CLEAR_STATE;

  console.log(event.name)
  console.log(event.target)
  console.log(worldState)

  /*
   * Returns level to last object state
   */
  if (event.name === "mapDidLoad") {
    console.log('resetting map after load');

    // destroy all previously destroyed objects
    world.destroyEntities(({instance}) => worldState.destroyedEntities.includes(instance.group));

    // show all previously unlocked objects
    world.showEntities(({instance}) => worldState.unlockedEntities.includes(instance.group));

    // change hack status of all no longer hackable items
    world.forEachEntities(({instance}) => worldState.unhackableEntities.includes(instance.group), entity => {
      entity.hackable = false;
    });

    // if (!worldState.insidePerimeter.clearedCatacombsEntrance) {
    //   console.log('havent cleared brambles, hiding exit');
    //   world.hideEntities('exit_to_catacombs');
    // } else {
    //   console.log('brambles cleared, showing exit');
    //   world.showEntities('exit_to_catacombs');
    // }



  }


  /*
   * Checks for interactions with "spellable" objects
   * Currently using 'hasWand' state as placeholder for carrying accessory wand
   */
  if (event.name === "playerDidInteract") {
    console.log(`interacting with ${event.target.key}`)

    if (event.target.spellable) {
      console.log('object spellable')

      if (worldState.insidePerimeter.hasWand) {
        console.log('operator has wand')

        // perform spell associated with object
        spells[event.target.spell_type](event);


        // if (event.target.key === "bramble_block") {
        //   world.destroyEntities(({instance}) => instance.group == event.target.group);
    
        //   if (!worldState.destroyedEntities.includes(event.target.group)) {
        //     worldState.destroyedEntities.push(event.target.group);
        //   }
    
        //   if (event.target.group === "bramble_catacombs") {
        //     console.log('cleared catacombs entrance, updating state')
        //     worldState.insidePerimeter.clearedCatacombsEntrance = true;
        //     world.showEntities('exit_to_catacombs');
        //   }
        // }
      } else {
        console.log("no magic yet, kid");
        world.showNotification("Go find the toolshed and see if there is an extra wand inside! You'll need a wand and some spells to get through here.")
      }
    } else {
      // NPC or other objects
      
      if (event.target.key == 'ghost') {
        const {env} = world.getContext();

        if (
          env.hasOwnProperty('TQ_TWILIO_ACCOUNT_SID') 
          && env.hasOwnProperty('TQ_TWILIO_AUTH_TOKEN')
        ) worldState.insideCatacombs.hasCredentials = true;
      }

      if (event.target.key == 'statue_credential') {
        world.showNotification('Welcome to the Catacombs. Now that I have your Twilio credentials, you may complete the challenges before you.')
      }

    }
  }


  /*
   * Checks for completion of objectives
   * Makes necessary updates
   * Wand one can be eliminated when item capability is added
   */
  if (event.name === "objectiveCompleted" || event.name === "objectiveCompletedAgain") {
    switch (event.objective) {
      case 'twilio_api_setup':
        worldState.insideCatacombs.hasCredentials = true;
        unhackObject('statue_credentials');
        destroyObject('catacombs_barrier');
        break;
      case 'obtain_spell':
        worldState.insidePerimeter.hasWand = true;
        break;
      default:
        console.log(`${event.objective} completed`);
    } 
  }

  


  const unlockObject = group => {
    world.showEntities(({instance}) => instance.group === group || instance.key == group);
    worldState.unlockedEntities.push(group)
  }

  const destroyObject = group => {
    world.destroyEntities(({instance}) => instance.group === group || instance.key == group);
    worldState.destroyedEntities.push(group);
  }

  const unhackObject = group => {
    world.forEachEntities(({instance}) => instance.group === group || instance.key == group, entity => {
      entity.hackable = false;
    });
    worldState.unhackableEntities.push(group);
  }

  const disappear = event => {
    // Destroy object and add it to array of destroyed objects for later reset on map load
    destroyObject(event.target.group);

    // If destruction of object is meant to trigger unlocking of a new object, do that now
    if (event.target.unlocksObject) {
      unlockObject(event.target.unlocksObject);
    }
  }
  
  const move = event => {
  
  }
  
  
  // const spells = [
  //   {type: 'disappear', execute: (entity) => {disappear(entity)}},
  //   {type: 'move', execute: (entity) => {move(entity)}},
  // ]

  const spells = {
    disappear: event => disappear(event),
    move: event => move(event)
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

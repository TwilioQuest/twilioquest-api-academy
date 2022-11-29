const merge = require("lodash.merge");
const { LOVELACE_TOWER_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
  obj1Complete: false,
  obj2Complete: false,
  obj3Complete: false,
  obj4Complete: false,
  obj5Complete: false,
};

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(LOVELACE_TOWER_STATE_KEY));

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(worldState);

  // LEVEL FUNCTIONALITY OVERVIEW

// Has player completed Objective 1/2/3? (obj1Compelete, obj2Complete, obj3Complete)

// If No: 
// [] Doors 1/2/3 are locked respectively with Operator observation: "I need to complete the next objective first."

// If Yes: 
// [] Door 1/2/3 is open (door objects should be hidden from view on the map)


// Has player completed all four Tower objectives? (obj4Complete)

// If No:
// [x] Secret Library Door is locked and triggers library-door.pug dialogue
// [x] Groundskeeper says dialogue 1

// If Yes: 
// [] Spell in inventory
// [] Sparkle animation appears on secret Library door
// [x] Groundskeeper says dialogue 2
// [] Library door is unlocked and player can teleport to library map


// Has the player completed the final objective? (obj5Complete)

// If No: 
// [] Exit door from library is locked with Operator observation

// If Yes:
// [] Sparkle animation appears on exit door and is interactable
// [] Previous entry door back into Tower becomes locked




  world.setState(LOVELACE_TOWER_STATE_KEY, worldState);
};

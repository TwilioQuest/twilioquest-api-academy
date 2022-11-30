const merge = require("lodash.merge");
const { LOVELACE_TOWER_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
  obj1Complete: false,
  obj2Complete: false,
  obj3Complete: false,
  obj4Complete: false,
  obj5Complete: false,
  fredricNoteTriggered: false,
};

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(LOVELACE_TOWER_STATE_KEY));

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(`event target ${event.target && event.target.key}`);
  console.log(worldState);

// Library exit not accessible until obj5Complete === true
world.disableTransitionAreas("exit_to_library_corridor");

// Operator observations on barriers
if (event.name === "triggerAreaWasEntered" && event.target.key === "lockedDoorLibrary" && worldState.obj5Complete === false){
  world.showNotification(
    "I should complete the last objective to clean up this mess!"
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier1" && worldState.obj1Complete === false){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier2" && worldState.obj2Complete === false){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier3" && worldState.obj3Complete === false){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

// Remove objective barriers
if (worldState.obj1Complete === true){
  world.hideEntities(`api-hidden-door-1`);
};
if (worldState.obj2Complete === true){
  world.hideEntities(`api-hidden-door-2`);
};
if (worldState.obj3Complete === true){
  world.hideEntities(`api-hidden-door-3`);
};

// Once the final objective has been hacked and closed, hide books and empty shelves
if (worldState.obj5Complete === true){
  if (event.name === "objectiveDidClose" && event.target.objectiveName === "api-05-get-patch"){
    world.hideEntities(`bad-book`);
  };
  
  world.enableTransitionAreas("exit_to_library_corridor");

  // As player tries to leave, trigger Fredric conversation
  if (event.name === "triggerAreaWasEntered" && event.target.key === "fredricTrigger" && worldState.fredricNoteTriggered === false){
    world.startConversation("fredric-threat-lovelace", "fredricNeutral.png");
  };

  // When Fredric trigger closes, Fredric letter becomes interactable 
  if (event.name === "conversationDidEnd" && event.npc.conversation === "fredric-threat-lovelace"){
    world.forEachEntities("fredricNote", note => {
      note.interactable = true;
    });
    worldState.fredricNoteTriggered = true;
    // world.getState(HOUSE_CEREMONY_STATE_KEY.houseLovelaceComplete) = true;
  };
};

  world.setState(LOVELACE_TOWER_STATE_KEY, worldState);
};

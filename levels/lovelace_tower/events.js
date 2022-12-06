const merge = require("lodash.merge");
const { LOVELACE_TOWER_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
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
if (event.name === "triggerAreaWasEntered" && event.target.key === "lockedDoorLibrary" && !world.isObjectiveCompleted("api-05-get-patch")){
  world.showNotification(
    "I should complete the last objective to clean up this mess!"
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier1" && !world.isObjectiveCompleted("api-01-local-function")){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier2" && !world.isObjectiveCompleted("api-02-async-await")){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

if (event.name === "triggerAreaWasEntered" && event.target.key === "objectiveBarrier3" && !world.isObjectiveCompleted("api-03-fetch")){
  world.showNotification(
    "I need to complete the next objective before I can pass through to the next area."
  );
};

// Remove objective barriers
if (world.isObjectiveCompleted("api-01-local-function")){
  world.hideEntities(`api-hidden-door-1`);
};
if (world.isObjectiveCompleted("api-02-async-await")){
  world.hideEntities(`api-hidden-door-2`);
};
if (world.isObjectiveCompleted("api-03-fetch")){
  world.hideEntities(`api-hidden-door-3`);
};

// Once the final objective has been hacked and closed, hide books and empty shelves
if (world.isObjectiveCompleted("api-05-get-patch")){
  if (event.name === "objectiveDidClose"){
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
    world.updateQuestStatus(
      world.__internals.level.levelName,
      world.__internals.level.levelProperties.questTitle,
      "I should head back to the Main Hall now that I've completed the Lovelace Tower objectives.",
      true
    );
  };
};

  world.setState(LOVELACE_TOWER_STATE_KEY, worldState);
};

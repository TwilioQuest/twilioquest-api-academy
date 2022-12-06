const merge = require("lodash.merge");
const { LOVELACE_TOWER_STATE_KEY } = require("../../scripts/config");
const handleSpells = require("../../scripts/handleSpells");

const INITIAL_STATE = {
  insideLovelaceTower: {
    destroyedEntities: [],
    unlockedTransitions: [],
    hiddenEntities: [],
    openedDoors: [],
    entities: {
      "api-door-1": {
        spell: {
          unlock: {
            requirements: {
              enableLevelChange() {
                return true;
              },
            },
            successActions: {
              enableLevelChange({ world, worldState }) {
                world.enableTransitionAreas(
                  ({ instance }) => instance.key === "exit_to_lovelace_library"
                );
                worldState.insideLovelaceTower.openedDoors.push("api-door-1");
              },
            },
          },
        },
      },
    },
  },
  insideLibrary: {
    destroyedEntities: [],
    unlockedTransitions: [],
    hiddenEntities: [],
    openedDoors: [],
    entities: {
      "api-door-1": {
        spell: {
          unlock: {
            requirements: {
              enableLevelChange() {
                return true;
              },
            },
            successActions: {
              enableLevelChange({ world, worldState }) {
                world.enableTransitionAreas(
                  ({ instance }) => instance.key === "exit_to_lovelace_corridor"
                );
                worldState.insideLibrary.openedDoors.push("api-door-1");
              },
            },
          },
        },
      },
    },
  },
  fredricNoteTriggered: false,
};

module.exports = async function (event, world) {
  const worldState = merge(
    INITIAL_STATE,
    world.getState(LOVELACE_TOWER_STATE_KEY)
  );

  // Taken fom https://github.com/TwilioQuest/twilioquest-dev-fundamentals/blob/main/levels/tower_of_knowledge/events.js#:~:text=%7D-,//%20Match%20objectives%20to%20shelves%20they%20should%20unlock%20when%20an,%7D,-//%20Hide%20entities
  const unlockPairs = [
    ["api-01-local-function", "api-hidden-door-1"],
    ["api-02-async-await", "api-hidden-door-2"],
    ["api-03-fetch", "api-hidden-door-3"],
  ];

  const doorPairs = [["api-04-remote-and-local", "api-door-1"]];

  if (
    event.name === "objectiveCompleted" ||
    event.name === "objectiveCompletedAgain"
  ) {
    unlockPairs.forEach(([objectiveKey, hiddenDoorKey]) => {
      if (
        event.objective === objectiveKey &&
        !worldState.insideLovelaceTower.hiddenEntities.includes(hiddenDoorKey)
      ) {
        worldState.insideLovelaceTower.hiddenEntities.push(hiddenDoorKey);
      }
    });

    doorPairs.forEach(([objectiveKey, doorKey]) => {
      if (
        event.objective === objectiveKey &&
        !worldState.insideLovelaceTower.openedDoors.includes(doorKey)
      ) {
        worldState.insideLovelaceTower.openedDoors.push(doorKey);
      }
    });
  }

  // Hide entities
  [
    ...worldState.insideLovelaceTower.hiddenEntities,
    ...worldState.insideLibrary.hiddenEntities,
  ].forEach((hiddenEntityKey) => {
    world.hideEntities(hiddenEntityKey);
  });

  // Open doors
  [
    ...worldState.insideLovelaceTower.openedDoors,
    ...worldState.insideLibrary.openedDoors,
  ].forEach((openedDoorKey) => {
    world.forEachEntities(
      openedDoorKey,
      (door) => door.state && door.state.fsm && door.state.fsm.action("open")
    );
  });

  if (event.name === "playerDidInteract") {
    handleSpells(event, world, {
      ...worldState,
    });
  }

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(`event target ${event.target && event.target.key}`);
  console.log(worldState);

  // Operator observations on barriers
  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "lockedDoorLibrary" &&
    !world.isObjectiveCompleted("api-05-get-patch")
  ) {
    world.showNotification(
      "I should complete the last objective to clean up this mess!"
    );
  }

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "objectiveBarrier1" &&
    !world.isObjectiveCompleted("api-01-local-function")
  ) {
    world.showNotification(
      "I need to complete the next objective before I can pass through to the next area."
    );
  }

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "objectiveBarrier2" &&
    !world.isObjectiveCompleted("api-02-async-await")
  ) {
    world.showNotification(
      "I need to complete the next objective before I can pass through to the next area."
    );
  }

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "objectiveBarrier3" &&
    !world.isObjectiveCompleted("api-03-fetch")
  ) {
    world.showNotification(
      "I need to complete the next objective before I can pass through to the next area."
    );
  }

  // Once the final objective has been hacked and closed, hide books and empty shelves
  if (world.isObjectiveCompleted("api-01-local-function")) {
    if (
      event.name === "objectiveDidClose" &&
      event.target.objectiveName === "api-05-get-patch"
    ) {
      world.hideEntities(`bad-book`);
    }

    world.enableTransitionAreas("exit_to_library_corridor");

    // As player tries to leave, trigger Fredric conversation
    if (
      event.name === "triggerAreaWasEntered" &&
      event.target.key === "fredricTrigger" &&
      worldState.fredricNoteTriggered === false
    ) {
      world.startConversation("fredric-threat-lovelace", "fredricNeutral.png");
    }

    // When Fredric trigger closes, Fredric letter becomes interactable
    if (
      event.name === "conversationDidEnd" &&
      event.npc.conversation === "fredric-threat-lovelace"
    ) {
      world.forEachEntities("fredricNote", (note) => {
        note.interactable = true;
      });
      worldState.fredricNoteTriggered = true;
      // world.getState(HOUSE_CEREMONY_STATE_KEY) set houseLovelaceComplete = true;
    }
  }

  world.setState(LOVELACE_TOWER_STATE_KEY, worldState);
};

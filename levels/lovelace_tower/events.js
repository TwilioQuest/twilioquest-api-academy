const merge = require("lodash.merge");
const { LOVELACE_TOWER_STATE_KEY } = require("../../scripts/config");
const handleSpells = require("../../scripts/handleSpells");

const INITIAL_STATE = {
  insideLovelaceTower: {
    destroyedEntities: [],
    unlockedTransitions: [],
    hiddenEntities: [],
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
              enableLevelChange({ event, world, worldState }) {
                world.enableTransitionAreas(
                  ({ instance }) => instance.key === "exit_to_lovelace_library"
                );
                event.target.setInteractable(false);
                event.target.state.fsm.action("open");
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
              enableLevelChange({ event, world, worldState }) {
                world.enableTransitionAreas(
                  ({ instance }) => instance.key === "exit_to_lovelace_corridor"
                );
                event.target.setInteractable(false);
                worldState.insideLibrary.openedDoors.push("api-door-1");
              },
            },
          },
        },
      },
    },
  },
  obj4Complete: false,
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
  }

  // Hide entities
  [
    ...worldState.insideLovelaceTower.hiddenEntities,
    ...worldState.insideLibrary.hiddenEntities,
  ].forEach((hiddenEntityKey) => {
    world.hideEntities(hiddenEntityKey);
  });

  // Open doors
  worldState.insideLibrary.openedDoors.forEach((openedDoorKey) => {
    world.forEachEntities(
      openedDoorKey,
      (door) => door.state && door.state.fsm && door.state.fsm.action("open")
    );
  });

  if (event.name === "playerDidInteract") {
    if (event.target.key === "inscription-fragment") {
      world.startConversation(
        event.target.conversation,
        event.target.conversationAvatar
      );
    }

    handleSpells(event, world, {
      ...worldState,
    });
  }

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
      "I need to complete the current objective before I can pass through to the next room."
    );
  }

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "objectiveBarrier2" &&
    !world.isObjectiveCompleted("api-02-async-await")
  ) {
    world.showNotification(
      "I need to complete the current objective before I can pass through to the next room."
    );
  }

  if (
    event.name === "triggerAreaWasEntered" &&
    event.target.key === "objectiveBarrier3" &&
    !world.isObjectiveCompleted("api-03-fetch")
  ) {
    world.showNotification(
      "I need to complete the current objective before I can pass through to the next room."
    );
  }

  // Set obj4Complete and make door no longer interactable
  if (world.isObjectiveCompleted("api-04-remote-and-local")) {
    worldState.obj4Complete = true;
    world.forEachEntities(`library-door-locked`, (libraryDoor) => {
      libraryDoor.interactable = false;
      libraryDoor.disableBody = true;
      libraryDoor.key = "";
    })
  }

  // Library door inside Lovelace Library interactable / not spellable before Obj 04 is complete / launches dialogue box
  if (event.name === "playerDidInteract") {
    if (event.target.key === "library-door-locked") {
      if (!world.isObjectiveCompleted("api-04-remote-and-local")) {
        world.startConversation(
          event.target.conversation,
          event.target.conversationAvatar
        );
      }
    }
  }

  // Make Fredric note interactable upon subsequent reentries into library
  if (worldState.fredricNoteTriggered === true) {
    world.forEachEntities("fredricNote", (note) => {
      note.interactable = true;
      disableBody = false;
    })
  }

  // if player interacts with note after initial trigger takes place
  if (
    event.name === "playerDidInteract" &&
    event.target.key === "fredricNote" &&
    worldState.fredricNoteTriggered === true
  ) {
    world.startConversation(
      "fredric-threat-lovelace",
      "fredricNeutral.png"
    );
  }

  // Once the final objective has been hacked and closed, hide books and empty shelves
  if (world.isObjectiveCompleted("api-05-get-patch")) {
    world.hideEntities(`badBook`);

    world.enableTransitionAreas("exit_to_library_corridor");

    // As player tries to leave, trigger Fredric conversation
    if (world.isObjectiveCompleted("api-05-get-patch")) {
      if (
        event.name === "triggerAreaWasEntered" &&
        event.target.key === "fredricTrigger" &&
        worldState.fredricNoteTriggered === false
      ) {
        world.startConversation(
          "fredric-threat-lovelace",
          "fredricNeutral.png"
        );
      }
    }

    // When Fredric trigger closes, Fredric letter becomes interactable
    if (
      event.name === "conversationDidEnd" &&
      event.npc.conversation === "fredric-threat-lovelace"
    ) {
      world.forEachEntities("fredricNote", (note) => {
        note.interactable = true;
        note.disableBody = false;
      });
      worldState.fredricNoteTriggered = true;
    }
  }

  world.setState(LOVELACE_TOWER_STATE_KEY, worldState);
};

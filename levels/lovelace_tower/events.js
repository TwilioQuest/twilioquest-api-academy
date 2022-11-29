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
                worldState.openedDoors.push("api-door-1");
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
                worldState.openedDoors.push("api-door-1");
              },
            },
          },
        },
      },
    },
  },
};

module.exports = async function (event, world) {
  const worldState = merge(
    INITIAL_STATE,
    world.getState(LOVELACE_TOWER_STATE_KEY)
  );

  // Top object pieces need to be longer so they always depth sort
  // above the player, even when the player would normally be depth
  // sorted above them.
  // Taken from https://github.com/TwilioQuest/twilioquest-dev-fundamentals/blob/main/levels/tower_of_knowledge/events.js#:~:text=//%20Top%20shelf%20pieces,)%3B
  world.forEachEntities(
    ({ instance }) => instance.isTopObject,
    (shelf) => {
      shelf.sprite.body.height *= 2;
    }
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
      if (event.objective === objectiveKey) {
        worldState.insideLovelaceTower.hiddenEntities.push(hiddenDoorKey);
      }
    });

    doorPairs.forEach(([objectiveKey, doorKey]) => {
      if (event.objective === objectiveKey) {
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

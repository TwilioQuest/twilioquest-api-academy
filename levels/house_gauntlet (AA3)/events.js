const merge = require("lodash.merge");
const { WORLD_STATE_KEY } = require("../../scripts/config");

// const INITIAL_STATE = {
//   gauntletSpellsEarned: [],
//   playerHouses: [
//     { name: "lovelace", id: 1 },
//     { name: "turing", id: 2 },
//     { name: "neumann", id: 3 },
//     { name: "hopper", id: 4 },
//   ],
//   houseGauntletComplete: {
//     gauntletSpellsObtained: [],
//   },
// };

// const CLEAR_STATE = {
//   gauntletSpellsEarned: [],
//   playerHouses: [
//     { name: "lovelace", id: 1 },
//     { name: "turing", id: 2 },
//     { name: "neumann", id: 3 },
//     { name: "hopper", id: 4 },
//   ],
//   houseGauntletComplete: {
//     gauntletSpellsObtained: [
//       "lovelace_spell",
//       "hopper_spell",
//       "turing_spell",
//       "neumann_spell",
//     ],
//   },
// };

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(WORLD_STATE_KEY));
  //const worldState = CLEAR_STATE;

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(worldState);

  // LEVEL FUNCTIONALITY OVERVIEW

  // Lovelace Tower objectives
  // The player enters the Tower map and must complete 4 mission objectives linearly to progress
  // When they arrive at the end of the Tower path, they can use the earned spell to open the secret Library

  // Secret Library
  // Interacting with the library door, once the spell has been earned, triggers spell animation and opens door
  // Inside the library is a final misison objective
  // Hacking the mission objective reveals a secret message from Fredric
  // The player exits the library from a second door that returns them back to the main hall.
  // The original library-tower door becomes locked.
  
  // Load Levels and Doors
  // When the player walks through Secret Library door, the Secret Library map loads.
  // The door they use to enter the library becomes locked and if the player tries to return, they observe that they can only go forward now.
  // The second door leading back to the Main Hall is locked until the player hacks the library objective.
  // Once they have received Fredric's message, the library-main hall door is spellable.

  // Spells
  // Once the player has earned the Lovelace Spell, they will be able to open the next house door back in the Main Hall 
  // (so spell variables) on Main Hall level should be updated.

// UNLOCKING

  const unlockObject = (group) => {
    world.showEntities(
      ({ instance }) => instance.group === group || instance.key == group
    );
    if (!worldState.unlockedEntities.includes(group))
      worldState.unlockedEntities.push(group);
  };

  const unlockTransition = (group) => {
    world.enableTransitionAreas(({ instance }) => instance.name === group);
    if (!worldState.unlockedTransitions.includes(group))
      worldState.unlockedTransitions.push(group);
  };

  const destroyObject = (group) => {
    world.destroyEntities(
      ({ instance }) => instance.group === group || instance.key == group
    );
    if (!worldState.destroyedEntities.includes(group))
      worldState.destroyedEntities.push(group);
  };

  const unhackObject = (group) => {
    world.forEachEntities(
      ({ instance }) => instance.group === group || instance.key == group,
      (entity) => {
        entity.hackable = false;
      }
    );
    if (!worldState.unhackableEntities.includes(group))
      worldState.unhackableEntities.push(group);
  };

  const openDoor = (group) => {
    world.forEachEntities(group, (door) => {
      door.state.fsm.action("open");
    });
  };


// NPC CONVERSATIONS

  const runObjectNotification = ({ target: { key = "default" } }) => {
    world.startConversation(key, key + ".png");
  };

  const runNpcChecks = (event) => {
    npcChecks[event.target.key]();
  };

// MISSION OBJECTIVES

// Add specific objectives for Lovelace Tower and Secret Lovelace Library
  const objectives = {
    lovelace_key: () => obtainKeySpellComplete("lovelace_spell"),
    hopper_key: () => obtainKeySpellComplete("hopper_spell"),
    neumann_key: () => obtainKeySpellComplete("neumann_spell"),
    turing_key: () => obtainKeySpellComplete("turing_spell"),
  };

// When the player has retrieved the House Lovelace spell, they are able to enter the Secret Library
// They are also able to open the library door that leads back to the Main Hall
// Eventually they will also be able to use the spell to gain access to the next house from the Main Hall
  const obtainKeySpellComplete = (object) => {
    unlockObject(object);
    if (!worldState.insideCatacombs.keySpellsObtained.includes(object))
      worldState.insideCatacombs.keySpellsObtained.push(object);

    if (worldState.insideCatacombs.keySpellsObtained.length == 4) {
      world.grantItems(["magic_key"]);
      unlockObject("magic_key");
    }
  };

  const runObjectiveEffects = ({ objective }) => {
    objectives[objective]();
  };


// SPELLS

// This level only requires Lovelace spell animation to be used on two library doors.
  const spells = {
    disappear: (event) => disappear(event),
    move: (event) => move(event),
    unlock: (event) => unlock(event),
  };

  const disappear = (event) => {
    applyDisappearTween(event.target.group).then(() => {
      destroyObject(event.target.group);

      if (event.target.unlocksObject) unlockObject(event.target.unlocksObject);
      if (event.target.unlocksTransition)
        unlockTransition(event.target.unlocksTransition);

      world.stopUsingTool();
      world.enablePlayerMovement();
    });
  };

  const move = (event) => {}; // coming soon

  const unlock = (event) => {
    if (!worldState.insideCatacombs.hasKey) {
      world.showNotification(
        "I need the magic key to unlock the Scroll Room. I should activate all the house statues inside these catacombs before returning."
      );
      return;
    }

    openDoor("scroll_room_door");

    // Stop using tool after a second
    world.wait(1000).then(() => {
      world.stopUsingTool();
      world.enablePlayerMovement();
    });
  };

  const runSpell = (event) => {
    if (!worldState.insidePerimeter.hasWand) {
      world.showNotification(
        "I should go find the toolshed and see if there is an extra wand inside!"
      );
      return;
    }

    if (!worldState.spellsEarned.includes(event.target.spell_type)) {
      world.showNotification(
        "I think I need to learn a spell later to do anything here!"
      );
      return;
    }

    world.disablePlayerMovement();
    world.useTool("wand");

    spells[event.target.spell_type](event);
  };

// COLLECTIBLES 

// ?? Does this level have collectibles?
  const items = {
    magic_key: (event) => addMagicKey(event),
    pledge_scroll: (event) => addPledgeScroll(event),
  };

  const addMagicKey = (event) => {
    worldState.insideCatacombs.hasKey = true;
    if (!worldState.spellsEarned.includes("unlock"))
      worldState.spellsEarned.push("unlock");
    destroyObject("magic_key");
    world.showNotification(
      "I've obtained the magic key, I should go and claim my pledge scroll!"
    );

    // TODO: actually add item to inventory
    tweenToScroll();
  };

  const addPledgeScroll = (event) => {
    worldState.insideCatacombs.hasPledgeScroll = true;
    destroyObject("pledge_scroll");
    world.showNotification(
      "I've obtained my pledge scroll. Time to head to the Academy building and present it to the headmaster."
    );

    world.grantItems(["pledge_scroll"]);
    determineHouse();
  };

  // OTHER???

  const runAddItem = (event) => {
    console.log(event);
    items[event.target.key](event);
  };

  const tweenToScroll = () => {
    if (worldState.insideCatacombs.tweenRunning) {
      return;
    }

    worldState.insideCatacombs.tweenRunning = true;

    world.forEachEntities("scroll_viewpoint", async (viewpoint) => {
      console.log(viewpoint);
      world.disablePlayerMovement();

      await world.tweenCameraToPosition({
        x: viewpoint.startX,
        y: viewpoint.startY,
      });

      await world.wait(3000);
      await world.tweenCameraToPlayer();

      world.enablePlayerMovement();
      worldState.insideCatacombs.tweenRunning = false;
    });
  };

// EVENT HANDLING

// Handles returning level to last object state
  if (event.name === "mapDidLoad") {
    console.log("Resetting map after load");

    // destroy all previously destroyed objects
    world.destroyEntities(({ instance }) =>
      worldState.destroyedEntities.includes(instance.group || instance.key)
    );

    // show all previously unlocked objects
    world.showEntities(({ instance }) =>
      worldState.unlockedEntities.includes(instance.group || instance.key)
    );

    // show all previously unlocked transitions
    world.enableTransitionAreas(({ instance }) =>
      worldState.unlockedTransitions.includes(instance.name)
    );

    // change hack status of all no longer hackable items
    world.forEachEntities(
      ({ instance }) =>
        worldState.unhackableEntities.includes(instance.group || instance.key),
      (entity) => {
        entity.hackable = false;
      }
    );

    // for first run though
    if (worldState.insideCatacombs.hasCredentials) {
      // destroyObject("catacombs_barrier");
      openDoor("catacombs_barrier");
      unhackObject("statue_credentials");
    }

    // Adjust object dimensions
    world.forEachEntities(
      ({ instance }) => instance.layer === "upper",
      (object) => {
        // To force "upper" layer objects to render above objects
        // they're placed on top of, we must hack their physics
        // body size.
        //
        // To do this, we're going to add a hard coded 1000 pixels
        // to the height of these objects. This is not perfect,
        // but should function fine for this mission.
        object.sprite.body.height += 1000;

        // These sprites will all have their bodies disabled.
        // This new tall sprite body will impede a lot of player
        // movement space otherwise.
        object.sprite.body.enable = false;
      }
    );
  }

// Handles object interactions
  if (event.name === "playerDidInteract") {
    console.log(`Interacting with ${event.target.key}`);

    if (event.target.spellable) runSpell(event);
    if (event.target.notify) runObjectNotification(event);
    if (event.target.npc) runNpcChecks(event);
    if (event.target.item) runAddItem(event);
  }

// Handles objective completions & failures
  if (
    event.name === "objectiveCompleted" ||
    event.name === "objectiveCompletedAgain"
  ) {
    runObjectiveEffects(event);
  }

  if (event.name === "objectiveFailed") {
    runUpdateMagicScore(event);
  }

// Handles Trigger Areas.
// This functionality should be updated so that choosing the house in the House Ceremony 
// triggers interrupting professor dialogue and camera pan
// This should also trigger the opening of Lovelace Tower
  if (event.name === "triggerAreaWasEntered") {
    if (
      event.target.key === "triggerGroundskeeperConversation" &&
      !worldState.insidePerimeter.groundskeeper_introduction
    ) {
      world.startConversation("groundskeeper", "groundskeeper.png");
    }
  }

  world.setState(WORLD_STATE_KEY, worldState);
};

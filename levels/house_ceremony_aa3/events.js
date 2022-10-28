const merge = require("lodash.merge");
const { WORLD_STATE_KEY } = require("../../scripts/config");

// const INITIAL_STATE = {
//   houseChosen: false,
//   playerHouse: null,
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
//   houseChosen: true,
//   playerHouse: null,
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

  // House Ceremony
  // The player selects their house by interacting with main House Fire in the Main Hall.
  // Fire dialogues opens four house options.
  // Operator response to conversation triggers "choice"
  // This selection in conversation branch triggers the unlocking of the avatar uniform.
  // Fire changes after they close the conversation
  // Once the player closes the conversation, the "choice" conversation is no longer available.
  // This selection also triggers the interrupting professor dialogue.

  // Starting House Gauntlet
  // Once the player agrees to compete in the House Gauntlet, the camera could pan to the House Lovelace door.
  // This pan also triggers the unlocking of the door to House Lovelace
  
  // Load Level
  // When the player enters Lovelace Tower, the LT map should load.

  // Accessing other doors
  // If the player tries to access the houses, the Operator observes why access is blocked.

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

  const objectives = {
    lovelace_key: () => obtainKeySpellComplete("lovelace_spell"),
    hopper_key: () => obtainKeySpellComplete("hopper_spell"),
    neumann_key: () => obtainKeySpellComplete("neumann_spell"),
    turing_key: () => obtainKeySpellComplete("turing_spell"),
  };

  // when the player has retrieved the House Lovelace spell, they should be able to access the next house (once that house is ready)
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

// This section (and actually functionality) should get updated when we decide on the spells and they are ready to be used in the Main Hall
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

// The only collectibles in this level so far are the avatar uniforms once the player chooses the house.
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

  // CHOSEN HOUSE 

  // The player chooses their house from the House Fire UI
  const determineHouse = () => {
    console.log("determining house");
    const bestScore = Math.min(
      ...worldState.houses.map((house) => house.magicScore)
    );
    const bestHouses = worldState.houses.filter(
      (house) => house.magicScore == bestScore
    );
    const randomIndex = Math.floor(Math.random() * bestHouses.length);
    const chosenHouse = bestHouses[randomIndex];

    worldState.sortedHouse = chosenHouse.name;

    // After the player chooses the house, the professor immediately interrupts to discuss missing student
    world.showNotification(
      'I\'ve gotten my pledge scroll! That means everything in the <span class="highlight">API Academy Inside Perimeter</span> is completed for now!'
    );
    world.updateQuestStatus(
      world.__internals.level.levelName,
      world.__internals.level.levelProperties.questTitle,
      "I got my pledge scroll! I'm done here until the rest of the API Academy grounds open up.",
      true
    );
  };

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

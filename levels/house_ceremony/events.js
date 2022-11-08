const merge = require("lodash.merge");
const { HOUSE_CEREMONY_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {
  playerHouse: undefined,
  playerHouses: [
    { name: "lovelace", id: 1 },
    { name: "turing", id: 2 },
    { name: "neumann", id: 3 },
    { name: "hopper", id: 4 },
  ],
  houseLovelaceComplete: false,
  houseHopperComplete: false,
  houseTuringComplete: false,
  houseVonNeumannComplete: false,
};

module.exports = async function (event, world) {
  const worldState = merge(INITIAL_STATE, world.getState(HOUSE_CEREMONY_STATE_KEY));

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(worldState);

  // LEVEL FUNCTIONALITY OVERVIEW

  // Has the player chosen their house? (playerHouse)

  // If No: 
  // - Heads of house say dialogue 1
  // - Fire is interactable
  // - House corridors are blocked off with Operator observation 1

  // If Yes: 
  // - Give avatar item based on chosen house
  // - Fire is no longer interactable
  // - Heads of house say dialogue 2
  // - Professor Heapsort's dialogue is triggered (interrupting professor) / Camera pan?
  // - House Lovelace corridor is accessible
  // - Other house corridors not accessible with Operator observation 2
  // - Quest Log updates

  // Has the player completed Lovelace Tower? (houseLovelaceComplete)

  // If No:
  // - Fire is no longer interactable
  // - Heads of house say dialogue 2
  // - House Lovelace corridor is accessible
  // - Other house corridors not accessible with Operator observation 2

  // If Yes (AND Next House is Ready):
  // - Heads of houses say dialogue 3
  // - Blue shine annimation appears on next house door

  // Which house has the player chosen? (playerHouse)
  
  // Dependencies: 
  // - avatar item
  // - house of the missing student
  // - fire color


  // If player tries to enter a house corridor without having chosen a house.
  // Tiled corridors need "unlock" type trigger boxes.
  // Ideally "this house area" should be replaced by Lovelace Tower / Turing Fields / Hopper Greenhouse / von Neumann Labs depending on which corridor the player is trying to access.
  const unlock = (event) => {
    if (!worldState.playerHouse) {
      world.showNotification(
        "I think I have to choose my house before I can explore this house area."
      );
      return;
    // If the player has chosen their house and they are trying to access a corridor that is not Lovelace Tower
    } else if (!worldState.playerHouse !== null) {
        world.showNotification(
          "Lovelace Tower is the first house in the House Gauntlet. I should find the House Lovelace corridor!."
        );
        return;
      };  
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

  world.setState(HOUSE_CEREMONY_STATE_KEY, worldState);
};

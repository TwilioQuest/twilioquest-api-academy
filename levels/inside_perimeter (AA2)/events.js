const merge = require("lodash.merge");
const { WORLD_STATE_KEY } = require("../../scripts/config");

const LEVEL_STATE = {
  destroyedEntities: [],
  unlockedEntities: [],
  unlockedTransitions: [],
  unhackableEntities: [],
  spellsEarned: [],
  sortedHouse: null,
  houses: [
    { name: "hopper", id: 1, magicScore: 0 },
    { name: "lovelace", id: 2, magicScore: 0 },
    { name: "turing", id: 3, magicScore: 0 },
    { name: "neumann", id: 4, magicScore: 0 },
  ],
  insidePerimeter: {
    hasWand: false,
    enteredPerimeterFirstTime: false,
  },
  insideCatacombs: {
    keySpellsObtained: [],
    hasCredentials: false,
    hasKey: false,
    hasPledgeScroll: false,
    tweenRunning: false,
  },
};

const CLEAR_STATE = {
  destroyedEntities: [],
  unlockedEntities: ["magic_key"],
  unlockedTransitions: [],
  unhackableEntities: [],
  spellsEarned: ["disappear"],
  sortedHouse: null,
  houses: [
    { name: "hopper", id: 1, magicScore: 0 },
    { name: "lovelace", id: 2, magicScore: 0 },
    { name: "turing", id: 3, magicScore: -1 },
    { name: "neumann", id: 4, magicScore: 0 },
  ],
  insidePerimeter: {
    hasWand: true,
    enteredPerimeterFirstTime: true,
  },
  insideCatacombs: {
    keySpellsObtained: [
      "lovelace_flame",
      "hopper_flame",
      "turing_flame",
      "neumann_flame",
    ],
    hasCredentials: false,
    hasKey: false,
    hasPledgeScroll: false,
    tweenRunning: false,
  },
};

module.exports = async function (event, world) {
  const worldState = merge(LEVEL_STATE, world.getState(WORLD_STATE_KEY));
  //const worldState = CLEAR_STATE;

  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(worldState);

  /*
   *
   * HELPER FUNCTION DEFINITIONS
   *
   */
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

  const applyDisappearTween = (group) => {
    const { game } = world.__internals.level;

    const tweenPromises = [];

    world.forEachEntities(
      ({ instance }) => instance.group === group || instance.key == group,
      ({ sprite }) => {
        const tweenPromise = new Promise((resolve) => {
          const tween = game.add
            .tween(sprite)
            .to(
              {
                alpha: 0.6,
              },
              400, // time
              Phaser.Easing.Exponential.In,
              undefined,
              0, // delay
              1, // repeat once
              true // yoyo
            )
            .to(
              { alpha: 0 },
              400, // time
              Phaser.Easing.Exponential.In
            );

          tween.onComplete.add(resolve);
          tween.start();
        });

        tweenPromises.push(tweenPromise);
      }
    );

    return Promise.all(tweenPromises);
  };

  /*
   *
   * INTERACTION FUNCTION DEFINITIONS
   *
   */
  const runObjectNotification = ({ target: { key = "default" } }) => {
    world.startConversation(key, key + ".png");
  };

  const npcChecks = {
    ghost: () => checkCredentials(),
  };

  const checkCredentials = () => {
    const { env } = world.getContext();

    if (
      env.hasOwnProperty("TQ_TWILIO_ACCOUNT_SID") &&
      env.hasOwnProperty("TQ_TWILIO_AUTH_TOKEN")
    )
      twilioApiSetupComplete();
  };

  const runNpcChecks = (event) => {
    npcChecks[event.target.key]();
  };

  /*
   *
   * OBJECTIVE COMPLETE FUNCTION DEFINITIONS
   *
   */
  const objectives = {
    twilio_api_setup: () => twilioApiSetupComplete(),
    obtain_wand: () => obtainWandComplete(),
    lovelace_key: () => obtainKeySpellComplete("lovelace_flame"),
    hopper_key: () => obtainKeySpellComplete("hopper_flame"),
    neumann_key: () => obtainKeySpellComplete("neumann_flame"),
    turing_key: () => obtainKeySpellComplete("turing_flame"),
  };

  const twilioApiSetupComplete = () => {
    worldState.insideCatacombs.hasCredentials = true;
    unhackObject("statue_credentials");
    // destroyObject('catacombs_barrier');

    // TODO: make this work, get rid of destroy object
    openDoor("catacombs_barrier");
  };

  const obtainWandComplete = () => {
    worldState.insidePerimeter.hasWand = true;
  };

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

  const runUpdateMagicScore = ({ objective }) => {
    worldState.houses.map((house) => {
      if (objective.includes(house.name)) {
        house.magicScore += 1;
      }

      return house;
    });
  };

  /*
   *
   * SPELL FUNCTION DEFINITIONS
   *
   */
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

  /*
   *
   * ITEM RELATED FUNCTION DEFINITIONS
   *
   */
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

    // After assigning house, tell player they've completed the
    // current content. They'll learn their house later.
    // TODO: Update this notification on future release version.
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

  /*
   *
   * EVENT HANDLING
   *
   */

  /*
   * Handles returning level to last object state
   */
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

  /*
   * Handles object interactions
   */
  if (event.name === "playerDidInteract") {
    console.log(`Interacting with ${event.target.key}`);

    if (event.target.spellable) runSpell(event);
    if (event.target.notify) runObjectNotification(event);
    if (event.target.npc) runNpcChecks(event);
    if (event.target.item) runAddItem(event);
  }

  /*
   * Handles objective completions & failures
   */
  if (
    event.name === "objectiveCompleted" ||
    event.name === "objectiveCompletedAgain"
  ) {
    runObjectiveEffects(event);
  }

  if (event.name === "objectiveFailed") {
    runUpdateMagicScore(event);
  }

  /**
   * Handles Trigger Areas
   */
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

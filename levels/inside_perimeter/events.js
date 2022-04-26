const merge = require("lodash.merge");
const processInitiationEvents = require("./events/initiation");
const packageInfo = require("../../package.json");
const updateQuestLogWhenComplete = require("./events/updateQuestLogWhenComplete");

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

const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

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

  /*
   *
   * INTERACTION FUNCTION DEFINITIONS
   *
   */
  const objectNotifications = {
    statue_credentials:
      "Welcome to the Catacombs. Now that I have your Twilio credentials, you may complete the challenges before you.",
    portrait_hopper:
      "I heard that some sneaky students make use of Postman variables to keep track of their credentials across requests. Can you believe it?",
    portrait_lovelace:
      "Every SMS must go to someone... could it really be that you're messaging me? It's been so long since anyone has sent a missive my way...",
    portrait_neumann:
      "A whisper in the wind said that students who use GET requests to send messages with the Twilio Programmable SMS API aren't getting the results they want.",
    portrait_turing:
      "Those lucky JavaScript students... Twilio gives them server-side helper libraries and browser SDKs too?",
    statue_hopper:
      "In House Hopper, you will find that knowing how to weild tools is the best way to achieve success. For example, to send auth credentials in an API request in Postman, you must use the Authorization tab. This knowledge will magnify the magic of House Hopper.",
    statue_lovelace:
      "In House Lovelace, you will learn that understanding is key to expression. To enhance the power of House Lovelace, explore an API's documentation to find the answers you seek.",
    statue_neumann:
      "In House Neumann, you will discover that efficiency and logic are at the core of your magic. Knowing that GET requests are used to retrieve information and POST requests are used to send information is necessary to maximize the efficiency of your API code.",
    statue_turing:
      "In House Turing, you will find that humans are at the core of all code. Humans of House Turing specialize in creating Software Development Kits and Libraries to make working with APIs easier for students of every programming language.",
    default: "Hello, operator!",
  };

  const runObjectNotification = ({ target: { key = "default" } }) => {
    world.showNotification(objectNotifications[key]);
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
      twilio_api_setup_complete();
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

    if (worldState.insideCatacombs.keySpellsObtained.length == 4)
      unlockObject("magic_key");
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
    destroyObject(event.target.group);
    if (event.target.unlocksObject) unlockObject(event.target.unlocksObject);
    if (event.target.unlocksTransition)
      unlockTransition(event.target.unlocksTransition);
  };

  const move = (event) => {}; // coming soon

  const unlock = (event) => {
    if (!worldState.insideCatacombs.hasKey) {
      world.showNotification(
        "You need to the magic key to unlock the Scroll Room. Conquer the objectives inside these catacombs before returning."
      );
      return;
    }

    openDoor("scroll_room_door");
  };

  const runSpell = (event) => {
    if (!worldState.insidePerimeter.hasWand) {
      world.showNotification(
        "Go find the toolshed and see if there is an extra wand inside!"
      );
      return;
    }

    if (!worldState.spellsEarned.includes(event.target.spell_type)) {
      world.showNotification("You haven't learned this spell yet!");
      return;
    }

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
      "You've obtained the magic key, go forth and claim your pledge scroll."
    );

    // TODO: actually add item to inventory
    tweenToScroll();
  };

  const addPledgeScroll = (event) => {
    worldState.insideCatacombs.hasPledgeScroll = true;
    destroyObject("pledge_scroll");
    world.showNotification(
      "You've obtained your pledge scroll. Head to the Academy building and present it to the headmaster."
    );

    // TODO: actually add item to inventory
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

    // TODO: delete this notification (this will be revealed in chapter 3?)
    world.showNotification(`Your house is: ${chosenHouse.name}`);
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

  updateQuestLogWhenComplete({
    notification:
      'I\'ve completed everything in the <span class="highlight">API Academy Inside Perimeter</span> for now!',
    log: "I've completed everything in the API Academy Inside Perimeter for now!",
    event,
    world,
    worldStateKey: WORLD_STATE_KEY,
    version: packageInfo.version,
  });

  world.setState(WORLD_STATE_KEY, worldState);
};

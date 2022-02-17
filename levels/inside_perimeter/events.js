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
  insidePerimeter: {
    hasWand: false,
    enteredPerimeterFirstTime: false,
  },
  insideCatacombs: {
    keySpellCount: 0,
    hasCredentials: false
  }
};

const CLEAR_STATE = {
  destroyedEntities: ['bramble_path'],
  unlockedEntities: [],
  unlockedTransitions: [],
  unhackableEntities: [],
  spellsEarned: ['disappear'],
  insidePerimeter: {
    hasWand: true,
    enteredPerimeterFirstTime: true,
    groundskeeper_introduction: true,
  },
  insideCatacombs: {
    keySpellCount: 0,
    hasCredentials: false
  }
};


const WORLD_STATE_KEY = "TQ_API_ACADEMY_WORLD_STATE";

module.exports = async function (event, world) {
  const worldState = merge(LEVEL_STATE, world.getState(WORLD_STATE_KEY));
  //const worldState = CLEAR_STATE;

  console.log(event.name)
  console.log(event.target)
  console.log(worldState)


  /*
   *
   * FUNCTION DEFINITIONS
   * 
   */

  /*
   * Helper function definitions
   */
  const unlockObject = group => {
    world.showEntities(({instance}) => instance.group === group || instance.key == group);
    if (!worldState.unlockedEntities.includes(group)) worldState.unlockedEntities.push(group)
  }

  const unlockTransition = group => {
    world.enableTransitionAreas(({instance}) => instance.name === group);
    if (!worldState.unlockedTransitions.includes(group)) worldState.unlockedTransitions.push(group)
  }

  const destroyObject = group => {
    world.destroyEntities(({instance}) => instance.group === group || instance.key == group);
    if (!worldState.destroyedEntities.includes(group)) worldState.destroyedEntities.push(group);
  }

  const unhackObject = group => {
    world.forEachEntities(({instance}) => instance.group === group || instance.key == group, entity => {
      entity.hackable = false;
    });
    if (!worldState.unhackableEntities.includes(group)) worldState.unhackableEntities.push(group);
  }


  /*
   * Interaction function definitions
   */
  const objectNotifications = {
    statue_credentials: 'Welcome to the Catacombs. Now that I have your Twilio credentials, you may complete the challenges before you.',
    portrait_hopper: 'I am the Hopper portrait',
    portrait_lovelace: 'I am the Lovelace portrait',
    portrait_neumann: 'I am the Neumann portrait',
    portrait_turing: 'I am the Turing portrait',
    default: 'Hello, operator!'
  }

  const runObjectNotification = ({target:{key='default'}}) => {
    world.showNotification(objectNotifications[key]);
  }

  const npcChecks = {
    ghost: () => checkCredentials()
  }

  const checkCredentials = () => {
    const {env} = world.getContext();

    if (
      env.hasOwnProperty('TQ_TWILIO_ACCOUNT_SID') 
      && env.hasOwnProperty('TQ_TWILIO_AUTH_TOKEN')
    ) worldState.insideCatacombs.hasCredentials = true;
  }

  const runNpcChecks = event => {
    npcChecks[event.target.key]();
  } 


  /*
   * Objective complete function definitions
   */
  const objectives = {
    twilio_api_setup: () => twilio_api_setup(),
    obtain_wand: () => obtain_wand()
  }

  const twilio_api_setup = () => {
    worldState.insideCatacombs.hasCredentials = true;
    unhackObject('statue_credential');
    destroyObject('catacombs_barrier');
  }

  const obtain_wand = () => {
    worldState.insidePerimeter.hasWand = true;
  }

  const runObjectiveEffects = ({objective}) => {
    objectives[objective]();
  }


  /*
   * Spell function definitions
   */
  const spells = {
    disappear: event => disappear(event),
    move: event => move(event)
  }

  const disappear = event => {
    destroyObject(event.target.group);
    if (event.target.unlocksObject) unlockObject(event.target.unlocksObject);
    if (event.target.unlocksTransition) unlockTransition(event.target.unlocksTransition);
  }
  
  const move = event => {} // coming soon

  const runSpell = event => {
    if (!worldState.insidePerimeter.hasWand) { world.showNotification("Go find the toolshed and see if there is an extra wand inside!"); return; }
    if (!worldState.spellsEarned.includes(event.target.spell_type)) { world.showNotification("You haven't learned this spell yet!"); return; }
    
    spells[event.target.spell_type](event);
  }


  /*
   *
   * EVENT HANDLING
   * 
   */


  /*
   * Handles returning level to last object state
   */
  if (event.name === "mapDidLoad") {
    console.log('Resetting map after load');

    // destroy all previously destroyed objects
    world.destroyEntities(({instance}) => worldState.destroyedEntities.includes(instance.group));

    // show all previously unlocked objects
    world.showEntities(({instance}) => worldState.unlockedEntities.includes(instance.group));

    // show all previously unlocked transitions
    world.enableTransitionAreas(({instance}) => worldState.unlockedTransitions.includes(instance.name));

    // change hack status of all no longer hackable items
    world.forEachEntities(({instance}) => worldState.unhackableEntities.includes(instance.group), entity => {
      entity.hackable = false;
    });

    if (worldState.insideCatacombs.hasCredentials) {
      destroyObject('catacombs_barrier');
      unhackObject('statue_credentials');
    }
  }


  /*
   * Handles object interactions
   */
  if (event.name === "playerDidInteract") {
    console.log(`Interacting with ${event.target.key}`)

    if (event.target.spellable) runSpell(event);
    if (event.target.notify) runObjectNotification(event);
    if (event.target.npc) runNpcChecks(event)
  }

  /*
   * Handles objective completions
   */
  if (event.name === "objectiveCompleted" || event.name === "objectiveCompletedAgain") {
    console.log(event)
    runObjectiveEffects(event)
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

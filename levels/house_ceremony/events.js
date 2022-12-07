const merge = require("lodash.merge");
const handleTriggerDoors = require("../../scripts/handleTriggerDoors");
const { HOUSE_CEREMONY_STATE_KEY } = require("../../scripts/config");

// Returns the elements that are part of a comma delimited string collection.
// For example, "hello, world, foo, bar" would return ["hello", "world", "foo", "bar"]
function getArrayFromCommaDelimitedCollection(commaDelimitedCollection = []) {
  const output = commaDelimitedCollection
    .replace(/\s/g, "")
    .split(",")
    .filter((requiredLevel) => !!requiredLevel);

  return output;
}

// Gets the keys for any entities that have the "requiresCompletedLevels" property in which the specified levels have
// not all been completed, and returns them together in an array. For example, if "requireCompletedLevels" is set to
// "challenge-questions, house_ceremony", then if either of those levels hasn't been completed, the target object
// is marked for deletion
async function getEntitiesMarkedForDeletion(world) {
  const entitiesMarkedForDeletion = [];

  // Awaiting the "world.isLevelCompleted" calls, in order to hault execution of the "world.destroyEntities"
  // invocation. Not doing so will lead to entitiesMarkedForDeletion always being empty, even if it shouldn't be
  await Promise.all(
    world.entityService
      // Using "getAll" and "filter", since the "world.forEachEntity" method cannot be awaited
      .getAll()
      .filter(({ instance }) => instance.requiresCompletedLevels)
      // Mapping each remaining element into a promise that will be apart of "Promise.all"
      .map(async ({ instance }) => {
        if (instance.requiresCompletedLevels) {
          const completedRequiredLevels =
            await getArrayFromCommaDelimitedCollection(
              instance.requiresCompletedLevels
            ).reduce(async (allCompleted, requiredLevel) => {
              return (
                allCompleted && (await world.isLevelCompleted(requiredLevel))
              );
            }, true);

          if (!completedRequiredLevels) {
            entitiesMarkedForDeletion.push(instance.key);
          }
        }
      })
  );

  return entitiesMarkedForDeletion;
}
const INITIAL_STATE = {
  playerHouse: undefined,
  heapsortConversationHasEnded: false,
  houseLovelaceComplete: false,
  houseHopperComplete: false,
  houseTuringComplete: false,
  houseVonNeumannComplete: false,
  displayNames: {
    lovelace: "Lovelace",
    turing: "Turing",
    neumann: "von Neumann",
    hopper: "Hopper",
  },
};

module.exports = async function (event, world) {
  const worldState = merge(
    INITIAL_STATE,
    world.getState(HOUSE_CEREMONY_STATE_KEY)
  );

  if (event.name === "mapDidLoad") {
    const entitiesMarkedForDeletion = await getEntitiesMarkedForDeletion(world);

    world.destroyEntities(({ instance }) => {
      const instanceIsMarkedForDeletion = entitiesMarkedForDeletion.some(
        (entityKey) => instance.key === entityKey
      );

      return instanceIsMarkedForDeletion;
    });
  }

  handleTriggerDoors(event, world, worldState);
  console.log(`event: ${event.name}`);
  console.log(`event target ${event.target}`);
  console.log(`event target ${event.target && event.target.key}`);
  console.log(worldState);

  // Lovelace Tower not accessible until player has selected a house
  world.disableTransitionAreas("exit_to_lovelace_corridor");
  world.disableTransitionAreas("secret_library_door_exit");
  world.disableTransitionAreas("secret_library_door_anim_trigger");

  // If Heapsort convo has happened, triggers get disabled
  if (worldState.heapsortConversationHasEnded) {
    world.forEachEntities("triggerInterruptingHeapsort", (heapsortTrigger) => {
      heapsortTrigger.key = "";
    });
    world.showEntities(`heapsort-avatar`);
  }

  // Once the player has selected their house, the fire is no longer interactable; Lovelace tower opens;
  // the fires change color
  if (worldState.playerHouse) {
    world.forEachEntities("fire-convo", (fire) => {
      fire.isConversationDisabled = true;
      fire.interactable = false;
    });
    world.showEntities(`${worldState.playerHouse}-fire`);

    // Give avatar item based on chosen house
    world.grantItems([
      `academy_jacket_${worldState.playerHouse}`,
      "academy_pleated_skirt",
      "academy_slacks",
    ]);

    // When house-fire convo closes, pledge scroll fade animation is triggered - half second delay; should only play once and then be hidden again
    if (
      event.name === "conversationDidEnd" &&
      event.npc.conversation === "house-fire"
    ) {
      world.showEntities(`pledge-scroll`);
      world.hideEntities(`pledge-scroll`, 750);
      // world.forEachEntities(`pledge-scroll`, async scroll =>{
      //   await scroll.playAnimation("idle");
      //   scroll.hidden = true;
      //   });
    }

    // Change Operator Observations on locked doors depending on progress
    world.enableTransitionAreas("exit_to_lovelace_corridor");
    if (
      event.name === "triggerAreaWasEntered" &&
      event.target.key === "lockedDoor" &&
      worldState.houseLovelaceComplete === false
    ) {
      world.showNotification(
        "Lovelace Tower is the first house in the House Gauntlet. I should find the House Lovelace corridor!"
      );
    }

    // After choosing the house and entering triggers, camera jumps to Heapsort and dialogue begins
    // Heapsort NPC becomes visible and interactable
    if (
      event.name === "triggerAreaWasEntered" &&
      event.target.key === "triggerInterruptingHeapsort"
    ) {
      world.showEntities(`heapsort-avatar`);
      world.forEachEntities("heapsort", async (heapsort) => {
        world.disablePlayerMovement();
        await world.tweenCameraToPosition({
          x: heapsort.startX,
          y: heapsort.startY,
        });
        world.startConversation("interrupting-heapsort", "professor1.png");
      });
    }

    // When the Heapsort dialogue ends, camera jumps back to player
    if (
      event.name === "conversationDidEnd" &&
      event.npc.conversation === "interrupting-heapsort"
    ) {
      world.tweenCameraToPlayer().then(() => {
        world.enablePlayerMovement();
        worldState.heapsortConversationHasEnded = true;
        world.updateQuestStatus(
          world.__internals.level.levelName,
          world.__internals.level.levelProperties.questTitle,
          "I should head to Lovelace Tower to start the House Gauntlet.",
          true
        );
      });
    }
  }

  world.setState(HOUSE_CEREMONY_STATE_KEY, worldState);
};

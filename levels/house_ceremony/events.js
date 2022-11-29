const merge = require("lodash.merge");
const handleTriggerDoors = require("../../scripts/handleTriggerDoors");
const { HOUSE_CEREMONY_STATE_KEY } = require("../../scripts/config");

const INITIAL_STATE = {};

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

  // LEVEL FUNCTIONALITY OVERVIEW

  // Has the player chosen their house? (playerHouse === undefined)

  // If undefined:
  // [x] Heads of house say dialogue 1
  // [] Fire is interactable
  // [] House corridors are blocked off with Operator observation: "I think I have to choose my house before I can explore [Lovelace Tower / Turing Fields / Hopper Greenhouse / von Neumann Labs]."

  // If !undefined:
  // [] Give avatar item based on chosen house
  // [] Fire is no longer interactable
  // [x] Heads of house say dialogue 2
  // [] Professor Heapsort's dialogue is triggered (interrupting professor) with Camera pan
  // [] House Lovelace corridor is accessible
  // [] Other house corridors not accessible with Operator observation: "Lovelace Tower is the first house in the House Gauntlet. I should find the House Lovelace corridor!"
  // [] Quest Log updates
  // [] Fires change to color of chosen house (show/hide entities on map)
  // [] Pledge scroll fade animation is triggered

  // Has the player completed Lovelace Tower? (houseLovelaceComplete === false)

  // If No:
  // [] Fire is no longer interactable
  // [x] Heads of house say dialogue 2
  // [] House Lovelace corridor is accessible
  // [] Other house corridors not accessible with Operator observation 2

  // If Yes (AND Next House is Ready):
  // [] Heads of houses say dialogue 3
  // [] Lovelace blue sparkle annimation appears on next house door

  // Which house has the player chosen? (playerHouse)

  // Dependencies:
  // [] avatar item
  // [] house of the missing student (Heapsort dialogue)
  // [] fire color

  world.setState(HOUSE_CEREMONY_STATE_KEY, worldState);
};

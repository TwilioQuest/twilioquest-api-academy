/**
 * Gets the comma delimited keys specified in the "assignedDoors" property belonging to a Tiled object and returns them in an array
 * For example, "hello, world, foo, bar" would return ["hello", "world", "foo", "bar"]
 * @param {object} entity - A Tiled object
 * @returns An array of all the doors assigned to the specified Tiled object.
 */
function getEntityAssignedDoors(entity) {
  return entity.assignedDoors
    .replace(/\s/g, "")
    .split(",")
    .filter((assignedDoor) => !!assignedDoor);
}

function runDoorAction(world, assignedDoors, action) {
  world.forEachEntities(
    ({ instance }) => {
      return assignedDoors.some((doorKey) => instance.key === doorKey);
    },
    (door) => {
      const requiredCurrentState = action === "open" ? "closed" : "open";

      // This handles players moving in and out of the door trigger by enqueuing a pending state
      // if the trigger is entered/exited while the door is changing states. For example,
      // if the door is opening and the player leaves the trigger, the "close" action will
      // be queued up to run once the door is finished opening.
      if (door.state.fsm.currentState !== requiredCurrentState) {
        if (waitingForRequiredState) {
          door.sprite.animations.currentAnim.onComplete.remove(
            runPendingDoorAction
          );
        }

        waitingForRequiredState = true;
        door.sprite.animations.currentAnim.onComplete.addOnce(
          runPendingDoorAction,
          undefined,
          undefined,
          door,
          action
        );
        return;
      }

      door.state.fsm.action(action);
    }
  );
}

function runPendingDoorAction(_, __, door, action) {
  // Exploiting the message queue (i.e. using setTimeout) to ensure the door's transition from
  // 'opening' or 'closing' to 'open' and 'closed', respectively, can happen before executing
  // the pending action. This prevents the door from skipping the animation and instantly changing from 'open' to 'closed'
  // and vice versa
  setTimeout(() => {
    waitingForRequiredState = false;
    door.state.fsm.action(action);
  });
}

let waitingForRequiredState = false;

module.exports = function handleDoorControls(event, world, worldState) {
  if (
    event.name === "triggerAreaWasEntered" ||
    event.name === "triggerAreaWasExited"
  ) {
    const assignedDoors = getEntityAssignedDoors(event.target);
    const doorFSMAction =
      event.name === "triggerAreaWasEntered" ? "open" : "close";
    runDoorAction(world, assignedDoors, doorFSMAction);
  }
};

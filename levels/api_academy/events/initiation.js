function joinStringsWithOxfordComma(strings) {
  switch (strings.length) {
    case 0:
      return "";
    case 1:
      return strings[0];
    case 2:
      return `${strings[0]} and ${strings[1]}`;
    case 3:
    default:
      const stringsCopy = [...strings];
      const lastValue = stringsCopy.pop();

      return stringsCopy.join(", ") + `, and ${lastValue}`;
  }
}

function processInitiationEvents(event, world, worldState) {
  if (event.name === "mapDidLoad" && event.mapName === "maze") {
    worldState.enteredMazeFirstTime = true;
  }

  // If we've not entered the maze yet, we shouldn't start processing
  // initiation events.
  if (!worldState.enteredMazeFirstTime) {
    return;
  }

  if (
    event.name === "levelDidLoad" ||
    event.name === "mapDidLoad" ||
    event.name === "objectiveCompleted" ||
    event.name === "objectiveCompletedAgain"
  ) {
    const completedHouses = [];

    if (world.isObjectiveCompleted("hopper_initiation")) {
      world.showEntities("hopper_initiation_flame");
      completedHouses.push("Hopper");
    }

    if (world.isObjectiveCompleted("neumann_initiation")) {
      world.showEntities("neumann_initiation_flame");
      completedHouses.push("Neumann");
    }

    if (world.isObjectiveCompleted("lovelace_initiation")) {
      world.showEntities("lovelace_initiation_flame");
      completedHouses.push("Lovelace");
    }

    if (world.isObjectiveCompleted("turing_initiation")) {
      world.showEntities("turing_initiation_flame");
      completedHouses.push("Turing");
    }

    if (
      worldState.initiation.lastShownHouseNotification !==
      completedHouses.length
    ) {
      // Default message if not all have been found
      let completedHousesNotification = world.getTranslatedString('api-academy.initiation.completedHousesNotification',
      { 
        house: completedHouses.length > 1 ? "houses" : "house" ,
        completedHouses: joinStringsWithOxfordComma(completedHouses),
        completedHousesLength: 4 - completedHouses.length
      });

      if (completedHouses.length === 4) {
        // Victory message once all chests found
        completedHousesNotification = world.getTranslatedString('api-academy.initiation.completedHousesNotification4');
      }

      world.showNotification(completedHousesNotification);

      worldState.initiation.lastShownHouseNotification = completedHouses.length;
    }
  }
}

module.exports = processInitiationEvents;

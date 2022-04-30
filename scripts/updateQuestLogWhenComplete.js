async function updateQuestLogWhenComplete({
  notification,
  log,
  event,
  world,
  worldStateKey,
  version,
  questKey,
  questTitle,
}) {
  if (
    !(
      event.name === "levelDidLoad" ||
      event.name === "mapDidLoad" ||
      event.name === "objectiveDidClose"
    )
  ) {
    return;
  }

  if (!(await world.isLevelCompleted())) {
    return;
  }

  // Since this callback is happening async we need
  // to get the latest version of worldState. What we
  // have already above might be stale by now.
  const worldState = world.getState(worldStateKey);

  // We check if any version at all is set for now.
  // We can check against specific versions as necessary
  // in the future.
  if (!worldState.shownCompletionVersion) {
    world.showNotification(notification);
    world.updateQuestStatus(
      questKey || world.__internals.level.levelName,
      questTitle || world.__internals.level.levelProperties.questTitle,
      log,
      true
    );

    worldState.shownCompletionVersion = version;
    world.setState(worldStateKey, worldState);
  }
}

module.exports = updateQuestLogWhenComplete;

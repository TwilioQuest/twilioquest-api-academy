module.exports = (event, world, worldState) => {
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

  return {
    unlockObject,
    unlockTransition,
    destroyObject,
    unhackObject,
    openDoor,
    applyDisappearTween,
  };
};

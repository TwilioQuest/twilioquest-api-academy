module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const answer2 = helper.getNormalizedInput('answer2');

  if (answer1 === '' || answer2 === '') {
    return helper.fail(world.getTranslatedString('api-academy.hopper_initiation.both'));
  }

  if (answer1 !== 'false') {
    return helper.fail(world.getTranslatedString('api-academy.hopper_initiation.firstIncorrect'));
  }

  if (!answer2 || answer2 !== 'rest') {
    return helper.fail(world.getTranslatedString('api-academy.hopper_initiation.secondIncorrect'));
  }

  return helper.success(world.getTranslatedString('api-academy.hopper_initiation.success'));
};

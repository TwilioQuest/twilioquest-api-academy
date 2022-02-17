module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const answer2 = helper.getNormalizedInput('answer2');

  if (answer1 === '' || answer2 === '') {
    return helper.fail(`
      Please answer both questions!
    `);
  }

  if (!answer1.includes('message') && !answer1.includes('media') && !answer1.includes('service')) {
    return helper.fail(`
      The first answer is incorrect.
    `);
  }

  if (!answer2 || answer2 !== 'body') {
    return helper.fail(`
      The second answer is incorrect.
    `);
  }

  return helper.success(`
    You've got it! You've opened the chest and received a wand, you can now earn spells and perform them around the grounds of the API Academy!
  `);
};

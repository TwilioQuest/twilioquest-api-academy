const assert = require("assert");

const assertTestCase = (testFunction) => async (expected) => {
  const testResult = await testFunction();

  assert.strictEqual(
    testResult,
    expected,
    `Expected "${expected}", but received "${testResult}".`
  );
};

// TODO: replace with actual API endpoint
const DIVINATION_API_ENDPOINT = "endpoint/goes/here";

module.exports = async function (helper) {
  let context;

  try {
    context = await helper.pullVarsFromQuestIdeUserCodeLocalScope(
      ["getDivinationData"],
      "api-03-fetch"
    );

    assert(
      context.getDivinationData,
      "The function getDivinationData is not defined!"
    );

    const test = assertTestCase(context.getDivinationData);
    const response = await fetch(DIVINATION_API_ENDPOINT);
    const payload = await response.json();
    // TODO: Implement test that compares correct output from API to user's return value
    // await test(correctData);
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Great job!");
};

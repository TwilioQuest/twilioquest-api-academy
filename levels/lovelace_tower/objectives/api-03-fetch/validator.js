const assert = require("assert");

const assertTestCase = (testFunction) => async (expected) => {
  const testResult = await testFunction();

  assert.strictEqual(
    testResult,
    expected,
    `Expected "${expected}", but received "${testResult}".`
  );
};

const DIVINATION_API_ENDPOINT = "https://twilio.com/quest/magic";

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

    const response = await fetch(DIVINATION_API_ENDPOINT);
    const test = assertTestCase(context.getDivinationData);
    await test(response);
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Great job!");
};

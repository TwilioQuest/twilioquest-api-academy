const assert = require("assert");

const assertTestCase = (testFunction) => async (expected) => {
  const testResult = await testFunction();

  assert.strictEqual(
    testResult,
    expected,
    `Expected "${expected}", but received "${testResult}".`
  );
};

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
    await test("ALAKAZAM");
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Great job!");
};

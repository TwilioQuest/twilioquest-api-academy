const assert = require("assert");

const assertTestCase = (testFunction) => async (input, expected) => {
  const testResult = await testFunction(input);

  assert.strictEqual(
    testResult,
    expected,
    `Expected "${expected}" from input ${input}, but received "${testResult}".`
  );
};

// TODO: replace with actual API endpoint
const DIVINATION_API_ENDPOINT = "endpoint/goes/here";

module.exports = async function (helper) {
  let context;

  try {
    context = await helper.pullVarsFromQuestIdeUserCodeLocalScope(
      ["getAndProcessDivinationData"],
      "api-04-remote-and-local"
    );

    assert(
      context.getAndProcessDivinationData,
      "The function getAndProcessDivinationData is not defined!"
    );

    const test = assertTestCase(context.getAndProcessDivinationData);
    const response = await fetch(DIVINATION_API_ENDPOINT);
    const payload = await response.json();
    // TODO: Implement tests
    // await test(pageCount, correctOutput);
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Great job!");
};

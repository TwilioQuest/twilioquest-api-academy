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
      ["getAuthorAndPostBookReview"],
      "api-05-get-post"
    );

    assert(
      context.getAuthorAndPostBookReview,
      "The function getAuthorAndPostBookReview is not defined!"
    );

    const test = assertTestCase(context.getAuthorAndPostBookReview);
    const response = await fetch(DIVINATION_API_ENDPOINT);
    const payload = await response.json();
    // TODO: Implement tests
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Nice going!");
};

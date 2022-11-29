const assert = require("assert");

const assertTestCase = (testFunction) => (input1, input2, input3, expected) => {
  const testResult = testFunction(input1, input2, input3);

  assert.strictEqual(
    testResult,
    expected,
    `Expected "${expected}" from input "${input1}", "${input2}", and "${input3}", but received "${testResult}".`
  );
};

module.exports = async function (helper) {
  let context;

  try {
    context = await helper.pullVarsFromQuestIdeUserCodeLocalScope(
      ["wordSwapper"],
      "api-01-local-function"
    );

    assert(context.wordSwapper, "The function wordSwapper is not defined!");

    const test = assertTestCase(context.wordSwapper);

    test(
      "foo foo foo something something bar",
      "foo",
      "bar",
      "bar bar bar something something bar"
    );
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Great job!");
};

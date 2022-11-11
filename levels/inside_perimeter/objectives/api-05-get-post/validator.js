const assert = require("assert");

const assertTestCase = (testFunction) => async (input, expected) => {
  await testFunction(input);
  const response = await fetch(`${DIVINATION_API_ENDPOINT}/${expected}`, {
    method: "POST",
  });
  const reviews = await response.json();
  const userPostedReview = reviews.find((review) => review.userID === expected);

  if (!userPostedReview) {
    assert.fail(`Could not find review with id "${expected}".`);
  }
};

const DIVINATION_API_ENDPOINT =
  "https://twilio.com/quest/magic/divination/reviews";

function generateRandomID() {
  // https://dev.to/rahmanfadhil/how-to-generate-unique-id-in-javascript-1b13#:~:text=const%20uid%20%3D%20()%20%3D%3E%0A%20%20String(%0A%20%20%20%20Date.now().toString(32)%20%2B%0A%20%20%20%20%20%20Math.random().toString(16)%0A%20%20).replace(/%5C./g%2C%20%27%27)
  let randomID =
    Date.now().toString(32) + Math.random().toString(16).replace(/\./g, "");

  return randomID;
}

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
    const randomID = generateRandomID();
    await test(randomID);
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Nice going!");
};

const { DIVINATION_API_ENDPOINT } = require("../../../../scripts/config");
const assert = require("assert");

const assertTestCase = (testFunction) => async (input) => {
  await testFunction(input);
  const response = await fetch(
    `${DIVINATION_API_ENDPOINT}?target=lovelace_secret_statue&guid=${input}`
  );

  const patchedInscription = await response.text();

  if (!patchedInscription) {
    assert.fail(
      `Could not find patch with guid "${input}"! Make sure you're sending the guid along with the repaired inscription and try again.`
    );
  }

  if (!patchedInscription.data.operational) {
    assert.fail(
      "The inscription hasn't been repaired! Ensure that you've put all of the fragments in the correct order and try again."
    );
  }
};

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
      ["getAndPatchCorruptedInscription"],
      "api-05-get-patch"
    );

    assert(
      context.getAndPatchCorruptedInscription,
      "The function getAndPatchCorruptedInscription is not defined!"
    );

    const test = assertTestCase(context.getAndPatchCorruptedInscription);
    const randomID = generateRandomID();
    await test(randomID);
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Nice going!");
};

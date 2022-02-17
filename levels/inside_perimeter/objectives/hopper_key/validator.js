const assert = require("assert");

module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const messageSid = helper.getNormalizedInput('answer2');

  const { TQ_ACCOUNT_SID:accountSid, TQ_AUTH_TOKEN: authToken } = helper.env;

  if (answer1 === '' || answer2 === '') {
    return helper.fail(`
      Please answer all questions!
    `);
  }

  if (answer1 !== "confirm") {
    return helper.fail(`
      Please type 'confirm' to confirm you've successfully created a Postman account and opened the web interface or the app. If you're having trouble, checkout the linked video or blog content.
    `);
  }

  try {
    const client = require('twilio')(accountSid, authToken);

    const message = await client
                    .messages(messageSid)
                    .fetch();

    if (message.body !== 'Postman rocks!') {
      throw 'Try again, and make sure your message says `Postman rocks!`';
    }          
  } catch (e) {
    return helper.fail(`Uh oh: ${e}`);
  }

  return helper.success(`
    You've got it! You've demonstrated how to use Postman to test APIs! You've obtained the Hopper Key.
  `);
};
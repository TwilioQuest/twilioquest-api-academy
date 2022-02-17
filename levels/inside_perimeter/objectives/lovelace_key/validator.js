const assert = require("assert");

module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const answer2 = helper.getNormalizedInput('answer2');
  const messageSid = helper.getNormalizedInput('answer3');

  const { TQ_ACCOUNT_SID:accountSid, TQ_AUTH_TOKEN: authToken } = helper.env;

  if (answer1 === '' || answer2 === '' || !answer3) {
    return helper.fail(`
      Please answer all questions!
    `);
  }

  if (answer1 !== "true") {
    return helper.fail(`
      Requests to the Twilio Programmable SMS API do require authentication. To make a request, you must include your Account SID and your Auth Token.
    `);
  }

  if (answer2 !== 'to' ) {
    return helper.fail(`
      Almost! The third required parameter to create a message with Twilio Programmable SMS is \`To\`. This parameter lets the API know who the message should be sent to.
    `);
  }

  try {
    const client = require('twilio')(accountSid, authToken);

    const message = await client
                    .messages(messageSid)
                    .fetch();

    if (!message.sid) {
      throw 'Looks like something went wrong. Try again.'
    }          
  } catch (e) {
    return helper.fail(`Uh oh: ${e}`);
  }

  return helper.success(`
    You've got it! You've weilded the power of APIs to create a message with Twilio Programmable SMS and cURL! You've obtained the Lovelace Key.
  `);
};

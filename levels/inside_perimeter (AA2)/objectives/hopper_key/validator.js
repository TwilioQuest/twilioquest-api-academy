const assert = require("assert");

module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const answer2 = helper.getNormalizedInput('answer2');
  const answer3 = helper.getNormalizedInput('answer3');
  const answer4 = helper.getNormalizedInput('answer4');


  const { TQ_TWILIO_ACCOUNT_SID:accountSid, TQ_TWILIO_AUTH_TOKEN: authToken } = helper.env;

  if (answer1 === '' || answer2 === '' || answer3 === '' || answer4 === '') {
    return helper.fail(`
      Please answer all the challenge questions!
    `);
  }

  if (answer1 !== "confirm") {
    return helper.fail(`
      Please type 'confirm' for the first challenge question to confirm you've successfully created a Postman account and opened the web interface or the app. If you're having trouble, checkout the linked video or blog content.
    `);
  }

  if (answer2 !== "false") {
    return helper.fail(`
      The second challenge question is false - a Postman "collection" is a group of related HTTP requests that you can reuse easily.
    `);
  }

  if (answer3 !== "authorization") {
    return helper.fail(`
      The third challenge question is not quite right. Maybe the statue in the hallway can help you with this one...
    `);
  }

  if (answer4 !== "b") {
    return helper.fail(`
      The fourth challenge question is incorrect. Try again.
    `);
  }

  // try {
  //   const client = require('twilio')(accountSid, authToken);

  //   const message = await client
  //                   .messages(messageSid)
  //                   .fetch();
    
  //   console.log(message.body)

  //   if (message.body !== 'Postman rocks!' && message.body !== 'postman rocks!' && message.body !== 'postman rocks') {
  //     throw 'Try again, and make sure your message says `Postman rocks!`';
  //   }          
  // } catch (e) {
  //   return helper.fail(`Uh oh: ${e}`);
  // }

  return helper.success(`
    You've got it! You've demonstrated how to use Postman to test APIs! You've obtained the Hopper Key Component.
  `);
};
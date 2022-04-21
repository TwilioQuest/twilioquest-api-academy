module.exports = async (helper) => {
  const answer1 = helper.getNormalizedInput('answer1');
  const answer2 = helper.getNormalizedInput('answer2');
  const answer3 = helper.getNormalizedInput('answer3');


  if (!answer1 || !answer2 || !answer3) {
    return helper.fail(`
      Please answer all questions!
    `);
  }

  if (answer1 !== 'c') {
    return helper.fail(`
      Uh oh, ${answer1.toUpperCase()} *is* an HTTP Method. Visit the [MDN documentation to learn more about HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) or check out the information provided here in the hack interface.
    `);
  }

  if (answer2 !== 'get') {
    let failMessage;

    if (answer2 === 'post') failMessage = 'POST is used to submit new information to the server sent in the request payload.'
    if (answer2 === 'put') failMessage = 'PUT is used to replace a target resource on the server with new data sent in the request.'
    if (answer2 === 'read') failMessage = 'READ isn\'t a valid HTTP method.'

    return helper.fail(`
      Not quite! ${failMessage} Visit the [MDN documentation to learn more about HTTP methods](https://developer.mozilla.org/en-US/docs/Web/HTTP/Methods) or check out the information provided here in the hack interface.
    `);
  }

  if (answer3 !== 'post') {
    return helper.fail(`
      That's incorrect, but you can check the [Twilio Programmable SMS documentation on creating a message](https://www.twilio.com/docs/sms/api/message-resource#create-a-message-resource) to find the answer!
  `);
  }

  return helper.success(`
    You've got it! You've demonstrated how to achieve your goals and solve problems efficiently by using the correct HTTP method.
  `);
};

async function getMagicalPhrase() {
  // Web API endpoint: https://twilio.com/quest/magic
  // TODO: fetch the magical phrase from the endpoint!
}

(async function () {
  console.log("Test case data:");
  console.log((await getMagicalPhrase()).toString());
})();

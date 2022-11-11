async function getDivinationData() {
  // Web API endpoint: https://twilio.com/quest/magic/divination
  // TODO: fetch data from the endpoint and return it!
}

(async function () {
  console.log("Test case:");
  console.log((await getDivinationData()).toString());
})();

async function getDivinationData() {
  // Web API endpoint: https://twilio.com/quest/magic
  // TODO: fetch data from the endpoint and return it!
}

(async function () {
  console.log("Test case data:");
  console.log((await getDivinationData()).toString());
})();

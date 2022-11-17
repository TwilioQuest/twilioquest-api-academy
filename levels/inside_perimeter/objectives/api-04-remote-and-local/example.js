async function getAndProcessDivinationData(pageCount) {
  // API https://twilio.com/quest/magic/divination
  // TODO: get the divination data, process it, and return the result!
}

(async function () {
  console.log("Test case 1:");
  console.log((await getAndProcessDivinationData(5)).toString());

  console.log("Test case 2:");
  console.log((await getAndProcessDivinationData(1)).toString());

  console.log("Test case 3:");
  console.log((await getAndProcessDivinationData(12)).toString());

  console.log("Test case 4:");
  console.log((await getAndProcessDivinationData(100)).toString());

  console.log("Test case 5:");
  console.log((await getAndProcessDivinationData(32)).toString());

  console.log("Test case 6:");
  console.log((await getAndProcessDivinationData(24)).toString());
})();

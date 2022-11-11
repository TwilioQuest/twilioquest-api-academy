async function getAndProcessDivinationData(pageCount) {
  // API https://twilio.com/quest/magic/divination/books
  // TODO: get the divination data, process it, and return the result!
}

(async function () {
  console.log("Test case 1:");
  console.log(JSON.stringify(await getAndProcessDivinationData(5)));

  console.log("Test case 2:");
  console.log(JSON.stringify(await getAndProcessDivinationData(1)));

  console.log("Test case 3:");
  console.log(JSON.stringify(await getAndProcessDivinationData(12)));

  console.log("Test case 4:");
  console.log(JSON.stringify(await getAndProcessDivinationData(100)));

  console.log("Test case 5:");
  console.log(JSON.stringify(await getAndProcessDivinationData(32)));

  console.log("Test case 6:");
  console.log(JSON.stringify(await getAndProcessDivinationData(24)));
})();

const assert = require("assert");

const assertTestCase = (testFunction, helper) => async (input, expected) => {
  const testResult = await testFunction(input);
  let failureMessage = `Expected ${expected.length} book(s) from pageCount input of "${input}", but received ${testResult.length}.`;
  const equality = helper.areArrayContentsEqual(
    testResult,
    expected,
    (userBook, correctBook) => {
      if (userBook.id !== correctBook.id) {
        failureMessage = `Encountered unexpected book ${JSON.stringify(
          userBook
        )} from pageCount input of "${input}".`;
        return false;
      }

      return true;
    }
  );

  if (!equality) {
    assert.fail(failureMessage);
  }
};

const DIVINATION_API_ENDPOINT = "https://twilio.com/quest/magic/divination";

function getBooksByPageCount(pageCountThreshold, books) {
  const filteredBooks = books.filter(
    (book) => pageCountThreshold > book.metadata.pageCount
  );
  return filteredBooks;
}

module.exports = async function (helper) {
  let context;

  try {
    context = await helper.pullVarsFromQuestIdeUserCodeLocalScope(
      ["getAndProcessDivinationData"],
      "api-04-remote-and-local"
    );

    assert(
      context.getAndProcessDivinationData,
      "The function getAndProcessDivinationData is not defined!"
    );

    const test = assertTestCase(context.getAndProcessDivinationData, helper);
    const response = await fetch(DIVINATION_API_ENDPOINT);
    const books = (await response.json()).data;
    await test(5, getBooksByPageCount(5, books));
    await test(100, getBooksByPageCount(100, books));
    await test(30, getBooksByPageCount(30, books));
    await test(15, getBooksByPageCount(15, books));
  } catch (err) {
    helper.fail(err);
    return;
  }

  helper.success("Good work!");
};

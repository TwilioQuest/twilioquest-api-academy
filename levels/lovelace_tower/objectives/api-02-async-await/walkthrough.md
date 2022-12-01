# Running code asynchronously

Most of the code we write runs instantly\*, but situations exist in which it takes longer than usual. One such situation is when you're reading the contents of a directory using NodeJS and Javascript. In Javascript, we have the ability to execute code asynchronously. That is to say, without stopping everything else to wait for that code to finish.

Example(1):

```js
const { readdir } = require("fs").promises;

const contents = readdir("path/to/directory");
console.log(contents);
```

The example uses `readdir` to get files and folders in a directory. The `readdir` function is asynchronous and will take some time to finish. With things as they are, our `console.log` would print `Promise { <pending> }`. That's where promises come into the picture.

## What are promises?

Promises are what asynchronous functions return, and is what Javascript uses to represent the state of asynchronous tasks. They give us the ability to pause our program until a task completes, or provide a callback (i.e. a function) to be invoked once finished. To do so, we use the `await` keyword and `promise.then` method respectively. More on those coming up.

## Chaining promises

We can use the `promise.then` method to pass in a function to be called once an asynchronous task is done. Since the `promise.then` method returns the promise it belongs to, we're able to chain them together -- one after another.

Example(2):

```js
const { readdir } = require("fs").promises;

readdir("path/to/directory")
  .then((content) => {
    console.log("First:", content);
  })
  .then((content) => {
    console.log("Second:", content);
  });
```

The example shows how we might use promise chaining to do something with the result of an asynchronous task. It's important to note, that this approach allows our code to continue running until the asynchronous operation is done. Something else to consider is the [pyramid of doom](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#:~:text=the%20classic%20callback-,pyramid%20of%20doom,-%3A), which can make reading and understanding our code much harder.

## Awaiting promises

We can use the `await` keyword to pause our program until a task completes and gives us the result.

Example(3):

```js
const { readdir } = require("fs").promises;

const contents = await readdir("path/to/directory");
console.log(contents);
```

The example shows one way to pause our program while an asynchronous task is running. Unlike the promise chaining demonstration above, our program will **not** continue until the `readdir` invocation is done.

## Finding the last file in a directory

Now that we know more about asynchronous tasks and how to work with them, let's take another look at the objective. Your `findLastFileInDir` function is given a single argument called `dirPath`. We can use that variable in combination with the `readdir` method and `await` keyword to get everything in a directory, as shown below.

```js
const { readdir } = require("fs").promises;

async function findLastFileInDir(dirPath) {
  const allFiles = await readdir(dirPath);
}
```

At this point, the `allFiles` variable will be an array with all of the files in the directory at the path specified by `dirPath`. Now our goal is to single out the **last** file in `allFiles`. Here's one way we can accomplish this:

```js
const { readdir } = require("fs").promises;

async function findLastFileInDir(dirPath) {
  const allFiles = await readdir(dirPath);
  const lastFile = allFiles[allFiles.length - 1];
}
```

We see here that we're accessing `allFiles` (which is an array) and targeting the element at `allFiles.length - 1` (which is equal to the number of files there are minus 1, since arrays start counting at 0). Now all we need to do is return `lastFile`!

```js
const { readdir } = require("fs").promises;

async function findLastFileInDir(dirPath) {
  const allFiles = await readdir(dirPath);
  const lastFile = allFiles[allFiles.length - 1];

  return lastFile;
}
```

There you have it! Your function should now get all of the files in the directory, capture the last one, and return it.

## Helpful Links

- [MDN Javascript Event Loop](https://developer.mozilla.org/en-US/docs/Web/JavaScript/EventLoop)
- [MDN Asynchronous Javascript](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing)
- [MDN Javascript Promises](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Introducing)
- [MDN Promise Chaining](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Asynchronous/Promises#chaining_promises)
- [MDN Pyramid of Doom](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Using_promises#:~:text=the%20classic%20callback-,pyramid%20of%20doom,-%3A)

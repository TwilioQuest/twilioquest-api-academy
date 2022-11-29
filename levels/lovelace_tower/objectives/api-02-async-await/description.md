# Async Await

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an `async` function called `findLastFileInDir`.</li>
  <li>This function receives a string that points to a directory.</li>
  <li>Read all the items in the directory provided using `await` and `readdir`.</li>
  <li>Return the last item in the directory.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Two important things to understand before working with Web APIs is `async` (short for asynchronous) and `await`. We'll be using these tools to perform actions that can take a while to finish. Let's use the `readdir` (short for read directory) method to asynchronously pull in all of the items in a directory and return the last item.

For example, if you had a directory that looked like the following tree:

```plaintext
adventures/
├── places/
│ ├── javascript-test-labs.txt
│ ├── pythonic-temple.txt
│ ├── forest-of-open-source.txt
│ ├── tower-of-inifinite-knowledge.txt
│ ├── api-academy.txt
```

you'd want to return the `api-academy.txt` file.

Create a function called `findLastFileInDir` that uses `await` and `readdir` to get all the items in the `dirPath` directory and return the last one.

Once you're finished, click the _HACK_ button!

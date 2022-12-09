# Fetch Request

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an "async" function called "getFilteredAuthors".</li>
  <li>The function receives a number.</li>
  <li>Use "fetch" to get books from the endpoint and parse it.</li>
  <li>Filter the books by extra pages written relative to "pageCount".</li>
  <li>Map the books to their author names.</li>
  <li>Return the result.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Welcome, Gauntleter, to the fourth challenge of Lovelace Tower. For this challenge, you must excercise your newly acquired `async` and `await` abilities to help find some peculiar names that are said to have ties to a powerful incantation you may find useful. We've discovered that those names belong to authors of books we have at a remote library. Besides that though, the only clue we have is that they've written more than a certain number of pages. If you can uncover those specific names, you can read them aloud to reveal the secret location of the incantation.

The last objective asked you to immediately return data from an API (Application Programming Interface). We'll want to do a bit more than that, normally, so this time let's do work with the response we get from the new endpoint. Similar to before, we'll be using `fetch` combined with `await` to request data.

Here's an example of fetching data and parsing the JSON (Javascript Object Notation) response from an API:

```js
const response = await fetch("some_url");
const jsonData = await response.json();
console.log(jsonData);
```

The example above requests data from "some_url", uses `await` to "pause" the code until a response comes back, parses the JSON with `response.json`, and prints it to the console.

Create a function named "getFilteredAuthors" that requests and parses data from the endpoint, filters the authors by those who have written **more** pages than the `pageCount` input, and returns the names of those authors in the form of an array.

Once finished, click the _HACK_ button!

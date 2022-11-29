# Fetch Request

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an `async` function called `getAndProcessDivinationData`.</li>
  <li>The function receives a number.</li>
  <li>Use `fetch` to get json data from the endpoint and parse it.</li>
  <li>Filter the authors by extra pages written relative to `pageCount`.</li>
  <li>Return the result.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

The last objective asked you to immediately return data from a Web API. We'll want to do a bit more than that, normally, so this time let's do work with the response we get from the new endpoint. Similar to before, we'll be using `fetch` combined with `await` to request data.

Here's an example of fetching data and parsing the json response from a Web API:

```js
const response = await fetch("some_url");
const jsonData = await response.json();
console.log(jsonData);
```

The example above requests data from "some_url", uses `await` to "pause" the code until a response is given, parses the json with `response.json` (`await`ing there as well), and prints the json data to the console.

Create a function named "getAndProcessDivinationData" that requests and parses data from the endpoint, filters the authors in the json down to just those who have written **more** pages than the `pageCount` input, and returns the result.

Once finished, click the _HACK_ button!

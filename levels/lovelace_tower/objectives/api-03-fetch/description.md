# Fetch Request

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an `async` function called `getDivinationData`.</li>
  <li>Use `fetch` to get a string from the "divination" endpoint.</li>
  <li>Return the data from the response.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Now that we have some experience using `async` and `await`, it's time to try working with our first Web API! We'll be using the `fetch` function combined with `await` to request data from an endpoint and return it from our function.

Here's an example of fetching data from a Web API:

```js
const response = await fetch("some_url");
console.log(response);
```

The example above uses `fetch` to request data from "some_url", uses `await` to "pause" the code until it's finished fetching, and then prints the response to the console.

Create a function called "getDivinationData" that uses `fetch` and `await` to request data from the "divination" endpoint and returns it.

Once you're all done, click the _HACK_ button!

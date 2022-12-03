# Fetch Request

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an `async` function called `getMagicalPhrase`.</li>
  <li>Use `fetch` to request the magical phrase from the "magic" endpoint.</li>
  <li>Copy and paste the magical phrase into the input.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Now that we have some experience using `async` and `await`, it's time to try working with our first API! We'll be using the `fetch` function combined with `await` to request a magical phrase from an endpoint.

Here's an example of fetching data from an API:

```js
const response = await fetch("some_url");
console.log(response);
```

The example above uses `fetch` to request data from "some_url", uses `await` to "pause" the code until it's finished fetching, and then prints the response to the console.

Create a function called "getMagicalPhrase" that uses `fetch` and `await` to request the magical phrase from the "magic" endpoint, then copy and paste it into the input. You may have to `console.log` in order to see it!

Once you're all done, click the _HACK_ button!

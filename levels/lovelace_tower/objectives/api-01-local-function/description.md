# Local Function

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create a function called `swapStrings`.</li>
  <li>This function receives 3 string arguments.</li>
  <li>Replace all instances of the "target" string in the "source" string with the "replacement" string, using the `replaceAll` function.</li>
  <li>Return the resulting string.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Before we jump into working with Web APIs let's remind ourselves about local APIs provided by libraries, as functions and objects. For this, we'll use the `String.replaceAll` method to replace all instances of a particular string with something else.

For example:

```js
const myString = "one two one two one two";
const swappedString = myString.replaceAll("two", "zero");

console.log(swappedString);
```

would print `one zero one zero one zero` to the console.

Create a function called `swapStrings` that takes 3 string arguments:

- `sourceString`
- `targetWord`
- `replacementWord`

Replace all instances of `targetWord` in the `sourceString` with `replacementWord` and return the result.

Once finished, click the _HACK_ button!

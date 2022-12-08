# Get and Post

<div class="aside">
<h3>Requirements</h3>
<ul>
  <li>Create an async function called `getAndPatchCorruptedInscription`.</li>
  <li>This function receives a number.</li>
  <li>Fetch and parse the corrupted inscription from the "divination" endpoint.</li>
  <li>Get the inscription fragments from the scrolls that litter the library.</li>
  <li>Send the patched inscription as well as the guid to the "divination" endpoint.</li>
  <li>Once you're done, press <em>HACK</em>.</li>
</ul>
</div>

Let's put everything we've learned together and repair an inscription that was corrupted by Fredric! We'll need to first `fetch` the corrupted inscription to see which parts need fixing. After that, we'll have to gather fragments from scrolls scattered throughout the library, combine their text as part of a string in the QuestIDE (making sure they're in the correct order). Finally, we'll need to send the repaired inscription to the "divination" endpoint via a `patch` request.

Here's an example of sending a `patch` request:

```js
const response = await fetch("{{DIVINATION_ENDPOINT}}", {
  method: "PATCH",
  body: JSON.stringify({
    guid: "{{GUID_ARGUMENT}}",
    data: {
      inscription: "{{REPAIRED_INSCRIPTION}}",
    },
  }),
});

// This code isn't required, but can be helpful in tracking errors
const jsonData = await response.json();
console.log(jsonData);
```

Create a function called `getAndPatchCorruptedInscription`, place the inscription fragments in the right order based on the response you get from the "divination" endpoint, then send the repaired inscription back to the "divination" endpoint using the "patch" method. Using `console.log` to print the response you get may prove useful here!

Once you're all done, click the _HACK_ button!
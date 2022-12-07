function swapStrings(sourceString, targetWord, replacementWord) {
  // TODO: swap the strings!
}

console.log("Test case 1:");
console.log(swapStrings("aaaeeecccddd", "e", "b"));

console.log("Test case 2:");
console.log(
  swapStrings(
    "Cheese cake is really really good!",
    "really really good",
    "very tasty"
  )
);

console.log("Test case 3:");
console.log(
  swapStrings("I'm scared to ride that rollercoaster!", "scared", "excited")
);

console.log("Test case 4:");
console.log(
  swapStrings("My*bug*code*bug*is*bug*bug*bug*free!", "\\*bug\\*", " ")
);

console.log("Test case 5:");
console.log(
  swapStrings("Thatspacewasspacereallyspacehardspacetospaceread!", "space", " ")
);

console.log("Test case 6:");
console.log(swapStrings("You're an ___ programmer!", "___", "awesome"));

function wordSwapper(sourceString, targetWord, replacementWord) {
  // TODO: swap the words!
}

console.log("Test case 1:");
console.log(wordSwapper("aaaeeecccddd", "e", "b"));

console.log("Test case 2:");
console.log(
  wordSwapper(
    "Cheese cake is really really good!",
    "really really good",
    "very tasty"
  )
);

console.log("Test case 3:");
console.log(
  wordSwapper("I'm scared to ride that rollercoaster!", "scared", "excited")
);

console.log("Test case 4:");
console.log(
  wordSwapper("My*bug*code*bug*is*bug*bug*bug*free!", "\\*bug\\*", " ")
);

console.log("Test case 5:");
console.log(
  wordSwapper("Thatspacewasspacereallyspacehardspacetospaceread!", "space", " ")
);

console.log("Test case 6:");
console.log(wordSwapper("You're an ___ programmer!", "___", "awesome"));

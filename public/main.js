// main.js
const url = "/stream";

// Create an AbortController to control and cancel the fetch request when the user hits the stop button
const controller = new AbortController();

document.querySelector("#stop").addEventListener("click", () => {
    // Exercise for the reader:
    // Add error handling for when the controller is aborted
    controller.abort();
});

// Make a POST request to the OpenAI API to get chat completions
const response = await fetch(url, {
    method: "GET",
    // Use the AbortController's signal to allow aborting the request
    // This is a `fetch()` API thing, not an OpenAI thing
    signal: controller.signal,
});

// Create a TextDecoder to decode the response body stream
const decoder = new TextDecoder();

// Iterate through the chunks in the response body using for-await...of
for await (const chunk of response.body) {
    const decodedChunk = decoder.decode(chunk);

    console.log(decodedChunk);

    document.querySelector("#content").textContent += decodedChunk;
}

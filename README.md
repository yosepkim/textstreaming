
### Caching Web Streams using HarperDB on Akamai Connected Cloud

## Problem Space
Although CDN such as Akamai provides an excellent caching mechanism for all kinds of web assets, it struggles to cache web streams. It is increasingly more common to stream responses from AI systems like ChatGPT nowadays so that users do not have to wait for the entire response. To reduce unnecessary redundant calls all the way back to the AI system, caching responese may be desirable without changing the user experience of streaming in the response. That is, the users should see the same word-by-word sequence display whether response is coming from the AI system or the caching mechanim.  

## Solution
Akamai Connected Cloud is a edge-computing platform that provides compute constructs such as virtual machines, Kubernetes environment, object storage, etc. On top of that, distributed databases such as HarperDB can be deployed to serve and cache traffic. HarperDB is not only a database but also provides an application layer on which developers can create a serverless functions in Javascript that may interact with the database efficiently.

This repository contains a serverless function code in the `./hdb/function.js` file. The function takes requests and checks against cache, if the request is already cached. If cached, it would serve it by streaming it, mimicing the normal behavior of the AI system. If cache was missed, it would forward the request to the AI system and relays the response in a stream. Once done streaming, it would then store the response in the cache.

## Live demo
The following endpoint is a fake AI system that streams response: https://origin-stream.edgecloud9.com/stream

The following endpoint is the HarperDB serverless function that fronts the fake AI system: https://miami-edgecloud9.harperdbcloud.com/streamcache/stream?question={random-words}

When hitting the second link for the first time, the response would be streamed from the AI system through the serverless function. When hitting for the second time, the response is streamed from the cache (i.e. HarperDB).

## Credits

The `index.html` and `main.js` have been adapted from the following article:
https://umaar.com/dev-tips/269-web-streams-openai/
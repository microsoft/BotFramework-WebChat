# Sample -  Adding Speech Cognitive Services Bing Speech

## Description
A simple web page with a maximized and full-featured Web Chat embed from a CDN, with cognitive services added for text-to-speech ability. This sample makes changes that are based off of the [full-bundle CDN sample](./../full-bundle/README.md).

# Test out the hosted sample
- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/speech-cognitive-services-bing-speech)

# How to run locally
- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/speech-cognitive-services-bing-speech` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)
- Append your own Speech Subscription key to the url (in the address bar) using URL Search Params: `http://localhost:5000/?s=pasteKeyHere`

# Things to try out
- Use the microphone button: you should be able to provide commands to the bot via speech
- Speak `help`: you should see a full list of MockBot features
- Speak `card weather`: you should see a weather card built using Adaptive Cards
- Speak `carousel`: you should see a carousel of cards

# Code
> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot
The `index.html` page has one main goal:
- To enable cognitive services to provide speech-to-text ability

We'll start by using the [full-bundle CDN sample](../full-bundle/README.md) as our Web Chat template.
> Cognitive Services Bing Speech package is only available in the Web Chat full bundle

> **Retrieving the subscription key in the URL and fetching a token is for demonstration purposes only.** In a published bot, the secret should be stored on the server and generate a token to avoid exposing the secret. For more information, visit the [websocket protocol documenation](https://docs.microsoft.com/en-us/azure/cognitive-services/speech/api-reference-rest/websocketprotocol#authorization) for Cognitive Services.

First, the app must retrieve the __speech cognitive services subscription key__ when running this bot. Add the `URLSearchParams` method to retrieve the key from the URL.

```diff
…
    const { token } = await res.json();
+   const SUBSCRIPTION_KEY = new URLSearchParams(window.location.search).get('s');
    window.WebChat.renderWebChat({
…
```


Next, the bot needs to fetch a **token** using the subscription key when the previous token expires.

```diff
…
  const SUBSCRIPTION_KEY = new URLSearchParams(window.location.search).get('s');
+ const TOKEN_RENEWAL_INTERVAL = 300000;
+ let accessTokenPromise;
+ let lastFetch = 0;
+
+ const fetchToken = () => {
+ const now = Date.now();
+
+ if (!accessTokenPromise || now - lastFetch > TOKEN_RENEWAL_INTERVAL) {
+   console.log(`Cognitive Services: Issuing new token using subscription key`);
+
+   lastFetch = now;
+
+   accessTokenPromise = fetch(
+   'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
+   {
+     headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
+   }
+  )
+  .then(res => res.ok ? res.text() : Promise.reject(new Error(`Failed to issue token`)))
+  .catch(err => {
+    lastFetch = 0;
+    return Promise.reject(err);
+  });
+ }
+
+ return accessTokenPromise;
};

window.WebChat.renderWebChat({
…
```


Finally, pass a Web Speech ponyfill factory to renderWebChat.
```diff
window.WebChat.renderWebChat({
  directLine: window.WebChat.createDirectLine({ token }),
+ webSpeechPonyfillFactory: window.WebChat.createCognitiveServicesWebSpeechPonyfillFactory({ fetchToken })
}, document.getElementById('webchat'));
```

> If you prefer, you can use your own W3C Web Speech API compliant speech engine. Visit the [w3c Speech API](https://w3c.github.io/speech-api/) documentation for more information, and check out the file [createCognitiveServicesWebSpeechPonyfillFactory.js](./../packages\bundle\src\createCognitiveServicesWebSpeechPonyfillFactory.js) to reference implementation.



## Completed code
Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Cognitive Services Bing Speech using JavaScript</title>
    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat,
      #webchat > * {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat"></div>
    <script>
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
+       const SUBSCRIPTION_KEY = new URLSearchParams(window.location.search).get('s');
+       const TOKEN_RENEWAL_INTERVAL = 300000;
+       let accessTokenPromise;
+       let lastFetch = 0;

+       const fetchToken = () => {
+         const now = Date.now();

+         if (!accessTokenPromise || now - lastFetch > TOKEN_RENEWAL_INTERVAL) {
+           console.log(`Cognitive Services: Issuing new token using subscription key`);

+           lastFetch = now;
+           accessTokenPromise = fetch(
+             'https://api.cognitive.microsoft.com/sts/v1.0/issueToken',
+             {
+               headers: { 'Ocp-Apim-Subscription-Key': SUBSCRIPTION_KEY },
+               method: 'POST'
+             }
+           )
+           .then(res => res.ok ? res.text() : Promise.reject(new Error(`Failed to issue token`)))
+           .catch(err => {
+             lastFetch = 0;

+             return Promise.reject(err);
+           });
+         }

+         return accessTokenPromise;
+       };

        window.WebChat.renderWebChat({
          directLine: window.WebChat.createDirectLine({ token }),
+         webSpeechPonyfillFactory: window.WebChat.createCognitiveServicesWebSpeechPonyfillFactory({ fetchToken })
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>


# Further Reading

## Full list of Web Chat Hosted Samples
View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

# Sample

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies. 

# Test out the hosted sample
- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/full-bundle)

# How to run locally

- Fork & clone this repo
- Navigate to `/Your-Local-Webchat/samples/full-bundle`
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out
- Type `help` to see a full list of MockBot features
- Type `markdown`: you should see the sample of Markdown
- Type `card weather`: you should see a weather card built using Adaptive Cards
- Type `layout carousel`: you should see a carousel of cards
   - Resize the window and see how the carousel changes size

# Code

This code features the minimal scripting the bot needs to host a full-featured Web Chat. Along with rendering Web Chat, the `index.html` page uses the full bundle CDN script:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle</title>
+     <script src="https://cdn.botframework.com/botframework-webchat/preview/botchat.js"></script>
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
+    <div id="webchat"></div>
+     <script>
      (async function () {
        // In this demo, we are using Direct Line token from MockBot.
        // To talk to your bot, you should use the token exchanged using your Direct Line secret.
        // You should never put the Direct Line secret in the browser or client app.
        // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+        window.WebChat.renderWebChat({
+          directLine: window.WebChat.createDirectLine({ token })
+        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
+    </script>
  </body>
</html>
```



# Further Reading

## CDN sunburst chart
[This chart](http://cdn.botframework.com/botframework-webchat/preview/stats.html) provides a visual of the contents of the various bot-chat bundles.

## Other CDN bundles
Check out the hosted samples and source code for other bundle options below. 

- [Full bundle with polyfills for ES5 browsers](https://microsoft.github.io/BotFramework-WebChat/es5-bundle) [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/es5-bundle)
- [Minimal bundle](https://microsoft.github.io/BotFramework-WebChat/minimal-bundle) [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/minimal-bundle)
- [Minimal bundle with Markdown](https://microsoft.github.io/BotFramework-WebChat/minimal-bundle-with-markdown) [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/minimal-bundle-with-markdown)
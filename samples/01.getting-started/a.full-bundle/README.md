# Sample - Getting started with Web Chat CDN

> This is a great sample for first-time Web Chat users.

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/a.full-bundle` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `help`: you should see a full list of MockBot features
-  Type `markdown`: you should see the sample of Markdown
-  Type `card weather`: you should see a weather card built using Adaptive Cards
-  Type `layout carousel`: you should see a carousel of cards
   -  Resize the window and see how the carousel changes size

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code features the minimal scripting the bot needs to host a full-featured Web Chat.
The `index.html` page has two main goals.

-  To import the Web Chat full bundle CDN script
-  To render Web Chat

We'll start by adding the CDN to the head of a blank `index.html` template.

```diff
  …
  <head>
+   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
  </head>
  …
```

> This CDN points to the latest official release of Web Chat. If you need to test against Web Chat's latest bits, please refer to using Web Chat's latest bits. https://github.com/microsoft/BotFramework-WebChat#how-to-test-with-web-chats-latest-bits
> Next, the code to render Web Chat must be added to the body. Note that MockBot uses **tokens** rather than the **Direct Line secret**.

> It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit [this tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

```diff
  <body>
+   <div id="webchat" role="main"></div>
+   <script>
+     (async function () {
+       const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
+       const { token } = await res.json();
+       window.WebChat.renderWebChat({
+         directLine: window.WebChat.createDirectLine({ token })
+       }, document.getElementById('webchat'));
+     })();
+   </script>
  …
  </body>
```

## Adding features

Next, you can add any other structure or DOM changes that will support Web Chat.

MockBot also features an autofocus on the Web Chat container, as well as push of any errors to the browser console. This is helpful for debugging.

```diff
  (async function () {
  …
-   })();
+     document.querySelector('#webchat > *').focus();
+   })().catch(err => console.error(err));
  </script>
```

Finally, add desired styling.

```diff
  …
  <style>
+   html,
+   body {
+     height: 100%;
+   }
+
+   body {
+     margin: 0;
+   }
+
+   #webchat {
+     height: 100%;
+     width: 100%;
+   }
  </style>
  …
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html,
      body {
        height: 100%;
      }

      body {
        margin: 0;
      }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script>
      (async function() {
        const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token })
          },
          document.getElementById('webchat')
        );

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

## Other CDN bundles

Check out the hosted samples and source code for other CDN bundle options below.

-  [Full bundle with polyfills for ES5 browsers bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle) | [(Full bundle with polyfills for ES5 browsers source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/c.es5-bundle)
-  [Minimal bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/b.minimal-bundle) | [(Minimal bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/b.minimal-bundle)
-  [Minimal bundle with Markdown bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/h.minimal-markdown) | [(Minimal bundle with Markdown source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/h.minimal-markdown)

## CDN sunburst chart

[Web Chat bundles sunburst chart](http://cdn.botframework.com/botframework-webchat/master/stats.html) - provides a visual of the contents of the various Web Chat bundles

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

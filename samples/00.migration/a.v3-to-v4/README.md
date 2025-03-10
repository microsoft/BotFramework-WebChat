# Sample - Migrating Web Chat from v3 to v4

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This shows the steps on how to migrate from a Web Chat v3 to v4.

> Note: This sample is **unrelated** to the version of **Bot Framework** that the bot is using. This sample makes changes from the v3 Web Chat samples to ultimately match the [full-bundle CDN sample](../../01.getting-started/a.full-bundle/README.md).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle)
   > Although there are two separate samples, one named `full-bundle` and the other named `migration`, the end-result HTML is exactly the same. Therefore, the `migration` sample links to the same `full-bundle` bot.

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/00.migration/a.v3-to-v4` in command line
-  Run `npx serve` in the migration directory
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

This code features the migration requirements to update Web Chat from v3 to v4.
The `index.html` page in the migration directory has two main goals.

-  To import the Web Chat v4 full bundle CDN script
-  To render Web Chat using the v4 best practices

We'll start by using our old v3 `index.html` as our starting point.

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
   <head>
      <link href="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.css" rel="stylesheet" />
   </head>
   <body>
      <div id="bot"></div>
      <script
         crossorigin="anonymous"
         src="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.js"
      ></script>
      <script>
         BotChat.App(
            {
               directLine: { secret: direct_line_secret },
               user: { id: 'userid' },
               bot: { id: 'botid' },
               resize: 'detect'
            },
            document.getElementById('bot')
         );
      </script>
   </body>
</html>
```
<!-- prettier-ignore-end -->

> This CDN points to the latest official release of Web Chat. If you need to test against Web Chat's latest bits, please refer to using Web Chat's latest bits. https://github.com/microsoft/BotFramework-WebChat#how-to-test-with-web-chats-latest-bits

Our first change is to update the CDN the webpage uses from v3 to v4.

```diff
  …
  <head>
-   <link href="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.css" rel="stylesheet" />
+   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
  </head>
  <body>
-   <div id="bot"></div>
+   <div id="webchat" role="main"></div>
-   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.js"></script>
…
```

Next, the code to render Web Chat must be updated in the body. Note that MockBot uses **tokens** rather than the **Direct Line secret**.

> It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit [this tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

```diff
  …
  <body>
    <div id="webchat" role="main"></div>
    <script>
-     BotChat.App({
-       directLine: { secret: direct_line_secret },
-       user: { id: 'userid' },
-       bot: { id: 'botid' },
-       resize: 'detect'
-     }, document.getElementById("bot"));
+     (async function () {
+       const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
+       const { token } = await res.json();
+
+       window.WebChat.renderWebChat({
+         directLine: window.WebChat.createDirectLine({ token })
+       }, document.getElementById('webchat'));
+     })();
    </script>
  </body>
  …
```

## Styling and Adding features

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

Finally, we will add basic styling since there is no longer a stylesheet included on our page.

```diff
  …
  <head>
    <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
+   <style>
+     html,
+     body {
+       height: 100%;
+     }
+
+     body {
+       margin: 0;
+     }
+
+     #webchat {
+       height: 100%;
+       width: 100%;
+     }
+   </style>
  </head>
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

-  [Full bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle) | [(Full bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/a.full-bundle)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

# Sample - Getting Started with Direct Line App Service Extension protocol

## Description

A simple web page with Web Chat connected to a bot via [Direct Line App Service Extension protocol](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-directline-extension?view=azure-bot-service-4.0).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/i.protocol-direct-line-app-service-extension)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/i.protocol-direct-line-app-service-extension` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should be able to type to the bot and receive a response in plain text

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code features the Direct Line App Service Extension protocol (Direct Line ASE). Additional steps required to set up a bot to use Direct Line App Service Extension can be found in the [DL ASE documentation](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-directline-extension?view=azure-bot-service-4.0).

The `index.html` page has the following main goals:

-  To import the Web Chat bundle CDN script
-  [Obtain a Direct Line ASE-specific token](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-directline-extension-webchat-client?view=azure-bot-service-4.0#integrate-web-chat-client)
   -  The token should have an issuer and audience of https://directlineextension.botframework.com/
   -  The token should be generated from the Direct Line ASE-specific API at https://<your_bot>.azurewebsites.net/.bot/v3/directline/tokens/generate
-  Render using the Direct Line ASE chat adapter

This sample starts with the [full-bundle CDN sample](../a.full-bundle/README.md) as the base template.

### Obtain a Direct Line ASE-specific token

We are updating the endpoint of our token server to retrieve a Direct Line ASE-specific token.

```diff
  …
- const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+ const res = await fetch('https://webchat-mockbot2.azurewebsites.net/api/token/directlinease', { method: 'POST' });
  …
```

> The token is a JSON Web Token and the `iss` and `aud` fields are both https://directlineextension.botframework.com/.

### Render using the Direct Line ASE chat adapter

Create a Direct Line ASE chat adapter with the ASE-specific token and bot endpoint. Our MockBot is hosted on https://webchat-mockbot2.azurewebsites.net/, the bot endpoint is https://webchat-mockbot2.azurewebsites.net/.bot/v3/directline.

```diff
  …
  window.WebChat.renderWebChat(
    {
-     directLine: window.WebChat.createDirectLine({ token })
+     directLine: await window.WebChat.createDirectLineAppServiceExtension({
+       domain: 'https://webchat-mockbot2.azurewebsites.net/.bot/v3/directline',
+       token
+     })
    },
    document.getElementById('webchat')
  );
  …
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle with Direct Line Speech channel</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script
      crossorigin="anonymous"
      src="https://cdn.botframework.com/botframework-webchat/latest/webchat-minimal.js"
    ></script>
    <style>
      html,
      body {
        background-color: #f7f7f7;
        height: 100%;
      }

      body {
        margin: 0;
      }

      #webchat {
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.05);
        height: 100%;
        margin: auto;
        max-width: 480px;
        min-width: 360px;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script>
      (async function() {
        const res = await fetch('https://webchat-mockbot2.azurewebsites.net/api/token/directlinease', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: await window.WebChat.createDirectLineAppServiceExtension({
              domain: 'https://webchat-mockbot2.azurewebsites.net/.bot/v3/directline',
              token
            })
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

-  [Full bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle) | [(Full bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle)
-  [Full bundle with polyfills for ES5 browsers bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle) | [(Full bundle with polyfills for ES5 browsers source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/c.es5-bundle)
-  [Direct Line App Service Extension](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-directline-extension?view=azure-bot-service-4.0)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

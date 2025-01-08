# Sample - Getting Started with Web Chat CDN minimal bundle

## Description

A simple web page with a maximized Web Chat and minimal additional components. This bundle does NOT include the following dependencies:

-  Adaptive Cards
-  Cognitive Services
-  Markdown-It

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/b.minimal-bundle)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/b.minimal-bundle` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `markdown`: you should see the raw text, instead of rendered Markdown
-  Type `card weather`: you should see an error stating Adaptive Cards renderer is not found
-  Type `hello`: you should be able to type to the bot and receive a response in plain text

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code features the minimal scripting the bot needs to host Web Chat with minimum dependencies and functionality.

The `index.html` page has two main goals.

-  To import the Web Chat core bundle CDN script
-  To render Web Chat

This sample starts with the [full-bundle CDN sample](../a.full-bundle/README.md) as the base template.

The only change needed in this sample is to change the Web Chat CDN from the full bundle to minimal bundle.

```diff
  …
  <head>
-   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
+   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat-minimal.js"></script>
  </head>
  …
```

> For demonstration purposes, we are using the latest official release of Web Chat at "/latest/webchat-minimal.js". When you are using Web Chat for production, you may lock down on a specific version with the following format: "/4.1.0/webchat-minimal.js".

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Minimal bundle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script
      crossorigin="anonymous"
      src="https://cdn.botframework.com/botframework-webchat/latest/webchat-minimal.js"
    ></script>
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

-  [Full bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle) | [(Full bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/a.full-bundle)
-  [Full bundle with polyfills for ES5 browsers bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle) | [(Full bundle with polyfills for ES5 browsers source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/c.es5-bundle)
-  [Minimal bundle with Markdown bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/h.minimal-markdown) | [(Minimal bundle with Markdown source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/h.minimal-markdown)

## CDN sunburst chart

[Web Chat bundles sunburst chart](http://cdn.botframework.com/botframework-webchat/master/stats.html) - provides a visual of the contents of the various Web Chat bundles

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

# Sample - Getting Started with Web Chat CDN with Polyfills

> This sample uses `webchat-es5.js`. Despite its name, it does not run on Internet Explorer 11. Starting from 4.16.0, Internet Explorer is no longer supported. 4.15.9 is the last version which supports Internet Explorer 11 in limited fashion.

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies. This sample makes changes that are based off of the [full-bundle CDN sample][1].

## What is in this bundle?

`webchat-es5.js` is the full bundle plus polyfills for some newer built-ins, such as `fetch` and `Promise`. It is built for the same JavaScript version as `webchat.js` and supports the same browsers: the latest 2 versions of modern browsers like Chrome, Microsoft Edge, and Firefox.

## What are polyfills?

Polyfills are important for browsers that do not have native technology that is expected in modern browsers. By using a polyfill, you as the developer can ensure that your app works on those browsers.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/c.es5-bundle)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/c.es5-bundle` in command line
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

This code features the minimal scripting the bot needs to host a full-featured Web Chat, with polyfills. We will simply be modifying our dependencies in the `script` tag on our `index.html`, based off of the [full-bundle CDN sample][1].
The `index.html` page has two main goals.

-  To import the Web Chat full bundle CDN script
-  To render Web Chat

We'll start by using the [full-bundle CDN sample][1] as our Web Chat template.

Simply modify the CDN from the full-bundle Web Chat to the full bundle with polyfills.

```diff
  …
  <head>
+   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat-es5.js"></script>
-   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
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
    <title>Web Chat: Full-featured bundle with polyfills</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script
      crossorigin="anonymous"
      src="https://cdn.botframework.com/botframework-webchat/latest/webchat-es5.js"
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
      window
        .fetch('https://hawo-mockbot4-token-app.ambitiousflower-67725bfd.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' })
        .then(function(res) {
          return res.json();
        })
        .then(function(json) {
          const token = json.token;

          window.WebChat.renderWebChat(
            {
              directLine: window.WebChat.createDirectLine({
                token: token
              })
            },
            document.getElementById('webchat')
          );

          document.querySelector('#webchat > *').focus();
        });
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

-  [Learn more about polyfills](https://stackoverflow.com/questions/7087331/what-is-the-meaning-of-polyfills-in-html5)

## Other CDN bundles

Check out the hosted samples and source code for other CDN bundle options below.

-  [Full bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/a.full-bundle) | [(Full bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/a.full-bundle)
-  [Minimal bundle bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/b.minimal-bundle) | [(Minimal bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/b.minimal-bundle)
-  [Minimal bundle with Markdown bot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/h.minimal-markdown) | [(Minimal bundle source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/01.getting-started/h.minimal-markdown)

## CDN sunburst chart

[Web Chat bundles sunburst chart](http://cdn.botframework.com/botframework-webchat/master/stats.html) - provides a visual of the contents of the various Web Chat bundles

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

[1]: ../a.full-bundle/README.md

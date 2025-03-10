# Sample - Getting Started with Web Chat CDN with ES5 Polyfills

> This is a great sample for first-time Web Chat users developing bots that must work on Internet Explorer 11.

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies. This sample makes changes that are based off of the [full-bundle CDN sample][1].

## Why use this bundle?

If you know that many of your Web Chat users will be using Internet Explorer 11, we strongly recommend that you use this bundle instead of the `full-bundle`. Otherwise, your bot may not function as expected in IE11.

Please note:

-  Web Chat does not support Internet Explorer older than version 11
-  Customization as shown in non-ES5 samples are not supported for Internet Explorer. Because IE11 is a non-modern browser, it does not support ES6, and many samples that use arrow functions and modern promises would need to be manually converted to ES5. If you are in need of heavy customization for your app, we strongly recommend developing your app for a modern browser like Google Chrome or Microsoft Edge.
-  Web Chat has no plan to support samples for IE11 (ES5).
   -  For customers who wish to manually rewrite our other samples to work in IE11, we recommend looking into converting code from ES6+ to ES5 using polyfills and transpilers like [`babel`](https://babeljs.io/docs/en/next/babel-standalone.html).

## What are polyfills?

Polyfills are important for browsers that do not have native technology that is expected in modern browsers. By using a polyfill, you as the developer can ensure that your app works, in this case, on Internet Explorer 11.

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

This code features the minimal scripting the bot needs to host a full-featured Web Chat, with IE11 backwards compatibility. We will simply be modifying our dependencies in the `script` tag on our `index.html`, based off of the [full-bundle CDN sample][1].
The `index.html` page has two main goals.

-  To import the Web Chat full bundle CDN script
-  To render Web Chat in Internet Explorer 11

We'll start by using the [full-bundle CDN sample][1] as our Web Chat template.

Simply modify the CDN from the full-bundle Web Chat to full es5-polyfill Web Chat.

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
    <title>Web Chat: Full-featured bundle with ES5 polyfills</title>
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
        .fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' })
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

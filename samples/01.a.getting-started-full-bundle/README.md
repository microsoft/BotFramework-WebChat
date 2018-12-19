# Sample -  Getting started with Web Chat CDN

> This is a great sample for first-time Web Chat users.

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This includes Adaptive Cards, Cognitive Services, and Markdown-It dependencies.

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.a.getting-started-full-bundle)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/01.a.getting-started-full-bundle` in command line
- Run `npx serve` in the full-bundle directory
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Type `help`: you should see a full list of MockBot features
- Type `markdown`: you should see the sample of Markdown
- Type `card weather`: you should see a weather card built using Adaptive Cards
- Type `layout carousel`: you should see a carousel of cards
   - Resize the window and see how the carousel changes size

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code features the minimal scripting the bot needs to host a full-featured Web Chat.
The `index.html` page has two main goals.
- To import the Web Chat full bundle CDN script
- To render Web Chat

 We'll start by adding the CDN to the head of a blank `index.html` template.
```diff
…
<head>
+ <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
</head>
…
```

> For demonstration purposes, we are using the development branch of Web Chat at "/master/webchat.js". When you are using Web Chat for production, you should use the latest stable release at "/latest/webchat.js", or lock down on a specific version with the following format: "/4.1.0/webchat.js".

Next, the code to render Web Chat must be added to the body. Note that MockBot uses **tokens** rather than the **Direct Line secret**.
> It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit [this tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

```diff
<body>
+ <div id="webchat" role="main"></div>
+ <script>
+   (async function () {
+     const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+     const { token } = await res.json();
+     window.WebChat.renderWebChat({
+       directLine: window.WebChat.createDirectLine({ token })
+     }, document.getElementById('webchat'));
+   })();
+ </script>
…
</body>
```

## Adding features

Next, you can add any other structure or DOM changes that will support Web Chat.

MockBot also features an autofocus on the Web Chat container, as well as push of any errors to the browser console. This is helpful for debugging.

```diff
  (async function () {
…
-  })();
+    document.querySelector('#webchat > *').focus();
+  })().catch(err => console.error(err));
</script>
```

Finally, add desired styling.

```diff
…
<style>
+ html, body { height: 100% }
+ body { margin: 0 }

+ #webchat, #webchat > * {
+   height: 100%;
+   width: 100%;
+ }
</style>
…
```

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle</title>
+   <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
   <style>
+    html, body { height: 100% }
+    body { margin: 0 }
+    #webchat,
+    #webchat > * {
+      height: 100%;
+      width: 100%;
+    }
   </style>
  </head>
   <body>
+    <div id="webchat" role="main"></div>
+    <script>
+     (async function () {
+       const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+       const { token } = await res.json();

+       window.WebChat.renderWebChat({
+         directLine: window.WebChat.createDirectLine({ token })
+       }, document.getElementById('webchat'));

+       document.querySelector('#webchat > *').focus();
+     })().catch(err => console.error(err));
+    </script>
  </body>
</html>
```

# Further reading

## Other CDN bundles

Check out the hosted samples and source code for other CDN bundle options below.

- [Full bundle with polyfills for ES5 browsers](https://microsoft.github.io/BotFramework-WebChat/01.b.getting-started-es5-bundle) | [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/01.b.getting-started-es5-bundle)
- [Minimal bundle](https://microsoft.github.io/BotFramework-WebChat/02.a.getting-started-minimal-bundle) | [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/02.a.getting-started-minimal-bundle)
- [Minimal bundle with Markdown](https://microsoft.github.io/BotFramework-WebChat/02.b.getting-started-minimal-markdown) | [(source)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/02.b.getting-started-minimal-markdown)

## CDN sunburst chart

[This chart](http://cdn.botframework.com/botframework-webchat/master/stats.html) provides a visual of the contents of the various Web Chat bundles

## Full list of Web Chat hosted samples

View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

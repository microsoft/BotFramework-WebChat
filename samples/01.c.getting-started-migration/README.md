# Sample -  Migrating Web Chat from v3 to v4

A simple web page with a maximized and full-featured Web Chat embed from a CDN. This shows the steps on how to migrate from a Web Chat v3 to v4.

> Note: This sample is __unrelated__ to the version of **Bot Framework** that the bot is using. This sample makes changes from the v3 Web Chat samples to ultimately match the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.a.getting-started-full-bundle)
> Although there are two separate samples, one named `full-bundle` and the other named `migration`, the end-result HTML is exactly the same. Therefore, the `migration` sample links to the same `full-bundle` bot. 

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/01.c.getting-started-migration` in command line
- Run `npx serve` in the migration directory
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

This code features the migration requirements to update Web Chat from v3 to v4.
The `index.html` page in the migration directory has two main goals.
- To import the Web Chat v4 full bundle CDN script
- To render Web Chat using the v4 best practices

 We'll start by using our old v3 `index.html` as our starting point. 
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <link href="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.css" rel="stylesheet" />
  </head>
  <body>
    <div id="bot" />
    <script src="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.js"></script>
    <script>
      BotChat.App({
        directLine: { secret: direct_line_secret },
        user: { id: 'userid' },
        bot: { id: 'botid' },
        resize: 'detect'
      }, document.getElementById("bot"));
    </script>
  </body>
</html>
```

> For demonstration purposes, we are using the development branch of Web Chat at "/master/webchat.js". When you are using Web Chat for production, you should use the latest stable release at "/latest/webchat.js", or lock down on a specific version with the following format: "/4.1.0/webchat.js".

Our first change is to update the CDN the webpage uses from v3 to v4.
```diff
…
 <head>
-  <link href="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.css" rel="stylesheet" />
+  <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
  </head>
  <body>
-   <div id="bot" />    
+   <div id="webchat" role="main" />
-   <script src="https://cdn.botframework.com/botframework-webchat/0.13.1/botchat.js"></script>
…
```

Next, the code to render Web Chat must be updated in the body. Note that MockBot uses **tokens** rather than the **Direct Line secret**.
> It is **never recommended** to put the Direct Line secret in the browser or client app. To learn more about secrets and tokens for Direct Line, visit [this tutorial on authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication).

```diff
…
<body>
  <div id="webchat" role="main"></div>
  <script>
-   BotChat.App({
-     directLine: { secret: direct_line_secret },
-     user: { id: 'userid' },
-     bot: { id: 'botid' },
-     resize: 'detect'
-   }, document.getElementById("bot"));
+   (async function () {
+     const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+     const { token } = await res.json();
+
+     window.WebChat.renderWebChat({
+       directLine: window.WebChat.createDirectLine({ token })
+     }, document.getElementById('webchat'));
+   })();
  </script>
…
</body>
```

## Styling and Adding features

Next, you can add any other structure or DOM changes that will support Web Chat.

MockBot also features an autofocus on the Web Chat container, as well as push of any errors to the browser console. This is helpful for debugging.

```diff
  (async function () {
…
- })();
+   document.querySelector('#webchat > *').focus();
+ })().catch(err => console.error(err));
</script>
```


Finally, we will add basic styling since there is no longer a stylesheet included on our page.
```diff
…
  <head>
    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
+   <style>
+     html, body { height: 100% }
+     body { margin: 0 }

+     #webchat,
+     #webchat > * {
+       height: 100%;
+       width: 100%;
+     }
+   </style>
  </head>
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
+   <style>
+     html, body { height: 100% }
+     body { margin: 0 }
+     #webchat,
+     #webchat > * {
+       height: 100%;
+       width: 100%;
+     }
+   </style>
  </head>
  <body>
+   <div id="webchat" role="main"></div>
+   <script>
+    (async function () {
+      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+      const { token } = await res.json();

+      window.WebChat.renderWebChat({
+        directLine: window.WebChat.createDirectLine({ token })
+      }, document.getElementById('webchat'));

+      document.querySelector('#webchat > *').focus();
+    })().catch(err => console.error(err));
+   </script>
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

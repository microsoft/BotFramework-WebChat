# Sample - Customize open URL behavior

Web Chat client that will show a confirmation dialog when opening a URL.

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/18.customization-open-url)

# Things to try out

- Type "card sports" in the send box
- Click on the "Seattle vs Panthers" card

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

- To intercept all open URL actions

We'll start by using the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md) as our Web Chat template.

```diff
…
window.WebChat.renderWebChat({
  directLine: window.WebChat.createDirectLine({ token }),
+ openUrlPonyfillFactory: ({ cardAction: { type } }) => {
+   switch (type) {
+     case 'signin':
+       const popup = window.open();
+
+       return url => popup.location.href = url;
+
+     default:
+       return url => {
+         if (confirm(`Do you want to open this URL?\n\n${ url }`)) {
+           window.open(url, '_blank');
+         }
+       };
+   }
  },
…
```

To prevent getting blocked by a popup blocker, the `window.open` call must be initiated from a user action.

> Currently, when you click on "Sign in" of an OAuth card, it will fetch a `code_challenge` from our server before redirecting to the OAuth provider. To not getting blocked by a popup blocker, we need to call `window.open` first, then fetch the `code_challenge`, and lastly redirect the user to the OAuth provider.

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Browser-supported speech</title>
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
    <div id="webchat" role="main"></div>
    <script>
      (async function () {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        window.WebChat.renderWebChat({
-         directLine: window.WebChat.createDirectLine({ token })
          directLine: window.WebChat.createDirectLine({ token }),
+         openUrlPonyfillFactory: ({ cardAction: { type } }) => {
+           switch (type) {
+             case 'signin':
+               const popup = window.open();
+
+               return url => popup.location.href = url;
+
+             default:
+               return url => {
+                 if (confirm(`Do you want to open this URL?\n\n${ url }`)) {
+                   window.open(url, '_blank');
+                 }
+               };
+           }
          },
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

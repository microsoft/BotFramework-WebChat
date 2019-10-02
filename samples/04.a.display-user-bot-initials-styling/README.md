# Sample - Display User and Bot Initials on Web Chat

## Description

A simple web page with a maximized Web Chat that displays initials for both the bot and the user.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.a.display-user-bot-initials-styling)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/04.a.display-user-bot-images-styling` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should see the initials displayed next to user and bot speech bubbles in the transcript.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This sample will show you how to implement your own initials displayed next to .

This sample starts with the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md) as the base template.

First, we want to add the `styleOptions` object to our `index.html` page and add the initials as values within the object. This object will be passed into Web Chat. The keys for the bot and user initials are `botAvatarInitials` and `userAvatarInitials`, respectively.

Add the initials for both the user and the bot. The new object should look like the following:

```diff
  const { token } = await res.json();
- const styleOptions = {};
+ const styleOptions = {
+  botAvatarInitials: 'BF',
+  userAvatarInitials: 'WC'
+ };
```

Finally, make sure the `styleOptions` object is passed into Web Chat, like so:

```diff
…
window.WebChat.renderWebChat({
-       directLine: window.WebChat.createDirectLine({ token })
+       directLine: window.WebChat.createDirectLine({ token }),
+       styleOptions
 }, document.getElementById('webchat'));
 …
```

That's it!

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Avatar with images and initials</title>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script>
      (async function () {
        https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

+       const styleOptions = {
+         botAvatarInitials: 'BF',
+         userAvatarInitials: 'WC'
+       };

        window.WebChat.renderWebChat({
-         directLine: window.WebChat.createDirectLine({ token })
+         directLine: window.WebChat.createDirectLine({ token }),
+         styleOptions
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further reading

-  [Branding Web Chat styling](https://microsoft.github.io/BotFramework-WebChat/05.a.branding-webchat-styling) | [(Branding Web Chat source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.a.branding-webchat-styling/)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

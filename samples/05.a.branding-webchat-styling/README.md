# Sample - Branding Web Chat Styling

## Description
This sample introduces `styleSetOptions` and branding your bot through Web Chat via styling.

# Test out the hosted sample

# MUST FIX THIS LINK. IN ALL PREVIOUS SAMPLES (1-4)

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.a.branding-webchat-styling)


# How to run
- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/05.b.branding-webchat-styling` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out
- Type `hello`: you should see the speech bubbles from the bot and user are pale blue and pale green respectively. This is different from the default grey and blue bubbles in Web Chat.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot


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

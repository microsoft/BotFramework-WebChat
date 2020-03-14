# Sample - Disable the Upload Button

-  Prevent users from sending attachments to the bot by disabling the upload button.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/f.hide-upload-button)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/f.hide-upload-button` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Note that there is no upload button in the Send Box

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

This sample starts with the [full-bundle CDN sample](./../01.getting-started/a.full-bundle/README.md) as the base template.

By modifying the `styleOptions` object passed into the renderer, we can disable the upload button with minimal effort.

```diff
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   styleOptions: {
+     hideUploadButton: true
+   }
  }, document.getElementById('webchat'));
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Hide upload button</title>
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
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            styleOptions: {
              hideUploadButton: true
            }
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

-  [Branding styling bot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/a.branding-web-chat) | [(Branding styling source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/02.branding-styling-and-customization/a.branding-web-chat)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

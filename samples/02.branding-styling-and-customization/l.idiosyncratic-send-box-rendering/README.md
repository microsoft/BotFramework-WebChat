    # Sample - Rendering your own send box

Pass down a renderer to Web Chat to render the send box.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/j.enable-emoji)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/l.idiosyncratic-send-box-rendering` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Modify the sendBoxRenderer parameter to what you want and witness the results.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code shows how to pass down your own renderer for the send box.
You might want to implement certain branding, UX or just revant the HTML structure.

When you render the webchat element, simply pass a function in the `sendBoxRenderer` prop.

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Full-featured bundle</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <!--
      This CDN points to the latest official release of Web Chat. If you need to test against Web Chat's latest bits, please refer to pointing to Web Chat's MyGet feed:
      https://github.com/microsoft/BotFramework-WebChat#how-to-test-with-web-chats-latest-bits
    -->
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
      (async function () {
        // In this demo, we are using Direct Line token from MockBot.
        // Your client code must provide either a secret or a token to talk to your bot.
        // Tokens are more secure. To learn about the differences between secrets and tokens
        // and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            sendBoxRenderer: function (props) {
              return window.React.createElement(
                'div',
                { className: 'main' },
                window.React.createElement('p', null, "Hi, I'm here instead of the sendbox, that means it worked :)")
              );
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

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

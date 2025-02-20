# Sample - Customize open URL behavior

Web Chat client that will show a confirmation dialog when opening a URL.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/i.open-url)

# Things to try out

-  `"openUrl"` card action
   -  Type `card sports` in the send box
   -  Click on the "Seattle vs Panthers" card
      -  A prompt will show to ask if you want to open the URL
-  `"signin"` card action
   -  Type `oauth` in the send box
      -  Will directly send the user to GitHub authentication page

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

-  To intercept both `"openUrl"` and `"signin"` card action
   -  Other unintercepted card action, will use default behavior

We'll start by using the [full-bundle CDN sample](../../01.getting-started/a.full-bundle/README.md) as our Web Chat template.

```diff
  …
  window.WebChat.renderWebChat({
    directLine: window.WebChat.createDirectLine({ token }),
+   cardActionMiddleware: () => next => async ({ cardAction, getSignInUrl }) => {
+     const { type, value } = cardAction;
+
+     switch (type) {
+       case 'signin':
+         const popup = window.open();
+         const url = await getSignInUrl();
+
+         popup.location.href = url;
+
+         break;
+
+       case 'openUrl':
+         if (confirm(`Do you want to open this URL?\n\n${ value }`)) {
+           window.open(value, '_blank');
+         }
+
+         break;
+
+       default:
+         return next({ cardAction, getSignInUrl });
+     }
    },
  …
```

To prevent getting blocked by a popup blocker, the `window.open()` must be called immediately inside `cardActionMiddleware`.

> In this sample, we use a `confirm()` prompt for demonstration purpose only. It will cause popup blocker to block the URL. This is expected behavior.

> Currently, when you click on "Sign in" of an OAuth card, it will get a fresh URL from our server before redirecting to the OAuth provider. To not getting blocked by a popup blocker, we need to call `window.open` first, then get the URL, and lastly redirect the user to the OAuth provider.

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Customize open URL behavior</title>
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

        const res = await fetch('https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),

            cardActionMiddleware: () => next => async ({ cardAction, getSignInUrl }) => {
              const { type, value } = cardAction;

              switch (type) {
                case 'signin':
                  const popup = window.open();
                  const url = await getSignInUrl();

                  popup.location.href = url;

                  break;

                case 'openUrl':
                  if (confirm(`Do you want to open this URL?\n\n${value}`)) {
                    window.open(value, '_blank');
                  }

                  break;

                default:
                  return next({ cardAction, getSignInUrl });
              }
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

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

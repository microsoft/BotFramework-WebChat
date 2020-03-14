# Sample - Customize send timeout

This sample shows how to customize the send timeout component.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/h.send-timeout)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/h.send-timeout` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

> You will need to turn on airplane mode to test send timeout.

1. After Web Chat loads, turn on airplane mode and send a message
1. Try out different timeout values and observe the change
   -  Open developer tools and change to "Custom retry"

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

> Note: this sample is based from [`01.getting-started/a.full-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle).

This sample will add a button bar with multiple send timeout values. When clicked, the send timeout value will change on-the-fly.

### Adding a button bar

First, add a button bar to the HTML. The button bar contains multiple hyperlinks that will change the retry value through URL hashes.

```diff
  <body>
    <div id="webchat" role="main"></div>
+   <p id="buttonBar">
+     <a href="#retry=default">Default retry</a>
+     <a href="#retry=false">Show retry immediately</a>
+     <a href="#retry=1000">Show retry after 1 second</a>
+     <a href="#retry=5000">Show retry after 5 seconds</a>
+     <a href="#retry=120000">Show retry after 2 minutes</a>
+     <a href="#retry=fn">Custom retry</a>
+   </p>
    <script>
```

Then, style the button bar by adding the following CSS styles.

```diff
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

+ #buttonBar {
+   display: flex;
+   flex-wrap: wrap;
+   left: 10px;
+   margin: 0;
+   position: absolute;
+   top: 10px;
+ }
+
+ #buttonBar > a {
+   background-color: White;
+   border: solid 2px #0063b1;
+   color: #0063b1;
+   font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
+   font-size: 80%;
+   margin: 0 10px 10px 0;
+   padding: 5px 8px;
+   text-decoration: none;
+ }
+
+ #buttonBar > a.selected {
+   background-color: #0063b1;
+   color: White;
+ }
```

When the page is loaded, you should see the button bar on the page.

### Hooking the button bar

When clicking on the button bar, the URL will be updated with a new retry value in hash. The `hashchange` event will be intercepted and update the `sendTimeout` value in Web Chat by calling `renderWebChat`.

First, call `renderWebChat` on initial page load and on every `hashchange` event. The `directLine` object will be memoized so it will not be recreated and reconnected on every call.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();
  const directLine = window.WebChat.createDirectLine({ token });

+ function renderWebChat() {
    window.WebChat.renderWebChat(
      {
-       directLine: window.WebChat.createDirectLine({ token })
+       directLine
      },
      document.getElementById('webchat')
    );
+ }

+ window.addEventListener('hashchange', renderWebChat);

+ renderWebChat();

  document.querySelector('#webchat > *').focus();
```

Then, read the `sendTimeout` value from `location.hash` and update Web Chat.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();
  const directLine = window.WebChat.createDirectLine({ token });

+ function getHash() {
+   const hash = new URLSearchParams((location.hash || '').substr(1));
+   const hashJSON = {};
+
+   for (const [key, value] of hash.entries()) {
+     hashJSON[key] = value;
+   }
+
+   return hashJSON;
+ }

  function renderWebChat() {
+   const { retry } = getHash();
+   const sendTimeout =
+     retry === 'fn'
+       ? activity => {
+           console.group('Running custom function to evaluate send timeout for activity.');
+           console.log(activity);
+           console.log('Returning 2 seconds.');
+           console.groupEnd();
+
+           return 2000;
+         }
+       : retry === 'false'
+       ? false
+       : +retry || undefined;
+
+   console.log(
+     `Using send timeout value of ${
+       typeof sendTimeout === 'function' ? 'custom function' : JSON.stringify(sendTimeout)
+     }`
+   );

    window.WebChat.renderWebChat(
      {
-       directLine
+       directLine,
+       styleOptions: {
+         sendTimeout
+       }
      },
      document.getElementById('webchat')
    );
  }

  window.addEventListener('hashchange', renderWebChat);

  renderWebChat();

  document.querySelector('#webchat > *').focus();
```

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Customize send timeout</title>
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

      #buttonBar {
        display: flex;
        flex-wrap: wrap;
        left: 10px;
        margin: 0;
        position: absolute;
        top: 10px;
      }

      #buttonBar > a {
        background-color: White;
        border: solid 2px #0063b1;
        color: #0063b1;
        font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
        font-size: 80%;
        margin: 0 10px 10px 0;
        padding: 5px 8px;
        text-decoration: none;
      }

      #buttonBar > a.selected {
        background-color: #0063b1;
        color: White;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <p id="buttonBar">
      <a href="#retry=default">Default retry</a>
      <a href="#retry=false">Show retry immediately</a>
      <a href="#retry=1000">Show retry after 1 second</a>
      <a href="#retry=5000">Show retry after 5 seconds</a>
      <a href="#retry=120000">Show retry after 2 minutes</a>
      <a href="#retry=fn">Custom retry</a>
    </p>
    <script>
      (async function() {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const directLine = window.WebChat.createDirectLine({ token });

        function getHash() {
          const hash = new URLSearchParams((location.hash || '').substr(1));
          const hashJSON = {};

          for (const [key, value] of hash.entries()) {
            hashJSON[key] = value;
          }

          return hashJSON;
        }

        function renderWebChat() {
          const { retry } = getHash();
          const sendTimeout =
            retry === 'fn'
              ? activity => {
                  console.group('Running custom function to evaluate send timeout for activity.');
                  console.log(activity);
                  console.log('Returning 2 seconds.');
                  console.groupEnd();

                  return 2000;
                }
              : retry === 'false'
              ? false
              : +retry || undefined;

          console.log(
            `Using send timeout value of ${
              typeof sendTimeout === 'function' ? 'custom function' : JSON.stringify(sendTimeout)
            }`
          );

          window.WebChat.renderWebChat(
            {
              directLine,
              styleOptions: {
                sendTimeout
              }
            },
            document.getElementById('webchat')
          );
        }

        window.addEventListener('hashchange', renderWebChat);

        renderWebChat();

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```
<!-- prettier-ignore-end -->

# Further reading

[`useSendTimeoutForActivity` hook](https://github.com/microsoft/BotFramework-WebChat/blob/master/docs/HOOKS.md#useSendTimeoutForActivity)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

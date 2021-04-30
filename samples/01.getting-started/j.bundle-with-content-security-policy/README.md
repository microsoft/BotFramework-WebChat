# Sample - Configuring Content Security Policy

## Description

A simple web page with Web Chat and [Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP) configured.

> In this sample, a nonce of `a1b2c3d` is being used for simplicity. In production system, a random and unguessable value should be used instead.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/01.getting-started/j.bundle-with-content-security-policy)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/01.getting-started/j.bundle-with-content-security-policy` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should be able to type to the bot and receive a response in plain text
-  Type `carousel`: you should see multiple cards, without images
-  Upload a file: you should see the file uploaded successfully with a thumbnail

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This sample starts with the [full-bundle CDN sample](../a.full-bundle/README.md) as the base template. It demonstrates a strict Content Security Policy configured on the page and only allowed operations required by Web Chat.

The only change needed in this sample is to configure a strict Content Security Policy and enable nonce-based source.

<!-- prettier-ignore-start -->
```diff
  …
  <head>
+   <meta
+     http-equiv="Content-Security-Policy"
+     content="default-src 'none'; base-uri 'none'; connect-src https://directline.botframework.com wss://directline.botframework.com https://webchat-mockbot.azurewebsites.net; img-src blob:; script-src 'nonce-a1b2c3d' 'strict-dynamic'; style-src 'nonce-a1b2c3d'"
+   />
-   <script crossorigin="anonymous" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
+   <script crossorigin="anonymous" nonce="a1b2c3d" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
-   <style>
+   <style nonce="a1b2c3d">
      …
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
-   <script>
+   <script nonce="a1b2c3d">
      …
      window.WebChat.renderWebChat(
        {
-         directLine: window.WebChat.createDirectLine({ token })
+         directLine: window.WebChat.createDirectLine({ token }),
+         nonce: 'a1b2c3d'
        },
        document.getElementById('webchat')
      );
      …
    </script>
  </body>
```
<!-- prettier-ignore-end -->

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Minimal bundle</title>
    <meta
      http-equiv="Content-Security-Policy"
      content="default-src 'none'; base-uri 'none'; connect-src https://directline.botframework.com wss://directline.botframework.com https://webchat-mockbot.azurewebsites.net; img-src blob:; script-src 'nonce-a1b2c3d' 'strict-dynamic'; style-src 'nonce-a1b2c3d'"
    />
    <script crossorigin="anonymous" nonce="a1b2c3d" src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <style nonce="a1b2c3d">
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
    <script nonce="a1b2c3d">
      (async function() {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            nonce: 'a1b2c3d'
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

You can read about [the design of Content Security Policy in this article](https://github.com/microsoft/BotFramework-WebChat/tree/main/docs/CONTENT_SECURITY_POLICY.md).

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

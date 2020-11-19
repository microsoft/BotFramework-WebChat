# Sample - Change locale

This sample shows how to change locale and direction for RTL languages on Web Chat.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/g.change-locale)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/i.change-locale-and-direction` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Note that the UI is set to Right to Left
-  Type `card arabicgreeting` to the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

> Note: this sample is based from [`01.getting-started/a.full-bundle`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle).

### What is Right to Left, Left to Right, and Bidirectional Support?

-  Right-to-Left (RTL) is the UI implementation of displaying an app differently according to the language (human language, i.e. English or Arabic) of the app. For example, Arabic is a RTL language, and therefore an app in Arabic will ideally mirror<sup>\*</sup> the English version of the UI to fit the directional flow of the language's script.
-  Left-to-Right (LTR) follows the directional flow of languages like English
-  Bidirectional support (or BiDi) allows for both RTL and LTR (Left-to-Right) support within a single app, depending on the language of the content being displayed.

(\*) 'Mirror' in this article is not meant literally. In UI rules of BiDi, not every aspect or component will be mirrored

### How to use

You can affect the direction of Web Chat in two ways:

1. Set the Web Chat `locale` prop to an RTL language, e.g. `ar-EG`

-  This will automatically set the direction to `rtl`

1. Set the Web Chat `dir` property to `rtl`

-  The available properties for `dir` are: `'ltr'`, `'rtl'`, and `'auto'`

Update your `renderWebChat` method to the following:

```diff
  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
+       locale: 'ar-EG'
    },
    document.getElementById('webchat')
  );
```

To force the direction of the UI regardless of language, you may use the `dir` prop:

```diff
  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
+     dir: 'rtl'
    },
    document.getElementById('webchat')
  );
```

Notes:

-  Adaptive Cards unofficially supports RTL, and the changes above will also change the UI of your Adaptive Cards
-  Markdown supports RTL.
-  The card carousel `react-film` supports RTL
-  `video` and `audio` do not natively support RTL, and therefore videos and audio clips will continue to appear in LTR format.

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Arabic with RTL UI</title>
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
            locale: 'ar-EG'
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

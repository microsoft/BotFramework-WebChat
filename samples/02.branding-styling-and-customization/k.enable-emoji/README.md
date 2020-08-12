    # Sample - Enabling and customizing emoji autocorrect in the sendbox

Enable Web Chat to convert typed emoticons (`:)`) into emoji (😊) inside the Send Box.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/j.enable-emoji)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/j.enable-emoji` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `:)` and note that it is converted to emoji
-  Type <kbd>Ctrl</kbd> + <kbd>Z</kbd> and note that the emoji is reverted to the original emoticon.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Getting started

### Goals of this bot

This code shows how to enable the default emoji autocorrect and then customize the emoji list by adding your own.

The first step is to modify the `emojiSet` value in `styleOptions`

Accepted values:

-  `true` / `false`
   -  `false` (default) disables emoji autocorrect. Emoticons will not be converted to emoji.
   -  `true` enables emoji autocorrect with the default emoji set.
-  Custom unicode map (e.g. `{ ':)' : '😊'}`)
   -  This enables emoji autocorrect by providing a custom list. Only the emoticons in this list will be converted to emoji.

Default emoji list when `emojiSet` is true:

```js
{
  ':)': '😊',
  ':-)': '😊',
  '(:': '😊',
  '(-:': '😊',
  ':-|': '😐',
  ':|': '😐',
  ':-D': '😀',
  ':D': '😀',
  ':-p': '😛',
  ':p': '😛',
  ':-P': '😛',
  ':P': '😛',
  ':-o': '😲',
  ':o': '😲',
  ':O': '😲',
  ':-O': '😲',
  ':-0': '😲',
  ':0': '😲',
  ';-)': '😉',
  ';)': '😉',
  '<3': '❤️',
  '</3': '💔',
  '<\\3': '💔'
};
```

```js
const styleOptions = {
   emojiSet: true
};
window.WebChat.renderWebChat(
   {
      directLine: window.WebChat.createDirectLine({ token }),
      styleOptions
   },
   document.getElementById('webchat')
);
```

Test your Web Chat page, and you will see that the default list of emoticons is converted to emoji.

To add your own custom list, change the `emojiSet` to the following:

```js
const styleOptions = {
   emojiSet: {
      ':sheep:': '🐑',
      '<3': '❤️'
   }
};
```

Reload Web Chat and type `:sheep:` to see the custom map put to use.

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
    <script crossorigin="anonymous" src="../../../\packages\bundle\dist\webchat.js"></script>
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
        const styleOptions = {
          emojiSet: {
            ':sheep:': '🐑',
            '<3': '❤️'
          }
        };
        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            styleOptions
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

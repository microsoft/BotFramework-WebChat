# Sample - Idiosyncratic manual styling

## Description

This sample introduces the ability to overwrite `createStyleSet`, which is the unsupported way of changing the appearance of Web Chat.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/b.idiosyncratic-manual-styles)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/02.branding-styling-and-customization/b.idiosyncratic-manual-styles` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should see the speech bubbles from the bot and user are pale blue and pale green respectively, and the font has been changed to Comic Sans. This is different from the default grey and blue bubbles and font in Web Chat.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overriding `createStyleSet`

> Please note that this method of styling Web Chat is **not recommended** and **not supported**. If you need to make styling changes, we **strongly recommend** using the strategy available in [05.a-branding-webchat-styling](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/02.branding-styling-and-customization/a.branding-web-chat). Please take a look at that sample before you decide to use manual styling.

If there are aspects of Web Chat that you want to change in appearance, and do not wish to file a PR with us, you are welcome to use idiosyncratic styling. Please note that this strategy is not protected by the Web Chat repo's team from the possibility of breaking changes in the future. This means that if you use the `/latest/` release of Web Chat, your styling may suddenly break when we create a new release.

To see what style sets are overwrite-able, please look at the [`createStyleSet` Java Script file](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/createStyleSet.js).

## Getting started

### Goals of this bot

This sample starts with the [full-bundle CDN sample](../../01.getting-started/a.full-bundle/README.md) as the base template.

First, we want to overwrite the current `styleSet` by using the `createStyleSet` method. Once you have your `styleSet` object, you can add changes to any object in `createStyleSet`.

```diff
  …
  const { token } = await res.json();
+ const styleSet = window.WebChat.createStyleSet({
+ bubbleBackground: 'rgba(0, 0, 255, .1)',
+  bubbleFromUserBackground: 'rgba(0, 255, 0, .1)'
+ });

+ styleSet.textContent = Object.assign(
+   {},
+   styleSet.textContent,
+   {
+     fontFamily: '\'Comic Sans MS\', \'Arial\', sans-serif',
+     fontWeight: 'bold'
+   }
+ );
  …
```

Finally, make sure the `styleSet` object is passed into Web Chat, like so:

```diff
  …
  window.WebChat.renderWebChat({
-   directLine: window.WebChat.createDirectLine({ token })
+   directLine: window.WebChat.createDirectLine({ token }),
+   styleSet
  }, document.getElementById('webchat'));
  …
```

That's it!

## Completed code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Custom style set</title>
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
        const styleSet = window.WebChat.createStyleSet({
          bubbleBackground: 'rgba(0, 0, 255, .1)',
          bubbleFromUserBackground: 'rgba(0, 255, 0, .1)'
        });

        styleSet.textContent = Object.assign({}, styleSet.textContent, {
          fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
          fontWeight: 'bold'
        });

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            styleSet
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

-  [Branding styling bot](https://microsoft.github.io/BotFramework-WebChat/02.branding-styling-and-customization/a.branding-web-chat) | [(Branding styling source code)](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/02.branding-styling-and-customization/a.branding-web-chat)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples)

# Sample - Branding Web Chat Styling

## Description

This sample introduces `styleSetOptions` and branding your bot through Web Chat via styling.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.a.branding-webchat-styling)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.a.branding-webchat-styling` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `hello`: you should see the speech bubbles from the bot and user are pale blue and pale green respectively. This is different from the default grey and blue bubbles in Web Chat.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Why `styleSetOptions`?

You may have noticed that Web Chat provides two different ways to change the appearance of your bot:

1. 'Branding' your bot via `styleSetOptions` (recommended)
1. Idiosyncratic styling via overriding `createStyleSet` (not recommended)

`styleSetOptions` is the Web Chat supported method of changing existing DOM elements in the application, and the currently available options are listed on the [`defaultStyleSetOptions.js` file](https://github.com/Microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleSetOptions.js). These options will continue to be updated as we make further as the project grows.

We provide these options to override for several reasons:

-  These are commonly re-styled DOM elements that bot creators want modify in order to provide a specific brand experience
-  Although we support the modification of styling, we want it to be obvious to the user that **we do not guarantee our DOM will always stay the same**, which is why Web Chat uses CSS-in-JS (`glamor`), which generates the class names for Web Chat
-  We encourage our users to use CSS selectors, such as `& > button > div > ul > li:nth-child`, as opposed to accessing the element by it's class name (e.g. `& > .css-1a2b3c4`) because of the high likelihood that the project will have future class and DOM changes. CSS selectors provide high specificity without the need of using `!important`, and provides implicit information of what element is being styled
-  `styleSetOptions` is our way of preserving your modifications (without breaking changes!) but allowing the repo to continue to facilitate natural DOM changes that come with an actively updated project

### My required changes are not all specified in `defaultStyleSetOptions.js`, what do I do now?

-  Please feel free to [file a PR](https://github.com/Microsoft/BotFramework-WebChat/issues/new) requesting the feature you want to be able to brand! We welcome your input and are constantly updating `defaultStyleOptions` with commonly modified aspects of Web Chat.
-  As a last resort, idiosyncratic styling is available, but not supported by our team. You may use this method by following the [05.b.idiosyncratic-manual-styling sample](../05.b.idiosyncratic-manual-styling/README.md). Please note that using this method creates a **high likelihood** of breaking changes when Web Chat releases new code.

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

# Other modifications

Feel free to add your own `styleSetOptions` object to override as many of these styles as you like!

# Further reading

-  [Idiosyncratic manual styling](https://microsoft.github.io/BotFramework-WebChat/05.b.idiosyncratic-manual-styling) | [(Idiosyncratic styling source code)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/05.b.idiosyncratic-manual-styling/)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

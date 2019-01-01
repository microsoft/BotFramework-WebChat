# Sample -  Adding Web Browser Speech

A simple web page with a maximized and full-featured Web Chat embed from a CDN, with browser speech added for text-to-speech ability. This sample makes changes that are based off of the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/06.d.speech-web-browser)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/06.d.speech-web-browser` in command line
- Run `npx serve`
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Use the microphone button: you should be able to provide commands to the bot via speech
- Speak `help`: you should see a full list of MockBot features
- Speak `card weather`: you should see a weather card built using Adaptive Cards
- Speak `carousel`: you should see a carousel of cards

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

### Goals of this bot

The `index.html` page has one main goal:

- To enable web browser speech to provide speech-to-text ability

We'll start by using the [full-bundle CDN sample](./../01.a.getting-started-full-bundle/README.md) as our Web Chat template.

> Web browser speech package is available in the Web Chat core bundle and the full bundle, and you can use either CDN in your bot.

Simply add a web speech ponyfill factory to `renderWebChat`.

```diff
…
window.WebChat.renderWebChat({
  directLine: window.WebChat.createDirectLine({ token }),
+ webSpeechPonyfillFactory: window.WebChat.createBrowserWebSpeechPonyfillFactory({ fetchToken })
}, document.getElementById('webchat'));
…
```

> If you prefer, you can use your own W3C Web Speech API compliant speech engine. Visit the [W3C Speech API](https://w3c.github.io/speech-api/) documentation for more information, and check out the file [createBrowserWebSpeechPonyfillFactory.js](./../packages\bundle\src\createBrowserWebSpeechPonyfillFactory.js) to reference implementation.

## Completed code

Here is the finished `index.html`:

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Browser-supported speech</title>
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
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        window.WebChat.renderWebChat({
-         directLine: window.WebChat.createDirectLine({ token })
          directLine: window.WebChat.createDirectLine({ token }),
+         webSpeechPonyfillFactory: window.WebChat.createBrowserWebSpeechPonyfillFactory()
        }, document.getElementById('webchat'));

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further Reading

## Full list of Web Chat hosted samples

View the list of available samples by clicking [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

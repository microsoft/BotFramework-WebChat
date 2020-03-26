# Sample - Integrating with Direct Line Speech channel

## Description

A simple page with Web Chat integrated with speech-to-text and text-to-speech feature from Direct Line Speech channel.

Direct Line Speech is a channel for communicating with a bot via a low-latency speech-focused protocol. The channel is designed for real-time speech purpose.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/03.speech/a.direct-line-speech)

# How to run

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/03.speech/a.direct-line-speech` in command line
-  Run `npx serve`
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Click on microphone button
-  Say "123"
-  It should recognize as "123."
-  It should speak out the next activities sent from the bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Goals of this bot

This sample starts with the [full-bundle CDN sample](./../01.getting-started/a.full-bundle/README.md) as the base template.

In this sample, we will switch the Web Chat protocol. Direct Line Speech is a channel for communicating with a bot via a low-latency speech-focused protocol. The channel is designed for real-time speech. Thus, _not all features in Web Chat are supported in this channel._

(TBD, list of limitations)

The Direct Line Speech JavaScript SDK provides several adapters for Web Chat and all of these adapters work together as a whole. After we created the adapter set, we will pass it to Web Chat for initialization.

### Setting up Direct Line Channel

First, go to Azure Portal and [create a new Cognitive Services for Speech Services resource](https://ms.portal.azure.com/#blade/Microsoft_Azure_Marketplace/MarketplaceOffersBlade/selectedMenuItemId/CognitiveServices_MP/dontDiscardJourney/true/launchingContext/%7B%22source%22%3A%22Resources%20Microsoft.CognitiveServices%2Faccounts%22%7D). Please securely record the subscription key. We will use it to configure Web Chat later.

After the Azure resource is created, configure your bot with a new Direct Line Speech channel and associate the channel with your newly created Azure resource. You can follow [this article for connecting your bot to Direct Line Speech channel](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-directlinespeech?view=azure-bot-service-4.0).

You will also need to update your bot to use 4.6 SDK. You can follow [this article for upgrading your bot to use Direct Line Speech](https://docs.microsoft.com/en-us/azure/bot-service/directline-speech-bot?view=azure-bot-service-4.0).

### Using subscription key

We will start by using subscription key to connect to the Direct Line Speech channel. _Please note that a subscription key is not recommended to use in production environment._ In this sample, we will use it to verify if our configuration is correct. In the latter section, we will upgrade the sample to use an authorization token.

We are replacing the existing code by creating an adapter set using the new `createDirectLineSpeechAdapters` function. We will pass the adapter set to Web Chat using the [spread operator](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Spread_syntax).

```diff
- const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
- const { token } = await res.json();
+ const adapters = await window.WebChat.createDirectLineSpeechAdapters({
+   fetchCredentials: {
+     region: 'westus2',
+     subscriptionKey: 'YOUR_COGNITIVE_SERVICE_KEY'
+   }
+ });

  window.WebChat.renderWebChat(
    {
-     directLine: window.WebChat.createDirectLine({ token })
+     ...adapters
    },
    document.getElementById('webchat')
  );
```

> For a list of supported options, you can refer to Web Chat's [Direct Line Speech SDK](https://github.com/microsoft/BotFramework-WebChat/tree/master/packages/directlinespeech/) documentation.

Now, you should be able to communicate with your bot using the Direct Line Speech channel. If you encounter any problems while connecting to the service, you should use the in-browser developer tool and investigate.

### Using authorization token

Once you have verified that Web Chat is communicating with your bot using the Direct Line Speech channel, the next step is to upgrade the code to use the authorization token instead.

The authorization token is generated using subscription key. To secure the token, the exchange must be done on server-side and the subscription key should never be passed to the browser.

First, create an async function `fetchCredentials`. When called, it will fetch the authorization token from the server. In this sample, the token is fetched from the demo bot, Mock Bot. The function will return `authorizationToken` and `region` in a JavaScript object.

<!-- prettier-ignore-start -->
```js
const fetchCredentials = async () => {
  const res = await fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error('Failed to fetch authorization token and region.');
  }

  const { region, token: authorizationToken } = await res.json();

  return { authorizationToken, region };
};
```
<!-- prettier-ignore-end -->

Then, pass the function as an option to the Direct Line Speech SDK. The name of the option is `fetchCredentials`.

```diff
  const adapters = await window.WebChat.createDirectLineSpeechAdapters({
-   fetchCredentials: {
-     region: 'westus2',
-     subscriptionKey: 'YOUR_COGNITIVE_SERVICE_KEY'
-   }
+   fetchCredentials
  });

  window.WebChat.renderWebChat(
    {
      ...adapters
    },
    document.getElementById('webchat')
  );
```

Open the web page and investigate the network traffic. Confirm that Web Chat is connecting to Cognitive Services using the authorization token fetched from the server.

## Completed code

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Using Direct Line Speech</title>
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
        const fetchCredentials = async () => {
          const res = await fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', {
            method: 'POST'
          });

          if (!res.ok) {
            throw new Error('Failed to fetch authorization token and region.');
          }

          const { region, token: authorizationToken } = await res.json();

          return { authorizationToken, region };
        };

        const adapters = await window.WebChat.createDirectLineSpeechAdapters({
          fetchCredentials
        });

        window.WebChat.renderWebChat(
          {
            ...adapters
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

-  [Cognitive Speech Speech Services website](https://azure.microsoft.com/en-us/services/cognitive-services/speech-services/)

## Full list of Web Chat Hosted Samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

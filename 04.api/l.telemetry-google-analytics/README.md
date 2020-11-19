# Sample - Collect telemetry measurements using Google Analytics

This sample shows how to set up a Web Chat client that will collect telemetry measurements into your own instance of Google Analytics.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/l.telemetry-google-analytics)

# Things to try out

-  Open development console in your browser
-  Type "help" in the send box
-  In the console log, you will see telemetry measurements sent to Google Analytics

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

> This sample assumes you have already set up Google Analytics and have the measurement ID ready.

This sample is based on the [01.getting-started/a.full-bundle](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle) sample.

## Load Google Analytics SDK (gtag.js)

Insert the following snippets to load Google Analytics SDK (gtag.js) on to the page. Replace `GA_MEASUREMENT_ID` with your own measurement ID.

```diff
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  <script>
    (async function() {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

+     window.dataLayer = window.dataLayer || [];
+
+     function gtag() {
+       dataLayer.push(arguments);
+     }
+
+     gtag('js', new Date());
+
+     gtag('config', 'GA_MEASUREMENT_ID');

      window.WebChat.renderWebChat(
        {
          directLine: window.WebChat.createDirectLine({ token })
        },
        document.getElementById('webchat')
      );

      document.querySelector('#webchat > *').focus();
    })().catch(err => console.error(err));
  </script>
```

## Handle `onTelemetry` event

Add an event handler to receive telemetry measurements from Web Chat and log them to console.

```diff
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  <script>
    (async function() {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      gtag('js', new Date());

      gtag('config', 'GA_MEASUREMENT_ID');

+     const handleTelemetry = event => {
+       const { data, dimensions, duration, error, fatal, name, type } = event;
+
+       console.group(`onTelemetry ("${type}")`);
+       console.log({ name, data, dimensions, duration, error });
+       console.groupEnd();
+     };

      window.WebChat.renderWebChat(
        {
-         directLine: window.WebChat.createDirectLine({ token })
+         directLine: window.WebChat.createDirectLine({ token }),
+         onTelemetry: handleTelemetry
        },
        document.getElementById('webchat')
      );

      document.querySelector('#webchat > *').focus();
    })().catch(err => console.error(err));
  </script>
```

## Convert telemetry measurements into Google Analytics measurements

Telemetry measurements from Web Chat is slightly different from Google Analytics. Conversion is needed to send measurements to Google Analytics.

Events with multiple properties will be expanded into multiple events.

```diff
  <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"></script>
  <script>
    (async function() {
      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
      const { token } = await res.json();

      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      gtag('js', new Date());

      gtag('config', 'GA_MEASUREMENT_ID');

      const handleTelemetry = event => {
        const { data, dimensions, duration, error, fatal, name, type } = event;

        console.group(`onTelemetry ("${type}")`);
        console.log({ name, data, dimensions, duration, error });
        console.groupEnd();

+       if (type === 'event') {
+         const googleAnalyticsData =
+           typeof data === 'number' || typeof data === 'string' || typeof data === 'undefined' ? { '': data } : data;
+
+         for (const [key, value] of Object.entries(googleAnalyticsData)) {
+           const eventName = key ? `${name}:${key}` : name;
+
+           if (typeof value === 'number') {
+             gtag('event', eventName, {
+               ...dimensions,
+               value
+             });
+           } else {
+             gtag('event', eventName, {
+               ...dimensions,
+               event_label: value
+             });
+           }
+         }
+       } else if (type === 'exception') {
+         gtag('event', 'exception', {
+           ...dimensions,
+           description: error,
+           fatal
+         });
+       } else if (type === 'timingend') {
+         gtag('event', 'timing_complete', {
+           ...dimensions,
+           name,
+           value: duration
+         });
+       }
      };

      window.WebChat.renderWebChat(
        {
          directLine: window.WebChat.createDirectLine({ token }),
          onTelemetry: handleTelemetry
        },
        document.getElementById('webchat')
      );

      document.querySelector('#webchat > *').focus();
    })().catch(err => console.error(err));
  </script>
```

## Add user ID and version data

Record conversation ID, user ID, and Web Chat UI version into the metadata of measurements.

```diff
  <script>
    (async function() {
      // In this demo, we are using Direct Line token from MockBot.
      // Your client code must provide either a secret or a token to talk to your bot.
      // Tokens are more secure. To learn about the differences between secrets and tokens
      // and to understand the risks associated with using secrets, visit https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0

      const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
-     const { token } = await res.json();
+     const { conversationID, token, userID } = await res.json();
+     const { content: webChatUIVersion } =
+       document.querySelector('head meta[name="botframework-webchat:ui:version"]') || {};

      window.dataLayer = window.dataLayer || [];

      function gtag() {
        dataLayer.push(arguments);
      }

      gtag('js', new Date());

-     gtag('config', 'GA_MEASUREMENT_ID');
+     gtag('config', 'GA_MEASUREMENT_ID', {
+       custom_map: {
+         dimension1: 'version',
+         dimension2: 'prop:locale'
+       },
+
+       event_category: 'Web Chat UI',
+       user_id: userID,
+       version: webChatUIVersion
+     });

      const handleTelemetry = event => {
        const { data, dimensions, duration, error, name, type } = event;
```

# Completed Code

Here is the finished `index.html`:

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Collect telemetry using Google Analytics</title>
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
    <script async src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_IDD"></script>
    <script>
      (async function() {
        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { conversationID, token, userID } = await res.json();
        const { content: webChatUIVersion } =
          document.querySelector('head meta[name="botframework-webchat:ui:version"]') || {};

        window.dataLayer = window.dataLayer || [];

        function gtag() {
          dataLayer.push(arguments);
        }

        gtag('js', new Date());

        gtag('config', 'GA_MEASUREMENT_IDD', {
          custom_map: {
            dimension1: 'version',
            dimension2: 'prop:locale'
          },

          event_category: 'Web Chat UI',
          user_id: userID,
          version: webChatUIVersion
        });

        const handleTelemetry = event => {
          const { data, dimensions, duration, error, fatal, name, type } = event;

          console.group(`onTelemetry ("${type}")`);
          console.log({ name, data, dimensions, duration, error });
          console.groupEnd();

          if (type === 'event') {
            const googleAnalyticsData =
              typeof data === 'number' || typeof data === 'string' || typeof data === 'undefined' ? { '': data } : data;

            for (const [key, value] of Object.entries(googleAnalyticsData)) {
              const eventName = key ? `${name}:${key}` : name;

              if (typeof value === 'number') {
                gtag('event', eventName, {
                  ...dimensions,
                  value
                });
              } else {
                gtag('event', eventName, {
                  ...dimensions,
                  event_label: value
                });
              }
            }
          } else if (type === 'exception') {
            gtag('event', 'exception', {
              ...dimensions,
              description: error,
              fatal
            });
          } else if (type === 'timingend') {
            gtag('event', 'timing_complete', {
              ...dimensions,
              name,
              value: duration
            });
          }
        };

        window.WebChat.renderWebChat(
          {
            directLine: window.WebChat.createDirectLine({ token }),
            onTelemetry: handleTelemetry
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

[`04.api/k.telemetry-application-insights`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/k.telemetry-application-insights) is a sample that will collect telemetry measurements into your own instance of Azure Application Insights.

[Google Analytics gtag.js Documentation](https://developers.google.com/analytics/devguides/collection/gtagjs)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

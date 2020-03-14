# Sample - Collect telemetry measurements using Azure Application Insights

This sample shows how to set up a Web Chat client that will collect telemetry measurements into your own instance of Azure Application Insights.

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/04.api/k.telemetry-application-insights)

# Things to try out

-  Open development console in your browser
-  Type "help" in the send box
-  In the console log, you will see telemetry measurements sent to Azure Application Insights

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

# Overview

> This sample assumes you have already set up Azure Application Insights and have the instrumentation key ready.

This sample is based on the [01.getting-started/a.full-bundle](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/01.getting-started/a.full-bundle) sample.

## Load Application Insights SDK

Insert the following snippets to load Application Insights SDK on to the page. Replace `INSTRUMENTATION_KEY` with your own instrumentation key.

```diff
  <body>
    <div id="webchat" role="main"></div>
+   <script>
+     var sdkInstance="appInsightsSDK";window[sdkInstance]="appInsights";var aiName=window[sdkInstance],aisdk=window[aiName]||function(e){function n(e){t[e]=function(){var n=arguments;t.queue.push(function(){t[e].apply(t,n)})}}var t={config:e};t.initialize=!0;var i=document,a=window;setTimeout(function(){var n=i.createElement("script");n.src=e.url||"https://az416426.vo.msecnd.net/scripts/b/ai.2.min.js",i.getElementsByTagName("script")[0].parentNode.appendChild(n)});try{t.cookie=i.cookie}catch(e){}t.queue=[],t.version=2;for(var r=["Event","PageView","Exception","Trace","DependencyData","Metric","PageViewPerformance"];r.length;)n("track"+r.pop());n("startTrackPage"),n("stopTrackPage");var s="Track"+r[0];if(n("start"+s),n("stop"+s),n("setAuthenticatedUserContext"),n("clearAuthenticatedUserContext"),n("flush"),!(!0===e.disableExceptionTracking||e.extensionConfig&&e.extensionConfig.ApplicationInsightsAnalytics&&!0===e.extensionConfig.ApplicationInsightsAnalytics.disableExceptionTracking)){n("_"+(r="onerror"));var o=a[r];a[r]=function(e,n,i,a,s){var c=o&&o(e,n,i,a,s);return!0!==c&&t["_"+r]({message:e,url:n,lineNumber:i,columnNumber:a,error:s}),c},e.autoExceptionInstrumented=!0}return t}(
+     {
+         instrumentationKey:"INSTRUMENTATION_KEY"
+     }
+     );window[aiName]=aisdk,aisdk.queue&&0===aisdk.queue.length&&aisdk.trackPageView({});
+   </script>
    <script>
      (async function() {
```

## Handle `onTelemetry` event

Add an event handler to receive telemetry measurements from Web Chat and log them to console.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

+ const handleTelemetry = event => {
+   const { data, dimensions, duration, error, name, type } = event;
+
+   console.group(`onTelemetry ("${type}")`);
+   console.log({ name, data, dimensions, duration, error });
+   console.groupEnd();
+ };

  window.WebChat.renderWebChat(
    {
-     directLine: window.WebChat.createDirectLine({ token })
+     directLine: window.WebChat.createDirectLine({ token }),
+     onTelemetry: handleTelemetry
    },
    document.getElementById('webchat')
  );
```

## Convert telemetry measurements into Application Insights measurements

Telemetry measurements from Web Chat is slightly different from Application Insights. Conversion is needed to send measurements to Application Insights.

For classifications, all measurements will be prefixed with `webchat:`.

```diff
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
  const { token } = await res.json();

  const handleTelemetry = event => {
    const { data, dimensions, duration, error, level, name, type } = event;
+   const fullName = `webchatui:${name}`;

    console.group(`onTelemetry ("${type}")`);
    console.log({ name, data, dimensions, duration, error });
    console.groupEnd();
+
+   if (type === 'event') {
+     const appInsightsData =
+       typeof data === 'number' || typeof data === 'string'
+         ? { [name]: data }
+         : Object.entries(data || {}).reduce(
+             (data, [key, value]) => ({ ...data, [`${name}:${key}`]: value }),
+             {}
+           );
+
+     appInsights.trackEvent({
+       name: fullName,
+       properties: {
+         ...dimensions,
+         ...appInsightsData,
+         'webchat:level': level
+       }
+     });
+   } else if (type === 'exception') {
+     appInsights.trackException({ exception: error });
+   } else if (type === 'timingstart') {
+     appInsights.startTrackEvent(fullName);
+   } else if (type === 'timingend') {
+     appInsights.stopTrackEvent(fullName, { ...dimensions });
+   }
  };

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
      onTelemetry: handleTelemetry
    },
    document.getElementById('webchat')
  );
```

## Add user ID and version data

Record conversation ID, user ID, and Web Chat UI version into the metadata of measurements.

```diff
  (async function() {
    const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
-   const { token } = await res.json();
+   const { conversationID, token, userID } = await res.json();

+   const telemetryInitializer = () => {
+     const { content: webChatUIVersion } =
+       document.querySelector('head meta[name="botframework-webchat:ui:version"]') || {};
+
+     appInsights.properties.context.application.ver = webChatUIVersion;
+     appInsights.properties.context.session.acquisitionDate = Date.now();
+     appInsights.properties.context.session.id = conversationID;
+     appInsights.properties.context.user.accountId = userID;
+   };
+
+   aisdk.queue ? aisdk.queue.push(telemetryInitializer) : telemetryInitializer();

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
    <title>Web Chat: Collect telemetry using Application Insights</title>
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
      var sdkInstance="appInsightsSDK";window[sdkInstance]="appInsights";var aiName=window[sdkInstance],aisdk=window[aiName]||function(e){function n(e){t[e]=function(){var n=arguments;t.queue.push(function(){t[e].apply(t,n)})}}var t={config:e};t.initialize=!0;var i=document,a=window;setTimeout(function(){var n=i.createElement("script");n.src=e.url||"https://az416426.vo.msecnd.net/scripts/b/ai.2.min.js",i.getElementsByTagName("script")[0].parentNode.appendChild(n)});try{t.cookie=i.cookie}catch(e){}t.queue=[],t.version=2;for(var r=["Event","PageView","Exception","Trace","DependencyData","Metric","PageViewPerformance"];r.length;)n("track"+r.pop());n("startTrackPage"),n("stopTrackPage");var s="Track"+r[0];if(n("start"+s),n("stop"+s),n("setAuthenticatedUserContext"),n("clearAuthenticatedUserContext"),n("flush"),!(!0===e.disableExceptionTracking||e.extensionConfig&&e.extensionConfig.ApplicationInsightsAnalytics&&!0===e.extensionConfig.ApplicationInsightsAnalytics.disableExceptionTracking)){n("_"+(r="onerror"));var o=a[r];a[r]=function(e,n,i,a,s){var c=o&&o(e,n,i,a,s);return!0!==c&&t["_"+r]({message:e,url:n,lineNumber:i,columnNumber:a,error:s}),c},e.autoExceptionInstrumented=!0}return t}(
      {
        instrumentationKey:"INSTRUMENTATION_KEY"
      }
      );window[aiName]=aisdk,aisdk.queue&&0===aisdk.queue.length&&aisdk.trackPageView({});
    </script>
    <script>
      (async function() {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { conversationID, token, userID } = await res.json();

        const telemetryInitializer = () => {
          const { content: webChatUIVersion } =
            document.querySelector('head meta[name="botframework-webchat:ui:version"]') || {};

          appInsights.properties.context.application.ver = webChatUIVersion;
          appInsights.properties.context.session.acquisitionDate = Date.now();
          appInsights.properties.context.session.id = conversationID;
          appInsights.properties.context.user.accountId = userID;
        };

        aisdk.queue ? aisdk.queue.push(telemetryInitializer) : telemetryInitializer();

        const handleTelemetry = event => {
          const { data, dimensions, duration, error, fatal, level, name, type } = event;
          const fullName = `webchatui:${name}`;

          console.group(`onTelemetry ("${type}")`);
          console.log({ name, data, dimensions, duration, error });
          console.groupEnd();

          if (type === 'event') {
            const appInsightsData =
              typeof data === 'number' || typeof data === 'string'
                ? { [name]: data }
                : Object.entries(data || {}).reduce(
                    (data, [key, value]) => ({ ...data, [`${name}:${key}`]: value }),
                    {}
                  );

            appInsights.trackEvent({
              name: fullName,
              properties: {
                ...dimensions,
                ...appInsightsData,
                'webchat:level': level
              }
            });
          } else if (type === 'exception') {
            appInsights.trackException({ exception: error });
          } else if (type === 'timingstart') {
            appInsights.startTrackEvent(fullName);
          } else if (type === 'timingend') {
            appInsights.stopTrackEvent(fullName, { ...dimensions });
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

[`04.api/l.telemetry-google-analytics`](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/04.api/l.telemetry-google-analytics) is a sample that will collect telemetry measurements into your own instance of Google Analytics.

[Application Insights JavaScript SDK API References](https://github.com/Microsoft/ApplicationInsights-JS/blob/master/API-reference.md)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

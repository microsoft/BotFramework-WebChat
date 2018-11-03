<p align="center">
  <a href="https://azure.microsoft.com/en-us/services/bot-service/">
    <img src="https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/master/doc/abs-logo.png" alt="Azure Bot Services logo" width="240" />
  </a>
</p>

<p align="center">A highly-customizable web-based client for Azure Bot Services.</p>

<p align="center">
  <a href="https://badge.fury.io/js/botframework-webchat"><img alt="npm version" src="https://badge.fury.io/js/botframework-webchat.svg" /></a>
  <a href="https://travis-ci.org/Microsoft/BotFramework-WebChat"><img alt="Build Status" src="https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=master" /></a>
</p>

# How to use

> For previous versions of Web Chat (v3), you can find it [here](https://github.com/Microsoft/BotFramework-WebChat/tree/v3).

First, create a bot using [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).
Once the bot is created, you will need to [obtain the bot's Web Chat secret](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-3.0#step-1) in Azure Portal to use in the code below.

Here is how how you can add Web Chat control to you website:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ secret: 'YOUR_BOT_SECRET_FROM_AZURE_PORTAL' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

![Screenshot of Web Chat](https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/master/doc/webchat-screenshot.png)

## Integrate with JavaScript

Web Chat is designed to integrate with your existing web site using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability.

### Full bundle

You can use the full, typical webchat package that contains the most typically used features.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_BOT_SECREET' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

See a working sample with full Web Chat bundle [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/full-bundle/).

### Minimal bundle

Instead of using the full, typical package of Web Chat, you can choose a lighter-weight sample with fewer features. This bundle does not contain:
- Adaptive Cards
- Cognitive Services
- Markdown-It

Since Adaptive Cards is not include in this bundle, rich cards that depends on Adaptive Cards will not render, e.g. hero card, receipt card, etc. List of attachments that are not supported without Adaptive Cards can be found [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/packages/component/src/Middleware/Attachment/createAdaptiveCardMiddleware.js).

See a working sample with minimal Web Chat bundle [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/minimal-bundle/).

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat-minimal.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_BOT_SECRET' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

## Integrate with React

For full customizability, you can use React to recompose components of Web Chat.

To install the production build from NPM, run `npm install botframework-webchat`.

```jsx
import DirectLine from 'botframework-directlinejs';
import React from 'react';
import ReactWebChat from 'botframework-webchat';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.directLine = new DirectLine({ token: 'YOUR_BOT_SECRET' });
  }

  render() {
    return (
      <ReactWebChat directLine={ this.directLine } />
      element
    );
  }
}
```

> You can also run `npm install botframework-webchat@master` to install a development build that sync with GitHub `master` branch.

See a working sample with Web Chat rendered by React [here](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/integrate-with-react/).

# Customize Web Chat UI

Web Chat is designed to be customizable without forking the source code. The table below outlines what kind of customizations you can achieve when you are importing Web Chat in different ways. This list is not exhaustive.

| | CDN bundle | React |
| - | - | - |
| Change colors | Yes | Yes |
| Change sizes | Yes | Yes |
| Update/replace CSS styles | Yes | Yes |
| Listen to events | Yes | Yes |
| Interact with hosting webpage | Yes | Yes |
| Custom render activities | | Yes |
| Custom render attachments | | Yes |
| Add new UI components | | Yes |
| Recompose the whole UI | | Yes |

See more about [customizing Web Chat](https://github.com/Microsoft/BotFramework-WebChat/blob/master/SAMPLES.md) to learn more on customization.

# Building the project

> If you need to build this project for customization purpose, we strongly advise you to refer to our [samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples). If you cannot find any samples that could fulfill your customization needs and you don't know how to do that, please [send your dream to us](https://github.com/Microsoft/BotFramework-WebChat/issues/).
>
> Forking Web Chat for customizations means you will lose access to our latest updates. And maintaining forks also introduce chores that is substantially more complicated than version bump.

To build Web Chat, you will need to make sure both your Node.js and NPM is latest version (either LTS or current).

```sh
npm install
npm run bootstrap
npm run build
```

> Instead of `npm run build`, you can use `npm run watch` for watch mode.

## Testing Web Chat for development purpose

We built a playground app for testing Web Chat so we can test certain Web Chat specific features.

```sh
cd packages/playground
npm start
```

Then browse to http://localhost:3000/, and click on one of the connection options on upper right corner.

- Official MockBot: we hosted a live demo bot for testing Web Chat features
- Emulator Core: it will connect to http://localhost:5000/v3/directline for [emulated Direct Line services](https://github.com/Microsoft/BotFramework-Emulator/tree/master/packages/emulator/cli/)

You are also advised to test the CDN bundles by copying the test harness from our samples.

## Building CDN bundle in development mode

Currently, the standard build script does not build CDN bundle (`webchat*.js`).

```sh
cd packages/bundle
npm run webpack-dev
```

> By default, this script will run in watch mode.

## Building CDN bundle in production mode

If you want to build a production CDN bundle with minification, you can follow these steps.

```sh
cd packages/bundle
npm run prepublishOnly
```

# Contributions

Like us? [Star](https://github.com/Microsoft/BotFramework-WebChat/stargazers) us.

Want to make it better? [File](https://github.com/Microsoft/BotFramework-WebChat/issues) us an issue.

Don't like something you see? [Submit](https://github.com/Microsoft/BotFramework-WebChat/pulls) a pull request.

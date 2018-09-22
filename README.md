<p align="center">
  <a href="https://azure.microsoft.com/en-us/services/bot-service/">
    <img src="https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/preview/doc/abs-logo.png" alt="Azure Bot Services logo" width="240" />
  </a>
</p>

<p align="center">A highly-customizable web-based client for Azure Bot Services.</p>

<p align="center">
  <a href="https://badge.fury.io/js/botframework-webchat"><img alt="npm version" src="https://badge.fury.io/js/botframework-webchat.svg" /></a>
  <a href="https://travis-ci.org/Microsoft/BotFramework-WebChat"><img alt="Build Status" src="https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=preview" /></a>
</p>

# About

**Preview Software Alert!** Please note that this version of Web Chat is still in preview. If you want a stable release, go [here](https://github.com/Microsoft/BotFramework-WebChat/blob/master/README.md).

# How to use

First, create a bot using [Azure Bot Service](https://azure.microsoft.com/en-us/services/bot-service/).
Once the bot is created, you will need to [obtain the bot's Web Chat secret](https://docs.microsoft.com/en-us/azure/bot-service/bot-service-channel-connect-webchat?view=azure-bot-service-3.0#step-1) in Azure Portal to use in the code below.

Here is how how you can add Web Chat control to you website:

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/preview/botchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ secret: 'YOUR_BOT_SECRET_FROM_AZURE_PORTAL' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

![Screenshot of Web Chat](https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/preview/doc/webchat-screenshot.png)

## Integrate with JavaScript

Web Chat is designed to integrate with your existing web site using JavaScript or React. Integrating with JavaScript will give you moderate styling and customizability.

### Full bundle

You can use the full, typical webchat package that contains the most typically used features.

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/preview/botchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: 'YOUR_BOT_SECREET' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

See a working sample with full Web Chat bundle [here](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/full-bundle/).

### Minimal bundle

Instead of using the full, typical package of Web Chat, you can choose a lighter-weight sample with fewer features. This bundle does not contain:
- Adaptive Cards
- Cognitive Services
- Markdown-It

Since Adaptive Cards is not include in this bundle, rich cards that depends on Adaptive Cards will not render, e.g. hero card, receipt card, etc. List of attachments that are not supported without Adaptive Cards can be found [here](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/packages/component/src/Middleware/Attachment/createAdaptiveCardMiddleware.js).

See a working sample with minimal Web Chat bundle [here](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/minimal-bundle/).

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/preview/botchat-core.js"></script>
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

To install the preview build from NPM, run `npm install botframework-webchat@preview`.

```jsx
import { createProvider } from 'react-redux';
import React from 'react';

import DirectLine from 'botframework-directlinejs';
import WebChat, { createStore } from 'botframework-webchat';

const Provider = createProvider('webchat');

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.directLine = new DirectLine({ token: 'YOUR_BOT_SECRET' });
    this.store = createStore();
  }

  render() {
    return (
      <Provider store={ this.store }>
        <WebChat
          directLine={ this.directLine }
          storeKey="webchat"
        />
      </Provider>,
      element
    );
  }
}
```

See a working sample with Web Chat rendered by React [here](https://github.com/Microsoft/BotFramework-WebChat/tree/preview/samples/integrate-with-react/).

# Customize Web Chat UI

The new version of Web Chat control provides rich customization options: you can change colors, sizes, placement of elements, add custom elements, and interact with the hosting webpage. See more about [customizing Web Chat](SAMPLES.md).

# Contributions

Like us? [Star](https://github.com/Microsoft/BotFramework-WebChat/stargazers) us.

Want to make it better? [File](https://github.com/Microsoft/BotFramework-WebChat/issues) us an issue.

Don't like something you see? [Submit](https://github.com/Microsoft/BotFramework-WebChat/pulls) a pull request.

<p align="center">
  <a href="https://azure.microsoft.com/en-us/services/bot-service/">
    <img src="https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/v4/doc/abs-logo.png" alt="Azure Bot Services logo" width="240" />
  </a>
</p>

<p align="center">A highly-customizable web-based client for Azure Bot Services.</p>

<p align="center">
  <a href="https://badge.fury.io/js/botframework-webchat"><img alt="npm version" src="https://badge.fury.io/js/botframework-webchat.svg" /></a>
  <a href="https://travis-ci.org/Microsoft/BotFramework-WebChat"><img alt="Build Status" src="https://travis-ci.org/Microsoft/BotFramework-WebChat.svg?branch=v4" /></a>
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
    <script src="https://cdn.botframework.com/botframework-webchat/v4/botchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ secret: 'YOUR_BOT_SECRET_FROM_AZURE_PORTAL' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

![Screenshot of Web Chat](https://raw.githubusercontent.com/Microsoft/BotFramework-WebChat/v4/doc/webchat-screenshot.png)

## Integrate with JavaScript

### Full bundle

Sample at [`samples/full-bundle`](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/samples/full-bundle/).

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="https://cdn.botframework.com/botframework-webchat/v4/BotChat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: '...' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

### Minimal bundle

Sample at [`samples/minimal-bundle`](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/samples/minimal-bundle/).

This bundle does not contains:
- Adaptive Cards
- Cognitive Services
- Markdown-It

Since Adaptive Cards is not include in this bundle, rich cards that depends on Adaptive Cards will not render, e.g. hero card, receipt card, etc. List of attachments that are not supported without Adaptive Cards can be found [here](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/packages/component/src/Middleware/Attachment/createAdaptiveCardMiddleware.js).

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="BotChat-core.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({ token: '...' })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

## Integrate with React

Sample at [`samples/integrate-with-react`](https://github.com/Microsoft/BotFramework-WebChat/tree/v4/samples/integrate-with-react/).

```jsx
import { createProvider } from 'react-redux';
import React from 'react';

import DirectLine from 'botframework-directlinejs';
import WebChat, { createStore } from 'botframework-webchat';

const Provider = createProvider('webchat');

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.directLine = new DirectLine({ token: '...' });
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

# Customizations

The new version of Web Chat control adds many customization options:
[Samples page](SAMPLES.md)

# Contributions

Like us? [Star](https://github.com/Microsoft/BotFramework-WebChat/stargazers) us.

Want to make it better? [File](https://github.com/Microsoft/BotFramework-WebChat/issues) us an issue.

Don't like something you see? [Submit](https://github.com/Microsoft/BotFramework-WebChat/pulls) a pull request.

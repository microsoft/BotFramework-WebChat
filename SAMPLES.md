# Backchannel integration

There are three ways you can receive commands from Direct Line and handled by your page.

## Integrate with JavaScript

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="web-chat"></div>
    <script src="//cdn.botframework.com/.../botchat.js"></script>
    <script>
    function handleActivity({ activity: { name, type, value } }) {
      // Handle activity
    }

    window.BotChat.App({
      directLine: { secret: '...' },
      onActivity: handleActivity
    }, document.getElementById('web-chat'));
    </script>
  </body>
</html>
```

## Integrate with React

```jsx
import React from 'react';
import WebChat from 'botframework-webchat';
import DirectLine from 'botframework-directlinejs';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.handleActivity = this.handleActivity.bind(this);

    this.state = {
      botConnection: new DirectLine({ secret: '...' })
    };
  }

  handleActivity({ activity: { name, type, value } }) {
    // Handle activity
  }

  render() {
    return (
      <WebChat
        directLine={ this.state.botConnection }
        onActivity={ this.handleActivity }
      />
    );
  }
}
```

## Direct-inject activities into Redux

In your Redux store, you will create a Direct Line connection object and add a middleware.

The `botframework-redux-directline` is shipped as a separate package to reduce footprint. As a bonus, you can also use the Redux middleware to connect to Direct Line without Web Chat.

```jsx
import createReduxDirectLine from 'botframework-redux-directline';
import DirectLine from 'botframework-directlinejs';
import { applyMiddleware, createStore } from 'redux';

const botConnection = new DirectLine({ secret: '...' });

export default createStore(
  {
    // You may want to keep the Direct Line connection object to be reused in `<WebChat>` component later
    botConnection
  },
  applyMiddleware(
    createReduxDirectLine(botConnection)
  )
);
```

In your app hosting the Web Chat component, you can retrieve the Direct Line connection object thru Redux store.

```jsx
import { connect } from 'react-redux';
import React from 'react';
import WebChat from 'botframework-webchat';

export default connect(state => state)(({ botConnection }) =>
  <WebChat directLine={ botConnection } />
)
```

# Style set

Style set is a set of CSS rules that will be applied to each individual components. These rules contains customizations like margin and padding. It cannot be used to override CSS rules that will break layout, such as flexbox.

## Tweaking variables for style set

```jsx
import { createStyleSet } from 'botframework-webchat';

// Instead of customizing CSS, users can provide options to generate a set of styles
const myStyleSet = createStyleSet({
  accent: '#F33'
});

export default () =>
  <WebChat
    directLine={{ secret: '...' }}
    styleSet={ myStyleSet }
  />
```

## Modifying part of the style set

```jsx
import { createStyleSet } from 'botframework-webchat';

// StyleSet is serializable and users can import/export using JSON
const myStyleSet = createStyleSet({
  accent: '#F33'
});

myStyleSet.bubble = {
  ...myStyleSet.bubble,

  '& > .content': {
    minHeight: 40,
    padding: 5
  }
};

export default () =>
  <WebChat
    directLine={{ secret: '...' }}
    styleSet={ myStyleSet }
  />
```

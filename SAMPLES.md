# Backchannel integration

There are three ways you can receive commands from Direct Line and handled by your page.

## Integrate with JavaScript

```html
<!DOCTYPE html>
<html>
  <body>
    <div id="webchat"></div>
    <script src="//cdn.botframework.com/.../botchat.js"></script>
    <script>
      window.WebChat.renderWebChat({
        directLine: window.WebChat.createDirectLine({
          token: '...'
        })
      }, document.getElementById('webchat'));
    </script>
  </body>
</html>
```

## Integrate with React

```jsx
import { Provider } from 'react-redux';
import React from 'react';
import ReactDOM from 'react-dom';

import DirectLine from 'botframework-directlinejs';
import WebChat, { createStore } from 'botframework-webchat';

export default class extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      directLine: new DirectLine({ token: '...' }),
      store: createStore()
    };
  }

  render() {
    const { state } = this;

    ReactDOM.render(
      <Provider store={ state.store }>
        <WebChat
          directLine={ state.directLine }
        />
      </Provider>,
      element
    );
  }
}
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

We updated the look and feel of webchat control

TODO: Add a screenshot

Fully customize webchat and use 100% your own look of the webchat control

If you want to achieve the functionality below, you need to upgrade to the new Webchat control.

Example snippets:

# Customizing styles

## Change font or color

```js
TODO: Add code snippet
```

## Add a logo to the top bar

```js
TODO: Add code snippet
```

## Change the avatar of the bot within the dialog box

```js
TODO: Add code snippet
```

# Adding UI

## Add a settings gear icon to the send box

```js
TODO: Add code snippet
```

## Add a persistent menu to the send box

```js
TODO: Add code snippet
```

# Custom render activity or attachment

## Google maps

```js
TODO: Add code snippet
```

## Spotify player control?

```js
TODO: Add code snippet
```

# Building command-line interface for Web Chat

## Full customization: Bring webchat to Command Line (pure Angular example TODO: Add code snippet).

```js
TODO: Add code snippet
```

## Search box on the site becomes a bot send box

As a developer, I can add functionality to my search box on my site to respond to question "Where is my order?" with a full-screen adaptive card or another instance of a message.

```js
TODO: Add code snippet
```

# Full support of Auth / SSO

TODO: Add screenshots
TODO: Link to existing tutorials

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

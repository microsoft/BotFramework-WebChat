# Sample - Customize Web Chat with Password Input Activity

A simple web page with a maximized Web Chat and hosted using React. This sample builds on top of the ideas expressed in sample [08.customization-user-highlighting](../08.customization-user-highlighting) and shows a custom activity that accepts password input and submits it as a postback activity. This sample is implemented with React and makes changes that are based off of the [host with React sample](../03.a.host-with-react).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/10.b.customization-password-input)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/10.b.customization-password-input` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `sample:password-input` to get the password input box

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

We'll start by using the [host with React sample](../03.a.host-with-react) as our Web Chat React template.

First we will build a class-based React component called `PasswordInputActivity`. This component will have a state object with `code` and `submitted` values, set to an empty string and false, respectively.

This component will also have two helper methods, called `handleCodeChange` and `handleSubmit`. The first will record the 2FA code changes into `state.code`, and the second will submit the altered code via `postBack` when the submit button is clicked.

This component will render a simple form that asks the user to input their 2-Factor Authentication code.

```jsx
class PasswordInputActivity extends React.Component {
   constructor(props) {
      super(props);

      this.handleCodeChange = this.handleCodeChange.bind(this);
      this.handleSubmit = this.handleSubmit.bind(this);

      this.state = {
         code: '',
         submitted: false
      };
   }

   handleCodeChange({ target: { value: code } }) {
      this.setState(() => ({ code }));
   }

   handleSubmit(event) {
      event.preventDefault();

      this.props.sendPostBack({ code: this.state.code });
      this.setState(() => ({ submitted: true }));
   }

   render() {
      const {
         state: { code, submitted }
      } = this;

      return (
         <form onSubmit={this.handleSubmit}>
            <label>
               <span>Please input your 2FA code</span>
               <input
                  autoFocus={true}
                  disabled={submitted}
                  onChange={this.handleCodeChange}
                  type="password"
                  value={code}
               />
            </label>
         </form>
      );
   }
}
```

This next step is not required. Let's build a wrapper container around ActivityWithFeedback that will strip props to only contain `sendPostBack`.

```jsx
const ConnectedPasswordInputActivity = connectToWebChat(({ sendPostBack }) => ({
   sendPostBack
}))(props => <PasswordInputActivity {...props} />);
```

Next we will build our CSS and apply class names to our component.

```js
const { css } = window.Glamor;

const PASSWORD_INPUT_CSS = css({
   backgroundColor: 'Red',
   borderRadius: 3,
   color: 'White',
   display: 'flex',
   margin: 10,
   padding: 5,

   '& > label': {
      display: 'flex',
      flex: 1,
      fontFamily: "Calibri, 'Helvetica Neue', Arial, sans-serif",

      '& > span': {
         padding: 10
      },

      '& > input': {
         border: 0,
         borderRadius: 3,
         flex: 1,
         letterSpacing: '.5em',
         outline: 0,
         padding: '0 10px',
         width: '100%',

         '&:disabled': {
            backgroundColor: 'rgba(255, 255, 255, .5)',
            color: 'White'
         }
      }
   }
});
```

Add the `PASSWORD_INPUT_CSS` class to the `jsx`:

```diff
return (
  <form
+   className={ PASSWORD_INPUT_CSS }
    onSubmit={ this.handleSubmit }
  >
    <label>
      <span>Please input your 2FA code</span>
      <input
        autoFocus={ true }
        disabled={ submitted }
        onChange={ this.handleCodeChange }
        type="password"
        value={ code }
      />
    </label>
  </form>
);
```

Finally, set up `activityMiddleware` to add the `<ConnectedPasswordInputActivity />` component to `passwordInput` event activities.

```jsx
const activityMiddleware = () => next => card => {
   const {
      activity: { name, type }
   } = card;

   if (type === 'event' && name === 'passwordInput') {
      return () => <ConnectedPasswordInputActivity />;
   } else {
      return next(card);
   }
};
```

Then, add the `activityMiddlware` to the Web Chat render, and that's it.

```diff
window.ReactDOM.render(
  <ReactWebChat
+   activityMiddleware={ activityMiddleware }
    directLine={ window.WebChat.createDirectLine({ token }) }
  />,
  document.getElementById('webchat')
);
```

## Completed code

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Password input activity</title>

    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>
    <script src="https://unpkg.com/glamor@2.20.40/umd/index.js"></script>

    <script src="https://cdn.botframework.com/botframework-webchat/master/webchat.js"></script>
    <style>
      html, body { height: 100% }
      body { margin: 0 }

      #webchat {
        height: 100%;
        width: 100%;
      }
    </style>
  </head>
  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel">
      (async function () {
        'use strict';

        const { connectToWebChat, ReactWebChat } = window.WebChat;
+       const { css } = window.Glamor;

+       const PASSWORD_INPUT_CSS = css({
+         backgroundColor: 'Red',
+         borderRadius: 3,
+         color: 'White',
+         display: 'flex',
+         margin: 10,
+         padding: 5,

+         '& > label': {
+           display: 'flex',
+           flex: 1,
+           fontFamily: 'Calibri, \'Helvetica Neue\', Arial, sans-serif',

+           '& > span': {
+             padding: 10
+           },

+           '& > input': {
+             border: 0,
+             borderRadius: 3,
+             flex: 1,
+             letterSpacing: '.5em',
+             outline: 0,
+             padding: '0 10px',
+             width: '100%',

+             '&:disabled': {
+               backgroundColor: 'rgba(255, 255, 255, .5)',
+               color: 'White'
+             }
+           }
+         }
+       });

+       class PasswordInputActivity extends React.Component {
+         constructor(props) {
+           super(props);

+           this.handleCodeChange = this.handleCodeChange.bind(this);
+           this.handleSubmit = this.handleSubmit.bind(this);

+           this.state = {
+             code: '',
+             submitted: false
+           };
+         }

+         handleCodeChange({ target: { value: code } }) {
+           this.setState(() => ({ code }));
+         }

+         handleSubmit(event) {
+           event.preventDefault();

+           this.props.sendPostBack({ code: this.state.code });
+           this.setState(() => ({ submitted: true }));
+         }

+         render() {
+           const { state: { code, submitted } } = this;

+           return (
+             <form
+               className={ PASSWORD_INPUT_CSS }
+               onSubmit={ this.handleSubmit }
+             >
+               <label>
+                 <span>Please input your 2FA code</span>
+                 <input
+                   autoFocus={ true }
+                   disabled={ submitted }
+                   onChange={ this.handleCodeChange }
+                   type="password"
+                   value={ code }
+                 />
+               </label>
+             </form>
+           );
+         }
+       }

+       const ConnectedPasswordInputActivity = connectToWebChat(
+         ({ sendPostBack }) => ({ sendPostBack })
+       )(props => <PasswordInputActivity { ...props } />)

       const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
+       const activityMiddleware = () => next => card => {
+         const { activity: { name, type } } = card;

+         if (type === 'event' && name === 'passwordInput') {
+           return () => <ConnectedPasswordInputActivity />;
+         } else {
+           return next(card);
+         }
+       };

        window.ReactDOM.render(
          <ReactWebChat
+           activityMiddleware={ activityMiddleware }
            directLine={ window.WebChat.createDirectLine({ token }) }
          />,
          document.getElementById('webchat')
        );

        store.dispatch({
          type: 'WEB_CHAT/SET_SEND_BOX',
          payload: { text: 'sample:password-input' }
        });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```

# Further reading

[User highlighting bot](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting) | [(User highlighting source code)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/08.customization-user-highlighting)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

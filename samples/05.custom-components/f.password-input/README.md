# Sample - Customize Web Chat with Password Input Activity

A simple web page with a maximized Web Chat and hosted using React. This sample builds on top of the ideas expressed in sample [05.custom-components/c.user-highlighting](../05.custom-components/c.user-highlighting) and shows a custom activity that accepts password input and submits it as a postback activity. This sample is implemented with React and makes changes that are based off of the [host with React sample](../01.getting-started/e.host-with-react).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/f.password-input)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/05.custom-components/f.password-input` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Type `sample:password-input` to get the password input box

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

We'll start by using the [host with React sample](../01.getting-started/e.host-with-react) as our Web Chat React template.

In this sample, we will build a new React component that will be shown when we receive an event activity from the bot named `passwordInput`. It will show a password box. When the user presses <kbd>ENTER</kbd> to submit the box, a post back activity will be sent back to the bot.

Let's start by building the React component called `PasswordInputActivity`.
This component will render a simple form that asks the user to input their Two-Factor Authentication code.

<!-- prettier-ignore-start -->
```js
const PasswordInputActivity = () => {
  return (
    <div>
      <form>
        <label>
          <span>Please input your 2FA code</span>
          <input
            autoFocus={true}
            type="password"
          />
        </label>
      </form>
    </div>
  );
};
```
<!-- prettier-ignore-end -->

Next, build the CSS and apply class names to the component.

<!-- prettier-ignore-start -->
```css
.passwordInput {
  margin: 10px;
}

.passwordInput .passwordInput__form {
  background-color: Red;
  border-radius: 3px;
  color: White;
  display: flex;
  font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
  padding: 5px;
}

.passwordInput .passwordInput__box {
  display: flex;
  flex: 1;
}

.passwordInput .passwordInput__label {
  padding: 10px;
}

.passwordInput .passwordInput__input {
  border: 0px;
  border-radius: 3px;
  flex: 1;
  letter-spacing: 0.5em;
  outline: 0;
  padding: 0 10px;
  width: 100%;
}

.passwordInput .passwordInput__input:disabled {
  background-color: rgba(255, 255, 255, 0.5);
  color: White;
}
```
<!-- prettier-ignore-end -->

Then, apply the style sheet to our React component.

```diff
  return (
-   <div>
+     <div className="passwordInput">
-       <form>
+       <form className="passwordInput__form">
-         <label>
+         <label className="passwordInput__box">
-           <span>Please input your 2FA code</span>
+           <span className="passwordInput__label">Please input your 2FA code</span>
              <input
                autoFocus={true}
+               className="passwordInput__input"
                type="password"
              />
            />
          </label>
        </form>
      </div>
   );
```

Next, add the business logic to the component:

-  When the user types into the password box, save the code.
-  When the user presses <kbd>ENTER</kbd> inside the password box, submit the code and disable the password box.

This component will have a state object with `code` and `submitted` values, initially set to an empty string and `false`, respectively. `code` will store the code, and `submitted` will store a boolean value to indicate whether the code has been submitted or not. If the code has been submitted, disable the input box to prevent resubmission.

This component will have two callback functions, called `handleCodeChange` and `handleSubmit`. The former will be called when the code has changed, and it will save the value into the `code` state. The latter will be called when the form is submitted (user press <kbd>ENTER</kbd> on the password box). It will submit the input via `sendPostBack`, then disable itself to prevent resubmission by updating `submitted` to `true`.

The `sendPostBack` function will be retrieved from Web Chat hooks via `useSendPostBack` function.

The activity status will be rendered by calling `useRenderActivityStatus()` function

```diff
- const { ReactWebChat } = window.WebChat;
+ const {
+   hooks: { useRenderActivityStatus, useSendPostBack },
+   ReactWebChat
+ } = window.WebChat;
+
+ const { useCallback, useState } = window.React;

- const PasswordInputActivity = () => {
+ const PasswordInputActivity = ({ activity, nextVisibleActivity }) => {
+   const [twoFACode, setTwoFACode] = useState('');
+   const [submitted, setSubmitted] = useState(false);
+   const renderActivityStatus = useRenderActivityStatus({ activity, nextVisibleActivity });
+   const sendPostBack = useSendPostBack();
+
+   const handleCodeChange = useCallback(
+     ({ target: { value } }) => {
+       setTwoFACode(value);
+      },
+      [setTwoFACode]
+     );
+
+   const handleSubmit = useCallback(
+     event => {
+       event.preventDefault();
+
+       sendPostBack({ code: twoFACode });
+       setSubmitted(true);
+     },
+     [sendPostBack, setSubmitted, twoFACode]
+   );

    return (
      <div className="passwordInput">
-       <form className="passwordInput__form">
+       <form className="passwordInput__form" onSubmit={handleSubmit}>
          <label className="passwordInput__box">
            <span className="passwordInput__label">Please input your 2FA code</span>
            <input
                autoFocus={true}
                className="passwordInput__input"
+               disabled={submitted}
+               onChange={handleCodeChange}
                type="password"
+               value={twoFACode}
            />
          </label>
        </form>
+       {renderActivityStatus()}
      </div>
    );
  };
```

Finally, set up `activityMiddleware` to add the `<PasswordInputActivity />` component to the `passwordInput` event activities.

When the bot send an event activity with the name `passwordInput`, show the `<PasswordInputActivity>` component instead.

```diff
+ const activityMiddleware = () => next => ({ activity, nextVisibleActivity, ...otherArgs }) => {
+   const { name, type } = activity;
+
+   if (type === 'event' && name === 'passwordInput') {
+     return () => <PasswordInputActivity activity={activity} nextVisibleActivity={nextVisibleActivity} />;
+   } else {
+   return next({ activity, nextVisibleActivity, ...otherArgs });
+   }
+ };

  window.ReactDOM.render(
    <ReactWebChat
+     activityMiddleware={activityMiddleware}
      directLine={window.WebChat.createDirectLine({ token })}
    />,
    document.getElementById('webchat')
  );
```

## Completed code

<!-- prettier-ignore-start -->
```html
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Password input activity</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <script crossorigin="anonymous" src="https://unpkg.com/babel-standalone@7.8.7/babel.min.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react@16.8.6/umd/react.development.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react-dom@16.8.6/umd/react-dom.development.js"></script>
    <script crossorigin="anonymous" src="https://unpkg.com/react-redux@7.1.0/dist/react-redux.min.js"></script>
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

      .passwordInput {
        margin: 10px;
      }

      .passwordInput .passwordInput__form {
        background-color: Red;
        border-radius: 3px;
        color: White;
        display: flex;
        font-family: Calibri, 'Helvetica Neue', Arial, sans-serif;
        padding: 5px;
      }

      .passwordInput .passwordInput__box {
        display: flex;
        flex: 1;
      }

      .passwordInput .passwordInput__label {
        padding: 10px;
      }

      .passwordInput .passwordInput__input {
        border: 0px;
        border-radius: 3px;
        flex: 1;
        letter-spacing: 0.5em;
        outline: 0;
        padding: 0 10px;
        width: 100%;
      }

      .passwordInput .passwordInput__input:disabled {
        background-color: rgba(255, 255, 255, 0.5);
        color: White;
      }
    </style>
  </head>

  <body>
    <div id="webchat" role="main"></div>
    <script type="text/babel" data-presets="es2015,react,stage-3">
      (async function() {
        'use strict';

        const {
          hooks: { useRenderActivityStatus, useSendPostBack },
          ReactWebChat
        } = window.WebChat;

        const { useCallback, useState } = window.React;

        const PasswordInputActivity = ({ activity, nextVisibleActivity }) => {
          const [twoFACode, setTwoFACode] = useState('');
          const [submitted, setSubmitted] = useState(false);
          const renderActivityStatus = useRenderActivityStatus({ activity, nextVisibleActivity });
          const sendPostBack = useSendPostBack();

          const handleCodeChange = useCallback(
            ({ target: { value } }) => {
              setTwoFACode(value);
            },
            [setTwoFACode]
          );

          const handleSubmit = useCallback(
            event => {
              event.preventDefault();

              sendPostBack({ code: twoFACode });
              setSubmitted(true);
            },
            [sendPostBack, setSubmitted, twoFACode]
          );

          return (
            <div className="passwordInput">
              <form className="passwordInput__form" onSubmit={handleSubmit}>
                <label className="passwordInput__box">
                  <span className="passwordInput__label">Please input your 2FA code</span>
                  <input
                    autoFocus={true}
                    className="passwordInput__input"
                    disabled={submitted}
                    onChange={handleCodeChange}
                    type="password"
                    value={twoFACode}
                  />
                </label>
              </form>
              {renderActivityStatus()}
            </div>
          );
        };

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const store = createStore();
        const activityMiddleware = () => next => ({ activity, nextVisibleActivity, ...otherArgs }) => {
          const { name, type } = activity;

          if (type === 'event' && name === 'passwordInput') {
            return () => <PasswordInputActivity activity={activity} nextVisibleActivity={nextVisibleActivity} />;
          } else {
            return next({ activity, nextVisibleActivity, ...otherArgs });
          }
        };

        window.ReactDOM.render(
          <ReactWebChat
            activityMiddleware={activityMiddleware}
            directLine={window.WebChat.createDirectLine({ token })}
            store={store}
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
<!-- prettier-ignore-end -->

# Further reading

[User highlighting bot](https://microsoft.github.io/BotFramework-WebChat/05.custom-components/c.user-highlighting) | [(User highlighting source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/05.custom-components/c.user-highlighting)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

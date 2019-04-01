# Sample - Customize Web Chat with Reaction Buttons

This sample builds on top of the ideas expressed in sample [08.customization-user-highlighting](../08.customization-user-highlighting) and creates more involved middleware that will alert the bot to helpful and unhelpful messages via reaction buttons. This sample is implemented with React and makes changes that are based off of the [host with React sample](../03.a.host-with-react).

# Test out the hosted sample

- [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/09.customization-reaction-buttons)

# How to run locally

- Fork this repository
- Navigate to `/Your-Local-WebChat/samples/09.customization-reaction-buttons` in command line
- Run `npx serve` in the full-bundle directory
- Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

- Click the 👍👎 button next to activities from bot

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview
We'll start by using the [host with React sample](../03.a.host-with-react) as our Web Chat React template.

In this sample we will build a new React component around the `activity` sent from the bot so that it includes two reaction buttons. Depending on which button is clicked, a new activity will be sent to the bot indicating which button the user has selected.

Let's start building the React Component. It will have two methods, `handleDownvoteButton` and `handleUpvoteButton`. Both methods will build new activity objects to be sent to the bot. The render function contains the new markup to contain the activities made by the bot.

```jsx
class ActivityWithFeedback extends React.Component {
  handleDownvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: -1 } })
  handleUpvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: 1 } })

  render() {
    const { props } = this;

    return (
      <div>
        <ul>
          <li><button onClick={ this.handleUpvoteButton }>👍</button></li>
          <li><button onClick={ this.handleDownvoteButton }>👎</button></li>
        </ul>
        <div>
          { props.children }
        </div>
      </div>
    );
  }
}
```

Next, add styling via glamor and the classes that will be applied in this component.

```diff
+ const { css } = window.Glamor;

+ const ACTIVITY_WITH_FEEDBACK_CSS = css({
+   minHeight: 60,
+   position: 'relative',

+   '& > .activity': {
+     paddingLeft: 40
+   },

+   '& > .button-bar': {
+     listStyleType: 'none',
+     margin: '0 0 0 10px',
+     padding: 0,
+     position: 'absolute',

+     '& > li > button': {
+       background: 'White',
+       border: 'solid 1px #E6E6E6',
+       marginBottom: 2,
+       padding: '2px 5px 5px'
+     }
+   }
+ });

class ActivityWithFeedback extends React.Component {
  handleDownvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: -1 } })
  handleUpvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: 1 } })

  render() {
    const { props } = this;

    return (
+     <div className={ ACTIVITY_WITH_FEEDBACK_CSS }>
+       <ul className="button-bar">
          <li><button onClick={ this.handleUpvoteButton }>👍</button></li>
          <li><button onClick={ this.handleDownvoteButton }>👎</button></li>
        </ul>
+       <div className="activity">
+         { props.children }
        </div>
      </div>
    );
  }
}
```

This next step is not required. Let's build a wrapper container around ActivityWithFeedback that will strip props to only contain `postActivity`.

```jsx
const ConnectedActivityWithFeedback = connectToWebChat(
  ({ postActivity }) => ({ postActivity })
)(props => <ActivityWithFeedback { ...props } />)
```

Next let's build the if statement in `activityMiddleware` that will filter which activities are rendered with a new component, `ConnectedActivityWithFeedback`.

```jsx
const activityMiddleware = () => next => card => {
  if (card.activity.from.role === 'bot') {
    return (
      children =>
        <ConnectedActivityWithFeedback activityID={ card.activity.id }>
          { next(card)(children) }
        </ConnectedActivityWithFeedback>
    );
  } else {
    return next(card);
  }
};
```
Make sure `activityMiddleware` is passed into the the Web Chat component, and that's it.

## Completed code

```diff
<!DOCTYPE html>
<html lang="en-US">
  <head>
    <title>Web Chat: Custom attachment with GitHub Stargazers</title>

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

+       const ACTIVITY_WITH_FEEDBACK_CSS = css({
+         minHeight: 60,
+         position: 'relative',

+         '& > .activity': {
+           paddingLeft: 40
+         },

+         '& > .button-bar': {
+           listStyleType: 'none',
+           margin: '0 0 0 10px',
+           padding: 0,
+           position: 'absolute',

+           '& > li > button': {
+             background: 'White',
+             border: 'solid 1px #E6E6E6',
+             marginBottom: 2,
+             padding: '2px 5px 5px'
+           }
+         }
+       });

+       class ActivityWithFeedback extends React.Component {
+         handleDownvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: -1 } })
+         handleUpvoteButton = () => this.props.postActivity({ type: 'message', name: 'evaluate-activity', value: { activityID: this.props.activityID, helpful: 1 } })

+         render() {
+           const { props } = this;

+           return (
+             <div className={ ACTIVITY_WITH_FEEDBACK_CSS }>
+               <ul className="button-bar">
+                 <li><button onClick={ this.handleUpvoteButton }>👍</button></li>
+                 <li><button onClick={ this.handleDownvoteButton }>👎</button></li>
+               </ul>
+               <div className="activity">
+                 { props.children }
+               </div>
+             </div>
+           );
+         }
+       }

+       const ConnectedActivityWithFeedback = connectToWebChat(
+         ({ postActivity }) => ({ postActivity })
+       )(props => <ActivityWithFeedback { ...props } />)

+       const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
+       const { token } = await res.json();
+       const activityMiddleware = () => next => card => {
+         if (card.activity.from.role === 'bot') {
+           return (
+             children =>
+               <ConnectedActivityWithFeedback activityID={ card.activity.id }>
+                 { next(card)(children) }
+               </ConnectedActivityWithFeedback>
+           );
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

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>

```
# Further reading

[User highlighting bot](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting) | [(User highlighting source code)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/08.customization-user-highlighting)

[Card components bot](https://microsoft.github.io/BotFramework-WebChat/10.a.customization-card-components) | [(Card components source code)](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples/10.a.customization-card-components)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/Microsoft/BotFramework-WebChat/tree/master/samples)

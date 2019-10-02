# Sample - Customize Web Chat with GitHub Stargazer Components

A simple web page with a maximized Web Chat and hosted using React. This sample builds on top of the ideas expressed in sample [08.customization-user-highlighting](../08.customization-user-highlighting) and creates a function-based React component to display GitHub Stargazer cards. This sample is implemented with React and makes changes that are based off of the [host with React sample](../03.a.host-with-react).

# Test out the hosted sample

-  [Try out MockBot](https://microsoft.github.io/BotFramework-WebChat/10.a.customization-card-components)

# How to run locally

-  Fork this repository
-  Navigate to `/Your-Local-WebChat/samples/10.a.customization-card-components` in command line
-  Run `npx serve` in the full-bundle directory
-  Browse to [http://localhost:5000/](http://localhost:5000/)

# Things to try out

-  Notice that the command `sample:github-repository` is pre-filled in the Send Box. Press enter.
-  Notice Mock Bot displays the new GitHub card components.

# Code

> Jump to [completed code](#completed-code) to see the end-result `index.html`.

## Overview

We'll start by using the [host with React sample](../03.a.host-with-react) as our Web Chat React template.

When the command `sample:github-repository` is sent to Mock Bot, the bot will send an attachment of cards. Instead of using Adaptive Cards to display these, we will instead build our own component and use `attachmentMiddleware` to intercept those cards.

Let's take a look at the activity with attachments to be sent from Mock Bot:

```
{
    type: 'message',
    attachmentLayout: 'carousel',
    attachments: [{
      content: {
        owner: 'Microsoft',
        repo: 'BotFramework-WebChat'
      },
      contentType: 'application/vnd.microsoft.botframework.samples.github-repository'
    }, {
      content: {
        owner: 'Microsoft',
        repo: 'BotFramework-Emulator'
      },
      contentType: 'application/vnd.microsoft.botframework.samples.github-repository'
    }, {
      content: {
        owner: 'Microsoft',
        repo: 'BotFramework-DirectLineJS'
      },
      contentType: 'application/vnd.microsoft.botframework.samples.github-repository'
    }]
  }
```

We will be taking advantage of the activity's `contentType`, `owner` and `repo` data.

Let's build the structure of our component to render on GitHub repository attachments.

```jsx
const GitHubRepositoryAttachment = props => (
   <div>
      <p>
         <a>[GitHub repo link]</a>
      </p>
   </div>
);
```

Next, add the GitHub octocat svg and pull in information from `props` in our anchor. Then add styling to the containing `div`.

```diff
const GitHubRepositoryAttachment = props =>
+ <div style={{ fontFamily: '\'Calibri\', \'Helvetica Neue\', Arial, sans-serif', margin: 20, textAlign: 'center' }}>
+   <svg height="64" viewBox="0 0 16 16" version="1.1" width="64" aria-hidden="true"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
    <p>
+     <a href={ `https://github.com/${ encodeURI(props.owner) }/${ encodeURI(props.repo) }` } target="_blank">{ props.owner }/<br />{ props.repo }</a>
    </p>
  </div>;
```

Next we'll create our `attachmentMiddleware` and use our `<GitHubRepositoryAttachment>` component like so:

```jsx
const attachmentMiddleware = () => next => card => {
   switch (card.attachment.contentType) {
      case 'application/vnd.microsoft.botframework.samples.github-repository':
         return (
            <GitHubRepositoryAttachment owner={card.attachment.content.owner} repo={card.attachment.content.repo} />
         );

      default:
         return next(card);
   }
};
```

Finally, make sure the attachmentMiddleware is added to the Web Chat render method. That's it!

```diff
  window.ReactDOM.render(
    <ReactWebChat
+     attachmentMiddleware={ attachmentMiddleware }
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
    <title>Web Chat: Custom attachment with GitHub Stargazers</title>

    <script src="https://unpkg.com/babel-standalone@6/babel.min.js"></script>
    <script src="https://unpkg.com/react@16.5.0/umd/react.development.js"></script>
    <script src="https://unpkg.com/react-dom@16.5.0/umd/react-dom.development.js"></script>
    <script src="https://unpkg.com/react-redux@5.0.7/dist/react-redux.min.js"></script>

    <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
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
+     const GitHubRepositoryAttachment = props =>
+       <div style={{ fontFamily: '\'Calibri\', \'Helvetica Neue\', Arial, sans-serif', margin: 20, textAlign: 'center' }}>
+         <svg height="64" viewBox="0 0 16 16" version="1.1" width="64" aria-hidden="true"><path fillRule="evenodd" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"></path></svg>
+         <p>
+           <a href={ `https://github.com/${ encodeURI(props.owner) }/${ encodeURI(props.repo) }` } target="_blank">{ props.owner }/<br />{ props.repo }</a>
+         </p>
+       </div>;

      (async function () {

        const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });
        const { token } = await res.json();
        const { ReactWebChat } = window.WebChat;
+       const attachmentMiddleware = () => next => card => {
+         switch (card.attachment.contentType) {
+           case 'application/vnd.microsoft.botframework.samples.github-repository':
+             return <GitHubRepositoryAttachment owner={ card.attachment.content.owner } repo={ card.attachment.content.repo } />;

+           default:
+             return next(card);
+         }
+       };

        window.ReactDOM.render(
          <ReactWebChat
+           attachmentMiddleware={ attachmentMiddleware }
            directLine={ window.WebChat.createDirectLine({ token }) }
          />,
          document.getElementById('webchat')
        );

        store.dispatch({
          type: 'WEB_CHAT/SET_SEND_BOX',
          payload: { text: 'sample:github-repository' }
        });

        document.querySelector('#webchat > *').focus();
      })().catch(err => console.error(err));
    </script>
  </body>
</html>
```

# Further reading

[User highlighting bot](https://microsoft.github.io/BotFramework-WebChat/08.customization-user-highlighting) | [(User highlighting source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/08.customization-user-highlighting)

[Reaction buttons bot](https://microsoft.github.io/BotFramework-WebChat/09.customization-reaction-buttons) | [(Reaction buttons source code)](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples/09.customization-reaction-buttons)

## Full list of Web Chat hosted samples

View the list of [available Web Chat samples](https://github.com/microsoft/BotFramework-WebChat/tree/master/samples)

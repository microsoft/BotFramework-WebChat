# Integrate Web Chat into your website

Follow the instructions on the [README.md](README.md) page to integrate the Web Chat control into your website.

# Customizing styles

The latest version of Web Chat control provides rich customization options: you can change colors, sizes, placement of elements, add custom elements, and interact with the hosting webpage. Below are several examples of how to customize those elements of the Web Chat UI.

You can find the full list of all settings that you can easily modify in Web Chat on the [`defaultStyleOptions.js` file](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/defaultStyleOptions.js).

These settings will generate a _style set_, which is a set of CSS rules enhanced with [glamor](https://github.com/threepointone/glamor). You can find the full list of CSS styles generated in the style set on the [`createStyleSet.js` file](https://github.com/microsoft/BotFramework-WebChat/blob/master/packages/component/src/Styles/createStyleSet.js).

## Set the size of the Web Chat container

It is now possible to adjust the size of the Web Chat container using `styleSetOptions`. The following example has a `body` background-color of `paleturquoise` to show the Web Chat container (section with white background).

```js
…
<head>
  <style>
    html, body { height: 100% }
    body {
      margin: 0;
      background-color: paleturquoise;
    }

    #webchat {
      height: 100%;
      width: 100%;
    }
  </style>
</head>
<body>
  <div id="webchat" role="main"></div>
  <script>
    (async function () {
    window.WebChat.renderWebChat({
      directLine: window.WebChat.createDirectLine({ token }),
      styleOptions: {
        rootHeight: '100%',
        rootWidth: '50%'
      }
    }, document.getElementById('webchat'));
    })()
  </script>
…
```

Here is the result:

<img alt="Web Chat with root height and root width set" src="https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/rootHeightWidth.png" width="600"/>

## Change font or color

Instead of using the default background color and the fonts used inside of the chat bubbles, you can customize those to match the style of the target web page. The code snippet below allows you to change the background color of messages from the user and from the bot.

<img alt="Screenshot with custom style options" src="https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/sample-custom-style-options.png" width="396" />

If you need to do some simple styling, you can set them via `styleOptions`. Style options are set of predefined styles that you can modify directly, and Web Chat will compute the whole stylesheet based on it.

```html
<!DOCTYPE html>
<html>
   <body>
      <div id="webchat" role="main"></div>
      <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
      <script>
         const styleOptions = {
            bubbleBackground: 'rgba(0, 0, 255, .1)',
            bubbleFromUserBackground: 'rgba(0, 255, 0, .1)'
         };

         window.WebChat.renderWebChat(
            {
               directLine: window.WebChat.createDirectLine({
                  secret: 'YOUR_BOT_SECRET'
               }),

               // Passing 'styleOptions' when rendering Web Chat
               styleOptions
            },
            document.getElementById('webchat')
         );
      </script>
   </body>
</html>
```

## Change the CSS manually

In addition to colors, you can modify fonts used to render messages:

<img alt="Screenshot with custom style set" src="https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/sample-custom-style-set.png" width="396" />

For deeper styling, you can also modify the style set manually by setting the CSS rules directly.

> Since CSS rules are tightly-coupled to the structure of the DOM tree, there is possibility that these rules need to be updated to work with the newer version of Web Chat.

```html
<!DOCTYPE html>
<html>
   <body>
      <div id="webchat" role="main"></div>
      <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
      <script>
         // "styleSet" is a set of CSS rules which are generated from "styleOptions"
         const styleSet = window.WebChat.createStyleSet({
            bubbleBackground: 'rgba(0, 0, 255, .1)',
            bubbleFromUserBackground: 'rgba(0, 255, 0, .1)'
         });

         // After generated, you can modify the CSS rules
         styleSet.textContent = {
            ...styleSet.textContent,
            fontFamily: "'Comic Sans MS', 'Arial', sans-serif",
            fontWeight: 'bold'
         };

         window.WebChat.renderWebChat(
            {
               directLine: window.WebChat.createDirectLine({
                  secret: 'YOUR_BOT_SECRET'
               }),

               // Passing 'styleSet' when rendering Web Chat
               styleSet
            },
            document.getElementById('webchat')
         );
      </script>
   </body>
</html>
```

## Change the avatar of the bot within the dialog box

The latest version of Web Chat supports avatars, which you can customize by setting `botAvatarInitials` and `userAvatarInitials` in the `styleOptions` prop.

<img alt="Screenshot with avatar initials" src="https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/sample-avatar-initials.png" width="396" />

```html
<!DOCTYPE html>
<html>
   <body>
      <div id="webchat" role="main"></div>
      <script src="https://cdn.botframework.com/botframework-webchat/latest/webchat.js"></script>
      <script>
         const styleOptions = {
            botAvatarInitials: 'BF',
            userAvatarInitials: 'WC'
         };

         window.WebChat.renderWebChat(
            {
               directLine: window.WebChat.createDirectLine({
                  secret: 'YOUR_BOT_SECRET'
               }),
               styleOptions
            },
            document.getElementById('webchat')
         );
      </script>
   </body>
</html>
```

Inside Web Chat's `styleOptions` prop, we added `botAvatarInitials` and `userAvatarInitials`:

```js
botAvatarInitials: 'BF',
userAvatarInitials: 'WC'
```

`botAvatarInitials` will set the text inside the avatar on the left-hand side. If it is set to a falsy value, the avatar on the bot side will be hidden. In contrast, `userAvatarInitials` will set the avatar text on the right-hand side.

# Custom rendering activity or attachment

With the latest version of Web Chat, you can also render activities or attachments that Web Chat does not support out-of-the-box. Activities and attachments render are sent thru a customizable pipeline that modeled after [Redux middleware](https://redux.js.org/api/applymiddleware). The pipeline is flexible enough that you can do the following tasks easily:

-  Decorate existing activities/attachments
-  Add new activities/attachments
-  Replace existing activities/attachments (or remove them)
-  Daisy chain middleware together

## Show GitHub repository as an attachment

If you want to display a deck of GitHub repository cards, you can create a new React component for the GitHub repository and add it as a middleware for attachment.

<img alt="Screenshot with custom GitHub repository attachment" src="https://raw.githubusercontent.com/microsoft/BotFramework-WebChat/master/media/sample-custom-github-repository-attachment.png" width="396" />

```jsx
import ReactWebChat from 'botframework-webchat';
import ReactDOM from 'react-dom';

// Create a new React component that accept render a GitHub repository attachment
const GitHubRepositoryAttachment = props => (
   <div
      style={{
         fontFamily: "'Calibri', 'Helvetica Neue', Arial, sans-serif",
         margin: 20,
         textAlign: 'center'
      }}
   >
      <svg height="64" viewBox="0 0 16 16" version="1.1" width="64" aria-hidden="true">
         <path
            fillRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
         />
      </svg>
      <p>
         <a href={`https://github.com/${encodeURI(props.owner)}/${encodeURI(props.repo)}`} target="_blank">
            {props.owner}/<br />
            {props.repo}
         </a>
      </p>
   </div>
);

// Creating a new middleware pipeline that will render <GitHubRepositoryAttachment> for specific type of attachment
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

ReactDOM.render(
   <ReactWebChat
      // Prepending the new middleware pipeline
      attachmentMiddleware={attachmentMiddleware}
      directLine={window.WebChat.createDirectLine({ token })}
   />,
   document.getElementById('webchat')
);
```

The full sample can be found at [/samples/10.a.customization-card-components/](samples/10.a.customization-card-components/).

In this sample, we are adding a new React component called `GitHubRepositoryAttachment`:

```jsx
const GitHubRepositoryAttachment = props => (
   <div
      style={{
         fontFamily: "'Calibri', 'Helvetica Neue', Arial, sans-serif",
         margin: 20,
         textAlign: 'center'
      }}
   >
      <svg height="64" viewBox="0 0 16 16" version="1.1" width="64" aria-hidden="true">
         <path
            fillRule="evenodd"
            d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0 0 16 8c0-4.42-3.58-8-8-8z"
         />
      </svg>
      <p>
         <a href={`https://github.com/${encodeURI(props.owner)}/${encodeURI(props.repo)}`} target="_blank">
            {props.owner}/<br />
            {props.repo}
         </a>
      </p>
   </div>
);
```

Then, we create a middleware that will render the new React component when the bot sends an attachment of content type `application/vnd.microsoft.botframework.samples.github-repository`. Otherwise, it will continue on the middleware by calling `next(card)`.

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

The activity sent from the bot looks like the following:

```json
{
   "type": "message",
   "from": {
      "role": "bot"
   },
   "attachmentLayout": "carousel",
   "attachments": [
      {
         "contentType": "application/vnd.microsoft.botframework.samples.github-repository",
         "content": {
            "owner": "Microsoft",
            "repo": "BotFramework-WebChat"
         }
      },
      {
         "contentType": "application/vnd.microsoft.botframework.samples.github-repository",
         "content": {
            "owner": "Microsoft",
            "repo": "BotFramework-Emulator"
         }
      },
      {
         "contentType": "application/vnd.microsoft.botframework.samples.github-repository",
         "content": {
            "owner": "Microsoft",
            "repo": "BotFramework-DirectLineJS"
         }
      }
   ]
}
```

<!---
## Add a logo to the top bar

```js
TODO: Add code snippet
```

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

## Full customization: Bring Web Chat to Command Line (pure Angular example TODO: Add code snippet).

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
--->

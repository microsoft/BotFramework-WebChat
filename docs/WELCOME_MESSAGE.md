Here is how Welcome Messages in Web Chat should be handled with the updates to the Direct Line Connector Service.

# Web Chat Welcome Messages

Channels generally send two conversation update events when the conversation is initialized - the first for the bot and another for the user. The second conversation update - the event for the user - is intended to trigger the welcome message. At the moment, Web Chat has two different welcome message scenarios that are slightly different from other channels and based on how the developer generates the Direct Line token.

## Tokens with User IDs

The first scenario is dependent on the token request including a user ID. If the developer includes a user ID when generating the token, Direct Line will only send one conversation update event to the bot that includes two user IDs in the activity's `membersAdded` property - one for the bot and one for the user. Following this configuration should trigger the traditional welcome message in the `onMembersAdded` handler before the user messages the bot.

In the example below, the user ID is added to the token request and the welcome message is sent from the `onMembersAdded` handler.

### Web Chat

<!-- prettier-ignore-start -->
```js
(async function() {
  // Note, for the simplicity of this example, we are generating the Direct Line token on client side;
  // however, this is not a recommended practice and you should create and manage your tokens from the server.
  // You should never put the Direct Line secret in the browser or client app.
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication
  const secret = '<DIRECT_LINE_SECRET> | <WEB_CHAT_SECRET>';
  const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
    body: JSON.stringify({ user: { id: 'dl_user_id', name: 'username' } }),
    headers: {
      Authorization: `Bearer ${secret}`,
      'Content-type': 'application/json'
    },
    method: 'POST'
  });
  const { token } = await res.json();

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token })
    },
    document.getElementById('webchat')
  );

  document.querySelector('#webchat > *').focus();
})().catch(err => console.error(err));
```
<!-- prettier-ignore-end -->

### Bot Framework SDK v4 (Node.js)

<!-- prettier-ignore-start -->
```js
this.onMembersAdded(async (context, next) => {
  const { membersAdded } = context.activity;

  for (let member of membersAdded) {
    if (member.id !== context.activity.recipient.id) {
      await context.sendActivity('Welcome Message from `onMembersAdded` handler!');
    }
  }

  await next();
});
```
<!-- prettier-ignore-end -->

### Tokens, User IDs, and iFrames

To achieve this in an iFrame of Web Chat, retrieve your token with user ID as described above and pass the token within the `src` attribute of the iFrame:
`<iframe src='https://webchat.botframework.com/embed/YOUR_BOT_HERE?t=YOUR_TOKEN_HERE' style='min-width: 400px; width: 100%; min-height: 500px;'></iframe>`

## Secrets and Tokens without User IDs

Alternatively, conversations created with tokens that do not include a user ID send two conversation update events. Direct Line sends the first conversation update - the one for the bot - when the connection with the bot is established. Direct Line sends the second conversation update for the user after they send their first message.

Generally, users anticipate the bot to send a welcome message before they send a message. To do this, you can dispatch a backchannel welcome event from Web Chat's store middleware when the Direct Line connection is established. Then in the `onEvent` handler, you can send a welcome message. Note, in the `onMembersAdded` handler you should check which channel is sending the event before sending the welcome message. If the channel id is "webchat" or "directline" you should not send the traditional welcome message to avoid sending multiple welcome messages.

### Web Chat

<!-- prettier-ignore-start -->
```js
(async function() {
  // Note, for the simplicity of this example, we are generating the Direct Line token on client side;
  // however, this is not a recommended practice and you should create and manage your tokens from the server.
  // You should never put the Direct Line secret in the browser or client app.
  // https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication
  const secret = '<DIRECT_LINE_SECRET> | <WEB_CHAT_SECRET>';
  const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
    headers: {
      Authorization: `Bearer ${secret}`
    },
    method: 'POST'
  });
  const { token } = await res.json();

  const store = window.WebChat.createStore({}, ({ dispatch }) => next => action => {
    if (action.type === 'DIRECT_LINE/CONNECT_FULFILLED') {
      dispatch({
        type: 'WEB_CHAT/SEND_EVENT',
        payload: {
          name: 'webchat/join'
        }
      });
    }

    return next(action);
  });

  window.WebChat.renderWebChat(
    {
      directLine: window.WebChat.createDirectLine({ token }),
      store
    },
    document.getElementById('webchat')
  );

  document.querySelector('#webchat > *').focus();
})().catch(err => console.error(err));
```
<!-- prettier-ignore-end -->

### Bot Framework SDK v4 (Node.js)

<!-- prettier-ignore-start -->
```js
this.onEvent(async (context, next) => {
  if (context.activity.name === 'webchat/join') {
    await context.sendActivity('Back Channel Welcome Message!');
  }

  await next();
});

this.onMembersAdded(async (context, next) => {
  const { channelId, membersAdded } = context.activity;

  if (channelId !== 'directline' && channelId !== 'webchat') {
    for (let member of membersAdded) {
      if (member.id !== context.activity.recipient.id) {
        await context.sendActivity('Welcome Message from `onMembersAdded` handler!');
      }
    }
  }

  await next();
});
```
<!-- prettier-ignore-end -->

For more details regarding backchannel welcome events in Web Chat, take a look at this [sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/a.welcome-event).

### Additional Context

-  [Bot Framework Direct Line Authentication](https://docs.microsoft.com/en-us/azure/bot-service/rest-api/bot-framework-rest-direct-line-3-0-authentication?view=azure-bot-service-4.0)
-  [Using WebChat with Azure Bot Service’s Authentication](https://blog.botframework.com/2018/09/01/using-webchat-with-azure-bot-services-authentication/)
-  [Bot Framework Welcome Message Sample - Node SDK](https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/javascript_nodejs/03.welcome-users)
-  [Bot Framework Welcome Message Sample - C# SDK](https://github.com/microsoft/BotBuilder-Samples/tree/main/samples/csharp_dotnetcore/03.welcome-user)
-  [Web Chat Backchannel Welcome Event Sample](https://github.com/microsoft/BotFramework-WebChat/tree/main/samples/04.api/a.welcome-event)

const { ActivityHandler, TurnContext } = require('botbuilder');

const createBotAdapter = require('./createBotAdapter');
const createOAuthStateManager = require('./createOAuthStateManager');
const fetchGitHubProfileName = require('./fetchGitHubProfileName');
const fetchMicrosoftGraphProfileName = require('./fetchMicrosoftGraphProfileName');
const resumeContext = require('./utils/resumeContext');

module.exports = () => {
  const bot = new ActivityHandler();

  bot.onEvent(async (context, next) => {
    const { activity: { name, type, value } } = context;

    if (type === 'event' && name === 'oauth/setaccesstoken') {
      const oauthStateManager = createOAuthStateManager(context);
      const oauthState = await oauthStateManager.getState();
      const { accessToken, provider } = value;

      // No-op if access token is not changed
      if (
        accessToken === oauthState.accessToken
        && provider === oauthState.provider
      ) {
        return;
      }

      oauthState.accessToken = accessToken;
      oauthState.provider = provider;

      await oauthStateManager.saveChanges();

      if (accessToken) {
        // For async operations that is outside of BotBuilder, we should use proactive messaging.
        const reference = TurnContext.getConversationReference(context.activity);

        await context.sendActivity({ type: 'typing' });

        switch (provider) {
          case 'github':
            fetchGitHubProfileName(accessToken).then(async name => {
              const adapter = createBotAdapter();
              const resumedContext = await resumeContext(adapter, reference);

              resumedContext.respondWith(resumedContext.sendActivity(`Welcome back, ${ name } (via GitHub).`));
            });

            break;

          case 'microsoft':
            fetchMicrosoftGraphProfileName(accessToken).then(async name => {
              const adapter = createBotAdapter();
              const resumedContext = await resumeContext(adapter, reference);

              resumedContext.respondWith(resumedContext.sendActivity(`Welcome back, ${ name } (via AAD).`));
            });

            break;
        }
      } else {
        await context.sendActivity('See you next time!');
      }
    }

    await next();
  });

  bot.onMessage(async (context, next) => {
    const oauthStateManager = createOAuthStateManager(context);
    const oauthState = await oauthStateManager.getState();
    const { activity: { text } } = context;

    if (/^\s*bye\s*$/iu.test(text)) {
      oauthState.accessToken ='';
      oauthState.provider = '';

      await oauthStateManager.saveChanges();
      await context.sendActivity({
        name: 'oauth/signout',
        type: 'event'
      });
    } else if (!oauthState.accessToken) {
      await context.sendActivity({
        type: 'message',
        attachments: [{
          content: {
            buttons: [{
              title: 'Sign into Azure Active Directory',
              type: 'openUrl',
              value: 'about:blank#sign-into-aad'
            }, {
              title: 'Sign into GitHub',
              type: 'openUrl',
              value: 'about:blank#sign-into-github'
            }],
            text: 'Please sign in before continue.'
          },
          contentType: 'application/vnd.microsoft.card.hero',
        }]
      });
    } else {
      await context.sendActivity('I don\'t know this command.');
    }

    await next();
  });

  return bot;
};

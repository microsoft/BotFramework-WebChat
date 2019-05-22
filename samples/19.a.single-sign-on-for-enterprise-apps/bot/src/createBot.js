const { ActivityHandler, TurnContext } = require('botbuilder');
const { compareTwoStrings, findBestMatch } = require('string-similarity');

const createBotAdapter = require('./createBotAdapter');
const createOAuthStateManager = require('./createOAuthStateManager');
const fetchGitHubProfileName = require('./fetchGitHubProfileName');
const fetchMicrosoftGraphProfileName = require('./fetchMicrosoftGraphProfileName');

const QUESTIONS = {
  bye1: 'bye',
  bye2: 'goodbye',
  hello1: 'hello',
  hello2: 'hi',
  order: 'what are my orders',
  time: 'what time is it'
};

const SUGGESTED_ACTIONS = {
  suggestedActions: {
    actions: [{
      type: 'imBack',
      value: 'What time is it?'
    }, {
      type: 'imBack',
      value: 'Where are my orders?'
    }],
    to: []
  }
};

function guessQuestion(message) {
  const match = findBestMatch(message, Object.values(QUESTIONS));

  if (match.bestMatch.rating > .5) {
    return Object.keys(QUESTIONS)[match.bestMatchIndex];
  }
}

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
        // For async operations that are outside of BotBuilder, we should use proactive messaging.
        const reference = TurnContext.getConversationReference(context.activity);

        await context.sendActivity({ type: 'typing' });

        switch (provider) {
          case 'github':
            fetchGitHubProfileName(accessToken).then(async name => {
              const adapter = createBotAdapter();

              await adapter.continueConversation(reference, async context => {
                await context.sendActivity({
                  text: `Welcome back, ${ name } (via GitHub).`,
                  ...SUGGESTED_ACTIONS
                });
              });
            });

            break;

          case 'microsoft':
            fetchMicrosoftGraphProfileName(accessToken).then(async name => {
              const adapter = createBotAdapter();

              await adapter.continueConversation(reference, async context => {
                await context.sendActivity({
                  text: `Welcome back, ${ name } (via Azure AD).`,
                  ...SUGGESTED_ACTIONS
                });
              });
            });

            break;
        }
      } else {
        await context.sendActivity('See you later!');
      }
    }

    await next();
  });

  bot.onMessage(async (context, next) => {
    const oauthStateManager = createOAuthStateManager(context);
    const oauthState = await oauthStateManager.getState();
    const { activity: { text } } = context;

    const match = guessQuestion(text);

    if (/^hello\d+$/.test(match)) {
      await context.sendActivity({
        text: 'Hello there. What can I help you with?',
        ...SUGGESTED_ACTIONS
      });
    } else if (/^bye\d+$/.test(match)) {
      oauthState.accessToken ='';
      oauthState.provider = '';

      await oauthStateManager.saveChanges();
      await context.sendActivity({
        name: 'oauth/signout',
        type: 'event'
      });
    } else if (match === 'time') {
      const now = new Date();

      await context.sendActivity({
        text: `The time is now ${ now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }. What can I do to help?`,
        ...SUGGESTED_ACTIONS
      });
    } else if (
      match === 'order'
    ) {
      if (oauthState.accessToken) {
        await context.sendActivity({
          text: 'There is a package arriving later today.',
          ...SUGGESTED_ACTIONS
        });
      } else {
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
              text: 'Please sign in so I can help tracking your orders.'
            },
            contentType: 'application/vnd.microsoft.card.hero',
          }]
        });
      }
    } else {
      await context.sendActivity({
        text: 'Sorry, I don\'t know what you mean.',
        ...SUGGESTED_ACTIONS
      });
    }

    await next();
  });

  return bot;
};

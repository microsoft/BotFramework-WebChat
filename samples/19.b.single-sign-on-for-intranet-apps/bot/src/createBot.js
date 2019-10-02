const { ActivityHandler, TurnContext } = require('botbuilder');

const createBotAdapter = require('./createBotAdapter');
const fetchMicrosoftGraphProfileName = require('./fetchMicrosoftGraphProfileName');

module.exports = () => {
  const bot = new ActivityHandler();

  // Handler for "message" activity
  bot.onMessage(async (context, next) => {
    const { activity: { channelData: { oauthAccessToken } = {} } = {} } = context;

    if (oauthAccessToken) {
      // For async operations that are outside of BotBuilder, we should use proactive messaging.
      const reference = TurnContext.getConversationReference(context.activity);

      await context.sendActivity({ type: 'typing' });

      // We are using .then() here to detach the background job.
      fetchMicrosoftGraphProfileName(oauthAccessToken).then(async name => {
        // When the Microsoft Graph profile is fetched, send a welcome message.
        const adapter = createBotAdapter();

        await adapter.continueConversation(reference, async context => {
          await context.sendActivity({
            text: `Welcome back, ${name} (via Azure AD).`
          });
        });
      });
    } else {
      await context.sendActivity(`Please authenticate before continuing.`);
    }

    await next();
  });

  return bot;
};

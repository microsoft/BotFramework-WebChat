const { ActivityHandler, TurnContext } = require('botbuilder');
const { findBestMatch } = require('string-similarity');

const createBotAdapter = require('./createBotAdapter');
const fetchGitHubProfileName = require('./fetchGitHubProfileName');
const fetchMicrosoftGraphProfileName = require('./fetchMicrosoftGraphProfileName');

const QUESTIONS = {
  bye1: 'bye',
  bye2: 'goodbye',
  hello1: 'hello',
  hello2: 'hi',
  order: 'where are my orders',
  time: 'what time is it'
};

const SUGGESTED_ACTIONS = {
  suggestedActions: {
    actions: [
      {
        type: 'imBack',
        value: 'What time is it?'
      },
      {
        type: 'imBack',
        value: 'Where are my orders?'
      }
    ],
    to: []
  }
};

// For simplicity, we are using "string-similarity" package to guess what the user asked.
function guessQuestion(message) {
  const match = findBestMatch(message, Object.values(QUESTIONS));

  if (match.bestMatch.rating > 0.5) {
    return Object.keys(QUESTIONS)[match.bestMatchIndex];
  }
}

module.exports = () => {
  const bot = new ActivityHandler();

  // Handler for "event" activity
  bot.onEvent(async (context, next) => {
    const {
      activity: { channelData, name }
    } = context;

    // When we receive an event activity of "oauth/signin", set the access token to conversation state.
    if (name === 'oauth/signin') {
      const { oauthAccessToken, oauthProvider } = channelData;

      // For async operations that are outside of BotBuilder, we should use proactive messaging.
      const reference = TurnContext.getConversationReference(context.activity);

      await context.sendActivity({ type: 'typing' });

      switch (oauthProvider) {
        case 'github':
          // We are using .then() here to detach the background job.
          fetchGitHubProfileName(oauthAccessToken).then(async name => {
            // When the GitHub profile is fetched, send a welcome message.
            const adapter = createBotAdapter();

            await adapter.continueConversation(reference, async context => {
              await context.sendActivity({
                text: `Welcome back, ${name} (via GitHub).`,
                ...SUGGESTED_ACTIONS
              });
            });
          });

          break;

        case 'microsoft':
          // We are using .then() here to detach the background job.
          fetchMicrosoftGraphProfileName(oauthAccessToken).then(async name => {
            // When the Microsoft Graph profile is fetched, send a welcome message.
            const adapter = createBotAdapter();

            await adapter.continueConversation(reference, async context => {
              await context.sendActivity({
                text: `Welcome back, ${name} (via Azure AD).`,
                ...SUGGESTED_ACTIONS
              });
            });
          });

          break;
      }
    } else if (name === 'oauth/signout') {
      // If we receive the event activity with no access token inside, this means the user is signing out from the website.
      await context.sendActivity('See you later!');
    }

    await next();
  });

  // Handler for "message" activity
  bot.onMessage(async (context, next) => {
    const {
      activity: { channelData: { oauthAccessToken } = {}, text }
    } = context;

    console.log(context.activity.channelData);

    const match = guessQuestion(text);

    if (/^hello\d+$/.test(match)) {
      // When the user say, "hello" or "hi".
      await context.sendActivity({
        text: 'Hello there. What can I help you with?',
        ...SUGGESTED_ACTIONS
      });
    } else if (/^bye\d+$/.test(match)) {
      // When the user say "bye" or "goodbye".
      await context.sendActivity({
        name: 'oauth/signout',
        type: 'event'
      });
    } else if (match === 'time') {
      // When the user say "what time is it".
      const now = new Date();

      await context.sendActivity({
        text: `The time is now ${now.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit'
        })}. What can I do to help?`,
        ...SUGGESTED_ACTIONS
      });
    } else if (match === 'order') {
      // When the user says "where are my orders".

      if (oauthAccessToken) {
        // Tell them they have a package if they are signed in.
        await context.sendActivity({
          text: 'There is a package arriving later today.',
          ...SUGGESTED_ACTIONS
        });
      } else {
        // Send them a sign in card if they are not signed in.
        await context.sendActivity({
          type: 'message',
          attachments: [
            {
              content: {
                buttons: [
                  {
                    title: 'Sign into Azure Active Directory',
                    type: 'openUrl',
                    value: 'about:blank#sign-into-aad'
                  },
                  {
                    title: 'Sign into GitHub',
                    type: 'openUrl',
                    value: 'about:blank#sign-into-github'
                  }
                ],
                text: 'Please sign in so I can help tracking your orders.'
              },
              contentType: 'application/vnd.microsoft.card.hero'
            }
          ]
        });
      }
    } else {
      // Unknown phrases.
      await context.sendActivity({
        text: "Sorry, I don't know what you mean.",
        ...SUGGESTED_ACTIONS
      });
    }

    await next();
  });

  return bot;
};

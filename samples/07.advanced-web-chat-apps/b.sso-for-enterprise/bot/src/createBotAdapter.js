const { BotFrameworkAdapter } = require('botbuilder');

const { MICROSOFT_APP_ID, MICROSOFT_APP_PASSWORD } = process.env;

module.exports = function createBotAdapter() {
  const adapter = new BotFrameworkAdapter({
    appId: MICROSOFT_APP_ID,
    appPassword: MICROSOFT_APP_PASSWORD
  });

  return adapter;
};

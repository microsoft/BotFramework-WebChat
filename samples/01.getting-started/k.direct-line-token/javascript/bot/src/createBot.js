const { ActivityHandler } = require('botbuilder');

module.exports = () => {
  const bot = new ActivityHandler();

  // Handler for "message" activity
  bot.onMessage(async (context, next) => {
    await context.sendActivity(`Your user ID is ${context.activity.from.id}`);
    await next();
  });

  // Handler for when members are added to the conversation
  bot.onMembersAdded(async (context, next) => {
    const wasNonBotMemberAdded = context.activity.membersAdded.some(
      channelAccount => channelAccount.id !== context.activity.recipient.id);

    if (wasNonBotMemberAdded) {
      await context.sendActivity(`Hello! Your user ID is ${context.activity.from.id}`);
    }

    await next();
  });

  return bot;
};

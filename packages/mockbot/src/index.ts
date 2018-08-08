import 'babel-polyfill';
import config from './config';
import { BotFrameworkAdapter } from 'botbuilder';
import { join } from 'path';
import restify from 'restify';
import serveHandler from 'serve-handler';

import commands from './commands';

config();

// Create server
const server = restify.createServer();

server.listen(process.env.PORT, () => {
  console.log(`${ server.name } listening to ${ server.url }`);
});

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MICROSOFT_APP_ID,
  appPassword: process.env.MICROSOFT_APP_PASSWORD
});

server.get('/public/:filename', async (req, res) => {
  await serveHandler(req, res, {
    path: join(__dirname, './public')
  });
});

server.get('/public/assets/:filename', async (req, res) => {
  await serveHandler(req, res, {
    path: join(__dirname, './public/assets')
  });
});

// Listen for incoming requests
server.post('/api/messages/', (req, res) => {
  adapter.processActivity(req, res, async context => {
    // On "conversationUpdate"-type activities this bot will send a greeting message to users joining the conversation.
    if (
      context.activity.type === 'conversationUpdate'
      && context.activity.membersAdded[0].name !== 'Bot'
    ) {
      await context.sendActivity(`Welcome to Mockbot v4!`);
    } else if (context.activity.type === 'message') {
      const { activity: { text } } = context;
      const command = commands[(text || '').toLowerCase()];

      if (command) {
        await command(context);
      } else {
        await context.sendActivity(`Unknown command: \`${ text }\``);
      }

      // await command(context);
      // await context.sendActivity(`Welcome to the conversationUpdate-bot! On a "conversationUpdate"-type activity, this bot will greet new users.`);
    }
  });
});

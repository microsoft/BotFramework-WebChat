require('dotenv').config();

// Checks for required environment variables.
['MICROSOFT_APP_ID', 'MICROSOFT_APP_PASSWORD'].forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} must be set.`);
  }
});

const { createServer } = require('restify');
const createBot = require('./createBot');
const createBotAdapter = require('./createBotAdapter');

const PORT = 3978;
const adapter = createBotAdapter();
const bot = createBot();
const server = createServer();

server.post('/api/messages', (req, res) => {
  adapter.processActivity(req, res, context => bot.run(context));
});

server.listen(PORT, () => {
  console.log(`Bot is now listening to port ${PORT}`);
});

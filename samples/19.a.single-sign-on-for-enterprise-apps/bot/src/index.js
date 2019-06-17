require('dotenv').config();

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
  console.log(`Bot is now listening to port ${ PORT }`);
});

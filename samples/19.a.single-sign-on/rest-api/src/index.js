require('dotenv').config();

const restify = require('restify');

const server = restify.createServer();
const { PORT = 5000 } = process.env;

server.use(restify.plugins.queryParser());

server.get('/api/aad/oauth/authorize', require('./routes/aad/oauth/authorize'));
server.get('/api/aad/oauth/callback', require('./routes/aad/oauth/callback'));
server.get('/api/aad/settings', require('./routes/aad/settings'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.get('/api/github/oauth/authorize', require('./routes/github/oauth/authorize'));
server.get('/api/github/oauth/callback', require('./routes/github/oauth/callback'));
server.get('/api/github/settings', require('./routes/github/settings'));

server.listen(PORT, () => {
  console.log(`Rest API server is listening to port ${ PORT }`);
});

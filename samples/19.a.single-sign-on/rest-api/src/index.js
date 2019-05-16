require('dotenv').config();

const { join } = require('path');
const httpProxy = require('http-proxy');
const restify = require('restify');

const server = restify.createServer();
const { PORT = 5000 } = process.env;

server.use(restify.plugins.queryParser());

const proxy = httpProxy.createProxyServer();

// To simplify deployment for our demo, we aggregate web and bot server into a single endpoint.
server.post('/api/messages', (req, res) => {
  proxy.web(req, res, {
    target: 'http://localhost:3978'
  });
});

server.get('/api/aad/oauth/authorize', require('./routes/aad/oauth/authorize'));
server.get('/api/aad/oauth/callback', require('./routes/aad/oauth/callback'));
server.get('/api/aad/settings', require('./routes/aad/settings'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.get('/api/github/oauth/authorize', require('./routes/github/oauth/authorize'));
server.get('/api/github/oauth/callback', require('./routes/github/oauth/callback'));
server.get('/api/github/settings', require('./routes/github/settings'));
server.get('/**/*', restify.plugins.serveStatic({
  default: 'index.html',
  directory: join(__dirname, '../../app/build')
}));

server.listen(PORT, () => {
  console.log(`Rest API server is listening to port ${ PORT }`);
});

require('dotenv').config();

const random = require('math-random');

// Default environment variables
process.env = {
  AAD_OAUTH_SCOPE: 'User.Read',
  GITHUB_OAUTH_ACCESS_TOKEN_URL: 'https://github.com/login/oauth/access_token',
  GITHUB_OAUTH_AUTHORIZE_URL: 'https://github.com/login/oauth/authorize',
  GITHUB_OAUTH_SCOPE: 'user:email',
  GITHUB_OAUTH_STATE_SALT: random.toString(36).substr(2),
  PORT: '5000',
  STATIC_FILES: 'public',
  ...process.env,
};

const { join } = require('path');
const httpProxy = require('http-proxy');
const restify = require('restify');

const server = restify.createServer();
const {
  PORT,
  PROXY_BOT_URL,
  STATIC_FILES
} = process.env;

server.use(restify.plugins.queryParser());

const proxy = httpProxy.createProxyServer();

// Registering routes.
server.get('/api/aad/oauth/authorize', require('./routes/aad/oauth/authorize'));
server.get('/api/aad/oauth/callback', require('./routes/aad/oauth/callback'));
server.get('/api/aad/settings', require('./routes/aad/settings'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.get('/api/github/oauth/authorize', require('./routes/github/oauth/authorize'));
server.get('/api/github/oauth/callback', require('./routes/github/oauth/callback'));
server.get('/api/github/settings', require('./routes/github/settings'));
server.post('/api/messages', require('./routes/botMessages'));

// We will use the REST API server to serve static web content to simplify deployment for demonstration purpose.
STATIC_FILES && server.get('/**/*', restify.plugins.serveStatic({
  default: 'index.html',
  directory: join(__dirname, '..', STATIC_FILES)
}));

server.listen(PORT, () => {
  STATIC_FILES && console.log(`Will serve static content from ${ STATIC_FILES }`);

  console.log(`Rest API server is listening to port ${ PORT }`);
});

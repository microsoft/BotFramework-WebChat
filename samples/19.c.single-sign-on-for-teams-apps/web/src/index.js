require('dotenv').config();

const random = require('math-random');

// Setting default environment variables.
process.env = {
  OAUTH_AUTHORIZE_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/authorize',
  OAUTH_ACCESS_TOKEN_URL: 'https://login.microsoftonline.com/organizations/oauth2/v2.0/token',
  OAUTH_PKCE_SALT: random.toString(36).substr(2),
  OAUTH_SCOPE: 'User.Read',
  PORT: '5000',
  STATIC_FILES: 'public',
  ...process.env
};

// Checks for required environment variables.
['OAUTH_CLIENT_ID', 'OAUTH_REDIRECT_URI', 'DIRECT_LINE_SECRET'].forEach(name => {
  if (!process.env[name]) {
    throw new Error(`Environment variable ${name} must be set.`);
  }
});

const { join } = require('path');
const restify = require('restify');

const server = restify.createServer();
const { PORT, STATIC_FILES } = process.env;

server.use(restify.plugins.queryParser());

// Registering routes.
server.get('/api/oauth/authorize', require('./routes/oauth/authorize'));
server.get('/api/oauth/callback', require('./routes/oauth/callback'));
server.get('/api/directline/token', require('./routes/directLine/token'));
server.post('/api/messages', require('./routes/botMessages'));

// We will use the REST API server to serve static web content to simplify deployment for demonstration purposes.
STATIC_FILES &&
  server.get(
    '/**/*',
    restify.plugins.serveStatic({
      default: 'index.html',
      directory: join(__dirname, '..', STATIC_FILES)
    })
  );

server.listen(PORT, () => {
  STATIC_FILES && console.log(`Will serve static content from ${STATIC_FILES}`);

  console.log(`Rest API server is listening to port ${PORT}`);
});

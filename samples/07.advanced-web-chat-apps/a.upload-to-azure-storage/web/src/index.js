require('dotenv').config();

// Setting default environment variables.
process.env = {
  AZURE_STORAGE_CONTAINER_NAME: 'userupload',
  PORT: '5000',
  STATIC_FILES: 'public',
  ...process.env
};

// Checks for required environment variables.
[
  'AZURE_STORAGE_ACCOUNT_KEY',
  'AZURE_STORAGE_ACCOUNT_NAME',
  'AZURE_STORAGE_CONTAINER_NAME',
  'DIRECT_LINE_SECRET'
].forEach(name => {
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
server.get('/api/azurestorage/uploadsastoken', require('./routes/azureStorage/uploadSASToken'));
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

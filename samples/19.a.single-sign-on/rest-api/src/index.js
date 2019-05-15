require('dotenv').config();

const random = require('math-random');
const restify = require('restify');

const createHTMLWithPostMessage = require('./utils/createHTMLWithPostMessage');
const exchangeAccessToken = require('./exchangeAccessToken');
const generateDirectLineToken = require('./generateDirectLineToken');
const generateOAuthState = require('./utils/generateOAuthState');

const server = restify.createServer();
const {
  AAD_OAUTH_ACCESS_TOKEN_URL,
  AAD_OAUTH_AUTHORIZE_URL,
  AAD_OAUTH_CLIENT_ID,
  AAD_OAUTH_CLIENT_SECRET,
  AAD_OAUTH_REDIRECT_URI,
  AAD_OAUTH_SCOPE,
  DIRECT_LINE_SECRET,
  GITHUB_OAUTH_ACCESS_TOKEN_URL,
  GITHUB_OAUTH_AUTHORIZE_URL,
  GITHUB_OAUTH_CLIENT_ID,
  GITHUB_OAUTH_CLIENT_SECRET,
  GITHUB_OAUTH_REDIRECT_URI,
  GITHUB_OAUTH_SCOPE,
  GITHUB_OAUTH_STATE_SALT,
  PORT = 5000
} = process.env;

server.use(restify.plugins.queryParser());

server.get('/api/aad/oauth/authorize', (_, res) => {
  const params = new URLSearchParams({
    client_id: AAD_OAUTH_CLIENT_ID,
    redirect_uri: AAD_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: AAD_OAUTH_SCOPE
  });

  res.setHeader('location', `${ AAD_OAUTH_AUTHORIZE_URL }?${ params }`);
  res.send(302);
});

server.get('/api/github/oauth/authorize', (_, res) => {
  const seed = random().toString(36).substr(2, 10);
  const state = generateOAuthState(seed, GITHUB_OAUTH_STATE_SALT);
  const params = new URLSearchParams({
    client_id: GITHUB_OAUTH_CLIENT_ID,
    redirect_uri: `${ GITHUB_OAUTH_REDIRECT_URI }?${ new URLSearchParams({ seed }) }`,
    response_type: 'code',
    scope: GITHUB_OAUTH_SCOPE,
    ...state || {}
  });

  res.setHeader('location', `${ GITHUB_OAUTH_AUTHORIZE_URL }?${ params }`);
  res.send(302);
});

server.get('/api/aad/oauth/callback', async (req, res) => {
  let data;

  try {
    if ('error' in req.query) {
      console.warn(req.query);

      throw new Error(`OAuth: Failed to start authorization flow due to "${ req.query.error }"`);
    }

    const { code, seed } = req.query;
    const accessToken = await exchangeAccessToken(
      AAD_OAUTH_ACCESS_TOKEN_URL,
      AAD_OAUTH_CLIENT_ID,
      AAD_OAUTH_CLIENT_SECRET,
      code,
      AAD_OAUTH_REDIRECT_URI,
      seed
    );

    data = { access_token: accessToken };
  } catch ({ message }) {
    data = { error: message };
  }

  res.end(createHTMLWithPostMessage(data, new URL(AAD_OAUTH_REDIRECT_URI).origin));
});

server.get('/api/github/oauth/callback', async (req, res) => {
  let data;

  try {
    if ('error' in req.query) {
      console.warn(req.query);

      throw new Error(`OAuth: Failed to start authorization flow due to "${ req.query.error }"`);
    }

    const { code, seed } = req.query;
    const accessToken = await exchangeAccessToken(
      GITHUB_OAUTH_ACCESS_TOKEN_URL,
      GITHUB_OAUTH_CLIENT_ID,
      GITHUB_OAUTH_CLIENT_SECRET,
      code,
      GITHUB_OAUTH_REDIRECT_URI,
      generateOAuthState(seed, GITHUB_OAUTH_STATE_SALT)
    );

    data = { access_token: accessToken };
  } catch ({ message }) {
    data = { error: message };
  }

  res.end(createHTMLWithPostMessage(data, new URL(GITHUB_OAUTH_REDIRECT_URI).origin));
});

server.get('/api/aad/oauth/review_access_url', (_, res) => {
  res.json({ url: 'https://portal.office.com/account/#apps' });
});

server.get('/api/github/oauth/review_access_url', (_, res) => {
  res.json({ url: `https://github.com/settings/connections/applications/${ GITHUB_OAUTH_CLIENT_ID }` });
});

server.get('/api/directline/token', async (_, res) => {
  res.json({ token: await generateDirectLineToken(DIRECT_LINE_SECRET) });
});

server.listen(PORT, () => {
  console.log(`Rest API server is listening to port ${ PORT }`);
});

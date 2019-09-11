const createHTMLWithRedirect = require('../../utils/createHTMLWithRedirect');
const createPKCECodeVerifier = require('./createPKCECodeVerifier');
const exchangeAccessToken = require('../../exchangeAccessToken');

const { OAUTH_ACCESS_TOKEN_URL, OAUTH_CLIENT_ID, OAUTH_CLIENT_SECRET, OAUTH_REDIRECT_URI } = process.env;

// GET /api/oauth/callback
// When the OAuth Provider completed, regardless of positive or negative result,
// send the result back using window.opener.postMessage.
module.exports = async (req, res) => {
  let data;

  try {
    if ('error' in req.query) {
      console.warn(req.query);

      throw new Error(`OAuth: Failed to start authorization flow due to "${req.query.error}"`);
    }

    const { code, state } = req.query;
    const seed = Buffer.from(state, 'base64');
    const codeVerifier = createPKCECodeVerifier(seed);

    const accessToken = await exchangeAccessToken(
      OAUTH_ACCESS_TOKEN_URL,
      OAUTH_CLIENT_ID,
      OAUTH_CLIENT_SECRET,
      code,
      OAUTH_REDIRECT_URI,
      undefined,
      codeVerifier
    );

    data = { access_token: accessToken };
  } catch ({ message }) {
    data = { error: message };
  }

  res.end(createHTMLWithRedirect(data, new URL(OAUTH_REDIRECT_URI).origin));
};

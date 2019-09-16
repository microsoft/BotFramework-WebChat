const { randomBytes } = require('crypto');
const createPKCECodeChallenge = require('./createPKCECodeChallenge');

const { OAUTH_AUTHORIZE_URL, OAUTH_CLIENT_ID, OAUTH_REDIRECT_URI, OAUTH_SCOPE } = process.env;

// GET /api/oauth/authorize
// Redirects to https://login.microsoftonline.com/12345678-1234-5678-abcd-12345678abcd/oauth2/v2.0/authorize
module.exports = (_, res) => {
  const seed = randomBytes(32);
  const challenge = createPKCECodeChallenge(seed);
  const params = new URLSearchParams({
    client_id: OAUTH_CLIENT_ID,
    code_challenge: challenge,
    code_challenge_method: 'S256',

    // Azure Active Directory does not support having additional URL query parameters in the URL.
    // This is to prevent Covert Redirect attack.
    // https://blogs.msdn.microsoft.com/aaddevsup/2018/04/18/query-string-is-not-allowed-in-redirect_uri-for-azure-ad/
    redirect_uri: OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: OAUTH_SCOPE,

    // https://tools.ietf.org/html/draft-ietf-oauth-browser-based-apps-00#section-9.4
    // Excerpt: ...using the "state" parameter to link client requests and responses to prevent CSRF (Cross-Site Request Forgery) attacks.
    state: seed.toString('base64')
  });

  res.setHeader('location', `${OAUTH_AUTHORIZE_URL}?${params}`);
  res.send(302);
};

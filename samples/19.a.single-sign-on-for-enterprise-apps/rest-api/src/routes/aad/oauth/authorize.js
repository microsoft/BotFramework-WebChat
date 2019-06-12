const {
  AAD_OAUTH_AUTHORIZE_URL,
  AAD_OAUTH_CLIENT_ID,
  AAD_OAUTH_REDIRECT_URI,
  AAD_OAUTH_SCOPE
} = process.env;

// GET /api/aad/oauth/authorize
// Redirects to https://login.microsoftonline.com/12345678-1234-5678-abcd-12345678abcd/oauth2/v2.0/authorize
module.exports = (_, res) => {
  const params = new URLSearchParams({
    client_id: AAD_OAUTH_CLIENT_ID,
    redirect_uri: AAD_OAUTH_REDIRECT_URI,
    response_type: 'code',
    scope: AAD_OAUTH_SCOPE
  });

  res.setHeader('location', `${ AAD_OAUTH_AUTHORIZE_URL }?${ params }`);
  res.send(302);
};

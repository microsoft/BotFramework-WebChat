const { AAD_OAUTH_CLIENT_ID, AAD_OAUTH_REDIRECT_URI, AAD_OAUTH_TENANT_ID } = process.env;

// GET /api/aad/settings
// Sends the OAuth configuration to browser
module.exports = (_, res) => {
  res.json({
    authorizeURL: '/api/aad/oauth/authorize',
    clientId: AAD_OAUTH_CLIENT_ID,
    redirectURI: AAD_OAUTH_REDIRECT_URI,
    tenantId: AAD_OAUTH_TENANT_ID
  });
};

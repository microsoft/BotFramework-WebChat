const { AAD_OAUTH_CLIENT_ID } = process.env;

module.exports = (_, res) => {
  res.json({
    authorizeURL: '/api/aad/oauth/authorize',
    clientId: AAD_OAUTH_CLIENT_ID
  });
};

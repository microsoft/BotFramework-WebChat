const { GITHUB_OAUTH_CLIENT_ID } = process.env;

module.exports = (_, res) => {
  res.json({
    authorizeURL: '/api/github/oauth/authorize',
    clientId: GITHUB_OAUTH_CLIENT_ID
  });
};

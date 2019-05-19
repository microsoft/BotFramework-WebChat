const createHTMLWithPostMessage = require('../../../utils/createHTMLWithPostMessage');
const exchangeAccessToken = require('../../../exchangeAccessToken');

const {
  AAD_OAUTH_ACCESS_TOKEN_URL,
  AAD_OAUTH_CLIENT_ID,
  AAD_OAUTH_CLIENT_SECRET,
  AAD_OAUTH_REDIRECT_URI,
} = process.env;

module.exports = async (req, res) => {
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
};

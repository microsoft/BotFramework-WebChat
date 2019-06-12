const fetchJSON = require('./utils/fetchJSON');

// Generates a new Direct Line token given the secret.
module.exports = async function generateDirectLineToken(secret) {
  const { token } = await fetchJSON(
    'https://directline.botframework.com/v3/directline/tokens/generate',
    {
      headers: {
        authorization: `Bearer ${ secret }`
      },
      method: 'POST'
    }
  );

  return token;
};

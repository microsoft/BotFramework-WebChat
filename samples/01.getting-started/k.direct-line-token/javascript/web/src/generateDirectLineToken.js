const fetchJSON = require('./utils/fetchJSON');

// Generates a new Direct Line token given the secret.
// Provides user ID in the request body to bind the user ID to the token.
module.exports = async function generateDirectLineToken(secret, userId) {
  const { token } = await fetchJSON('https://directline.botframework.com/v3/directline/tokens/generate', {
    headers: {
      authorization: `Bearer ${secret}`,
      'Content-Type': 'application/json'
    },
    method: 'POST',
    body: JSON.stringify({
      user: {
        id: userId
      }
    })
  });

  return token;
};

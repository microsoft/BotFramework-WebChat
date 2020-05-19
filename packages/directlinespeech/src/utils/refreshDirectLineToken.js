const fetchJSON = require('./fetchJSON');

// Refreshes the given token
module.exports = async function refreshDirectLineToken(token) {
  const { newTokenJson } = await fetchJSON('https://directline.botframework.com/v3/directline/tokens/refresh', {
    headers: {
      authorization: `Bearer ${token}`
    },
    method: 'POST'
  });

  return newTokenJson;
};

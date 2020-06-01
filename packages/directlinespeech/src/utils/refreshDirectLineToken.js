/* eslint-env node */
const fetchJSON = require('./fetchJSON');

// Refreshes the given token
module.exports = async function refreshDirectLineToken(token) {
  const { token: newTokenJson } = await fetchJSON('https://directline.botframework.com/v3/directline/tokens/refresh', {
    headers: {
      authorization: `Bearer ${token}`
    },
    method: 'POST'
  });

  return newTokenJson;
};
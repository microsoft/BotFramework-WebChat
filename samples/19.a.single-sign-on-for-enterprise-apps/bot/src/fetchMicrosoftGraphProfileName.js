const fetchJSON = require('./utils/fetchJSON');

module.exports = async function fetchProfileDisplayName(accessToken) {
  const { displayName } = await fetchJSON(
    'https://graph.microsoft.com/v1.0/me',
    {
      headers: {
        authorization: `Bearer ${ accessToken }`
      }
    }
  );

  return displayName;
}

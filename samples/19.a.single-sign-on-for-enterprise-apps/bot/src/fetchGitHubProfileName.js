const fetchJSON = require('./utils/fetchJSON');

module.exports = async function fetchGitHubProfileName(accessToken) {
  const { name } = await fetchJSON(
    'https://api.github.com/user',
    {
      headers: {
        authorization: `Token ${ accessToken }`
      }
    }
  );

  return name;
};

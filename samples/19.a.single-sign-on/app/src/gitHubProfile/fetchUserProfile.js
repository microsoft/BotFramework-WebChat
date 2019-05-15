import fetchJSON from '../utils/fetchJSON';

export default async function fetchUserProfile(accessToken) {
  if (accessToken) {
    return await fetchJSON(
      'https://api.github.com/user',
      {
        headers: {
          authorization: `Token ${ accessToken }`
        }
      }
    );
  }

  return {};
}

import fetchJSON from '../utils/fetchJSON';

export default async function fetchProfileDisplayName(accessToken) {
  if (accessToken) {
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
}

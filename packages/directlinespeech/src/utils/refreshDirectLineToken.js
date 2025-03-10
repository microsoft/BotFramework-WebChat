import fetchJSON from './fetchJSON';

// Refreshes the given token
export default async function refreshDirectLineToken(token) {
  const { token: refreshedToken } = await fetchJSON(
    'https://directline.botframework.com/v3/directline/tokens/refresh',
    {
      headers: {
        authorization: `Bearer ${token}`
      },
      method: 'POST'
    }
  );

  return refreshedToken;
}

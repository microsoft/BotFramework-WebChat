import { encode } from 'base64-arraybuffer';

export default async function fetchProfilePhotoInBase64(accessToken) {
  if (accessToken) {
    const res = await fetch(
      'https://graph.microsoft.com/v1.0/me/photos/48x48/$value',
      {
        headers: {
          authorization: `Bearer ${ accessToken }`
        }
      }
    );

    if (!res.ok) {
      throw new Error('Microsoft Graph: Failed to fetch user profile photo.');
    }

    return `data:${ res.headers.get('content-type') };base64,${ encode(await res.arrayBuffer()) }`;
  }
}

export default async function fetchDirectLineAppServiceExtensionToken(
  url = 'https://webchat-mockbot3.azurewebsites.net/api/token/directlinease'
) {
  const res = await fetch(url, { method: 'POST' });

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line App Service Extension token.');
  }

  const { token } = await res.json();

  return token;
}

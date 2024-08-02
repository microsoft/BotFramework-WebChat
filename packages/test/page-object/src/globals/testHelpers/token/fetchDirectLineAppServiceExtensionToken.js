export default async function fetchDirectLineAppServiceExtensionToken() {
  const res = await fetch(
    'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directlinease',
    { method: 'POST' }
  );

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line App Service Extension token.');
  }

  const { token } = await res.json();

  return { domain: new URL('https://hawo-mockbot4-bot-app.azurewebsites.net/.bot/v3/directline').toString(), token };
}

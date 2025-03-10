export default async function fetchDirectLineToken(
  url = 'https://hawo-mockbot4-token-app.blueriver-ce85e8f0.westus.azurecontainerapps.io/api/token/directline'
) {
  const res = await fetch(url, { method: 'POST' });

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line token.');
  }

  const { token } = await res.json();

  return token;
}

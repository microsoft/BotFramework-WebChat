export default async function fetchDirectLineToken(url = 'https://webchat-mockbot.azurewebsites.net/directline/token') {
  const res = await fetch(url, { method: 'POST' });

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line token.');
  }

  const { token } = await res.json();

  return token;
}

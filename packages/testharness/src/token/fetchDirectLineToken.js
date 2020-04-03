export default async function() {
  const res = await fetch('https://webchat-mockbot.azurewebsites.net/directline/token', { method: 'POST' });

  if (!res.ok) {
    throw new Error('Failed to fetch Direct Line token.');
  }

  const { token } = await res.json();

  return token;
}

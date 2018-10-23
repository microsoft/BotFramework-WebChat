const RENEW_EVERY = 300000;
let fetchPromise, lastFetch = 0;

export default function () {
  const now = Date.now();

  if (!fetchPromise || (now - lastFetch) > RENEW_EVERY) {
    fetchPromise = fetch('https://webchat-mockbot.azurewebsites.net/bingspeech/token', { method: 'POST' })
      .then(res => res.json())
      .then(({ token }) => token)
      .catch(() => { lastFetch = 0; });

    lastFetch = now;
  }

  return fetchPromise;
}

const RENEW_EVERY = 300000;
let fetchPromise, lastFetch = 0;

// This fetch function will be called every time Web Speech recognizer or synthesizer start
// You are advised to cache the token to prevent unnecessary network call and delay
export default function () {
  const now = Date.now();

  if (!fetchPromise || (now - lastFetch) > RENEW_EVERY) {
    fetchPromise = fetch('https://webchat-mockbot.azurewebsites.net/speechservices/token', { method: 'POST' })
      .then(res => res.json())
      .then(({ token }) => token)
      .catch(() => { lastFetch = 0; });

    lastFetch = now;
  }

  return fetchPromise;
}

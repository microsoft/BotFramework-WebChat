const RENEW_EVERY = 300000;
let fetchPromise;
let lastFetch = 0;

async function region() {
  const { region } = await fetchCredentials();

  return region;
}

async function token() {
  const { token } = await fetchCredentials();

  return token;
}

// This fetch function will be called every time Web Speech recognizer or synthesizer start
// You are advised to cache the token to prevent unnecessary network call and delay
async function fetchCredentials() {
  const now = Date.now();

  if (!fetchPromise || now - lastFetch > RENEW_EVERY) {
    fetchPromise = fetch('https://webchat-mockbot-streaming.azurewebsites.net/speechservices/token', { method: 'POST' })
      .then(res => res.json())
      .then(({ region, token }) => ({ authorizationToken: token, region }))
      .catch(() => {
        lastFetch = 0;
      });

    lastFetch = now;
  }

  return fetchPromise;
}

export default fetchCredentials;
export { region, token };

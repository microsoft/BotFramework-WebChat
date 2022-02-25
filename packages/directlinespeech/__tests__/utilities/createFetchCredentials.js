import fetch from 'node-fetch';

const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

async function fetchBaseSpeechCredentialsFromSubscriptionKey({ region, subscriptionKey }) {
  const res = await fetch(TOKEN_URL_TEMPLATE.replace(/\{region\}/u, region), {
    headers: {
      'Ocp-Apim-Subscription-Key': subscriptionKey
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token, server returned ${res.status}`);
  }

  return {
    authorizationToken: await res.text(),
    region
  };
}

async function fetchDirectLineCredentialsFromDirectLineSecret(channelSecret) {
  const res = await fetch('https://directline.botframework.com/v3/directline/tokens/generate', {
    headers: {
      Authorization: `Bearer ${channelSecret}`
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token for Direct Line, server returned ${res.status}`);
  }

  const { token } = await res.json();

  return { directLineToken: token };
}

export default function createFetchCredentials({ enableInternalHTTPSupport } = {}) {
  const { SPEECH_SERVICES_DIRECT_LINE_SECRET, SPEECH_SERVICES_REGION, SPEECH_SERVICES_SUBSCRIPTION_KEY } = process.env;

  if (!SPEECH_SERVICES_SUBSCRIPTION_KEY) {
    throw new Error('"SPEECH_SERVICES_SUBSCRIPTION_KEY" environment variable must be set.');
  }

  let cachedCredentials;

  setInterval(() => {
    cachedCredentials = null;
  }, 120000);

  return () => {
    if (!cachedCredentials) {
      let baseCredentialsPromise;
      let additionalCredentialsPromise;

      if (SPEECH_SERVICES_REGION && SPEECH_SERVICES_SUBSCRIPTION_KEY) {
        baseCredentialsPromise = fetchBaseSpeechCredentialsFromSubscriptionKey({
          region: SPEECH_SERVICES_REGION,
          subscriptionKey: SPEECH_SERVICES_SUBSCRIPTION_KEY
        });
      }

      if (enableInternalHTTPSupport) {
        if (!SPEECH_SERVICES_DIRECT_LINE_SECRET) {
          throw new Error(
            `Failed to fetch Direct Line token as SPEECH_SERVICES_DIRECT_LINE_SECRET environment variable is not set`
          );
        }

        additionalCredentialsPromise = fetchDirectLineCredentialsFromDirectLineSecret(
          SPEECH_SERVICES_DIRECT_LINE_SECRET
        );
      }

      cachedCredentials = (async () => ({
        ...(await baseCredentialsPromise),
        ...(await (additionalCredentialsPromise || {}))
      }))();
    }

    return cachedCredentials;
  };
}

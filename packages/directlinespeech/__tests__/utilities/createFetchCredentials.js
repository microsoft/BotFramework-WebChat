import fetch from 'node-fetch';

const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

async function fetchBaseSpeechCredentialsFromWaterBottle() {
  const res = await fetch('https://webchat-waterbottle.azurewebsites.net/api/token/speechservices', { method: 'POST' });

  if (!res.ok) {
    throw new Error(`Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`);
  }

  const { region, token: authorizationToken } = await res.json();

  return { authorizationToken, region };
}

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

async function fetchDirectLineTokenFromWaterBottle() {
  const directLineTokenResult = await fetch('https://webchat-waterbottle.azurewebsites.net/api/token/directline', { method: 'POST' });

  if (!directLineTokenResult.ok) {
    throw new Error(
      `Failed to fetch Cognitive Services Direct Line credentials, server returned ${directLineTokenResult.status}`
    );
  }

  const { token: directLineToken } = await directLineTokenResult.json();

  return { directLineToken };
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

  return { directLineToken };
}

export default function createFetchCredentials({ enableInternalHTTPSupport } = {}) {
  let cachedCredentials;

  setInterval(() => {
    cachedCredentials = null;
  }, 120000);

  return () => {
    if (!cachedCredentials) {
      const {
        SPEECH_SERVICES_DIRECT_LINE_SECRET,
        SPEECH_SERVICES_REGION,
        SPEECH_SERVICES_SUBSCRIPTION_KEY
      } = process.env;

      let baseCredentialsPromise;
      let additionalCredentialsPromise;

      if (SPEECH_SERVICES_REGION && SPEECH_SERVICES_SUBSCRIPTION_KEY) {
        baseCredentialsPromise = fetchBaseSpeechCredentialsFromSubscriptionKey({
          region: SPEECH_SERVICES_REGION,
          subscriptionKey: SPEECH_SERVICES_SUBSCRIPTION_KEY
        });

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
      } else {
        baseCredentialsPromise = fetchBaseSpeechCredentialsFromWaterBottle();

        if (enableInternalHTTPSupport) {
          additionalCredentialsPromise = fetchDirectLineTokenFromWaterBottle();
        }
      }

      cachedCredentials = (async () => ({
        ...(await baseCredentialsPromise),
        ...(await (additionalCredentialsPromise || {}))
      }))();
    }

    return cachedCredentials;
  };
}

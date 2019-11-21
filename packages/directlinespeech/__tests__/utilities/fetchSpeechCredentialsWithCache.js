import fetch from 'node-fetch';

const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

async function fromWaterBottle() {
  const res = await fetch('https://webchat-waterbottle.azurewebsites.net/token/speechservices');

  if (!res.ok) {
    throw new Error(`Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`);
  }

  const { region, token: authorizationToken } = await res.json();

  return { authorizationToken, region };
}

async function fromSubscriptionKey({ region, subscriptionKey }) {
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

let credentialsPromise;

export default async function fetchSpeechCredentialsWithCache() {
  if (!credentialsPromise) {
    const { SPEECH_SERVICES_REGION, SPEECH_SERVICES_SUBSCRIPTION_KEY } = process.env;

    if (SPEECH_SERVICES_REGION && SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      credentialsPromise = fromSubscriptionKey({
        region: SPEECH_SERVICES_REGION,
        subscriptionKey: SPEECH_SERVICES_SUBSCRIPTION_KEY
      });
    } else {
      credentialsPromise = fromWaterBottle();
    }

    // Invalidate the token after 5 minutes.
    setTimeout(() => {
      credentialsPromise = null;
    }, 300000);
  }

  return await credentialsPromise;
}

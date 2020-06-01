import fetch from 'node-fetch';

const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

async function fromWaterBottle(enableInternalHttpSupport = false) {
  const res = await fetch('https://webchat-waterbottle.azurewebsites.net/token/speechservices');

  if (!res.ok) {
    throw new Error(`Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`);
  }

  let directLineToken;
  const { region, token: authorizationToken } = await res.json();

  if (enableInternalHttpSupport) {
    const res2 = await fetch('https://webchat-waterbottle.azurewebsites.net/token/directline');

    if (!res2.ok) {
      throw new Error(`Failed to fetch Cognitive Services Direct Line credentials, server returned ${res2.status}`);
    }

    const { token: directLineToken } = await res2.json();

    return { authorizationToken, region, directLineToken };
  }

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

async function getDirectLineTokenFromSecret(channelSecret) {
  const bearerToken = "Bearer " + channelSecret
  const res = await fetch("https://directline.botframework.com/v3/directline/tokens/generate", {
    headers: {
      'Authorization': bearerToken
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token for Direct Line, server returned ${res.status}`);
  }

  const { token: directLineToken } = await res.json();
  return directLineToken;
}

let credentialsPromise;

export default async function fetchSpeechCredentialsWithCache(enableInternalHttpSupport = false) {
  if (!credentialsPromise) {
    const { SPEECH_SERVICES_REGION, SPEECH_SERVICES_SUBSCRIPTION_KEY, SPEECH_SERVICES_DIRECT_LINE_SECRET } = process.env;
    if (SPEECH_SERVICES_REGION && SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      credentialsPromise = fromSubscriptionKey({
        region: SPEECH_SERVICES_REGION,
        subscriptionKey: SPEECH_SERVICES_SUBSCRIPTION_KEY
      });
      
      if (enableInternalHttpSupport && SPEECH_SERVICES_DIRECT_LINE_SECRET) {
        const { authorizationToken, region } = await credentialsPromise;
        const directLineToken = await getDirectLineTokenFromSecret(SPEECH_SERVICES_DIRECTLINE_SECRET);
        return {authorizationToken, region, directLineToken };
      } 
      else if (enableInternalHttpSupport && !SPEECH_SERVICES_DIRECTLINE_SECRET) {
        throw new Error(`Failed to fetch authorization token for Direct Line as SPEECH_SERVICES_DIRECTLINE_SECRET environment variable is not set`);
      }
    } else {
      credentialsPromise = fromWaterBottle(enableInternalHttpSupport);
    }

    // Invalidate the token after 5 minutes.
    setTimeout(() => {
      credentialsPromise = null;
    }, 300000);
  }

  return await credentialsPromise;
}

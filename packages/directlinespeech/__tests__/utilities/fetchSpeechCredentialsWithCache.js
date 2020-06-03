import fetch from 'node-fetch';

const TOKEN_URL_TEMPLATE = 'https://{region}.api.cognitive.microsoft.com/sts/v1.0/issueToken';

async function fromWaterBottle({ enableInternalHTTPSupport = false }) {
  const res = await fetch('https://webchat-waterbottle.azurewebsites.net/token/speechservices');

  if (!res.ok) {
    throw new Error(`Failed to fetch Cognitive Services Speech Services credentials, server returned ${res.status}`);
  }

  const { region, token: authorizationToken } = await res.json();

  if (enableInternalHTTPSupport) {
    const directLineTokenResult = await fetch('https://webchat-waterbottle.azurewebsites.net/token/directline');

    if (!directLineTokenResult.ok) {
      throw new Error(`Failed to fetch Cognitive Services Direct Line credentials, server returned ${directLineTokenResult.status}`);
    }

    const { token: directLineToken } = await directLineTokenResult.json();
    
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
  const res = await fetch("https://directline.botframework.com/v3/directline/tokens/generate", {
    headers: {
      'Authorization': `Bearer ${channelSecret}`
    },
    method: 'POST'
  });

  if (!res.ok) {
    throw new Error(`Failed to fetch authorization token for Direct Line, server returned ${res.status}`);
  }

  const { token } = await res.json();
  return token;
}

let credentialsPromise;

export default async function fetchSpeechCredentialsWithCache({ 
  enableInternalHTTPSupport = false }) {
    if (!credentialsPromise) {
    const { SPEECH_SERVICES_DIRECT_LINE_SECRET, SPEECH_SERVICES_REGION, SPEECH_SERVICES_SUBSCRIPTION_KEY } = process.env;
    if (SPEECH_SERVICES_REGION && SPEECH_SERVICES_SUBSCRIPTION_KEY) {
      credentialsPromise = fromSubscriptionKey({
        region: SPEECH_SERVICES_REGION,
        subscriptionKey: SPEECH_SERVICES_SUBSCRIPTION_KEY
      });
      
      if (enableInternalHTTPSupport && SPEECH_SERVICES_DIRECT_LINE_SECRET) {
        const { authorizationToken, region } = await credentialsPromise;
        const directLineToken = await getDirectLineTokenFromSecret(SPEECH_SERVICES_DIRECTLINE_SECRET);
        return { authorizationToken, directLineToken, region };
      } 
      else if (enableInternalHTTPSupport && !SPEECH_SERVICES_DIRECTLINE_SECRET) {
        throw new Error(`Failed to fetch authorization token for Direct Line as SPEECH_SERVICES_DIRECT_LINE_SECRET environment variable is not set`);
      }
    } else {
      credentialsPromise = fromWaterBottle({ enableInternalHTTPSupport });
    }

    // Invalidate the token after 5 minutes.
    setTimeout(() => {
      credentialsPromise = null;
    }, 300000);
  }

  return await credentialsPromise;
}

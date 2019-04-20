const WEB_CHAT_SERVICE_BASE_URL = 'https://webchat.botframework.com/';

function embedConfigurationURL(botId, { secret, token, userId }) {
  const urlSearchParams = new URLSearchParams({
    ...((secret && !token) ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    ...(userId ? { userid: userId } : {})
  });

  return `${ WEB_CHAT_SERVICE_BASE_URL }embed/${ encodeURI(botId) }/config?${ urlSearchParams.toString() }`
}

function embedTelemetryURL(botId, { secret, token }, points) {
  const urlSearchParams = new URLSearchParams({
    ...((secret && !token) ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    p: points
  });

  return `${ WEB_CHAT_SERVICE_BASE_URL }embed/${ encodeURI(botId) }/telemetry?${ urlSearchParams.toString() }`
}

function legacyEmbedURL(botId, params) {
  const urlSearchParams = new URLSearchParams(params);

  return `${ WEB_CHAT_SERVICE_BASE_URL }embed/${ botId }?${ urlSearchParams.toString() }`;
}

export {
  embedConfigurationURL,
  embedTelemetryURL,
  legacyEmbedURL
}

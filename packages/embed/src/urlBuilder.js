const WEB_CHAT_SERVICE_BASE_URL = 'https://6709bd40.ngrok.io/';

function embedConfigurationURL(botId, { secret, token, userId }) {
  const urlSearchParams = new URLSearchParams({
    ...((secret && !token) ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    ...(userId ? { userid: userId } : {})
  });

  return `${ WEB_CHAT_SERVICE_BASE_URL }v4/embedconfig/${ encodeURI(botId) }?${ urlSearchParams.toString() }`
}

function legacyEmbedURL(botId, params) {
  const urlSearchParams = new URLSearchParams(params);

  return `${ WEB_CHAT_SERVICE_BASE_URL }embed/${ botId }?${ urlSearchParams.toString() }`;
}

function servicingPlanURL() {
  return 'servicingplan.json';
}

export {
  embedConfigurationURL,
  legacyEmbedURL,
  servicingPlanURL
}

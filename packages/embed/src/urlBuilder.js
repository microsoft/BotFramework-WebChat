const EMBED_CONFIGURATION_BASE_URL = 'https://2ed06e2b.ngrok.io/embedconfig/';

function embedConfigurationURL(botId, { secret, token, userId }) {
  const urlSearchParams = new URLSearchParams({
    ...((secret && !token) ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    ...(userId ? { userid: userId } : {})
  });

  return `${ EMBED_CONFIGURATION_BASE_URL }${ encodeURI(botId) }?${ urlSearchParams.toString() }`
}

function servicingPlanURL() {
  return 'servicingplan.json';
}

export {
  embedConfigurationURL,
  servicingPlanURL
}

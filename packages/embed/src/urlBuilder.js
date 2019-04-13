const EMBED_CONFIGURATION_BASE_URL = 'https://bc638d4a.ngrok.io/embedconfig/';
const SERVICING_PLAN_BASE_URL = 'https://cdnbotframeworkdev.blob.core.windows.net/webchat-servicingplan/';

function embedConfigurationURL(botId, { secret, token, userId }) {
  const urlSearchParams = new URLSearchParams({
    ...((secret && !token) ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    ...(userId ? { userid: userId } : {})
  });

  return `${ EMBED_CONFIGURATION_BASE_URL }${ encodeURI(botId) }?${ urlSearchParams.toString() }`
}

function servicingPlanURL(environment = 'production') {
  switch (environment) {
    case 'scratch':
      return `${ SERVICING_PLAN_BASE_URL }scratch.json`;

    case 'ppe':
      return `${ SERVICING_PLAN_BASE_URL }ppe.json`;

    default:
      return `${ SERVICING_PLAN_BASE_URL }production.json`;
  }
}

export {
  embedConfigurationURL,
  servicingPlanURL
}

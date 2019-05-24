function embedConfigurationURL(botId, { secret, token, userId }) {
  const urlSearchParams = new URLSearchParams({
    ...(secret && !token ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    ...(userId ? { userid: userId } : {})
  });

  return `/embed/${botId}/config?${urlSearchParams.toString()}`;
}

function embedTelemetryURL(botId, { secret, token }, points) {
  const urlSearchParams = new URLSearchParams({
    ...(secret && !token ? { s: secret } : {}),
    ...(token ? { t: token } : {}),
    p: points
  });

  return `/embed/${botId}/telemetry?${urlSearchParams.toString()}`;
}

function legacyEmbedURL(botId, urlSearchParams) {
  return `/embed/${botId}?${urlSearchParams.toString()}`;
}

export { embedConfigurationURL, embedTelemetryURL, legacyEmbedURL };

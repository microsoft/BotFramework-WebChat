const BEARER_PREFIX_LOWERCASE = 'bearer ';

let warned;

// Speech SDK adds "Bearer " to the authorization token itself.
export default function removeBearerInAuthorizationToken(credentials) {
  const { authorizationToken } = credentials;

  if (typeof authorizationToken === 'string' && authorizationToken.toLowerCase().startsWith(BEARER_PREFIX_LOWERCASE)) {
    warned || console.warn('botframework-directlinespeech-sdk: Remove "Bearer" from the authorization token.');
    warned = true;

    return Object.freeze({
      ...credentials,
      authorizationToken: authorizationToken.substring(BEARER_PREFIX_LOWERCASE.length)
    });
  }

  return credentials;
}

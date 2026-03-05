import { warnOnce } from '@msinternal/botframework-webchat-base/utils';
import CognitiveServicesCredentials from '../types/CognitiveServicesCredentials';
import isPromiseLike from './isPromiseLike';

// eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
type CognitiveServicesBaseCredentials = Exclude<Exclude<CognitiveServicesCredentials, Function>, Promise<any>>;

const BEARER_PREFIX_LOWERCASE = 'bearer ';

const warnBearerPrefix = warnOnce('botframework-webchat: Remove "Bearer" from the speech authorization token.');

function removeBearerInAuthorizationTokenForResolved(
  credentials: CognitiveServicesBaseCredentials
): CognitiveServicesBaseCredentials {
  if (
    'authorizationToken' in credentials &&
    credentials.authorizationToken?.toLowerCase().startsWith(BEARER_PREFIX_LOWERCASE)
  ) {
    warnBearerPrefix();

    return Object.freeze({
      ...credentials,
      authorizationToken: credentials.authorizationToken.substring(BEARER_PREFIX_LOWERCASE.length)
    });
  }

  return credentials;
}

function removeBearerInAuthorizationTokenForPromiseOrResolved(
  credentials: CognitiveServicesBaseCredentials | Promise<CognitiveServicesBaseCredentials>
): CognitiveServicesBaseCredentials | Promise<CognitiveServicesBaseCredentials> {
  if (isPromiseLike<CognitiveServicesBaseCredentials>(credentials)) {
    return credentials.then(credentials => removeBearerInAuthorizationTokenForResolved(credentials));
  }

  return removeBearerInAuthorizationTokenForResolved(credentials);
}

function removeBearerInAuthorizationToken(credentials: CognitiveServicesCredentials) {
  if (typeof credentials === 'function') {
    return (() => removeBearerInAuthorizationTokenForPromiseOrResolved(credentials())) satisfies () =>
      | CognitiveServicesBaseCredentials
      | Promise<CognitiveServicesBaseCredentials> as CognitiveServicesCredentials;
  }

  return removeBearerInAuthorizationTokenForPromiseOrResolved(credentials);
}

export default removeBearerInAuthorizationToken;

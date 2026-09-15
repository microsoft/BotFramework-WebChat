import type { CardActionMiddleware } from 'botframework-webchat-api';

import getScheme from './private/getScheme.js';
import { check, pipe, safeParse, string, transform, url } from 'valibot';

const ALLOWED_SCHEMES = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

const callURLValueSchema = pipe(
  string('"value" must be a string'),
  url('"value" must be an absolute URL'),
  check(value => {
    try {
      return ['http:', 'https:'].includes(new URL(value).protocol);
    } catch {
      return false;
    }
  }, '"value" must have protocol of either "http:" or "https:"'),
  transform<string, `${'http:' | 'https:'}//${string}`>(value => value as any)
);

// TODO: Pass styleOptions.
export default function createDefaultCardActionMiddleware(): readonly CardActionMiddleware[] {
  return [
    ({ styleOptions }) =>
      next =>
      (...args) => {
        const [
          {
            cardAction: { type, value },
            getSignInUrl
          }
        ] = args;

        switch (type) {
          case 'call':
          case 'downloadFile':
          case 'openUrl':
          case 'playAudio':
          case 'playVideo':
          case 'showImage':
            if (ALLOWED_SCHEMES.includes(getScheme(value))) {
              window.open(value, '_blank', 'noopener noreferrer');
            } else {
              console.warn('botframework-webchat: Cannot open URL with disallowed schemes.', value);
            }

            break;

          // Currently, this is exposed as Adaptive Cards `Action.OpenUrlDialog` action.
          case 'webchat:callURL': {
            const callURLValueParseResult = safeParse(callURLValueSchema, value);

            if (callURLValueParseResult.success) {
              window.open(
                callURLValueParseResult.output,
                '_blank',
                [
                  // Implicit allow opener/referer because we are calling into a dialog that can return result.
                  `height=${styleOptions.callURLActionPopupWindowHeight}`,
                  'popup',
                  `width=${styleOptions.callURLActionPopupWindowWidth}`
                ].join(',')
              );
            } else {
              console.warn(
                'botframework-webchat: Cannot call invalid URL.',
                value,
                ...callURLValueParseResult.issues.map(({ message }) => message)
              );
            }

            break;
          }

          case 'signin': {
            /**
             * @todo TODO: [P3] We should prime the URL into the OAuthCard directly, instead of calling getSessionId on-demand
             *       This is to eliminate the delay between window.open() and location.href call
             */

            (async function () {
              const popup = window.open();
              const url = await getSignInUrl();

              if (['http', 'https'].includes(getScheme(url))) {
                popup.location.href = url;
              } else {
                console.warn('botframework-webchat: Cannot open URL with disallowed schemes.', url);

                popup.close();
              }
            })();

            break;
          }

          default:
            return next(...args);
        }
      }
  ];
}

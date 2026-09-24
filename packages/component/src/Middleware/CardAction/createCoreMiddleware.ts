import type { CardActionMiddleware } from 'botframework-webchat-api';
import { sendPostBack } from 'botframework-webchat-core';
import { any, check, literal, object, pipe, safeParse, string, transform, url } from 'valibot';

import getScheme from './private/getScheme.js';

const ALLOWED_SCHEMES = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];
const POPUP_CLOSE_DETECTION_INTERVAL = 1_000;
const POPUP_CLOSE_DETECTION_MAX_DURATION = 300_000;

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

const callURLPostMessageDataSchema = object(
  {
    type: literal('postback', '"MessageEvent.data.type" must be "postback"'),
    value: any()
  },
  '"MessageEvent.data" must be an object'
);

export default function createDefaultCardActionMiddleware(): readonly CardActionMiddleware[] {
  return [
    ({ dispatch, ponyfill, styleOptions }) =>
      next =>
      (...args) => {
        const [
          {
            cardAction: { type, value },
            getSignInUrl,
            replyToId
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

          // This is also exposed via Adaptive Cards `Action.OpenUrlDialog` action.
          case 'webchat:callURL': {
            const callURLValueParseResult = safeParse(callURLValueSchema, value);

            if (callURLValueParseResult.success) {
              const popupURL = new URL(callURLValueParseResult.output);

              const isOriginTrusted = (origin: string): boolean =>
                // Allow same origin.
                location.origin === origin ||
                // For cross origin, make sure the origin is on the allowlist.
                (typeof styleOptions.callURLActionTrustedOrigin === 'string'
                  ? styleOptions.callURLActionTrustedOrigin.split(',').map(origin => origin.trim())
                  : ([] satisfies string[])
                ).includes(origin);

              // eslint-disable-next-line prefer-const
              let cleanup: (() => void) | undefined;
              // eslint-disable-next-line prefer-const
              let popup: undefined | Window;

              const messageHandler: (event: MessageEvent) => void = event => {
                if (popup && !popup.closed && event.source === popup) {
                  const { origin: eventOrigin } = event;

                  if (!isOriginTrusted(eventOrigin)) {
                    console.warn(
                      `botframework-webchat: Cannot handle return value from an untrusted cross origin. Please add the origin "${eventOrigin}" to style option named "callURLActionTrustedOrigin".`
                    );
                  } else {
                    const dataResult = safeParse(callURLPostMessageDataSchema, event.data);

                    if (!dataResult.success) {
                      console.warn(
                        `botframework-webchat: Failed to parse the message from the popup.`,
                        dataResult.issues
                      );
                    } else {
                      dispatch(sendPostBack(event.data.value, { replyToId }));
                    }

                    cleanup();
                  }
                }
              };

              // Attach "message" event listener before `window.open()`.
              window.addEventListener('message', messageHandler);

              // For resource management reason, stop listening to "message" event after 5 minutes.
              // We should not listen for the event forever.
              const cleanupCloseDetectionTimeout = ponyfill.setTimeout(
                // Note: cleanup() is assigned later, do not collapse this line.
                () => cleanup?.(),
                POPUP_CLOSE_DETECTION_MAX_DURATION
              );

              const detectCloseInterval = ponyfill.setInterval(() => {
                // Note: there are no event to observe when `closed` become `true`, we need to rely on per interval checks.
                (!popup || popup.closed) && cleanup?.();
              }, POPUP_CLOSE_DETECTION_INTERVAL);

              cleanup = () => {
                window.removeEventListener('message', messageHandler);

                ponyfill.clearInterval(detectCloseInterval);
                ponyfill.clearTimeout(cleanupCloseDetectionTimeout);
              };

              // Open a blank popup and navigate to it has a higher chance of success.
              popup = window.open(
                popupURL,
                '_blank',
                [
                  // Implicit allow opener/referer because we are calling into a dialog that can return result.
                  `height=${styleOptions.callURLActionPopupWindowHeight}`,
                  'popup',
                  `width=${styleOptions.callURLActionPopupWindowWidth}`,

                  // Add "noopener noreferrer" to untrusted cross origin.
                  ...(isOriginTrusted(popupURL.origin) ? [] : ['noopener', 'noreferrer'])
                ].join(',')
              );

              // Note: if access to the popup window is blocked by Cross-Origin-Opener-Policy, Chrome will not sever and set `closed` to `true` synchronously.
              //       Chrome will sever the connection asynchronously.

              if (!popup) {
                // Popup window is blocked by popup blocker, we permanently lost connection to the Window object and has no way to verify authenticity of MessageEvent.
                // Thus, we should stop listening to the MessageEvent.
                console.warn(
                  `botframework-webchat: Popup blocker has blocked the popup window to open URL ${popupURL}.`
                );

                cleanup();
              }
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

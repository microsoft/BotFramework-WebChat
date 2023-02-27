import { ie11 } from '../../Utils/detectBrowser';

// This code is adopted from sanitize-html/naughtyScheme.
// sanitize-html is a dependency of Web Chat but the naughtScheme function is neither exposed nor reusable.
// https://github.com/apostrophecms/sanitize-html/
function getScheme(href) {
  // Browsers ignore character codes of 32 (space) and below in a surprising
  // number of situations. Start reading here:
  // https://www.owasp.org/index.php/XSS_Filter_Evasion_Cheat_Sheet#Embedded_tab

  /* eslint-disable-next-line no-control-regex */
  href = href.replace(/[\x00-\x20]+/gu, '');

  // Clobber any comments in URLs, which the browser might
  // interpret inside an XML data island, allowing
  // a javascript: URL to be snuck through
  href = href.replace(/<!--.*?-->/gu, '');

  // Case insensitive so we don't get faked out by JAVASCRIPT #1
  const matches = href.match(/^([a-zA-Z]+):/u);

  if (!matches) {
    // Protocol-relative URL or no scheme
    return;
  }

  return matches[1].toLowerCase();
}

const ALLOWED_SCHEMES = ['data', 'http', 'https', 'ftp', 'mailto', 'sip', 'tel'];

export default function createDefaultCardActionMiddleware() {
  return [
    () =>
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
              if (ie11) {
                const newWindow = window.open();
                newWindow.opener = null;
                newWindow.location = value;
              } else {
                window.open(value, '_blank', 'noopener noreferrer');
              }
            } else {
              console.warn('botframework-webchat: Cannot open URL with disallowed schemes.', value);
            }

            break;

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

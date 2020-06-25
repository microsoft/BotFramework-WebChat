import { sendMessage, sendMessageBack, sendPostBack } from 'botframework-webchat-core';

// This code is adopted from sanitize-html/naughtyScheme.
// sanitize-html is a dependency of Web Chat but the naughtScheme function is neither exposed nor reusable.
// https://github.com/apostrophecms/sanitize-html/blob/master/src/index.js#L526
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
  return ({ dispatch }) => next => ({ cardAction, getSignInUrl }) => {
    const { displayText, text, type, value } = cardAction;

    switch (type) {
      case 'imBack':
        if (typeof value === 'string') {
          // TODO: [P4] Instead of calling dispatch, we should move to dispatchers instead for completeness
          dispatch(sendMessage(value, 'imBack'));
        } else {
          throw new Error('cannot send "imBack" with a non-string value');
        }

        break;

      case 'messageBack':
        dispatch(sendMessageBack(value, text, displayText));

        break;

      case 'postBack':
        dispatch(sendPostBack(value));

        break;

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

      case 'signin': {
        // TODO: [P3] We should prime the URL into the OAuthCard directly, instead of calling getSessionId on-demand
        //       This is to eliminate the delay between window.open() and location.href call

        const popup = window.open();

        getSignInUrl().then(url => {
          popup.location.href = url;
        });

        break;
      }

      default:
        return next({ cardAction, getSignInUrl });
    }
  };
}

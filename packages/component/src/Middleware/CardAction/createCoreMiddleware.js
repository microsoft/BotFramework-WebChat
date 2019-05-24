import { sendMessage, sendMessageBack, sendPostBack } from 'botframework-webchat-core';

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
        window.open(value);
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

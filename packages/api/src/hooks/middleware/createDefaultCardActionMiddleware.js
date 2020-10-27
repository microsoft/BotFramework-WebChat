import { sendMessage, sendMessageBack, sendPostBack } from 'botframework-webchat-core';

export default function createDefaultCardActionMiddleware() {
  return ({ dispatch }) => next => (...args) => {
    const [
      {
        cardAction: { displayText, text, type, value }
      }
    ] = args;

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

      default:
        return next(...args);
    }
  };
}

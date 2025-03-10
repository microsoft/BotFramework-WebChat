import { sendMessage, sendMessageBack, sendPostBack } from 'botframework-webchat-core';

import CardActionMiddleware from '../../types/CardActionMiddleware';

export default function createDefaultCardActionMiddleware(): CardActionMiddleware {
  return ({ dispatch }) =>
    next =>
    (...args) => {
      const [
        {
          cardAction,
          cardAction: { value }
        }
      ] = args;

      // We cannot use destructured "type" here because TypeScript don't recognize "messageBack" is "MessageBackCardAction".
      switch (cardAction.type) {
        case 'imBack':
          if (typeof value === 'string') {
            // TODO: [P4] Instead of calling dispatch, we should move to dispatchers instead for completeness
            dispatch(sendMessage(value, 'imBack'));
          } else {
            throw new Error('cannot send "imBack" with a non-string value');
          }

          break;

        case 'messageBack':
          dispatch(sendMessageBack(value, cardAction.text, cardAction.displayText));

          break;

        case 'postBack':
          dispatch(sendPostBack(value));

          break;

        default:
          return next(...args);
      }
    };
}

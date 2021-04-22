import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendBoxStyle({
  sendBoxBackground,
  sendBoxBorderBottom,
  sendBoxBorderLeft,
  sendBoxBorderRight,
  sendBoxBorderTop,
  sendBoxHeight
}: StrictStyleOptions) {
  return {
    '&.webchat__send-box': {
      '& .webchat__send-box__button--align-bottom': { alignSelf: 'flex-end' },
      '& .webchat__send-box__button--align-stretch': { alignSelf: 'stretch' },
      '& .webchat__send-box__button--align-top': { alignSelf: 'flex-start' },

      '& .webchat__send-box__main': {
        alignItems: 'stretch',
        backgroundColor: sendBoxBackground,
        borderBottom: sendBoxBorderBottom,
        borderLeft: sendBoxBorderLeft,
        borderRight: sendBoxBorderRight,
        borderTop: sendBoxBorderTop,
        minHeight: sendBoxHeight
      }
    }
  };
}

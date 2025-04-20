import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from './types/StyleSet';

export default function createSendBoxAttachmentBarStyle(_: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar': {
      display: 'content',

      '&.webchat__send-box-attachment-bar--text-only': {
        maxHeight: '114px',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin'
      },

      '&.webchat__send-box-attachment-bar--thumbnail': {
        overflowX: 'auto'
      },

      '& .webchat__send-box-attachment-bar__box': {
        gap: '4px'
      },

      '&.webchat__send-box-attachment-bar--text-only .webchat__send-box-attachment-bar__box': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',

        '&:not(:empty)': {
          padding: '4px'
        }
      },

      '&.webchat__send-box-attachment-bar--thumbnail .webchat__send-box-attachment-bar__box': {
        display: 'flex',
        scrollbarWidth: 'thin'
      }
    }
  } satisfies StyleSet;
}

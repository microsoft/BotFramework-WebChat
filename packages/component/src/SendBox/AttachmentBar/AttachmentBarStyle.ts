import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from '../../Styles/StyleSet/types/StyleSet';

export default function createSendBoxAttachmentBarStyle(_: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar': {
      display: 'content',

      '&.webchat__send-box-attachment-bar--as-list-item': {
        maxHeight: '114px',
        overflowY: 'auto',
        scrollbarGutter: 'stable',
        scrollbarWidth: 'thin'
      },

      '&.webchat__send-box-attachment-bar--as-thumbnail': {
        overflowX: 'auto'
      },

      '& .webchat__send-box-attachment-bar__box': {
        gap: '4px'
      },

      '&.webchat__send-box-attachment-bar--as-list-item .webchat__send-box-attachment-bar__box': {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',

        '&:not(:empty)': {
          padding: '4px'
        }
      },

      '&.webchat__send-box-attachment-bar--as-thumbnail .webchat__send-box-attachment-bar__box': {
        display: 'flex',
        scrollbarWidth: 'thin'
      }
    }
  } satisfies StyleSet;
}

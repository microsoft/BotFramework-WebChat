import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from './types/StyleSet';

export default function createSendBoxAttachmentBarStyle(_: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar': {
      display: 'content',
      overflowX: 'auto',
      scrollbarWidth: 'thin',

      '& .webchat__send-box-attachment-bar__box': {
        display: 'flex',
        gap: '4px'
      }
    }
  } satisfies StyleSet;
}

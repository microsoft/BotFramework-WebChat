import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from '../../../Styles/StyleSet/types/StyleSet';

export default function createSendBoxAttachmentBarItemImagePreviewStyle(_: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar-item-image-preview': {
      height: '100%',
      objectFit: 'cover',
      width: '100%'
    }
  } satisfies StyleSet;
}

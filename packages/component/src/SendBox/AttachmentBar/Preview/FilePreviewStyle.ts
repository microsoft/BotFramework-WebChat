import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from '../../../Styles/StyleSet/types/StyleSet';

export default function createSendBoxAttachmentBarItemFilePreviewStyle({ primaryFont }: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar-item-file-preview': {
      alignItems: 'center',
      display: 'grid',

      '&.webchat__send-box-attachment-bar-item-file-preview--text-only': {
        fontFamily: primaryFont,
        gap: '8px',
        gridTemplateColumns: 'auto 1fr'
      },

      '&.webchat__send-box-attachment-bar-item-file-preview--thumbnail': {
        height: '100%',
        justifyContent: 'center',
        width: '100%'
      },

      '& .webchat__send-box-attachment-bar-item-file-preview__text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }
  } satisfies StyleSet;
}

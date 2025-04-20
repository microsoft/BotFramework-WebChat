import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from './types/StyleSet';

export default function createSendBoxAttachmentBarItemStyle({ primaryFont }: StrictStyleOptions) {
  return {
    '&.webchat__send-box-attachment-bar-item': {
      display: 'grid',
      flexShrink: '0',
      gridTemplateRows: 'auto',

      '&.webchat__send-box-attachment-bar-item--text-only': {
        borderRadius: '4px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        gridTemplateAreas: '"body auxiliary"',
        gridTemplateColumns: '1fr auto',
        padding: '2px'
      },

      '&.webchat__send-box-attachment-bar-item--thumbnail': {
        aspectRatio: '1/1',
        border: 'solid 1px rgba(0, 0, 0, .25)', // Figma has border-width of 0.96px.
        borderRadius: '8px', // Figma is 7.68px.
        gridTemplateAreas: '"body"',
        gridTemplateColumns: 'auto',
        height: '80px', // <= 87px would fit white-label design with 3 thumbnails.
        // height: '96px',
        overflow: 'hidden'
      }
    },

    // --- DeleteButton

    '& .webchat__send-box-attachment-bar-item__delete-button': {
      appearance: 'none',
      backgroundColor: 'White', // TODO: Dark theme.
      borderRadius: '4px', // BorderRadiusXS is not defined in Fluent UI, guessing it is 4px.
      fill: '#242424', // TODO: Dark theme.
      gridArea: 'body',
      justifySelf: 'end',
      opacity: '1',
      padding: '0',
      transition: 'opacity 50ms', // Assume ultra-fast.

      // TODO: Need to center the SVG better.
      alignItems: 'center',
      display: 'grid',
      justifyContent: 'center',

      '&:hover': {
        backgroundColor: '#F5F5F5',
        borderColor: '#C7C7C7'
      },

      '&:active': {
        backgroundColor: '#E0E0E0',
        borderColor: '#C7C7C7'
      },

      '&:disabled, &[aria-diabled]': {
        backgroundColor: '#F0F0F0',
        borderColor: '#E0E0E0',
        fill: '#BDBDBD'
      }
    },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--text-only .webchat__send-box-attachment-bar-item__delete-button':
      {
        border: '0',
        gridArea: 'auxiliary',
        height: '24px',
        width: '24px'
      },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--thumbnail .webchat__send-box-attachment-bar-item__delete-button':
      {
        border: 'solid 1px #E0E0E0', // Figma has border-width of 0.96px.
        gridArea: 'body',
        height: '23px', // Figma is 23.04px.
        margin: '8px', // Figma is 7.68px.
        width: '23px' // Figma is 23.04px.
      },

    '@media not (prefers-reduced-motion: reduce)': {
      '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--thumbnail:not(:hover):not(:focus-within) .webchat__send-box-attachment-bar-item__delete-button':
        {
          opacity: '0'
        }
    },

    // Reduced motion: disable "show on hover".
    // '@media (prefers-reduced-motion: reduce)': {
    //   '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--thumbnail:not(:hover):not(:focus-within) .webchat__send-box-attachment-bar-item__delete-button':
    //     {
    //       opacity: '1'
    //     }
    // },

    // --- Preview

    '& .webchat__send-box-attachment-bar-item__preview': {
      alignItems: 'center',
      display: 'grid',
      gridArea: 'body',
      overflow: 'hidden'
    },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--text-only .webchat__send-box-attachment-bar-item__preview':
      {
        paddingInline: '8px'
      },

    // --- ImagePreview
    // TODO: Separate into different file.

    '& .webchat__send-box-attachment-bar-item-image-preview': {
      height: '100%',
      objectFit: 'cover',
      width: '100%'
    },

    // --- FilePreview
    // TODO: Separate into different file.

    '& .webchat__send-box-attachment-bar-item-file-preview': {
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

import { StrictStyleOptions } from 'botframework-webchat-api';
import { type StyleSet } from '../../Styles/StyleSet/types/StyleSet';

export default function createSendBoxAttachmentBarItemStyle(_: StrictStyleOptions) {
  return {
    /* #region List item */
    '&.webchat__send-box-attachment-bar-item': {
      display: 'grid',
      flexShrink: '0',
      gridTemplateRows: 'auto',

      '&.webchat__send-box-attachment-bar-item--as-list-item': {
        borderRadius: '4px',
        boxShadow: '0px 2px 4px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        gridTemplateAreas: '"body auxiliary"',
        gridTemplateColumns: '1fr auto',
        padding: '2px'
      },

      '&.webchat__send-box-attachment-bar-item--as-thumbnail': {
        aspectRatio: '1/1',
        border: 'solid 1px rgba(0, 0, 0, .25)', // Figma has border-width of 0.96px.
        borderRadius: '8px', // Figma is 7.68px.
        gridTemplateAreas: '"body"',
        gridTemplateColumns: 'auto',
        height: '80px', // <= 87px would fit white-label design with 3 thumbnails.
        overflow: 'hidden'
      }
    },
    /* #endregion */

    /* #region Delete button */
    '& .webchat__send-box-attachment-bar-item__delete-button': {
      appearance: 'none',
      borderRadius: '4px', // BorderRadiusXS is not defined in Fluent UI, guessing it is 4px.
      gridArea: 'body',
      justifySelf: 'end',
      opacity: '1',
      padding: '0',
      transition: 'opacity 50ms', // Assume ultra-fast.

      // https://react.fluentui.dev/?path=/docs/theme-colors--docs
      '@media not (prefers-color-scheme: dark)': {
        backgroundColor: 'White', // Background/colorNeutralBackground1
        borderColor: '#D1D1D1', // Stroke/colorNeutralStroke1
        color: '#242424', // Background/colorNeutralForeground1

        '&:hover': {
          backgroundColor: '#F5F5F5', // Background/colorNeutralBackground1Hover
          borderColor: '#C7C7C7' // Stroke/colorNeutralStroke1Hover
        },

        '&:active': {
          backgroundColor: '#E0E0E0', // Background/colorNeutralBackground1Pressed
          borderColor: '#C7C7C7' // Stroke/colorNeutralStroke1Pressed
        },

        '&:disabled, &[aria-diabled]': {
          backgroundColor: '#F0F0F0', // Background/colorNeutralBackgroundDisabled
          borderColor: '#E0E0E0', // Stroke/colorNeutralStrokeDisabled
          color: '#BDBDBD' // Stroke/colorNeutralForegroundDisabled
        }
      },

      '@media (prefers-color-scheme: dark)': {
        backgroundColor: '#292929', // Background/colorNeutralBackground1
        borderColor: '#666666', // Stroke/colorNeutralStroke1
        color: '#FFFFFF', // Background/colorNeutralBackground1

        '&:hover': {
          backgroundColor: '#3D3D3D', // Background/colorNeutralBackground1Hover
          borderColor: '#757575' // Stroke/colorNeutralStroke1Hover
        },

        '&:active': {
          backgroundColor: '#1F1F1F', // Background/colorNeutralBackground1Pressed
          borderColor: '#6B6B6B' // Stroke/colorNeutralStroke1Pressed
        },

        '&:disabled, &[aria-diabled]': {
          backgroundColor: '#141414', // Background/colorNeutralBackgroundDisabled
          borderColor: '#424242', // Stroke/colorNeutralStrokeDisabled
          color: '#5C5C5C' // Stroke/colorNeutralForegroundDisabled
        }
      }
    },

    '& .webchat__send-box-attachment-bar-item__delete-icon-masker': {
      backgroundColor: 'currentcolor',
      height: '20px',
      width: '20px'
    },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--as-list-item .webchat__send-box-attachment-bar-item__delete-button':
      {
        border: '0',
        gridArea: 'auxiliary',
        height: '24px',
        width: '24px'
      },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--as-thumbnail .webchat__send-box-attachment-bar-item__delete-button':
      {
        borderStyle: 'solid', // Border color will be set elsewhere.
        borderWidth: '1px', // Figma has border-width of 0.96px.
        gridArea: 'body',
        height: '23px', // Figma is 23.04px.
        margin: '8px', // Figma is 7.68px.
        width: '23px' // Figma is 23.04px.
      },

    '@media not (prefers-reduced-motion: reduce)': {
      '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--as-thumbnail:not(:hover):not(:focus-within) .webchat__send-box-attachment-bar-item__delete-button':
        {
          opacity: '0'
        }
    },
    /* #endregion */

    /* #region Preview */
    '& .webchat__send-box-attachment-bar-item__preview': {
      alignItems: 'center',
      display: 'grid',
      gridArea: 'body',
      overflow: 'hidden'
    },

    '&.webchat__send-box-attachment-bar-item.webchat__send-box-attachment-bar-item--as-list-item .webchat__send-box-attachment-bar-item__preview':
      {
        paddingInline: '8px'
      }
    /* #endregion */
  } satisfies StyleSet;
}

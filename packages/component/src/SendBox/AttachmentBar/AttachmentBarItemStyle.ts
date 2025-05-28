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
      display: 'grid', // Center the image
      alignItems: 'center',
      justifyContent: 'center',
      gridArea: 'body',
      justifySelf: 'end',
      opacity: '1',
      padding: '0',
      transition: 'opacity 50ms', // Assume ultra-fast.

      '--webchat__moddable-icon--size': '19px',

      '&.webchat__send-box-attachment-bar-item__delete-button--large': {
        '--webchat__moddable-icon--mask': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M4.60507 5.12706L4.66061 5.06059C4.82723 4.89396 5.08588 4.87545 5.27295 5.00505L5.33943 5.06059L9.80002 9.52128L14.2606 5.06059C14.4481 4.87314 14.752 4.87314 14.9394 5.06059C15.1269 5.24804 15.1269 5.55196 14.9394 5.73941L10.4787 10.2L14.9394 14.6606C15.1061 14.8272 15.1246 15.0859 14.995 15.2729L14.9394 15.3394C14.7728 15.506 14.5142 15.5245 14.3271 15.395L14.2606 15.3394L9.80002 10.8787L5.33943 15.3394C5.15198 15.5269 4.84806 15.5269 4.66061 15.3394C4.47316 15.152 4.47316 14.848 4.66061 14.6606L9.1213 10.2L4.66061 5.73941C4.49398 5.57279 4.47547 5.31414 4.60507 5.12706L4.66061 5.06059L4.60507 5.12706Z" fill="#242424" /></svg>')})`
      },

      '&.webchat__send-box-attachment-bar-item__delete-button--small': {
        '--webchat__moddable-icon--mask': `url(data:image/svg+xml;utf8,${encodeURIComponent('<svg fill="none" height="20" viewBox="0 0 20 20" width="20" xmlns="http://www.w3.org/2000/svg"><path d="M6.08859 6.21569L6.14645 6.14645C6.32001 5.97288 6.58944 5.9536 6.78431 6.08859L6.85355 6.14645L10 9.293L13.1464 6.14645C13.3417 5.95118 13.6583 5.95118 13.8536 6.14645C14.0488 6.34171 14.0488 6.65829 13.8536 6.85355L10.707 10L13.8536 13.1464C14.0271 13.32 14.0464 13.5894 13.9114 13.7843L13.8536 13.8536C13.68 14.0271 13.4106 14.0464 13.2157 13.9114L13.1464 13.8536L10 10.707L6.85355 13.8536C6.65829 14.0488 6.34171 14.0488 6.14645 13.8536C5.95118 13.6583 5.95118 13.3417 6.14645 13.1464L9.293 10L6.14645 6.85355C5.97288 6.67999 5.9536 6.41056 6.08859 6.21569L6.14645 6.14645L6.08859 6.21569Z" fill="#242424" /></svg>')})`
      },

      // https://react.fluentui.dev/?path=/docs/theme-colors--docs
      '@media not (prefers-color-scheme: dark)': {
        '--webchat__moddable-icon--color': '#242424', // Background/colorNeutralForeground1
        backgroundColor: 'White', // Background/colorNeutralBackground1
        borderColor: '#D1D1D1', // Stroke/colorNeutralStroke1

        '&:hover': {
          backgroundColor: '#F5F5F5', // Background/colorNeutralBackground1Hover
          borderColor: '#C7C7C7' // Stroke/colorNeutralStroke1Hover
        },

        '&:active': {
          backgroundColor: '#E0E0E0', // Background/colorNeutralBackground1Pressed
          borderColor: '#C7C7C7' // Stroke/colorNeutralStroke1Pressed
        },

        '&:disabled, &[aria-diabled]': {
          '--webchat__moddable-icon--color': '#BDBDBD', // Stroke/colorNeutralForegroundDisabled
          backgroundColor: '#F0F0F0', // Background/colorNeutralBackgroundDisabled
          borderColor: '#E0E0E0', // Stroke/colorNeutralStrokeDisabled
          color: '#BDBDBD' // Stroke/colorNeutralForegroundDisabled
        }
      },

      '@media (prefers-color-scheme: dark)': {
        '--webchat__moddable-icon--color': '#FFFFFF', // Background/colorNeutralBackground1
        backgroundColor: '#292929', // Background/colorNeutralBackground1
        borderColor: '#666666', // Stroke/colorNeutralStroke1

        '&:hover': {
          backgroundColor: '#3D3D3D', // Background/colorNeutralBackground1Hover
          borderColor: '#757575' // Stroke/colorNeutralStroke1Hover
        },

        '&:active': {
          backgroundColor: '#1F1F1F', // Background/colorNeutralBackground1Pressed
          borderColor: '#6B6B6B' // Stroke/colorNeutralStroke1Pressed
        },

        '&:disabled, &[aria-diabled]': {
          '--webchat__moddable-icon--color': '#5C5C5C', // Stroke/colorNeutralForegroundDisabled
          backgroundColor: '#141414', // Background/colorNeutralBackgroundDisabled
          borderColor: '#424242', // Stroke/colorNeutralStrokeDisabled
          color: '#5C5C5C' // Stroke/colorNeutralForegroundDisabled
        }
      }
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

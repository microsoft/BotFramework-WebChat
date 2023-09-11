import {
  DARK_THEME_SELECTOR,
  FORCED_COLORS_SELECTOR,
  LIGHT_THEME_SELECTOR,
  NOT_FORCED_COLORS_SELECTOR
} from './Constants';

export default function createModalDialogStyleSet() {
  return {
    '&.webchat__modal-dialog': {
      fontFamily: 'var(--webchat__font--primary)',
      width: '100%',

      [NOT_FORCED_COLORS_SELECTOR]: {
        backgroundColor: 'transparent',
        border: 0
      },

      '& .webchat__modal-dialog__box': {
        borderRadius: 2,
        height: 'calc(100% - var(--webchat__padding--regular) * 2)',
        overflow: 'hidden',
        margin: 'auto',
        maxWidth: '60%',
        width: 'calc(100% - var(--webchat__padding--regular) * 2)',

        [LIGHT_THEME_SELECTOR]: {
          // From Power BI:
          // boxShadow: '0 6.4px 14.4px rgb(0 0 0 / 13%), 0 1.2px 3.6px rgb(0 0 0 / 11%)',
          // From Fluent (depth-16 for teaching callouts):
          // boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
          backgroundColor: 'White',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)'
        },

        [DARK_THEME_SELECTOR]: {
          backgroundColor: 'Black',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)',
          color: 'White'
        },

        [FORCED_COLORS_SELECTOR]: {
          // In high-contrast mode, we use "outline" instead of "box-shadow".
          outlineColor: 'ButtonBorder',
          outlineStyle: 'solid',
          outlineWidth: 4
        }
      },

      '& .webchat__modal-dialog__close-button-layout': {
        float: 'right',
        padding: 'var(--webchat__padding--regular)'
      },

      '& .webchat__modal-dialog__close-button': {
        height: 30,
        width: 30,

        [NOT_FORCED_COLORS_SELECTOR]: {
          appearance: 'none',
          backgroundColor: 'transparent',
          borderColor: 'transparent',
          borderRadius: 4,
          borderStyle: 'solid',
          borderWidth: 2,
          color: '#999',
          outline: 0
        }
      },

      '& .webchat__modal-dialog__close-button:focus': {
        [LIGHT_THEME_SELECTOR]: {
          borderColor: 'black',

          '&:active': {
            backgroundColor: '#EDEBE9' // neutralLight (gray30)
          },

          '&:not(:active):hover': {
            backgroundColor: '#F3F2F1' // neutralLighter (gray20)
          }
        },

        [DARK_THEME_SELECTOR]: {
          borderColor: 'white',

          '&:active': {
            backgroundColor: '#292827' // neutralLight (gray30)
          },

          '&:not(:active):hover': {
            backgroundColor: '#252423' // neutralLight (gray30)
          }
        }
      },

      '& .webchat__modal-dialog__close-button-image': {
        height: 10,
        width: 10,

        [LIGHT_THEME_SELECTOR]: {
          fill: '#323130' // neutralPrimary (gray160)
        },

        [DARK_THEME_SELECTOR]: {
          fill: '#F3F2F1' // neutralPrimary (gray160)
        },

        [FORCED_COLORS_SELECTOR]: {
          fill: 'currentcolor'
        }
      },

      '& .webchat__modal-dialog__body': {
        margin: 'calc(var(--webchat__padding--regular) * 2)'
      }
    }
  };
}

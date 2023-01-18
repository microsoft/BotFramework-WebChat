// Numbers are commonly used in CSS.
/* eslint-disable no-magic-numbers */

import { StrictStyleOptions } from 'botframework-webchat-api';

const DARK_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: dark)';
const LIGHT_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: light)';
const FORCED_COLORS_SELECTOR = '@media (forced-colors: active)';

export default function createKeyboardHelpStyleSet({ paddingRegular, primaryFont }: StrictStyleOptions) {
  return {
    '&.webchat__keyboard-help': {
      fontFamily: primaryFont,
      fontSize: 14,
      height: '100%',
      outline: 0,
      overflow: 'hidden',

      '&:not(.webchat__keyboard-help--shown)': {
        height: 0,
        margin: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        width: 0
      },

      '& .webchat__keyboard-help__border': {
        boxSizing: 'border-box',
        height: '100%',
        padding: paddingRegular
      },

      '& .webchat__keyboard-help__box': {
        // From Power BI:
        // boxShadow: '0 6.4px 14.4px rgb(0 0 0 / 13%), 0 1.2px 3.6px rgb(0 0 0 / 11%)',
        // From Fluent (depth-16 for teaching callouts):
        borderRadius: 2,
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        height: '100%',
        overflow: 'hidden',

        [FORCED_COLORS_SELECTOR]: {
          backgroundColor: 'Canvas',
          boxShadow: 'none',
          outlineColor: 'ButtonBorder',
          outlineStyle: 'solid',
          outlineWidth: 4
        },

        [DARK_THEME_SELECTOR]: {
          backgroundColor: 'Black',
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)'
        }
      },

      '& .webchat__keyboard-help__scrollable': {
        boxSizing: 'border-box',
        height: '100%',
        overflowY: 'auto',
        padding: paddingRegular * 2,
        position: 'relative'
      },

      '& .webchat__keyboard-help__close-button': {
        appearance: 'none',
        backgroundColor: 'transparent',
        border: 0,
        outline: 0,
        padding: paddingRegular,
        // We are enlarging the bounding box of close button for scroll into view properly/cosmetically.
        // When TAB key focus on the close button, it is scrolled into view.
        // If the close button is at (10, 10), the `scrollTop` will be 10.
        // We are enlarging the bounding box, so TAB to focus on close button, `scrollTop` will be 0.
        // However, the bounding box enlarged does not means the padding are clickable.
        // We are setting `pointerEvents` to `none` to ignore mouse click on the enlarged bounding box.
        pointerEvents: 'none',
        position: 'absolute',
        right: 0,
        top: 0
      },

      '& .webchat__keyboard-help__close-button-border': {
        alignItems: 'center',
        borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 2,
        color: '#999',
        display: 'flex',
        height: 30,
        justifyContent: 'center',
        // After enlarging the bounding box, we will resume pointer events (i.e. "click") inside this element.
        pointerEvents: 'initial',
        width: 30,

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
        },

        [FORCED_COLORS_SELECTOR]: {
          backgroundColor: 'ButtonFace',
          borderColor: 'ButtonBorder'
        }
      },

      '& .webchat__keyboard-help__close-button-image': {
        fill: '#323130', // neutralPrimary (gray160)
        height: 10,
        width: 10,

        [FORCED_COLORS_SELECTOR]: {
          fill: 'ButtonText'
        },

        [DARK_THEME_SELECTOR]: {
          fill: '#F3F2F1' // neutralPrimary (gray160)
        }
      },

      '& .webchat__keyboard-help__header, & .webchat__keyboard-help__sub-header': {
        marginBottom: paddingRegular / 2,
        marginTop: 0
      },

      '& .webchat__keyboard-help__section:not(:last-child)': {
        marginBottom: paddingRegular
      },

      '& .webchat__keyboard-help__two-panes': {
        alignItems: 'flex-start',
        display: 'flex'
      },

      '& .webchat__keyboard-help__image': {
        paddingRight: paddingRegular
      },

      '& .webchat__keyboard-help__image--dark, & .webchat__keyboard-help__image--high-contrast': {
        display: 'none'
      },

      [FORCED_COLORS_SELECTOR]: {
        '& .webchat__keyboard-help__image--dark, & .webchat__keyboard-help__image--light': {
          display: 'none'
        },

        '& .webchat__keyboard-help__image--high-contrast': {
          display: 'unset',
          // "difference" will make sure SVG image is properly color in both light and dark high contrast mode.
          mixBlendMode: 'difference'
        }
      },

      [DARK_THEME_SELECTOR]: {
        color: '#F3F2F1',

        '& .webchat__keyboard-help__image--light': {
          display: 'none'
        },

        '& .webchat__keyboard-help__image--dark': {
          display: 'unset'
        }
      },

      '& .webchat__keyboard-help__notes': {
        marginBottom: paddingRegular
      },

      '& .webchat__keyboard-help__notes-header': {
        margin: 0
      },

      '& .webchat__keyboard-help__notes-pane': {
        flexShrink: 10000
      },

      '& .webchat__keyboard-help__notes-text': {
        margin: 0
      }
    }
  };
}

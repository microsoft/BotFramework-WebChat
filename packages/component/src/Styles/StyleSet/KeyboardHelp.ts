// Numbers are commonly used in CSS.
/* eslint-disable no-magic-numbers */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createKeyboardHelpStyleSet({
  paddingRegular,
  primaryFont,
  sendBoxButtonShadeColorOnActive,
  sendBoxButtonShadeColorOnFocus,
  sendBoxButtonShadeColorOnHover,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__keyboard-help': {
      borderRadius: 2,
      fontFamily: primaryFont,
      fontSize: 14,
      height: '100%',
      margin: paddingRegular,

      '&:not(.alt)': {
        outline: 0,

        '& .webchat__keyboard-help__close-button': {
          borderColor: 'black',
          borderRadius: 4,
          borderStyle: 'solid',
          borderWidth: 2
        }
      },

      // When the mouse is pressed on the button, :focus-within make sure the help screen won't close until the mouse click is completed.
      // '&:not(:focus):not(:focus-within)': {
      '&:not(.webchat__keyboard-help--shown)': {
        height: 0,
        margin: 0,
        overflow: 'hidden',
        pointerEvents: 'none',
        width: 0
      },

      '& .webchat__keyboard-help__box': {
        // From Power BI:
        // boxShadow: '0 6.4px 14.4px rgb(0 0 0 / 13%), 0 1.2px 3.6px rgb(0 0 0 / 11%)',
        // From Fluent (depth-16 for teaching callouts):
        boxShadow: '0 6.4px 14.4px 0 rgb(0 0 0 / 13%), 0 1.2px 3.6px 0 rgb(0 0 0 / 11%)',
        boxSizing: 'border-box',
        height: '100%',
        padding: paddingRegular * 2,
        position: 'relative'
      },

      '& .webchat__keyboard-help__close-button': {
        appearance: 'none',
        backgroundColor: 'transparent',
        borderColor: subtle,
        borderStyle: 'dashed',
        borderWidth: 1,
        color: '#999',
        fontSize: 24,
        height: 34,
        padding: 0,
        position: 'absolute',
        right: paddingRegular,
        top: paddingRegular,
        width: 34,

        '&:active': {
          backgroundColor: sendBoxButtonShadeColorOnActive
        },

        '&:not(:active)': {
          '&:hover': {
            backgroundColor: sendBoxButtonShadeColorOnHover
          },

          '&:not(:hover)': {
            '&:focus': {
              backgroundColor: sendBoxButtonShadeColorOnFocus
            }
          }
        }
      },

      '& .webchat__keyboard-help__header, & .webchat__keyboard-help__sub-header': {
        marginBottom: paddingRegular / 2,
        marginTop: 0
      },

      '& .webchat__keyboard-help__section': {
        marginBottom: paddingRegular
      },

      '& .webchat__keyboard-help__two-panes': {
        alignItems: 'flex-start',
        display: 'flex'
      },

      '& .webchat__keyboard-help__image': {
        flexShrink: 10000,
        paddingRight: paddingRegular
      },

      '& .webchat__keyboard-help__image--dark, & .webchat__keyboard-help__image--high-contrast': {
        display: 'none'
      },

      '@media (forced-colors: active)': {
        '& .webchat__keyboard-help__image--dark, & .webchat__keyboard-help__image--light': {
          display: 'none'
        },

        '& .webchat__keyboard-help__image--high-contrast': {
          display: 'unset'
        }
      },

      '@media (forced-colors: none) and (prefers-color-scheme: dark)': {
        backgroundColor: 'black',
        color: '#CCCBCA', // Keeping contrast ratio at 12.98 for text on background. This is 12.96.

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

      '& .webchat__keyboard-help__notes-text': {
        margin: 0
      }
    }
  };
}

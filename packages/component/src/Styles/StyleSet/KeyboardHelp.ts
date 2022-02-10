// Numbers are commonly used in CSS.
/* eslint-disable no-magic-numbers */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createKeyboardHelpStyleSet({ paddingRegular, primaryFont }: StrictStyleOptions) {
  return {
    '&.webchat__keyboard-help': {
      fontFamily: primaryFont,
      fontSize: 14,
      height: '100%',
      margin: paddingRegular,
      outline: 0,

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
        borderRadius: 2,
        boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.14), 0px 0px 2px rgba(0, 0, 0, 0.12)',
        boxSizing: 'border-box',
        height: '100%',
        padding: paddingRegular * 2,
        position: 'relative',

        '@media (forced-colors: active)': {
          boxShadow: 'none',
          outlineColor: 'white',
          outlineStyle: 'solid',
          outlineWidth: 4
        },

        '@media (forced-colors: none) and (prefers-color-scheme: dark)': {
          boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.28), 0px 0px 2px rgba(0, 0, 0, 0.24)'
        }
      },

      '& .webchat__keyboard-help__close-button': {
        appearance: 'none',
        backgroundColor: 'transparent',
        borderColor: 'black',
        borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 2,
        color: '#999',
        height: 34,
        padding: 0,
        position: 'absolute',
        right: paddingRegular,
        top: paddingRegular,
        width: 34,

        '@media (forced-colors: none) and (prefers-color-scheme: light)': {
          '&:active': {
            backgroundColor: '#EDEBE9' // neutralLight (gray30)
          },

          '&:not(:active):hover': {
            backgroundColor: '#F3F2F1' // neutralLighter (gray20)
          }
        },

        '@media (forced-colors: none) and (prefers-color-scheme: dark)': {
          borderColor: 'white',

          '&:active': {
            backgroundColor: '#292827' // neutralLight (gray30)
          },

          '&:not(:active):hover': {
            backgroundColor: '#252423' // neutralLight (gray30)
          }
        }
      },

      '& .webchat__keyboard-help__close-button_image': {
        fill: '#323130', // neutralPrimary (gray160)
        height: 10,
        width: 10,

        '@media (forced-colors: active)': {
          fill: 'White'
        },

        '@media (forced-colors: none) and (prefers-color-scheme: dark)': {
          fill: '#F3F2F1' // neutralPrimary (gray160)
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

      '& .webchat__keyboard-help__notes-text': {
        margin: 0
      }
    }
  };
}

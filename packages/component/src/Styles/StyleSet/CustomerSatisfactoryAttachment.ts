const DARK_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: dark)';
const FORCED_COLORS_SELECTOR = '@media (forced-colors: active)';
const LIGHT_THEME_SELECTOR = '@media (forced-colors: none) and (prefers-color-scheme: light)';
const NOT_FORCED_COLORS_SELECTOR = '@media (forced-colors: none)';

const DISABLED_SELECTOR = '&:disabled, &[aria-disabled="true"]';
const NOT_DISABLED_SELECTOR = '&:not(:disabled):not([aria-disabled="true"])';

export default function CustomerSatisfactoryAttachment() {
  return {
    '&.webchat__customer-satisfactory': {
      alignItems: 'flex-start',
      display: 'flex',
      flexDirection: 'column',
      fontFamily: 'var(--webchat__font--primary)',
      gap: 8,
      padding: '10px 12px'
    },

    '& .webchat__customer-satisfactory__radio-group': {
      display: 'flex',
      flexDirection: 'column',
      gap: 8
    },

    '& .webchat__customer-satisfactory__label': {
      margin: 0
    },

    '& .webchat__customer-satisfactory__star-bar': {
      display: 'flex',

      [FORCED_COLORS_SELECTOR]: {
        color: 'ButtonBorder'
      },

      [NOT_FORCED_COLORS_SELECTOR]: {
        [DARK_THEME_SELECTOR]: {
          color: '#White'
        },

        [LIGHT_THEME_SELECTOR]: {
          color: '#242424'
        }
      }
    },

    '& .webchat__customer-satisfactory__star-button': {
      backgroundColor: 'transparent',
      color: 'unset',
      border: 0,
      borderRadius: 5.33,
      height: 32,
      padding: 0,
      width: 32,

      [NOT_DISABLED_SELECTOR]: {
        '&:hover': {
          [NOT_FORCED_COLORS_SELECTOR]: {
            color: 'var(--webchat__color--accent)'
          }
        },

        '&:active': {
          [NOT_FORCED_COLORS_SELECTOR]: {
            // Web Chat currently don't have an accent color for active.
            color: 'var(--webchat__color--accent)'
          }
        }
      },

      '&:focus-visible': {
        outlineOffset: -2.67,
        outlineStyle: 'solid',
        outlineWidth: 2.67,

        [NOT_FORCED_COLORS_SELECTOR]: {
          [DARK_THEME_SELECTOR]: {
            outlineColor: '#ADADAD'
          },

          [LIGHT_THEME_SELECTOR]: {
            outlineColor: '#616161'
          }
        }
      }
    },

    '&:not(.webchat__customer-satisfactory--submitted) .webchat__customer-satisfactory__star-button': {
      cursor: 'pointer'
    },

    '& .webchat__customer-satisfactory__rating-value': {
      alignSelf: 'center',
      marginLeft: 4
    },

    '& .webchat__customer-satisfactory__submit-button': {
      appearance: 'none',
      backgroundColor: 'Canvas',
      borderRadius: 4,
      borderStyle: 'solid',
      borderWidth: 1,
      fontFamily: 'unset',
      fontSize: 14,
      fontWeight: 600,
      padding: '5px 12px',

      [FORCED_COLORS_SELECTOR]: {
        borderColor: 'ButtonBorder'
      },

      [NOT_FORCED_COLORS_SELECTOR]: {
        borderColor: '#D1D1D1'
      }
    },

    '&.webchat__customer-satisfactory--submitted .webchat__customer-satisfactory__submit-button': {
      backgroundColor: 'unset',
      borderColor: 'transparent',
      outline: 0,
      paddingLeft: 0,
      paddingRight: 0
    },

    '&.webchat__customer-satisfactory--submitted .webchat__customer-satisfactory__submit-check-mark': {
      color: '#107C10'
    },

    '&:not(.webchat__customer-satisfactory--submitted) .webchat__customer-satisfactory__submit-button': {
      [DISABLED_SELECTOR]: {
        [FORCED_COLORS_SELECTOR]: {
          color: 'GrayText'
        },

        [NOT_FORCED_COLORS_SELECTOR]: {
          backgroundColor: '#F0F0F0',
          color: '#BDBDBD'
        }
      }
    },

    '& .webchat__customer-satisfactory__submit-button-text': {
      alignItems: 'center',
      display: 'flex',
      gap: 8,
      minHeight: 20
    }
  };
}

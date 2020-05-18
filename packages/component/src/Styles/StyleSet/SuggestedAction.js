/* eslint no-magic-numbers: "off" */

export default function createSuggestedActionStyle({
  accent,
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBackground,
  suggestedActionBorderColor,
  suggestedActionBorderStyle,
  suggestedActionBorderWidth,
  suggestedActionBorderRadius,
  suggestedActionImageHeight,
  suggestedActionTextColor,
  suggestedActionDisabledBackground,
  suggestedActionDisabledBorderColor,
  suggestedActionDisabledBorderStyle,
  suggestedActionDisabledBorderWidth,
  suggestedActionDisabledTextColor,
  suggestedActionHeight,
  subtle
}) {
  return {
    '&.webchat__suggested-action': {
      paddingBottom: paddingRegular / 2,
      paddingLeft: paddingRegular / 2,
      paddingRight: paddingRegular / 2,
      paddingTop: paddingRegular / 2,
      position: 'relative',

      '& .webchat__suggested-action__button': {
        alignItems: 'center',
        borderRadius: suggestedActionBorderRadius,
        fontFamily: primaryFont,
        fontSize: 'inherit',
        height: suggestedActionHeight,
        justifyContent: 'center',
        paddingLeft: paddingWide,
        paddingRight: paddingWide,

        '&:disabled, &[aria-disabled="true"]': {
          background: suggestedActionDisabledBackground || suggestedActionBackground,
          borderColor: suggestedActionDisabledBorderColor,
          borderStyle: suggestedActionDisabledBorderStyle,
          borderWidth: suggestedActionDisabledBorderWidth,
          color: suggestedActionDisabledTextColor || subtle
        },

        '&:not(:disabled):not([aria-disabled="true"])': {
          background: suggestedActionBackground,
          borderColor: suggestedActionBorderColor || accent,
          borderStyle: suggestedActionBorderStyle,
          borderWidth: suggestedActionBorderWidth,
          color: suggestedActionTextColor || accent
        }
      },

      '& .webchat__suggested-action__image': {
        height: suggestedActionImageHeight,

        ':not(.webchat__suggested-action__image--rtl)': {
          paddingRight: paddingRegular
        },
        '.webchat__suggested-action__image--rtl': {
          paddingLeft: paddingRegular
        }
      },

      '& .webchat__suggested-action__button-text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      }
    }
  };
}

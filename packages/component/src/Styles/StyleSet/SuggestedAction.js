/* eslint no-magic-numbers: "off" */

export default function createSuggestedActionStyle({
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBackground,
  suggestedActionBorder,
  suggestedActionBorderRadius,
  suggestedActionImageHeight,
  suggestedActionTextColor,
  suggestedActionDisabledBackground,
  suggestedActionDisabledBorder,
  suggestedActionDisabledTextColor,
  suggestedActionHeight
}) {
  return {
    paddingBottom: paddingRegular,
    paddingLeft: paddingRegular / 2,
    paddingRight: paddingRegular / 2,
    paddingTop: paddingRegular,

    '& > button': {
      alignItems: 'center',
      borderRadius: suggestedActionBorderRadius,
      fontFamily: primaryFont,
      fontSize: 'inherit',
      height: suggestedActionHeight,
      paddingLeft: paddingWide,
      paddingRight: paddingWide,

      '&:disabled': {
        background: suggestedActionDisabledBackground,
        border: suggestedActionDisabledBorder,
        color: suggestedActionDisabledTextColor
      },

      '&:not(:disabled)': {
        background: suggestedActionBackground,
        border: suggestedActionBorder,
        color: suggestedActionTextColor
      },

      '& > img': {
        height: suggestedActionImageHeight,
        paddingRight: paddingRegular
      }
    }
  };
}

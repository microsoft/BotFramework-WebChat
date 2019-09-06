/* eslint no-magic-numbers: "off" */

export default function createSuggestedActionStyle({
  accent,
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBackground,
  suggestedActionBorder,
  suggestedActionBorderColor,
  suggestedActionBorderStyle,
  suggestedActionBorderWidth,
  suggestedActionBorderRadius,
  suggestedActionImageHeight,
  suggestedActionTextColor,
  suggestedActionDisabledBackground,
  suggestedActionDisabledBorder,
  suggestedActionDisabledBorderColor,
  suggestedActionDisabledBorderStyle,
  suggestedActionDisabledBorderWidth,
  suggestedActionDisabledTextColor,
  suggestedActionHeight,
  subtle
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
        background: suggestedActionDisabledBackground || suggestedActionBackground,
        border: suggestedActionDisabledBorder,
        borderColor: !suggestedActionDisabledBorder ? suggestedActionDisabledBorderColor : null,
        borderStyle: !suggestedActionDisabledBorder ? suggestedActionDisabledBorderStyle : null,
        borderWidth: !suggestedActionDisabledBorder ? suggestedActionDisabledBorderWidth : null,
        color: suggestedActionDisabledTextColor || subtle
      },

      '&:not(:disabled)': {
        background: suggestedActionBackground,
        border: suggestedActionBorder,
        borderColor: !suggestedActionBorder ? suggestedActionBorderColor || accent : null,
        borderStyle: !suggestedActionBorder ? suggestedActionBorderStyle : null,
        borderWidth: !suggestedActionBorder ? suggestedActionBorderWidth : null,
        color: suggestedActionTextColor || accent
      },

      '& > img': {
        height: suggestedActionImageHeight,
        paddingRight: paddingRegular
      }
    }
  };
}

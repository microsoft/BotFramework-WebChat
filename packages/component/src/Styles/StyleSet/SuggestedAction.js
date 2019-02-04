export default function createSuggestedActionStyle({
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBackground,
  suggestedActionBorder,
  suggestedActionBorderRadius,
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
      fontFamily: primaryFont,
      fontSize: 'inherit',
      height: suggestedActionHeight,
      paddingLeft: paddingWide,
      paddingRight: paddingWide,
      borderRadius: suggestedActionBorderRadius,

      '&:disabled': {
        background: suggestedActionDisabledBackground,
        border: suggestedActionDisabledBorder,
        color: suggestedActionDisabledTextColor
      },

      '&:not(:disabled)': {
        background: suggestedActionBackground,
        border: suggestedActionBorder,
        color: suggestedActionTextColor,
        cursor: 'pointer'
      }
    }
  };
}

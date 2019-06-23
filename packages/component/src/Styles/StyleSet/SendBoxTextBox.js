export default function createSendBoxTextBoxStyle({
  primaryFont,
  sendBoxBackground,
  sendBoxPlaceholderColor,
  sendBoxTextColor
}) {
  return {
    alignItems: 'center',
    fontFamily: primaryFont,

    '& > input': {
      backgroundColor: sendBoxBackground,
      border: 0,
      color: sendBoxTextColor,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      outline: 0,
      padding: 0,

      '&::placeholder': {
        color: sendBoxPlaceholderColor
      }
    }
  };
}

export default function createSendBoxTextBoxStyle({
  paddingRegular,
  primaryFont,
  sendBoxTextColor
}) {
  return  {
    alignItems: 'center',
    fontFamily: primaryFont,

    '& > input': {
      border: 0,
      color: sendBoxTextColor,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      outline: 0,
      paddingBottom: 0,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: 0
    }
  };
}

export default function createSendBoxTextBoxStyle({ primaryFont, sendBoxTextColor }) {
  return {
    alignItems: 'center',
    fontFamily: primaryFont,

    '& > input': {
      border: 0,
      color: sendBoxTextColor,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      outline: 0,
      padding: 0
    }
  };
}

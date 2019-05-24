export default function createSendBoxTextAreaStyle({
  paddingRegular,
  primaryFont,
  sendBoxMaxHeight,
  sendBoxTextColor
}) {
  return {
    alignItems: 'center',
    fontFamily: primaryFont,
    paddingBottom: paddingRegular,
    paddingLeft: paddingRegular,
    paddingRight: paddingRegular,
    paddingTop: paddingRegular,

    '& > div': {
      color: sendBoxTextColor,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      maxHeight: sendBoxMaxHeight,
      position: 'relative',
      width: 'inherit',

      '& > div': {
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        width: 'inherit',
        wordBreak: 'break-word'
      },

      '& > textarea': {
        border: 0,
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        left: 0,
        outline: 'none',
        padding: 0,
        position: 'absolute',
        resize: 'none',
        top: 0,
        width: '100%',
        wordBreak: 'break-word'
      }
    }
  };
}

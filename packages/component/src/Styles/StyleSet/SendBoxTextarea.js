export default function createSendBoxTextareaStyle({
  paddingRegular,
  primaryFont,
  sendBoxMaxHeight,
  sendBoxTextColor,
}) {
  return {
    alignItems: 'center',
    fontFamily: primaryFont,
    paddingBottom: paddingRegular,
    paddingLeft: paddingRegular,
    paddingRight: paddingRegular,
    paddingTop: paddingRegular,

    '& > div': {
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      maxHeight: sendBoxMaxHeight,
      paddingBottom: 0,
      paddingTop: 0,
      position:'relative',
      width: 'inherit',

      '& > div': {
        color: sendBoxTextColor,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        overflow: 'scroll',
        whiteSpace: 'pre-wrap',
        width: '100%',
      },

      '& > textarea': {
        border: 0,
        color: sendBoxTextColor,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        left: 0,
        outline: 'none',
        padding: 0,
        position: 'absolute',
        resize: 'none',
        top: 0,
        width: '100%'
      }
    }
  }
}

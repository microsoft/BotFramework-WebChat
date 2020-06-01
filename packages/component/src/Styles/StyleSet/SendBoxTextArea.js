export default function createSendBoxTextAreaStyle({
  paddingRegular,
  primaryFont,
  sendBoxBackground,
  sendBoxMaxHeight,
  sendBoxPlaceholderColor,
  sendBoxTextColor,
  subtle
}) {
  return {
    '&.webchat__send-box-text-box': {
      alignItems: 'center',
      fontFamily: primaryFont,
      paddingBottom: paddingRegular,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: paddingRegular,

      '& .webchat__send-box-text-box__text-area': {
        backgroundColor: sendBoxBackground,
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
        wordBreak: 'break-word',

        '&::placeholder': {
          color: sendBoxPlaceholderColor || subtle
        }
      },

      '& .webchat__send-box-text-box__text-area-box': {
        color: sendBoxTextColor,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        maxHeight: sendBoxMaxHeight,
        position: 'relative',
        width: 'inherit'
      },

      '& .webchat__send-box-text-box__text-area-doppelganger': {
        color: 'Transparent',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        overflowY: 'auto',
        whiteSpace: 'pre-wrap',
        width: 'inherit',
        wordBreak: 'break-word'
      }
    }
  };
}

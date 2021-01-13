export default function AutoResizeTextArea({ primaryFont }) {
  return {
    '&.webchat__auto-resize-textarea': {
      fontFamily: primaryFont,
      position: 'relative',

      '& .webchat__auto-resize-textarea__doppelganger': {
        whiteSpace: 'pre-wrap'
      },

      '& .webchat__auto-resize-textarea__textarea': {
        appearance: 'none' /* We should tell the user agent we are revamping the style */,
        border: 0,
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        left: 0,
        margin: 0,
        outline: 0,
        overflow: 'hidden' /* For hiding the scroll bar in IE11 */,
        padding: 0,
        position: 'absolute',
        resize: 'none' /* Hiding the textarea resizing handle (on lower-right hand corner) */,
        top: 0,
        width: '100%'
      }
    }
  };
}

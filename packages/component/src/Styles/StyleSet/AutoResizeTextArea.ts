import { StrictStyleOptions } from 'botframework-webchat-api';

export default function AutoResizeTextArea({ primaryFont }: StrictStyleOptions) {
  return {
    '&.webchat__auto-resize-textarea': {
      fontFamily: primaryFont,
      overflow: 'hidden',
      position: 'relative',

      '& .webchat__auto-resize-textarea__doppelganger': {
        color: 'transparent',
        height: '100%',
        overflowY: 'auto',
        userSelect: 'none',
        width: 'inherit',
        whiteSpace: 'pre-wrap',
        wordBreak: 'break-word'
      },

      '& .webchat__auto-resize-textarea__textarea': {
        appearance: 'none' /* Prevent browser styling */,
        backgroundColor: 'transparent',
        border: 0,
        color: 'inherit',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        height: '100%',
        left: 0,
        margin: 0,
        outline: 0,
        overflowY: 'auto',
        padding: 0,
        position: 'absolute',
        resize: 'none' /* Hides the textarea resizing handle (on lower-right hand corner) */,
        top: 0,
        width: '100%',
        wordBreak: 'break-word'
      }
    }
  };
}

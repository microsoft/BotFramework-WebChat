export default function createChatHistoryBoxStyleSet() {
  return {
    '&.webchat__chat-history-box': {
      display: 'flex',
      flex: 'auto',
      overflow: ['clip', 'hidden'],
      position: 'relative'
    },

    '.webchat__chat-history-box__toolbar': {
      bottom: '5px',
      isolation: 'isolate',
      position: 'absolute',
      right: '20px',
      zIndex: 1,

      '&.webchat__chat-history-box__toolbar--rtl': {
        left: '20px'
      }
    }
  };
}

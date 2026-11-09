/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/ChatHistory/ChatHistoryBox.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
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

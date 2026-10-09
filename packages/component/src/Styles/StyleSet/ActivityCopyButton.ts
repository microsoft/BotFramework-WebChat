export default function createActivityButtonStyle() {
  return {
    '&.webchat__activity-copy-button': {
      overflow: ['clip', 'hidden'],
      position: 'relative',

      '& .webchat__activity-copy-button__copied-text': {
        alignItems: 'center',
        backgroundColor: '#fff',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        position: 'absolute',
        visibility: 'hidden',
        width: '100%'
      },

      '&.webchat__activity-copy-button--copied': {
        '.webchat__activity-copy-button__copied-text': {
          visibility: 'visible'
        },

        '.webchat__activity-button__icon, .webchat__activity-button__text': {
          visibility: 'hidden'
        }
      }
    }
  };
}

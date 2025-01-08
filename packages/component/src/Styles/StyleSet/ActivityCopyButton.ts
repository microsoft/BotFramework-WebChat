export default function createActivityButtonStyle() {
  return {
    '&.webchat__activity-copy-button': {
      overflow: 'hidden',
      position: 'relative',

      '& .webchat__activity-copy-button__copied-text': {
        alignItems: 'center',
        backgroundColor: '#fff',
        display: 'flex',
        height: '100%',
        justifyContent: 'center',
        opacity: 0,
        position: 'absolute',
        width: '100%'
      },

      '&.webchat__activity-copy-button--copied .webchat__activity-copy-button__copied-text': {
        animation: 'webchat__activity-copy-button__copied-animation 0.5s linear'
      },

      '@keyframes webchat__activity-copy-button__copied-animation': {
        '0%': {
          opacity: '100%'
        },

        '100%': {
          opacity: 'unset'
        }
      }
    }
  };
}

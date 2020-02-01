export default function createNotificationStyleSet({ paddingRegular }) {
  return {
    alignItems: 'center',
    minHeight: 32,

    '&.webchat__notification--error': {
      color: '#3B3A39',
      fill: '#3B3A39'
    },

    '&.webchat__notification--info': {
      color: '#105E7D',
      fill: '#105E7D'
    },

    '&.webchat__notification--success': {
      color: '#107C10',
      fill: '#107C10'
    },

    '&.webchat__notification--warn': {
      color: '#3B3A39',
      fill: '#3B3A39'
    },

    '& .webchat__notification__iconBox': {
      alignItems: 'center',
      alignSelf: 'flex-start',
      display: 'flex',
      height: 32,
      justifyContent: 'center',
      width: 36
    },

    '& .webchat__notification__dismissButton': {
      alignItems: 'center',
      alignSelf: 'flex-start',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      height: 32,
      justifyContent: 'center',
      padding: 0,
      width: 32
    },

    '& .webchat__notification__name': {
      paddingBottom: 6,
      paddingTop: 6
    }
  };
}

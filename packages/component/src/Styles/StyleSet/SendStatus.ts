export default function createSendStatusStyle() {
  return {
    '&.webchat__activity-status': {
      color: 'var(--webchat__color--timestamp)',
      fontFamily: 'var(--webchat__font--primary)',
      fontSize: 'var(--webchat__font-size--small)',
      marginTop: 'calc(var(--webchat__padding--regular) / 2)'
    },

    '&.webchat__activity-status--slotted': {
      display: 'inline-flex',
      gap: 4
    },

    '& .webchat__activity-status__originator': {
      alignItems: 'center',

      '&.webchat__activity-status__originator--has-link': {
        color: 'var(--webchat__color--accent)'
      }
    }
  };
}

export default function createSendStatusStyle() {
  return {
    '&.webchat__activity-status': {
      color: 'var(--webchat__timestamp-color)',
      fontFamily: 'var(--webchat__primary-font)',
      fontSize: 'var(--webchat__font-size-small)',
      marginTop: 'calc(var(--webchat__padding-regular) / 2)'
    },

    '&.webchat__activity-status--slotted': {
      display: 'inline-flex',
      gap: 4
    },

    '& .webchat__activity-status__originator': {
      alignItems: 'center',

      '&.webchat__activity-status__originator--has-link': {
        color: 'var(--webchat__accent-color)'
      }
    }
  };
}

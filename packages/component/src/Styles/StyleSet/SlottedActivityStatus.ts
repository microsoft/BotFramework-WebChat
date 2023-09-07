export default function createSlottedActivityStatus() {
  return {
    '&.webchat__slotted-activity-status': {
      alignItems: 'center',
      display: 'inline-flex',
      gap: 4,
      marginTop: 'calc(var(--webchat__padding-regular) / 2)',

      '& .webchat__slotted-activity-status__pipe': {
        fontSize: 'var(--webchat__font-size-small)'
      }
    }
  };
}

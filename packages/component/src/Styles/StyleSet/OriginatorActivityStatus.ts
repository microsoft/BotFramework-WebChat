export default function createOriginatorActivityStatusStyle() {
  return {
    '&.webchat__originator-activity-status': {
      alignItems: 'center',
      /* These are the fonts used in Web Chat default style options. */
      fontFamily: 'var(--webchat__font--primary)',
      fontSize: '80%',

      '&.webchat__originator-activity-status--link': {
        color: 'var(--webchat__color--accent)'
      }
    }
  };
}

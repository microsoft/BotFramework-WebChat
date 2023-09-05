export default function createOriginatorActivityStatusStyle() {
  return {
    '&.webchat__originator-activity-status': {
      alignItems: 'center',
      /* These are the fonts used in Web Chat default style options. */
      fontFamily: "Calibri, 'Helvetica Neue', Arial, sans-serif",
      fontSize: '80%',
      paddingTop: 5,

      '&.webchat__originator-activity-status--link': {
        color: 'var(--pva__accent-color)'
      },

      '&.webchat__originator-activity-status--link:hover': {
        color: 'var(--pva__semantic-colors--link-hovered)'
      }

      // '&.webchat__originator-activity-status--link-hint': {
      //   color: 'transparent',
      //   height: 1,
      //   overflow: 'hidden',
      //   position: 'absolute',
      //   top: 0,
      //   whiteSpace: 'nowrap',
      //   width: 1
      // }
    }
  };
}

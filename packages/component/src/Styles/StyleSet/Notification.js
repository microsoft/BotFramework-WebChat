export default function createNotificationStyleSet({
  notificationBarHeight,
  notificationErrorColor,
  notificationFontSize,
  notificationIconWidth,
  notificationInfoColor,
  notificationSuccessColor,
  notificationTextPadding,
  notificationWarnColor,
  primaryFont
}) {
  return {
    alignItems: 'center',
    fontFamily: primaryFont,
    fontSize: notificationFontSize,
    minHeight: notificationBarHeight,

    '&.webchat__notification--error': {
      color: notificationErrorColor,
      fill: notificationErrorColor
    },

    '&.webchat__notification--info': {
      color: notificationInfoColor,
      fill: notificationInfoColor
    },

    '&.webchat__notification--success': {
      color: notificationSuccessColor,
      fill: notificationSuccessColor
    },

    '&.webchat__notification--warn': {
      color: notificationWarnColor,
      fill: notificationWarnColor
    },

    '& .webchat__notification__iconBox': {
      alignItems: 'center',
      alignSelf: 'flex-start',
      display: 'flex',
      height: notificationBarHeight,
      justifyContent: 'center',
      width: notificationIconWidth
    },

    '& .webchat__notification__dismissButton': {
      alignItems: 'center',
      alignSelf: 'flex-start',
      appearance: 'none',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      height: notificationBarHeight,
      justifyContent: 'center',
      padding: 0,
      width: notificationBarHeight
    },

    '& .webchat__notification__text': {
      paddingBottom: notificationTextPadding,
      paddingTop: notificationTextPadding
    }
  };
}

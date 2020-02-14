export default function createErrorNotificationStyle({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  failedConnectivity,
  primaryFont
}) {
  return {
    alignItems: 'center',
    color: failedConnectivity,
    display: 'flex',
    fontFamily: primaryFont,
    fontSize: connectivityTextSize,
    fontWeight: 'bold',
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,

    '& > svg': {
      fill: failedConnectivity,

      '&:not(.webchat__error--rtl)': {
        paddingRight: connectivityIconPadding
      },
      '.webchat__error--rtl': {
        paddingLeft: connectivityIconPadding
      }
    }
  };
}

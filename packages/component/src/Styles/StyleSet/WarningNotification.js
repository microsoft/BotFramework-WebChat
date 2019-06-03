export default function createWarningNotificationStyle({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  primaryFont,
  slowConnectivity,
  notificationText
}) {
  return {
    alignItems: 'center',
    color: notificationText,
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    fontFamily: primaryFont,
    fontSize: connectivityTextSize,
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,

    '& > svg': {
      fill: slowConnectivity,
      paddingRight: connectivityIconPadding
    }
  };
}

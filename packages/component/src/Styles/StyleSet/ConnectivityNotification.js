export default function ({
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  notificationText,
  primaryFont
}) {
  return {
    alignItems: 'center',
    color: notificationText,
    display: 'flex',
    fontFamily: primaryFont,
    fontSize: connectivityTextSize,
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom
  };
}

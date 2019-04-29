export default function ({
  connectivityMarginLeftRight,
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
    marginBottom: 0,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: 0,
  };
}

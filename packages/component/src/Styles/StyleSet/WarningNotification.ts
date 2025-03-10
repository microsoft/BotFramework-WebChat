import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createWarningNotificationStyle({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  primaryFont,
  slowConnectivity,
  notificationText
}: StrictStyleOptions) {
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

      '&:not(webchat__warning--rtl)': {
        paddingRight: connectivityIconPadding
      },

      '&.webchat__warning--rtl': {
        paddingLeft: connectivityIconPadding
      }
    }
  };
}

import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/ConnectivityStatus/ConnectivityStatus.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createErrorNotificationStyle({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  failedConnectivity,
  primaryFont
}: StrictStyleOptions) {
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

      '&.webchat__error--rtl': {
        paddingLeft: connectivityIconPadding
      }
    }
  };
}

import { primarySmallFont } from '../Fonts';

export default function ({
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityIconPadding,
  connectivityTextSize,
  failedConnectivity,

}) {
  return {
    ...primarySmallFont,
    alignItems: 'center',
    color: failedConnectivity,
    display: 'flex',
    fontWeight: 'bold',
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,
    fontSize: connectivityTextSize,

    '& > svg': {
      fill: failedConnectivity,
      paddingRight: connectivityIconPadding,
    },
  };
}

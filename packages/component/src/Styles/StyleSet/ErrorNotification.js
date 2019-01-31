import { primarySmallFont } from '../Fonts';

export default function ({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  failedConnectivity,

}) {
  return {
    ...primarySmallFont,
    alignItems: 'center',
    color: failedConnectivity,
    display: 'flex',
    fontSize: connectivityTextSize,
    fontWeight: 'bold',
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,

    '& > svg': {
      fill: failedConnectivity,
      paddingRight: connectivityIconPadding,
    },
  };
}

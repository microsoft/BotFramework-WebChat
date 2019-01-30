import { primarySmallFont } from '../Fonts';

export default function ({
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityIconPadding,
  connectivityTextSize,
  slowConnectivity,
  slowConnectivityText,

}) {
  return {
    ...primarySmallFont,
    alignItems: 'center',
    color: slowConnectivityText,
    display: 'flex',
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,
    fontSize: connectivityTextSize,

    '& > svg': {
      fill: slowConnectivity,
      paddingRight: connectivityIconPadding,
    }
  };
}

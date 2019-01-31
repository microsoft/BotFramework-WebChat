import { primarySmallFont } from '../Fonts';

export default function ({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  slowConnectivity,
  slowConnectivityText,

}) {
  return {
    ...primarySmallFont,
    alignItems: 'center',
    color: slowConnectivityText,
    display: 'flex',
    fontSize: connectivityTextSize,
    marginBottom: connectivityMarginTopBottom,
    marginLeft: connectivityMarginLeftRight,
    marginRight: connectivityMarginLeftRight,
    marginTop: connectivityMarginTopBottom,

    '& > svg': {
      fill: slowConnectivity,
      paddingRight: connectivityIconPadding,
    }
  };
}

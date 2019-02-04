export default function ({
  connectivityIconPadding,
  connectivityMarginLeftRight,
  connectivityMarginTopBottom,
  connectivityTextSize,
  primaryFont,
  slowConnectivity,
  slowConnectivityText,

}) {
  return {
    alignItems: 'center',
    color: slowConnectivityText,
    display: 'flex',
    fontFamily: primaryFont,
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

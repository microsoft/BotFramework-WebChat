export default function ({
  accent,
  bubbleTextColor,
  paddingRegular,
  primaryFont
}) {
  return {
    fontFamily: primaryFont,

    '& > a': {
      alignItems: 'center',
      color: bubbleTextColor,
      display: 'flex',
      padding: paddingRegular,
      textDecoration: 'none',

      '&:focus': {
        backgroundColor: 'rgba(0, 0, 0, .1)'
      },

      '& > .icon': {
        fill: accent,
        marginLeft: paddingRegular,
        padding: paddingRegular
      },

      '& > .details': {
        flex: 1,

        '& > .name': {
          color: accent
        }
      }
    }
  };
}

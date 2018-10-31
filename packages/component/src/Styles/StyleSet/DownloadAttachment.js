import { primaryFont } from '../Fonts';

export default function ({
  accent,
  bubbleTextColor,
  paddingRegular
}) {
  return {
    ...primaryFont,

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

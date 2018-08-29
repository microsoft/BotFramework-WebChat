import { primaryFont } from '../Fonts';

export default function ({
  accent,
  bubbleTextColor
}) {
  return {
    ...primaryFont,

    '& > a': {
      alignItems: 'center',
      color: bubbleTextColor,
      display: 'flex',
      padding: 10,
      textDecoration: 'none',

      '& > .icon': {
        fill: accent,
        marginLeft: 10,
        padding: 10
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

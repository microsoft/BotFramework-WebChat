import { primaryFont, primarySmallFont } from '../Fonts';

export default function ({
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
        marginRight: 10,
        padding: 10
      },

      '& > .details > .url': {
        ...primarySmallFont
      }
    }
  };
}

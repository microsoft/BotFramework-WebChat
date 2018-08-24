import {
  primarySmallFont
} from '../Fonts';

export default function createTimestampStyle({
  accent,
  timestampColor
}) {
  return {
    ...primarySmallFont,

    color: timestampColor,
    paddingTop: 5,

    '& > .retry': {
      backgroundColor: 'transparent',
      border: 0,
      color: accent,
      cursor: 'pointer',
      fontFamily: 'inherit',
      padding: 0
    }
  };
}

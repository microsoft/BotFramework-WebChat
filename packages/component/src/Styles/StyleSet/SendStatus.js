import {
  primarySmallFont
} from '../Fonts';

export default function createSendStatusStyle({
  accent,
  timestampColor
}) {
  return {
    ...primarySmallFont,

    color: timestampColor,
    paddingTop: 5,

    '& > button': {
      backgroundColor: 'transparent',
      border: 0,
      color: accent,
      cursor: 'pointer',
      fontFamily: 'inherit',
      padding: 0
    }
  };
}

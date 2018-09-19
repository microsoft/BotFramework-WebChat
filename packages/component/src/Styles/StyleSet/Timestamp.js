import {
  primarySmallFont
} from '../Fonts';

export default function createTimestampStyle({
  timestampColor
}) {
  return {
    ...primarySmallFont,

    color: timestampColor,
    paddingTop: 5
  };
}

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendStatusStyle({
  fontSizeSmall,
  primaryFont,
  subtle,
  timestampColor
}: StrictStyleOptions) {
  return {
    color: timestampColor || subtle,
    fontFamily: primaryFont,
    fontSize: fontSizeSmall,
    paddingTop: 5
  };
}

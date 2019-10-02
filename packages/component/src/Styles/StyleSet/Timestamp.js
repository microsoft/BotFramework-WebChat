export default function createTimestampStyle({ fontSizeSmall, primaryFont, subtle, timestampColor }) {
  return {
    color: timestampColor || subtle,
    fontFamily: primaryFont,
    fontSize: fontSizeSmall,
    paddingTop: 5
  };
}

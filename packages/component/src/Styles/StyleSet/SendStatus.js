export default function createSendStatusStyle({ accent, fontSizeSmall, primaryFont, subtle, timestampColor }) {
  return {
    color: timestampColor || subtle,
    fontFamily: primaryFont,
    fontSize: fontSizeSmall,
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

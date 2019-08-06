export default function createUploadAttachmentStyle({ accent, bubbleTextColor, paddingRegular, primaryFont }) {
  return {
    color: bubbleTextColor,
    fontFamily: primaryFont,
    padding: paddingRegular,
    textDecoration: 'none',

    '& > .name': {
      color: accent
    }
  };
}

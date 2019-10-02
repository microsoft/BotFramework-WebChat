export default function createDownloadAttachmentStyle({ accent, bubbleTextColor, paddingRegular, primaryFont }) {
  return {
    fontFamily: primaryFont,

    '& > a': {
      alignItems: 'center',
      color: bubbleTextColor,
      // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
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

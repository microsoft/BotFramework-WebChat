export default function({
  accent,
  bubbleAttachmentBackground,
  bubbleAttachmentBorderColor,
  bubbleAttachmentBorderRadius,
  bubbleAttachmentBorderStyle,
  bubbleAttachmentBorderWidth,
  bubbleAttachmentTextColor,
  paddingRegular,
  primaryFont
}) {
  return {
    '& .ac-adaptiveCard': {
      backgroundColor: bubbleAttachmentBackground,
      borderColor: bubbleAttachmentBorderColor,
      borderRadius: bubbleAttachmentBorderRadius,
      borderStyle: bubbleAttachmentBorderStyle,
      borderWidth: bubbleAttachmentBorderWidth
    },

    '& p': {
      color: bubbleAttachmentTextColor
    },

    '& .ac-pushButton': {
      backgroundColor: 'White',
      borderStyle: 'solid',
      borderWidth: 1,
      color: 'accent',
      fontWeight: 600,
      padding: paddingRegular
    },

    '& .ac-multichoiceInput': {
      padding: paddingRegular
    },

    '& .ac-input, & .ac-inlineActionButton, & .ac-quickActionButton': {
      fontFamily: primaryFont
    }
  };
}

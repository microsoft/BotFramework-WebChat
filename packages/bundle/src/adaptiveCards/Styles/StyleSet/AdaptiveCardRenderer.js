export default function({ accent, paddingRegular, primaryFont }) {
  return {
    '& .ac-pushButton': {
      backgroundColor: 'White',
      borderStyle: 'solid',
      borderWidth: 1,
      color: accent,
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

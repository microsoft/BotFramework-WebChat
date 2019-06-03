export default function({ accent, paddingRegular }) {
  return {
    '& .ac-pushButton': {
      backgroundColor: 'White',
      borderStyle: 'solid',
      borderWidth: 1,
      color: accent,
      fontWeight: 'bold',
      padding: paddingRegular
    },

    '& .ac-multichoiceInput': {
      padding: paddingRegular
    }
  };
}

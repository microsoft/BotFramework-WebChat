export default function ({
  accent
}) {
  return {
    '& .ac-pushButton': {
        backgroundColor: 'White',
        borderStyle    : 'solid',
        borderWidth    : 1,
        color          : accent,
        fontWeight     : 'bold',
        padding        : 10
    },

    '& .ac-multichoiceInput': {
      padding: 10
    }
  };
}
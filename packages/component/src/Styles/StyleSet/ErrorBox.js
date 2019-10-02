export default function createErrorBoxStyle({ monospaceFont, primaryFont }) {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    flexDirection: 'column',
    fontFamily: primaryFont,
    margin: 0,
    minHeight: 20,
    maxHeight: 200,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',

    '& > :first-child': {
      backgroundColor: '#EF0000',
      color: 'White',
      padding: '5px 10px'
    },

    '& > :last-child': {
      borderColor: '#EF0000',
      borderStyle: 'dashed',
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderTopWidth: 0,
      margin: 0,
      overflowY: 'auto',
      padding: 10,

      '& > pre': {
        fontFamily: monospaceFont,
        fontSize: '60%',
        margin: 0
      }
    }
  };
}

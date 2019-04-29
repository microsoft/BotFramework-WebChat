export default function createActivityStyle({ paddingRegular }) {
  return {
    marginBottom: paddingRegular,
    overflowX: 'hidden',

    '&:first-child': {
      marginTop: paddingRegular
    }
  };
}

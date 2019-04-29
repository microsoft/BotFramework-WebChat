export default function createActivityStyle({ paddingRegular }) {
  return {
    marginBottom: paddingRegular,

    '&:first-child': {
      marginTop: paddingRegular
    }
  };
}

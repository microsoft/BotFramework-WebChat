import { primaryFont } from  '../Fonts';

export default function createSuggestedActionStyle({ accent }) {
  return {
    paddingBottom: 10,
    paddingLeft: 5,
    paddingRight: 5,
    paddingTop: 10,

    '& > button': {
      ...primaryFont,

      backgroundColor: 'White',
      borderColor: accent,
      borderStyle: 'solid',
      borderWidth: 2,
      color: accent,
      cursor: 'pointer',
      fontSize: 16,
      height: 40,

      paddingLeft: 20,
      paddingRight: 20
    }
  };
}

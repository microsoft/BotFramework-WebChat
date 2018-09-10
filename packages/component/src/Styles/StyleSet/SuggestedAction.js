import { primaryFont } from  '../Fonts';

export default function createSuggestedActionStyle({
  accent,
  paddingRegular
}) {
  return {
    paddingBottom: paddingRegular,
    paddingLeft: paddingRegular / 2,
    paddingRight: paddingRegular / 2,
    paddingTop: paddingRegular,

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

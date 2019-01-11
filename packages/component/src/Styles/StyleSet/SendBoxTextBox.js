import {
  primaryFont
} from '../Fonts';

export default function createSendBoxTextBoxStyle({
  paddingRegular,
  sendBoxTextColor
}) {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: 0,
      color: sendBoxTextColor,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      outline: 0,
      paddingBottom: 0,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: 0
    }
  };
}

import {
  primaryFont
} from '../Fonts';

export default function createSendBoxTextBoxStyle() {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: 0,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%',
      paddingBottom: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 0
    }
  };
}

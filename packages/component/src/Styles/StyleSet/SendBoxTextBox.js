import {
  primaryFont
} from '../Fonts';

export default function createSendBoxTextBoxStyle({
  paddingRegular
}) {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: '1px solid #cccccc',
      fontFamily: 'inherit',
      height: '35px',
      margin: '12px',
      borderRadius: '18px',
      fontSize: '16px',
      outline: 0,
      color: '#333',
      paddingBottom: 0,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: 0
    }
  };
}

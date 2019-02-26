import {
  primaryFont
} from '../Fonts';

export default function createSendBoxTextBoxStyle({
  paddingRegular,
  sendBoxTextBoxBorderColor
}) {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: '1px solid #cccccc',
      fontFamily: 'inherit',
      height: '35px',
      margin: '0 12px',
      borderRadius: '18px',
      fontSize: '16px',
      outline: 0,
      color: '#333',
      paddingBottom: 0,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: 0,
      transition: 'box-shadow 0.3s ease-in-out'
    },

    '& > input:focus': {
        border: '1px solid ' + sendBoxTextBoxBorderColor,
        boxShadow: 'inset 0 0 3px 1px rgba(198, 198, 198, 0.5)'
    }
  };
}

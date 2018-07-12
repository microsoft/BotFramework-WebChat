import {
  primaryFont
} from '../Fonts';

export default function createSendBoxStyle() {
  return  {
    ...primaryFont,

    alignItems: 'center',

    '& > input': {
      border: 0,
      fontFamily: 'inherit',
      fontSize: 'inherit',
      height: '100%'
    },

    '& > .dictation, & > .status, & > input': {
      flex: 1,
      paddingBottom: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 0
    },

    '& > .dictation > span:last-child': {
      opacity: .5
    },

    '& > button': {
      backgroundColor: 'Transparent',
      border: 0,
      cursor: 'pointer',
      height: '100%',
      padding: 0,
      width: 40
    }
  };
}

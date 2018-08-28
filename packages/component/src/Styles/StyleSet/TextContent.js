import {
  primaryFont
} from '../Fonts';

export default function () {
  return {
    ...primaryFont,
    margin: 0,
    minHeight: 20,
    padding: 10,

    '& > :first-child': {
      marginTop: 0
    },

    '& > :last-child': {
      marginBottom: 0
    },

    '&.markdown': {
      '& img': {
        maxWidth: '100%'
      },

      '& pre': {
        overflow: 'hidden'
      }
    }
  };
}

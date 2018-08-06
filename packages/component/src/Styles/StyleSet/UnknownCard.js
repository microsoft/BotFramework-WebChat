import {
  primaryFont
} from '../Fonts';

export default function createUnknownCardStyle() {
  return {
    ...primaryFont,
    borderColor: 'Red',
    borderStyle: 'dashed',
    borderWidth: 2,
    margin: 0,
    minHeight: 20,
    padding: 10,

    '& > :first-child': {
      marginTop: 0
    },

    '& > :last-child': {
      marginBottom: 0
    }
  };
}

import {
  primaryFont
} from '../Fonts';

export default function createUnknownCardStyle() {
  return {
    ...primaryFont,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    minHeight: 20,

    '& > :first-child': {
      backgroundColor: 'Red',
      color: 'White',
      padding: '5px 10px'
    },

    '& > :last-child': {
      borderColor: 'Red',
      borderStyle: 'dashed',
      borderBottomWidth: 2,
      borderLeftWidth: 2,
      borderRightWidth: 2,
      borderTopWidth: 0,
      margin: 0,
      overflowY: 'auto',
      padding: 10
    }
  };
}

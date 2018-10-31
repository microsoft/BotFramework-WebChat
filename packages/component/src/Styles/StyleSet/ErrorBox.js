import {
  monospaceSmallFont,
  primaryFont
} from '../Fonts';

export default function createErrorBoxStyle() {
  return {
    ...primaryFont,
    display: 'flex',
    flexDirection: 'column',
    margin: 0,
    minHeight: 20,
    maxHeight: 200,
    overflowY: 'auto',
    WebkitOverflowScrolling: 'touch',

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
      padding: 10,

      '& > pre': {
        ...monospaceSmallFont,
        fontSize: '60%',
        margin: 0
      }
    }
  };
}

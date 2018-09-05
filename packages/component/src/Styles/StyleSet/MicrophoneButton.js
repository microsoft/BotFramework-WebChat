import { primaryFont } from '../Fonts';

export default function createMicrophoneButtonStyle() {
  return {
    // TODO: This path should not know anything about the DOM tree of <IconButton>
    '&.dictating > button svg': {
      fill: '#F33'
    },

    '& > .dictation': {
      ...primaryFont,
      paddingBottom: 0,
      paddingLeft: 10,
      paddingRight: 10,
      paddingTop: 0,

      '& > span:last-child, &.status': {
        opacity: .5
      }
    }
  };
}

import { primaryFont } from '../Fonts';

export default function createMicrophoneButtonStyle({
  paddingRegular
}) {
  return {
    // TODO: This path should not know anything about the DOM tree of <IconButton>
    '&.dictating > button svg': {
      fill: '#F33'
    },

    '& > .dictation': {
      ...primaryFont,
      margin: 0,
      paddingBottom: 0,
      paddingLeft: paddingRegular,
      paddingRight: paddingRegular,
      paddingTop: 0,

      '& > span:last-child, &.status': {
        opacity: .5
      }
    }
  };
}

export default function createMicrophoneButtonStyle({
  paddingRegular
}) {
  return {
    // TODO: [P3] This path should not know anything about the DOM tree of <IconButton>
    '&.dictating > button svg': {
      fill: '#F33'
    }
  };
}

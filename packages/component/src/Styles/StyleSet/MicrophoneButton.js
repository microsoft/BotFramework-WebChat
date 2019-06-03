export default function createMicrophoneButtonStyle({ microphoneButtonColorOnDictate }) {
  return {
    // TODO: [P3] This path should not know anything about the DOM tree of <IconButton>
    '&.dictating > button svg': {
      fill: microphoneButtonColorOnDictate
    }
  };
}

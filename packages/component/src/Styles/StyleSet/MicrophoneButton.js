export default function createMicrophoneButtonStyle() {
  return {
    backgroundColor: 'Transparent',
    border: 0,
    cursor: 'pointer',
    height: '100%',
    padding: 0,
    width: 40,

    '& > svg': {
      fill: '#999'
    },

    '&:disabled > svg': {
      fill: '#CCC'
    },

    '&.dictating > svg': {
      fill: '#F33'
    }
  };
}

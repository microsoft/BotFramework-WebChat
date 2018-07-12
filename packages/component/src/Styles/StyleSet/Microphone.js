export default function createMicrophoneStyle() {
  return {
    backgroundColor: 'Transparent',
    border: 0,
    cursor: 'pointer',
    padding: 0,
    width: 40,

    '&:disabled > svg': {
      fill: '#CCC'
    }
  };
}

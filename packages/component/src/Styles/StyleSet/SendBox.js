export default function createSendBoxStyle({
  sendBoxHeight
}) {
  return {
    '& > .main': {
      backgroundColor: 'White',
      boxShadow: '0 0 5px rgba(0, 0, 0, .1)',
      height: sendBoxHeight
    }
  };
}

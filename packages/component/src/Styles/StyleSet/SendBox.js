export default function createSendBoxStyle({
  sendBoxHeight
}) {
  return {
    '& > .main': {
      backgroundColor: 'White',
      borderTop: 'solid 1px #E6E6E6',
      height: sendBoxHeight
    }
  };
}

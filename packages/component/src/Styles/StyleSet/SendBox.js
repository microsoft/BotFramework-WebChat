export default function createSendBoxStyle({
  sendBoxBackground,
  sendBoxHeight
}) {
  return {
    '& > .main': {
      backgroundColor: sendBoxBackground,
      borderTop: 'solid 1px #E6E6E6',
      height: sendBoxHeight
    }
  };
}

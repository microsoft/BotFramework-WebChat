export default function createSendBoxStyle({
  sendBoxBackground,
  sendBoxHeight,
  sendBoxBorderBottom,
  sendBoxBorderLeft,
  sendBoxBorderRight,
  sendBoxBorderTop
}) {
  return {
    '& > .main': {
      backgroundColor: sendBoxBackground,
      borderBottom: sendBoxBorderBottom,
      borderLeft: sendBoxBorderLeft,
      borderRight: sendBoxBorderRight,
      borderTop: sendBoxBorderTop,
      height: sendBoxHeight
    }
  };
}

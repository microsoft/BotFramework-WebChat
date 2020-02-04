export default function createSendBoxStyle({
  sendBoxBackground,
  sendBoxHeight,
  sendBoxBorderBottom,
  sendBoxBorderLeft,
  sendBoxBorderRadius,
  sendBoxBorderRight,
  sendBoxBorderTop
}) {
  return {
    '& > .main': {
      alignItems: 'stretch',
      backgroundColor: sendBoxBackground,
      borderBottom: sendBoxBorderBottom,
      borderLeft: sendBoxBorderLeft,
      borderRadius: sendBoxBorderRadius,
      borderRight: sendBoxBorderRight,
      borderTop: sendBoxBorderTop,
      minHeight: sendBoxHeight
    }
  };
}

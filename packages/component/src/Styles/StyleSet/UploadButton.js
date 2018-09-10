export default function createUploadButtonStyle({
  sendBoxHeight
}) {
  return {
    // We use the sendBoxHeight, so the button looks square
    width: sendBoxHeight,

    '& > .icon > svg': {
      fill: '#999'
    }
  };
}

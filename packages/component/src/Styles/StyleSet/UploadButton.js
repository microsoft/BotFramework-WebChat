export default function createUploadButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxHeight
}) {
  return {
    // We use the sendBoxHeight, so the button looks square
    width: sendBoxHeight,

    '& > .icon > svg': {
      fill: sendBoxButtonColor
    },

    '& > input:hover + .icon > svg': {
      fill: sendBoxButtonColorOnHover
    },

    '& > input:focus + .icon > svg': {
      fill: sendBoxButtonColorOnFocus
    }
  };
}

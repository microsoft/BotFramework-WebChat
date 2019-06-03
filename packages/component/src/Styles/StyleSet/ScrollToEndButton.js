export default function createScrollToEndButtonStyle({
  paddingRegular,
  transcriptOverlayButtonBackground,
  transcriptOverlayButtonBackgroundOnFocus,
  transcriptOverlayButtonBackgroundOnHover,
  transcriptOverlayButtonColor,
  transcriptOverlayButtonColorOnFocus,
  transcriptOverlayButtonColorOnHover
}) {
  return {
    // TODO: [P3] Can we not to unset borderWidth and outline earlier?
    '@media screen and (-ms-high-contrast: active)': {
      borderWidth: 'initial',
      outline: 'initial'
    },

    backgroundColor: transcriptOverlayButtonBackground,
    borderRadius: paddingRegular,
    borderWidth: 0,
    bottom: 5,
    color: transcriptOverlayButtonColor,
    outline: 0,
    padding: paddingRegular,
    position: 'absolute',
    right: 20,

    '&:hover': {
      backgroundColor: transcriptOverlayButtonBackgroundOnHover,
      color: transcriptOverlayButtonColorOnHover
    },

    '&:focus': {
      backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
      color: transcriptOverlayButtonColorOnFocus
    }
  };
}

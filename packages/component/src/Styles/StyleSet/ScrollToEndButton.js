export default function createScrollToEndButtonStyle({
  newMessagesButtonFontSize,
  paddingRegular,
  primaryFont,
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
    fontFamily: primaryFont,
    fontSize: newMessagesButtonFontSize,
    outline: 0,
    padding: paddingRegular,
    position: 'absolute',
    zIndex: 1, // We formed a stacking context in the parent container, so we can use "z-index" here.

    '&:hover': {
      backgroundColor: transcriptOverlayButtonBackgroundOnHover,
      color: transcriptOverlayButtonColorOnHover || transcriptOverlayButtonColor
    },

    '&:focus': {
      backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
      color: transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor
    },

    ':not(.webchat__overlay--rtl)': {
      right: 20
    },

    '&.webchat__overlay--rtl': {
      left: 20
    }
  };
}

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createScrollToEndButtonStyle({
  paddingRegular,
  primaryFont,
  scrollToEndButtonFontSize,
  transcriptOverlayButtonBackground,
  transcriptOverlayButtonBackgroundOnFocus,
  transcriptOverlayButtonBackgroundOnHover,
  transcriptOverlayButtonColor,
  transcriptOverlayButtonColorOnFocus,
  transcriptOverlayButtonColorOnHover
}: StrictStyleOptions) {
  return {
    '&.webchat__scroll-to-end-button': {
      // TODO: [P3] Can we not to unset borderWidth and outline earlier?
      '@media screen and (forced-colors: active)': {
        borderWidth: 'initial',
        outline: 'initial'
      },

      appearance: 'none',
      backgroundColor: transcriptOverlayButtonBackground,
      borderRadius: paddingRegular,
      borderWidth: 0,
      bottom: 5,
      color: transcriptOverlayButtonColor,
      fontFamily: primaryFont,
      fontSize: scrollToEndButtonFontSize,
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

      '&:not(.webchat__scroll-to-end-button--rtl)': {
        right: 20
      },

      '&.webchat__scroll-to-end-button--rtl': {
        left: 20
      }
    }
  };
}

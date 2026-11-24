import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Middleware/ScrollToEndButton/ScrollToEndButton.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
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
      color: transcriptOverlayButtonColor,
      fontFamily: primaryFont,
      fontSize: scrollToEndButtonFontSize,
      outline: 0,
      padding: paddingRegular,

      '&:hover': {
        backgroundColor: transcriptOverlayButtonBackgroundOnHover,
        color: transcriptOverlayButtonColorOnHover || transcriptOverlayButtonColor
      },

      '&:focus': {
        backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
        color: transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor
      }
    }
  };
}

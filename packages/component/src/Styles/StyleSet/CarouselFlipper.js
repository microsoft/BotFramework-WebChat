export default function ({
  transcriptOverlayButtonBackground,
  transcriptOverlayButtonBackgroundOnDisabled,
  transcriptOverlayButtonBackgroundOnFocus,
  transcriptOverlayButtonBackgroundOnHover,
  transcriptOverlayButtonColor,
  transcriptOverlayButtonColorOnDisabled,
  transcriptOverlayButtonColorOnFocus,
  transcriptOverlayButtonColorOnHover
}) {
  return {
    '& > div.button': {
      backgroundColor: transcriptOverlayButtonBackground,
      color: transcriptOverlayButtonColor,
      outline: 0,

      '&:disabled': {
        backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
        color: transcriptOverlayButtonColorOnDisabled
      },

      '&:focus': {
        backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
        color: transcriptOverlayButtonColorOnFocus
      },

      '&:hover': {
        backgroundColor: transcriptOverlayButtonBackgroundOnHover,
        color: transcriptOverlayButtonColorOnHover
      }
    }
  };
}

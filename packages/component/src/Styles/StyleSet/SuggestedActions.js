export default function createSuggestedActionsStyle({
  paddingRegular,
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
    paddingLeft: paddingRegular / 2,
    paddingRight: paddingRegular / 2,

    '& button > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackground,
      color: transcriptOverlayButtonColor,
      outline: 0
    },

    '& button:disabled > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
      color: transcriptOverlayButtonColorOnDisabled
    },

    '& button:focus > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
      color: transcriptOverlayButtonColorOnFocus
    },

    '& button:hover > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnHover,
      color: transcriptOverlayButtonColorOnHover
    }
  };
}

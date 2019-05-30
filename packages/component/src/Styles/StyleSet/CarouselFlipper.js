export default function CarouselFlipper({
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
    '& > div.slider > div.button': {
      backgroundColor: transcriptOverlayButtonBackground,
      color: transcriptOverlayButtonColor,
      outline: 0
    },

    '&:disabled > div.slider > div.button': {
      backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
      color: transcriptOverlayButtonColorOnDisabled
    },

    '&:focus > div.slider > div.button': {
      backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
      color: transcriptOverlayButtonColorOnFocus
    },

    '&:hover > div.slider > div.button': {
      backgroundColor: transcriptOverlayButtonBackgroundOnHover,
      color: transcriptOverlayButtonColorOnHover
    }
  };
}

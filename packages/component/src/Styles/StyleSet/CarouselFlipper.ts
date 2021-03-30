import { StrictStyleOptions } from 'botframework-webchat-api';

export default function CarouselFlipper({
  transcriptOverlayButtonBackground,
  transcriptOverlayButtonBackgroundOnDisabled,
  transcriptOverlayButtonBackgroundOnFocus,
  transcriptOverlayButtonBackgroundOnHover,
  transcriptOverlayButtonColor,
  transcriptOverlayButtonColorOnDisabled,
  transcriptOverlayButtonColorOnFocus,
  transcriptOverlayButtonColorOnHover
}: StrictStyleOptions) {
  return {
    '&.webchat__carousel-layout': {
      '& .react-film__flipper': {
        '& .react-film__flipper__body': {
          backgroundColor: transcriptOverlayButtonBackground,
          color: transcriptOverlayButtonColor,
          outline: 0
        },

        '&:disabled, &[aria-disabled="true"]': {
          '& .react-film__flipper__body': {
            backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
            color: transcriptOverlayButtonColorOnDisabled
          }
        },

        '&:focus .react-film__flipper__body': {
          backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
          color: transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor
        },

        '&:hover .react-film__flipper__body': {
          backgroundColor: transcriptOverlayButtonBackgroundOnHover,
          color: transcriptOverlayButtonColorOnHover || transcriptOverlayButtonColor
        }
      }
    }
  };
}

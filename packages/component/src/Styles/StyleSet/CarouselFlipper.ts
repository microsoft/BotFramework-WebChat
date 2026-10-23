import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.0 (PR #5668), customizing it has no effect.
 * The live styles are in `packages/component/src/Carousel/CarouselFlipper.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
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

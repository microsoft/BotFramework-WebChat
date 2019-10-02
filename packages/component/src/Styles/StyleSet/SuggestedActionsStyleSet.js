/* eslint no-magic-numbers: "off" */

import { css } from 'glamor';
import { createBasicStyleSet } from 'react-film';

export default function createSuggestedActionsStyleSet({
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
  const originalStyleSet = createBasicStyleSet({
    cursor: null,
    flipperBoxWidth: 40,
    flipperSize: 20,
    scrollBarHeight: 6,
    scrollBarMargin: 2
  });

  const flipper = css({
    '& > div.slider > div': {
      background: transcriptOverlayButtonBackground,
      color: transcriptOverlayButtonColor,
      outline: 0
    },

    '&:disabled > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
      color: transcriptOverlayButtonColorOnDisabled
    },

    '&:focus > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
      color: transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor
    },

    '&:hover > div.slider > div': {
      backgroundColor: transcriptOverlayButtonBackgroundOnHover,
      color: transcriptOverlayButtonColorOnHover || transcriptOverlayButtonColor
    }
  });

  const leftFlipper = css(originalStyleSet.leftFlipper, flipper);
  const rightFlipper = css(originalStyleSet.rightFlipper, flipper);
  const carousel = css(originalStyleSet.carousel, {
    '&:hover, &.scrolling': {
      [`& .${leftFlipper + ''} > div.slider, & .${rightFlipper + ''} > div.slider`]: {
        transitionDelay: '0s'
      },
      [`& .${leftFlipper + ''} > div.slider`]: { left: 0 },
      [`& .${rightFlipper + ''} > div.slider`]: { right: 0 }
    },

    '& > div': {
      scrollbarWidth: 'none',

      '& > ul > li': {
        '&:first-child': {
          paddingLeft: paddingRegular / 2
        },

        '&:last-child': {
          paddingRight: paddingRegular / 2
        }
      }
    }
  });

  // This is not CSS, but options to create style set for react-film
  return {
    ...originalStyleSet,

    carousel,
    leftFlipper,
    rightFlipper
  };
}

import { css } from 'glamor';

const DOT_BOX_SIZE = 20;
const DOT_SIZE = 6;

const createDotsBoxCSS = ({ height }) =>
  css({
    alignItems: 'center',
    bottom: 0,
    height,
    justifyContent: 'center',
    width: '100%'
  });

const createDotsItemCSS = ({ boxSize, cursor, size }) =>
  css({
    alignItems: 'center',
    display: 'flex',
    height: boxSize,
    justifyContent: 'center',
    width: boxSize,

    '& > input': {
      ...(cursor ? { cursor } : {}),

      height: '100%',
      left: 0,
      margin: 0,
      opacity: 0,
      position: 'absolute',
      userSelect: 'none',
      top: 0,
      touchAction: 'none',
      width: '100%'
    },

    '& > div': {
      background: 'rgba(0, 0, 0, .2)',
      borderRadius: size / 2,
      height: size,
      width: size
    },

    '&:hover > div, & > input:focus + div': {
      background: 'rgba(0, 0, 0, .4)'
    },

    '& > input:active + div': {
      background: 'rgba(0, 0, 0, .8)'
    },

    '& > input:checked:not(:active) + div': {
      background: 'rgba(0, 0, 0, .6)'
    }
  });

const FLIPPER_BOX_WIDTH = 60;
const FLIPPER_SIZE = 40;

const createFlipperBoxCSS = ({ boxWidth, cursor, size }) =>
  css({
    ...(cursor ? { cursor } : {}),

    background: 'Transparent',
    height: '100%',
    overflow: 'hidden',
    position: 'absolute',
    userSelect: 'none',
    top: 0,
    touchAction: 'none',
    transitionDuration: '300ms',
    width: boxWidth,

    '& > div.slider': {
      alignItems: 'center',
      display: 'flex',
      height: '100%',
      justifyContent: 'center',
      position: 'absolute',
      top: 0,
      width: '100%',

      '& > div': {
        backgroundColor: 'rgba(0, 0, 0, .6)',
        borderRadius: '50%',
        color: 'rgba(255, 255, 255, .6)',
        fontFamily: ['Consolas', 'monospace'].map(font => `'${font}'`).join(', '),
        fontSize: 16,
        height: size,
        lineHeight: `${size}px`,
        transitionProperty: 'background-color',
        transitionDuration: '100ms',
        width: size
      }
    },

    '&:hover, &:focus': {
      '& > div.slider > div': {
        backgroundColor: 'rgba(0, 0, 0, .8)',
        color: 'rgba(255, 255, 255, .8)',
        transitionDuration: 0
      }
    },

    '&:active > div.slider > div': {
      backgroundColor: 'Black',
      color: 'White',
      transitionDuration: 0
    }
  });

const createLeftFlipperCSS = options =>
  css(
    {
      left: 0,
      transitionProperty: 'left',

      '& > div.slider': {
        left: 0
      }
    },
    createFlipperBoxCSS(options)
  );

const createRightFlipperCSS = options =>
  css(
    {
      right: 0,
      transitionProperty: 'right',

      '& > div.slider': {
        right: 0
      }
    },
    createFlipperBoxCSS(options)
  );

const SCROLL_BAR_HEIGHT = 8;
const SCROLL_BAR_MARGIN = 4;

const createScrollBarBoxCSS = ({ margin }) =>
  css({
    bottom: 0,
    padding: margin,
    position: 'absolute',
    transitionDelay: '1s',
    transitionDuration: '300ms',
    transitionProperty: 'bottom',
    width: '100%'
  });

const createScrollBarHandlerCSS = ({ height }) =>
  css({
    backdropFilter: 'blur(4px)',
    background: 'rgba(255, 255, 255, .4)',
    borderRadius: height / 2,
    height
  });

export default function({
  autoHide = true,
  autoHideFlipperOnEdge = true,
  cursor = 'pointer',
  dotBoxSize = DOT_BOX_SIZE,
  dotSize = DOT_SIZE,
  flipperBoxWidth = FLIPPER_BOX_WIDTH,
  flipperSize = FLIPPER_SIZE,
  scrollBarHeight = SCROLL_BAR_HEIGHT,
  scrollBarMargin = SCROLL_BAR_MARGIN
} = {}) {
  const styles = {
    carousel: '',
    dotsBox: createDotsBoxCSS({ height: dotBoxSize }),
    dotsItem: createDotsItemCSS({ boxSize: dotBoxSize, cursor, size: dotSize }),
    leftFlipper: createLeftFlipperCSS({ boxWidth: flipperBoxWidth, cursor, size: flipperSize }),
    rightFlipper: createRightFlipperCSS({ boxWidth: flipperBoxWidth, cursor, size: flipperSize }),
    scrollBarBox: createScrollBarBoxCSS({ margin: scrollBarMargin }),
    scrollBarHandler: createScrollBarHandlerCSS({ height: scrollBarHeight })
  };

  // This is for overriding existing rules with auto-hide CSS transitions
  if (autoHide) {
    const flipperOverrides = {
      position: 'absolute',
      top: 0,
      transitionDelay: '1s',
      transitionDuration: '300ms'
    };

    styles.leftFlipper = css(styles.leftFlipper, {
      '& > div.slider': {
        ...flipperOverrides,
        left: -50,
        transitionProperty: 'left'
      },

      '&:focus > div.slider': {
        left: 0,
        transitionDelay: '0s'
      },

      ...(autoHideFlipperOnEdge
        ? {
            '&.hide': {
              left: -FLIPPER_BOX_WIDTH

              // '> div.slider': {
              //   left: 0
              // }
            }
          }
        : {})
    });

    styles.rightFlipper = css(styles.rightFlipper, {
      '& > div.slider': {
        ...flipperOverrides,
        right: -50,
        transitionProperty: 'right'
      },

      '&:focus > div.slider': {
        right: 0,
        transitionDelay: '0s'
      },

      ...(autoHideFlipperOnEdge
        ? {
            '&.hide': {
              right: -FLIPPER_BOX_WIDTH

              // '> div.slider': {
              //   right: 0
              // }
            }
          }
        : {})
    });

    styles.scrollBarBox = css(styles.scrollBarBox, {
      bottom: -30,
      transitionDelay: '1s',
      transitionDuration: '300ms',
      transitionProperty: 'bottom'
    });

    // The auto-hide state is defined in arch-style (carousel) for its `hover` pseudo class
    styles.carousel = css({
      '&:hover, &.scrolling': {
        [`& .${styles.scrollBarBox + ''}, & .${styles.leftFlipper + ''} > div.slider, & .${styles.rightFlipper +
          ''} > div.slider`]: {
          // Controls show up as soon as the user hover on it
          transitionDelay: '0s'
        },

        [`& .${styles.scrollBarBox + ''}`]: {
          bottom: 0
        },

        [`& .${styles.leftFlipper + ''} > div.slider`]: {
          left: 0
        },

        [`& .${styles.rightFlipper + ''} > div.slider`]: {
          right: 0
        }
      }
    });
  }

  return styles;
}

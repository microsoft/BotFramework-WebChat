/* eslint no-empty-pattern: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [1.5, 2] }] */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSuggestedActionsStyle({
  paddingRegular,
  suggestedActionsCarouselFlipperBoxWidth,
  suggestedActionsCarouselFlipperCursor,
  suggestedActionsCarouselFlipperSize,
  suggestedActionsFlowMaxHeight,
  suggestedActionsStackedHeight,
  suggestedActionsStackedOverflow,
  suggestedActionsVisualKeyboardIndicatorColor,
  suggestedActionsVisualKeyboardIndicatorStyle,
  suggestedActionsVisualKeyboardIndicatorWidth,
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
    '&.webchat__suggested-actions': {
      position: 'relative',

      '&.webchat__suggested-actions--carousel-layout': {
        // Read by the carousel flippers (`packages/component/src/Carousel/CarouselFlipper.module.css`), which fall back to
        // react-film's 60 and 40 pixels when not numbers, as react-film did.
        '--webchat__carousel-flipper--box-width':
          typeof suggestedActionsCarouselFlipperBoxWidth === 'number'
            ? `${suggestedActionsCarouselFlipperBoxWidth}px`
            : undefined,
        // Same as react-film, which rendered these flippers before: `undefined` is a pointer, empty means unset.
        '--webchat__carousel-flipper--cursor':
          typeof suggestedActionsCarouselFlipperCursor === 'undefined'
            ? 'pointer'
            : suggestedActionsCarouselFlipperCursor || undefined,
        '--webchat__carousel-flipper--size':
          typeof suggestedActionsCarouselFlipperSize === 'number'
            ? `${suggestedActionsCarouselFlipperSize}px`
            : undefined,

        '& .webchat__suggested-actions__carousel': {
          paddingBottom: paddingRegular / 2,
          paddingTop: paddingRegular / 2,

          '& .webchat__suggested-actions__item-box': {
            paddingBottom: paddingRegular / 2,
            paddingLeft: paddingRegular / 2,
            paddingRight: paddingRegular / 2,
            paddingTop: paddingRegular / 2
          },

          '& .carousel-flipper': {
            '&:disabled, &[aria-disabled="true"]': {
              '& .carousel-flipper__body': {
                backgroundColor: transcriptOverlayButtonBackgroundOnDisabled,
                color: transcriptOverlayButtonColorOnDisabled
              }
            },

            '&:focus .carousel-flipper__body': {
              backgroundColor: transcriptOverlayButtonBackgroundOnFocus,
              color: transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor
            },

            // Two-tone focus indicator: visible against both the flipper and the background behind it.
            '&:focus-visible .carousel-flipper__body': {
              boxShadow: `0 0 0 2px ${transcriptOverlayButtonColorOnFocus || transcriptOverlayButtonColor}`,
              outlineColor: suggestedActionsVisualKeyboardIndicatorColor,
              outlineOffset: 2,
              outlineStyle: suggestedActionsVisualKeyboardIndicatorStyle,
              outlineWidth: suggestedActionsVisualKeyboardIndicatorWidth
            },

            '&:hover .carousel-flipper__body': {
              backgroundColor: transcriptOverlayButtonBackgroundOnHover,
              color: transcriptOverlayButtonColorOnHover || transcriptOverlayButtonColor
            },

            '& .carousel-flipper__body': {
              background: transcriptOverlayButtonBackground,
              color: transcriptOverlayButtonColor,
              outline: 0
            }
          }
        },

        '& .webchat__suggested-actions__carousel-main': {
          overflow: 'hidden',
          position: 'relative'
        },

        '& .webchat__suggested-actions__carousel-filmstrip': {
          MsOverflowStyle: 'none',
          overflowX: 'scroll',
          overflowY: 'hidden',
          overscrollBehaviorX: 'contain',
          position: 'relative',
          scrollbarWidth: 'none',
          touchAction: 'manipulation',
          zIndex: 0, // Flippers stack above the filmstrip.

          '&::-webkit-scrollbar': {
            display: 'none'
          }
        },

        '& .webchat__suggested-actions__carousel-list': {
          display: 'flex',
          listStyleType: 'none',
          margin: 0,
          padding: 0
        },

        '& .webchat__suggested-actions__carousel-item': {
          '&:first-child': {
            paddingInlineStart: paddingRegular / 2
          },

          '&:last-child': {
            paddingInlineEnd: paddingRegular / 2
          }
        },

        // When flippers are shown, the first and last items are not covered by them.
        '& .carousel-flipper + .webchat__suggested-actions__carousel-filmstrip .webchat__suggested-actions__carousel-item':
          {
            '&:first-child': {
              paddingInlineStart: `calc(var(--webchat__carousel-flipper--size, 40px) + ${paddingRegular * 1.5}px)`
            },

            '&:last-child': {
              paddingInlineEnd: `calc(var(--webchat__carousel-flipper--size, 40px) + ${paddingRegular * 1.5}px)`
            }
          }
      },

      '&.webchat__suggested-actions--flow-layout': {
        '& .webchat__suggested-actions__flow-box': {
          maxHeight: suggestedActionsFlowMaxHeight,
          overflowY: 'auto',
          paddingBottom: paddingRegular / 2,
          paddingLeft: paddingRegular / 2,
          paddingRight: paddingRegular / 2,
          paddingTop: paddingRegular / 2
        },

        '& .webchat__suggested-actions__flow-item-box': {
          maxWidth: '100%',
          overflow: 'hidden' // This is required in IE11
        },

        '& .webchat__suggested-actions__item-box': {
          paddingBottom: paddingRegular / 2,
          paddingLeft: paddingRegular / 2,
          paddingRight: paddingRegular / 2,
          paddingTop: paddingRegular / 2
        }
      },

      '&.webchat__suggested-actions--stacked-layout': {
        '& .webchat__suggested-actions__stack': {
          maxHeight: suggestedActionsStackedHeight || 'auto',
          overflowY: suggestedActionsStackedOverflow || 'auto',
          paddingBottom: paddingRegular / 2,
          paddingLeft: paddingRegular / 2,
          paddingRight: paddingRegular / 2,
          paddingTop: paddingRegular / 2
        },

        '& .webchat__suggested-actions__item-box': {
          paddingBottom: paddingRegular / 2,
          paddingLeft: paddingRegular / 2,
          paddingRight: paddingRegular / 2,
          paddingTop: paddingRegular / 2
        }
      },

      '&.webchat__suggested-actions--flow-layout, &.webchat__suggested-actions--stacked-layout': {
        '& .webchat__suggested-actions__button-text': {
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        },

        '& .webchat__suggested-actions__button-text-stacked-text-wrap': {
          alignItems: 'center',
          display: 'flex',
          whiteSpace: 'normal'
        }
      },

      '& .webchat__suggested-actions__item-box': {
        display: 'flex',
        maxWidth: '100%'
      },

      '&.webchat__suggested-actions--focus-within, &:focus-within': {
        '& .webchat__suggested-actions__focus-indicator': {
          borderColor: suggestedActionsVisualKeyboardIndicatorColor,
          borderStyle: suggestedActionsVisualKeyboardIndicatorStyle,
          borderWidth: suggestedActionsVisualKeyboardIndicatorWidth,
          boxSizing: 'border-box',
          height: '100%',
          pointerEvents: 'none',
          position: 'absolute',
          top: 0,
          width: '100%'
        }
      }
    }
  };
}

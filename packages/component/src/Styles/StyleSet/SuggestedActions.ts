/* eslint no-empty-pattern: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [1.5, 2] }] */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSuggestedActionsStyle({
  paddingRegular,
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
        '& .webchat__suggested-actions__carousel': {
          paddingBottom: paddingRegular / 2,
          paddingTop: paddingRegular / 2,

          '& .webchat__suggested-actions__item-box': {
            paddingBottom: paddingRegular / 2,
            paddingLeft: paddingRegular / 2,
            paddingRight: paddingRegular / 2,
            paddingTop: paddingRegular / 2
          },

          '& .react-film__filmstrip': {
            scrollbarWidth: 'none'
          },

          '& .react-film__flipper': {
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
            },

            '& .react-film__flipper__body': {
              background: transcriptOverlayButtonBackground,
              color: transcriptOverlayButtonColor,
              outline: 0
            }
          }
        },

        '&:not(.webchat__suggested-actions--rtl)': {
          '& .react-film__filmstrip__item:first-child': {
            paddingLeft: paddingRegular / 2
          },

          '& .react-film__filmstrip__item:last-child': {
            paddingRight: paddingRegular / 2
          },

          '& .react-film__flipper + .react-film__filmstrip': {
            '& .react-film__filmstrip__item:first-child': {
              paddingLeft: suggestedActionsCarouselFlipperSize + paddingRegular * 1.5
            },

            '& .react-film__filmstrip__item:last-child': {
              paddingRight: suggestedActionsCarouselFlipperSize + paddingRegular * 1.5
            }
          }
        },

        '&.webchat__suggested-actions--rtl': {
          '& .react-film__filmstrip__item:first-child': {
            paddingRight: paddingRegular / 2
          },

          '& .react-film__filmstrip__item:last-child': {
            paddingLeft: paddingRegular / 2
          },

          '& .react-film__flipper + .react-film__filmstrip': {
            '& .react-film__filmstrip__item:first-child': {
              paddingRight: suggestedActionsCarouselFlipperSize + paddingRegular * 1.5
            },

            '& .react-film__filmstrip__item:last-child': {
              paddingLeft: suggestedActionsCarouselFlipperSize + paddingRegular * 1.5
            }
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

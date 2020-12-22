/* eslint no-empty-pattern: "off" */
/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function createSuggestedActionsStyle({
  paddingRegular,
  suggestedActionsFlowMaxHeight,
  suggestedActionsStackedHeight,
  suggestedActionsStackedOverflow,
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
    '&.webchat__suggested-actions': {
      '&.webchat__suggested-actions--carousel-layout': {
        '& .webchat__suggested-actions__carousel': {
          paddingBottom: paddingRegular / 2,
          paddingTop: paddingRegular / 2,

          '& .webchat__suggested-actions__button': {
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
          '& .react-film__filmstrip__item:first-child': { paddingLeft: paddingRegular / 2 },
          '& .react-film__filmstrip__item:last-child': { paddingRight: paddingRegular / 2 }
        },

        '&.webchat__suggested-actions--rtl': {
          '& .react-film__filmstrip__item:first-child': { paddingRight: paddingRegular / 2 },
          '& .react-film__filmstrip__item:last-child': { paddingLeft: paddingRegular / 2 }
        }
      },

      '&.webchat__suggested-actions--flow-layout': {
        maxHeight: suggestedActionsFlowMaxHeight,
        overflowY: 'auto',
        paddingBottom: paddingRegular / 2,
        paddingLeft: paddingRegular / 2,
        paddingRight: paddingRegular / 2,
        paddingTop: paddingRegular / 2,

        '& .webchat__suggested-actions__item': {
          maxWidth: '100%',
          overflow: 'hidden' // This is required in IE11
        },

        '& .webchat__suggested-actions__button': {
          padding: paddingRegular / 2
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

        '& .webchat__suggested-actions__button': {
          paddingBottom: paddingRegular / 2,
          paddingLeft: paddingRegular / 2,
          paddingRight: paddingRegular / 2,
          paddingTop: paddingRegular / 2
        }
      }
    }
  };
}

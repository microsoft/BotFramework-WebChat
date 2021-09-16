import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendBoxButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnActive,
  sendBoxButtonColorOnDisabled,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxButtonFocusVisibleBorderColor,
  sendBoxButtonFocusVisibleBorderRadius,
  sendBoxButtonFocusVisibleBorderStyle,
  sendBoxButtonFocusVisibleBorderWidth,
  sendBoxButtonFocusVisibleInset,
  sendBoxButtonShadeBorderRadius,
  sendBoxButtonShadeColor,
  sendBoxButtonShadeColorOnActive,
  sendBoxButtonShadeColorOnDisabled,
  sendBoxButtonShadeColorOnFocus,
  sendBoxButtonShadeColorOnHover,
  sendBoxButtonShadeInset,
  sendBoxHeight,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__icon-button': {
      alignItems: 'center',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      justifyContent: 'center',
      outline: 0,
      padding: 0,
      position: 'relative',
      width: sendBoxHeight, // We use the sendBoxHeight, so the button looks square

      '&:not(.webchat__icon-button--stretch)': {
        height: sendBoxHeight
      },

      '& .webchat__icon-button__shade': {
        backgroundColor: sendBoxButtonShadeColor,
        borderRadius: sendBoxButtonShadeBorderRadius,
        bottom: sendBoxButtonShadeInset,
        left: sendBoxButtonShadeInset,
        position: 'absolute',
        right: sendBoxButtonShadeInset,
        top: sendBoxButtonShadeInset
      },

      '& .webchat__icon-button__focus-visible': {
        borderColor: sendBoxButtonFocusVisibleBorderColor,
        borderRadius: sendBoxButtonFocusVisibleBorderRadius,
        borderStyle: sendBoxButtonFocusVisibleBorderStyle,
        borderWidth: sendBoxButtonFocusVisibleBorderWidth,
        bottom: sendBoxButtonFocusVisibleInset,
        left: sendBoxButtonFocusVisibleInset,
        position: 'absolute',
        right: sendBoxButtonFocusVisibleInset,
        top: sendBoxButtonFocusVisibleInset
      },

      '& svg': {
        fill: sendBoxButtonColor || subtle,
        position: 'relative'
      },

      // Order of preferences:
      // :disabled > :active > :hover > :focus
      '&:disabled, &[aria-disabled="true"]': {
        '& .webchat__icon-button__shade': {
          backgroundColor: sendBoxButtonShadeColorOnDisabled
        },

        // TODO: Add className for SVG.
        '& svg': {
          fill: sendBoxButtonColorOnDisabled
        }
      },

      '&:not(:disabled):not([aria-disabled="true"])': {
        '&:active': {
          '& .webchat__icon-button__shade': {
            backgroundColor: sendBoxButtonShadeColorOnActive
          },

          '& svg': {
            fill: sendBoxButtonColorOnActive
          }
        },

        '&:not(:active)': {
          '&:hover': {
            '& .webchat__icon-button__shade': {
              backgroundColor: sendBoxButtonShadeColorOnHover
            },

            '& svg': {
              fill: sendBoxButtonColorOnHover
            }
          },

          '&:not(:hover)': {
            '&:focus': {
              '& .webchat__icon-button__shade': {
                backgroundColor: sendBoxButtonShadeColorOnFocus
              },

              '& svg': {
                fill: sendBoxButtonColorOnFocus
              }
            }
          }
        }
      },

      // On unsupported browser, :focus-visible and :not(:focus-visible) is always false.
      // And it will turn the whole CSS selector ":unsupported, .truthy" to false.
      '&:not(:focus-visible) .webchat__icon-button__focus-visible': {
        display: 'none'
      },

      '&:not(.webchat__icon-button--focus-visible) .webchat__icon-button__focus-visible': {
        display: 'none'
      }
    }
  };
}

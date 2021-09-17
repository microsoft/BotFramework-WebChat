import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSendBoxButtonStyle({
  sendBoxButtonColor,
  sendBoxButtonColorOnActive,
  sendBoxButtonColorOnDisabled,
  sendBoxButtonColorOnFocus,
  sendBoxButtonColorOnHover,
  sendBoxButtonKeyboardFocusIndicatorBorderColor,
  sendBoxButtonKeyboardFocusIndicatorBorderRadius,
  sendBoxButtonKeyboardFocusIndicatorBorderStyle,
  sendBoxButtonKeyboardFocusIndicatorBorderWidth,
  sendBoxButtonKeyboardFocusIndicatorInset,
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
      appearance: 'none',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      fill: sendBoxButtonColor || subtle,
      justifyContent: 'center',
      outline: 0,
      padding: 0,
      position: 'relative',
      width: sendBoxHeight, // We use the sendBoxHeight, so the button looks square

      '&:not(.webchat__icon-button--stretch)': {
        height: sendBoxHeight
      },

      // Order of style preferences (based on effort of user gesture): disabled > active > hover > focus.
      // Keyboard focus indicator styles applied by :focus-visible do not conflict with :active/:hover/:focus, so it is not included here.
      '&:disabled, &[aria-disabled="true"]': {
        fill: sendBoxButtonColorOnDisabled,

        '& .webchat__icon-button__shade': {
          backgroundColor: sendBoxButtonShadeColorOnDisabled
        }
      },

      '&:not(:disabled):not([aria-disabled="true"])': {
        '&:active': {
          fill: sendBoxButtonColorOnActive,

          '& .webchat__icon-button__shade': {
            backgroundColor: sendBoxButtonShadeColorOnActive
          }
        },

        '&:not(:active)': {
          '&:hover': {
            fill: sendBoxButtonColorOnHover,

            '& .webchat__icon-button__shade': {
              backgroundColor: sendBoxButtonShadeColorOnHover
            }
          },

          '&:not(:hover)': {
            '&:focus': {
              fill: sendBoxButtonColorOnFocus,

              '& .webchat__icon-button__shade': {
                backgroundColor: sendBoxButtonShadeColorOnFocus
              }
            }
          }
        }
      },

      // On unsupported browser, :focus-visible and :not(:focus-visible) is always false.
      // And it will turn the whole CSS selector ":unsupported, .truthy" to false.
      '&:not(:focus-visible) .webchat__icon-button__keyboard-focus-indicator': {
        display: 'none'
      },

      '&:not(.webchat__icon-button--focus-visible) .webchat__icon-button__keyboard-focus-indicator': {
        display: 'none'
      },

      // Make sure all contents are in the same stacking context.
      '& > *': {
        position: 'relative'
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

      '& .webchat__icon-button__keyboard-focus-indicator': {
        borderColor: sendBoxButtonKeyboardFocusIndicatorBorderColor,
        borderRadius: sendBoxButtonKeyboardFocusIndicatorBorderRadius,
        borderStyle: sendBoxButtonKeyboardFocusIndicatorBorderStyle,
        borderWidth: sendBoxButtonKeyboardFocusIndicatorBorderWidth,
        bottom: sendBoxButtonKeyboardFocusIndicatorInset,
        left: sendBoxButtonKeyboardFocusIndicatorInset,
        position: 'absolute',
        right: sendBoxButtonKeyboardFocusIndicatorInset,
        top: sendBoxButtonKeyboardFocusIndicatorInset
      }
    }
  };
}

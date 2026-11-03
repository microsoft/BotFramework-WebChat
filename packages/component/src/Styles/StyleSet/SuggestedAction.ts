/* eslint no-magic-numbers: "off" */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSuggestedActionStyle({
  accent,
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBorderRadius,

  suggestedActionBackgroundColor,
  suggestedActionBorderColor,
  suggestedActionBorderStyle,
  suggestedActionBorderWidth,
  suggestedActionTextColor,

  suggestedActionBackgroundColorOnActive,
  suggestedActionBorderColorOnActive,
  suggestedActionBorderStyleOnActive,
  suggestedActionBorderWidthOnActive,
  suggestedActionTextColorOnActive,

  suggestedActionBackgroundColorOnDisabled,
  suggestedActionBorderColorOnDisabled,
  suggestedActionBorderStyleOnDisabled,
  suggestedActionBorderWidthOnDisabled,
  suggestedActionTextColorOnDisabled,

  suggestedActionBackgroundColorOnFocus,
  suggestedActionBorderColorOnFocus,
  suggestedActionBorderStyleOnFocus,
  suggestedActionBorderWidthOnFocus,
  suggestedActionTextColorOnFocus,

  suggestedActionBackgroundColorOnHover,
  suggestedActionBorderColorOnHover,
  suggestedActionBorderStyleOnHover,
  suggestedActionBorderWidthOnHover,
  suggestedActionTextColorOnHover,

  suggestedActionKeyboardFocusIndicatorBorderColor,
  suggestedActionKeyboardFocusIndicatorBorderRadius,
  suggestedActionKeyboardFocusIndicatorBorderStyle,
  suggestedActionKeyboardFocusIndicatorBorderWidth,
  suggestedActionKeyboardFocusIndicatorInset,

  suggestedActionHeight,
  suggestedActionImageHeight,
  suggestedActionsStackedLayoutButtonMaxHeight,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__suggested-action': {
      alignItems: 'center',
      backgroundColor: suggestedActionBackgroundColor,
      borderColor: suggestedActionBorderColor || accent,
      borderRadius: suggestedActionBorderRadius,
      borderStyle: suggestedActionBorderStyle,
      borderWidth: suggestedActionBorderWidth,
      color: suggestedActionTextColor || accent,
      fontFamily: primaryFont,
      fontSize: 'inherit',
      height: suggestedActionHeight,
      justifyContent: 'center',
      maxWidth: '100%',
      outline: 0,
      paddingLeft: paddingWide,
      paddingRight: paddingWide,
      position: 'relative',
      whiteSpace: 'nowrap',
      width: '100%',

      // Order of style preferences (based on effort of user gesture): disabled > active > hover > focus.
      // Keyboard focus indicator styles applied by :focus-visible do not conflict with :active/:hover/:focus, so it is not included here.
      '&:disabled, &[aria-disabled="true"]': {
        backgroundColor: suggestedActionBackgroundColorOnDisabled,
        borderColor: suggestedActionBorderColorOnDisabled,
        borderStyle: suggestedActionBorderStyleOnDisabled,
        borderWidth: suggestedActionBorderWidthOnDisabled,
        color: suggestedActionTextColorOnDisabled || subtle
      },

      '&:not(:disabled):not([aria-disabled="true"])': {
        '&:active': {
          backgroundColor: suggestedActionBackgroundColorOnActive,
          borderColor: suggestedActionBorderColorOnActive,
          borderStyle: suggestedActionBorderStyleOnActive,
          borderWidth: suggestedActionBorderWidthOnActive,
          color: suggestedActionTextColorOnActive
        },

        '&:not(:active)': {
          '&:hover': {
            backgroundColor: suggestedActionBackgroundColorOnHover,
            borderColor: suggestedActionBorderColorOnHover,
            borderStyle: suggestedActionBorderStyleOnHover,
            borderWidth: suggestedActionBorderWidthOnHover,
            color: suggestedActionTextColorOnHover
          },

          '&:not(:hover)': {
            '&:focus': {
              backgroundColor: suggestedActionBackgroundColorOnFocus,
              borderColor: suggestedActionBorderColorOnFocus,
              borderStyle: suggestedActionBorderStyleOnFocus,
              borderWidth: suggestedActionBorderWidthOnFocus,
              color: suggestedActionTextColorOnFocus
            }
          }
        }
      },

      // On unsupported browser, :focus-visible and :not(:focus-visible) is always false.
      // And it will turn the whole CSS selector ":unsupported, .truthy" to false.
      '&:not(:focus-visible) .webchat__suggested-action__keyboard-focus-indicator': {
        display: 'none'
      },

      '&:not(.webchat__suggested-action--focus-visible) .webchat__suggested-action__keyboard-focus-indicator': {
        display: 'none'
      },

      '&:not(.webchat__suggested-action--rtl) .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingLeft: paddingRegular
      },

      '&.webchat__suggested-action--rtl .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingRight: paddingRegular
      },

      '&.webchat__suggested-action--wrapping': {
        height: 'auto',
        maxHeight: suggestedActionsStackedLayoutButtonMaxHeight || '100%',
        minHeight:
          typeof suggestedActionsStackedLayoutButtonMaxHeight === 'number' && typeof suggestedActionHeight === 'number'
            ? Math.min(suggestedActionsStackedLayoutButtonMaxHeight, suggestedActionHeight)
            : suggestedActionHeight
      },

      '& .webchat__suggested-action__image': {
        height: suggestedActionImageHeight
      },

      '& .webchat__suggested-action__keyboard-focus-indicator': {
        borderColor: suggestedActionKeyboardFocusIndicatorBorderColor,
        borderRadius: suggestedActionKeyboardFocusIndicatorBorderRadius,
        borderStyle: suggestedActionKeyboardFocusIndicatorBorderStyle,
        borderWidth: suggestedActionKeyboardFocusIndicatorBorderWidth,
        bottom: suggestedActionKeyboardFocusIndicatorInset,
        left: suggestedActionKeyboardFocusIndicatorInset,
        position: 'absolute',
        right: suggestedActionKeyboardFocusIndicatorInset,
        top: suggestedActionKeyboardFocusIndicatorInset
      }
    }
  };
}

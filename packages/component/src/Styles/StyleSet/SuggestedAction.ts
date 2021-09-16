/* eslint no-magic-numbers: "off" */

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createSuggestedActionStyle({
  accent,
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionActiveBackground,
  suggestedActionBackground,
  suggestedActionBorderColor,
  suggestedActionBorderRadius,
  suggestedActionBorderStyle,
  suggestedActionBorderWidth,
  suggestedActionDisabledBackground,
  suggestedActionDisabledBorderColor,
  suggestedActionDisabledBorderStyle,
  suggestedActionDisabledBorderWidth,
  suggestedActionDisabledTextColor,
  suggestedActionFocusBackground,
  suggestedActionFocusVisibleBorderColor,
  suggestedActionFocusVisibleBorderStyle,
  suggestedActionFocusVisibleBorderWidth,
  suggestedActionFocusVisibleInset,
  suggestedActionHeight,
  suggestedActionHoverBackground,
  suggestedActionImageHeight,
  suggestedActionsStackedLayoutButtonMaxHeight,
  suggestedActionTextColor,
  subtle
}: StrictStyleOptions) {
  return {
    '&.webchat__suggested-action': {
      alignItems: 'center',
      borderRadius: suggestedActionBorderRadius,
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

      '&:disabled, &[aria-disabled="true"]': {
        background: suggestedActionDisabledBackground || suggestedActionBackground,
        borderColor: suggestedActionDisabledBorderColor,
        borderStyle: suggestedActionDisabledBorderStyle,
        borderWidth: suggestedActionDisabledBorderWidth,
        color: suggestedActionDisabledTextColor || subtle
      },

      '&:not(:disabled):not([aria-disabled="true"])': {
        background: suggestedActionBackground,
        borderColor: suggestedActionBorderColor || accent,
        borderStyle: suggestedActionBorderStyle,
        borderWidth: suggestedActionBorderWidth,
        color: suggestedActionTextColor || accent,

        // Order of style preferences (based on effort of user gesture):
        // :active > :hover > :focus
        // Styles applied by :focus-visible do not conflict with :active/:hover/:focus, so it is missed out here.

        '&:active': {
          backgroundColor: suggestedActionActiveBackground
        },

        '&:not(:active)': {
          '&:hover': {
            backgroundColor: suggestedActionHoverBackground
          },

          '&:not(:hover)': {
            '&:focus': {
              backgroundColor: suggestedActionFocusBackground
            }
          }
        }
      },

      '& .webchat__suggested-action__image': {
        height: suggestedActionImageHeight
      },

      '&.webchat__suggested-action--wrapping': {
        height: 'auto',
        maxHeight: suggestedActionsStackedLayoutButtonMaxHeight || '100%',
        minHeight:
          typeof suggestedActionsStackedLayoutButtonMaxHeight === 'number' && typeof suggestedActionHeight === 'number'
            ? Math.min(suggestedActionsStackedLayoutButtonMaxHeight, suggestedActionHeight)
            : suggestedActionHeight
      },

      '&:not(.webchat__suggested-action--rtl) .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingLeft: paddingRegular
      },

      '&.webchat__suggested-action--rtl .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingRight: paddingRegular
      },

      // On unsupported browser, :focus-visible and :not(:focus-visible) is always false.
      // And it will turn the whole CSS selector ":unsupported, .truthy" to false.
      '&:not(:focus-visible) .webchat__suggested-action__focus-inset': {
        display: 'none'
      },

      '&:not(.webchat__suggested-action--focus-visible) .webchat__suggested-action__focus-inset': {
        display: 'none'
      },

      '& .webchat__suggested-action__focus-inset': {
        borderColor: 'transparent',
        borderStyle: 'solid',
        borderWidth: suggestedActionFocusVisibleInset,
        boxSizing: 'border-box',
        height: '100%',
        position: 'absolute',
        width: '100%'
      },

      '& .webchat__suggested-action__focus': {
        borderColor: suggestedActionFocusVisibleBorderColor,
        borderStyle: suggestedActionFocusVisibleBorderStyle,
        borderWidth: suggestedActionFocusVisibleBorderWidth,
        boxSizing: 'border-box',
        height: '100%',
        position: 'absolute',
        width: '100%'
      }
    }
  };
}

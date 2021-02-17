/* eslint no-magic-numbers: "off" */

export default function createSuggestedActionStyle({
  accent,
  paddingRegular,
  paddingWide,
  primaryFont,
  suggestedActionBackground,
  suggestedActionBorderColor,
  suggestedActionBorderStyle,
  suggestedActionBorderWidth,
  suggestedActionBorderRadius,
  suggestedActionImageHeight,
  suggestedActionTextColor,
  suggestedActionDisabledBackground,
  suggestedActionDisabledBorderColor,
  suggestedActionDisabledBorderStyle,
  suggestedActionDisabledBorderWidth,
  suggestedActionDisabledTextColor,
  suggestedActionHeight,
  suggestedActionsStackedLayoutButtonMaxHeight,
  subtle
}) {
  const patchedMinHeight =
    suggestedActionHeight < suggestedActionsStackedLayoutButtonMaxHeight
      ? suggestedActionHeight
      : suggestedActionsStackedLayoutButtonMaxHeight;

  return {
    '&.webchat__suggested-action': {
      maxWidth: '100%',

      '& .webchat__suggested-action__button': {
        alignItems: 'center',
        borderRadius: suggestedActionBorderRadius,
        fontFamily: primaryFont,
        fontSize: 'inherit',
        height: suggestedActionHeight,
        justifyContent: 'center',
        maxWidth: '100%',
        paddingLeft: paddingWide,
        paddingRight: paddingWide,
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
          color: suggestedActionTextColor || accent
        }
      },

      '& .webchat__suggested-action__image': {
        height: suggestedActionImageHeight
      },

      '& .webchat__suggested-action--wrapping': {
        height: 'auto',
        maxHeight: suggestedActionsStackedLayoutButtonMaxHeight || '100%',
        minHeight: patchedMinHeight
      },

      '&:not(.webchat__suggested-action--rtl) .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingLeft: paddingRegular
      },

      '&.webchat__suggested-action--rtl .webchat__suggested-action__image + .webchat__suggested-action__text': {
        paddingRight: paddingRegular
      }
    }
  };
}

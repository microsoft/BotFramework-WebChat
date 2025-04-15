import CSSTokens from '../CSSTokens';

export default function createFeedbackTextAreaStyle() {
  return {
    '&.sendbox__text-area': {
      display: 'grid',
      gridTemplateAreas: `'main'`,
      maxHeight: '200px',
      overflow: 'hidden',
      backgroundColor: CSSTokens.FeedbackFormSendBoxBackgroundColor,
      borderRadius: '4px',
      border: `1px solid ${CSSTokens.FeedbackFormSendBoxBorderColor}`,
      fontFamily: CSSTokens.FontPrimary,
      fontSize: '14px',
      gap: '6px',
      lineHeight: '20px',
      padding: CSSTokens.FeedbackFormSendBoxPadding,
      position: 'relative',
      minHeight: `${CSSTokens.FeedbackFormSendBoxMinHeight}`,
      minWidth: `${CSSTokens.FeedbackFormSendBoxMinWidth}`,
      '&::after': {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        borderBottom: `3px solid ${CSSTokens.FeedbackFormSendBoxActiveBorderColor}`,
        bottom: '-1px',
        clipPath: 'inset(calc(100% - 3px) 50% 0 50%)',
        content: '""',
        height: '4px',
        left: '-1px',
        position: 'absolute',
        right: '-1px',
        transition: 'clip-path 0 cubic-bezier(1, 0, 1, 1)'
      },
      '&:focus-within': {
        border: `1px solid ${CSSTokens.FeedbackFormSendBoxFocusBorderColor}`
      },
      '&:focus-within::after': {
        clipPath: 'inset(calc(100% - 3px) 0 0 0)',
        transition: 'clip-path 200ms cubic-bezier(0, 0, 0, 1)'
      }
    },
    '&.sendbox__text-area--hidden': {
      height: 0,
      visibility: 'collapse'
    },
    '&.sendbox__text-area-shared': {
      border: 'none',
      font: 'inherit',
      gridArea: 'main',
      outline: 'inherit',
      overflowWrap: 'anywhere',
      resize: 'inherit',
      scrollbarGutter: 'stable'
    },
    '&.sendbox__text-area-doppelganger': {
      overflow: 'hidden',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap'
    },
    '&.sendbox__text-area-input': {
      backgroundColor: 'inherit',
      color: 'currentColor',
      height: '100%',
      padding: 0
    },
    '&.sendbox__text-area-input--scroll': {
      scrollbarColor: 'unset',
      scrollbarWidth: 'unset',
      MozScrollbarColor: `${CSSTokens.FeedbackFormSubmitButtonDisabledColor} ${CSSTokens.ColorSubtle}`,
      MozScrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-track': {
        backgroundColor: CSSTokens.FeedbackFormSubmitButtonDisabledColor,
        borderRadius: '16px'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: CSSTokens.ColorSubtle,
        borderRadius: '16px'
      },
      '&::-webkit-scrollbar-corner': {
        backgroundColor: CSSTokens.FeedbackFormSubmitButtonDisabledColor
      }
    }
  };
}

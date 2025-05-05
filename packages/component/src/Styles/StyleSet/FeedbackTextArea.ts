import CSSTokens from '../CSSTokens';

export default function createFeedbackTextAreaStyle() {
  return {
    '&.webchat__feedback-form-text-area': {
      display: 'grid',
      gridTemplateAreas: `'main'`,
      maxHeight: '200px',
      overflow: 'hidden',
      backgroundColor: '#FFFFFF',
      borderRadius: '4px',
      border: '1px solid #E8E8E8',
      fontFamily: CSSTokens.FontPrimary,
      fontSize: '14px',
      gap: '6px',
      lineHeight: '20px',
      padding: '8px 12px',
      position: 'relative',
      '&::after': {
        borderBottomLeftRadius: '4px',
        borderBottomRightRadius: '4px',
        borderBottom: `3px solid ${CSSTokens.ColorAccent}`,
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
        border: '1px solid #E8E8E8'
      },
      '&:focus-within::after': {
        clipPath: 'inset(calc(100% - 3px) 0 0 0)',
        transition: 'clip-path 200ms cubic-bezier(0, 0, 0, 1)'
      }
    },
    '&.webchat__feedback-form-text-area--hidden': {
      height: 0,
      visibility: 'collapse'
    },
    '.webchat__feedback-form-text-area-shared': {
      border: 'none',
      font: 'inherit',
      gridArea: 'main',
      outline: 'inherit',
      overflowWrap: 'anywhere',
      resize: 'inherit',
      scrollbarGutter: 'stable'
    },
    '.webchat__feedback-form-text-area-doppelganger': {
      overflow: 'hidden',
      visibility: 'hidden',
      whiteSpace: 'pre-wrap'
    },
    '.webchat__feedback-form-text-area-input': {
      backgroundColor: 'inherit',
      color: 'currentColor',
      height: '100%',
      padding: 0
    },
    '.webchat__feedback-form-text-area-input--scroll': {
      scrollbarColor: 'unset',
      scrollbarWidth: 'unset',
      MozScrollbarColor: `#373435 ${CSSTokens.ColorSubtle}`,
      MozScrollbarWidth: 'thin',
      '&::-webkit-scrollbar': {
        width: '8px'
      },
      '&::-webkit-scrollbar-thumb': {
        backgroundColor: CSSTokens.ColorSubtle,
        borderRadius: '10px'
      },
      '&::-webkit-scrollbar-corner': {
        backgroundColor: '#373435'
      }
    }
  };
}

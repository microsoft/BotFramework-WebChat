export default function({ accent, paddingRegular, primaryFont }) {
  return {
    '&.webchat__adaptive-card-renderer': {
      '& .ac-input, & .ac-inlineActionButton, & .ac-quickActionButton': {
        fontFamily: primaryFont
      },

      '& .ac-multichoiceInput': {
        padding: paddingRegular
      },

      '& .ac-pushButton': {
        appearance: 'none',
        backgroundColor: 'White',
        borderStyle: 'solid',
        borderWidth: 1,
        color: accent,
        fontWeight: 600,
        padding: paddingRegular
      },

      '& .ac-pushButton.style-destructive': {
        backgroundColor: '#E50000',
        color: 'white'
      },

      '& .ac-pushButton.style-destructive:hover, & .ac-pushButton.style-destructive:active': {
        backgroundColor: '#BF0000'
      },

      '& .ac-pushButton.style-positive': {
        backgroundColor: '#0078D7',
        color: 'white'
      },

      '& .ac-pushButton.style-positive:hover, & .ac-pushButton.style-positive:active': {
        backgroundColor: '#006ABC'
      },

      // The following styles are copied from :disabled via Chromium.

      '& .ac-pushButton, & input, & select, & textarea': {
        '&[aria-disabled="true"]': {
          backgroundColor: '#EBEBE4',
          borderColor: '#A9A9A9',
          borderStyle: 'solid',
          borderWidth: 1,
          color: '#545454'
        }
      },

      '& .ac-pushButton[aria-disabled="true"]': {
        backgroundColor: '#F0F0F0',
        color: '#6D6D6D'
      },

      '& input[aria-disabled="true"]': {
        padding: '2px 1px'
      }
    }
  };
}

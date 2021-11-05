import FullBundleStyleOptions from '../../../types/FullBundleStyleOptions';

export default function ({
  cardPushButtonBackgroundColor,
  cardPushButtonTextColor,
  accent,
  paddingRegular,
  primaryFont
}: FullBundleStyleOptions) {
  return {
    '&.webchat__adaptive-card-renderer': {
      // Related to #4075.
      // Adaptive Cards assume its host is in "forced border-box" mode.
      // In CSS, the default is "content-box" mode.
      // https://developer.mozilla.org/en-US/docs/Web/CSS/box-sizing#values
      '& *': {
        boxSizing: 'border-box'
      },

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

      '& .ac-pushButton[aria-pressed="true"]': {
        backgroundColor: cardPushButtonBackgroundColor,
        borderColor: cardPushButtonBackgroundColor,
        color: cardPushButtonTextColor
      },

      '& input[aria-disabled="true"]': {
        padding: '2px 1px'
      }
    }
  };
}

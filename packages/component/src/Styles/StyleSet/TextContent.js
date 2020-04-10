/* eslint no-magic-numbers: "off" */

export default function createTextContentStyle({ bubbleMaxWidth, bubbleMinHeight, primaryFont, paddingRegular }) {
  return {
    fontFamily: primaryFont,
    margin: 0,
    minHeight: bubbleMinHeight - paddingRegular * 2,
    padding: paddingRegular,

    '& > :first-child': {
      marginTop: 0
    },

    '& > :last-child': {
      marginBottom: 0
    },

    '&.markdown': {
      '& img': {
        maxWidth: bubbleMaxWidth,
        width: '100%'
      },

      '& pre': {
        overflow: 'hidden'
      }
    },
    '& .externalLink': {
      margin: 0,
      padding: 0,
      backgroundPosition: 'center right',
      backgroundRepeat: 'no-repeat',
      backgroundImage:
        'linear-gradient(transparent,transparent),url(https://en.wikipedia.org/w/skins/Vector/resources/skins.vector.styles/images/external-link-ltr-icon.svg?b4b84)',
      paddingRight: '13px'
    }
  };
}

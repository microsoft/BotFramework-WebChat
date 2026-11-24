import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Attachment/FileContent.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createFileContentStyle({
  accent,
  bubbleTextColor,
  paddingRegular,
  primaryFont
}: StrictStyleOptions) {
  return {
    color: bubbleTextColor,
    display: 'flex',
    fontFamily: primaryFont,
    padding: paddingRegular,

    '& .webchat__fileContent__badge': {
      justifyContent: 'center'
    },

    '& .webchat__fileContent__buttonLink': {
      alignItems: 'center',
      color: bubbleTextColor,
      textDecoration: 'none',

      '&:focus': {
        backgroundColor: 'rgba(0, 0, 0, .1)'
      }
    },

    '& .webchat__fileContent__downloadIcon': {
      color: accent,
      fontSize: '33px',
      padding: paddingRegular,

      '&:not(.webchat__fileContent__downloadIcon--rtl)': {
        marginLeft: paddingRegular
      },

      '&.webchat__fileContent__downloadIcon--rtl': {
        marginRight: paddingRegular
      }
    },
    '& .webchat__fileContent__fileName': {
      color: accent
    }
  };
}

export default function createFileContentStyle({ accent, bubbleTextColor, paddingRegular, primaryFont }) {
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
      fill: accent,
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

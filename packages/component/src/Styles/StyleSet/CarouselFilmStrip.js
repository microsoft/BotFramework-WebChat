export default function CarouselFilmStrip({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
    '@supports (-moz-appearance: none)': {
      marginBottom: -17
    },

    '& > .avatar': {
      marginLeft: paddingRegular
    },

    '& > .content': {
      '& > .message': {
        marginLeft: paddingRegular
      },

      '& > ul': {
        marginLeft: paddingRegular,
        marginRight: paddingRegular,

        '&:not(:first-child)': {
          marginTop: paddingRegular
        },

        '& > li': {
          maxWidth: bubbleMaxWidth,
          minWidth: bubbleMinWidth,

          '&:not(:last-child)': {
            marginRight: paddingRegular
          }
        }
      },

      '& > .webchat__row': {
        marginLeft: paddingRegular
      }
    }
  };
}

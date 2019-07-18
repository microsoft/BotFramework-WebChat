/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function CarouselFilmStrip({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
    '@supports (-moz-appearance: none)': {
      marginBottom: -17
    },

    paddingLeft: paddingRegular,

    '&.webchat__carousel_indented_content > .content': {
      marginLeft: paddingRegular
    },

    '& > .content': {
      paddingRight: paddingRegular,

      '& > ul': {
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

      '& > .webchat__carousel__item_indented': {
        marginLeft: paddingRegular
      }
    }
  };
}

/* eslint no-magic-numbers: ["error", { "ignore": [2] }] */

export default function CarouselFilmStrip({ bubbleMaxWidth, bubbleMinWidth, paddingRegular }) {
  return {
    // Browser quirks: Firefox has no way to hide scrollbar and while keeping it in function
    // https://developer.mozilla.org/en-US/docs/Web/CSS/overflow
    '@supports (-moz-appearance: none)': {
      marginBottom: -17
    },

    '&:not(.webchat__carousel--rtl)': {
      paddingLeft: paddingRegular,

      '&.webchat__carousel_indented_content > .content': {
        marginLeft: paddingRegular
      },

      '& > .content': {
        paddingRight: paddingRegular,

        '& > .webchat__carousel__item_indented': {
          marginLeft: paddingRegular
        },

        '& > ul > li:not(:last-child)': {
          marginRight: paddingRegular
        }
      },

      '&.webchat__carousel_extra_right_indent > .content': {
        paddingRight: paddingRegular * 2
      }
    },

    '&.webchat__carousel--rtl': {
      paddingRight: paddingRegular,

      '&.webchat__carousel_indented_content > .content': {
        marginRight: paddingRegular
      },

      '& > .content': {
        paddingLeft: paddingRegular,

        '& > .webchat__carousel__item_indented': {
          marginRight: paddingRegular
        },

        '& > ul > li:not(:last-child)': {
          marginLeft: paddingRegular
        }
      },

      '&.webchat__carousel_extra_right_indent > .content': {
        paddingLeft: paddingRegular * 2
      }
    },

    '& > .content': {
      '& > ul': {
        '&:not(:first-child)': {
          marginTop: paddingRegular
        },

        '& > li': {
          maxWidth: bubbleMaxWidth,
          minWidth: bubbleMinWidth
        }
      }
    }
  };
}

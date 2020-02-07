/* eslint no-magic-numbers: ["error", { "ignore": [0, 5, 32, 50] }] */

export default function createNotificationAreaStyleSet({
  notificationErrorBackgroundColor,
  notificationErrorColor,
  notificationFontSize,
  notificationInfoBackgroundColor,
  notificationAreaHeight,
  notificationAreaMaxHeight,
  notificationAreaSingularMaxHeight,
  notificationIconWidth,
  notificationInfoColor,
  notificationSeparatorColor,
  notificationSuccessBackgroundColor,
  notificationSuccessColor,
  notificationWarnBackgroundColor,
  notificationWarnColor,
  primaryFont
}) {
  return {
    overflowY: 'hidden',

    '&:not(.webchat__notificationArea--expandable)': {
      maxHeight: notificationAreaSingularMaxHeight
    },

    '&.webchat__notificationArea--expandable:not(.webchat__notificationArea--expanded) > ul': {
      height: 0
    },

    '&.webchat__notificationArea--expandable.webchat__notificationArea--expanded': {
      maxHeight: notificationAreaMaxHeight
    },

    '& .webchat__notificationArea__expander': {
      alignItems: 'center',
      alignSelf: 'stretch',
      appearance: 'none',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      fontFamily: primaryFont,
      fontSize: notificationFontSize,
      minHeight: notificationAreaHeight,
      outline: 0,
      padding: 0,

      // IE11 does not have "initial", we are using "justify" so we don't need "left"/"right" for LTR/RTL.
      textAlign: 'justify',

      '&:focus .webchat__notificationArea__expandIconFocus': {
        borderColor: 'rgba(26, 10, 0, .7)'
      },

      '&:hover .webchat__notificationArea__expandIconFocus': {
        backgroundColor: 'rgba(0, 0, 0, .12)'
      }
    },

    '& .webchat__notificationArea__expandIconFocus': {
      alignItems: 'center',
      borderColor: 'Transparent',
      borderStyle: 'solid',
      borderWidth: 1,
      borderRadius: 3,
      display: 'flex',
      height: 22,
      justifyContent: 'center',
      width: 22
    },

    '&.webchat__notificationArea--error': {
      // TODO: Checks if pass A11y contrast ratio requirement

      '&:not(.webchat__notificationArea--expandable), & .webchat__notificationArea__expander': {
        backgroundColor: notificationErrorBackgroundColor
      },

      '& .webchat__notificationArea__expander': {
        color: notificationErrorColor,
        fill: notificationErrorColor
      }
    },

    '&.webchat__notificationArea--info': {
      '&:not(.webchat__notificationArea--expandable), & .webchat__notificationArea__expander': {
        backgroundColor: notificationInfoBackgroundColor
      },

      '& .webchat__notificationArea__expander': {
        color: notificationInfoColor,
        fill: notificationInfoColor
      }
    },

    '&.webchat__notificationArea--success': {
      '&:not(.webchat__notificationArea--expandable), & .webchat__notificationArea__expander': {
        backgroundColor: notificationSuccessBackgroundColor
      },

      '& .webchat__notificationArea__expander': {
        color: notificationSuccessColor,
        fill: notificationSuccessColor
      }
    },

    '&.webchat__notificationArea--warn': {
      '&:not(.webchat__notificationArea--expandable), & .webchat__notificationArea__expander': {
        backgroundColor: notificationWarnBackgroundColor
      },

      '& .webchat__notificationArea__expander': {
        color: notificationWarnColor,
        fill: notificationWarnColor
      }
    },

    '& .webchat__notificationArea__expandLevelIconBox': {
      height: notificationAreaHeight,
      width: notificationIconWidth
    },

    '& .webchat__notificationArea__expandIcon': {
      height: notificationAreaHeight,
      width: notificationAreaHeight
    },

    '& .webchat__notificationArea__expandLevelIconBox, & .webchat__notificationArea__expandIcon': {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center'
    },

    '& .webchat__notificationArea__list': {
      margin: 0,
      overflowY: 'auto',
      padding: 0
    },

    '& .webchat__notificationArea__listItem:not(:first-child), & .webchat__notificationArea__listItem:not(:last-child)': {
      borderBottomColor: notificationSeparatorColor,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      minHeight: 0
    }
  };
}

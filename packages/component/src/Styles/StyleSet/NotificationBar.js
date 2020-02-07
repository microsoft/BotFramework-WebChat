/* eslint no-magic-numbers: ["error", { "ignore": [0, 5, 32, 50] }] */

export default function createNotificationBarStyleSet({
  notificationErrorBackgroundColor,
  notificationErrorColor,
  notificationFontSize,
  notificationInfoBackgroundColor,
  notificationBarHeight,
  notificationBarMaxHeight,
  notificationBarSingularMaxHeight,
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

    '&:not(.webchat__notificationBar--expandable)': {
      maxHeight: notificationBarSingularMaxHeight
    },

    '&.webchat__notificationBar--expandable:not(.webchat__notificationBar--expanded) > ul': {
      height: 0
    },

    '&.webchat__notificationBar--expandable.webchat__notificationBar--expanded': {
      maxHeight: notificationBarMaxHeight
    },

    '& .webchat__notificationBar__expander': {
      alignItems: 'center',
      alignSelf: 'stretch',
      appearance: 'none',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      fontFamily: primaryFont,
      fontSize: notificationFontSize,
      minHeight: notificationBarHeight,
      outline: 0,
      padding: 0,

      // IE11 does not have "initial", we are using "justify" so we don't need "left"/"right" for LTR/RTL.
      textAlign: 'justify',

      '&:focus .webchat__notificationBar__expandIconFocus': {
        borderColor: 'rgba(26, 10, 0, .7)'
      },

      '&:hover .webchat__notificationBar__expandIconFocus': {
        backgroundColor: 'rgba(0, 0, 0, .12)'
      }
    },

    '& .webchat__notificationBar__expandIconFocus': {
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

    '&.webchat__notificationBar--error': {
      // TODO: Checks if pass A11y contrast ratio requirement

      '&:not(.webchat__notificationBar--expandable), & .webchat__notificationBar__expander': {
        backgroundColor: notificationErrorBackgroundColor
      },

      '& .webchat__notificationBar__expander': {
        color: notificationErrorColor,
        fill: notificationErrorColor
      }
    },

    '&.webchat__notificationBar--info': {
      '&:not(.webchat__notificationBar--expandable), & .webchat__notificationBar__expander': {
        backgroundColor: notificationInfoBackgroundColor
      },

      '& .webchat__notificationBar__expander': {
        color: notificationInfoColor,
        fill: notificationInfoColor
      }
    },

    '&.webchat__notificationBar--success': {
      '&:not(.webchat__notificationBar--expandable), & .webchat__notificationBar__expander': {
        backgroundColor: notificationSuccessBackgroundColor
      },

      '& .webchat__notificationBar__expander': {
        color: notificationSuccessColor,
        fill: notificationSuccessColor
      }
    },

    '&.webchat__notificationBar--warn': {
      '&:not(.webchat__notificationBar--expandable), & .webchat__notificationBar__expander': {
        backgroundColor: notificationWarnBackgroundColor
      },

      '& .webchat__notificationBar__expander': {
        color: notificationWarnColor,
        fill: notificationWarnColor
      }
    },

    '& .webchat__notificationBar__expandLevelIconBox': {
      height: notificationBarHeight,
      width: notificationIconWidth
    },

    '& .webchat__notificationBar__expandIcon': {
      height: notificationBarHeight,
      width: notificationBarHeight
    },

    '& .webchat__notificationBar__expandLevelIconBox, & .webchat__notificationBar__expandIcon': {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center'
    },

    '& .webchat__notificationBar__list': {
      margin: 0,
      overflowY: 'auto',
      padding: 0
    },

    '& .webchat__notificationBar__listItem': {
      borderBottomColor: notificationSeparatorColor,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      minHeight: 0
    }
  };
}

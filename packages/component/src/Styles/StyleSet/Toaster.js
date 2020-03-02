/* eslint no-magic-numbers: ["off"] */

export default function createToasterStyle({
  primaryFont,
  toasterHeight,
  toasterMaxHeight,
  toastErrorBackgroundColor,
  toastErrorColor,
  toasterSingularMaxHeight,
  toastFontSize,
  toastIconWidth,
  toastInfoBackgroundColor,
  toastInfoColor,
  toastSeparatorColor,
  toastSuccessBackgroundColor,
  toastSuccessColor,
  toastWarnBackgroundColor,
  toastWarnColor
}) {
  return {
    overflowY: 'hidden',

    '&:not(.webchat__toaster--expandable)': {
      maxHeight: toasterSingularMaxHeight
    },

    '&.webchat__toaster--expandable:not(.webchat__toaster--expanded) > ul': {
      height: 0
    },

    '&.webchat__toaster--expandable.webchat__toaster--expanded': {
      maxHeight: toasterMaxHeight
    },

    '& .webchat__toaster__header': {
      alignItems: 'center',
      alignSelf: 'stretch',
      appearance: 'none',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      fontFamily: primaryFont,
      fontSize: toastFontSize,
      minHeight: toasterHeight,
      outline: 0,
      padding: 0,
      textAlign: 'left',

      '&:focus .webchat__toaster__expandIconFocus': {
        borderColor: 'rgba(26, 10, 0, .7)'
      },

      '&:hover .webchat__toaster__expandIconFocus': {
        backgroundColor: 'rgba(0, 0, 0, .12)'
      }
    },

    '& .webchat__toaster__expandIconFocus': {
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

    '&.webchat__toaster--error': {
      // TODO: Checks if pass A11y contrast ratio requirement

      '&:not(.webchat__toaster--expandable), & .webchat__toaster__header': {
        backgroundColor: toastErrorBackgroundColor
      },

      '& .webchat__toaster__header': {
        color: toastErrorColor,
        fill: toastErrorColor
      }
    },

    '&.webchat__toaster--info': {
      '&:not(.webchat__toaster--expandable), & .webchat__toaster__header': {
        backgroundColor: toastInfoBackgroundColor
      },

      '& .webchat__toaster__header': {
        color: toastInfoColor,
        fill: toastInfoColor
      }
    },

    '&.webchat__toaster--success': {
      '&:not(.webchat__toaster--expandable), & .webchat__toaster__header': {
        backgroundColor: toastSuccessBackgroundColor
      },

      '& .webchat__toaster__header': {
        color: toastSuccessColor,
        fill: toastSuccessColor
      }
    },

    '&.webchat__toaster--warn': {
      '&:not(.webchat__toaster--expandable), & .webchat__toaster__header': {
        backgroundColor: toastWarnBackgroundColor
      },

      '& .webchat__toaster__header': {
        color: toastWarnColor,
        fill: toastWarnColor
      }
    },

    '& .webchat__toaster__expandLevelIconBox': {
      height: toasterHeight,
      width: toastIconWidth
    },

    '& .webchat__toaster__expandIcon': {
      height: toasterHeight,
      width: toasterHeight
    },

    '& .webchat__toaster__expandText': {
      padding: '6px 0'
    },

    '& .webchat__toaster__expandLevelIconBox, & .webchat__toaster__expandIcon': {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center'
    },

    '& .webchat__toaster__list': {
      margin: 0,
      overflowY: 'auto',
      padding: 0
    },

    '& .webchat__toaster__listItem:first-child:last-child': {
      overflow: 'hidden'
    },

    '& .webchat__toaster__listItem:not(:first-child), & .webchat__toaster__listItem:not(:last-child)': {
      borderBottomColor: toastSeparatorColor,
      borderBottomStyle: 'solid',
      borderBottomWidth: 1,
      minHeight: 32
    }
  };
}

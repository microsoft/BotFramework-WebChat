export default function createNotificationsStyleSet({ fontSizeSmall, paddingRegular, primaryFont }) {
  return {
    fontFamily: primaryFont,
    // fontSize: fontSizeSmall,
    fontSize: '87.5%',
    overflowY: 'hidden',

    '&.webchat__notificationBox--error': {
      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander': {
        color: '#3B3A39',
        fill: '#3B3A39'
      },

      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander, &:not(.webchat__notificationBox--expandable) ul': {
        backgroundColor: '#FFF4CE'
      }
    },

    '&.webchat__notificationBox--info': {
      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander': {
        color: '#105E7D',
        fill: '#105E7D'
      },

      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander, &:not(.webchat__notificationBox--expandable) ul': {
        backgroundColor: '#CEF1FF'
      }
    },

    '&.webchat__notificationBox--success': {
      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander': {
        color: '#107C10',
        fill: '#107C10'
      },

      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander, &:not(.webchat__notificationBox--expandable) ul': {
        backgroundColor: '#DFF6DD'
      }
    },

    '&.webchat__notificationBox--warn': {
      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander': {
        color: '#3B3A39',
        fill: '#3B3A39'
      },

      '&.webchat__notificationBox--expandable .webchat__notificationBox__expander, &:not(.webchat__notificationBox--expandable) ul': {
        backgroundColor: '#FFF4CE'
      }
    },

    '&:not(.webchat__notificationBox--expandable)': {
      // maxHeight: 32 * 2
      maxHeight: 50
    },

    '&.webchat__notificationBox--expandable:not(.webchat__notificationBox--expanded) > ul': {
      height: 0
    },

    '&.webchat__notificationBox--expandable.webchat__notificationBox--expanded': {
      maxHeight: 32 * 5
    },

    '& .webchat__notificationBox__expander': {
      alignItems: 'center',
      alignSelf: 'stretch',
      backgroundColor: 'Transparent',
      border: 0,
      display: 'flex',
      fill: '#A80000',
      minHeight: 32,
      padding: 0
    },

    '& .webchat__notificationBox__expandLevelIconBox': {
      height: 32,
      width: 36
    },

    '& .webchat__notificationBox__expandIcon': {
      height: 32,
      width: 32
    },

    '& .webchat__notificationBox__expandLevelIconBox, & .webchat__notificationBox__expandIcon': {
      alignItems: 'center',
      display: 'flex',
      justifyContent: 'center'
    },

    '& > ul': {
      margin: 0,
      overflowY: 'auto',
      padding: 0,

      '& > li:not(:first-child)': {
        borderTop: '1px solid #E8EAEC'
      }
    }
  };
}

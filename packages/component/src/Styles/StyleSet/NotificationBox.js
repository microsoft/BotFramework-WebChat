export default function createNotificationsStyleSet() {
  return {
    overflowY: 'hidden',

    '& .webchat__notificationBox__accordion:not(.webchat__notificationBox__accordion--expandable)': {
      maxHeight: 50
    },

    '& .webchat__notificationBox__accordion--expandable:not(.webchat__notificationBox__accordion--expanded) > ul': {
      height: 0
    },

    '& .webchat__notificationBox__accordion--expandable.webchat__notificationBox__accordion--expanded': {
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

    '& .webchat__notificationBox__accordion--error': {
      // TODO: Checks if pass A11y contrast ratio requirement

      '&:not(.webchat__notificationBox__accordion--expandable), & .webchat__notificationBox__expander': {
        backgroundColor: '#FFF4CE'
      },

      '& .webchat__notificationBox__expander': {
        color: '#3B3A39',
        fill: '#3B3A39'
      }
    },

    '& .webchat__notificationBox__accordion--info': {
      '&:not(.webchat__notificationBox__accordion--expandable), & .webchat__notificationBox__expander': {
        backgroundColor: '#CEF1FF'
      },

      '& .webchat__notificationBox__expander': {
        color: '#105E7D',
        fill: '#105E7D'
      }
    },

    '& .webchat__notificationBox__accordion--success': {
      '&:not(.webchat__notificationBox__accordion--expandable), & .webchat__notificationBox__expander': {
        backgroundColor: '#DFF6DD'
      },

      '& .webchat__notificationBox__expander': {
        color: '#107C10',
        fill: '#107C10'
      }
    },

    '& .webchat__notificationBox__accordion--warn': {
      '&:not(.webchat__notificationBox__accordion--expandable), & .webchat__notificationBox__expander': {
        backgroundColor: '#FFF4CE'
      },

      '& .webchat__notificationBox__expander': {
        color: '#3B3A39',
        fill: '#3B3A39'
      }
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

    '& .webchat__notificationBox__list': {
      margin: 0,
      overflowY: 'auto',
      padding: 0
    },

    '& .webchat__notificationBox__listItem:not(:first-child)': {
      borderTop: '1px solid #E8EAEC'
    }
  };
}

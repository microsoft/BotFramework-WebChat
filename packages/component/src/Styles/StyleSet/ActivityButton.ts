export default function createActivityButtonStyle() {
  return {
    '&.webchat__activity-button': {
      alignItems: 'center',
      appearance: 'none',
      background: '#fff',
      borderRadius: '4px',
      border: '1px solid #d1d1d1',
      color: '#242424',
      display: 'flex',
      gap: '4px',
      justifyContent: 'center',
      padding: '5px 12px',

      '&:hover': {
        background: '#f5f5f5',
        border: '1px solid #c7c7c7',
        color: '#242424'
      },

      '&:active': {
        background: '#e0e0e0',
        border: '1px solid #b3b3b3',
        color: '#242424'
      },

      '&:focus-visible': {
        background: '#fff',
        outline: '2px solid #000',
        outlineOffset: '-2px'
      },

      '&[aria-disabled="true"]': {
        background: '#f0f0f0',
        border: '1px solid #e0e0e0',
        color: '#bdbdbd',
        cursor: 'not-allowed'
      },

      '& .webchat__activity-button__icon': {
        height: '20px',
        width: '20px',

        '--webchat__component-icon--color': '#707070',
        '--webchat__component-icon--size': '20px'
      }
    }
  };
}

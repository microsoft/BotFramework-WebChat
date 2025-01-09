import CSSTokens from '../CSSTokens';

export default function () {
  return {
    '&.webchat__thumb-button': {
      appearance: 'none',
      background: 'Transparent',
      border: 0,
      borderRadius: 2,
      boxSizing: 'content-box',
      height: 16,
      fontSize: '14px',
      /* The Fluent icon is larger than the button. We need to clip it.
      Without clipping, hover effect will appear on the edge of the button but not possible to click. */
      overflow: ['hidden', 'clip'],
      padding: 0,
      width: 16,

      '&.webchat__thumb-button--large': {
        alignItems: 'center',
        border: '1px solid transparent',
        borderRadius: '4px',
        display: 'flex',
        fontSize: '20px',
        height: '20px',
        justifyContent: 'center',
        padding: '5px',
        width: '20px',

        '& .webchat__thumb-button__image': {
          color: 'currentColor'
        },

        '&:hover, &:active, &.webchat__thumb-button--is-pressed': {
          background: 'transparent',
          color: CSSTokens.ColorAccent
        }
      },

      '&:active': {
        background: '#EDEBE9'
      },

      '&:focus-visible': {
        outline: 'solid 1px #605E5C'
      },

      '& .webchat__thumb-button__image': {
        color: CSSTokens.ColorAccent,
        width: '1em',
        height: '1em'
      },

      '&:hover .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled)': {
        display: 'none'
      },

      '&.webchat__thumb-button--is-pressed .webchat__thumb-button__image:not(.webchat__thumb-button__image--is-filled)':
        {
          display: 'none'
        },

      '&.webchat__thumb-button:not(:hover):not(.webchat__thumb-button--is-pressed) .webchat__thumb-button__image--is-filled':
        {
          display: 'none'
        }
    }
  };
}

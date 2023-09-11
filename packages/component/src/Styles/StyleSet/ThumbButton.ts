import CSSTokens from '../CSSTokens';

export default function () {
  return {
    '&.webchat__thumb-button': {
      appearance: 'none',
      background: 'Transparent',
      border: 0,
      borderRadius: 2,
      height: 16,
      /* The Fluent icon is larger than the button. We need to clip it.
      Without clipping, hover effect will appear on the edge of the button but not possible to click. */
      overflow: 'hidden',
      padding: 0,
      width: 16,

      '&:active': {
        background: '#EDEBE9'
      },

      '&:focus': {
        outline: 'solid 1px #605E5C'
      },

      '& .webchat__thumb-button__image': {
        color: CSSTokens.ColorAccent,
        width: 14
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

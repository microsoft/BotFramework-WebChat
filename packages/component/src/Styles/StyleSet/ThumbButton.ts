import CSSTokens from '../CSSTokens';

export default function () {
  return {
    '&.webchat__thumb-button': {
      alignItems: 'center',
      appearance: 'none',
      background: 'transparent',
      border: 0,
      borderRadius: 2,
      boxSizing: 'content-box',
      display: 'grid',
      gridTemplateAreas: `"icon"`,
      height: 16,
      justifyContent: 'center',
      /* The Fluent icon is larger than the button. We need to clip it.
      Without clipping, hover effect will appear on the edge of the button but not possible to click. */
      overflow: ['hidden', 'clip'],
      padding: 0,
      width: 16,

      '&.webchat__thumb-button--large': {
        border: '1px solid transparent',
        borderRadius: '4px',
        height: '20px',
        padding: '5px',
        width: '20px',

        '& .webchat__thumb-button__image': {
          color: 'currentColor',
          fontSize: '20px',
          height: '1em',
          width: '1em'
        },

        '&:hover, &:active, &.webchat__thumb-button--is-pressed': {
          background: 'transparent',
          color: CSSTokens.ColorAccent
        },

        '&[aria-disabled="true"]': {
          color: CSSTokens.ColorSubtle
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
        gridArea: 'icon',
        visibility: 'hidden',
        width: 14,

        '&.webchat__thumb-button__image--is-stroked': {
          visibility: 'visible'
        }
      },

      '&:not([aria-disabled="true"]):hover .webchat__thumb-button__image': {
        '&.webchat__thumb-button__image--is-stroked': {
          visibility: 'hidden'
        },
        '&.webchat__thumb-button__image--is-filled': {
          visibility: 'visible'
        }
      },

      '&.webchat__thumb-button--is-pressed .webchat__thumb-button__image': {
        '&.webchat__thumb-button__image--is-stroked': {
          visibility: 'hidden'
        },
        '&.webchat__thumb-button__image--is-filled': {
          visibility: 'visible'
        }
      }
    }
  };
}

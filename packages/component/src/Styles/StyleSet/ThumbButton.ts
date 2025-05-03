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
        },

        '&.webchat__thumb-button--submitted:not(.webchat__thumb-button--is-pressed) .webchat__tooltip': {
          display: 'none'
        },

        '&.webchat__thumb-button--submitted .webchat__tooltip': {
          '--webchat__tooltip-anchor-inline-start': '20%'
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
          visibility: 'unset'
        }
      },

      '&:not([aria-disabled="true"]):hover, &.webchat__thumb-button--is-pressed': {
        '& .webchat__thumb-button__image': {
          '&.webchat__thumb-button__image--is-stroked': {
            visibility: 'hidden'
          },

          '&.webchat__thumb-button__image--is-filled': {
            visibility: 'unset'
          }
        }
      }
    }
  };
}

import CSSTokens from '../CSSTokens';

export default function () {
  return {
    '&.webchat__thumb-button': {
      alignItems: 'center',
      borderRadius: '2px',
      boxSizing: 'content-box',
      display: 'grid',
      gridTemplateAreas: `"main"`,
      height: '16px',
      width: '16px',

      '& .webchat__thumb-button__input': {
        appearance: 'none',
        background: 'transparent',
        border: 0,
        gridArea: 'main',
        height: '16px',
        margin: 0,
        opacity: 0,
        padding: 0,
        width: '16px',

        '&:active': {
          background: '#EDEBE9'
        }
      },

      '&:has(.webchat__thumb-button__input:focus-visible)': {
        outline: 'solid 1px #605E5C' // <input> has opacity of 0, we need to set the outline in the container.
      },

      '& .webchat__thumb-button__image': {
        color: CSSTokens.ColorAccent,
        gridArea: 'main',
        justifySelf: 'center', // Unsure why "justifyContent" doesn't work.
        pointerEvents: 'none',
        visibility: 'hidden',
        width: 14,

        '&.webchat__thumb-button__image--is-stroked': {
          visibility: 'unset'
        }
      },

      '&:has(.webchat__thumb-button__input:is(:not([aria-disabled="true"]):hover, :checked, [aria-pressed="true"]))': {
        '& .webchat__thumb-button__image': {
          '&.webchat__thumb-button__image--is-stroked': {
            visibility: 'hidden'
          },

          '&.webchat__thumb-button__image--is-filled': {
            visibility: 'unset'
          }
        }
      },

      '&.webchat__thumb-button--large': {
        border: '1px solid transparent',
        borderRadius: '4px',
        height: '30px',
        width: '30px',

        '& .webchat__thumb-button__input': {
          background: 'currentColor',
          height: '30px',
          width: '30px'
        },

        '& .webchat__thumb-button__image': {
          color: 'currentColor',
          fontSize: '20px',
          height: '1em',
          width: '1em'
        },

        '&:has(.webchat__thumb-button__input:is(:hover, :active, :checked, [aria-pressed="true"])) .webchat__thumb-button__image':
          {
            color: CSSTokens.ColorAccent
          },

        '&:has(.webchat__thumb-button__input[aria-disabled="true"]) .webchat__thumb-button__image': {
          color: CSSTokens.ColorSubtle
        },

        '&.webchat__thumb-button--has-submitted:has(.webchat__thumb-button__input:not(:checked):not([aria-pressed="true"])) .webchat__thumb-button__tooltip':
          {
            display: 'none'
          },

        '&.webchat__thumb-button--has-submitted .webchat__thumb-button__tooltip': {
          '--webchat__tooltip-anchor-inline-start': '20%'
        }
      }
    }
  };
}

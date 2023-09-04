import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

// TODO: Fix CSS var.
export default function createLinkDefinitionsStyleSet() {
  return {
    '&.webchat__link-definitions': {
      '&[open] .webchat__link-definitions__header::after': {
        transform: 'rotate(0deg)'
      },

      '.webchat__link-definitions__header': {
        fontFamily: "Calibri, 'Helvetica Neue', Arial, 'sans-serif'",
        fontSize: '80%',
        listStyle: 'none',

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: '#616161'
        }
      },

      '.webchat__link-definitions__header-chevron': {
        height: '1.4em',
        verticalAlign: 'bottom',
        width: '1.4em'
      },

      '&:not([open]) .webchat__link-definitions__header-chevron': {
        marginBottom: '-0.1em',
        transform: 'rotate(180deg)'
      },

      '.webchat__link-definitions__body': {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        margin: '4px 0 0',
        padding: 0
      },

      '.webchat__link-definitions__badge': {
        alignItems: 'center',
        aspectRatio: '1/1',
        borderRadius: '4px',
        borderStyle: 'solid',
        borderWidth: 1,
        display: 'flex',
        flexShrink: 0,
        fontSize: '75%',
        height: '1em',
        justifyContent: 'center',
        margin: 4,
        overflow: 'hidden',
        padding: 2,
        whiteSpace: 'nowrap',

        [NOT_FORCED_COLORS_SELECTOR]: {
          borderColor: '#e0e0e0'
        },

        [FORCED_COLORS_SELECTOR]: {
          borderColor: 'buttonborder'
        }
      },

      '.webchat__link-definitions__item': {
        alignItems: 'center',
        borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 1,
        display: 'flex',
        fontFamily: "Calibri, 'Helvetica Neue', Arial, 'sans-serif'",
        gap: 4,
        listStyleType: 'none',
        overflow: 'hidden',
        padding: 4,

        [NOT_FORCED_COLORS_SELECTOR]: {
          border: '#d1d1d1'
        },

        [FORCED_COLORS_SELECTOR]: {
          borderColor: 'buttonborder'
        }
      },

      '.webchat__link-definitions__item-body--citation': {
        appearance: 'none',
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        overflow: 'hidden',
        padding: 0,
        textDecoration: 'underline',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },

      '.webchat__link-definitions__item-body': {
        [NOT_FORCED_COLORS_SELECTOR]: {
          color: 'var(--webchat__accent-color)'
        }
      }
    }
  };
}

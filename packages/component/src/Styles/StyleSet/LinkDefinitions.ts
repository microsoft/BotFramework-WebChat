import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

// TODO: Temporarily disable dark theme until chat history support dark theme.
const DARK_THEME_SELECTOR = '@media (forced-colors: none) and not (forced-colors: none)'; // Always return false
const LIGHT_THEME_SELECTOR = '@media (forced-colors: none)';

import CSSTokens from '../CSSTokens';

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

        [LIGHT_THEME_SELECTOR]: {
          color: '#616161'
        },

        [DARK_THEME_SELECTOR]: {
          // TODO: Add dark theme color.
          color: '#616161'
        }
      },

      '&:not([open]) .webchat__link-definitions__header-chevron': {
        marginBottom: '-0.1em',
        transform: 'rotate(-180deg)'
      },

      '.webchat__link-definitions__list': {
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        margin: '4px 0 0',
        padding: 0
      },

      '.webchat__link-definitions__list-item': {
        display: 'flex', // This prevents the <button> from overflowing. Unsure why "overflow: hidden" doesn't work.
        flexDirection: 'column'
      },

      '.webchat__link-definitions__badge': {
        alignItems: 'center',
        borderRadius: '4px',
        borderStyle: 'solid',
        borderWidth: 1,
        display: 'flex',
        flexShrink: 0,
        fontSize: '75%',
        justifyContent: 'center',
        margin: 4,
        minWidth: '1em',
        overflow: 'hidden',
        padding: 2,
        whiteSpace: 'nowrap',

        [LIGHT_THEME_SELECTOR]: {
          backgroundColor: 'white',
          borderColor: '#e0e0e0',
          color: 'black'
        },

        [DARK_THEME_SELECTOR]: {
          backgroundColor: 'black',
          // TODO: Add dark theme color.
          borderColor: '#e0e0e0',
          color: 'white'
        },

        [FORCED_COLORS_SELECTOR]: {
          borderColor: 'buttonborder'
        }
      },

      '.webchat__link-definitions__list-item-box': {
        alignItems: 'center',
        borderRadius: 4,
        borderStyle: 'solid',
        borderWidth: 1,

        [LIGHT_THEME_SELECTOR]: {
          backgroundColor: 'white',
          borderColor: '#d1d1d1'
        },

        [DARK_THEME_SELECTOR]: {
          backgroundColor: 'black',
          // TODO: Add dark theme color.
          borderColor: '#d1d1d1'
        },

        [FORCED_COLORS_SELECTOR]: {
          backgroundColor: 'canvas',
          borderColor: 'buttonborder'
        }
      },

      '.webchat__link-definitions__list-item-box--as-link': {
        display: 'block',
        outlineOffset: 0, // This will make sure focus indicator is same as <button>.
        textDecoration: 'none'
      },

      '.webchat__link-definitions__list-item-box--as-button': {
        appearance: 'none',
        background: 'transparent',
        cursor: 'pointer',
        fontFamily: 'inherit',
        fontSize: 'inherit',
        overflow: 'hidden',
        padding: 0
      },

      '.webchat__link-definitions__list-item-body': {
        alignItems: 'center',
        display: 'flex',
        fontFamily: "Calibri, 'Helvetica Neue', Arial, 'sans-serif'",
        gap: 4,
        padding: 4,

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: CSSTokens.ColorAccent
        }
      },

      '.webchat__link-definitions__list-item-text': {
        overflow: 'hidden',
        textDecoration: 'underline',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },

      '.webchat__link-definitions__open-in-new-window-icon': {
        flexShrink: 0, // When text is too long, make sure the chevron is not squeezed.
        paddingRight: 4 // When text is too long and chevron is on far right, this will align the chevron so it's not too far.
      }
    }
  };
}

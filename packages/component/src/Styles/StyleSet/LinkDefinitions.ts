import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

// TODO: Temporarily disable dark theme until chat history support dark theme.
const DARK_THEME_SELECTOR = '@media (forced-colors: none) and not (forced-colors: none)'; // Always return false
const LIGHT_THEME_SELECTOR = '@media (forced-colors: none)';

import CSSTokens from '../CSSTokens';

export default function createLinkDefinitionsStyleSet() {
  return {
    '&.webchat__link-definitions': {
      '.webchat__link-definitions__header': {
        alignItems: 'center',
        cursor: 'default',
        display: 'flex',
        fontFamily: CSSTokens.FontPrimary,
        fontSize: CSSTokens.FontSizeSmall,
        gap: 4,
        justifyContent: 'space-between',
        listStyle: 'none',

        [LIGHT_THEME_SELECTOR]: {
          color: '#616161' // TODO: Should we use subtle color instead?
        },

        [DARK_THEME_SELECTOR]: {
          // TODO: Add dark theme color.
          color: '#616161'
        }
      },

      '.webchat__link-definitions__header-section': {
        alignItems: 'center',
        display: 'flex',
        gap: 4,
        overflow: 'hidden'
      },

      '.webchat__link-definitions__header-section--left': {
        flexShrink: 0
      },

      '.webchat__link-definitions__header-text': {
        flexShrink: 0
      },

      '.webchat__link-definitions__header::-webkit-details-marker': {
        display: 'none'
      },

      '.webchat__link-definitions__header-chevron': {
        flexShrink: 0
      },

      '&:not([open]) .webchat__link-definitions__header-chevron': {
        transform: 'rotate(-180deg)'
      },

      '.webchat__link-definitions__header-accessory': {
        overflow: 'hidden'
      },

      '.webchat__link-definitions__message-sensitivity-label': {
        alignItems: 'center',
        display: 'flex',
        gap: 4
      },

      '.webchat__link-definitions__message-sensitivity-label-icon': {
        color: 'CanvasText',
        flexShrink: 0
      },

      '.webchat__link-definitions__message-sensitivity-label-text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
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
        alignSelf: 'flex-start',
        borderRadius: '4px',
        borderStyle: 'solid',
        borderWidth: 1,
        flexShrink: 0,
        fontSize: '75%',
        margin: 4,
        maxWidth: '4em',
        minWidth: '1em',
        overflow: 'hidden',
        padding: 2,
        textAlign: 'center',
        textOverflow: 'ellipsis',
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
        padding: 0,
        textAlign: 'initial' // By default, texts inside button are centered.
      },

      '.webchat__link-definitions__list-item-body': {
        alignItems: 'center',
        display: 'flex',
        fontFamily: "Calibri, 'Helvetica Neue', Arial, 'sans-serif'",
        gap: 4,
        padding: 4
      },

      '.webchat__link-definitions__list-item-body-main': {
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        overflow: 'hidden'
      },

      '.webchat__link-definitions__list-item-main-text': {
        alignItems: 'baseline',
        display: 'flex',
        gap: 4
      },

      '.webchat__link-definitions__list-item-badge, .webchat__link-definitions__list-item-text': {
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap'
      },

      '.webchat__link-definitions__list-item-text': {
        textDecoration: 'underline',

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: CSSTokens.ColorAccent
        }
      },

      '.webchat__link-definitions__list-item-badge': {
        fontSize: CSSTokens.FontSizeSmall,

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: CSSTokens.ColorSubtle
        }
      },

      '.webchat__link-definitions__open-in-new-window-icon': {
        flexShrink: 0, // When text is too long, make sure the chevron is not squeezed.
        paddingRight: 4, // When text is too long and chevron is on far right, this will align the chevron so it's not too far.

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: CSSTokens.ColorAccent
        }
      }
    }
  };
}

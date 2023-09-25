import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';
import CSSTokens from '../CSSTokens';

// This style is for accompanying result of `renderMarkdown()`.
// Mostly, it should only styles elements that are generated/modified during `renderMarkdown()`.
// For example, "open in new window" icon, which is done by `betterLink`.
export default function createMarkdownStyle() {
  return {
    '&.webchat__render-markdown': {
      '& .webchat__render-markdown__external-link-icon': {
        backgroundImage: CSSTokens.IconURLExternalLink,
        height: '.75em',
        marginLeft: '.25em'
      },

      '& .webchat__render-markdown__citation': {
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        fontFamily: 'unset',
        fontSize: 'unset',
        padding: 0,
        textDecoration: 'underline',
        whiteSpace: 'nowrap',

        [FORCED_COLORS_SELECTOR]: {
          color: 'LinkText'
        },

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: CSSTokens.ColorAccent
        }
      },

      '& .webchat__render-markdown__pure-identifier::after': {
        content: "']'"
      },

      '& .webchat__render-markdown__pure-identifier::before': {
        content: "'['"
      }
    }
  };
}

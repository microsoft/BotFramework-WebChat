import CSSTokens from '../CSSTokens';
import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

// This style is for accompanying result of `renderMarkdown()`.
// Mostly, it should only styles elements that are generated/modified during `renderMarkdown()`.
// For example, "open in new window" icon, which is done by `betterLink`.
export default function createMarkdownStyle() {
  return {
    '&.webchat__render-markdown': {
      display: 'contents',

      // Copied from Adaptive Cards inline styling.
      '&.webchat__render-markdown--adaptive-cards > *:first-child': {
        marginTop: 0,
        width: '100%',
        overflow: 'hidden',
        textOverflow: 'ellipsis'
      },

      // Copied from Adaptive Cards inline styling.
      '&.webchat__render-markdown--adaptive-cards > *:last-child': {
        marginBottom: 0
      },

      '&.webchat__render-markdown--message-activity > *:first-child': {
        marginTop: 0
      },

      '&.webchat__render-markdown--message-activity > *:last-child': {
        marginBottom: 0
      },

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

      '& .webchat__render-markdown__pure-identifier': {
        whiteSpace: 'nowrap'
      },

      '& .webchat__render-markdown__pure-identifier::after': {
        content: "']'"
      },

      '& .webchat__render-markdown__pure-identifier::before': {
        content: "'['"
      },

      '& [data-math-type=block]': {
        alignItems: 'center',
        display: 'flex',
        flexDirection: 'column',
        overflowX: 'auto',
        overflowY: 'clip'
      },

      '& [data-math-type=inline] math': {
        alignItems: 'center',
        display: 'inline-flex',
        flexDirection: 'column'
      },

      '& :is([data-math-type=block], [data-math-type=inline]) > span': {
        display: 'contents'
      },

      '& .webchat__render-markdown__code-block': {
        whiteSpace: 'pre-wrap'
      }
    }
  };
}

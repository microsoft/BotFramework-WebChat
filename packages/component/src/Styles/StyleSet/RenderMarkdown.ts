/* eslint no-magic-numbers: "off" */

import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

// This style is for accompanying result of `renderMarkdown()`.
// Mostly, it should only styles elements that are generated/modified during `renderMarkdown()`.
// For example, "open in new window" icon, which is done by `betterLink`.
export default function createMarkdownStyle() {
  return {
    '&.webchat__render-markdown': {
      '& .webchat__render-markdown__external-link-icon': {
        backgroundImage: 'var(--webchat__external-link-icon-url)',
        height: '.75em',
        marginLeft: '.25em'
      },

      '& .webchat__render-markdown__citation': {
        background: 'transparent',
        border: 0,
        cursor: 'pointer',
        padding: 0,
        textDecoration: 'underline',
        whiteSpace: 'nowrap',

        [FORCED_COLORS_SELECTOR]: {
          color: 'LinkText'
        },

        [NOT_FORCED_COLORS_SELECTOR]: {
          color: 'var(--webchat__accent-color)'
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

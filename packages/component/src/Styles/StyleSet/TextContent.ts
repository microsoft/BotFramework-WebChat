/* eslint no-magic-numbers: "off" */

import { StrictStyleOptions } from 'botframework-webchat-api';
import { FORCED_COLORS_SELECTOR, NOT_FORCED_COLORS_SELECTOR } from './Constants';

export default function createTextContentStyle({
  bubbleMaxWidth,
  bubbleMinHeight,
  markdownExternalLinkIconImage,
  primaryFont,
  paddingRegular
}: StrictStyleOptions) {
  return {
    // TODO: Fix this.
    fontFamily: primaryFont,
    margin: 0,
    minHeight: bubbleMinHeight - paddingRegular * 2,
    padding: paddingRegular,

    '&.webchat__markdown': {
      fontFamily: primaryFont,
      margin: 0,
      minHeight: bubbleMinHeight - paddingRegular * 2,
      padding: paddingRegular,

      '& .webchat__markdown__body > :first-child': {
        marginTop: 0
      },

      '& .webchat__markdown__body > :last-child': {
        marginBottom: 0
      },

      '& .webchat__markdown__body img:not(.webchat__markdown__external-link-icon)': {
        maxWidth: bubbleMaxWidth,
        width: '100%'
      },

      '& .webchat__markdown__body img.webchat__markdown__external-link-icon': {
        backgroundImage: markdownExternalLinkIconImage,
        height: '.75em',
        marginLeft: '.25em'
      },

      '& .webchat__markdown__body pre': {
        overflow: 'hidden'
      },

      '& .webchat__markdown__citation': {
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

      '& .webchat__markdown__pure-identifier::after': {
        content: "']'"
      },

      '& .webchat__markdown__pure-identifier::before': {
        content: "'['"
      }
    }
  };
}

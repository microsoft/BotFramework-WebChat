/* eslint no-magic-numbers: "off" */

import { StyleOptions } from 'botframework-webchat-api';

export default function createTextContentStyle({
  bubbleMaxWidth,
  bubbleMinHeight,
  primaryFont,
  paddingRegular
}: StyleOptions) {
  return {
    fontFamily: primaryFont,
    margin: 0,
    minHeight: bubbleMinHeight - paddingRegular * 2,
    padding: paddingRegular,

    '& > :first-child': {
      marginTop: 0
    },

    '& > :last-child': {
      marginBottom: 0
    },

    '&.markdown': {
      '& img': {
        maxWidth: bubbleMaxWidth,
        width: '100%'
      },

      '& pre': {
        overflow: 'hidden'
      }
    }
  };
}

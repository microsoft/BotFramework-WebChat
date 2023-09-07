import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createCSSVariablesStyle({
  accent,
  bubbleMaxWidth,
  bubbleMinHeight,
  fontSizeSmall,
  markdownExternalLinkIconImage,
  paddingRegular,
  primaryFont,
  subtle,
  timestampColor
}: StrictStyleOptions) {
  return {
    '&.webchat__css-variables': {
      display: 'contents',

      // TODO: This is ongoing work. We are slowly adding CSS variables to ease calculations and stuff.
      //
      //       We need to build a story to let web devs override these CSS variables.
      //
      //       Candy points:
      //       - They should be able to override CSS variables for certain things (say, padding of popover) without affecting much.
      //
      //       House rules:
      //       - We should put styling varibles here, e.g. paddingRegular
      //       - We MUST NOT put runtime variables here, e.g. sendTimeout
      //          - This is because we cannot programmatically know when the sendTimeout change

      // TODO: Rename to `--webchat__color--accent`.
      '--webchat__color--accent': accent,
      '--webchat__color--timestamp': timestampColor || subtle,
      '--webchat__font--primary': primaryFont,
      '--webchat__font-size--small': fontSizeSmall,
      '--webchat__icon-url--external-link': markdownExternalLinkIconImage,
      '--webchat__max-width--bubble': bubbleMaxWidth + 'px',
      '--webchat__min-height--bubble': bubbleMinHeight + 'px',
      '--webchat__padding--regular': paddingRegular + 'px'
    }
  };
}

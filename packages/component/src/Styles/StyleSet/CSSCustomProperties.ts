import { StrictStyleOptions } from 'botframework-webchat-api';

import CustomPropertyNames from '../CustomPropertyNames';

export default function createCSSCustomPropertiesStyle({
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
    '&.webchat__css-custom-properties': {
      display: 'contents',

      // TODO: Should we register the CSS property for inheritance, type checking, and initial value?
      //       Registrations need to be done on global level, and duplicate registration will throw.
      //       https://developer.mozilla.org/en-US/docs/Web/CSS/@property

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
      [CustomPropertyNames.ColorAccent]: accent,
      [CustomPropertyNames.ColorTimestamp]: timestampColor || subtle, // Maybe we should not need this if we allow web devs to override CSS variables for certain components.
      [CustomPropertyNames.FontPrimary]: primaryFont,
      [CustomPropertyNames.FontSizeSmall]: fontSizeSmall,
      [CustomPropertyNames.IconURLExternalLink]: markdownExternalLinkIconImage,
      [CustomPropertyNames.MaxWidthBubble]: bubbleMaxWidth + 'px',
      [CustomPropertyNames.MinHeightBubble]: bubbleMinHeight + 'px',
      [CustomPropertyNames.PaddingRegular]: paddingRegular + 'px'
    }
  };
}

import { StrictStyleOptions } from 'botframework-webchat-api';

export default function ({
  accent,
  backgroundColor,
  paddingRegular,
  primaryFont,
  rootHeight: height,
  rootWidth: width,
  rootZIndex: zIndex
}: StrictStyleOptions) {
  return {
    backgroundColor,
    height,
    width,
    zIndex,

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

    '--webchat__accent-color': accent,
    '--webchat__padding-regular': paddingRegular + 'px',
    '--webchat__primary-font': primaryFont
  };
}

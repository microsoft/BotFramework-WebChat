import { StrictStyleOptions } from 'botframework-webchat-api';

export default function ({
  backgroundColor,
  rootHeight: height,
  rootWidth: width,
  rootZIndex: zIndex
}: StrictStyleOptions) {
  return {
    backgroundColor,
    height,
    width,
    zIndex
  };
}

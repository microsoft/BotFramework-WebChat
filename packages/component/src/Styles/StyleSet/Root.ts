import { StyleOptions } from 'botframework-webchat-api';

export default function ({ backgroundColor, rootHeight: height, rootWidth: width, rootZIndex: zIndex }: StyleOptions) {
  return {
    backgroundColor,
    height,
    width,
    zIndex
  };
}

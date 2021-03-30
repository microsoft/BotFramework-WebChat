import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createVideoContentStyle({ videoHeight }: StrictStyleOptions) {
  return {
    height: videoHeight,
    width: '100%'
  };
}

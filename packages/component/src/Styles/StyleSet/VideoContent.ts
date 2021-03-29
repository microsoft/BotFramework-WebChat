import { StyleOptions } from 'botframework-webchat-api';

export default function createVideoContentStyle({ videoHeight }: StyleOptions) {
  return {
    height: videoHeight,
    width: '100%'
  };
}

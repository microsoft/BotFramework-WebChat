import { StyleOptions } from 'botframework-webchat-api';

export default function createVimeoContentStyle({ videoHeight }: StyleOptions) {
  return {
    border: 0,
    height: videoHeight,
    width: '100%'
  };
}

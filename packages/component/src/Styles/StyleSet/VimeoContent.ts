import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createVimeoContentStyle({ videoHeight }: StrictStyleOptions) {
  return {
    border: 0,
    height: videoHeight,
    width: '100%'
  };
}

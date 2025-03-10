import { StrictStyleOptions } from 'botframework-webchat-api';

export default function createYouTubeContentStyle({ videoHeight }: StrictStyleOptions) {
  return {
    border: 0,
    height: videoHeight,
    width: '100%'
  };
}

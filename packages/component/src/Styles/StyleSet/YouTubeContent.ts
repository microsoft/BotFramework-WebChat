import { StrictStyleOptions } from 'botframework-webchat-api';

/**
 * @deprecated Not used for rendering since 4.19.3, customizing it has no effect.
 * The live styles are in `packages/component/src/Attachment/MediaAttachment.module.css`.
 * This style set will be removed on or after 2028-10-16.
 */
export default function createYouTubeContentStyle({ videoHeight }: StrictStyleOptions) {
  return {
    border: 0,
    height: videoHeight,
    width: '100%'
  };
}

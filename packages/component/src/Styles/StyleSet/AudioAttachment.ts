import { StrictStyleOptions } from 'botframework-webchat-api';

export default function AudioAttachment({ avatarSize }: StrictStyleOptions) {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    minHeight: avatarSize
  };
}

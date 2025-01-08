import CSSTokens from '../CSSTokens';

export default function AudioAttachment() {
  return {
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    minHeight: CSSTokens.SizeAvatar
  };
}

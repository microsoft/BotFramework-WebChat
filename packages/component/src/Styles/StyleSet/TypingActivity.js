export default function createTypingActivityStyle({ avatarSize }) {
  return {
    alignItems: 'center',
    // TODO: [P2] We should not set "display" in styleSet, this will allow the user to break the layout for no good reasons.
    display: 'flex',
    height: avatarSize
  };
}

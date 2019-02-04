export default function createAvatarStyle({
  accent,
  avatarSize,
  primaryFont
}) {
  return {
    alignItems: 'center',
    backgroundColor: accent,
    borderRadius: '50%',
    color: 'White',
    display: 'flex',
    fontFamily: primaryFont,
    height: avatarSize,
    justifyContent: 'center',
    overflow: 'hidden',
    position: 'relative',
    width: avatarSize,

    '& > .image': {
      left: 0,
      position: 'absolute',
      top: 0
    }
  };
}

export default function useAvatarForUser() {
  const [{ userAvatarImage: image, userAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    },
    () => {
      throw new Error('AvatarForUser cannot be set.');
    }
  ];
}

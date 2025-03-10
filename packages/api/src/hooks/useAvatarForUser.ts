import useStyleOptions from './useStyleOptions';

export default function useAvatarForUser(): [{ image: string; initials: string }] {
  const [{ userAvatarImage: image, userAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    }
  ];
}

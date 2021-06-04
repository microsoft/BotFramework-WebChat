import useStyleOptions from './useStyleOptions';

export default function useAvatarForBot(): [{ image: string; initials: string }] {
  const [{ botAvatarImage: image, botAvatarInitials: initials }] = useStyleOptions();

  return [
    {
      image,
      initials
    }
  ];
}
